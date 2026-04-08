from .db_services import get_collection

def get_latest_metrics():
    col = get_collection("metrics")
    raw_data = col.find_one({}, {"_id": 0}) 
    
    if not raw_data or "data" not in raw_data:
        return {"cpu_history": [], "mem_history": [], "pods": []}

    results = raw_data["data"]["result"]
    
    cpu_history = []
    mem_history = []
    pods_map = {}

    for series in results:
        metric_info = series.get("metric", {})
        m_name = metric_info.get("__name__", "")
        level = metric_info.get("level", "pod") # Default to pod if missing
        values = series.get("values", [])
        
        if not values:
            continue

        # 1. PROCESS CLUSTER LEVEL (For Charts and Top Stats)
        if level == "cluster":
            history_list = []
            for v in values:
                history_list.append({"time": v[0], "value": float(v[1])})
            
            if "cpu" in m_name:
                cpu_history = history_list
            elif "memory" in m_name:
                mem_history = history_list

        # 2. PROCESS POD LEVEL (For the Table)
        else:
            p_name = metric_info.get("pod_name", "unknown")
            status = metric_info.get("status", "Running")
            latest_val = float(values[-1][1])

            if p_name not in pods_map:
                pods_map[p_name] = {
                    "pod_name": p_name,
                    "cpu": 0,
                    "memory": 0,
                    "status": status
                }
            
            if "cpu" in m_name:
                pods_map[p_name]["cpu"] = latest_val
            elif "memory" in m_name:
                pods_map[p_name]["memory"] = latest_val

    return {
        "cpu_history": sorted(cpu_history, key=lambda x: x["time"]),
        "mem_history": sorted(mem_history, key=lambda x: x["time"]),
        "pods": list(pods_map.values())
    }