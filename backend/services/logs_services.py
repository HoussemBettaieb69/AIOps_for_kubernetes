import time
from datetime import datetime
from .db_services import get_collection

CHART_LIMIT = 60
TWO_DAYS_IN_SECONDS = 172800


def format_log_entry(raw_log):
    if not isinstance(raw_log, dict):
        return {
            "timestamp": time.time(),
            "level": "UNKNOWN",
            "message": str(raw_log),
            "source": "unknown",
            "raw": raw_log
        }

    return {
        "timestamp": raw_log.get("timestamp", time.time()),
        "level": raw_log.get("level", "INFO"),
        "message": raw_log.get("log", raw_log.get("message", "")),
        "source": raw_log.get("kubernetes", {}).get("pod_name", "unknown"),
        "raw": raw_log
    }

def insert_log(log_data: dict):
    """
    Insert a single log from Fluent Bit (normalized)
    """
    col = get_collection("logs")

    try:
        formatted = format_log_entry(log_data)
        col.insert_one(formatted)

        return {
            "status": "success",
            "timestamp": formatted["timestamp"]
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }


def insert_batch_logs(logs: list):
    """
    Fluent Bit may send batches → handle multiple logs
    """
    col = get_collection("logs")

    try:
        formatted_logs = [format_log_entry(log) for log in logs]

        if formatted_logs:
            col.insert_many(formatted_logs)

        return {
            "status": "success",
            "inserted": len(formatted_logs)
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }


def cleanup_old_logs():
    """
    Delete logs older than 2 days (same pattern as metrics)
    """
    col = get_collection("logs")

    now = time.time()
    cutoff = now - TWO_DAYS_IN_SECONDS

    col.delete_many({"timestamp": {"$lt": cutoff}})


def get_latest_logs():
    """
    Returns structured logs for frontend (readable format + history)
    """
    col = get_collection("logs")

    cursor = col.find({}, {"_id": 0}).sort("timestamp", -1).limit(CHART_LIMIT)
    logs = list(cursor)

    if not logs:
        return {
            "logs": [],
            "levels": {"INFO": 0, "WARNING": 0, "ERROR": 0}
        }

    formatted_logs = []
    level_counter = {"INFO": 0, "WARNING": 0, "ERROR": 0}

    for log in reversed(logs):  # chronological order
        level = log.get("level", "INFO").upper()

        if level in level_counter:
            level_counter[level] += 1

        formatted_logs.append({
            "time": log.get("timestamp"),
            "level": level,
            "message": log.get("message"),
            "source": log.get("source")
        })

    return {
        "logs": formatted_logs,
        "levels": level_counter
    }