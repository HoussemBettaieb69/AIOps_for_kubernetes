from .db_services import get_collection
from .ai_services import analyze_with_llm

def run_background_analysis():
    # 1. Define the collections
    metrics_col = get_collection("metrics")
    logs_col = get_collection("logs")

    # 2. Gather context
    metrics = list(metrics_col.find({}, { "_id": 0 }).sort("timestamp", -1).limit(10))
    logs = list(logs_col.find({}, { "_id": 0 }).sort("timestamp", -1).limit(10))
    
    if not metrics:
        print(" No metrics found to analyze.")
        return

    # 3. Ask the AI to find patterns
    print(" Gemma 4 is analyzing cluster health...")
    result = analyze_with_llm(metrics, logs)

    # 4. Save the findings
    if not result:
        print(" AI returned no data.")
        return

    # Normalize the result: ensure we are working with a list even if a single object was returned
    # This handles the new "Perfect JSON" structure
    if isinstance(result, dict) and "id" in result:
        findings_list = [result]
    else:
        # Fallback for old list structure or empty results
        findings_list = result.get('incidents', []) + result.get('predictions', [])

    for item in findings_list:
        # Determine collection based on the 'type' field we injected in Python
        coll_type = "incident" if item.get("type") == "incident" else "prediction"
        
        get_collection(coll_type).update_one(
            {"id": item.get("id")}, 
            {"$set": item}, 
            upsert=True
        )
        print(f" Saved {coll_type}: {item.get('id')}")
    
    print(" AI analysis complete. Suggestions updated.")