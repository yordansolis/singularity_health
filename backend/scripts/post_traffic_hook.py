#!/usr/bin/env python
"""
Hook que se ejecuta después de dirigir tráfico a la nueva versión de la Lambda.
Verifica que la función siga respondiendo correctamente y registra métricas de despliegue.
"""
import boto3
import json
import time
import os
import logging
import urllib.request
from datetime import datetime

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Inicializar clientes de AWS
codedeploy = boto3.client('codedeploy')
cloudwatch = boto3.client('cloudwatch')

def lambda_handler(event, context):
    """
    Función principal del hook de post-tráfico
    """
    logger.info("Post-traffic hook iniciado")
    logger.info(json.dumps(event))
    
    # Obtener información del despliegue
    deployment_id = event['DeploymentId']
    lifecycle_event_hook_execution_id = event['LifecycleEventHookExecutionId']
    
    # Obtener la versión de lambda que fue desplegada
    function_to_test = os.environ.get('CurrentVersion')
    if not function_to_test:
        function_to_test = event.get('ApplicationName')
    
    logger.info(f"Ejecutando verificaciones post-despliegue para la función: {function_to_test}")
    
    try:
        # Realizar múltiples verificaciones de salud
        success_count = 0
        total_latency = 0
        
        # Realizar 5 verificaciones de salud para medir estabilidad
        for i in range(5):
            start_time = time.time()
            
            # Ejecutar prueba de healthcheck invocando la función
            lambda_client = boto3.client('lambda')
            test_event = {
                "httpMethod": "GET",
                "path": "/healthcheck/",
                "queryStringParameters": None,
                "headers": {
                    "Content-Type": "application/json"
                }
            }
            
            response = lambda_client.invoke(
                FunctionName=function_to_test,
                InvocationType='RequestResponse',
                Payload=json.dumps(test_event)
            )
            
            # Calcular latencia
            latency = (time.time() - start_time) * 1000  # en milisegundos
            total_latency += latency
            
            # Analizar respuesta
            response_payload = json.loads(response['Payload'].read())
            status_code = response_payload.get('statusCode')
            
            if status_code == 200:
                body = json.loads(response_payload.get('body', '{}'))
                if body.get('status') == 'ok':
                    success_count += 1
                    logger.info(f"Prueba de salud {i+1} exitosa (latencia: {latency:.2f}ms)")
                else:
                    logger.warning(f"Prueba de salud {i+1} devolvió estado no ok: {body}")
            else:
                logger.warning(f"Prueba de salud {i+1} falló con código {status_code}")
            
            # Esperar brevemente entre verificaciones
            time.sleep(1)
        
        # Registrar métricas en CloudWatch
        avg_latency = total_latency / 5
        submit_metrics(function_to_test, success_count, avg_latency)
        
        # Verificar resultados
        if success_count >= 4:  # Al menos 4 de 5 pruebas exitosas
            logger.info(f"Post-despliegue exitoso: {success_count}/5 pruebas exitosas, latencia promedio: {avg_latency:.2f}ms")
            put_lifecycle_success(deployment_id, lifecycle_event_hook_execution_id)
        else:
            logger.error(f"Post-despliegue fallido: solo {success_count}/5 pruebas exitosas")
            put_lifecycle_failure(deployment_id, lifecycle_event_hook_execution_id)
            
    except Exception as e:
        logger.error(f"Error ejecutando verificaciones post-despliegue: {str(e)}")
        put_lifecycle_failure(deployment_id, lifecycle_event_hook_execution_id)

def submit_metrics(function_name, success_count, avg_latency):
    """
    Envía métricas del despliegue a CloudWatch
    """
    try:
        environment = os.environ.get('ENVIRONMENT', 'dev')
        version = os.environ.get('APP_VERSION', 'unknown')
        
        cloudwatch.put_metric_data(
            Namespace='SingularityHealth/Deployments',
            MetricData=[
                {
                    'MetricName': 'HealthcheckSuccessRate',
                    'Dimensions': [
                        {'Name': 'Environment', 'Value': environment},
                        {'Name': 'FunctionName', 'Value': function_name},
                        {'Name': 'Version', 'Value': version}
                    ],
                    'Value': success_count / 5.0,
                    'Unit': 'None'
                },
                {
                    'MetricName': 'HealthcheckLatency',
                    'Dimensions': [
                        {'Name': 'Environment', 'Value': environment},
                        {'Name': 'FunctionName', 'Value': function_name},
                        {'Name': 'Version', 'Value': version}
                    ],
                    'Value': avg_latency,
                    'Unit': 'Milliseconds'
                }
            ]
        )
        logger.info("Métricas enviadas a CloudWatch")
    except Exception as e:
        logger.error(f"Error enviando métricas a CloudWatch: {str(e)}")

def put_lifecycle_success(deployment_id, lifecycle_event_hook_execution_id):
    """
    Notifica a CodeDeploy que el hook se completó exitosamente
    """
    codedeploy.put_lifecycle_event_hook_execution_status(
        deploymentId=deployment_id,
        lifecycleEventHookExecutionId=lifecycle_event_hook_execution_id,
        status='Succeeded'
    )

def put_lifecycle_failure(deployment_id, lifecycle_event_hook_execution_id):
    """
    Notifica a CodeDeploy que el hook falló
    """
    codedeploy.put_lifecycle_event_hook_execution_status(
        deploymentId=deployment_id,
        lifecycleEventHookExecutionId=lifecycle_event_hook_execution_id,
        status='Failed'
    ) 