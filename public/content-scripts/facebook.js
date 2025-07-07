// Facebook content script for Tymora.ai
let settings = {};
let observer = null;

function loadSettings() {
  chrome.storage.sync.get(['tymora-platform-settings'], (result) => {
    if (result['tymora-platform-settings']) {
      const platforms = result['tymora-platform-settings'];
      const facebookSettings = platforms.find(p => p.id === 'facebook');
      if (facebookSettings) {
        settings = facebookSettings;
        applyBlocking();
      }
    }
  });
}

function applyBlocking() {
  if (!settings.enabled) {
    removeBlocking();
    return;
  }

  console.log('🚫 Tymora.ai: Applying Facebook blocking...');

  if (settings.options?.find(opt => opt.id === 'news-feed')?.enabled) {
    blockNewsFeed();
  }

  if (settings.options?.find(opt => opt.id === 'block-reels')?.enabled) {
    blockReels();
  }

  if (settings.options?.find(opt => opt.id === 'block-watch')?.enabled) {
    blockWatch();
  }

  setupObserver();
}

function blockNewsFeed() {
  console.log('🚫 Blocking Facebook News Feed');
  
  const feedSelectors = [
    '[role="feed"]',
    '[data-pagelet="FeedUnit"]',
    'div[data-pagelet="FeedUnit"]'
  ];

  feedSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      element.style.display = 'none !important';
      element.setAttribute('data-tymora-hidden', 'news-feed');
    });
  });
}

function blockReels() {
  console.log('🚫 Blocking Facebook Reels');
  
  const reelsSelectors = [
    '[href*="/reel/"]',
    'a[href*="/reel/"]',
    '[aria-label*="Reels"]'
  ];

  reelsSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      element.style.display = 'none !important';
      element.setAttribute('data-tymora-hidden', 'reels');
    });
  });
}

function blockWatch() {
  console.log('🚫 Blocking Facebook Watch');
  
  const watchSelectors = [
    '[href*="/watch/"]',
    'a[href*="/watch/"]',
    '[aria-label*="Watch"]'
  ];

  watchSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      element.style.display = 'none !important';
      element.setAttribute('data-tymora-hidden', 'watch');
    });
  });
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
    const facebookSettings = request.settings.find(p => p.id === 'facebook');
    if (facebookSettings) {
      settings = facebookSettings;
      applyBlocking();
    }
  }
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadSettings);
} else {
  loadSettings();
}