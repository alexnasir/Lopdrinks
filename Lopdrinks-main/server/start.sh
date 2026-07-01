#!/usr/bin/env bash
# start.sh — Render startup script
#
# Order of operations:
#   1. Detect whether alembic_version table exists
#   2. If tables exist but no alembic tracking → stamp head (no DDL)
#   3. Run flask db upgrade (applies any pending migrations)
#   4. Run seed.py (idempotent — skips existing records)
#   5. Start gunicorn

set -e

echo "==> [1/4] Checking Alembic version table..."

python - <<'EOF'
import os, sys
from sqlalchemy import create_engine, text

db_url = os.environ.get("DATABASE_URL", "")
if not db_url:
    print("No DATABASE_URL — skipping stamp check (SQLite dev mode).")
    sys.exit(0)

engine = create_engine(db_url)
with engine.connect() as conn:
    alembic_exists = conn.execute(text(
        "SELECT EXISTS (SELECT 1 FROM information_schema.tables "
        "WHERE table_name = 'alembic_version')"
    )).scalar()

    if not alembic_exists:
        tables_exist = conn.execute(text(
            "SELECT EXISTS (SELECT 1 FROM information_schema.tables "
            "WHERE table_name = 'brew_method')"
        )).scalar()
        if tables_exist:
            print("Tables exist but no alembic_version — stamping head.")
            import subprocess
            subprocess.run(
                ["flask", "--app", "run:app", "db", "stamp", "head"],
                check=True
            )
        else:
            print("Fresh database — full migration will run.")
    else:
        print("Alembic tracking found — running upgrade only.")
EOF

echo "==> [2/4] Running flask db upgrade..."
flask --app run:app db upgrade

echo "==> [3/4] Seeding database..."
python seed.py

echo "==> [4/4] Starting gunicorn..."
exec gunicorn "run:app" --workers 2 --threads 2 --timeout 120 --bind "0.0.0.0:$PORT"
