"""
Information Disclosure Detection

Purpose: Detect sensitive information leakage
Method: Professional reconnaissance and enumeration technique

Information disclosure vulnerabilities expose:
- Server version and technology details
- Internal paths and file structures
- Stack traces and debugging information
- API keys and tokens in responses

These are commonly found by penetration testers during reconnaissance.
"""

import requests
import re
from typing import List, Dict, Any


class InformationDisclosureCheck:
    """
    Detect information disclosure vulnerabilities
    
    Professional pentesting approach:
    1. Check response headers for version information
    2. Analyze error pages for stack traces
    3. Search for exposed secrets in HTML/JS
    4. Detect verbose error messages
    
    This mimics manual OSINT and reconnaissance.
    """
    
    def __init__(self):
        # Sensitive header patterns (reveal too much info)
        self.sensitive_headers = {
            'Server': 'Server version disclosure',
            'X-Powered-By': 'Technology stack disclosure',
            'X-AspNet-Version': 'ASP.NET version disclosure',
            'X-AspNetMvc-Version': 'ASP.NET MVC version disclosure',
        }
        
        # Patterns for exposed secrets
        self.secret_patterns = {
            'api_key': r'api[_-]?key[\"\']?\s*[:=]\s*[\"\']([a-zA-Z0-9_\-]{20,})',
            'aws_key': r'AKIA[0-9A-Z]{16}',
            'private_key': r'-----BEGIN (RSA |EC |DSA )?PRIVATE KEY-----',
            'jwt': r'eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+',
            'password': r'password[\"\']?\s*[:=]\s*[\"\']([^\"\']{4,})',
        }
    
    def check(self, target_url: str, **kwargs) -> List[Dict[str, Any]]:
        """
        Check for information disclosure
        
        Professional methodology:
        1. Fingerprint server technology
        2. Scan for exposed secrets
        3. Check error handling
        4. Analyze comments and debug info
        """
        vulnerabilities = []
        
        try:
            response = requests.get(target_url, timeout=10)
            
            # Check 1: Server fingerprinting
            header_vulns = self._check_headers(response, target_url)
            vulnerabilities.extend(header_vulns)
            
            # Check 2: Search for exposed secrets
            secret_vulns = self._check_secrets(response, target_url)
            vulnerabilities.extend(secret_vulns)
            
            # Check 3: Verbose error checking (try to trigger error)
            error_vulns = self._check_error_disclosure(target_url)
            vulnerabilities.extend(error_vulns)
        
        except Exception:
            pass
        
        return vulnerabilities
    
    def _check_headers(self, response, url: str) -> List[Dict]:
        """
        Check for information disclosure in HTTP headers
        
        Professional technique:
        Server headers revealing versions help attackers find exploits
        """
        vulnerabilities = []
        
        for header, description in self.sensitive_headers.items():
            if header in response.headers:
                header_value = response.headers[header]
                
                # Only flag if it contains version/technology info
                if any(char.isdigit() for char in header_value) or any(tech in header_value.lower() for tech in ['php', 'apache', 'nginx', 'iis', 'express']):
                    vulnerabilities.append({
                        'category': 'Information Disclosure',
                        'severity': 'LOW',
                        'title': f'Server Information Disclosure: {header}',
                        'description': f"""
Information disclosure was detected in HTTP headers.

What this is:
The server reveals technology and version information that helps attackers.

Security Risk:
Attackers can:
- Identify specific server software and versions
- Search for known vulnerabilities in those versions
- Tailor attacks to the specific technology stack

How we detected this:
Header: {header}
Value: {header_value}

Why this is dangerous:
Public version information allows attackers to:
1. Find CVEs (Common Vulnerabilities) for your software
2. Use automated exploit tools
3. Reduce reconnaissance time

Detection Method:
Standard HTTP header analysis used by penetration testers.
                        """.strip(),
                        'evidence': {
                            'url': url,
                            'header': header,
                            'value': header_value,
                            'risk': description
                        },
                        'remediation': self._generate_header_remediation(header),
                        'references': [
                            'https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/01-Information_Gathering/02-Fingerprint_Web_Server'
                        ]
                    })
        
        return vulnerabilities
    
    def _check_secrets(self, response, url: str) -> List[Dict]:
        """
        Search for exposed secrets in response
        
        Professional technique:
        Developers accidentally commit API keys, tokens, passwords
        """
        vulnerabilities = []
        content = response.text
        
        for secret_type, pattern in self.secret_patterns.items():
            matches = re.findall(pattern, content, re.IGNORECASE)
            
            if matches:
                # Found exposed secret!
                sample = matches[0] if isinstance(matches[0], str) else matches[0][0]
                # Redact most of it for security
                redacted = sample[:8] + '*' * (len(sample) - 8)
                
                vulnerabilities.append({
                    'category': 'Sensitive Data Exposure',
                    'severity': 'HIGH',
                    'title': f'Exposed Secret: {secret_type.upper()}',
                    'description': f"""
CRITICAL: Exposed secret detected in application response!

What this is:
A {secret_type.replace('_', ' ')} is publicly visible in the HTML/JavaScript code.

Security Risk:
CRITICAL - This exposes:
- Authentication credentials
- API access tokens
- Encryption keys
- Database passwords

How we detected this:
1. Analyzed response content
2. Found pattern matching {secret_type}
3. Secret sample (redacted): {redacted}...

Why this is dangerous:
Exposed secrets can lead to:
- Unauthorized API access
- Account takeover
- Data breaches
- Financial loss
- Complete system compromise

This is a critical security incident that needs immediate action.

Detection Method:
Pattern matching for common secret formats, used by security researchers and automated scanners.
                    """.strip(),
                    'evidence': {
                        'url': url,
                        'secret_type': secret_type,
                        'pattern': pattern,
                        'sample_redacted': redacted,
                        'occurrences': len(matches)
                    },
                    'remediation': self._generate_secret_remediation(secret_type),
                    'references': [
                        'https://owasp.org/www-community/vulnerabilities/Use_of_hard-coded_password',
                        'https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html'
                    ]
                })
        
        return vulnerabilities
    
    def _check_error_disclosure(self, url: str) -> List[Dict]:
        """
        Test for verbose error messages
        
        Professional technique:
        Trigger errors by requesting non-existent resources
        """
        vulnerabilities = []
        
        try:
            # Request a non-existent path to trigger error
            test_url = url.rstrip('/') + '/this-path-definitely-does-not-exist-test-12345'
            response = requests.get(test_url, timeout=10)
            
            content_lower = response.text.lower()
            
            # Check for stack traces or detailed errors
            error_indicators = [
                ('stack trace', 'Full stack trace visible'),
                ('traceback', 'Python traceback visible'),
                ('exception', 'Detailed exception message'),
                ('warning:', 'PHP warning messages'),
                ('error in', 'Detailed error message'),
                ('at line', 'File path and line number exposed'),
            ]
            
            found_indicators = []
            for indicator, description in error_indicators:
                if indicator in content_lower:
                    found_indicators.append(description)
            
            if len(found_indicators) >= 2:  # Multiple indicators = likely verbose errors
                vulnerabilities.append({
                    'category': 'Information Disclosure',
                    'severity': 'MEDIUM',
                    'title': 'Verbose Error Messages',
                    'description': f"""
Detailed error messages are exposed to users.

What this is:
The application shows detailed technical errors including:
- {', '.join(found_indicators[:3])}

Security Risk:
Attackers can learn:
- Internal file paths and structure
- Technology stack details
- Code logic and flow
- Database structure

How we detected this:
1. Requested a non-existent path
2. Server returned detailed error with technical information
3. Found indicators: {', '.join(found_indicators)}

Why this is dangerous:
Verbose errors help attackers:
- Map the application structure
- Find injection points
- Understand the codebase
- Craft targeted attacks

Detection Method:
Error page analysis, standard penetration testing technique.
                    """.strip(),
                    'evidence': {
                        'test_url': test_url,
                        'indicators_found': found_indicators,
                        'status_code': response.status_code
                    },
                    'remediation': """
Remediation Steps:

1. DISABLE DEBUG MODE IN PRODUCTION
   - Set DEBUG=False (Python/Django)
   - Set NODE_ENV=production (Node.js)
   - Disable display_errors (PHP)

2. IMPLEMENT CUSTOM ERROR PAGES
   - Create generic error pages
   - Don't expose stack traces
   - Log errors server-side only

3. EXAMPLE CONFIGURATIONS

Python/Flask:
```python
app.config['DEBUG'] = False
app.config['PROPAGATE_EXCEPTIONS'] = False

@app.errorhandler(Exception)
def handle_error(e):
    # Log the full error
    app.logger.error(f'Error: {e}')
    # Return generic message
    return 'An error occurred', 500
```

Node.js/Express:
```javascript
if (process.env.NODE_ENV === 'production') {
  app.use((err, req, res, next) => {
    console.error(err); // Log server-side
    res.status(500).send('Something went wrong');
  });
}
```

4. BEST PRACTICES
   - Never show stack traces to users
   - Log all errors server-side
   - Use error tracking (Sentry, Rollbar)
   - Return generic error messages
   - Monitor error rates

5. VERIFICATION
   - Test error pages in production mode
   - Verify no technical details are visible
   - Check logs capture full errors
                    """.strip(),
                    'references': [
                        'https://owasp.org/www-community/Improper_Error_Handling',
                        'https://cheatsheetseries.owasp.org/cheatsheets/Error_Handling_Cheat_Sheet.html'
                    ]
                })
        
        except Exception:
            pass
        
        return vulnerabilities
    
    def _generate_header_remediation(self, header: str) -> str:
        return f"""
Remediation Steps:

1. REMOVE OR OBFUSCATE HEADER
   Configure your web server to hide version information

2. SERVER-SPECIFIC CONFIGURATION

Apache (.htaccess or httpd.conf):
```apache
ServerTokens Prod
ServerSignature Off
Header unset {header}
```

Nginx (nginx.conf):
```nginx
server_tokens off;
more_clear_headers '{header}';
```

Express.js (Node):
```javascript
app.disable('x-powered-by');
```

Flask (Python):
```python
@app.after_request
def remove_header(response):
    response.headers.pop('{header}', None)
    return response
```

3. VERIFICATION
   - Check headers with: curl -I https://yoursite.com
   - Verify {header} is not present
   - Test with online tools

4. BEST PRACTICES
   - Minimize information disclosure
   - Use security headers
   - Regular security audits
        """.strip()
    
    def _generate_secret_remediation(self, secret_type: str) -> str:
        return f"""
URGENT REMEDIATION REQUIRED:

1. IMMEDIATE ACTION (Within 1 Hour)
   ⚠️  ROTATE THE EXPOSED {secret_type.upper()} IMMEDIATELY
   ⚠️  Revoke the old secret from your provider
   ⚠️  Generate new secret
   ⚠️  Update application with new secret

2. REMOVE FROM CODE
   - Delete hardcoded secret from source code
   - Remove from version control history (git filter-branch)
   - Check all branches and commits

3. USE ENVIRONMENT VARIABLES
   ```bash
   # .env (NOT committed to git)
   {secret_type.upper()}=your-secret-here
   ```

   ```python
   # Python
   import os
   secret = os.getenv('{secret_type.upper()}')
   ```

   ```javascript
   // Node.js
   const secret = process.env.{secret_type.upper()};
   ```

4. SECRET MANAGEMENT BEST PRACTICES
   - Use secret management tools (AWS Secrets Manager, Vault)
   - Never commit secrets to git
   - Add .env to .gitignore
   - Use different secrets for dev/prod
   - Rotate secrets regularly

5. AUDIT AND MONITOR
   - Check git history for exposed secrets
   - Review all repositories
   - Monitor API usage for suspicious activity
   - Set up alerts for unauthorized access

6. PREVENT FUTURE EXPOSURE
   - Use git pre-commit hooks (detect-secrets)
   - Implement code review process
   - Use .gitignore for sensitive files
   - Educate team on secret management
        """.strip()
