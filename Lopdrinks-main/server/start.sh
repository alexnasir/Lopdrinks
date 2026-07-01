#!/usr/bin/env bash
# start.sh — Render startup script
#
# Order of operations:
#   1. Detect alembic state and stamp correctly so no migrations are skipped
#   2. Run flask db upgrade  (applies all pending migrations, including category)
#   3. Seed database         (idempotent — skips existing rows)
#   4. Start gunicorn

set -e

echo "==> [1/4] Checking Alembic / migration state..."

python - <<'EOF'
import os, sys, subprocess
from sqlalchemy import create_engine, text

db_url = os.environ.get("DATABASE_URL", "")
if not db_url:
    print("No DATABASE_URL — skipping stamp check (SQLite dev mode).")
    sys.exit(0)

engine = create_engine(db_url)

def table_exists(conn, name: str) -> bool:
    return conn.execute(text(
        "SELECT EXISTS (SELECT 1 FROM information_schema.tables "
        "WHERE table_name = :t)"
    ), {"t": name}).scalar()

def run(cmd):
    subprocess.run(cmd, check=True)

with engine.connect() as conn:
    has_alembic   = table_exists(conn, "alembic_version")
    has_brew      = table_exists(conn, "brew_method")
    has_category  = table_exists(conn, "category")

    print(f"  alembic_version : {'yes' if has_alembic else 'no'}")
    print(f"  brew_method     : {'yes' if has_brew else 'no'}")
    print(f"  category        : {'yes' if has_category else 'no'}")

    if not has_alembic:
        if has_brew and has_category:
            # All tables present — stamp at final head, nothing to migrate
            print("All tables exist, no alembic tracking — stamping head.")
            run(["flask", "--app", "run:app", "db", "stamp", "head"])

        elif has_brew and not has_category:
            # Pre-category deploy — tables exist up to initial migration only
            # Stamp at the initial revision so alembic runs only the category migration
            print("Pre-category tables detected — stamping initial revision.")
            run(["flask", "--app", "run:app", "db", "stamp", "99a8e53f67cb"])

        else:
            # Completely fresh database — let upgrade run all migrations from scratch
            print("Fresh database — full migration will run.")

    else:
        print("Alembic tracking found — upgrade will apply any pending migrations.")
EOF

echo "==> [2/4] Running flask db upgrade..."
flask --app run:app db upgrade

echo "==> [3/4] Seeding database..."
python seed.py

echo "==> [4/4] Starting gunicorn..."
exec gunicorn "run:app" --workers 2 --threads 2 --timeout 120 --bind "0.0.0.0:$PORT"
