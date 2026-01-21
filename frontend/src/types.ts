// TypeScript type definitions for DefendX

export interface ScanResult {
    success: boolean
    scan_id: string
    target_url: string
    timestamp: string
    results: ScanResults
}

export interface ScanResults {
    attack_surface: AttackSurface
    vulnerabilities: Vulnerability[]
    summary: ScanSummary
    metadata: ScanMetadata
}

export interface AttackSurface {
    urls: string[]
    forms: Form[]
    url_count: number
    form_count: number
    endpoints?: string[]
    error?: string
}

export interface Form {
    action: string
    method: string
    inputs: FormInput[]
}

export interface FormInput {
    name: string
    type: string
}

export interface Vulnerability {
    category: string
    severity: 'HIGH' | 'MEDIUM' | 'LOW'
    title: string
    description: string
    evidence: {
        url?: string
        [key: string]: string | string[] | number | boolean | undefined | Record<string, unknown>
    }
    remediation: string
    references: string[]
}

export interface ScanSummary {
    total_vulnerabilities: number
    by_severity: {
        HIGH: number
        MEDIUM: number
        LOW: number
    }
    by_category: Record<string, number>
    risk_score: 'HIGH' | 'MEDIUM' | 'LOW' | 'CLEAN' | 'UNKNOWN'
}

export interface ScanMetadata {
    target: string
    scan_duration: number
    timestamp: number
    timeout?: boolean
    failed?: boolean
}

export interface Disclaimer {
    disclaimer: string
    requirements: string[]
}

export interface DashboardStats {
    total_scans: number
    active_targets: number
    critical_risks: number
    severity_distribution: {
        HIGH: number
        MEDIUM: number
        LOW: number
    }
    trends: {
        date: string
        count: number
    }[]
}

export interface RecentScanItem {
    scan_id: string
    target_url: string
    timestamp: string
    risk_score: string
    vuln_count: number
}

export interface DashboardData {
    stats: DashboardStats
    recent_scans: RecentScanItem[]
}

export interface TargetItem {
    url: string
    last_scan: string
    risk_score: string
    total_vulns: number
    scans_count: number
}

export interface RiskItem {
    target: string
    discovered_at: string
    title: string
    severity: string
    category: string
    description: string
    remediation: string
}
