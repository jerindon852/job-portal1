pipeline {
    agent any

    stages {

        stage('Build') {
            steps {
                sh 'npm install'
            }
        }

        stage('Docker Build') {
            steps {
                sh 'docker build -t job-portal-backend ./backend'
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    docker rm -f job-portal-backend || true
                    docker run -d --name job-portal-backend -p 5000:5000 job-portal-backend
                '''
            }
        }

        stage('Test API') {
            steps {
                sh 'sleep 5'
                sh 'curl -f http://localhost:5000/api/jobs'
            }
        }
    }
}
