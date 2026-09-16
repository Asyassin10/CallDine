import boto3

from app.config import get_settings


def get_bedrock_client():
    return boto3.client("bedrock-runtime", region_name=get_settings().aws_region)
