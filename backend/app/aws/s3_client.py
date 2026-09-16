import boto3

from app.config import get_settings


def get_s3_client():
    return boto3.client("s3", region_name=get_settings().aws_region)
