import sys
import os

# --- Vercel Serverless: Ensure Prisma Query Engine binary is available ---
# Vercel's Lambda has a read-only filesystem except /tmp.
# We set PRISMA_BINARY_CACHE_DIR to /tmp so the engine can be downloaded
# and cached there across warm invocations.
if os.getenv('VERCEL') == '1' or os.getenv('VERCEL_ENV'):
    os.environ['PRISMA_BINARY_CACHE_DIR'] = '/tmp/prisma-binaries'
    binary_dir = '/tmp/prisma-binaries'
    
    # Check if any engine binary exists already (warm start skip)
    engine_exists = False
    if os.path.exists(binary_dir):
        for root, dirs, files in os.walk(binary_dir):
            for f in files:
                if 'prisma-query-engine' in f and not f.endswith('.gz'):
                    engine_exists = True
                    break
    
    if not engine_exists:
        print("[startup] Fetching Prisma query engine binary...")
        import subprocess
        result = subprocess.run(
            [sys.executable, '-m', 'prisma', 'py', 'fetch'],
            capture_output=True, text=True
        )
        print(f"[startup] prisma py fetch stdout: {result.stdout}")
        print(f"[startup] prisma py fetch stderr: {result.stderr}")
    else:
        print("[startup] Prisma query engine binary already exists (warm start)")

# Add the backend root to sys.path so app.py and its imports can be found
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app
