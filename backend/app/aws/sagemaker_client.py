import boto3

from app.config import get_settings


def get_sagemaker_client():
    return boto3.client("sagemaker-runtime", region_name=get_settings().aws_region)
