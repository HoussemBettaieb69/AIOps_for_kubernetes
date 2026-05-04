import ollama
import json
import hashlib
from datetime import datetime

def classify_alert(metrics, logs):

    prompt = f"""
You are a strict JSON generator.

Return ONLY ONE of these EXACT outputs:

{{"type":"incident"}}
OR
{{"type":"prediction"}}

Rules:
- No additional fields
- No explanations
- No metrics
- No logs
- No extra text
- Output must be EXACTLY one JSON object

Now classify:

Metrics: {metrics}
Logs: {logs}
"""



    response = ollama.chat(
        model="batiai/gemma4-e2b:q4",
        messages=[{"role": "user", "content": prompt}],
        options={"temperature": 0}
    )

    return response["message"]["content"]


def validate_classification(data):
    if not isinstance(data, dict):
        return None

    t = data.get("type")

    if t in ["incident", "prediction"]:
        return t

    return None


def analyze_incident(metrics, logs):

    prompt = f"""
You are an AIOps incident analysis expert.

Analyze the CURRENT issue.

Metrics:
{metrics}

Logs:
{logs}

Your task:
1. Identify root cause
2. Explain impact
3. Assign severity (LOW, MEDIUM, HIGH, CRITICAL)
4. Suggest immediate fix

Output ONLY JSON:
{{
  "type": "incident",
  "root_cause": "...",
  "impact": "...",
  "severity": "...",
  "solution": "..."
}}
"""

    response = ollama.chat(
        model="batiai/gemma4-e2b:q4",
        messages=[{"role": "user", "content": prompt}],
        options={"temperature": 0.2}
    )

    return response["message"]["content"]


def analyze_prediction(metrics, logs):
    import ollama

    prompt = f"""
You are an AIOps predictive analysis expert.

Analyze potential FUTURE risks.

Metrics:
{metrics}

Logs:
{logs}

Your task:
1. Identify risk pattern
2. Explain why it may become a problem
3. Assign risk level (LOW, MEDIUM, HIGH)
4. Suggest preventive action

Output ONLY JSON:
{{
  "type": "prediction",
  "risk": "...",
  "reason": "...",
  "severity": "...",
  "prevention": "..."
}}
"""

    response = ollama.chat(
        model="batiai/gemma4-e2b:q4",
        messages=[{"role": "user", "content": prompt}],
        options={"temperature": 0.2}
    )

    return response["message"]["content"]

def extract_k8s_context(logs):
    service = None
    pod = None
    namespace = None

    for log in logs:
        if not isinstance(log, dict):
            continue

        # 🔹 Kubernetes block (your real structure)
        k8s = log.get("kubernetes", {})

        if isinstance(k8s, dict):
            pod = pod or k8s.get("pod_name")
            namespace = namespace or k8s.get("namespace_name")

            # try to infer service from labels
            labels = k8s.get("labels", {})
            if isinstance(labels, dict):
                service = service or labels.get("app.kubernetes.io/name")

        # 🔹 fallback from top-level
        service = service or log.get("service")
        pod = pod or log.get("pod")

    return {
        "service": service or "unknown-service",
        "pod": pod or "unknown-pod",
        "namespace": namespace or "default"
    }

def generate_fingerprint(metrics, logs, alert_type):
    key = {
        "type": alert_type,
        "metrics": metrics[-3:],  # reduce noise
        "logs": logs[-5:]
    }

    raw = json.dumps(key, sort_keys=True).encode()
    return hashlib.sha256(raw).hexdigest()