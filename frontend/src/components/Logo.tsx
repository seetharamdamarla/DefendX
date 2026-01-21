interface LogoProps {
    size?: number
    className?: string
}

/**
 * DefendX Logo Component
 * Uses the unique spiral shield design
 */
export default function Logo({ size = 40, className = '' }: LogoProps) {
    return (
        <div
            className={`relative ${className}`}
            style={{ width: size, height: size }}
        >
            <img
                src="/defendx-logo.png"
                alt="DefendX Logo"
                className="w-full h-full object-contain"
            />
        </div>
    )
}
