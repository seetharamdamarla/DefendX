interface LogoIconProps {
    size?: number
    className?: string
}

/**
 * DefendX Logo Icon
 * Modern shield design with scanning elements
 */
export default function LogoIcon({ size = 24, className = '' }: LogoIconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Gradient Definitions */}
            <defs>
                <linearGradient id="shield-main" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="50%" stopColor="#e5e7eb" />
                    <stop offset="100%" stopColor="#ffffff" />
                </linearGradient>
                <linearGradient id="shield-accent" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#d1d5db" />
                </linearGradient>
            </defs>

            {/* Shield Outline - Classic Shield Shape */}
            <path
                d="M12 2 L4 5 L4 11 Q4 16 12 22 Q20 16 20 11 L20 5 Z"
                fill="none"
                stroke="url(#shield-main)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.8"
            />

            {/* Inner Shield Fill with Segments */}
            {/* Top segment */}
            <path
                d="M12 4 L6 6.5 L6 11 Q6 13 8 15 L12 12 Z"
                fill="url(#shield-main)"
                opacity="0.3"
            />

            {/* Right segment */}
            <path
                d="M12 4 L18 6.5 L18 11 Q18 13 16 15 L12 12 Z"
                fill="url(#shield-accent)"
                opacity="0.25"
            />

            {/* Bottom segment */}
            <path
                d="M8 15 Q10 17 12 19.5 Q14 17 16 15 L12 12 Z"
                fill="url(#shield-main)"
                opacity="0.35"
            />

            {/* Scanning Lines - Horizontal */}
            <line
                x1="7"
                y1="8"
                x2="17"
                y2="8"
                stroke="url(#shield-main)"
                strokeWidth="0.8"
                opacity="0.6"
            />
            <line
                x1="7"
                y1="11"
                x2="17"
                y2="11"
                stroke="url(#shield-main)"
                strokeWidth="0.8"
                opacity="0.6"
            />
            <line
                x1="8"
                y1="14"
                x2="16"
                y2="14"
                stroke="url(#shield-main)"
                strokeWidth="0.8"
                opacity="0.6"
            />

            {/* Central X Design for DefendX */}
            <path
                d="M9 9 L15 15 M15 9 L9 15"
                stroke="url(#shield-accent)"
                strokeWidth="1.8"
                strokeLinecap="round"
                opacity="0.7"
            />

            {/* Center Scan Point */}
            <circle
                cx="12"
                cy="12"
                r="2"
                fill="none"
                stroke="url(#shield-main)"
                strokeWidth="1"
                opacity="0.8"
            />
            <circle
                cx="12"
                cy="12"
                r="1"
                fill="#ffffff"
                opacity="0.9"
            >
                {/* Subtle pulse animation */}
                <animate
                    attributeName="opacity"
                    values="0.9;0.4;0.9"
                    dur="2s"
                    repeatCount="indefinite"
                />
            </circle>
        </svg>
    )
}
