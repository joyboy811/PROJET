#!/usr/bin/env python
"""
Automatic initialization script for legacy M-PAGe data.
This script executes the init_legacy_data.sql file if it exists.
It is called automatically during the application's initial setup.
"""
import os
import sqlite3
import sys
from pathlib import Path

# Path to the database and SQL script
BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / 'db.sqlite3'
SQL_SCRIPT_PATH = BASE_DIR / 'init_legacy_data.sql'

def init_legacy_data():
    """Initialize legacy data if the SQL script exists"""
    if not SQL_SCRIPT_PATH.exists():
        print("SQL script init_legacy_data.sql not found - legacy data not initialized")
        return

    if not DB_PATH.exists():
        print("Database not found - skipping legacy data initialization")
        return

    try:
        # Connect to the database
        conn = sqlite3.connect(str(DB_PATH))
        cursor = conn.cursor()

        # Read and execute the SQL script
        with open(SQL_SCRIPT_PATH, 'r', encoding='utf-8') as f:
            sql_script = f.read()

        # Execute the script
        cursor.executescript(sql_script)
        conn.commit()

        print(f"M-PAGe legacy data initialized successfully from {SQL_SCRIPT_PATH.name}")

    except Exception as e:
        print(f"Error initializing legacy data: {e}")
        sys.exit(1)
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == '__main__':
    init_legacy_data()