// Background script for Tymora.ai extension
let dashboardTabId = null;
let shortsBlockingEnabled = false;

// Initialize default settings on install
chrome.runtime.onInstalled.addListener(() => {
  console.log('Tymora.ai extension installed');
  
  // Initialize default settings with everything DISABLED by default
  chrome.storage.sync.get(['tymora-platform-settings'], (result) => {
    if (!result['tymora-platform-settings']) {
      console.log('🔧 Initializing default settings (all disabled)');
      const defaultSettings = [
        {
          id: 'youtube',
          name: 'YouTube',
          category: 'Streaming',
          enabled: false, // DISABLED by default
          options: [
            { id: 'hide-shorts', label: 'Hide Shorts', enabled: false }, // DISABLED by default
            { id: 'hide-recommendations', label: 'Hide Recommendations', enabled: false },
            { id: 'hide-trending', label: 'Hide Trending', enabled: false }
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
            { id: 'hide-explore', label: 'Hide Explore', enabled: false }
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
            { id: 'hide-suggestions', label: 'Hide Suggestions', enabled: false }
          ]
        },
        {
          id: 'facebook',
          name: 'Facebook',
          category: 'Social Media',
          enabled: false,
          options: [
            { id: 'news-feed', label: 'News Feed', enabled: false },
            { id: 'block-reels', label: 'Block Reels', enabled: false },
            { id: 'block-watch', label: 'Block Watch', enabled: false }
          ]
        }
      ];
      
      chrome.storage.sync.set({ 'tymora-platform-settings': defaultSettings }, () => {
        console.log('✅ Default settings saved');
        updateShortsBlocking();
      });
    } else {
      console.log('📋 Existing settings found');
      updateShortsBlocking();
    }
  });
});

// Update shorts blocking rules
async function updateShortsBlocking() {
  try {
    const result = await chrome.storage.sync.get(['tymora-platform-settings']);
    if (result['tymora-platform-settings']) {
      const platforms = result['tymora-platform-settings'];
      const youtubeSettings = platforms.find(p => p.id === 'youtube');
      const shouldBlock = youtubeSettings?.enabled && 
                         youtubeSettings.options?.find(opt => opt.id === 'hide-shorts')?.enabled;
      
      console.log('🔄 Checking shorts blocking state:', {
        youtubeEnabled: youtubeSettings?.enabled,
        shortsOption: youtubeSettings?.options?.find(opt => opt.id === 'hide-shorts'),
        shouldBlock
      });
      
      if (shouldBlock !== shortsBlockingEnabled) {
        shortsBlockingEnabled = shouldBlock;
        
        if (shouldBlock) {
          // Enable shorts blocking rules
          try {
            await chrome.declarativeNetRequest.updateEnabledRulesets({
              enableRulesetIds: ['shorts_blocking_rules']
            });
            console.log('🚫 YouTube Shorts URL blocking enabled');
          } catch (error) {
            console.log('Declarative net request not available, using content script only');
          }
        } else {
          // Disable shorts blocking rules
          try {
            await chrome.declarativeNetRequest.updateEnabledRulesets({
              disableRulesetIds: ['shorts_blocking_rules']
            });
            console.log('✅ YouTube Shorts URL blocking disabled');
          } catch (error) {
            console.log('Declarative net request not available');
          }
        }
      }
    }
  } catch (error) {
    console.error('Error updating shorts blocking:', error);
  }
}

// Handle extension icon click - open dashboard in new tab
chrome.action.onClicked.addListener(async (tab) => {
  try {
    // Check if dashboard tab already exists
    if (dashboardTabId) {
      try {
        const existingTab = await chrome.tabs.get(dashboardTabId);
        if (existingTab && existingTab.url && existingTab.url.includes('index.html')) {
          // Focus existing dashboard tab
          await chrome.tabs.update(dashboardTabId, { active: true });
          await chrome.windows.update(existingTab.windowId, { focused: true });
          return;
        }
      } catch (error) {
        // Tab doesn't exist anymore, create new one
        dashboardTabId = null;
      }
    }

    // Create new dashboard tab
    const newTab = await chrome.tabs.create({
      url: chrome.runtime.getURL('index.html'),
      active: true
    });
    
    dashboardTabId = newTab.id;
  } catch (error) {
    console.error('Error opening dashboard:', error);
  }
});

// Listen for tab removal to clean up dashboard tab reference
chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId === dashboardTabId) {
    dashboardTabId = null;
  }
});

// Listen for settings changes from dashboard
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === 'updateSettings') {
    console.log('📨 Received settings update from dashboard:', request.settings);
    
    // Save settings to storage
    await chrome.storage.sync.set({ 'tymora-platform-settings': request.settings });
    
    // Update shorts blocking rules
    await updateShortsBlocking();
    
    // Notify all content scripts about the update with a small delay
    setTimeout(() => {
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          if (tab.id && tab.url) {
            // Only send to relevant tabs
            const shouldNotify = 
              tab.url.includes('youtube.com') ||
              tab.url.includes('instagram.com') ||
              tab.url.includes('twitter.com') ||
              tab.url.includes('x.com') ||
              tab.url.includes('facebook.com');
              
            if (shouldNotify) {
              console.log(`📤 Sending settings update to tab ${tab.id} (${tab.url})`);
              chrome.tabs.sendMessage(tab.id, {
                action: 'settingsUpdated',
                settings: request.settings
              }).catch(() => {
                // Ignore errors for tabs that don't have content scripts
              });
            }
          }
        });
      });
    }, 100);
    
    sendResponse({ success: true });
  }
  
  // Handle authentication persistence
  if (request.action === 'saveAuthToken') {
    chrome.storage.local.set({ 
      'tymora-auth-token': request.token,
      'tymora-user-data': request.userData,
      'tymora-auth-timestamp': Date.now()
    });
    sendResponse({ success: true });
  }
  
  if (request.action === 'getAuthToken') {
    chrome.storage.local.get(['tymora-auth-token', 'tymora-user-data', 'tymora-auth-timestamp'], (result) => {
      const token = result['tymora-auth-token'];
      const userData = result['tymora-user-data'];
      const timestamp = result['tymora-auth-timestamp'];
      
      // Check if token is still valid (24 hours)
      const isValid = token && timestamp && (Date.now() - timestamp < 24 * 60 * 60 * 1000);
      
      sendResponse({ 
        token: isValid ? token : null,
        userData: isValid ? userData : null,
        isValid
      });
    });
    return true; // Keep message channel open for async response
  }
  
  if (request.action === 'clearAuth') {
    chrome.storage.local.remove(['tymora-auth-token', 'tymora-user-data', 'tymora-auth-timestamp']);
    sendResponse({ success: true });
  }
});

// Handle navigation events with improved logic - ONLY when blocking is enabled
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId === 0 && details.url.includes('/shorts/')) {
    // Check if shorts blocking is enabled
    const result = await chrome.storage.sync.get(['tymora-platform-settings']);
    if (result['tymora-platform-settings']) {
      const platforms = result['tymora-platform-settings'];
      const youtubeSettings = platforms.find(p => p.id === 'youtube');
      const shouldBlock = youtubeSettings?.enabled && 
                         youtubeSettings.options?.find(opt => opt.id === 'hide-shorts')?.enabled;
      
      if (shouldBlock) {
        console.log('🚫 Blocking navigation to Shorts via webNavigation');
        // Redirect to main YouTube page
        chrome.tabs.update(details.tabId, {
          url: 'https://www.youtube.com/'
        });
      } else {
        console.log('✅ Shorts navigation allowed (blocking disabled)');
      }
    }
  }
}, {
  url: [{ hostEquals: 'www.youtube.com' }]
});

// Listen for storage changes to update blocking rules
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes['tymora-platform-settings']) {
    console.log('📦 Storage changed, updating blocking rules');
    updateShortsBlocking();
  }
});

// Handle tab updates to ensure proper blocking - but only send settings if they exist
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('youtube.com')) {
    // Small delay to ensure page is fully loaded
    setTimeout(async () => {
      const result = await chrome.storage.sync.get(['tymora-platform-settings']);
      if (result['tymora-platform-settings']) {
        console.log(`📤 Sending initial settings to YouTube tab ${tabId}`);
        chrome.tabs.sendMessage(tabId, {
          action: 'settingsUpdated',
          settings: result['tymora-platform-settings']
        }).catch(() => {
          // Ignore errors for tabs that don't have content scripts
        });
      }
    }, 1000);
  }
});

console.log('🚀 Tymora.ai background script loaded');