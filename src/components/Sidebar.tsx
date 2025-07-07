import React from 'react';
import { 
  Home, 
  Star, 
  MessageCircle, 
  Share2, 
  Download, 
  Crown, 
  Menu
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const menuItems = [
    { icon: Home, label: 'Home', active: true },
    { icon: Star, label: 'Rate us' },
    { icon: MessageCircle, label: 'Contact Us' },
    { icon: Share2, label: 'Share with Friends' },
    { icon: Download, label: 'Download the app' },
    { icon: Crown, label: 'Go Premium' },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-80 bg-black border-r border-gray-800 flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <h1 className="text-white text-xl font-semibold">Tymora.ai</h1>
        <button 
          onClick={onToggle}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4">
        {menuItems.map((item, index) => (
          <button
            key={index}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
              item.active 
                ? 'bg-gray-800 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <item.icon size={20} />
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;