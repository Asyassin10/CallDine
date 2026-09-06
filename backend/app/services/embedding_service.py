"""Bedrock embedding helper."""

import json

from app.aws.bedrock_client import get_bedrock_client


def create_embedding(text: str) -> list[float]:
    response = get_bedrock_client().invoke_model(
        modelId="amazon.titan-embed-text-v2:0",
        body=json.dumps({"inputText": text, "dimensions": 1024, "normalize": True}),
    )   
    return json.loads(response["body"].read())["embedding"]
