import sys
import os

# ============================================================
# CRITICAL: Must run BEFORE any Prisma imports.
#
# The Prisma query engine binaries are bundled in prisma_engine/
# at build time. On Vercel we set PRISMA_QUERY_ENGINE_BINARY
# to point directly to the correct binary so Prisma skips its
# auto-discovery logic (which fails on Lambda).
# ============================================================

# Backend root = parent of this file's directory
BACKEND_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

IS_VERCEL = os.getenv('VERCEL') == '1' or bool(os.getenv('VERCEL_ENV'))

if IS_VERCEL:
    # Detect the OpenSSL version to pick the right binary
    import subprocess
    try:
        ssl_result = subprocess.run(['openssl', 'version'], capture_output=True, text=True)
        ssl_output = ssl_result.stdout  # e.g. "OpenSSL 3.2.0 ..."
        import re
        match = re.search(r'OpenSSL\s+(\d+)\.(\d+)', ssl_output)
        if match:
            major, minor = match.group(1), match.group(2)
            openssl_tag = f'rhel-openssl-{major}.{minor}.x'
        else:
            openssl_tag = 'rhel-openssl-3.0.x'  # reasonable default
    except Exception:
        openssl_tag = 'rhel-openssl-3.0.x'

    print(f"[startup] Detected OpenSSL tag: {openssl_tag}")

    # Look for the bundled binary
    engine_name = f'prisma-query-engine-{openssl_tag}'
    bundled_binary = os.path.join(BACKEND_ROOT, 'prisma_engine', engine_name)

    if os.path.isfile(bundled_binary):
        os.chmod(bundled_binary, 0o755)
        os.environ['PRISMA_QUERY_ENGINE_BINARY'] = bundled_binary
        print(f"[startup] Using bundled engine: {bundled_binary}")
    else:
        # Fallback: try the 3.0.x binary which should work on 3.x
        fallback = os.path.join(BACKEND_ROOT, 'prisma_engine', 'prisma-query-engine-rhel-openssl-3.0.x')
        if os.path.isfile(fallback):
            os.chmod(fallback, 0o755)
            os.environ['PRISMA_QUERY_ENGINE_BINARY'] = fallback
            print(f"[startup] Using fallback engine: {fallback}")
        else:
            print(f"[startup] WARNING: No bundled engine found at {bundled_binary}")

# Make backend root importable
sys.path.insert(0, BACKEND_ROOT)

from app import app
