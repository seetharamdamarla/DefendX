import * as React from "react"
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ButtonCtaProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label?: string;
    className?: string;
}

function ButtonCta({ label = "Get Access", className, ...props }: ButtonCtaProps) {
    return (
        <Button
            variant="ghost"
            className={cn(
                "group relative w-1/2 h-12 px-4 rounded-lg overflow-hidden transition-all duration-500",
                className
            )}
            {...props}
        >
            <div className="absolute inset-0 rounded-lg p-[2px] bg-gradient-to-b from-zinc-500 via-zinc-950 to-zinc-900">
                <div className="absolute inset-0 bg-zinc-950 rounded-lg opacity-90" />
            </div>

            <div className="absolute inset-[2px] bg-zinc-950 rounded-lg opacity-95" />

            <div className="absolute inset-[2px] bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 rounded-lg opacity-90" />
            <div className="absolute inset-[2px] bg-gradient-to-b from-zinc-500/40 via-zinc-900 to-zinc-900/30 rounded-lg opacity-80" />
            <div className="absolute inset-[2px] bg-gradient-to-br from-white/10 via-zinc-900 to-black/50 rounded-lg" />

            <div className="absolute inset-[2px] shadow-[inset_0_0_15px_rgba(255,255,255,0.1)] rounded-lg" />

            <div className="relative flex items-center justify-center gap-2 overflow-hidden w-full h-full rounded-lg">
                <span className="relative z-10 text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-neutral-200 via-white to-neutral-200 animate-shimmer bg-[length:200%_auto]">
                    {label}
                </span>
                <span
                    className="pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-r from-white/0 via-white/10 to-white/0 animate-shimmer bg-[length:200%_auto]"
                    style={{ mixBlendMode: 'overlay' }}
                />
            </div>

            <div className="absolute inset-[2px] opacity-0 transition-opacity duration-300 bg-gradient-to-r from-zinc-800/20 via-white/10 to-zinc-800/20 group-hover:opacity-100 rounded-lg" />
        </Button>
    );
}

export { ButtonCta }