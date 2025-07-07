import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import Toggle from './Toggle';

interface PlatformOption {
  id: string;
  label: string;
  enabled: boolean;
}

interface PlatformCardProps {
  name: string;
  enabled: boolean;
  options?: PlatformOption[];
  onToggle: (enabled: boolean) => void;
  onOptionToggle?: (optionId: string, enabled: boolean) => void;
}

const PlatformCard: React.FC<PlatformCardProps> = ({
  name,
  enabled,
  options,
  onToggle,
  onOptionToggle
}) => {
  const [expanded, setExpanded] = useState(false);

  const handleExpand = () => {
    if (options && options.length > 0) {
      setExpanded(!expanded);
    }
  };

  const handleMainToggle = (newEnabled: boolean) => {
    onToggle(newEnabled);
    
    // Show immediate user feedback
    if (newEnabled) {
      // Create a temporary visual feedback
      const notification = document.createElement('div');
      notification.textContent = `🚫 ${name} blocking activated!`;
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
      `;
      
      // Add animation keyframes
      if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
          }
        `;
        document.head.appendChild(style);
      }
      
      document.body.appendChild(notification);
      
      // Remove notification after 3 seconds
      setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }, 3000);
    }
  };

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-colors">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {options && options.length > 0 && (
            <button
              onClick={handleExpand}
              className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-gray-800"
            >
              {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          )}
          <span className="text-white font-medium">{name}</span>
          {enabled && (
            <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">
              Active
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm">
            {enabled ? 'On' : 'Off'}
          </span>
          <Toggle enabled={enabled} onChange={handleMainToggle} />
        </div>
      </div>

      {expanded && options && options.length > 0 && (
        <div className="border-t border-gray-800 bg-gray-900/30">
          <div className="p-4 space-y-3">
            {options.map((option) => (
              <div key={option.id} className="flex items-center justify-between pl-6">
                <div className="flex items-center gap-2">
                  <span className="text-gray-300 text-sm">{option.label}</span>
                  {option.enabled && (
                    <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded">
                      ON
                    </span>
                  )}
                </div>
                <Toggle
                  enabled={option.enabled}
                  onChange={(enabled) => onOptionToggle?.(option.id, enabled)}
                  size="sm"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlatformCard;