"""
Directory Exposure Check

Purpose: Detect publicly accessible sensitive directories
Logic: Manually check common sensitive paths for HTTP 200 responses

Why this matters:
Exposed directories like /admin, /backup, /.env can leak sensitive
information or provide unauthorized access to administrative functions.

Detection Method: Manual HTTP request to known paths
Risk Level: MEDIUM to HIGH (depends on exposure)
"""

import requests
from typing import List, Dict, Any


class DirectoryExposureCheck:
    """
    Check for exposed sensitive directories
    
    Methodology:
    1. Define a list of commonly sensitive paths (human-curated)
    2. Send HTTP requests to each path
    3. Check for HTTP 200 (success) responses
    4. Verify content indicates directory/file access
    
    This mimics manual pentesting enumeration.
    """
    
    def __init__(self):
        # Manually defined list of sensitive paths
        # Justification: These paths commonly expose sensitive data in real-world apps
        # Source: OWASP, common pentesting checklists
        
        self.sensitive_paths = {
            '/admin': {
                'description': 'Administrative interface',
                'risk': 'Unauthorized access to admin functions',
                'severity': 'HIGH'
            },
            '/admin.php': {
                'description': 'PHP admin panel',
                'risk': 'Unauthorized administrative access',
                'severity': 'HIGH'
            },
            '/administrator': {
                'description': 'Administrator directory',
                'risk': 'Unauthorized administrative access',
                'severity': 'HIGH'
            },
            '/backup': {
                'description': 'Backup files directory',
                'risk': 'Exposure of backup files containing sensitive data',
                'severity': 'HIGH'
            },
            '/backups': {
                'description': 'Backup files directory',
                'risk': 'Exposure of backup files',
                'severity': 'HIGH'
            },
            '/.env': {
                'description': 'Environment configuration file',
                'risk': 'Exposure of API keys, database credentials, secrets',
                'severity': 'HIGH'
            },
            '/.git': {
                'description': 'Git repository directory',
                'risk': 'Exposure of source code and version history',
                'severity': 'MEDIUM'
            },
            '/config': {
                'description': 'Configuration directory',
                'risk': 'Exposure of configuration files',
                'severity': 'MEDIUM'
            },
            '/uploads': {
                'description': 'File upload directory',
                'risk': 'Directory listing or unauthorized file access',
                'severity': 'MEDIUM'
            },
            '/phpinfo.php': {
                'description': 'PHP information page',
                'risk': 'Exposure of server configuration details',
                'severity': 'MEDIUM'
            },
            '/test': {
                'description': 'Test directory',
                'risk': 'Exposure of test files or debug information',
                'severity': 'LOW'
            },
            '/debug': {
                'description': 'Debug directory',
                'risk': 'Exposure of debugging information',
                'severity': 'MEDIUM'
            }
        }
    
    def check(self, target_url: str, **kwargs) -> List[Dict[str, Any]]:
        """
        Check for exposed sensitive directories
        
        Detection Logic (EXPLICIT):
        For each sensitive path:
          1. Build full URL: target_url + path
          2. Send HTTP GET request
          3. IF response status == 200:
             - AND content suggests directory/file access
             - THEN flag as vulnerability
          4. ELSE: No vulnerability
        
        This is simple HTTP enumeration, not AI detection.
        """
        vulnerabilities = []
        
        # Ensure base URL doesn't end with /
        base_url = target_url.rstrip('/')
        
        for path, path_info in self.sensitive_paths.items():
            try:
                # Build test URL
                test_url = base_url + path
                
                # Send request
                response = requests.get(
                    test_url,
                    timeout=10,
                    allow_redirects=False  # Don't follow redirects
                )
                
                # DETECTION RULE: Check status code
                # This is the primary condition
                if response.status_code == 200:
                    # Additional verification: Check content
                    if self._is_valid_exposure(response, path):
                        vulnerability = {
                            'category': 'Directory/File Exposure',
                            'severity': path_info['severity'],
                            'title': f'Exposed Path: {path}',
                            'description': self._generate_description(path, path_info, test_url),
                            'evidence': {
                                'url': test_url,
                                'status_code': response.status_code,
                                'content_length': len(response.content),
                                'content_type': response.headers.get('Content-Type', 'unknown')
                            },
                            'remediation': self._generate_remediation(path, path_info),
                            'references': [
                                'https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/02-Configuration_and_Deployment_Management_Testing/04-Review_Old_Backup_and_Unreferenced_Files_for_Sensitive_Information'
                            ]
                        }
                        vulnerabilities.append(vulnerability)
            
            except Exception as e:
                # Path not accessible or error - this is expected for most paths
                continue
        
        return vulnerabilities
    
    def _is_valid_exposure(self, response, path: str) -> bool:
        """
        Verify that the response actually indicates exposure with strict validation
        
        Enhanced Rules to prevent false positives:
        1. Must have substantial content (not empty page)
        2. Must not be a framework's catch-all route (React, Next.js, etc.)
        3. Must not be a generic error page returned as 200
        4. Must contain specific indicators matching the expected path type
        
        This prevents false positives from SPAs and custom error handlers.
        """
        content = response.text
        content_lower = content.lower()
        content_length = len(response.content)
        
        # Rule 1: Check minimum content length
        if content_length < 100:
            return False
        
        # Rule 2: Detect Single Page Applications (React, Vue, Next.js, etc.)
        # These frameworks might return the same index.html for any route
        spa_indicators = [
            '<div id="root"',
            '<div id="app"',
            '<div id="__next"',
            'window.__NEXT_DATA__',
            'react-root',
            'vue-app',
            '_app.js',
            '_buildManifest',
            '__webpack',
            'window.reactRender'
        ]
        
        # If we detect SPA framework, it's definitely a false positive
        if any(indicator in content for indicator in spa_indicators):
            return False
        
        # Rule 3: Check for common "not found" patterns even with 200 status
        false_positive_patterns = [
            'not found',
            '404',
            'does not exist',
            'page not found',
            'cannot find',
            'no such file',
            'the requested url',
            'file not found'
        ]
        
        for pattern in false_positive_patterns:
            if pattern in content_lower:
                return False
        
        # Rule 4: Path-specific deep validation
        # Only flag if we have STRONG evidence the path actually exists
        
        if path == '/.env':
            # .env files must contain actual environment variables
            has_env_pattern = '=' in content and '\n' in content
            has_env_keywords = any(key in content.upper() for key in [
                'API_KEY', 'SECRET', 'PASSWORD', 'DB_', 'DATABASE',
                'TOKEN', 'AWS_', 'STRIPE_', 'GOOGLE_'
            ])
            # Must have both pattern AND keywords to be real
            return has_env_pattern and has_env_keywords
        
        if path == '/.git':
            # Git directory must have git-specific structure
            git_indicators = ['ref:', 'refs/', 'HEAD', 'objects/', 'config']
            return any(indicator in content for indicator in git_indicators)
        
        if path in ['/admin', '/admin.php', '/administrator']:
            # Admin panels have specific characteristics
            admin_indicators = [
                'admin login',
                'administrator login',
                'admin panel',
                'dashboard login',
                '<input type="password"',
                'phpmyadmin',
                'wp-admin',
                'admin area',
                'login to admin'
            ]
            
            # Must have at least 2 admin indicators to be real
            indicator_count = sum(1 for ind in admin_indicators if ind in content_lower)
            
            # Also check for PHP-specific patterns if it's a .php file
            if path.endswith('.php'):
                php_indicators = ['<?php', '<?=', 'phpmyadmin']
                has_php = any(ind in content for ind in php_indicators)
                return indicator_count >= 2 or has_php
            
            return indicator_count >= 2
        
        if path == '/phpinfo.php':
            # Must actually be PHPInfo output
            phpinfo_indicators = ['phpinfo()', 'php version', 'php api', 'configuration']
            return sum(1 for ind in phpinfo_indicators if ind in content_lower) >= 2
        
        if path in ['/backup', '/backups']:
            # Directory listings or actual backup file indicators
            backup_indicators = [
                'index of',
                'directory listing',
                'parent directory',
                '.zip',
                '.tar',
                '.sql',
                'backup-'
            ]
            return any(indicator in content_lower for indicator in backup_indicators)
        
        # Rule 5: Generic directory listing check
        directory_indicators = [
            'index of /',
            'directory listing for',
            'parent directory',
            '[dir]',
            '<a href="../">'
        ]
        
        if any(indicator in content_lower for indicator in directory_indicators):
            return True
        
        # Rule 6: If none of the above strict checks pass, it's likely a false positive
        # Old logic would flag anything > 500 bytes, but that's too loose
        return False

    
    def _generate_description(self, path: str, path_info: Dict, url: str) -> str:
        """Generate human-readable description"""
        return f"""
An exposed sensitive path was detected: {path}

What this is:
{path_info['description']}

Security Risk:
{path_info['risk']}

How we detected this:
1. We sent an HTTP GET request to: {url}
2. The server responded with HTTP 200 (OK)
3. The response content indicates actual access to this path
4. This path should NOT be publicly accessible

Why this is dangerous:
Sensitive directories and files should not be accessible to unauthorized users.
Public access to these paths can lead to:
- Information disclosure
- Unauthorized access
- Data breaches
- Further exploitation

Detection Method:
This was found through manual path enumeration, a standard penetration testing technique.
        """.strip()
    
    def _generate_remediation(self, path: str, path_info: Dict) -> str:
        """Generate remediation guidance"""
        return f"""
Remediation Steps:

1. IMMEDIATE ACTION
   - Restrict access to {path} immediately
   - Verify what information is exposed
   - Check logs for unauthorized access

2. ACCESS CONTROL
   - Configure web server to deny access to sensitive paths
   - Implement authentication for administrative paths
   - Use .htaccess (Apache) or location blocks (Nginx)

3. FILE SYSTEM SECURITY
   - Move sensitive files outside web root
   - Ensure configuration files are not web-accessible
   - Remove test/debug files from production

4. SERVER CONFIGURATION EXAMPLES

Apache (.htaccess):
<Files ".env">
    Order allow,deny
    Deny from all
</Files>

Nginx:
location ~ /\. {{
    deny all;
    return 404;
}}

5. BEST PRACTICES
   - Never store sensitive files in web-accessible directories
   - Use environment variables, not .env files in production
   - Implement proper access controls on all admin paths
   - Regular security audits to check for exposed paths

6. VERIFICATION
   After implementing fixes:
   - Test access to {path} from different IPs
   - Verify it returns 403 (Forbidden) or 404 (Not Found)
   - Use online scanners to verify externally
        """.strip()
