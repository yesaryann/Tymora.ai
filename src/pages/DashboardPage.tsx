import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import CategoryTabs from '../components/CategoryTabs';
import PlatformCard from '../components/PlatformCard';
import { usePlatformSettings } from '../hooks/usePlatformSettings';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const { platforms, togglePlatform, togglePlatformOption, filterPlatformsByCategory, loading, user } = usePlatformSettings();

  const categories = ['All', 'Social Media', 'Streaming'];
  const filteredPlatforms = filterPlatformsByCategory(activeCategory);

  // Check if running in extension context
  const isExtension = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;

  useEffect(() => {
    // For web version, redirect to login if not authenticated
    if (!isExtension && !loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate, isExtension]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    
    // Clear extension auth if in extension context
    if (isExtension) {
      try {
        await chrome.runtime.sendMessage({ action: 'clearAuth' });
      } catch (error) {
        console.log('Extension context not available');
      }
    }
    
    // Redirect to login for web version
    if (!isExtension) {
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading your settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="pl-80 min-h-screen">
        <div className="max-w-4xl mx-auto p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">Block Apps</h1>
              <p className="text-gray-400 text-lg">
                Control which features to block on your favorite websites
              </p>
              {isExtension && (
                <div className="mt-2 inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm font-medium">Extension Active</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-white text-sm font-medium">{user.email}</p>
                    <button 
                      onClick={handleLogout}
                      className="text-gray-400 hover:text-white text-xs transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {user.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-gray-400 text-sm mb-2">Extension Mode</p>
                  <button 
                    onClick={() => navigate('/login')}
                    className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                  >
                    Sign in to sync settings
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex justify-center mb-12">
            <CategoryTabs
              categories={categories}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
          </div>

          {/* Platform Cards */}
          <div className="space-y-4">
            {filteredPlatforms.map((platform) => (
              <PlatformCard
                key={platform.id}
                name={platform.name}
                enabled={platform.enabled}
                options={platform.options}
                onToggle={(enabled) => togglePlatform(platform.id, enabled)}
                onOptionToggle={(optionId, enabled) => 
                  togglePlatformOption(platform.id, optionId, enabled)
                }
              />
            ))}
          </div>

          {/* Footer */}
          <div className="mt-16 text-center">
            <p className="text-gray-500 text-sm">
              {user 
                ? "Settings are automatically saved and synced across your devices"
                : "Settings are saved locally. Sign in to sync across devices."
              }
            </p>
            {isExtension && (
              <p className="text-gray-500 text-xs mt-2">
                Changes take effect immediately on all open tabs
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;