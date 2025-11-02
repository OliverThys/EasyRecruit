'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { EasyRecruitLogo } from './easyrecruit-logo';

interface MaolysBrandingProps {
  variant?: 'footer' | 'header' | 'centered';
  showLogo?: boolean;
  className?: string;
}

export function MaolysBranding({ 
  variant = 'footer', 
  showLogo = true,
  className = '' 
}: MaolysBrandingProps) {
  const [imageError, setImageError] = useState(false);

  if (variant === 'footer') {
    return (
      <div className={`flex flex-col items-center gap-3 ${className}`}>
        {showLogo && (
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-500">by</div>
            <div className="relative w-20 h-6">
              {!imageError ? (
                <Image
                  src="/Maolys_logo.png"
                  alt="Maolys"
                  fill
                  className="object-contain"
                  priority={false}
                  onError={() => setImageError(true)}
                />
              ) : (
                <span className="text-sm font-semibold text-gray-700">Maolys</span>
              )}
            </div>
          </div>
        )}
        {!showLogo && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>by</span>
            <div className="relative w-16 h-5">
              {!imageError ? (
                <Image
                  src="/Maolys_logo.png"
                  alt="Maolys"
                  fill
                  className="object-contain"
                  priority={false}
                  onError={() => setImageError(true)}
                />
              ) : (
                <span className="text-xs font-semibold text-gray-700">Maolys</span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'header') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <EasyRecruitLogo size="sm" showText={true} />
        <div className="h-4 w-px bg-gray-300"></div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500">by</span>
          <div className="relative w-16 h-4">
            {!imageError ? (
              <Image
                src="/Maolys_logo.png"
                alt="Maolys"
                fill
                className="object-contain"
                priority={false}
                onError={() => setImageError(true)}
              />
            ) : (
              <span className="text-xs font-semibold text-gray-700">Maolys</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // centered variant
  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <EasyRecruitLogo size="lg" showText={true} />
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>by</span>
        <div className="relative w-20 h-6">
          {!imageError ? (
            <Image
              src="/Maolys_logo.png"
              alt="Maolys"
              fill
              className="object-contain"
              priority={false}
              onError={() => setImageError(true)}
            />
          ) : (
            <span className="text-sm font-semibold text-gray-700">Maolys</span>
          )}
        </div>
      </div>
    </div>
  );
}

