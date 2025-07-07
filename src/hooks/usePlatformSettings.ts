import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface PlatformOption {
  id: string;
  label: string;
  enabled: boolean;
}

interface Platform {
  id: string;
  name: string;
  category: string;
  enabled: boolean;
  options: PlatformOption[];
}

const defaultPlatforms: Platform[] = [
  {
    id: 'facebook',
    name: 'Facebook',
    category: 'Social Media',
    enabled: false,
    options: [
      { id: 'news-feed', label: 'News Feed', enabled: false },
      { id: 'block-reels', label: 'Block Reels', enabled: false },
      { id: 'block-watch', label: 'Block Watch', enabled: false },
    ]
  },
  {
    id: 'instagram',
    name: 'Instagram',
    category: 'Social Media',
    enabled: false,
    options: [
      { id: 'hide-reels', label: 'Hide Reels', enabled: false },
      { id: 'hide-stories', label: 'Hide Stories', enabled: false },
      { id: 'hide-explore', label: 'Hide Explore', enabled: false },
    ]
  },
  {
    id: 'youtube',
    name: 'YouTube',
    category: 'Streaming',
    enabled: false,
    options: [
      { id: 'hide-shorts', label: 'Hide Shorts', enabled: false },
      { id: 'hide-recommendations', label: 'Hide Recommendations', enabled: false },
      { id: 'hide-trending', label: 'Hide Trending', enabled: false },
    ]
  },
  {
    id: 'twitter',
    name: 'Twitter / X',
    category: 'Social Media',
    enabled: false,
    options: [
      { id: 'hide-trending', label: 'Hide Trending', enabled: false },
      { id: 'hide-autoplay', label: 'Hide Autoplay', enabled: false },
      { id: 'hide-suggestions', label: 'Hide Suggestions', enabled: false },
    ]
  },
];

// Check if running in extension context
const isExtension = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;

// Sync settings with extension storage and Supabase
const syncSettings = async (platforms: Platform[], userId?: string) => {
  if (isExtension) {
    // Send settings to background script
    try {
      await chrome.runtime.sendMessage({
        action: 'updateSettings',
        settings: platforms
      });
    } catch (error) {
      console.log('Extension context not available:', error);
    }
  }

  // Save to Supabase if user is authenticated
  if (userId) {
    try {
      await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          platform_settings: platforms,
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error saving to Supabase:', error);
    }
  }
};

export const usePlatformSettings = () => {
  const [platforms, setPlatforms] = useState<Platform[]>(defaultPlatforms);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get current user and load settings
    const initializeSettings = async () => {
      try {
        // Check for persistent auth in extension
        if (isExtension) {
          const authResult = await chrome.runtime.sendMessage({ action: 'getAuthToken' });
          if (authResult.isValid && authResult.userData) {
            setUser(authResult.userData);
            
            // Set Supabase session
            await supabase.auth.setSession({
              access_token: authResult.token,
              refresh_token: authResult.token
            });
          }
        }

        // Get current user from Supabase
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          
          // Load settings from Supabase
          try {
            const { data, error } = await supabase
              .from('user_settings')
              .select('platform_settings')
              .eq('user_id', user.id)
              .single();

            if (data?.platform_settings) {
              setPlatforms(data.platform_settings);
            }
          } catch (error) {
            console.log('No existing settings found, using defaults');
          }
        } else if (isExtension) {
          // Load from extension storage if not authenticated
          chrome.storage.sync.get(['tymora-platform-settings'], (result) => {
            if (result['tymora-platform-settings']) {
              setPlatforms(result['tymora-platform-settings']);
            }
          });
        } else {
          // Load from localStorage for web version
          const saved = localStorage.getItem('tymora-platform-settings');
          if (saved) {
            setPlatforms(JSON.parse(saved));
          }
        }
      } catch (error) {
        console.error('Error initializing settings:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeSettings();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        
        // Save auth token to extension storage for persistence
        if (isExtension && session.access_token) {
          await chrome.runtime.sendMessage({
            action: 'saveAuthToken',
            token: session.access_token,
            userData: session.user
          });
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        
        // Clear auth from extension storage
        if (isExtension) {
          await chrome.runtime.sendMessage({ action: 'clearAuth' });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading) {
      // Sync settings whenever they change
      syncSettings(platforms, user?.id);
      
      // Also save to localStorage for web version
      if (!isExtension) {
        localStorage.setItem('tymora-platform-settings', JSON.stringify(platforms));
      }
    }
  }, [platforms, user?.id, loading]);

  const togglePlatform = (platformId: string, enabled: boolean) => {
    setPlatforms(prev => {
      const updated = prev.map(platform => 
        platform.id === platformId 
          ? { 
              ...platform, 
              enabled,
              // When enabling a platform, enable all its options by default
              options: enabled 
                ? platform.options.map(opt => ({ ...opt, enabled: true }))
                : platform.options.map(opt => ({ ...opt, enabled: false }))
            }
          : platform
      );
      
      // Show user feedback
      const platform = updated.find(p => p.id === platformId);
      if (platform) {
        if (enabled) {
          console.log(`✅ ${platform.name} blocking enabled - All features will be blocked`);
        } else {
          console.log(`❌ ${platform.name} blocking disabled`);
        }
      }
      
      return updated;
    });
  };

  const togglePlatformOption = (platformId: string, optionId: string, enabled: boolean) => {
    setPlatforms(prev => {
      const updated = prev.map(platform =>
        platform.id === platformId
          ? {
              ...platform,
              options: platform.options.map(option =>
                option.id === optionId
                  ? { ...option, enabled }
                  : option
              )
            }
          : platform
      );
      
      // Show user feedback for specific option
      const platform = updated.find(p => p.id === platformId);
      const option = platform?.options.find(o => o.id === optionId);
      if (platform && option) {
        if (enabled) {
          console.log(`✅ ${platform.name} - ${option.label} blocking enabled`);
        } else {
          console.log(`❌ ${platform.name} - ${option.label} blocking disabled`);
        }
      }
      
      return updated;
    });
  };

  const filterPlatformsByCategory = (category: string) => {
    if (category === 'All') return platforms;
    return platforms.filter(platform => platform.category === category);
  };

  return {
    platforms,
    togglePlatform,
    togglePlatformOption,
    filterPlatformsByCategory,
    loading,
    user
  };
};