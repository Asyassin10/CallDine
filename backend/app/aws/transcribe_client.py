import boto3

from app.config import get_settings


def get_transcribe_client():
    return boto3.client("transcribe", region_name=get_settings().aws_region)
