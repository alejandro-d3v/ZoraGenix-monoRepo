import React from 'react';
import clsx from 'clsx';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'nanoBlue', 
  className = '',
  text = null 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    nanoBlue: 'border-nanoBlue-500',
    white: 'border-white',
    gray: 'border-gray-500'
  };

  return (
    <div className={clsx('flex flex-col items-center justify-center', className)}>
      <div
        className={clsx(
          'animate-spin rounded-full border-4 border-slate-600 border-t-transparent',
          sizeClasses[size],
          colorClasses[color]
        )}
        style={{
          borderTopColor: color === 'nanoBlue' ? '#00D4FF' : undefined
        }}
      />
      {text && (
        <p className="mt-3 text-sm text-slate-400 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;