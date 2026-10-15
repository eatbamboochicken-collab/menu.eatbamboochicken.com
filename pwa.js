/**
 * Bamboo Chicken - Production PWA Controller & Installation State Manager
 * Vanilla JavaScript (Zero external dependencies)
 *
 * Implements:
 * 1. Service Worker lifecycle management and caching
 * 2. Standalone vs Browser vs iOS Safari installation detection
 * 3. Discreet, brand-faithful in-app install prompt
 * 4. Dismissal persistence and non-intrusive re-access affordance
 */

(function() {
  'use strict';

  // State store
  const PWAState = {
    deferredPrompt: null,
    isInstalled: false,
    isIOS: false,
    isStandalone: false,
    canPrompt: false
  };

  const DISMISS_KEY = 'bamboo_pwa_prompt_dismissed_until';
  const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

  // Standalone detection across platforms (display-mode, iOS navigator.standalone, Android referrer)
  function checkStandalone() {
    const isMediaStandalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
    const isNavigatorStandalone = window.navigator && window.navigator.standalone === true;
    const isAndroidApp = document.referrer && document.referrer.includes('android-app://');
    const isUrlPwa = window.location.search.includes('source=pwa');
    return isMediaStandalone || isNavigatorStandalone || isAndroidApp || isUrlPwa;
  }

  // iOS Safari detection
  function checkIOS() {
    const ua = (window.navigator && window.navigator.userAgent) ? window.navigator.userAgent.toLowerCase() : '';
    return /iphone|ipad|ipod/.test(ua) && !window.MSStream;
  }

  PWAState.isStandalone = checkStandalone();
  PWAState.isInstalled = PWAState.isStandalone;
  PWAState.isIOS = checkIOS();

  // 1. Service Worker Registration
  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js', { scope: '/' })
          .then((registration) => {
            console.log('[Bamboo PWA] Service Worker registered with scope:', registration.scope);

            // Listen for waiting updates
            registration.addEventListener('updatefound', () => {
              const installingWorker = registration.installing;
              if (installingWorker) {
                installingWorker.addEventListener('statechange', () => {
                  if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log('[Bamboo PWA] App update downloaded and available.');
                  }
                });
              }
            });
          })
          .catch((err) => {
            console.warn('[Bamboo PWA] Service Worker registration note:', err);
          });
      });
    }
  }

  // 2. UI Controller
  function initInstallPromptUI() {
    // If running in standalone mode, hide prompt and update status
    if (PWAState.isStandalone) {
      hideFloatingBanner(false);
      updateInfoScreenInstallState();
      return;
    }

    updateInfoScreenInstallState();

    // Check dismissal state
    const dismissedUntil = localStorage.getItem(DISMISS_KEY);
    const isDismissed = dismissedUntil && Date.now() < parseInt(dismissedUntil, 10);
    if (isDismissed) {
      return;
    }

    // Delay showing floating prompt so customer can view the menu first (3.5 seconds)
    setTimeout(() => {
      // Re-check standalone in case user launched or state changed
      if (!PWAState.isStandalone && !isCartOrCheckoutOpen()) {
        showFloatingBanner();
      }
    }, 3500);
  }

  function isCartOrCheckoutOpen() {
    const cartModal = document.getElementById('cart-modal');
    const checkoutModal = document.getElementById('checkout-modal');
    return (cartModal && cartModal.classList.contains('active')) ||
           (checkoutModal && checkoutModal.classList.contains('active')) ||
           document.body.classList.contains('cart-open');
  }

  function showFloatingBanner() {
    if (PWAState.isStandalone) return;
    const banner = document.getElementById('pwa-install-banner');
    if (banner) {
      banner.classList.add('visible');
    }
  }

  function hideFloatingBanner(rememberDismissal = true) {
    const banner = document.getElementById('pwa-install-banner');
    if (banner) {
      banner.classList.remove('visible');
    }
    if (rememberDismissal) {
      localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_DURATION_MS));
    }
  }

  function updateInfoScreenInstallState() {
    const infoInstallContainer = document.getElementById('info-pwa-install-action');
    const infoDesc = document.getElementById('info-pwa-install-desc');
    if (!infoInstallContainer) return;

    if (PWAState.isStandalone) {
      if (infoDesc) infoDesc.textContent = 'App installed · Standalone mode active';
      infoInstallContainer.innerHTML = `
        <div class="pwa-info-installed-badge" title="Bamboo Chicken is installed on this device">
          <span class="pwa-badge-check">✓</span>
          <span>Installed</span>
        </div>
      `;
    } else {
      if (infoDesc) infoDesc.textContent = 'Quick access to the menu. Easy ordering. Order tracking in one place.';
      infoInstallContainer.innerHTML = `
        <button type="button" class="btn-check-version btn-pwa-install" id="info-install-btn" onclick="window.triggerPWAInstall()" aria-label="Install Bamboo Chicken">
          <span class="btn-check-version-label">Install App</span>
        </button>
      `;
    }
  }

  // 3. User Trigger Actions
  window.triggerPWAInstall = async function() {
    // A. Native prompt supported and captured (Android Chrome, Desktop Chrome, Edge)
    if (PWAState.deferredPrompt) {
      const promptEvent = PWAState.deferredPrompt;
      PWAState.deferredPrompt = null;
      try {
        await promptEvent.prompt();
        const choiceResult = await promptEvent.userChoice;
        if (choiceResult && choiceResult.outcome === 'accepted') {
          console.log('[Bamboo PWA] User accepted installation prompt');
          PWAState.isInstalled = true;
          PWAState.isStandalone = true;
          hideFloatingBanner(false);
          updateInfoScreenInstallState();
        } else {
          console.log('[Bamboo PWA] User dismissed native installation prompt');
          hideFloatingBanner(true);
        }
      } catch (err) {
        console.warn('[Bamboo PWA] Prompt invocation error:', err);
      }
      return;
    }

    // B. iOS Safari flow
    if (PWAState.isIOS) {
      showIOSInstallModal();
      return;
    }

    // C. Non-prompt browser or already dismissed beforeinstallprompt
    showGeneralInstallModal();
  };

  window.dismissPWAInstallPrompt = function() {
    hideFloatingBanner(true);
  };

  function showIOSInstallModal() {
    const modal = document.getElementById('pwa-ios-modal');
    if (modal) {
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
    }
  }

  window.closeIOSInstallModal = function() {
    const modal = document.getElementById('pwa-ios-modal');
    if (modal) {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    }
  };

  function showGeneralInstallModal() {
    const modal = document.getElementById('pwa-general-modal');
    if (modal) {
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
    }
  }

  window.closeGeneralInstallModal = function() {
    const modal = document.getElementById('pwa-general-modal');
    if (modal) {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    }
  };

  // 4. Native Browser Event Handlers
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent default mini-infobar on mobile browsers
    e.preventDefault();
    PWAState.deferredPrompt = e;
    PWAState.canPrompt = true;
    console.log('[Bamboo PWA] beforeinstallprompt captured and ready');
    updateInfoScreenInstallState();
  });

  window.addEventListener('appinstalled', () => {
    PWAState.isInstalled = true;
    PWAState.isStandalone = true;
    PWAState.deferredPrompt = null;
    hideFloatingBanner(false);
    updateInfoScreenInstallState();
    console.log('[Bamboo PWA] App successfully installed');
  });

  // Watch for display-mode change (e.g. user installs or transitions to standalone)
  try {
    const mql = window.matchMedia('(display-mode: standalone)');
    mql.addEventListener('change', (e) => {
      PWAState.isStandalone = e.matches;
      PWAState.isInstalled = e.matches;
      if (e.matches) {
        hideFloatingBanner(false);
      }
      updateInfoScreenInstallState();
    });
  } catch (err) {}

  // 5. Bootstrap
  registerServiceWorker();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initInstallPromptUI);
  } else {
    initInstallPromptUI();
  }

  window.PWAState = PWAState;
})();
