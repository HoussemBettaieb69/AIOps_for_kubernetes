## To run frontend
cd frontend
npm install
npm run dev

## To run backend
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

## To run minikube + forwarding port
minikube start 
minikube kubectl port-forward deployment/prometheus-server 9090:9090

## Don't forget to run collector.py