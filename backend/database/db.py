"""
Database Module

Purpose: Store scan results and history
Implementation: SQLite for simplicity and portability

Design decision: SQLite is chosen because:
- Lightweight and serverless
- No configuration needed
- Sufficient for this tool's scale
- Easy to backup and migrate
"""

import sqlite3
import json
import uuid
from datetime import datetime
from pathlib import Path


class Database:
    """
    Simple database wrapper for DefendX
    
    Schema:
    - scans table: scan results and metadata
    """
    
    def __init__(self, db_path: str = 'defendx.db'):
        """Initialize database connection"""
        self.db_path = db_path
        self._initialize_db()
    
    def _initialize_db(self):
        """Create tables if they don't exist"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create scans table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS scans (
                id TEXT PRIMARY KEY,
                target_url TEXT NOT NULL,
                scan_timestamp TIMESTAMP NOT NULL,
                results TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def store_scan_result(self, url: str, results: dict, timestamp: datetime) -> str:
        """
        Store scan results
        
        Returns: scan_id
        """
        scan_id = str(uuid.uuid4())
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO scans (id, target_url, scan_timestamp, results)
            VALUES (?, ?, ?, ?)
        ''', (scan_id, url, timestamp.isoformat(), json.dumps(results)))
        
        conn.commit()
        conn.close()
        
        return scan_id
    
    def get_scan_result(self, scan_id: str) -> dict:
        """Retrieve scan result by ID"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT target_url, scan_timestamp, results
            FROM scans
            WHERE id = ?
        ''', (scan_id,))
        
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return {
                'scan_id': scan_id,
                'target_url': row[0],
                'timestamp': row[1],
                'results': json.loads(row[2])
            }
        
        return None
    
    def get_recent_scans(self, limit: int = 10) -> list:
        """Get recent scan history"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, target_url, scan_timestamp, results
            FROM scans
            ORDER BY created_at DESC
            LIMIT ?
        ''', (limit,))
        
        rows = cursor.fetchall()
        conn.close()
        
        scans = []
        for row in rows:
            try:
                results = json.loads(row[3])
                summary = results.get('summary', {})
                risk_score = summary.get('risk_score', 'UNKNOWN')
                vuln_count = summary.get('total_vulnerabilities', 0)
                
                scans.append({
                    'scan_id': row[0],
                    'target_url': row[1],
                    'timestamp': row[2],
                    'risk_score': risk_score,
                    'vuln_count': vuln_count
                })
            except:
                continue
                
        return scans

    def get_dashboard_stats(self) -> dict:
        """Get aggregated stats for dashboard"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get all scans to aggregate data
        # Note: In a production DB, we would use SQL aggregations.
        # Since we store results as JSON, we'll process in Python for this version.
        cursor.execute('SELECT target_url, scan_timestamp, results FROM scans')
        rows = cursor.fetchall()
        conn.close()
        
        total_scans = len(rows)
        unique_targets = set()
        total_vulns = {'HIGH': 0, 'MEDIUM': 0, 'LOW': 0}
        scans_by_date = {}
        
        for row in rows:
            target = row[0]
            timestamp = row[1]
            try:
                results = json.loads(row[2])
                unique_targets.add(target)
                
                # Aggregate vulnerabilities
                summary = results.get('summary', {}).get('by_severity', {})
                for severity, count in summary.items():
                    if severity in total_vulns:
                        total_vulns[severity] += count
                
                # Group by date for trends
                date_str = timestamp.split('T')[0] # ISO format YYYY-MM-DD
                scans_by_date[date_str] = scans_by_date.get(date_str, 0) + 1
                
            except:
                continue
        
        # Sort trends by date
        sorted_dates = sorted(scans_by_date.keys())[-7:] # Last 7 days with activity
        trends = [{'date': date, 'count': scans_by_date[date]} for date in sorted_dates]
        
        return {
            'total_scans': total_scans,
            'active_targets': len(unique_targets),
            'critical_risks': total_vulns.get('HIGH', 0),
            'severity_distribution': total_vulns,
            'trends': trends
        }

    def get_targets(self) -> list:
        """Get unique targets and their status"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT target_url, scan_timestamp, results FROM scans ORDER BY created_at DESC')
        rows = cursor.fetchall()
        conn.close()
        
        targets = {}
        for row in rows:
            url = row[0]
            timestamp = row[1]
            try:
                results = json.loads(row[2])
                summary = results.get('summary', {})
                risk_score = summary.get('risk_score', 'UNKNOWN')
                vuln_counts = summary.get('by_severity', {})
                
                # Only keep the latest scan for each target
                if url not in targets:
                    targets[url] = {
                        'url': url,
                        'last_scan': timestamp,
                        'risk_score': risk_score,
                        'vuln_counts': vuln_counts,
                        'total_vulns': summary.get('total_vulnerabilities', 0),
                        'scans_count': 1
                    }
                else:
                    targets[url]['scans_count'] += 1
            except:
                continue
                
        return list(targets.values())

    def get_all_risks(self) -> list:
        """Get flattened list of all risks across all scans"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT target_url, scan_timestamp, results FROM scans')
        rows = cursor.fetchall()
        conn.close()
        
        all_risks = []
        for row in rows:
            target = row[0]
            timestamp = row[1]
            try:
                results = json.loads(row[2])
                vulnerabilities = results.get('vulnerabilities', [])
                
                for v in vulnerabilities:
                    all_risks.append({
                        'target': target,
                        'discovered_at': timestamp,
                        'title': v.get('title'),
                        'severity': v.get('severity'),
                        'category': v.get('category'),
                        'description': v.get('description'),
                        'remediation': v.get('remediation')
                    })
            except:
                continue
                
        # Sort by severity (High -> Medium -> Low)
        severity_order = {'HIGH': 0, 'MEDIUM': 1, 'LOW': 2}
        all_risks.sort(key=lambda x: severity_order.get(x['severity'], 3))
        
        return all_risks
