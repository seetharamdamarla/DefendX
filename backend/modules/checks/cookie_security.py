"""
Cookie Security Check

Purpose: Detect insecure cookie configurations
Logic: Inspect cookies for missing security flags

Why this matters:
Cookies often contain session tokens. Missing security flags
can lead to session hijacking and other attacks.

Detection Method: Cookie flag inspection
Risk Level: MEDIUM (session security issue)
"""

import requests
from typing import List, Dict, Any
from http.cookies import SimpleCookie


class CookieSecurityCheck:
    """
    Check for insecure cookie configurations
    
    Detection Rules (EXPLICIT):
    For each cookie:
    - IF HttpOnly flag is missing → Vulnerability
    - IF Secure flag is missing (on HTTPS) → Vulnerability
    - IF SameSite is not set → Vulnerability
    
    This is straightforward flag checking, no AI involved.
    """
    
    def __init__(self):
        # Define security flags that SHOULD be present
        # Justification: These flags are security best practices (OWASP)
        self.required_flags = {
            'HttpOnly': {
                'purpose': 'Prevents JavaScript access to cookies',
                'risk': 'Cookies can be stolen via XSS attacks',
                'severity': 'MEDIUM'
            },
            'Secure': {
                'purpose': 'Ensures cookies are only sent over HTTPS',
                'risk': 'Cookies can be intercepted over insecure connections',
                'severity': 'MEDIUM'
            },
            'SameSite': {
                'purpose': 'Prevents CSRF attacks',
                'risk': 'Cookies may be sent in cross-site requests',
                'severity': 'LOW'
            }
        }
    
    def check(self, target_url: str, **kwargs) -> List[Dict[str, Any]]:
        """
        Check cookies for missing security flags
        """
        vulnerabilities = []
        
        try:
            response = requests.get(target_url, timeout=10, allow_redirects=True)
            
            # Step 1: Extract Set-Cookie headers
            if 'Set-Cookie' in response.headers:
                # Handle single or multiple headers
                if isinstance(response.headers['Set-Cookie'], list):
                    headers = response.headers['Set-Cookie']
                else:
                    # Requests merges multiple headers with comma, which breaks cookie parsing
                    # We need to rely on the raw headers or split carefully
                    # For simplicity, we use the `cookies` object but check raw string if possible
                    headers = [response.headers['Set-Cookie']]
            else:
                headers = []
            
            # Use requests.cookies for easy iteration
            for cookie in response.cookies:
                # Ignore non-sensitive cookies (like language prefs, analytical ids that aren't session)
                if not self._is_sensitive_cookie(cookie.name):
                    continue
                    
                issues = []
                # Check HttpOnly
                # Note: requests.cookies doesn't easily expose HttpOnly attribute for received cookies
                # We often need to parse the headers manually for this.
                # So we rely on _analyze_set_cookie_header mostly
                pass 
            
            # CRITICAL: Analyze raw Set-Cookie headers for accurate flag detection
            # This is better than response.cookies object which sometimes hides flags
            raw_headers = response.raw.headers.getlist('Set-Cookie')
            for header in raw_headers:
                vulns = self._analyze_set_cookie_header(header, target_url)
                vulnerabilities.extend(vulns)
                
        except Exception:
            pass
        
        return vulnerabilities
    
    def _is_sensitive_cookie(self, name: str) -> bool:
        """Check if cookie likely contains sensitive session data"""
        name = name.lower()
        sensitive_keywords = ['sess', 'auth', 'token', 'id', 'uid', 'jwt', 'login', 'user', 'account', 'key']
        return any(keyword in name for keyword in sensitive_keywords)

    def _analyze_set_cookie_header(self, set_cookie_header: str, target_url: str) -> List[Dict[str, Any]]:
        """
        Analyze Set-Cookie header for missing flags
        """
        vulnerabilities = []
        
        try:
            # Parse the Set-Cookie header
            cookie = SimpleCookie()
            cookie.load(set_cookie_header)
            
            for key, morsel in cookie.items():
                if not self._is_sensitive_cookie(key):
                    continue
                    
                issues = []
                lower_header = set_cookie_header.lower()
                
                # Check HttpOnly
                if 'httponly' not in lower_header:
                    issues.append('HttpOnly')
                
                # Check Secure (only if HTTPS)
                if target_url.startswith('https://') and 'secure' not in lower_header:
                    issues.append('Secure')
                
                # Check SameSite
                if 'samesite' not in lower_header:
                    issues.append('SameSite')
                
                if issues:
                    vulnerability = {
                        'category': 'Insecure Cookie Configuration',
                        'severity': 'MEDIUM',
                        'title': f'Insecure Cookie: {key}',
                        'description': self._generate_description(key, issues),
                        'evidence': {
                            'cookie_name': key,
                            'missing_flags': issues,
                            'url': target_url,
                            'set_cookie_header': set_cookie_header
                        },
                        'remediation': self._generate_remediation(issues),
                        'references': ['https://owasp.org/www-community/controls/SecureCookieAttribute']
                    }
                    vulnerabilities.append(vulnerability)
        except Exception:
            pass
        
        return vulnerabilities
    
    def _generate_description(self, cookie_name: str, missing_flags: List[str]) -> str:
        """Generate human-readable description"""
        flags_str = ', '.join(missing_flags)
        
        descriptions = []
        for flag in missing_flags:
            if flag in self.required_flags:
                info = self.required_flags[flag]
                descriptions.append(f"- {flag}: {info['purpose']} | Risk: {info['risk']}")
        
        return f"""
The cookie '{cookie_name}' is missing the following security flags: {flags_str}

Security Impact:
{chr(10).join(descriptions)}

How we detected this:
1. We sent an HTTP request to the target
2. We inspected the Set-Cookie response headers
3. We parsed the cookie attributes
4. We verified that the following flags were missing: {flags_str}

Why this matters:
Cookie security flags are essential for protecting session tokens and
sensitive data stored in cookies. Without these flags:
- Session hijacking becomes easier
- Cross-site scripting (XSS) attacks can steal cookies
- Man-in-the-middle attacks can intercept cookies

This is a configuration issue that should be addressed.
        """.strip()
    
    def _generate_remediation(self, missing_flags: List[str]) -> str:
        """Generate remediation guidance"""
        remediation = """
Remediation Steps:

1. UPDATE COOKIE CONFIGURATION
   Set the following flags when creating cookies:
"""
        
        if 'HttpOnly' in missing_flags:
            remediation += """
   
   HttpOnly Flag:
   - Prevents JavaScript access to cookies
   - Essential for session cookies
   
   Example (Python/Flask):
   response.set_cookie('session', value, httponly=True)
   
   Example (Express.js):
   res.cookie('session', value, { httpOnly: true });
   
   Example (PHP):
   setcookie('session', $value, ['httponly' => true]);
"""
        
        if 'Secure' in missing_flags:
            remediation += """
   
   Secure Flag:
   - Ensures cookie is only sent over HTTPS
   - Critical for production environments
   
   Example (Python/Flask):
   response.set_cookie('session', value, secure=True)
   
   Example (Express.js):
   res.cookie('session', value, { secure: true });
   
   Example (PHP):
   setcookie('session', $value, ['secure' => true]);
"""
        
        if 'SameSite' in missing_flags:
            remediation += """
   
   SameSite Flag:
   - Prevents CSRF attacks
   - Recommended value: 'Lax' or 'Strict'
   
   Example (Python/Flask):
   response.set_cookie('session', value, samesite='Lax')
   
   Example (Express.js):
   res.cookie('session', value, { sameSite: 'lax' });
   
   Example (PHP):
   setcookie('session', $value, ['samesite' => 'Lax']);
"""
        
        remediation += """

2. FRAMEWORK-SPECIFIC CONFIGURATION
   
   Flask: Use Flask-Session with secure defaults
   Express: Use express-session with:
   {
     cookie: {
       secure: true,
       httpOnly: true,
       sameSite: 'lax'
     }
   }

3. VERIFICATION
   After fixing, verify using browser DevTools:
   - Open DevTools → Application → Cookies
   - Check that security flags are present
   - Or use: curl -I [url] and inspect Set-Cookie headers

4. PRODUCTION CHECKLIST
   ✓ All cookies have HttpOnly (except where JS access is required)
   ✓ All cookies have Secure flag (HTTPS only)
   ✓ Session cookies have SameSite attribute
        """.strip()
        
        return remediation
