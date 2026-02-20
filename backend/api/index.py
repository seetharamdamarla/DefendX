import sys
import os

# ============================================================
# CRITICAL: Must run BEFORE any Prisma imports.
# On Vercel, the query engine binary is looked up in this order:
#   1. $PRISMA_QUERY_ENGINE_BINARY (explicit path override)
#   2. /var/task/<engine-name>  (cwd on Lambda)
#   3. ~/.cache/prisma-python/...
#
# Strategy: Download the correct Linux binary at cold-start,
# copy it to /tmp, then set PRISMA_QUERY_ENGINE_BINARY so
# Prisma skips the discovery logic entirely.
# ============================================================
IS_VERCEL = os.getenv('VERCEL') == '1' or os.getenv('VERCEL_ENV')

if IS_VERCEL:
    import subprocess

    # Vercel runs on rhel-openssl-3.x.x - discover the exact version
    ENGINE_NAME_PREFIX = 'prisma-query-engine-rhel-openssl-3.'
    TMP_ENGINE_DIR = '/tmp/prisma-engine'
    PRISMA_VERSION = '5.17.0'
    PRISMA_HASH = '393aa359c9ad4a4bb28630fb5613f9c281cde053'

    os.makedirs(TMP_ENGINE_DIR, exist_ok=True)

    # Check if we already have a usable binary (warm start)
    existing_binary = None
    for f in os.listdir(TMP_ENGINE_DIR):
        full = os.path.join(TMP_ENGINE_DIR, f)
        if f.startswith('prisma-query-engine') and os.access(full, os.X_OK):
            existing_binary = full
            break

    if existing_binary:
        print(f"[startup] Warm start: using cached binary {existing_binary}")
        os.environ['PRISMA_QUERY_ENGINE_BINARY'] = existing_binary
    else:
        print("[startup] Cold start: downloading Prisma engine binary...")

        # Set cache dir to /tmp so prisma py fetch writes there
        os.environ['PRISMA_BINARY_CACHE_DIR'] = TMP_ENGINE_DIR

        result = subprocess.run(
            [sys.executable, '-m', 'prisma', 'py', 'fetch'],
            capture_output=True, text=True,
            env={**os.environ}
        )
        print(f"[startup] fetch stdout: {result.stdout.strip()}")
        if result.stderr:
            print(f"[startup] fetch stderr: {result.stderr.strip()[:500]}")

        # Find the downloaded binary
        for root, dirs, files in os.walk(TMP_ENGINE_DIR):
            for fname in files:
                fpath = os.path.join(root, fname)
                if 'prisma-query-engine' in fname and not fname.endswith('.gz'):
                    # Make executable
                    os.chmod(fpath, 0o755)
                    # Copy to TMP_ENGINE_DIR top level for easy access
                    dest = os.path.join(TMP_ENGINE_DIR, fname)
                    if fpath != dest:
                        import shutil
                        shutil.copy2(fpath, dest)
                        os.chmod(dest, 0o755)
                    os.environ['PRISMA_QUERY_ENGINE_BINARY'] = dest
                    print(f"[startup] Set PRISMA_QUERY_ENGINE_BINARY={dest}")
                    break
            if os.environ.get('PRISMA_QUERY_ENGINE_BINARY'):
                break

        if not os.environ.get('PRISMA_QUERY_ENGINE_BINARY'):
            print("[startup] WARNING: Could not find Prisma engine binary after fetch!")

# Add backend root directory to sys.path so all modules resolve correctly
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Now it's safe to import app — Prisma will use PRISMA_QUERY_ENGINE_BINARY
from app import app
