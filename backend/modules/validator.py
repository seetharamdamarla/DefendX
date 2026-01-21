"""
URL Validator Module

Purpose: Prevent scanning of unauthorized or dangerous targets
Logic: Explicitly defined rules to block private IPs and localhost

This is intentionally conservative to prevent misuse.
"""

import re
from urllib.parse import urlparse
import ipaddress


class URLValidator:
    """
    Validates target URLs before scanning
    
    Rules are explicit and human-defined:
    - Must be valid HTTP/HTTPS URL
    - Must not be localhost or private IP
    - Must not be internal network address
    """
    
    def __init__(self):
        # Define blocked patterns explicitly
        # Justification: Prevent scanning of internal/private systems
        self.blocked_patterns = [
            r'localhost',
            r'127\.0\.0\.1',
            r'0\.0\.0\.0',
            r'.*\.local$'
        ]
    
    def validate(self, url: str) -> tuple[bool, str]:
        """
        Validate a target URL
        
        Returns: (is_valid: bool, error_message: str)
        
        Validation steps:
        1. Check if URL is provided
        2. Check URL format
        3. Check for localhost/private IPs
        4. Check for private IP ranges
        """
        
        # Step 1: Check if URL exists
        if not url:
            return False, "URL is required"
        
        # Step 2: Parse and validate URL structure
        try:
            parsed = urlparse(url)
            
            # Must have a scheme (http/https)
            if parsed.scheme not in ['http', 'https']:
                return False, "URL must use HTTP or HTTPS protocol"
            
            # Must have a netloc (hostname)
            if not parsed.netloc:
                return False, "Invalid URL format - missing hostname"
            
            hostname = parsed.netloc.split(':')[0]  # Remove port if present
            
        except Exception as e:
            return False, f"Invalid URL format: {str(e)}"
        
        # Step 3: Check against blocked patterns
        # Justification: Prevent localhost scanning
        for pattern in self.blocked_patterns:
            if re.search(pattern, hostname, re.IGNORECASE):
                return False, "Scanning localhost or local addresses is not allowed"
        
        # Step 4: Check if hostname is a private IP
        # Justification: Prevent internal network scanning
        try:
            ip = ipaddress.ip_address(hostname)
            if ip.is_private or ip.is_loopback or ip.is_link_local:
                return False, "Scanning private IP addresses is not allowed"
        except ValueError:
            # Not an IP address, which is fine (it's a domain name)
            pass
        
        # All checks passed
        return True, "URL is valid"
    
    def is_safe_domain(self, domain: str) -> bool:
        """
        Additional check for domain safety
        
        This is a simple check - in production, you might want to
        check against known safe lists or blacklists
        """
        # Check for obvious test/example domains
        test_domains = ['example.com', 'example.org', 'test.com']
        return domain.lower() in test_domains
