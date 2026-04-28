import ollama
import json
from datetime import datetime

def analyze_with_llm(metrics, logs, alert_type="incident"):
    """
    metrics: List of metric objects from your collector
    logs: List of log objects from your collector
    alert_type: "incident" or "prediction"
    """
    
    timestamp_str = datetime.now().strftime("%Y%m%dT%H%M%S")
    current_iso = datetime.now().isoformat() + "Z"

    # 1. THE PROMPT: We only ask the AI for the 'Creative' fields
    prompt = f"""
    [SYSTEM]
    You are a K8s AIOps expert. Analyze the provided data and return ONLY a JSON object.
    
    [SCHEMA]
    {{
      "title": "Clear title of the issue",
      "severity": "high, medium, or low",
      "service": "affected-service-name",
      "pod": "affected-pod-name",
      "confidence": 85,
      "summary": "Detailed technical analysis of what happened",
      "suggestion": "Step-by-step fix"
    }}
    
    [DATA]
    Metrics: {json.dumps(metrics[:5])}
    Logs: {json.dumps(logs[:5])}
    
    Return ONLY JSON.
    """
    
    try:
        response = ollama.chat(
            model='batiai/gemma4-e2b:q4', 
            messages=[{'role': 'user', 'content': prompt}]
        )
        content = response['message']['content']
        
        # Extract JSON safely
        start = content.find('{')
        end = content.rfind('}') + 1
        ai_data = json.loads(content[start:end])
        
        # 2. THE ENFORCEMENT: We map AI data into your EXACT MongoDB structure.
        # This prevents white screens because every field React needs is guaranteed to exist.
        perfect_json = {
            "id": f"AI-{alert_type.upper()[:4]}-{timestamp_str}",
            "title": ai_data.get("title", f"Anomalous activity in {alert_type}"),
            "type": alert_type,
            "severity": ai_data.get("severity", "medium").lower(),
            "status": "open",
            "timestamp": current_iso,
            "service": ai_data.get("service", "unknown-service"),
            "pod": ai_data.get("pod", "unknown-pod"),
            "confidence": ai_data.get("confidence", 80),
            "summary": ai_data.get("summary", "Analysis in progress..."),
            "suggestion": ai_data.get("suggestion", "Check Kubernetes logs for more details."),
            # We inject the metrics/logs directly from the source, NOT from the AI's answer.
            # This ensures they are perfectly formatted arrays.
            "metrics": metrics if isinstance(metrics, list) else [],
            "logs": logs if isinstance(logs, list) else []
        }

        # If it's a prediction, we can add the extra field you use
        if alert_type == "prediction":
            perfect_json["predicted_time"] = ai_data.get("predicted_time", current_iso)

        return perfect_json

    except Exception as e:
        print(f"CRITICAL ERROR in AI Generation: {e}")
        # FALLBACK: Return a valid object so the frontend still renders safely.
        return {
            "id": f"ERR-{timestamp_str}",
            "title": "Failed to Generate Analysis",
            "type": alert_type,
            "severity": "high",
            "status": "error",
            "timestamp": current_iso,
            "summary": "The AI model returned an invalid response.",
            "suggestion": "Please check backend logs or try again.",
            "metrics": [],
            "logs": []
        }

# Example of how you would call this in your route:
# result = analyze_with_llm(raw_metrics, raw_logs, "prediction")
# db.incidents.insert_one(result)