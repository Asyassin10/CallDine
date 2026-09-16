import boto3

from app.config import get_settings


def get_textract_client():
    return boto3.client("textract", region_name=get_settings().aws_region)
