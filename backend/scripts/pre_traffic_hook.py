#!/usr/bin/env python
"""
Hook que se ejecuta antes de permitir tráfico a la nueva versión de la Lambda.
Verifica que la función responda correctamente al endpoint de healthcheck.
"""
import boto3
import json
import urllib.request
import os
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Inicializar cliente de CodeDeploy
codedeploy = boto3.client('codedeploy')

def lambda_handler(event, context):
    """
    Función principal del hook de pre-tráfico
    """
    logger.info("Pre-traffic hook iniciado")
    logger.info(json.dumps(event))
    
    # Obtener información del despliegue
    deployment_id = event['DeploymentId']
    lifecycle_event_hook_execution_id = event['LifecycleEventHookExecutionId']
    
    # Obtener la versión de lambda que está siendo desplegada
    function_to_test = os.environ.get('NewVersion')
    if not function_to_test:
        function_to_test = event.get('ApplicationName')
    
    logger.info(f"Ejecutando verificación de salud para la función: {function_to_test}")
    
    try:
        # Ejecutar prueba de healthcheck invocando la función directamente
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
        
        # Analizar respuesta
        response_payload = json.loads(response['Payload'].read())
        status_code = response_payload.get('statusCode')
        
        if status_code != 200:
            logger.error(f"Prueba de salud falló: {response_payload}")
            put_lifecycle_failure(deployment_id, lifecycle_event_hook_execution_id)
            return
        
        # Verificar respuesta JSON
        body = json.loads(response_payload.get('body', '{}'))
        if body.get('status') != 'ok':
            logger.error(f"Prueba de salud devolvió estado no ok: {body}")
            put_lifecycle_failure(deployment_id, lifecycle_event_hook_execution_id)
            return
            
        # Si llegamos aquí, la prueba fue exitosa
        logger.info("Prueba de salud exitosa")
        put_lifecycle_success(deployment_id, lifecycle_event_hook_execution_id)
        
    except Exception as e:
        logger.error(f"Error ejecutando prueba de salud: {str(e)}")
        put_lifecycle_failure(deployment_id, lifecycle_event_hook_execution_id)

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