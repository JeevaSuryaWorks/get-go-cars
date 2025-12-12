'use client';

import React from 'react';

type LoaderSize = 'sm' | 'md' | 'lg';

interface CarLoaderProps {
    size?: LoaderSize;
    label?: string;
    className?: string;
}

const sizes = {
    sm: { width: 64, height: 32, fontSize: 'text-xs' },
    md: { width: 128, height: 64, fontSize: 'text-sm' },
    lg: { width: 192, height: 96, fontSize: 'text-base' },
};

export function CarLoader({ size = 'md', label = 'Loading...', className = '' }: CarLoaderProps) {
    const { width, height, fontSize } = sizes[size];

    return (
        <div
            role="status"
            aria-live="polite"
            className={`flex flex-col items-center justify-center p-4 ${className}`}
        >
            <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        @keyframes dash {
          to { stroke-dashoffset: -20; }
        }
        @keyframes speedLine {
          0% { transform: translateX(0); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateX(-20px); opacity: 0; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-spin-wheel {
          transform-origin: center;
          animation: spin 0.8s linear infinite;
        }
        .animate-bob {
          animation: bob 1s ease-in-out infinite;
        }
        .animate-speed-line {
          animation: speedLine 0.8s linear infinite;
        }
        .shimmer-mask {
          mask-image: linear-gradient(
            60deg,
            black 25%,
            rgba(0, 0, 0, 0.2) 50%,
            black 75%
          );
          mask-size: 400%;
          mask-position: 0 0;
        }
      `}</style>

            <div className="relative" style={{ width, height }}>
                {/* Speed Lines */}
                <div className="absolute left-0 bottom-2 -translate-x-4 opacity-50">
                    <div className="h-0.5 w-6 bg-indigo-300 rounded animate-speed-line" style={{ animationDelay: '0s' }} />
                    <div className="h-0.5 w-4 bg-indigo-300 rounded mt-1 animate-speed-line" style={{ animationDelay: '0.2s' }} />
                    <div className="h-0.5 w-8 bg-indigo-300 rounded mt-1 animate-speed-line" style={{ animationDelay: '0.4s' }} />
                </div>

                {/* Car SVG */}
                <svg
                    viewBox="0 0 100 50"
                    className="w-full h-full animate-bob text-indigo-600"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Car Body */}
                    <path
                        d="M10,25 C10,25 15,15 25,15 H55 C65,15 70,25 70,25 H85 C90,25 90,30 90,35 V40 H10 V25 Z"
                        fill="currentColor"
                        className="drop-shadow-sm"
                    />
                    {/* Windows */}
                    <path
                        d="M27,18 H53 V24 H22 C24,20 27,18 27,18 Z"
                        fill="white"
                        fillOpacity="0.8"
                    />
                    <path
                        d="M56,18 H66 C68,22 69,24 69,24 H56 V18 Z"
                        fill="white"
                        fillOpacity="0.8"
                    />

                    {/* Shimmer Overlay on Body */}
                    <defs>
                        <linearGradient id="shimmerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="white" stopOpacity="0" />
                            <stop offset="50%" stopColor="white" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="white" stopOpacity="0" />
                        </linearGradient>
                        <clipPath id="carBodyClip">
                            <path d="M10,25 C10,25 15,15 25,15 H55 C65,15 70,25 70,25 H85 C90,25 90,30 90,35 V40 H10 V25 Z" />
                        </clipPath>
                    </defs>
                    <rect
                        x="0" y="0" width="100" height="50"
                        fill="url(#shimmerGrad)"
                        clipPath="url(#carBodyClip)"
                        style={{ animation: 'shimmer 2s infinite linear' }}
                    />

                    {/* Wheels */}
                    <g className="animate-spin-wheel" style={{ transformBox: 'fill-box' }}>
                        <circle cx="25" cy="40" r="7" fill="#374151" />
                        <circle cx="25" cy="40" r="3" fill="#9CA3AF" />
                        <path d="M25,33 V47 M18,40 H32" stroke="#4B5563" strokeWidth="2" />
                    </g>

                    <g className="animate-spin-wheel" style={{ transformBox: 'fill-box' }}>
                        <circle cx="75" cy="40" r="7" fill="#374151" />
                        <circle cx="75" cy="40" r="3" fill="#9CA3AF" />
                        <path d="M75,33 V47 M68,40 H82" stroke="#4B5563" strokeWidth="2" />
                    </g>
                </svg>
            </div>

            {label && (
                <div className={`mt-2 font-medium text-gray-500 animate-pulse ${fontSize}`}>
                    {label}
                </div>
            )}
            <span className="sr-only">{label}</span>
        </div>
    );
}
