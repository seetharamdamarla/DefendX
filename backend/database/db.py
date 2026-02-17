import json
import uuid
import asyncio
from datetime import datetime
from prisma import Prisma, Json

# Single global instance to be shared across the application
prisma = Prisma()

class Database:
    """
    Production-grade database wrapper for DefendX using Prisma
    """
    
    def __init__(self):
        """Initialize Prisma client and establish connection"""
        self.prisma = prisma
        try:
            if not self.prisma.is_connected():
                self.prisma.connect()
            self._connected = True
            print("✓ Database connected successfully")
        except Exception as e:
            print(f"✗ Database connection failed: {str(e)}")
            self._connected = False

    def _ensure_connection(self):
        """Internal helper to ensure db is connected"""
        if not self._connected:
            try:
                self.prisma.connect()
                self._connected = True
                print("✓ Database reconnected")
            except Exception as e:
                print(f"✗ Database reconnection failed: {str(e)}")
                raise

    def store_scan_result(self, url: str, results: dict, timestamp: datetime, user_id: str = None) -> str:
        """
        Store scan results using Prisma
        """
        self._ensure_connection()
        
        scan_id = str(uuid.uuid4())
        
        # Convert datetime to something prisma likes if it's not already
        if isinstance(timestamp, str):
            timestamp = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))

        self.prisma.scan.create(
            data={
                'id': scan_id,
                'targetUrl': url,
                'scanTimestamp': timestamp,
                'results': Json(results),
                'userId': user_id
            }
        )
        
        return scan_id

    def get_scan_result(self, scan_id: str) -> dict:
        """Retrieve scan result by ID"""
        self._ensure_connection()
        
        scan = self.prisma.scan.find_unique(where={'id': scan_id})
        
        if scan:
            return {
                'scan_id': scan.id,
                'target_url': scan.targetUrl,
                'timestamp': scan.scanTimestamp.isoformat(),
                'results': scan.results
            }
        
        return None

    def get_recent_scans(self, limit: int = 10, user_id: str = None) -> list:
        """Get recent scan history"""
        self._ensure_connection()
        
        where_clause = {'userId': user_id}
        
        scans_data = self.prisma.scan.find_many(
            where=where_clause,
            order={'createdAt': 'desc'},
            take=limit
        )
        
        scans = []
        for s in scans_data:
            results = s.results
            summary = results.get('summary', {})
            risk_score = summary.get('risk_score', 'UNKNOWN')
            vuln_count = summary.get('total_vulnerabilities', 0)
            
            scans.append({
                'scan_id': s.id,
                'target_url': s.targetUrl,
                'timestamp': s.scanTimestamp.isoformat(),
                'risk_score': risk_score,
                'vuln_count': vuln_count
            })
                
        return scans

    def get_dashboard_stats(self, user_id: str = None) -> dict:
        """Get aggregated stats for dashboard with professional health score"""
        self._ensure_connection()
        
        where_clause = {'userId': user_id}
        all_scans = self.prisma.scan.find_many(where=where_clause)
        
        total_scans = len(all_scans)
        unique_targets = set()
        total_vulns = {'CRITICAL': 0, 'HIGH': 0, 'MEDIUM': 0, 'LOW': 0}
        scans_by_date = {}
        all_vulnerabilities = []  # Collect all vulnerabilities for health score
        
        for s in all_scans:
            target = s.targetUrl
            timestamp = s.scanTimestamp
            unique_targets.add(target)
            
            # Aggregate vulnerabilities
            results = s.results
            summary = results.get('summary', {}).get('by_severity', {})
            for severity, count in summary.items():
                if severity in total_vulns:
                    total_vulns[severity] += count
            
            # Collect all vulnerabilities for health score calculation
            vulnerabilities = results.get('vulnerabilities', [])
            all_vulnerabilities.extend(vulnerabilities)
            
            # Group by date for trends
            date_str = timestamp.isoformat().split('T')[0]
            scans_by_date[date_str] = scans_by_date.get(date_str, 0) + 1
        
        # Sort trends by date
        sorted_dates = sorted(scans_by_date.keys())[-7:]
        trends = [{'date': date, 'count': scans_by_date[date]} for date in sorted_dates]
        
        # Calculate professional health score
        from modules.health_score import SecurityHealthScoreCalculator
        calculator = SecurityHealthScoreCalculator()
        health_data = calculator.calculate_health_score(all_vulnerabilities)
        
        return {
            'total_scans': total_scans,
            'active_targets': len(unique_targets),
            'critical_risks': total_vulns.get('CRITICAL', 0) + total_vulns.get('HIGH', 0),
            'severity_distribution': total_vulns,
            'trends': trends,
            'health_score': health_data  # New professional health score data
        }

    def get_targets(self, user_id: str = None) -> list:
        """Get unique targets and their status"""
        self._ensure_connection()
        
        where_clause = {'userId': user_id}
        all_scans = self.prisma.scan.find_many(
            where=where_clause,
            order={'createdAt': 'desc'}
        )
        
        targets = {}
        for s in all_scans:
            url = s.targetUrl
            timestamp = s.scanTimestamp.isoformat()
            results = s.results
            summary = results.get('summary', {})
            risk_score = summary.get('risk_score', 'UNKNOWN')
            vuln_counts = summary.get('by_severity', {})
            
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
                
        return list(targets.values())

    def get_all_risks(self, user_id: str = None) -> list:
        """Get flattened list of all risks"""
        self._ensure_connection()
        
        where_clause = {'userId': user_id}
        all_scans = self.prisma.scan.find_many(where=where_clause)
        
        all_risks = []
        for s in all_scans:
            target = s.targetUrl
            timestamp = s.scanTimestamp.isoformat()
            results = s.results
            vulnerabilities = results.get('vulnerabilities', [])
            
            for v in vulnerabilities:
                all_risks.append({
                    'target': target,
                    'discovered_at': timestamp,
                    'title': v.get('title'),
                    'severity': v.get('severity'),
                    'category': v.get('category'),
                    'description': v.get('description'),
                    'remediation': v.get('remediation'),
                    'evidence': v.get('evidence', {}),
                    'references': v.get('references', [])
                })
                
        severity_order = {'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3}
        all_risks.sort(key=lambda x: severity_order.get(x['severity'], 4))
        
        return all_risks

    # Authentication Methods Removed

    def disconnect(self):
        """Disconnect from database - call this on app shutdown"""
        if self._connected:
            try:
                self.prisma.disconnect()
                self._connected = False
                print("✓ Database disconnected successfully")
            except Exception as e:
                print(f"✗ Database disconnect error: {str(e)}")
