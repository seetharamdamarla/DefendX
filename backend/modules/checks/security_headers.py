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
    
    Professional methodology:
    - Inspects HTTP response headers
    - Identifies missing critical security controls
    - Provides actionable remediation for specific servers
    """
    
    def __init__(self):
        # Define critical security headers
        self.critical_headers = {
            'Content-Security-Policy': {
                'purpose': 'Prevents Cross-Site Scripting (XSS), injection attacks, and data theft.',
                'risk': 'High risk of XSS and content injection attacks.',
                'example': "default-src 'self';"
            },
            'X-Frame-Options': {
                'purpose': 'Prevents Clickjacking attacks by controlling iframe embedding.',
                'risk': 'Attackers can overlay invisible frames to trick users into clicking buttons.',
                'example': 'DENY'
            },
            'Strict-Transport-Security': {
                'purpose': 'Enforces secure HTTPS connections and prevents downgrade attacks.',
                'risk': 'Man-in-the-Middle (MitM) attacks can strip SSL/TLS protection.',
                'example': 'max-age=31536000; includeSubDomains'
            },
            'X-Content-Type-Options': {
                'purpose': 'Prevents MIME-type sniffing (interpreting files as different types).',
                'risk': 'Browsers may execute non-executable files as scripts (e.g., images as JS).',
                'example': 'nosniff'
            },
            'Referrer-Policy': {
                'purpose': 'Controls how much referrer information is leaked to other sites.',
                'risk': 'Sensitive data in URLs (tokens, IDs) may be leaked to third-party sites.',
                'example': 'strict-origin-when-cross-origin'
            },
            'Permissions-Policy': {
                'purpose': 'Controls which browser features (camera, mic, geo) can be used.',
                'risk': 'Unrestricted access to sensitive browser features.',
                'example': 'geolocation=(), camera=()'
            }
        }
    
    def check(self, target_url: str, **kwargs) -> List[Dict[str, Any]]:
        """
        Check target for missing security headers
        """
        vulnerabilities = []
        
        try:
            # Step 1: Make HTTP request
            response = requests.get(target_url, timeout=10, allow_redirects=True)
            headers = {k.lower(): v for k, v in response.headers.items()}
            
            # Step 2: Check each critical header
            for header_name, header_info in self.critical_headers.items():
                
                # Special case for HSTS: Only relevant for HTTPS
                if header_name == 'Strict-Transport-Security' and not target_url.startswith('https://'):
                    continue
                
                # Check if header is missing
                if header_name.lower() not in headers:
                    vulnerability = {
                        'category': 'Missing Security Header',
                        'severity': 'LOW' if header_name == 'Referrer-Policy' else 'MEDIUM',
                        'title': f'Missing Security Header: {header_name}',
                        'description': self._generate_description(header_name, header_info, target_url),
                        'evidence': {
                            'url': target_url,
                            'missing_header': header_name,
                            'status_code': response.status_code,
                            'present_headers_count': len(headers)
                        },
                        'remediation': self._generate_remediation(header_name, header_info),
                        'references': [
                            'https://owasp.org/www-project-secure-headers/',
                            'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/' + header_name
                        ]
                    }
                    vulnerabilities.append(vulnerability)
        
        except Exception:
            pass
        
        return vulnerabilities
    
    def _generate_description(self, header_name: str, header_info: Dict, url: str) -> str:
        """Generate professional description"""
        return f"""
The {header_name} security header is missing from the server response.

What this is:
{header_info['purpose']}

Security Risk:
{header_info['risk']}

How we detected this:
1. We sent a request to: {url}
2. We inspected the HTTP response headers
3. The '{header_name}' header was not found

Why this is dangerous:
Security headers are a fundamental defense layer. Missing them allows browsers to engage in unsafe behaviors (like sniffing content types or allowing framing) that attackers can exploit.

Detection Method:
Standard HTTP header analysis.
        """.strip()
    
    def _generate_remediation(self, header_name: str, header_info: Dict) -> str:
        """Generate remediation guidance"""
        return f"""
Remediation Steps:

1. CONFIGURE WEB SERVER
   Add the missing header to your web server configuration.

2. EXPECTED VALUE
   Header: {header_name}
   Value: {header_info['example']}

3. SERVER-SPECIFIC EXAMPLES

   Nginx (nginx.conf):
   ```nginx
   add_header {header_name} "{header_info['example']}" always;
   ```

   Apache (.htaccess):
   ```apache
   Header set {header_name} "{header_info['example']}"
   ```

   Express.js (Node.js):
   ```javascript
   app.use((req, res, next) => {{
     res.setHeader('{header_name}', "{header_info['example']}");
     next();
   }});
   // OR use Helmet: app.use(helmet());
   ```

   Python (Flask):
   ```python
   @app.after_request
   def add_security_headers(response):
       response.headers['{header_name}'] = "{header_info['example']}"
       return response
   ```
        """.strip()
