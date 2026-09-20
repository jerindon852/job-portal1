pipeline {
    agent any

    stages {

        stage('Build') {
            steps {
                sh '''
                    npm install
                '''
            }
        }

        stage('Docker Build') {
            steps {
                sh '''
                    docker build -t job-portal-backend:latest ./backend
                '''
            }
        }

        stage('Load Image to Minikube') {
            steps {
                sh '''
                    minikube image load job-portal-backend:latest
                '''
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh '''
                    kubectl apply -f k8s/backend-deployment.yaml
                    kubectl apply -f k8s/backend-service.yaml

                    kubectl rollout restart deployment/job-portal-backend
                    kubectl rollout status deployment/job-portal-backend
                '''
            }
        }

        stage('Verify Kubernetes') {
            steps {
                sh '''
                    kubectl get pods
                    kubectl get deployment
                    kubectl get service
                '''
            }
        }

        stage('Test Kubernetes API') {
            steps {
                sh '''
                    sleep 5

                    POD=$(kubectl get pods \
                        -l app=job-portal-backend \
                        -o jsonpath="{.items[0].metadata.name}")

                    echo "Testing Pod: $POD"

                    kubectl exec "$POD" -- \
                        wget -qO- http://localhost:5000/api/jobs
                '''
            }
        }
    }

    post {
        success {
            echo '========================================='
            echo ' CI/CD PIPELINE SUCCESSFUL'
            echo ' Application deployed to Kubernetes'
            echo '========================================='
        }

        failure {
            echo '========================================='
            echo ' CI/CD PIPELINE FAILED'
            echo ' Check the Jenkins console output'
            echo '========================================='
        }
    }
}
