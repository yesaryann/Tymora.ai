// Twitter/X content script for Tymora.ai
let settings = {};
let observer = null;

function loadSettings() {
  chrome.storage.sync.get(['tymora-platform-settings'], (result) => {
    if (result['tymora-platform-settings']) {
      const platforms = result['tymora-platform-settings'];
      const twitterSettings = platforms.find(p => p.id === 'twitter');
      if (twitterSettings) {
        settings = twitterSettings;
        applyBlocking();
      } else {
        // No settings found, ensure nothing is blocked
        removeBlocking();
      }
    } else {
      // No settings found, ensure nothing is blocked
      removeBlocking();
    }
  });
}

function applyBlocking() {
  // Always remove existing blocking first
  removeBlocking();
  
  if (!settings.enabled) {
    console.log('🟢 Tymora.ai: Twitter/X blocking disabled');
    return;
  }

  console.log('🚫 Tymora.ai: Applying Twitter/X blocking...');

  if (settings.options?.find(opt => opt.id === 'hide-trending')?.enabled) {
    blockTrending();
  }

  if (settings.options?.find(opt => opt.id === 'hide-autoplay')?.enabled) {
    blockAutoplay();
  }

  if (settings.options?.find(opt => opt.id === 'hide-suggestions')?.enabled) {
    blockSuggestions();
  }

  setupObserver();
}

function blockTrending() {
  console.log('🚫 Blocking Twitter Trending');
  
  const trendingSelectors = [
    '[data-testid="trend"]',
    '[aria-label*="Trending"]',
    '[data-testid="sidebarColumn"] section',
    'div[aria-label="Timeline: Trending now"]'
  ];

  trendingSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      if (element.textContent?.includes('Trending') || 
          element.textContent?.includes('What\'s happening')) {
        // Only hide if not already hidden by Tymora
        if (!element.hasAttribute('data-tymora-hidden')) {
          element.style.display = 'none';
          element.setAttribute('data-tymora-hidden', 'trending');
        }
      }
    });
  });
}

function blockAutoplay() {
  console.log('🚫 Blocking Twitter Autoplay');
  
  const videos = document.querySelectorAll('video');
  videos.forEach(video => {
    if (!video.hasAttribute('data-tymora-hidden')) {
      video.autoplay = false;
      video.pause();
      video.setAttribute('data-tymora-hidden', 'autoplay');
    }
  });
}

function blockSuggestions() {
  console.log('🚫 Blocking Twitter Suggestions');
  
  const suggestionSelectors = [
    '[data-testid="UserCell"]',
    '[aria-label*="Follow"]',
    'aside[aria-label="Who to follow"]'
  ];

  suggestionSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      // Only hide if not already hidden by Tymora
      if (!element.hasAttribute('data-tymora-hidden')) {
        element.style.display = 'none';
        element.setAttribute('data-tymora-hidden', 'suggestions');
      }
    });
  });
}

function removeBlocking() {
  const hiddenElements = document.querySelectorAll('[data-tymora-hidden]');
  hiddenElements.forEach(element => {
    element.style.display = '';
    element.removeAttribute('data-tymora-hidden');
    
    // Special handling for videos
    if (element.tagName === 'VIDEO') {
      element.autoplay = true; // Restore original autoplay behavior
    }
  });

  if (observer) {
    observer.disconnect();
    observer = null;
  }
}

function setupObserver() {
  if (observer) {
    observer.disconnect();
  }

  observer = new MutationObserver((mutations) => {
    let shouldReapply = false;
    
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length > 0) {
        shouldReapply = true;
      }
    });

    if (shouldReapply) {
      clearTimeout(window.tymoraReapplyTimeout);
      window.tymoraReapplyTimeout = setTimeout(() => {
        applyBlocking();
      }, 100);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'settingsUpdated') {
    const twitterSettings = request.settings.find(p => p.id === 'twitter');
    if (twitterSettings) {
      settings = twitterSettings;
      applyBlocking();
    } else {
      // No Twitter settings found, remove blocking
      removeBlocking();
    }
  }
});

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadSettings);
} else {
  loadSettings();
}