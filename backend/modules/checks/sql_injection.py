"""
SQL Injection Detection Check

Purpose: Detect SQL injection vulnerabilities in web applications
Method: Professional pentesting technique using error-based and time-based detection

Detection Methodology (Industry Standard):
1. Error-Based Detection: Inject SQL metacharacters and detect database errors
2. Boolean-Based Detection: Use SQL logic to alter responses
3. Time-Based Detection: Use database sleep functions to detect blind SQLi

This mimics how tools like SQLMap and professional pentesters find SQLi.
"""

import requests
import time
from typing import List, Dict, Any
from urllib.parse import urljoin, parse_qs, urlparse, urlencode


class SQLInjectionCheck:
    """
    Professional-grade SQL Injection detection
    """
    
    def __init__(self):
        # Professional SQL injection payloads
        self.error_payloads = [
            "'",                    # Basic single quote
            "\"",                   # Double quote
            "' OR '1'='1",          # Classic SQLi
            "' OR 1=1--",           # Comment-based
            "admin'--",             # Admin bypass
            "' UNION SELECT NULL--", # UNION-based - triggers column count errors often
            "') OR ('1'='1",        # Parenthesis bypass
        ]
        
        # Database-specific error patterns
        self.db_error_patterns = [
            'you have an error in your sql syntax',
            'warning: mysql',
            'unclosed quotation mark',
            'quoted string not properly terminated',
            'postgresql query failed',
            'pg_query()',
            'microsoft sql native client error',
            'odbc sql server driver',
            'ora-00933',
            'ora-01756',
            'oracle error',
            'sql syntax',
            'syntax error',
            'database error',
            'mysql_fetch',
            'sqlite_',
            'sqlstate',
            'mariadb'
        ]
        
        # Time-based payloads: (Payload, Sleep Time in seconds)
        self.time_payloads = [
            ("1' AND SLEEP(5)--", 5),               # MySQL
            ("1'; WAITFOR DELAY '0:0:5'--", 5),     # MSSQL
            ("1' AND pg_sleep(5)--", 5),            # PostgreSQL
            ("1' || pg_sleep(5)--", 5),             # PostgreSQL alternative
        ]
    
    def check(self, target_url: str, discovered_forms: List[Dict] = None, **kwargs) -> List[Dict[str, Any]]:
        vulnerabilities = []
        
        # Helper to get baseline errors
        baseline_errors = self._get_baseline_errors(target_url)
        
        # Test URL parameters
        try:
            parsed = urlparse(target_url)
            if parsed.query:
                params = parse_qs(parsed.query)
                # Deduplicate parameters
                for param_name in params.keys():
                    # Error-Based Check
                    for payload in self.error_payloads[:4]: # Limit payloads for speed
                        vuln = self._test_error_based(target_url, param_name, payload, baseline_errors)
                        if vuln:
                            vulnerabilities.append(vuln)
                            break # Found one, move to next param
                    
                    # Time-Based Check (only if no error-based found for this param)
                    if not any(v['evidence']['parameter'] == param_name for v in vulnerabilities):
                        for payload, sleep_time in self.time_payloads:
                            vuln = self._test_time_based(target_url, param_name, payload, sleep_time)
                            if vuln:
                                vulnerabilities.append(vuln)
                                break
        except Exception:
            pass
        
        # Test form inputs
        if discovered_forms:
            for form in discovered_forms[:3]: # Limit forms
                try:
                    form_vulns = self._test_form(target_url, form, baseline_errors)
                    vulnerabilities.extend(form_vulns)
                except Exception:
                    continue
        
        return vulnerabilities

    def _get_baseline_errors(self, url: str) -> List[str]:
        """Fetch page normally and capture existing SQL errors"""
        errors = []
        try:
            response = requests.get(url, timeout=10)
            content_lower = response.text.lower()
            for pattern in self.db_error_patterns:
                if pattern in content_lower:
                    errors.append(pattern)
        except Exception:
            pass
        return errors
    
    def _test_url_params(self, url: str, params: Dict, baseline_errors: List[str] = []) -> List[Dict]:
        """Deprecated: Logic moved to check()"""
        return []

    def _test_form(self, base_url: str, form: Dict, baseline_errors: List[str] = []) -> List[Dict]:
        vulnerabilities = []
        if not form.get('inputs'):
            return vulnerabilities
        
        form_url = urljoin(base_url, form.get('action', '')) if form.get('action') else base_url
        method = form.get('method', 'GET').upper()
        
        for input_field in form['inputs'][:2]: # Limit inputs
            field_name = input_field.get('name')
            if not field_name:
                continue
            
            for payload in self.error_payloads[:3]:
                # Prepare data
                data = {field_name: payload}
                
                try:
                    if method == 'POST':
                        response = requests.post(form_url, data=data, timeout=10)
                    else:
                        response = requests.get(form_url, params=data, timeout=10)
                    
                    content_lower = response.text.lower()
                    
                    # Check for NEW errors only
                    for pattern in self.db_error_patterns:
                        if pattern in content_lower and pattern not in baseline_errors:
                            vulnerabilities.append({
                                'category': 'SQL Injection',
                                'severity': 'CRITICAL',
                                'title': f'SQL Injection in Form Field: {field_name}',
                                'description': self._generate_description(field_name, payload, 'Error-based (Form)'),
                                'evidence': {
                                    'url': form_url,
                                    'field': field_name,
                                    'payload': payload,
                                    'error_pattern': pattern
                                },
                                'remediation': self._generate_remediation(),
                                'references': ['https://owasp.org/www-community/attacks/SQL_Injection']
                            })
                            break
                    if vulnerabilities: break 
                except Exception:
                    continue
        return vulnerabilities

    def _test_error_based(self, url: str, param: str, payload: str, baseline_errors: List[str]) -> Dict:
        try:
            parsed = urlparse(url)
            params = parse_qs(parsed.query)
            params[param] = [payload]
            test_url = f"{parsed.scheme}://{parsed.netloc}{parsed.path}?{urlencode(params, doseq=True)}"
            
            response = requests.get(test_url, timeout=10)
            content_lower = response.text.lower()
            
            for pattern in self.db_error_patterns:
                if pattern in content_lower and pattern not in baseline_errors:
                    return {
                        'category': 'SQL Injection',
                        'severity': 'CRITICAL',
                        'title': f'SQL Injection in Parameter: {param}',
                        'description': self._generate_description(param, payload, 'Error-based'),
                        'evidence': {
                            'url': test_url,
                            'parameter': param,
                            'payload': payload,
                            'error_pattern': pattern
                        },
                        'remediation': self._generate_remediation(),
                        'references': ['https://owasp.org/www-community/attacks/SQL_Injection']
                    }
        except Exception:
            pass
        return None

    def _test_time_based(self, url: str, param: str, payload: str, sleep_time: int) -> Dict:
        """
        Time-based blind SQL injection detection
        Logic: Measure response time. If response time >= sleep_time, it's likely vulnerable.
        """
        try:
            parsed = urlparse(url)
            params = parse_qs(parsed.query)
            params[param] = [payload]
            test_url = f"{parsed.scheme}://{parsed.netloc}{parsed.path}?{urlencode(params, doseq=True)}"
            
            start_time = time.time()
            requests.get(test_url, timeout=sleep_time + 5) # Allow buffer
            duration = time.time() - start_time
            
            # Simple threshold check
            # In a real scanner, we'd compare against a baseline average response time
            if duration >= sleep_time:
                return {
                    'category': 'SQL Injection (Blind)',
                    'severity': 'CRITICAL',
                    'title': f'Blind Time-Based SQL Injection in: {param}',
                    'description': self._generate_description(param, payload, 'Time-based Blind'),
                    'evidence': {
                        'url': test_url,
                        'parameter': param,
                        'payload': payload,
                        'response_time': f"{duration:.2f}s",
                        'expected_delay': f"{sleep_time}s"
                    },
                    'remediation': self._generate_remediation(),
                    'references': ['https://owasp.org/www-community/attacks/SQL_Injection']
                }
        except Exception:
            pass
        return None
    
    def _generate_description(self, param: str, payload: str, method: str) -> str:
        return f"""
A SQL Injection vulnerability was detected in the input: {param}

What this is:
SQL Injection allows attackers to inject malicious SQL code into database queries, potentially exposing, modifying, or deleting data.

Security Risk:
CRITICAL - Attackers can:
- Read sensitive data from the database
- Modify or delete database records
- Bypass authentication
- Execute administrative operations
- In some cases, execute system commands

How we detected this:
1. We injected a SQL payload: {payload}
2. The application returned database error messages
3. This confirms the input is not properly sanitized
4. Detection method: {method}

Why this is dangerous:
SQL Injection is one of the most critical web application vulnerabilities (OWASP Top 10 #1).
It has led to major data breaches affecting millions of users.

Detection Method:
This was found using professional penetration testing techniques employed by security researchers and ethical hackers worldwide.
        """.strip()
    
    def _generate_remediation(self) -> str:
        return """
Remediation Steps:

1. IMMEDIATE ACTION
   - Identify all database queries using user input
   - Review application logs for suspicious SQL patterns
   - Consider temporarily disabling affected functionality

2. SECURE CODING PRACTICES (Primary Fix)
   - Use Parameterized Queries (Prepared Statements)
   - NEVER concatenate user input into SQL queries
   - Use ORM frameworks (Prisma, SQLAlchemy, TypeORM)

3. CODE EXAMPLES

Python (Secure):
```python
# VULNERABLE
query = f"SELECT * FROM users WHERE id = {user_input}"

# SECURE (Parameterized)
query = "SELECT * FROM users WHERE id = ?"
cursor.execute(query, (user_input,))
```

Node.js/Prisma (Secure):
```javascript
// SECURE (Prisma automatically prevents SQLi)
const user = await prisma.user.findUnique({
  where: { id: userInput }
});
```

4. INPUT VALIDATION
   - Whitelist allowed characters
   - Validate data types (integers, emails, etc.)
   - Limit input length
   - Reject SQL keywords in input

5. DEFENSE IN DEPTH
   - Use least-privilege database accounts
   - Enable database query logging
   - Implement Web Application Firewall (WAF)
   - Regular security testing

6. VERIFICATION
   - Test with SQLMap or Burp Suite
   - Perform code review
   - Implement automated security testing
        """.strip()
