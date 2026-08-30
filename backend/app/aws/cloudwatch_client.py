import boto3

from app.config import get_settings


def get():
    return boto3.client("logs", region_name=get_settings().aws_region)
