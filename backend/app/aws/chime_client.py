import boto3

from app.config import get_settings


def get_chime_client():
    return boto3.client("chime-sdk-meetings", region_name=get_settings().aws_region)
