#!/usr/bin/env bash
# start.sh — Render startup script
#
# Handles two scenarios safely:
#   1. Fresh DB (no tables)      → db upgrade creates everything
#   2. Existing DB, no Alembic   → db stamp head + db upgrade (no-op for existing tables)
#   3. Existing DB + Alembic     → db upgrade applies only new migrations
#
# The migration itself is now idempotent (IF NOT EXISTS guards), so
# re-running it on an already-migrated DB is always safe.

set -e

echo "==> Checking Alembic version table..."

# Check whether alembic_version table exists in the DB.
# If it doesn't, stamp the current head so Alembic knows the DB is up to date.
python - <<'EOF'
import os, sys
from sqlalchemy import create_engine, text

db_url = os.environ.get("DATABASE_URL", "")
if not db_url:
    print("No DATABASE_URL set, skipping stamp check.")
    sys.exit(0)

engine = create_engine(db_url)
with engine.connect() as conn:
    result = conn.execute(text(
        "SELECT EXISTS (SELECT 1 FROM information_schema.tables "
        "WHERE table_name = 'alembic_version')"
    ))
    alembic_exists = result.scalar()

    if not alembic_exists:
        # Check if our tables already exist (DB was created before Alembic tracking)
        result2 = conn.execute(text(
            "SELECT EXISTS (SELECT 1 FROM information_schema.tables "
            "WHERE table_name = 'brew_method')"
        ))
        tables_exist = result2.scalar()
        if tables_exist:
            print("Tables exist but no alembic_version found — stamping head.")
            import subprocess
            subprocess.run(
                ["flask", "--app", "run:app", "db", "stamp", "head"],
                check=True
            )
        else:
            print("Fresh database — will run full migration.")
    else:
        print("Alembic version table found — running upgrade only.")
EOF

echo "==> Running flask db upgrade..."
flask --app run:app db upgrade

echo "==> Starting gunicorn..."
exec gunicorn "run:app" --workers 2 --threads 2 --timeout 120 --bind "0.0.0.0:$PORT"
