#!/usr/bin/env python3
"""Run the CallDine MCP server over stdio."""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.mcp.server import main

if __name__ == "__main__":
    main()
