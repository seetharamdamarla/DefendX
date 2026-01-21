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
    1. Inject harmless test strings into URL parameters and forms
    2. Check if the string is reflected in the response
    3. Check if the reflection is properly escaped
    4. Report only if unescaped reflection is found
    
    This is CONSERVATIVE and ETHICAL:
    - No harmful payloads
    - No JavaScript execution
    - Only detection, no exploitation
    """
    
    def __init__(self):
        # Test payloads: These are HARMLESS identifiers
        # They are unique strings that help us track reflection
        # They do NOT execute code or cause harm
        
        # Justification for these specific payloads:
        # - Simple and identifiable
        # - Not executable
        # - Easy to detect in responses
        self.test_payloads = [
            'DEFENDX_XSS_TEST_2026',  # Simple marker
            '<DEFENDX_TEST_TAG>',     # HTML tag test (non-executable)
        ]
    
    def check(self, target_url: str, discovered_urls: List[str] = None, 
              discovered_forms: List[Dict] = None, **kwargs) -> List[Dict[str, Any]]:
        """
        Check for XSS reflection vulnerabilities
        
        Process:
        1. Test URL parameters
        2. Test form inputs
        3. Analyze responses for unescaped reflections
        
        Only flag when EXPLICIT CONDITIONS are met:
        - Test payload is present in response
        - Payload is NOT properly escaped
        """
        vulnerabilities = []
        
        # Test URL parameters
        if discovered_urls:
            for url in discovered_urls[:2]:  # Limit to prevent excessive requests
                vulns = self._test_url_parameters(url)
                vulnerabilities.extend(vulns)
        
        # Test forms
        if discovered_forms:
            for form in discovered_forms[:2]:  # Limit testing
                vulns = self._test_form_inputs(target_url, form)
                vulnerabilities.extend(vulns)
        
        return vulnerabilities
    
    def _test_url_parameters(self, url: str) -> List[Dict[str, Any]]:
        """
        Test URL parameters for XSS reflection
        
        Logic:
        1. Parse URL to find parameters
        2. Inject test payload into each parameter
        3. Check if payload is reflected unescaped
        """
        vulnerabilities = []
        
        try:
            parsed = urlparse(url)
            params = parse_qs(parsed.query)
            
            # If no parameters, nothing to test
            if not params:
                return vulnerabilities
            
            # Test each parameter
            for param_name in params.keys():
                for payload in self.test_payloads:
                    # Create test URL with payload
                    test_params = params.copy()
                    test_params[param_name] = [payload]
                    
                    test_query = urlencode(test_params, doseq=True)
                    test_url = f"{parsed.scheme}://{parsed.netloc}{parsed.path}?{test_query}"
                    
                    # Send request
                    response = requests.get(test_url, timeout=10)
                    
                    # Check for unescaped reflection
                    # This is the KEY DETECTION LOGIC
                    if self._is_reflected_unescaped(response.text, payload):
                        vulnerability = {
                            'category': 'Reflected XSS',
                            'severity': 'HIGH',  # XSS is always high severity
                            'title': f'Reflected XSS in URL Parameter: {param_name}',
                            'description': self._generate_xss_description(param_name, payload, 'URL parameter'),
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
                        break  # One finding per parameter is enough
        
        except Exception as e:
            pass
        
        return vulnerabilities
    
    def _test_form_inputs(self, base_url: str, form: Dict) -> List[Dict[str, Any]]:
        """
        Test form inputs for XSS reflection
        
        Logic similar to URL parameter testing
        """
        vulnerabilities = []
        
        try:
            method = form.get('method', 'GET')
            action = form.get('action', '')
            inputs = form.get('inputs', [])
            
            if not inputs:
                return vulnerabilities
            
            # Build form action URL
            form_url = urljoin(base_url, action) if action else base_url
            
            # Test each input field
            for input_field in inputs:
                input_name = input_field.get('name', '')
                if not input_name:
                    continue
                
                for payload in self.test_payloads:
                    # Build form data
                    form_data = {input_name: payload}
                    
                    # Submit form
                    if method.upper() == 'POST':
                        response = requests.post(form_url, data=form_data, timeout=10)
                    else:
                        response = requests.get(form_url, params=form_data, timeout=10)
                    
                    # Check reflection
                    if self._is_reflected_unescaped(response.text, payload):
                        vulnerability = {
                            'category': 'Reflected XSS',
                            'severity': 'HIGH',
                            'title': f'Reflected XSS in Form Input: {input_name}',
                            'description': self._generate_xss_description(input_name, payload, 'form input'),
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
        
        except Exception as e:
            pass
        
        return vulnerabilities
    
    def _is_reflected_unescaped(self, response_html: str, payload: str) -> bool:
        """
        Check if payload is reflected WITHOUT proper escaping
        
        This is the CORE DETECTION LOGIC:
        
        Rule 1: Payload must be present in response
        Rule 2: Payload must NOT be HTML-escaped
        
        Explicit conditions:
        - IF payload appears exactly as injected → Vulnerable
        - IF payload is HTML-escaped → Not vulnerable
        - IF payload is not present → Not vulnerable
        
        This is manual logic, not AI classification.
        """
        # Check if payload exists in response
        if payload not in response_html:
            return False  # Not reflected at all
        
        # Check if payload is HTML-escaped
        # If HTML contains <, >, it should be escaped as &lt; &gt;
        escaped_payload = payload.replace('<', '&lt;').replace('>', '&gt;')
        
        if escaped_payload in response_html and payload not in response_html:
            return False  # Properly escaped - safe
        
        # If we reach here: payload is present AND not escaped
        return True  # VULNERABLE
    
    def _generate_xss_description(self, parameter: str, payload: str, location: str) -> str:
        """Generate human-readable XSS description"""
        return f"""
A reflected Cross-Site Scripting (XSS) vulnerability was detected in the {location} '{parameter}'.

What this means:
User input is being reflected in the page without proper HTML encoding/escaping.
An attacker could inject malicious JavaScript code that executes in victims' browsers.

How we detected this:
1. We injected a harmless test string: '{payload}'
2. We observed that this string was reflected in the HTML response
3. We verified that the string was NOT properly HTML-escaped
4. This indicates that malicious JavaScript could also be injected

Why this is dangerous:
- Attackers can steal session cookies
- Attackers can perform actions on behalf of users
- Attackers can steal sensitive data
- Attackers can deface the website

Note: We only tested with safe, non-executable payloads for ethical reasons.
        """.strip()
    
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
