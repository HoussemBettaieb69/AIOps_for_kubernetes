import requests
import time
from .db_services import get_collection

PROMETHEUS_URL = "http://localhost:9090/api/v1/query"
TWO_DAYS_IN_SECONDS = 172800 
CHART_LIMIT = 60 

def get_cluster_resources():
    """Dynamically detects total CPU cores and RAM capacity from the cluster."""
    resources = {"cores": 1, "memory_mb": 4096}
    try:
        # 1. Get Total CPU Cores
        cpu_res = requests.get(PROMETHEUS_URL, params={'query': 'count(node_cpu_seconds_total{mode="idle"})'}).json()
        if cpu_res.get('data', {}).get('result'):
            resources["cores"] = int(cpu_res['data']['result'][0]['value'][1])

        # 2. Get Total RAM
        mem_res = requests.get(PROMETHEUS_URL, params={'query': 'node_memory_MemTotal_bytes'}).json()
        if mem_res.get('data', {}).get('result'):
            resources["memory_mb"] = float(mem_res['data']['result'][0]['value'][1]) / (1024 * 1024)
    except Exception as e:
        print(f"Warning: Resource detection failed, using fallbacks. Error: {e}")
    return resources

def fetch_and_save_real_metrics():
    """Fetches metrics from Prometheus, normalizes them, and saves to MongoDB."""
    col = get_collection("metrics")
    limits = get_cluster_resources()
    
    try:
        # Fetch CPU and Memory raw data
        cpu_req = requests.get(PROMETHEUS_URL, params={'query': 'sum(rate(container_cpu_usage_seconds_total[2m])) by (pod)'}).json()
        mem_req = requests.get(PROMETHEUS_URL, params={'query': 'sum(container_memory_usage_bytes) by (pod)'}).json()
        
        now = time.time()
        formatted_results = []

        # 1. Process CPU Metrics
        for item in cpu_req.get('data', {}).get('result', []):
            pod_name = item['metric'].get('pod', 'unknown')
            if pod_name == "unknown":
                continue
            
            cores_used = float(item['value'][1])
            # Normalize usage based on detected core count
            cpu_percent = (cores_used / limits["cores"]) * 100
            
            formatted_results.append({
                "metric": {"pod_name": pod_name, "__name__": "pod_cpu_usage", "level": "pod"},
                "values": [[now, round(cpu_percent, 2)]]
            })

        # 2. Process Memory Metrics
        for item in mem_req.get('data', {}).get('result', []):
            pod_name = item['metric'].get('pod', 'unknown')
            if pod_name == "unknown":
                continue
            
            val_mb = float(item['value'][1]) / (1024 * 1024)
            # Normalize usage based on detected RAM limit
            mem_percent = (val_mb / limits["memory_mb"]) * 100
            
            formatted_results.append({
                "metric": {"pod_name": pod_name, "__name__": "pod_memory_usage", "level": "pod"},
                "values": [[now, round(mem_percent, 2)]]
            })

        # 3. Database Maintenance (Purge older than 2 days)
        cutoff_time = now - TWO_DAYS_IN_SECONDS
        col.delete_many({"timestamp": {"$lt": cutoff_time}})

        # 4. Save the New Snapshot
        if formatted_results:
            new_entry = {
                "timestamp": now,
                "data": {"result": formatted_results}
            }
            col.insert_one(new_entry)
        
        print(f"--- Sync Success at {time.strftime('%H:%M:%S')} ---")
        print(f"Detected: {limits['cores']} Cores | {round(limits['memory_mb']/1024, 2)}GB RAM")
        print(f"DB Snapshots: {col.count_documents({})}")
        print("-" * 30)

    except Exception as e:
        print(f"Collector Error: {str(e)}")

def get_latest_metrics():
    """Retrieves history and current status for the API/Frontend."""
    col = get_collection("metrics")
    
    # Get last 60 snapshots (approx 30 mins of history if syncing every 30s)
    cursor = col.find({}, {"_id": 0}).sort("timestamp", -1).limit(CHART_LIMIT)
    all_docs = list(cursor)

    if not all_docs:
        return {"cpu_history": [], "mem_history": [], "pods": []}

    # latest_doc is the most recent snapshot for the Table view
    latest_doc = all_docs[0]
    
    cpu_history = []
    mem_history = []

    # Build history arrays for the React Charts (Reverse to keep chronological order)
    for doc in reversed(all_docs):
        cpu_sum = 0
        mem_sum = 0
        doc_time = doc.get("timestamp", time.time())
        
        for series in doc.get("data", {}).get("result", []):
            val = series["values"][0][1]
            m_name = series["metric"].get("__name__", "")
            
            if m_name == "pod_cpu_usage":
                cpu_sum += val
            elif m_name == "pod_memory_usage":
                mem_sum += val
        
        cpu_history.append({"time": doc_time, "value": round(cpu_sum, 2)})
        mem_history.append({"time": doc_time, "value": round(mem_sum, 2)})

    # Current Pod data for the table
    pods_map = {}
    for series in latest_doc.get("data", {}).get("result", []):
        metric_info = series.get("metric", {})
        m_name = metric_info.get("__name__", "")
        p_name = metric_info.get("pod_name", "unknown")
        val = series["values"][0][1]

        if p_name not in pods_map:
            pods_map[p_name] = {"pod_name": p_name, "cpu": 0, "memory": 0, "status": "Running"}
        
        if "cpu" in m_name:
            pods_map[p_name]["cpu"] = val
        else:
            pods_map[p_name]["memory"] = val

    return {
        "cpu_history": cpu_history, 
        "mem_history": mem_history, 
        "pods": list(pods_map.values())
    }