pipeline {
    agent any

    environment {
        IMAGE_NAME = 'job-portal-backend'
        IMAGE_TAG = "${GIT_COMMIT[0..6]}"
        IMAGE = "${IMAGE_NAME}:${IMAGE_TAG}"
    }

    stages {

        stage('Build') {
            steps {
                sh '''
                    echo "Installing dependencies..."
                    npm install
                '''
            }
        }

        stage('Docker Build') {
            steps {
                sh '''
                    echo "Building Docker image: ${IMAGE}"

                    docker build -t ${IMAGE} ./backend

                    echo "Docker image created successfully"
                    docker images | grep ${IMAGE_NAME}
                '''
            }
        }

        stage('Load Image to Minikube') {
            steps {
                sh '''
                    echo "Loading image into Minikube..."

                    minikube image load ${IMAGE}

                    echo "Image loaded successfully"
                '''
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh '''
                    echo "Deploying application to Kubernetes..."

                    kubectl apply -f k8s/backend-deployment.yaml
                    kubectl apply -f k8s/backend-service.yaml

                    echo "Updating Kubernetes image..."

                    kubectl set image deployment/job-portal-backend \
                        backend=${IMAGE}

                    echo "Waiting for rollout..."

                    kubectl rollout status deployment/job-portal-backend
                '''
            }
        }

        stage('Verify Kubernetes') {
            steps {
                sh '''
                    echo "===== PODS ====="
                    kubectl get pods -o wide

                    echo "===== DEPLOYMENT ====="
                    kubectl get deployment job-portal-backend

                    echo "===== SERVICE ====="
                    kubectl get service job-portal-backend-service

                    echo "===== RUNNING IMAGE ====="
                    kubectl get deployment job-portal-backend \
                        -o jsonpath="{.spec.template.spec.containers[0].image}"

                    echo ""
                '''
            }
        }

        stage('Test Kubernetes API') {
            steps {
                sh '''
                    echo "Testing API..."

                    sleep 5

                    POD=$(kubectl get pods \
                        -l app=job-portal-backend \
                        -o jsonpath="{.items[0].metadata.name}")

                    echo "Testing Pod: ${POD}"

                    kubectl exec "${POD}" -- \
                        wget -qO- http://localhost:5000/api/jobs

                    echo ""
                    echo "API test successful"
                '''
            }
        }
    }

    post {

        success {
            echo '''
=========================================
 CI/CD PIPELINE SUCCESSFUL
=========================================
 Docker image versioned using Git commit
 Kubernetes deployment successful
 API test successful
=========================================
'''
        }

        failure {
            echo '''
=========================================
 CI/CD PIPELINE FAILED
=========================================
 Check Jenkins Console Output
=========================================
'''
        }
    }
}
