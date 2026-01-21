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
        
        Detection Process:
        1. Send HTTP request to target
        2. Extract Set-Cookie headers
        3. Parse cookie attributes
        4. Check for missing security flags
        5. Flag each missing flag as a vulnerability
        
        Explicit conditions only.
        """
        vulnerabilities = []
        
        try:
            # Step 1: Make request
            response = requests.get(target_url, timeout=10, allow_redirects=True)
            
            # Step 2: Extract cookies from response headers
            # Cookies can be in multiple Set-Cookie headers
            set_cookie_headers = response.headers.get_list('Set-Cookie') if hasattr(response.headers, 'get_list') else [response.headers.get('Set-Cookie')]
            
            # Also check cookies from session
            cookies = response.cookies
            
            if not cookies and not any(set_cookie_headers):
                # No cookies found - nothing to check
                return vulnerabilities
            
            # Step 3: Analyze each cookie
            for cookie in cookies:
                cookie_name = cookie.name
                cookie_value = cookie.value
                
                # Check each security flag
                issues = []
                
                # Check HttpOnly flag
                # Rule: If httponly is False, it's a vulnerability
                if not cookie.has_nonstandard_attr('HttpOnly') and not hasattr(cookie, '_rest') or not getattr(cookie, 'has_nonstandard_attr', lambda x: False)('HttpOnly'):
                    # The cookie does not have HttpOnly flag
                    issues.append('HttpOnly')
                
                # Check Secure flag (important for HTTPS sites)
                if not cookie.secure and target_url.startswith('https://'):
                    issues.append('Secure')
                
                # Create vulnerability for this cookie if issues found
                if issues:
                    vulnerability = {
                        'category': 'Insecure Cookie Configuration',
                        'severity': 'MEDIUM',
                        'title': f'Insecure Cookie: {cookie_name}',
                        'description': self._generate_description(cookie_name, issues),
                        'evidence': {
                            'cookie_name': cookie_name,
                            'missing_flags': issues,
                            'url': target_url
                        },
                        'remediation': self._generate_remediation(issues),
                        'references': [
                            'https://owasp.org/www-community/controls/SecureCookieAttribute',
                            'https://owasp.org/www-community/HttpOnly'
                        ]
                    }
                    vulnerabilities.append(vulnerability)
            
            # Also check Set-Cookie headers directly for more accurate parsing
            for set_cookie_header in set_cookie_headers:
                if set_cookie_header:
                    vulns = self._analyze_set_cookie_header(set_cookie_header, target_url)
                    vulnerabilities.extend(vulns)
        
        except Exception as e:
            # Silently continue if check fails
            pass
        
        return vulnerabilities
    
    def _analyze_set_cookie_header(self, set_cookie_header: str, target_url: str) -> List[Dict[str, Any]]:
        """
        Analyze Set-Cookie header for missing flags
        
        More reliable parsing of cookie attributes
        """
        vulnerabilities = []
        
        try:
            # Parse the Set-Cookie header
            cookie = SimpleCookie()
            cookie.load(set_cookie_header)
            
            for key, morsel in cookie.items():
                issues = []
                
                # Check HttpOnly
                # Explicit condition: 'httponly' not in cookie string (case insensitive)
                if 'httponly' not in set_cookie_header.lower():
                    issues.append('HttpOnly')
                
                # Check Secure
                if 'secure' not in set_cookie_header.lower() and target_url.startswith('https://'):
                    issues.append('Secure')
                
                # Check SameSite
                if 'samesite' not in set_cookie_header.lower():
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
                        'references': [
                            'https://owasp.org/www-community/controls/SecureCookieAttribute'
                        ]
                    }
                    vulnerabilities.append(vulnerability)
        
        except Exception as e:
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
