from typing import Dict, List, Any

class SecurityHealthScoreCalculator:
    
    SEVERITY_WEIGHTS = {
        'CRITICAL': 10.0,  
        'HIGH': 7.5,       
        'MEDIUM': 4.0,     
        'LOW': 1.0,        
    }
    
    CATEGORY_MULTIPLIERS = {
        'Injection': 1.5,                    
        'Sensitive Data Exposure': 1.4,       
        'Broken Authentication': 1.4,         
        'Security Misconfiguration': 1.2,     
        'Directory/File Exposure': 1.3,       
        'XSS': 1.2,                          
        'Information Disclosure': 1.0,        
        'Insecure Cookies': 1.1,             
    }
    
    def calculate_health_score(self, vulnerabilities: List[Dict]) -> Dict[str, Any]:
        
        if not vulnerabilities:
            # Perfect score - no vulnerabilities
            return {
                'health_score': 100,
                'letter_grade': 'A+',
                'grade_color': 'green',
                'risk_points': 0,
                'status': 'Excellent',
                'status_emoji': '🟢',
                'breakdown': {
                    'total_vulnerabilities': 0,
                    'by_severity': {'CRITICAL': 0, 'HIGH': 0, 'MEDIUM': 0, 'LOW': 0},
                    'weighted_risk': 0
                },
                'recommendations': ['Continue regular security audits', 'Maintain current security practices']
            }
        
        # Calculate weighted risk points
        total_risk_points = 0
        severity_counts = {'CRITICAL': 0, 'HIGH': 0, 'MEDIUM': 0, 'LOW': 0}
        category_breakdown = {}
        
        for vuln in vulnerabilities:
            severity = vuln.get('severity', 'LOW').upper()
            category = vuln.get('category', 'Other')
            
            # Count by severity
            if severity in severity_counts:
                severity_counts[severity] += 1
            
            # Calculate risk points for this vulnerability
            base_weight = self.SEVERITY_WEIGHTS.get(severity, 1.0)
            category_multiplier = self.CATEGORY_MULTIPLIERS.get(category, 1.0)
            
            risk_points = base_weight * category_multiplier
            total_risk_points += risk_points
            
            # Track by category
            if category not in category_breakdown:
                category_breakdown[category] = {'count': 0, 'risk_points': 0}
            category_breakdown[category]['count'] += 1
            category_breakdown[category]['risk_points'] += risk_points
        
        # Calculate health score (0-100)
        # Formula: Start at 100, subtract risk points (capped at 100)
        health_score = max(0, 100 - total_risk_points)
        
        # Determine letter grade
        grade_data = self._calculate_letter_grade(health_score)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(
            severity_counts, 
            category_breakdown, 
            health_score
        )
        
        return {
            'health_score': round(health_score, 1),
            'letter_grade': grade_data['grade'],
            'grade_color': grade_data['color'],
            'risk_points': round(total_risk_points, 1),
            'status': grade_data['status'],
            'breakdown': {
                'total_vulnerabilities': len(vulnerabilities),
                'by_severity': severity_counts,
                'by_category': category_breakdown,
                'weighted_risk': round(total_risk_points, 1)
            },
            'recommendations': recommendations
        }
    
    def _calculate_letter_grade(self, score: float) -> Dict[str, str]:
        
        if score >= 95:
            return {
                'grade': 'A+',
                'color': 'emerald',
                'status': 'Excellent'
            }
        elif score >= 90:
            return {
                'grade': 'A',
                'color': 'green',
                'status': 'Very Good'
            }
        elif score >= 85:
            return {
                'grade': 'B+',
                'color': 'lime',
                'status': 'Good'
            }
        elif score >= 80:
            return {
                'grade': 'B',
                'color': 'yellow',
                'status': 'Acceptable'
            }
        elif score >= 75:
            return {
                'grade': 'C+',
                'color': 'amber',
                'status': 'Fair'
            }
        elif score >= 70:
            return {
                'grade': 'C',
                'color': 'orange',
                'status': 'Below Average'
            }
        elif score >= 60:
            return {
                'grade': 'D',
                'color': 'red',
                'status': 'Poor'
            }
        else:
            return {
                'grade': 'F',
                'color': 'red',
                'status': 'Critical'
            }
    
    def _generate_recommendations(
        self, 
        severity_counts: Dict, 
        category_breakdown: Dict,
        health_score: float
    ) -> List[str]:
        recommendations = []
        
        if severity_counts.get('CRITICAL', 0) > 0:
            recommendations.append(
                f"URGENT: Address {severity_counts['CRITICAL']} critical "
                f"vulnerabilit{'y' if severity_counts['CRITICAL'] == 1 else 'ies'} immediately"
            )
        
        if severity_counts.get('HIGH', 0) > 0:
            recommendations.append(
                f" Fix {severity_counts['HIGH']} high-severity "
                f"vulnerabilit{'y' if severity_counts['HIGH'] == 1 else 'ies'} within 24-48 hours"
            )
        
        if 'Injection' in category_breakdown:
            recommendations.append(
                "🔒 Implement parameterized queries to prevent SQL injection"
            )
        
        if 'Sensitive Data Exposure' in category_breakdown:
            recommendations.append(
                "🔑 Remove exposed secrets and rotate credentials immediately"
            )
        
        if 'Security Misconfiguration' in category_breakdown:
            recommendations.append(
                "⚙️  Review and harden security configurations (CORS, headers)"
            )
        
        if health_score < 70:
            recommendations.append(
                "📋 Schedule comprehensive security audit with your team"
            )
            recommendations.append(
                " Consider implementing a Web Application Firewall (WAF)"
            )
        elif health_score < 85:
            recommendations.append(
                "Continue addressing medium-severity issues"
            )
            recommendations.append(
                "🔄 Implement regular security scanning in CI/CD pipeline"
            )
        else:
            recommendations.append(
                "Maintain current security practices"
            )
            recommendations.append(
                "📊 Schedule quarterly security reviews"
            )
        
        return recommendations[:5]
    
    def get_severity_distribution_percentage(self, severity_counts: Dict) -> Dict[str, float]:
        total = sum(severity_counts.values())
        if total == 0:
            return {'CRITICAL': 0, 'HIGH': 0, 'MEDIUM': 0, 'LOW': 0}
        
        return {
            severity: round((count / total) * 100, 1)
            for severity, count in severity_counts.items()
        }
