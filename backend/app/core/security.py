"""Small password-hash and opaque-token helpers."""

import hashlib
import hmac
import secrets


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 100_000)
    return f"{salt.hex()}:{digest.hex()}"


def verify_password(password: str, password_hash: str) -> bool:
    salt_hex, digest_hex = password_hash.split(":")
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt_hex), 100_000)
    return hmac.compare_digest(digest.hex(), digest_hex)


def create_token() -> str:
    return secrets.token_urlsafe(32)
