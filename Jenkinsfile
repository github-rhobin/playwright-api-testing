pipeline {
    agent any

    tools {
        nodejs 'NodeJS_LTS_24.16.0'
        allure 'Allure_CMD_2.40.0'
    }

    stages {
        stage('Prepare .env') {
            environment {
                SECRETS_ENV = credentials('playwright-api-testing-secrets')
            }
            steps {
                bat '''
                    if exist .env del .env
                    copy "%SECRETS_ENV%" .env
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'call npm ci --no-audit --no-fund'
            }
        }

        stage('Install Chromium') {
            steps {
                bat 'call npx playwright install chromium'
            }
        }

        stage('Run Tests') {
            steps {
                bat 'call npx playwright test'
            }
        }
    }

    post {
        always {
            bat 'if exist .env del .env'

            junit 'test-results/junit-results.xml'

            publishHTML(target: [
                allowMissing: false,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright HTML Report'
            ])

            allure([
                includeProperties: false,
                jdk: '',
                properties: [],
                reportBuildPolicy: 'ALWAYS',
                results: [[path: 'allure-results']]
            ])
        }
    }
}
