import time
import sys
import os

# Ensure backend path is visible
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.metrics_services import fetch_and_save_real_metrics
from services.logs_services import cleanup_old_logs
# --- NEW: Import the AI Logic ---
from services.analyzer import run_background_analysis 

if __name__ == "__main__" :
    print(" Starting AIOps Real-Time Collector with AI Analysis...")

    last_log_cleanup = time.time()

    while True:
        try:
            # 1. Collect raw metrics from Minikube
            fetch_and_save_real_metrics()
            print(" Metrics synced.")

            # 2. TRIGGER THE AI ANALYSIS
            # This looks at the metrics we just saved and updates the 
            # Incidents, Predictions, and Solutions in MongoDB.
            run_background_analysis()
            print("AI analysis complete. Suggestions updated.")

            now = time.time()

            # 3. Standard Cleanup
            if now - last_log_cleanup >= 300 :
                cleanup_old_logs()
                print(" Old logs cleaned")
                last_log_cleanup = now

        except Exception as e:
            print(f" Collector Error: {str(e)}")

        # Wait 30 seconds before the next "thought" cycle
        time.sleep(30)