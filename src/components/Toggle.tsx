import React from 'react';

interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  size?: 'sm' | 'md';
}

const Toggle: React.FC<ToggleProps> = ({ enabled, onChange, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-4',
    md: 'w-12 h-6'
  };

  const thumbClasses = {
    sm: 'w-3 h-3',
    md: 'w-5 h-5'
  };

  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex items-center ${sizeClasses[size]} rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
        enabled ? 'bg-blue-600' : 'bg-gray-600'
      }`}
    >
      <span
        className={`inline-block ${thumbClasses[size]} rounded-full bg-white shadow-lg transform transition-transform duration-200 ${
          enabled ? (size === 'sm' ? 'translate-x-4' : 'translate-x-6') : 'translate-x-0.5'
        }`}
      />
    </button>
  );
};

export default Toggle;