import boto3

from app.config import get_settings


def get_polly_client():
    return boto3.client("polly", region_name=get_settings().aws_region)
