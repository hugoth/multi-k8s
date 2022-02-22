# when test ran successfully we build the prod image for each services
# We need to specify / tag a docker image version because if no changes detected => deployments (k8s service) will not fetch the changes in the docker hub
# We can add the git SHA as unique identifier for our new images 
# We also add the latest tag to the new image, so in the future we don't have to know the sha to run those images
docker build -t hugotess/multi-frontend:latest -t hugotess/multi-frontend:$SHA -f ./frontend/Dockerfile ./frontend 
docker build -t hugotess/multi-server:latest -t hugotess/multi-server:$SHA -f ./server/Dockerfile ./server
docker build -t hugotess/multi-worker:latest -t hugotess/multi-worker:$SHA -f ./worker/Dockerfile ./worker
# then we pushed those new image to docker hub
docker push hugotess/multi-frontend:latest
docker push hugotess/multi-frontend:$SHA 

docker push hugotess/multi-server:latest
docker push hugotess/multi-server:$SHA 

docker push hugotess/multi-worker:latest
docker push hugotess/multi-worker:$SHA 

# then we apply the new images inside k8s cluster 
kubectl apply -f k8s 

# imperative commands to change the image in deployment service config file 
kubectl set image deployments/frontend-deployment frontend=hugotess/multi-frontend:$SHA
kubectl set image deployments/server-deployment server=hugotess/multi-server:$SHA
kubectl set image deployments/worker-deployment worker=hugotess/multi-worker:$SHA
