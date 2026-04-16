import time
import sys
import os

# Ensure the script can see the 'services' folder
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.services.metrics_services import fetch_and_save_real_metrics

if __name__ == "__main__":
    print("Starting the AIOps Real-Time Collector...")
    while True:
        fetch_and_save_real_metrics()
        time.sleep(30) # Refresh every 30 seconds