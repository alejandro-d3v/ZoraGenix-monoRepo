import React from 'react';

const ZoraLogo = ({ 
  className = '', 
  size = 40, 
  color = 'currentColor',
  animated = false,
  strokeWidth = 0
}) => {
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <svg 
        width={size} 
        height={size * 0.89} // Nueva proporción optimizada (128.22/114.26)
        viewBox="87.12328767123287 153.714 128.21917808219177 114.25800000000001" 
        className={`${animated ? 'animate-pulse' : ''}`}
        style={{ filter: 'drop-shadow(0 2px 8px rgba(59, 130, 246, 0.3))' }}
      >
        <defs>
          {/* Gradiente para hacer el logo más atractivo */}
          <linearGradient id="zoraGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          
          {/* Gradiente alternativo para modo oscuro */}
          <linearGradient id="zoraGradientDark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="50%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        
        <g>
          {/* Cuerpo principal de Zora - Optimizado */}
          <path 
            fill={color === 'gradient' ? 'url(#zoraGradient)' : color === 'gradientDark' ? 'url(#zoraGradientDark)' : color}
            stroke={strokeWidth > 0 ? (color === 'gradient' ? 'url(#zoraGradient)' : color === 'gradientDark' ? 'url(#zoraGradientDark)' : color) : 'none'}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            strokeLinecap="round"
            d="m172 160.4c-2.5 0.6-7.9 3.1-12 5.5-4.1 2.4-13.9 7.2-21.8 10.6-29.6 13.1-41.1 23.7-46.7 43-4.4 14.9 2.4 31.4 15.4 37.9 9.8 4.9 14.7 5.9 25 5.1 5.3-0.4 19.7-1 32.1-1.4 17.4-0.5 23.5-1.1 26.9-2.4 7.8-3 14.6-9.1 18.7-16.7 2.6-4.8 2.6-18.4 0.1-25.7-3.7-10.6-12.6-21.8-24.2-30.3-12.1-8.9-14.3-13.5-8.6-18.3 6-5 15.3-4.1 15.9 1.6 0.4 3.4 2.9 3.5 4.4 0.2 1-2.1 0.8-3-0.9-5.3-1.1-1.5-3.1-3.3-4.4-3.9-3-1.6-14-1.5-19.9 0.1zm18.9 0.7c1.8 0.7 3.8 2.4 4.7 4.1 1.4 2.8 1.4 3.2 0 4.6-1.5 1.5-1.6 1.4-1.6-0.5 0-2.9-4.5-6.3-8.4-6.3-3.2 0-9.2 3-11.3 5.8-1.9 2.4-1.6 6.6 0.8 9.6 1.1 1.5 5.7 5.4 10 8.7 30.6 23.3 34.4 56.2 8 69.1l-6.6 3.3-18 0.1c-9.9 0.1-22.8 0.7-28.7 1.4-16.3 1.9-25.1 0.3-36-6.8-7.7-5-13.5-17.9-12.5-27.6 1.2-11.6 9.1-25.7 18.6-33.3 3.1-2.4 11.7-7.4 19.1-10.9 7.4-3.6 19.8-9.7 27.5-13.5 7.7-3.9 15.6-7.4 17.5-7.9 5.2-1.2 13.3-1.2 16.9 0.1z"
          />
          
          {/* Detalles faciales */}
          <path 
            fill={color === 'gradient' ? 'url(#zoraGradient)' : color === 'gradientDark' ? 'url(#zoraGradientDark)' : color}
            stroke={strokeWidth > 0 ? (color === 'gradient' ? 'url(#zoraGradient)' : color === 'gradientDark' ? 'url(#zoraGradientDark)' : color) : 'none'}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            strokeLinecap="round"
            d="m152.9 194c-0.1 0.8-0.3 2.6-0.4 3.9-0.3 2.5-2 4.1-4.5 4.1-1.3 0-1.3-0.1 0-1 0.8-0.5 1.2-1 0.8-1-0.3 0-1.4-0.3-2.3-0.7-1.5-0.5-1.6-0.3-0.7 1.4 0.6 1.1 2.7 3.9 4.6 6.1l3.4 4.1 3.7-4.4c2-2.5 3.3-5 3-5.5-0.4-0.6-0.1-0.9 0.6-0.8 0.6 0.2 1.4-0.4 1.7-1.2 0.4-1.2 0.1-1.1-2 0.2-2 1.3-2.8 1.4-3.8 0.5-1-0.9-1.1-0.9-0.6 0.3 0.4 0.8 0.1 0.6-0.8-0.4-0.8-1-1.3-2.3-1-2.7 0.3-0.5 0-1.7-0.5-2.6-0.8-1.5-1.1-1.5-1.2-0.3zm2.1 9c0 1.1-0.5 2-1.1 2-0.5 0-0.7 0.6-0.3 1.2 0.4 0.7 0.3 0.9-0.1 0.5-1.1-0.9-1.6-3.8-0.9-4.9 1-1.5 2.4-0.8 2.4 1.2z"
          />
          
          {/* Ojo derecho */}
          <path 
            fill={color === 'gradient' ? 'url(#zoraGradient)' : color === 'gradientDark' ? 'url(#zoraGradientDark)' : color}
            stroke={strokeWidth > 0 ? (color === 'gradient' ? 'url(#zoraGradient)' : color === 'gradientDark' ? 'url(#zoraGradientDark)' : color) : 'none'}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            strokeLinecap="round"
            d="m171.6 216.5c-0.7 2 1 10.8 2.9 14.5 2.7 5.1 9.5 4.9 9.5-0.3 0-3.3-3.9-10.4-7.2-13.2-3.4-2.9-4.4-3.1-5.2-1zm8.3 10.5c1 3 0.6 4-1.5 4-1.4 0-4.7-7.7-3.8-9.1 0.9-1.4 4.1 1.7 5.3 5.1z"
          />
          
          {/* Ojo izquierdo */}
          <path 
            fill={color === 'gradient' ? 'url(#zoraGradient)' : color === 'gradientDark' ? 'url(#zoraGradientDark)' : color}
            stroke={strokeWidth > 0 ? (color === 'gradient' ? 'url(#zoraGradient)' : color === 'gradientDark' ? 'url(#zoraGradientDark)' : color) : 'none'}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            strokeLinecap="round"
            d="m129.7 219.7c-4.9 5.3-7.2 13.8-4.2 16.3 2.2 1.8 4.7 0.8 6.9-2.9 2.1-3.6 4.8-13.9 4-15.3-1-1.6-4.1-0.7-6.7 1.9zm1.8 9.8c-1.6 3.2-4.5 4.9-4.5 2.6 0-1.9 2.2-6.6 3.8-8.5 1.7-1.8 1.7-1.8 2 0.2 0.2 1.2-0.4 3.7-1.3 5.7z"
          />
          
          {/* Boca */}
          <path 
            fill={color === 'gradient' ? 'url(#zoraGradient)' : color === 'gradientDark' ? 'url(#zoraGradientDark)' : color}
            stroke={strokeWidth > 0 ? (color === 'gradient' ? 'url(#zoraGradient)' : color === 'gradientDark' ? 'url(#zoraGradientDark)' : color) : 'none'}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            strokeLinecap="round"
            d="m162.7 238.5c-0.7 1.7-3.9 2-6.7 0.5-1.3-0.7-2.7-0.5-5 0.6-2.9 1.5-3.3 1.5-5.1-0.2-1-0.9-1.9-1.2-1.9-0.7 0 2.4 3.1 3.7 6.2 2.5 1.6-0.6 5.1-0.8 7.9-0.5 4 0.5 5 0.3 5.5-1.1 0.4-0.9 0.4-1.9 0.1-2.2-0.2-0.3-0.7 0.2-1 1.1z"
          />
          
          {/* Detalle inferior */}
          <path 
            fill={color === 'gradient' ? 'url(#zoraGradient)' : color === 'gradientDark' ? 'url(#zoraGradientDark)' : color}
            stroke={strokeWidth > 0 ? (color === 'gradient' ? 'url(#zoraGradient)' : color === 'gradientDark' ? 'url(#zoraGradientDark)' : color) : 'none'}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            strokeLinecap="round"
            d="m162 256.1c-1.8 0.5-1 0.7 2.8 0.8 2.8 0.1 5.2-0.1 5.2-0.3 0-0.8-5.6-1.2-8-0.5z"
          />
        </g>
      </svg>
    </div>
  );
};

export default ZoraLogo;
