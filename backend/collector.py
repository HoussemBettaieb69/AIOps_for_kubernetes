import time
import sys
import os

# Ensure backend path is visible
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.metrics_services import fetch_and_save_real_metrics
from services.logs_services import cleanup_old_logs


if __name__ == "__main__":

    print("🚀 Starting AIOps Real-Time Collector...")

    last_log_cleanup = time.time()

    while True:
        try:
            fetch_and_save_real_metrics()
            now = time.time()

            if now - last_log_cleanup >= 300 :
                cleanup_old_logs()
                print("🧹 Old logs cleaned")
                last_log_cleanup = now

        except Exception as e:
            print(f"Collector Error: {str(e)}")

        time.sleep(30)
