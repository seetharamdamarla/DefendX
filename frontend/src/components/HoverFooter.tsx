"use client";

import { Mail, Github, Linkedin } from "lucide-react";
import { FooterBackgroundGradient } from "@/components/ui/hover-footer";
import { TextHoverEffect } from "@/components/ui/hover-footer";
import LogoIcon from "./LogoIcon";

function HoverFooter() {
    // Footer link data
    // Footer link data
    const footerLinks = [
        {
            title: "Product",
            links: [
                { label: "Features", href: "#features" },
                { label: "Dashboard", href: "/dashboard" },
            ],
        },
        {
            title: "Resources",
            links: [
                { label: "GitHub", href: "https://github.com/seetharamdamarla" },
                { label: "Blog", href: "#blog" },
            ],
        },
    ];

    // Contact info data
    const contactInfo = [
        {
            icon: <Mail size={18} className="text-white" />,
            text: "seetharamdamarla06@gmail.com",
            href: "mailto:seetharamdamarla06@gmail.com",
        },
    ];

    // Social media icons
    const socialLinks = [
        {
            icon: <Github size={20} />,
            label: "GitHub",
            href: "https://github.com/seetharamdamarla"
        },
        {
            icon: <Linkedin size={20} />,
            label: "LinkedIn",
            href: "https://www.linkedin.com/in/seetharamdamarla"
        },
    ];

    return (
        <footer className="bg-black relative h-fit overflow-hidden">
            <div className="max-w-7xl mx-auto p-14 z-40 relative">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8 lg:gap-16 pb-12">
                    {/* Brand section */}
                    <div className="flex flex-col space-y-4">
                        <div className="flex items-center space-x-2">
                            <LogoIcon size={32} />
                            <span className="text-white text-3xl font-black tracking-tight">DefendX</span>
                        </div>
                        <p className="text-sm leading-relaxed text-gray-400">
                            Intelligent security infrastructure for modern web applications. Automated vulnerability detection powered by AI.
                        </p>
                    </div>

                    {/* Footer link sections */}
                    {footerLinks.map((section) => (
                        <div key={section.title}>
                            <h4 className="text-white text-lg font-semibold mb-6 font-['Space_Grotesk']">
                                {section.title}
                            </h4>
                            <ul className="space-y-3">
                                {section.links.map((link) => (
                                    <li key={link.label} className="relative">
                                        <a
                                            href={link.href}
                                            className="text-gray-400 hover:text-white transition-colors"
                                            target={link.href.startsWith('http') ? '_blank' : undefined}
                                            rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                                        >
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Contact section */}
                    <div>
                        <h4 className="text-white text-lg font-semibold mb-6 font-['Space_Grotesk']">
                            Contact
                        </h4>
                        <ul className="space-y-4">
                            {contactInfo.map((item, i) => (
                                <li key={i} className="flex items-center space-x-3">
                                    {item.icon}
                                    {item.href ? (
                                        <a
                                            href={item.href}
                                            className="text-gray-400 hover:text-white transition-colors text-sm"
                                        >
                                            {item.text}
                                        </a>
                                    ) : (
                                        <span className="text-gray-400 text-sm">
                                            {item.text}
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <hr className="border-t border-white/10 my-8" />

                {/* Footer bottom */}
                <div className="flex flex-col md:flex-row justify-between items-center text-sm space-y-4 md:space-y-0">
                    {/* Social icons */}
                    <div className="flex space-x-6 text-gray-400">
                        {socialLinks.map(({ icon, label, href }) => (
                            <a
                                key={label}
                                href={href}
                                aria-label={label}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-white transition-colors"
                            >
                                {icon}
                            </a>
                        ))}
                    </div>

                    {/* Copyright */}
                    <p className="text-center md:text-left text-gray-400">
                        © {new Date().getFullYear()} DefendX Security. Built with precision.
                    </p>
                </div>
            </div>

            {/* Text hover effect */}
            <div className="lg:flex hidden h-[30rem] -mt-40 -mb-36">
                <TextHoverEffect text="DEFENDX" className="z-50" />
            </div>

            <FooterBackgroundGradient />
        </footer>
    );
}

export default HoverFooter;
