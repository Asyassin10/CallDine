import boto3

from app.config import get_settings


def get_secrets_client():
    return boto3.client("secretsmanager", region_name=get_settings().aws_region)
