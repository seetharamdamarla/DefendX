"""
Security Headers Check

Purpose: Detect missing security headers
Logic: Explicitly check for presence of critical HTTP security headers

Why this matters:
Security headers protect against common web attacks. Their absence
indicates a configuration weakness that is easy to exploit.

Detection Method: Manual HTTP header inspection
Risk Level: MEDIUM (configuration weakness)
"""

import requests
from typing import List, Dict, Any


class SecurityHeadersCheck:
    """
    Check for missing security headers
    
    This check is intentionally simple and explicit:
    - Send HTTP request
    - Inspect response headers
    - Flag missing critical headers
    
    NO AI or ML involved - just header inspection.
    """
    
    def __init__(self):
        # Define critical security headers (human-curated list)
        # Each header serves a specific security purpose
        self.critical_headers = {
            'Content-Security-Policy': {
                'purpose': 'Prevents XSS and injection attacks',
                'fix': 'Add "Content-Security-Policy" header with appropriate directives',
                'example': "Content-Security-Policy: default-src 'self'; script-src 'self'"
            },
            'X-Frame-Options': {
                'purpose': 'Prevents clickjacking attacks',
                'fix': 'Add "X-Frame-Options: DENY" or "X-Frame-Options: SAMEORIGIN"',
                'example': 'X-Frame-Options: SAMEORIGIN'
            },
            'Strict-Transport-Security': {
                'purpose': 'Enforces HTTPS connections',
                'fix': 'Add "Strict-Transport-Security" header (HTTPS only)',
                'example': 'Strict-Transport-Security: max-age=31536000; includeSubDomains'
            },
            'X-Content-Type-Options': {
                'purpose': 'Prevents MIME-type sniffing',
                'fix': 'Add "X-Content-Type-Options: nosniff"',
                'example': 'X-Content-Type-Options: nosniff'
            },
            'Referrer-Policy': {
                'purpose': 'Controls referrer information leakage',
                'fix': 'Add "Referrer-Policy" header with appropriate policy',
                'example': 'Referrer-Policy: strict-origin-when-cross-origin'
            }
        }
    
    def check(self, target_url: str, **kwargs) -> List[Dict[str, Any]]:
        """
        Check target for missing security headers
        
        Detection Logic:
        1. Send HTTP GET request to target
        2. Inspect response headers
        3. For each critical header:
           - IF header is missing → Flag vulnerability
           - IF header is present → No issue
        
        This is manual verification, not automated classification.
        """
        vulnerabilities = []
        
        try:
            # Step 1: Make HTTP request
            response = requests.get(target_url, timeout=10, allow_redirects=True)
            headers = response.headers
            
            # Step 2: Check each critical header
            for header_name, header_info in self.critical_headers.items():
                
                # Explicit condition: Is header missing?
                if header_name not in headers:
                    # This is the ONLY condition that triggers a finding
                    # No AI, no probabilistic detection - just presence/absence
                    
                    vulnerability = {
                        'category': 'Missing Security Header',
                        'severity': 'MEDIUM',  # Fixed severity (human-defined)
                        'title': f'Missing {header_name} Header',
                        'description': self._generate_description(header_name, header_info),
                        'evidence': {
                            'url': target_url,
                            'missing_header': header_name
                        },
                        'remediation': self._generate_remediation(header_name, header_info),
                        'references': [
                            'https://owasp.org/www-project-secure-headers/',
                            'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers'
                        ]
                    }
                    
                    vulnerabilities.append(vulnerability)
        
        except Exception as e:
            # If check fails, log but don't crash
            pass
        
        return vulnerabilities
    
    def _generate_description(self, header_name: str, header_info: Dict) -> str:
        """
        Generate human-readable vulnerability description
        
        This reads like a manual VAPT report, not AI-generated text.
        """
        return f"""
The target application is missing the {header_name} HTTP security header.

What this means:
{header_info['purpose']}

Risk:
Without this header, the application is more vulnerable to attacks that this 
header is designed to prevent. While this alone may not be exploitable, it 
represents a security hardening gap that should be addressed.

How we detected this:
We sent an HTTP request to {header_name} and inspected the response headers. 
The {header_name} header was not present in the response.
        """.strip()
    
    def _generate_remediation(self, header_name: str, header_info: Dict) -> str:
        """
        Generate clear remediation guidance
        
        This is written like a security consultant would explain it.
        """
        return f"""
Remediation Steps:
1. Configure your web server to include the {header_name} header
2. {header_info['fix']}

Example Configuration:
{header_info['example']}

Server-Specific Guidance:
- Apache: Use Headers directive in .htaccess or httpd.conf
- Nginx: Use add_header directive in nginx.conf
- Express.js: Use helmet middleware
- Flask: Use Flask-Talisman

Verification:
After implementing, verify the header is present using browser DevTools 
or command: curl -I [your-url]
        """.strip()
