
pipeline {
    agent any

    options {
        timestamps()
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    parameters {
        choice(
            name: 'ACTION',
            choices: ['DEPLOY', 'ROLLBACK'],
            description: 'Choisir le mode de fonctionnement'
        )

        string(
            name: 'ROLLBACK_VERSION',
            defaultValue: '',
            description: 'Tag Docker à restaurer (exemple : 5)'
        )
    }

    environment {
        DOCKER_IMAGE = 'espoirruragira/hotel-booking-frontend'
        FRONTEND_CONTAINER = 'hotel-booking-frontend'
        TEST_CONTAINER = 'hotel-booking-frontend-test'
        DOCKER_NETWORK = 'hotel-booking-backend_default'
    }

    stages {

        stage('Validation') {
            steps {
                script {
                    if (params.ACTION == 'ROLLBACK') {
                        if (!(params.ROLLBACK_VERSION ==~ /^[A-Za-z0-9_.-]+$/)) {
                            error('Veuillez fournir un tag Docker valide pour le rollback.')
                        }
                    }
                }
            }
        }

        stage('Build et publication Docker Hub') {
            when {
                expression { params.ACTION == 'DEPLOY' }
            }
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKERHUB_USERNAME',
                        passwordVariable: 'DOCKERHUB_PASSWORD'
                    )
                ]) {
                    sh '''
                        set -e

                        echo "Construction de l'image frontend..."

                        docker build \
                            -t ${DOCKER_IMAGE}:${BUILD_NUMBER} .

                        echo "Connexion à Docker Hub..."

                        printf '%s' "$DOCKERHUB_PASSWORD" | \
                            docker login \
                            --username "$DOCKERHUB_USERNAME" \
                            --password-stdin

                        echo "Publication de l'image..."

                        docker push ${DOCKER_IMAGE}:${BUILD_NUMBER}

                        docker logout
                    '''
                }
            }
        }

        stage('Déploiement avec rollback automatique') {
            when {
                expression { params.ACTION == 'DEPLOY' }
            }
            steps {
                script {
                    def previousImage = sh(
                        script: """
                            image=\$(docker inspect --format='{{.Config.Image}}' ${FRONTEND_CONTAINER} 2>/dev/null || true)
                            if [ -z "\$image" ]; then
                                image=\$(docker inspect --format='{{.Config.Image}}' ${TEST_CONTAINER} 2>/dev/null || true)
                            fi
                            printf '%s' "\$image"
                        """,
                        returnStdout: true
                    ).trim()

                    def runFrontend = { String imageRef ->
                        sh """
                            docker rm -f ${FRONTEND_CONTAINER} >/dev/null 2>&1 || true

                            docker run -d \
                                --name ${FRONTEND_CONTAINER} \
                                --network ${DOCKER_NETWORK} \
                                -p 3000:80 \
                                --restart unless-stopped \
                                ${imageRef}
                        """

                        sh """
                            docker run --rm \
                                --network ${DOCKER_NETWORK} \
                                --entrypoint sh \
                                curlimages/curl:latest \
                                -c 'for i in 1 2 3 4 5 6 7 8 9 10 11 12; do
                                    if curl -fsS http://${FRONTEND_CONTAINER}/ >/dev/null &&
                                       curl -fsS http://${FRONTEND_CONTAINER}/api/v1/hotels >/dev/null; then
                                        exit 0
                                    fi
                                    sleep 5
                                done
                                exit 1'
                        """
                    }

                    echo "Suppression du conteneur de test pour libérer le port 3000..."

                    sh "docker rm -f ${TEST_CONTAINER} >/dev/null 2>&1 || true"

                    try {
                        echo "Déploiement de la version ${BUILD_NUMBER}..."

                        runFrontend("${DOCKER_IMAGE}:${BUILD_NUMBER}")

                        echo "Frontend déployé et vérifié avec succès."

                    } catch (err) {
                        echo "ÉCHEC DU DÉPLOIEMENT : ${err}"

                        if (previousImage) {
                            echo "Tentative de restauration de ${previousImage}..."

                            try {
                                runFrontend(previousImage)
                                echo "Rollback automatique effectué avec succès."
                            } catch (rollbackError) {
                                echo "ÉCHEC DU ROLLBACK : ${rollbackError}"
                            }
                        } else {
                            sh "docker rm -f ${FRONTEND_CONTAINER} >/dev/null 2>&1 || true"
                            echo "Aucune ancienne version disponible pour le rollback."
                        }

                        error('Déploiement frontend échoué.')
                    }
                }
            }
        }

        stage('Rollback manuel') {
            when {
                expression { params.ACTION == 'ROLLBACK' }
            }
            steps {
                script {
                    def targetImage = "${DOCKER_IMAGE}:${params.ROLLBACK_VERSION}"

                    withCredentials([
                        usernamePassword(
                            credentialsId: 'dockerhub-creds',
                            usernameVariable: 'DOCKERHUB_USERNAME',
                            passwordVariable: 'DOCKERHUB_PASSWORD'
                        )
                    ]) {
                        sh '''
                            set -e
                            printf '%s' "$DOCKERHUB_PASSWORD" | \
                                docker login \
                                --username "$DOCKERHUB_USERNAME" \
                                --password-stdin
                        '''

                        sh "docker pull ${targetImage}"

                        sh 'docker logout'
                    }

                    def previousImage = sh(
                        script: "docker inspect --format='{{.Config.Image}}' ${FRONTEND_CONTAINER} 2>/dev/null || true",
                        returnStdout: true
                    ).trim()

                    def runFrontend = { String imageRef ->
                        sh """
                            docker rm -f ${FRONTEND_CONTAINER} >/dev/null 2>&1 || true

                            docker run -d \
                                --name ${FRONTEND_CONTAINER} \
                                --network ${DOCKER_NETWORK} \
                                -p 3000:80 \
                                --restart unless-stopped \
                                ${imageRef}
                        """

                        sh """
                            docker run --rm \
                                --network ${DOCKER_NETWORK} \
                                --entrypoint sh \
                                curlimages/curl:latest \
                                -c 'for i in 1 2 3 4 5 6 7 8 9 10 11 12; do
                                    if curl -fsS http://${FRONTEND_CONTAINER}/ >/dev/null &&
                                       curl -fsS http://${FRONTEND_CONTAINER}/api/v1/hotels >/dev/null; then
                                        exit 0
                                    fi
                                    sleep 5
                                done
                                exit 1'
                        """
                    }

                    try {
                        echo "Restauration de ${targetImage}..."

                        runFrontend(targetImage)

                        echo "Rollback manuel effectué avec succès."

                    } catch (err) {
                        echo "ÉCHEC DU ROLLBACK : ${err}"

                        if (previousImage) {
                            echo "Tentative de restauration de ${previousImage}..."

                            try {
                                runFrontend(previousImage)
                                echo "Ancienne version restaurée."
                            } catch (rollbackError) {
                                echo "ÉCHEC DE LA RESTAURATION : ${rollbackError}"
                            }
                        } else {
                            sh "docker rm -f ${FRONTEND_CONTAINER} >/dev/null 2>&1 || true"
                        }

                        error('Rollback manuel échoué.')
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline frontend terminé avec succès.'
        }

        failure {
            echo 'Pipeline frontend terminé avec une erreur.'
        }

        always {
            echo 'Fin du pipeline frontend.'
        }
    }
}
