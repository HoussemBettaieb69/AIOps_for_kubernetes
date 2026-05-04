import json
import re
from datetime import datetime, timedelta
from .db_services import get_collection
from .ai_services import classify_alert, analyze_incident, analyze_prediction, validate_classification, extract_k8s_context, generate_fingerprint


def extract_json(text):
    import json
    import re

    try:
        # First try direct parse
        return json.loads(text)
    except:
        pass

    # Try to extract JSON block
    match = re.search(r"\{[\s\S]*?\}", text)
    if match:
        try:
            return json.loads(match.group())
        except:
            return None

    return None

def run_background_analysis():
    # 1. Define the collections
    metrics_col = get_collection("metrics")
    logs_col = get_collection("logs")
    incidents_col = get_collection("incidents")
    predictions_col = get_collection("predictions")
    
    

    # 2. Gather context
    metrics = list(metrics_col.find({}, { "_id": 0 }).sort("timestamp", -1).limit(10))
    logs = list(logs_col.find({}, { "_id": 0 }).sort("timestamp", -1).limit(20))
    
    if not metrics:
        print(" No metrics found to analyze.")
        return
    
    # 🔹 Time formatting
    now = datetime.utcnow()
    timestamp_str = now.strftime("%Y%m%d%H%M%S")
    current_iso = now.isoformat()

    try:
        # =========================
        # 1. CLASSIFICATION
        # =========================
        raw_class = classify_alert(metrics, logs)
        print("RAW CLASSIFIER OUTPUT:", raw_class)
        classification = extract_json(raw_class)
        alert_type = validate_classification(classification)
        context = extract_k8s_context(logs)
        fingerprint = generate_fingerprint(metrics, logs, alert_type)


        if not alert_type:
            print("⚠️ Invalid classification → using fallback")

            logs_str = str(logs).lower()

            if any(word in logs_str for word in ["error", "failed", "exception"]):
                alert_type = "incident"
            else:
                alert_type = "prediction"

        if not classification:
            logs_str = str(logs).lower()

            if any(word in logs_str for word in ["error", "failed", "exception"]):
                alert_type = "incident"
            else:
                alert_type = "prediction"

        # =========================
        # 2. ANALYSIS
        # =========================
        if alert_type == "incident":
            raw_analysis = analyze_incident(metrics, logs)
        else:
            raw_analysis = analyze_prediction(metrics, logs)

        ai_data = extract_json(raw_analysis)

        if not ai_data:
            raise ValueError("Invalid analysis JSON")

        # =========================
        # 3. PERFECT JSON (YOUR FORMAT)
        # =========================
        perfect_json = {
            "id": f"AI-{alert_type.upper()[:4]}-{timestamp_str}",
            "fingerprint": fingerprint,
            "title": ai_data.get("title", f"Anomalous activity in {alert_type}"),
            "type": alert_type,
            "severity": ai_data.get("severity", "medium").lower(),
            "status": "open",
            "timestamp": current_iso,
            "service": context["service"],
            "pod": context["pod"],
            "confidence": ai_data.get("confidence", 80),
            "summary": ai_data.get(
                "summary",
                ai_data.get("root_cause", ai_data.get("reason", "Analysis in progress..."))
            ),
            "suggestion": ai_data.get(
                "suggestion",
                ai_data.get("solution", ai_data.get("prevention", "Check Kubernetes logs."))
            ),
            "metrics": metrics if isinstance(metrics, list) else [],
            "logs": logs if isinstance(logs, list) else []
        }

        # =========================
        # 4. SAVE TO MONGODB
        # =========================
        existing = incidents_col.find_one({"fingerprint": fingerprint})

        if existing:
            incidents_col.update_one(
            {"_id": existing["_id"]},
            {
                "$set": {
                    "timestamp": current_iso,
                    "metrics": metrics,
                    "logs": logs,
                    "summary": ai_data.get("summary")
                }
            }
            )
            print("♻️ Incident updated instead of duplicated")
            return existing
        
        if alert_type == "incident":
            result = incidents_col.insert_one(perfect_json)
            print(f"🚨 Incident saved: {result.inserted_id}")

        else:
            result = predictions_col.insert_one(perfect_json)
            print(f"⚠️ Prediction saved: {result.inserted_id}")

        return perfect_json

    except Exception as e:
        print(f"CRITICAL ERROR in AI Generation: {e}")

        # =========================
        # FALLBACK OBJECT
        # =========================
        fallback = {
            "id": f"ERR-{timestamp_str}",
            "title": "Failed to Generate Analysis",
            "type": "incident",  # safe default
            "severity": "high",
            "status": "error",
            "timestamp": current_iso,
            "summary": "The AI model returned an invalid response.",
            "suggestion": "Please check backend logs or try again.",
            "metrics": [],
            "logs": []
        }

        # Optional: store fallback too (good for debugging)
        incidents_col.insert_one(fallback)

        return fallback