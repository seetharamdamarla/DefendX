import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export const BackgroundBeams = ({ className }: { className?: string }) => {
    const beamsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!beamsRef.current) return;

        const moveBeams = (e: MouseEvent) => {
            const { clientX, clientY } = e;
            const x = clientX - beamsRef.current!.getBoundingClientRect().left;
            const y = clientY - beamsRef.current!.getBoundingClientRect().top;

            beamsRef.current!.style.setProperty("--x", `${x}px`);
            beamsRef.current!.style.setProperty("--y", `${y}px`);
        };

        window.addEventListener("mousemove", moveBeams);

        return () => {
            window.removeEventListener("mousemove", moveBeams);
        };
    }, []);

    return (
        <div
            ref={beamsRef}
            className={cn(
                "absolute inset-0 overflow-hidden [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]",
                className
            )}
        >
            <div className="absolute inset-0 bg-transparent bg-[radial-gradient(#ffffff22_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
            <div
                className="pointer-events-none absolute -inset-[10px] opacity-50 transition duration-300"
                style={{
                    background: `radial-gradient(600px circle at var(--x, 50%) var(--y, 50%), rgba(255,255,255,0.06), transparent 40%)`,
                }}
            />
        </div>
    );
};
