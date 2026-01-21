"""
Attack Surface Scanner Module

This module orchestrates the vulnerability scanning process.
All detection logic is rule-based and manually defined.

Design Decision:
- Modular approach: Each vulnerability check is isolated
- Conservative scanning: Limited depth, timeouts enforced
- Explicit logic: All decisions are traceable and explainable
"""

import requests
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
import time
from typing import Dict, List, Any

from modules.checks.security_headers import SecurityHeadersCheck
from modules.checks.xss_reflection import XSSReflectionCheck
from modules.checks.directory_exposure import DirectoryExposureCheck
from modules.checks.cookie_security import CookieSecurityCheck


class AttackSurfaceScanner:
    """
    Main scanner class that coordinates all vulnerability checks
    
    Architecture:
    - Each check is a separate module
    - Scanner coordinates execution
    - Results are aggregated and structured
    """
    
    def __init__(self, target_url: str, max_depth: int = 3, timeout: int = 120):
        self.target_url = target_url
        self.max_depth = max_depth
        self.timeout = timeout
        self.start_time = None
        
        # Track discovered URLs to avoid duplicates
        self.discovered_urls = set()
        self.discovered_forms = []
        
        # Initialize vulnerability checkers
        # Each checker implements specific, rule-based detection logic
        self.checkers = [
            SecurityHeadersCheck(),
            XSSReflectionCheck(),
            DirectoryExposureCheck(),
            CookieSecurityCheck()
        ]
    
    def execute_scan(self) -> Dict[str, Any]:
        """
        Execute complete security scan
        
        Process:
        1. Discover attack surface (URLs, forms)
        2. Run vulnerability checks
        3. Aggregate and structure results
        4. Calculate risk summary
        
        Returns structured scan results
        """
        self.start_time = time.time()
        
        results = {
            'attack_surface': {},
            'vulnerabilities': [],
            'summary': {},
            'metadata': {
                'target': self.target_url,
                'scan_duration': 0,
                'timestamp': time.time()
            }
        }
        
        try:
            # Phase 1: Attack Surface Discovery
            # This is how a pentester would manually explore the site
            results['attack_surface'] = self._discover_attack_surface()
            
            # Phase 2: Vulnerability Detection
            # Run checks in PARALLEL for speed
            from concurrent.futures import ThreadPoolExecutor, as_completed
            
            with ThreadPoolExecutor(max_workers=5) as executor:
                # Submit all check tasks
                future_to_checker = {
                    executor.submit(
                        checker.check, 
                        target_url=self.target_url,
                        discovered_urls=list(self.discovered_urls),
                        discovered_forms=self.discovered_forms
                    ): checker for checker in self.checkers
                }
                
                # Collect results as they complete
                for future in as_completed(future_to_checker):
                    if self._is_timeout():
                        results['metadata']['timeout'] = True
                        executor.shutdown(wait=False)
                        break
                        
                    try:
                        vulns = future.result()
                        if vulns:
                            results['vulnerabilities'].extend(vulns)
                    except Exception as check_error:
                        # Log individual check failure but continue
                        print(f"Check failed: {str(check_error)}")
            
            # Phase 3: Generate Summary
            results['summary'] = self._generate_summary(results['vulnerabilities'])
            
            # Update scan duration
            results['metadata']['scan_duration'] = time.time() - self.start_time
            
        except Exception as e:
            results['error'] = str(e)
            results['metadata']['failed'] = True
        
        return results
    
    def _discover_attack_surface(self) -> Dict[str, Any]:
        """
        Discover the attack surface of the target
        
        Mimics manual pentesting approach:
        - Crawl pages (limited depth)
        - Identify forms
        - Enumerate endpoints
        
        This is NOT automated AI - it's rule-based crawling
        """
        surface = {
            'urls': [],
            'forms': [],
            'endpoints': []
        }
        
        try:
            # Start with the main URL
            self._crawl_url(self.target_url, depth=0)
            
            surface['urls'] = list(self.discovered_urls)
            surface['forms'] = self.discovered_forms
            surface['url_count'] = len(self.discovered_urls)
            surface['form_count'] = len(self.discovered_forms)
            
        except Exception as e:
            surface['error'] = f"Crawling failed: {str(e)}"
        
        return surface
    
    def _crawl_url(self, url: str, depth: int):
        """
        Recursively crawl URLs
        
        This is intentionally simple and conservative:
        - Respects max depth
        - Respects timeout
        - Only follows same-origin links
        """
        # Check depth limit
        if depth > self.max_depth:
            return
        
        # Check timeout
        if self._is_timeout():
            return
        
        # Skip if already visited
        if url in self.discovered_urls:
            return
        
        try:
            # Make HTTP request
            response = requests.get(url, timeout=10, allow_redirects=True)
            self.discovered_urls.add(url)
            
            # Parse HTML
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find forms
            forms = soup.find_all('form')
            for form in forms:
                form_data = {
                    'action': form.get('action', ''),
                    'method': form.get('method', 'get').upper(),
                    'inputs': []
                }
                
                inputs = form.find_all(['input', 'textarea'])
                for inp in inputs:
                    form_data['inputs'].append({
                        'name': inp.get('name', ''),
                        'type': inp.get('type', 'text')
                    })
                
                self.discovered_forms.append(form_data)
            
            # Find links to crawl (same origin only)
            if depth < self.max_depth:
                links = soup.find_all('a', href=True)
                for link in links:
                    href = link['href']
                    absolute_url = urljoin(url, href)
                    
                    # Only crawl same-origin URLs
                    if self._is_same_origin(absolute_url):
                        self._crawl_url(absolute_url, depth + 1)
        
        except Exception as e:
            # Silently continue - some URLs may fail
            pass
    
    def _is_same_origin(self, url: str) -> bool:
        """Check if URL is same origin as target"""
        target_parsed = urlparse(self.target_url)
        url_parsed = urlparse(url)
        
        return (target_parsed.scheme == url_parsed.scheme and
                target_parsed.netloc == url_parsed.netloc)
    
    def _is_timeout(self) -> bool:
        """Check if scan has exceeded timeout"""
        if not self.start_time:
            return False
        return (time.time() - self.start_time) > self.timeout
    
    def _generate_summary(self, vulnerabilities: List[Dict]) -> Dict[str, Any]:
        """
        Generate risk summary
        
        This uses STATIC, HUMAN-DEFINED risk levels.
        NO dynamic scoring or AI classification.
        """
        summary = {
            'total_vulnerabilities': len(vulnerabilities),
            'by_severity': {
                'HIGH': 0,
                'MEDIUM': 0,
                'LOW': 0
            },
            'by_category': {},
            'risk_score': 'UNKNOWN'
        }
        
        for vuln in vulnerabilities:
            severity = vuln.get('severity', 'LOW')
            category = vuln.get('category', 'Other')
            
            # Count by severity
            if severity in summary['by_severity']:
                summary['by_severity'][severity] += 1
            
            # Count by category
            if category not in summary['by_category']:
                summary['by_category'][category] = 0
            summary['by_category'][category] += 1
        
        # Calculate overall risk (simple, rule-based)
        # This is NOT AI - it's explicit rules
        if summary['by_severity']['HIGH'] > 0:
            summary['risk_score'] = 'HIGH'
        elif summary['by_severity']['MEDIUM'] > 0:
            summary['risk_score'] = 'MEDIUM'
        elif summary['by_severity']['LOW'] > 0:
            summary['risk_score'] = 'LOW'
        else:
            summary['risk_score'] = 'CLEAN'
        
        return summary
