'use client';

import React from 'react';

interface EasyRecruitLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export function EasyRecruitLogo({ size = 'md', showText = true, className = '' }: EasyRecruitLogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo SVG */}
      <div className={`${sizeClasses[size]} flex-shrink-0`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Background circle with gradient */}
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#4F46E5" />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>

          {/* Main circle */}
          <circle cx="50" cy="50" r="45" fill="url(#gradient1)" />

          {/* Professional badge/person icon - representing recruitment */}
          {/* Badge base */}
          <circle cx="50" cy="50" r="22" fill="white" opacity="0.95" />
          
          {/* Person silhouette */}
          {/* Head */}
          <circle cx="50" cy="38" r="6" fill="url(#gradient2)" />
          {/* Body (torso) */}
          <path
            d="M 38 52 L 38 70 Q 38 72 40 72 L 60 72 Q 62 72 62 70 L 62 52 Z"
            fill="url(#gradient2)"
          />
          {/* Shoulders */}
          <path
            d="M 42 52 Q 42 50 44 50 L 56 50 Q 58 50 58 52 L 58 58 Q 58 60 56 60 L 44 60 Q 42 60 42 58 Z"
            fill="url(#gradient2)"
          />
          
          {/* Connection/checkmark representing successful match */}
          <path
            d="M 48 46 L 50 48 L 54 42"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Sparkle effects for modern feel */}
          <circle cx="30" cy="30" r="2.5" fill="white" opacity="0.7" />
          <circle cx="70" cy="30" r="2" fill="white" opacity="0.6" />
          <circle cx="30" cy="70" r="2" fill="white" opacity="0.6" />
          <circle cx="70" cy="70" r="2.5" fill="white" opacity="0.7" />
        </svg>
      </div>

      {/* Text */}
      {showText && (
        <span className={`font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent ${textSizes[size]}`}>
          EasyRecruit
        </span>
      )}
    </div>
  );
}

