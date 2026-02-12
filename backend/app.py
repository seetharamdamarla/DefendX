"""
DefendX - Attack Surface Scanner
Main Flask Application

SECURITY NOTICE:
This tool is intended strictly for authorized security testing and educational use.
All vulnerability detection logic is rule-based and manually defined.

AI Disclosure:
AI tools were used only for development assistance and debugging.
All security logic, vulnerability rules, and design decisions were manually 
defined and implemented by the developer.
"""

import os

import signal
import sys
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# Import custom modules
from modules.scanner import AttackSurfaceScanner
from modules.validator import URLValidator
from database.db import Database

app = Flask(__name__)

# Configure CORS - restrict in production
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Rate limiting to prevent abuse
# Justification: Prevents automated scanning abuse and resource exhaustion
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["10 per minute"],  # Conservative limit
    storage_uri="memory://"
)

# Initialize database
db = Database()

# Configuration
SCAN_TIMEOUT = 60  # seconds - prevents indefinite scans
MAX_CRAWL_DEPTH = 1  # Conservative depth to avoid overload and speed up scan


@app.route('/api/health', methods=['GET'])
def health_check():
    """Simple health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat()
    }), 200




@app.route('/api/scan', methods=['POST'])
@limiter.limit("3 per hour")  # Strict limit on actual scans
def start_scan():
    """
    Initiate a security scan on a target URL
    
    This endpoint requires explicit user authorization confirmation.
    Rate limiting is intentionally strict to prevent abuse.
    """
    try:
        data = request.get_json()
        
        # Extract and validate input
        target_url = data.get('url', '').strip()
        user_confirmed = data.get('authorized', False)
        
        # Step 1: Validate authorization confirmation
        # Justification: Ethical scanning requires explicit consent
        if not user_confirmed:
            return jsonify({
                'success': False,
                'error': 'Authorization confirmation required',
                'message': 'You must confirm you are authorized to scan this target'
            }), 400
        
        # Step 2: Validate URL format and safety
        validator = URLValidator()
        is_valid, error_message = validator.validate(target_url)
        
        if not is_valid:
            return jsonify({
                'success': False,
                'error': 'Invalid URL',
                'message': error_message
            }), 400
        
        # Step 3: Execute scan with timeout protection
        scanner = AttackSurfaceScanner(
            target_url=target_url,
            max_depth=MAX_CRAWL_DEPTH,
            timeout=SCAN_TIMEOUT
        )
        
        scan_results = scanner.execute_scan()
        
        # Step 4: Store scan results
        scan_id = db.store_scan_result(
            url=target_url,
            results=scan_results,
            timestamp=datetime.utcnow()
        )
        
        # Step 5: Return structured results
        return jsonify({
            'success': True,
            'scan_id': scan_id,
            'target_url': target_url,
            'timestamp': datetime.utcnow().isoformat(),
            'results': scan_results
        }), 200
        
    except Exception as e:
        # Log error (in production, use proper logging)
        print(f"Scan error: {str(e)}")
        
        return jsonify({
            'success': False,
            'error': 'Scan failed',
            'message': 'An error occurred during scanning. Please try again.'
        }), 500


@app.route('/api/scan/<scan_id>', methods=['GET'])
def get_scan_result(scan_id):
    """Retrieve results of a previous scan"""
    try:
        result = db.get_scan_result(scan_id)
        
        if not result:
            return jsonify({
                'success': False,
                'error': 'Scan not found'
            }), 404
        
        return jsonify({
            'success': True,
            'result': result
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': 'Failed to retrieve scan'
        }), 500


@app.route('/api/dashboard', methods=['GET'])
def get_dashboard_data():
    """Retrieve aggregate data for the dashboard"""
    try:
        stats = db.get_dashboard_stats()
        recent_scans = db.get_recent_scans(limit=5)
        
        return jsonify({
            'success': True,
            'stats': stats,
            'recent_scans': recent_scans
        }), 200
        
    except Exception as e:
        print(f"Dashboard error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to load dashboard data'
        }), 500


@app.route('/api/targets', methods=['GET'])
def get_targets():
    """Get all unique targets"""
    try:
        targets = db.get_targets()
        return jsonify({'success': True, 'targets': targets}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/risks', methods=['GET'])
def get_risks():
    """Get all risks"""
    try:
        risks = db.get_all_risks()
        return jsonify({'success': True, 'risks': risks}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/scans', methods=['GET'])
def get_all_scans():
    """Get all scans history"""
    try:
        # Reusing get_recent_scans with a high limit effectively gets all for this scale
        scans = db.get_recent_scans(limit=100)
        return jsonify({'success': True, 'scans': scans}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/disclaimer', methods=['GET'])
def get_disclaimer():
    """Return the ethical use disclaimer"""
    return jsonify({
        'disclaimer': (
            'DefendX is intended strictly for authorized security testing '
            'and educational use. Unauthorized scanning of systems you do not '
            'own or have explicit permission to test is illegal and unethical. '
            'By using this tool, you acknowledge that you have proper authorization '
            'and accept full responsibility for your actions.'
        ),
        'requirements': [
            'You must own the target system, OR',
            'You must have written authorization from the system owner, OR',
            'You are testing in a controlled lab environment'
        ]
    }), 200


# Signal handler for graceful shutdown
def shutdown_handler(signum, frame):
    """Handle shutdown signals to cleanup database connections"""
    print("\n🛑 Shutting down gracefully...")
    db.disconnect()
    sys.exit(0)


# Register signal handlers
signal.signal(signal.SIGINT, shutdown_handler)
signal.signal(signal.SIGTERM, shutdown_handler)


if __name__ == '__main__':
    # Development server only
    # In production, use gunicorn or similar WSGI server
    try:
        app.run(debug=True, host='127.0.0.1', port=5000)
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
        db.disconnect()
    except Exception as e:
        print(f"❌ Server error: {str(e)}")
        db.disconnect()
        raise
