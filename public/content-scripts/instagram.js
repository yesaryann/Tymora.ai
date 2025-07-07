// Instagram content script for Tymora.ai
let settings = {};
let observer = null;

function loadSettings() {
  chrome.storage.sync.get(['tymora-platform-settings'], (result) => {
    if (result['tymora-platform-settings']) {
      const platforms = result['tymora-platform-settings'];
      const instagramSettings = platforms.find(p => p.id === 'instagram');
      if (instagramSettings) {
        settings = instagramSettings;
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
    console.log('🟢 Tymora.ai: Instagram blocking disabled');
    return;
  }

  console.log('🚫 Tymora.ai: Applying Instagram blocking...');

  if (settings.options?.find(opt => opt.id === 'hide-reels')?.enabled) {
    blockReels();
  }

  if (settings.options?.find(opt => opt.id === 'hide-stories')?.enabled) {
    blockStories();
  }

  if (settings.options?.find(opt => opt.id === 'hide-explore')?.enabled) {
    blockExplore();
  }

  setupObserver();
}

function blockReels() {
  console.log('🚫 Blocking Instagram Reels');
  
  const reelsSelectors = [
    '[href*="/reels/"]',
    'a[href="/reels/"]',
    '[aria-label*="Reels"]',
    'div[role="tablist"] a[href*="reels"]'
  ];

  reelsSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      // Only hide if not already hidden by Tymora
      if (!element.hasAttribute('data-tymora-hidden')) {
        element.style.display = 'none';
        element.setAttribute('data-tymora-hidden', 'reels');
      }
    });
  });

  // Redirect if on Reels page
  if (window.location.pathname.includes('/reels/')) {
    console.log('🚫 Redirecting from Instagram Reels page');
    window.location.href = 'https://www.instagram.com/';
  }
}

function blockStories() {
  console.log('🚫 Blocking Instagram Stories');
  
  const storiesSelectors = [
    '[data-testid="stories-tray"]',
    'div[role="menu"] div[role="menuitem"]',
    '[aria-label*="Stories"]'
  ];

  storiesSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      // Only hide if not already hidden by Tymora
      if (!element.hasAttribute('data-tymora-hidden')) {
        element.style.display = 'none';
        element.setAttribute('data-tymora-hidden', 'stories');
      }
    });
  });
}

function blockExplore() {
  console.log('🚫 Blocking Instagram Explore');
  
  const exploreSelectors = [
    '[href="/explore/"]',
    'a[href="/explore/"]',
    '[aria-label*="Explore"]'
  ];

  exploreSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      // Only hide if not already hidden by Tymora
      if (!element.hasAttribute('data-tymora-hidden')) {
        element.style.display = 'none';
        element.setAttribute('data-tymora-hidden', 'explore');
      }
    });
  });

  // Redirect if on Explore page
  if (window.location.pathname.includes('/explore/')) {
    console.log('🚫 Redirecting from Instagram Explore page');
    window.location.href = 'https://www.instagram.com/';
  }
}

function removeBlocking() {
  const hiddenElements = document.querySelectorAll('[data-tymora-hidden]');
  hiddenElements.forEach(element => {
    element.style.display = '';
    element.removeAttribute('data-tymora-hidden');
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
    const instagramSettings = request.settings.find(p => p.id === 'instagram');
    if (instagramSettings) {
      settings = instagramSettings;
      applyBlocking();
    } else {
      // No Instagram settings found, remove blocking
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