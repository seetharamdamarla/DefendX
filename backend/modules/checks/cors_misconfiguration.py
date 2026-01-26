"""
CORS Misconfiguration Detection

Purpose: Detect Cross-Origin Resource Sharing (CORS) security issues
Method: Professional API security testing technique

CORS Misconfigurations allow malicious websites to:
- Read sensitive data from APIs
- Bypass Same-Origin Policy protections
- Steal user data through cross-site requests

This check mimics how professional API security testers validate CORS policies.
"""

import requests
from typing import List, Dict, Any


class CORSMisconfigurationCheck:
    """
    Professional CORS security analysis
    
    Detects common CORS misconfigurations:
    1. Wildcard (*) allow-origin with credentials
    2. Null origin acceptance
    3. Reflected origin (allows any origin)
    4. Overly permissive configurations
    
    Used by professional pentesters and API security tools.
    """
    
    def __init__(self):
        # Test origins to check CORS behavior
        self.test_origins = [
            'https://evil.com',           # Malicious site
            'null',                        # Null origin (dangerous)
            'https://attacker.com',       # Another malicious domain
        ]
    
    def check(self, target_url: str, **kwargs) -> List[Dict[str, Any]]:
        """
        Test CORS configuration
        
        Professional methodology:
        1. Send requests with different Origin headers
        2. Check Access-Control-Allow-Origin response
        3. Check if credentials are allowed
        4. Identify dangerous configurations
        """
        vulnerabilities = []
        
        try:
            # Test 1: Check for reflected origin vulnerability
            for test_origin in self.test_origins:
                vuln = self._test_reflected_origin(target_url, test_origin)
                if vuln:
                    vulnerabilities.append(vuln)
                    break  # One finding is enough
            
            # Test 2: Check for wildcard with credentials
            wildcard_vuln = self._test_wildcard_credentials(target_url)
            if wildcard_vuln:
                vulnerabilities.append(wildcard_vuln)
        
        except Exception:
            pass
        
        return vulnerabilities
    
    def _test_reflected_origin(self, url: str, origin: str) -> Dict:
        """
        Test for reflected origin vulnerability
        
        Professional technique:
        - Send request with evil Origin header
        - If server reflects it back → Misconfiguration
        - If credentials allowed → CRITICAL vulnerability
        """
        try:
            headers = {'Origin': origin}
            response = requests.get(url, headers=headers, timeout=10)
            
            cors_origin = response.headers.get('Access-Control-Allow-Origin', '')
            cors_credentials = response.headers.get('Access-Control-Allow-Credentials', '').lower()
            
            # CRITICAL: Server reflects any origin AND allows credentials
            if cors_origin == origin and cors_credentials == 'true':
                return {
                    'category': 'Security Misconfiguration',
                    'severity': 'HIGH',
                    'title': 'Critical CORS Misconfiguration: Reflected Origin with Credentials',
                    'description': self._generate_description(origin, cors_origin, cors_credentials),
                    'evidence': {
                        'url': url,
                        'test_origin': origin,
                        'cors_allow_origin': cors_origin,
                        'cors_allow_credentials': cors_credentials,
                        'impact': 'Any malicious website can read sensitive data'
                    },
                    'remediation': self._generate_remediation(),
                    'references': [
                        'https://portswigger.net/web-security/cors',
                        'https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS'
                    ]
                }
            
            # HIGH: Server accepts null origin with credentials
            if origin == 'null' and cors_origin == 'null' and cors_credentials == 'true':
                return {
                    'category': 'Security Misconfiguration',
                    'severity': 'HIGH',
                    'title': 'CORS Misconfiguration: Null Origin Accepted',
                    'description': f"""
A dangerous CORS misconfiguration was detected.

What this is:
The server accepts requests from the 'null' origin and allows credentials.

Security Risk:
Attackers can exploit this to steal sensitive data by:
1. Creating a sandboxed iframe
2. Making authenticated requests from null origin
3. Reading the responses containing user data

How we detected this:
1. Sent request with Origin: null
2. Server responded with Access-Control-Allow-Origin: null
3. Server allows credentials (Access-Control-Allow-Credentials: true)

This is a critical API security flaw.
                    """.strip(),
                    'evidence': {
                        'url': url,
                        'cors_allow_origin': 'null',
                        'cors_allow_credentials': 'true'
                    },
                    'remediation': self._generate_remediation(),
                    'references': [
                        'https://portswigger.net/web-security/cors',
                        'https://www.we45.com/post/3-ways-to-exploit-misconfigured-cross-origin-resource-sharing-cors'
                    ]
                }
        
        except Exception:
            pass
        
        return None
    
    def _test_wildcard_credentials(self, url: str) -> Dict:
        """
        Test for wildcard origin with credentials
        
        Professional check:
        Access-Control-Allow-Origin: *
        WITH
        Access-Control-Allow-Credentials: true
        = DANGEROUS (browsers block this, but shows misconfiguration)
        """
        try:
            response = requests.get(url, timeout=10)
            
            cors_origin = response.headers.get('Access-Control-Allow-Origin', '')
            cors_credentials = response.headers.get('Access-Control-Allow-Credentials', '').lower()
            
            # Wildcard with credentials (browsers reject, but still a config issue)
            if cors_origin == '*' and cors_credentials == 'true':
                return {
                    'category': 'Security Misconfiguration',
                    'severity': 'MEDIUM',
                    'title': 'CORS Misconfiguration: Wildcard with Credentials',
                    'description': """
A CORS configuration error was detected.

What this is:
The server attempts to allow all origins (*) while also allowing credentials.

Security Risk:
While modern browsers block this combination, it indicates:
- Misconfigured CORS policy
- Potential security oversight
- May work in older browsers or non-browser clients

How we detected this:
Checked response headers:
- Access-Control-Allow-Origin: *
- Access-Control-Allow-Credentials: true

This combination is invalid but reveals security misconfiguration.
                    """.strip(),
                    'evidence': {
                        'url': url,
                        'cors_allow_origin': '*',
                        'cors_allow_credentials': 'true',
                        'note': 'Browsers block this, but shows misconfiguration'
                    },
                    'remediation': self._generate_remediation(),
                    'references': [
                        'https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS/Errors/CORSNotSupportingCredentials'
                    ]
                }
        
        except Exception:
            pass
        
        return None
    
    def _generate_description(self, test_origin: str, cors_origin: str, credentials: str) -> str:
        return f"""
A critical CORS misconfiguration was detected that allows data theft.

What this is:
Cross-Origin Resource Sharing (CORS) controls which websites can access your API.
Your server is configured to accept requests from ANY origin, including malicious ones.

Security Risk:
CRITICAL - Attackers can:
- Create a malicious website (e.g., evil.com)
- Make authenticated requests to your API
- Read sensitive user data
- Steal tokens, personal information, or business data

How we detected this:
1. We sent a request with Origin: {test_origin}
2. Server responded with Access-Control-Allow-Origin: {cors_origin}
3. Server allows credentials: {credentials}
4. This means ANY website can read your API responses

Real-World Impact:
An attacker creates a malicious site and tricks users into visiting it.
The malicious site can then:
1. Read user's private data from your API
2. Perform actions on behalf of the user
3. Steal authentication tokens

Detection Method:
This was found using professional API security testing techniques used by security researchers worldwide.
        """.strip()
    
    def _generate_remediation(self) -> str:
        return """
Remediation Steps:

1. IMMEDIATE ACTION
   - Review all CORS configurations
   - Identify APIs that need cross-origin access
   - Restrict Access-Control-Allow-Origin immediately

2. SECURE CORS CONFIGURATION

❌ INSECURE:
```javascript
// Reflects any origin
res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
res.setHeader('Access-Control-Allow-Credentials', 'true');
```

✅ SECURE (Whitelist Approach):
```javascript
const allowedOrigins = [
  'https://yourdomain.com',
  'https://app.yourdomain.com'
];

const origin = req.headers.origin;
if (allowedOrigins.includes(origin)) {
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}
```

3. BEST PRACTICES
   - Only allow specific, trusted origins
   - Never reflect arbitrary origins with credentials
   - Avoid 'null' origin acceptance
   - Don't use wildcards with credentials
   - Implement proper authentication checks

4. FRAMEWORK-SPECIFIC EXAMPLES

Express.js (Node):
```javascript
const cors = require('cors');
app.use(cors({
  origin: 'https://yourdomain.com',
  credentials: true
}));
```

Flask (Python):
```python
from flask_cors import CORS
CORS(app, origins=['https://yourdomain.com'], supports_credentials=True)
```

5. VERIFICATION
   - Test with browser developer tools
   - Check CORS headers in response
   - Verify only allowed origins return proper headers
   - Test with security tools like Burp Suite

6. ADDITIONAL SECURITY
   - Implement proper authentication
   - Use CSRF tokens
   - Validate requests server-side
   - Monitor for unusual cross-origin requests
        """.strip()
