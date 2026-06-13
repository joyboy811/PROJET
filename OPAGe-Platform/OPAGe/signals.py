import sqlite3
from pathlib import Path

from django.conf import settings
from django.db.models.signals import post_migrate
from django.dispatch import receiver


def init_opage_data():
    """Initialize O-PAGe data from the SQL file if present."""
    db_path = Path(settings.BASE_DIR) / 'db.sqlite3'
    sql_script_path = Path(__file__).resolve().parent / 'init_opage_seed.sql'

    if not sql_script_path.exists():
        print('OPAGe seed file not found; skipping O-PAGe demo data initialization')
        return

    if not db_path.exists():
        print('OPAGe database not found; skipping O-PAGe demo data initialization')
        return

    try:
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        with open(sql_script_path, 'r', encoding='utf-8') as f:
            cursor.executescript(f.read())
        conn.commit()
        print('OPAGe demo data initialized successfully from init_opage_seed.sql')
    except Exception as exc:
        print(f'Error initializing OPAGe demo data: {exc}')
    finally:
        if 'conn' in locals():
            conn.close()


@receiver(post_migrate)
def init_opage_data_on_startup(sender, **kwargs):
    if sender.name == 'OPAGe':
        init_opage_data()
