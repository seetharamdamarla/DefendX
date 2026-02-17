"""
XSS Reflection Check

Purpose: Detect reflected XSS vulnerabilities
Logic: Inject safe test payloads and check if they're reflected unescaped

ETHICAL CONSTRAINTS:
- Uses HARMLESS test strings only
- DOES NOT execute JavaScript
- DOES NOT exploit the vulnerability
- Only detects reflection, does not weaponize

Detection Method: Safe payload reflection analysis
Risk Level: HIGH (potentially exploitable)
"""

import requests
from urllib.parse import urljoin, parse_qs, urlparse, urlencode
from typing import List, Dict, Any
from bs4 import BeautifulSoup


class XSSReflectionCheck:
    """
    Check for reflected XSS vulnerabilities
    
    Approach:
    1. Inject harmless test strings containing special characters into URL parameters and forms
    2. Check if the string is reflected in the response
    3. Check if the special characters are properly escaped
    4. Report only if unescaped reflection of special characters is found
    
    This is CONSERVATIVE and ETHICAL:
    - No harmful payloads
    - No JavaScript execution
    - Only detection, no exploitation
    """
    
    def __init__(self):
        # Test payloads: These must contain special characters to test escaping
        # They are unique strings that help us track reflection
        # They do NOT execute code or cause harm
        
        self.test_payloads = [
            '<XSS_TEST>',             # Basic tag injection
            '"><XSS_TEST>',           # Break out of attribute
            '\'><XSS_TEST>',          # Break out of attribute (single quote)
            ';XSS_TEST//',            # JavaScript context
        ]
    
    def check(self, target_url: str, discovered_urls: List[str] = None, 
              discovered_forms: List[Dict] = None, **kwargs) -> List[Dict[str, Any]]:
        """
        Check for XSS reflection vulnerabilities
        """
        vulnerabilities = []
        
        # Test URL parameters
        if discovered_urls:
            # Deduplicate URLs based on query params to avoid redundant checks
            tested_params = set()
            for url in discovered_urls:
                parsed = urlparse(url)
                if not parsed.query:
                    continue
                
                params = parse_qs(parsed.query)
                # Create a signature for this URL's parameters
                param_sig = f"{parsed.netloc}{parsed.path}?{sorted(params.keys())}"
                
                if param_sig in tested_params:
                    continue
                tested_params.add(param_sig)
                
                vulns = self._test_url_parameters(url)
                vulnerabilities.extend(vulns)
                
                if len(vulnerabilities) > 10: # Safety limit
                    break
        
        # Test forms
        if discovered_forms:
            for form in discovered_forms[:5]:  # Limit to first 5 forms
                vulns = self._test_form_inputs(target_url, form)
                vulnerabilities.extend(vulns)
        
        return vulnerabilities
    
    def _test_url_parameters(self, url: str) -> List[Dict[str, Any]]:
        vulnerabilities = []
        
        try:
            parsed = urlparse(url)
            params = parse_qs(parsed.query)
            
            if not params:
                return vulnerabilities
            
            for param_name in params.keys():
                for payload in self.test_payloads:
                    test_params = params.copy()
                    test_params[param_name] = [payload]
                    
                    test_query = urlencode(test_params, doseq=True)
                    test_url = f"{parsed.scheme}://{parsed.netloc}{parsed.path}?{test_query}"
                    
                    try:
                        response = requests.get(test_url, timeout=10)
                        
                        # Only check for XSS in HTML responses
                        content_type = response.headers.get('Content-Type', '').lower()
                        if 'text/html' not in content_type:
                            continue
                        
                        if self._is_reflected_unescaped(response.text, payload):
                            vulnerability = {
                                'category': 'Reflected XSS',
                                'severity': 'HIGH',
                                'title': f'Reflected XSS in URL Parameter: {param_name}',
                                'description': self._generate_xss_description(param_name, payload, 'URL parameter', test_url),
                                'evidence': {
                                    'url': test_url,
                                    'parameter': param_name,
                                    'payload': payload,
                                    'reflection_found': True
                                },
                                'remediation': self._generate_xss_remediation(),
                                'references': [
                                    'https://owasp.org/www-community/attacks/xss/',
                                    'https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html'
                                ]
                            }
                            vulnerabilities.append(vulnerability)
                            break
                    except requests.RequestException:
                        continue
        
        except Exception:
            pass
        
        return vulnerabilities
    
    def _test_form_inputs(self, base_url: str, form: Dict) -> List[Dict[str, Any]]:
        vulnerabilities = []
        
        try:
            method = form.get('method', 'GET')
            action = form.get('action', '')
            inputs = form.get('inputs', [])
            
            if not inputs:
                return vulnerabilities
            
            form_url = urljoin(base_url, action) if action else base_url
            
            for input_field in inputs:
                input_name = input_field.get('name', '')
                if not input_name:
                    continue
                
                for payload in self.test_payloads:
                    form_data = {input_name: payload}
                    
                    try:
                        if method.upper() == 'POST':
                            response = requests.post(form_url, data=form_data, timeout=10)
                        else:
                            response = requests.get(form_url, params=form_data, timeout=10)
                        
                        content_type = response.headers.get('Content-Type', '').lower()
                        if 'text/html' not in content_type:
                            continue
                        
                        if self._is_reflected_unescaped(response.text, payload):
                            vulnerability = {
                                'category': 'Reflected XSS',
                                'severity': 'HIGH',
                                'title': f'Reflected XSS in Form Input: {input_name}',
                                'description': self._generate_xss_description(input_name, payload, 'form input', form_url),
                                'evidence': {
                                    'url': form_url,
                                    'form_field': input_name,
                                    'payload': payload,
                                    'method': method
                                },
                                'remediation': self._generate_xss_remediation(),
                                'references': [
                                    'https://owasp.org/www-community/attacks/xss/'
                                ]
                            }
                            vulnerabilities.append(vulnerability)
                            break
                    except requests.RequestException:
                        continue
        
        except Exception:
            pass
        
        return vulnerabilities
    
    def _is_reflected_unescaped(self, response_html: str, payload: str) -> bool:
        """
        Check if payload is reflected WITHOUT proper escaping
        """
        if payload not in response_html:
            return False
            
        # If the exact payload (with special chars) is present, it's likely unescaped
        # Verification: Check if it's inside a script tag or attribute where it might still be dangerous
        # For this high-level check, exact presence of special chars is a strong indicator
        return True
    
    def _generate_xss_description(self, parameter: str, payload: str, location: str, url: str = None) -> str:
        """Generate human-readable XSS description"""
        description = f"""
A reflected Cross-Site Scripting (XSS) vulnerability was detected in the {location} '{parameter}'.

What this means:
User input is being reflected in the page without proper HTML encoding/escaping.
An attacker could inject malicious JavaScript code that executes in victims' browsers.

How we detected this:
1. We injected a harmless test string: '{payload}'
2. We observed that this string was reflected in the HTML response
3. We verified that the string was NOT properly HTML-escaped
4. This indicates that malicious JavaScript could also be injected

Evidence:
URL: {url if url else 'N/A'}

Why this is dangerous:
- Attackers can steal session cookies
- Attackers can perform actions on behalf of users
- Attackers can steal sensitive data
- Attackers can deface the website

Note: We only tested with safe, non-executable payloads for ethical reasons.
        """.strip()
        return description
    
    def _generate_xss_remediation(self) -> str:
        """Generate XSS remediation guidance"""
        return """
Remediation Steps:

1. INPUT VALIDATION
   - Validate all user input against expected formats
   - Reject unexpected or suspicious input

2. OUTPUT ENCODING (CRITICAL)
   - ALL user input must be HTML-encoded before displaying
   - Use framework-specific encoding functions:
     * Python: html.escape()
     * JavaScript: textContent (not innerHTML)
     * PHP: htmlspecialchars()
     * Java: OWASP Java Encoder

3. CONTENT SECURITY POLICY
   - Implement strict CSP headers
   - Disable inline JavaScript execution

4. USE SAFE APIS
   - Avoid innerHTML, document.write, eval()
   - Use textContent, setAttribute() instead

Example Fix (Python/Flask):
from markupsafe import escape
output = escape(user_input)

Example Fix (JavaScript):
element.textContent = userInput; // NOT innerHTML

Verification:
After fixing, test with: <script>alert('test')</script>
This should appear as text, not execute.
        """.strip()
