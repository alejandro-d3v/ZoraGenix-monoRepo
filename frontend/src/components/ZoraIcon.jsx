import React from 'react';

const ZoraIcon = ({ 
  className = '', 
  size = 24, 
  color = 'currentColor' 
}) => {
  return (
    <svg 
      width={size} 
      height={size * 0.89} 
      viewBox="87.12328767123287 153.714 128.21917808219177 114.25800000000001" 
      className={className}
    >
      <defs>
        <linearGradient id="zoraIconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      
      <g>
        {/* Versión simplificada para iconos pequeños */}
        <path 
          fill={color === 'gradient' ? 'url(#zoraIconGradient)' : color}
          d="m172 160.4c-2.5 0.6-7.9 3.1-12 5.5-4.1 2.4-13.9 7.2-21.8 10.6-29.6 13.1-41.1 23.7-46.7 43-4.4 14.9 2.4 31.4 15.4 37.9 9.8 4.9 14.7 5.9 25 5.1 5.3-0.4 19.7-1 32.1-1.4 17.4-0.5 23.5-1.1 26.9-2.4 7.8-3 14.6-9.1 18.7-16.7 2.6-4.8 2.6-18.4 0.1-25.7-3.7-10.6-12.6-21.8-24.2-30.3-12.1-8.9-14.3-13.5-8.6-18.3 6-5 15.3-4.1 15.9 1.6 0.4 3.4 2.9 3.5 4.4 0.2 1-2.1 0.8-3-0.9-5.3-1.1-1.5-3.1-3.3-4.4-3.9-3-1.6-14-1.5-19.9 0.1z"
        />
        
        {/* Ojos simplificados para iconos pequeños */}
        <circle 
          fill={color === 'gradient' ? 'url(#zoraIconGradient)' : color}
          cx="140" 
          cy="225" 
          r="8"
        />
        <circle 
          fill={color === 'gradient' ? 'url(#zoraIconGradient)' : color}
          cx="180" 
          cy="225" 
          r="8"
        />
        
        {/* Boca simplificada */}
        <path 
          fill={color === 'gradient' ? 'url(#zoraIconGradient)' : color}
          d="m150 245c10 5 20 5 30 0"
          stroke={color === 'gradient' ? 'url(#zoraIconGradient)' : color}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
};

export default ZoraIcon;
