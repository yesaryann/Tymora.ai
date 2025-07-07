// YouTube content script for Tymora.ai
let settings = {};
let observer = null;
let shortsObserver = null;
let navigationObserver = null;
let isInitialized = false;
let isBlocking = false;

// Store original element states for proper restoration
const originalStates = new Map();

// Load settings from storage
function loadSettings() {
  chrome.storage.sync.get(['tymora-platform-settings'], (result) => {
    if (result['tymora-platform-settings']) {
      const platforms = result['tymora-platform-settings'];
      const youtubeSettings = platforms.find(p => p.id === 'youtube');
      if (youtubeSettings) {
        const previousSettings = { ...settings };
        settings = youtubeSettings;
        
        console.log('📋 Loaded YouTube settings:', settings);
        
        if (!isInitialized) {
          isInitialized = true;
          applyBlocking();
        } else {
          // Check if settings changed
          const settingsChanged = JSON.stringify(previousSettings) !== JSON.stringify(settings);
          if (settingsChanged) {
            console.log('🔄 Settings changed, reapplying...');
            applyBlocking();
          }
        }
      } else {
        console.log('⚠️ No YouTube settings found, ensuring nothing is blocked');
        settings = {
          id: 'youtube',
          name: 'YouTube',
          category: 'Streaming',
          enabled: false,
          options: [
            { id: 'hide-shorts', label: 'Hide Shorts', enabled: false },
            { id: 'hide-recommendations', label: 'Hide Recommendations', enabled: false },
            { id: 'hide-trending', label: 'Hide Trending', enabled: false }
          ]
        };
        if (!isInitialized) {
          isInitialized = true;
          // Ensure nothing is blocked by default
          cleanupBlocking();
        }
      }
    } else {
      console.log('⚠️ No platform settings found, ensuring nothing is blocked');
      settings = {
        id: 'youtube',
        name: 'YouTube',
        category: 'Streaming',
        enabled: false,
        options: [
          { id: 'hide-shorts', label: 'Hide Shorts', enabled: false },
          { id: 'hide-recommendations', label: 'Hide Recommendations', enabled: false },
          { id: 'hide-trending', label: 'Hide Trending', enabled: false }
        ]
      };
      if (!isInitialized) {
        isInitialized = true;
        // Ensure nothing is blocked by default
        cleanupBlocking();
      }
    }
  });
}

// Apply blocking based on settings
function applyBlocking() {
  console.log('🔄 Tymora.ai: Checking YouTube blocking settings...');
  console.log('Settings enabled:', settings.enabled);
  console.log('Hide shorts option:', settings.options?.find(opt => opt.id === 'hide-shorts'));

  // Always clean up first to prevent conflicts
  cleanupBlocking();

  // Check if blocking should be enabled
  const shouldBlockShorts = settings.enabled && 
                           settings.options?.find(opt => opt.id === 'hide-shorts')?.enabled;
  const shouldBlockRecommendations = settings.enabled && 
                                   settings.options?.find(opt => opt.id === 'hide-recommendations')?.enabled;
  const shouldBlockTrending = settings.enabled && 
                            settings.options?.find(opt => opt.id === 'hide-trending')?.enabled;

  if (!settings.enabled) {
    console.log('✅ YouTube blocking completely disabled');
    isBlocking = false;
    return;
  }

  console.log('🚫 Tymora.ai: Applying YouTube blocking...');
  isBlocking = true;

  // Block YouTube Shorts only if enabled
  if (shouldBlockShorts) {
    console.log('🚫 Shorts blocking enabled');
    blockShorts();
    setupShortsObserver();
    setupNavigationObserver();
  } else {
    console.log('✅ Shorts blocking disabled');
  }

  // Block Recommendations only if enabled
  if (shouldBlockRecommendations) {
    console.log('🚫 Recommendations blocking enabled');
    blockRecommendations();
  } else {
    console.log('✅ Recommendations blocking disabled');
  }

  // Block Trending only if enabled
  if (shouldBlockTrending) {
    console.log('🚫 Trending blocking enabled');
    blockTrending();
  } else {
    console.log('✅ Trending blocking disabled');
  }

  // Set up observer for dynamic content only if any blocking is enabled
  if (shouldBlockShorts || shouldBlockRecommendations || shouldBlockTrending) {
    setupObserver();
  }
}

function storeOriginalState(element, property, value) {
  const key = `${element.tagName}-${element.className}-${property}`;
  if (!originalStates.has(key)) {
    originalStates.set(key, value);
  }
}

function getOriginalState(element, property) {
  const key = `${element.tagName}-${element.className}-${property}`;
  return originalStates.get(key) || '';
}

function blockShorts() {
  console.log('🚫 Blocking YouTube Shorts');
  
  // Comprehensive but safe list of Shorts-related selectors
  const shortsSelectors = [
    // Shorts shelf on homepage - be specific to avoid blocking regular videos
    'ytd-rich-shelf-renderer[is-shorts=""]',
    'ytd-reel-shelf-renderer',
    'ytd-shorts-shelf-renderer',
    
    // Shorts navigation tab - very specific
    'tp-yt-paper-tab[tab-identifier="FEshorts"]',
    'yt-tab-shape[tab-identifier="FEshorts"]',
    '[tab-identifier="FEshorts"]',
    
    // Shorts containers - avoid generic selectors
    '#shorts-container',
    'ytd-shorts',
    
    // Mobile shorts elements
    '.mobile-topbar-header-endpoint[href*="shorts"]'
  ];

  shortsSelectors.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (!element.hasAttribute('data-tymora-hidden')) {
          // Store original display value
          const originalDisplay = window.getComputedStyle(element).display;
          storeOriginalState(element, 'display', originalDisplay);
          
          element.style.setProperty('display', 'none', 'important');
          element.setAttribute('data-tymora-hidden', 'shorts');
          element.setAttribute('data-tymora-type', 'navigation');
        }
      });
    } catch (error) {
      console.log('Error applying selector:', selector, error);
    }
  });

  // Handle shorts videos in feeds more carefully
  blockShortsInFeeds();

  // Check if currently on a Shorts page and redirect
  if (window.location.pathname.includes('/shorts/')) {
    console.log('🚫 Redirecting from YouTube Shorts page');
    redirectFromShorts();
  }
}

function blockShortsInFeeds() {
  // Find shorts videos in feeds without breaking regular video functionality
  const videoContainers = document.querySelectorAll('ytd-video-renderer, ytd-compact-video-renderer, ytd-grid-video-renderer, ytd-rich-item-renderer');
  
  videoContainers.forEach(container => {
    const shortsLink = container.querySelector('a[href*="/shorts/"]');
    if (shortsLink && !container.hasAttribute('data-tymora-hidden')) {
      // Store original display value
      const originalDisplay = window.getComputedStyle(container).display;
      storeOriginalState(container, 'display', originalDisplay);
      
      container.style.setProperty('display', 'none', 'important');
      container.setAttribute('data-tymora-hidden', 'shorts');
      container.setAttribute('data-tymora-type', 'video');
    }
  });
}

function redirectFromShorts() {
  // Use a more gentle redirect approach
  const currentUrl = window.location.href;
  
  // Try to go back in history first
  if (window.history.length > 1 && document.referrer && !document.referrer.includes('/shorts/')) {
    window.history.back();
  } else {
    // Redirect to home page
    window.location.replace('https://www.youtube.com/');
  }
}

function restoreShorts() {
  console.log('✅ Restoring YouTube Shorts');
  
  // Restore all hidden shorts elements with their original display values
  const hiddenShortsElements = document.querySelectorAll('[data-tymora-hidden="shorts"]');
  hiddenShortsElements.forEach(element => {
    const originalDisplay = getOriginalState(element, 'display') || '';
    
    // Remove the important flag and restore original display
    element.style.removeProperty('display');
    if (originalDisplay && originalDisplay !== 'none') {
      element.style.display = originalDisplay;
    }
    
    element.removeAttribute('data-tymora-hidden');
    element.removeAttribute('data-tymora-type');
  });
}

function setupShortsObserver() {
  // Disconnect existing shorts observer
  if (shortsObserver) {
    shortsObserver.disconnect();
  }

  // Create dedicated observer for Shorts elements
  shortsObserver = new MutationObserver((mutations) => {
    let shouldReapply = false;
    
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node;
          
          // Only check for specific shorts-related additions
          if (element.querySelector && (
            element.querySelector('[tab-identifier="FEshorts"]') ||
            element.querySelector('ytd-reel-shelf-renderer') ||
            element.querySelector('ytd-rich-shelf-renderer[is-shorts]') ||
            element.querySelector('ytd-shorts-shelf-renderer')
          )) {
            shouldReapply = true;
          }
          
          // Check if the node itself is shorts navigation
          if (element.matches && (
            element.matches('[tab-identifier="FEshorts"]') ||
            element.matches('ytd-reel-shelf-renderer') ||
            element.matches('ytd-rich-shelf-renderer[is-shorts]') ||
            element.matches('ytd-shorts-shelf-renderer')
          )) {
            shouldReapply = true;
          }
        }
      });
    });

    if (shouldReapply) {
      // Debounce reapplication
      clearTimeout(window.tymoraShortsTimeout);
      window.tymoraShortsTimeout = setTimeout(() => {
        const shouldBlockShorts = settings.enabled && 
                                 settings.options?.find(opt => opt.id === 'hide-shorts')?.enabled;
        if (shouldBlockShorts) {
          blockShorts();
        }
      }, 100);
    }
  });

  // Start observing with optimized configuration
  shortsObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}

function setupNavigationObserver() {
  // Disconnect existing navigation observer
  if (navigationObserver) {
    navigationObserver.disconnect();
  }

  // Monitor URL changes for SPA navigation
  let currentUrl = window.location.href;
  
  const checkNavigation = () => {
    if (window.location.href !== currentUrl) {
      const newUrl = window.location.href;
      const oldUrl = currentUrl;
      currentUrl = newUrl;
      
      // If navigating to shorts and blocking is enabled, redirect
      const shouldBlockShorts = settings.enabled && 
                               settings.options?.find(opt => opt.id === 'hide-shorts')?.enabled;
      
      if (newUrl.includes('/shorts/') && shouldBlockShorts) {
        console.log('🚫 Intercepting navigation to Shorts');
        redirectFromShorts();
      }
    }
  };

  // Use multiple methods to detect navigation
  navigationObserver = new MutationObserver(checkNavigation);
  
  // Observe changes to the document
  navigationObserver.observe(document, {
    childList: true,
    subtree: true
  });

  // Also listen for popstate events
  window.addEventListener('popstate', checkNavigation);
}

function blockRecommendations() {
  console.log('🚫 Blocking YouTube Recommendations');
  
  const recommendationSelectors = [
    '#related',
    '#secondary',
    'ytd-watch-next-secondary-results-renderer'
  ];

  recommendationSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      if (!element.hasAttribute('data-tymora-hidden')) {
        const originalDisplay = window.getComputedStyle(element).display;
        storeOriginalState(element, 'display', originalDisplay);
        
        element.style.setProperty('display', 'none', 'important');
        element.setAttribute('data-tymora-hidden', 'recommendations');
      }
    });
  });
}

function blockTrending() {
  console.log('🚫 Blocking YouTube Trending');
  
  const trendingSelectors = [
    'a[href="/feed/trending"]',
    'ytd-guide-entry-renderer:has(a[href="/feed/trending"])'
  ];

  trendingSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      if (!element.hasAttribute('data-tymora-hidden')) {
        const originalDisplay = window.getComputedStyle(element).display;
        storeOriginalState(element, 'display', originalDisplay);
        
        element.style.setProperty('display', 'none', 'important');
        element.setAttribute('data-tymora-hidden', 'trending');
      }
    });
  });
}

function cleanupBlocking() {
  console.log('🧹 Cleaning up YouTube blocking');
  
  // Restore all hidden elements
  const hiddenElements = document.querySelectorAll('[data-tymora-hidden]');
  hiddenElements.forEach(element => {
    const hiddenType = element.getAttribute('data-tymora-hidden');
    const originalDisplay = getOriginalState(element, 'display') || '';
    
    // Remove the important flag and restore original display
    element.style.removeProperty('display');
    if (originalDisplay && originalDisplay !== 'none') {
      element.style.display = originalDisplay;
    }
    
    element.removeAttribute('data-tymora-hidden');
    element.removeAttribute('data-tymora-type');
  });

  // Disconnect all observers
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  
  if (shortsObserver) {
    shortsObserver.disconnect();
    shortsObserver = null;
  }
  
  if (navigationObserver) {
    navigationObserver.disconnect();
    navigationObserver = null;
  }

  // Clear timeouts
  clearTimeout(window.tymoraShortsTimeout);
  clearTimeout(window.tymoraReapplyTimeout);
  
  isBlocking = false;
}

function setupObserver() {
  // Disconnect existing observer
  if (observer) {
    observer.disconnect();
  }

  // Create new observer for general dynamic content
  observer = new MutationObserver((mutations) => {
    let shouldReapply = false;
    
    mutations.forEach((mutation) => {
      // Only reapply if significant changes occurred
      if (mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE && 
              (node.tagName === 'YTD-VIDEO-RENDERER' || 
               node.tagName === 'YTD-RICH-SHELF-RENDERER' ||
               node.tagName === 'YTD-GUIDE-ENTRY-RENDERER')) {
            shouldReapply = true;
          }
        });
      }
    });

    if (shouldReapply && isBlocking) {
      // Debounce reapplication
      clearTimeout(window.tymoraReapplyTimeout);
      window.tymoraReapplyTimeout = setTimeout(() => {
        if (settings.enabled) {
          applyBlocking();
        }
      }, 200);
    }
  });

  // Start observing with limited scope
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Listen for settings updates
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'settingsUpdated') {
    console.log('📨 Received settings update:', request.settings);
    
    const youtubeSettings = request.settings.find(p => p.id === 'youtube');
    if (youtubeSettings) {
      const previousSettings = { ...settings };
      settings = youtubeSettings;
      
      console.log('🔄 Updated settings:', settings);
      
      // Check if shorts blocking state changed
      const previousShortsBlocking = previousSettings.enabled && 
                                   previousSettings.options?.find(opt => opt.id === 'hide-shorts')?.enabled;
      const currentShortsBlocking = settings.enabled && 
                                  settings.options?.find(opt => opt.id === 'hide-shorts')?.enabled;
      
      console.log(`Shorts blocking: ${previousShortsBlocking} → ${currentShortsBlocking}`);
      
      if (previousShortsBlocking !== currentShortsBlocking) {
        console.log(`🔄 Shorts blocking changed: ${previousShortsBlocking} → ${currentShortsBlocking}`);
        
        if (!currentShortsBlocking) {
          // Immediately restore shorts when disabled
          restoreShorts();
          if (shortsObserver) {
            shortsObserver.disconnect();
            shortsObserver = null;
          }
          if (navigationObserver) {
            navigationObserver.disconnect();
            navigationObserver = null;
          }
        }
      }
      
      // Apply all blocking settings
      applyBlocking();
    } else {
      // No YouTube settings found, remove blocking
      console.log('⚠️ No YouTube settings in update, cleaning up blocking');
      cleanupBlocking();
    }
  }
});

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM loaded, initializing YouTube content script');
    loadSettings();
  });
} else {
  console.log('📄 Document ready, initializing YouTube content script');
  loadSettings();
}

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && isInitialized && isBlocking) {
    // Page became visible, reapply blocking after a short delay
    setTimeout(() => {
      if (settings.enabled) {
        console.log('👁️ Page visible, reapplying blocking');
        applyBlocking();
      }
    }, 500);
  }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  console.log('🚪 Page unloading, cleaning up');
  cleanupBlocking();
});

// Handle focus events to ensure video playback works
window.addEventListener('focus', () => {
  // When window gains focus, ensure video elements are not blocked
  const videos = document.querySelectorAll('video');
  videos.forEach(video => {
    if (video.hasAttribute('data-tymora-hidden')) {
      video.removeAttribute('data-tymora-hidden');
      video.style.removeProperty('display');
    }
  });
});

// Debug function to check current state
window.tymoraDebug = () => {
  console.log('🐛 Tymora Debug Info:');
  console.log('Settings:', settings);
  console.log('Is initialized:', isInitialized);
  console.log('Is blocking:', isBlocking);
  console.log('Hidden elements:', document.querySelectorAll('[data-tymora-hidden]').length);
};

console.log('🚀 Tymora.ai YouTube content script loaded');