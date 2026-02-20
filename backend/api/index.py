import sys
import os

# ============================================================
# CRITICAL: Must run BEFORE any Prisma imports.
# Set PRISMA_BINARY_CACHE_DIR to /tmp so the query engine
# binary can be written there on Vercel (read-only FS).
# ============================================================
if os.getenv('VERCEL') == '1' or os.getenv('VERCEL_ENV'):
    os.environ['PRISMA_BINARY_CACHE_DIR'] = '/tmp/prisma-binaries'
    binary_dir = '/tmp/prisma-binaries'

    # Check if engine binary already exists (warm invocation - skip download)
    engine_exists = False
    if os.path.exists(binary_dir):
        for root, dirs, files in os.walk(binary_dir):
            for f in files:
                if 'prisma-query-engine' in f and not f.endswith('.gz') and not f.endswith('.tmp'):
                    engine_exists = True
                    break

    if not engine_exists:
        print("[startup] Cold start: fetching Prisma query engine binary to /tmp...")
        import subprocess
        result = subprocess.run(
            [sys.executable, '-m', 'prisma', 'py', 'fetch'],
            capture_output=True, text=True,
            env={**os.environ}  # pass updated env with PRISMA_BINARY_CACHE_DIR
        )
        print(f"[startup] stdout: {result.stdout.strip()}")
        if result.stderr:
            print(f"[startup] stderr: {result.stderr.strip()}")
        print(f"[startup] Return code: {result.returncode}")
    else:
        print("[startup] Warm start: Prisma binary already present, skipping fetch.")

# Add backend root directory to sys.path so all modules resolve correctly
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Now safe to import app (which triggers Prisma client import and DB connection)
from app import app
