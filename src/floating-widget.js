/**
 * floating-widget.js - Global Floating Panda Widget Component
 * Ask Shankar & AUX Assistant Launcher
 */

(function () {
  'use strict';

  // Do not instantiate inside widget.html itself if loaded inside iframe
  if (window.location.pathname.endsWith('/widget.html') && window.self !== window.top) {
    return;
  }

  // Ensure CSS is loaded
  if (!document.getElementById('floating-widget-css')) {
    const link = document.createElement('link');
    link.id = 'floating-widget-css';
    link.rel = 'stylesheet';
    link.href = '/floating-widget.css?v=2.5';
    document.head.appendChild(link);
  }

  // Early global function declarations
window.openFloatingWidget = function (full = false) {
  if (typeof window._internalOpenPanel === 'function') {
    window._internalOpenPanel(full);
  } else {
    initFloatingWidget();
    if (typeof window._internalOpenPanel === 'function') window._internalOpenPanel(full);
  }
};

  window.openFullApp = function () {
  window.openFloatingWidget(true);
};

function initFloatingWidget() {
    if (document.getElementById('floating-panda-launcher')) {
      return; // Already initialized
    }

    // 1. Create Floating Launcher Button
    const launcher = document.createElement('div');
    launcher.id = 'floating-panda-launcher';
    launcher.className = 'floating-panda-launcher';
    launcher.setAttribute('role', 'button');
    launcher.setAttribute('aria-label', 'Toggle Ask Shankar & AUX Assistant');
    launcher.setAttribute('tabindex', '0');
    launcher.innerHTML = `
      <img src="/favicon.svg?v=panda2" alt="Ask Shankar" class="floating-panda-img" />
      <span class="floating-panda-status-dot" title="NICE CXone Telephony Live"></span>
      <div class="floating-panda-tooltip">
        <span>🐼</span> <strong>Ask Shankar & AUX Assistant</strong>
      </div>
    `;

    // 2. Create Floating Panel Window
    const panel = document.createElement('div');
    panel.id = 'floating-panda-panel';
    panel.className = 'floating-panda-panel';
    panel.innerHTML = `
      <div class="floating-panda-panel-header">
        <div class="fp-header-left">
          <div class="fp-header-avatar">
            <img src="/favicon.svg?v=panda2" alt="Panda Logo" />
          </div>
          <div class="fp-header-title-box">
            <span class="fp-header-title">ZEL Ask Shankar & AUX Assistant</span>
            <span class="fp-header-subtitle">
              <span class="dot"></span> Connected to Telephony CTI
            </span>
          </div>
        </div>
        <div class="fp-header-actions">
          <button id="fp-btn-expand" class="fp-action-btn" title="Toggle full screen view">🗖</button>
          <button id="fp-btn-close" class="fp-action-btn btn-close" title="Close panel">✕</button>
        </div>
      </div>
      <div class="floating-panda-panel-body">
        <iframe id="floating-panda-iframe" class="floating-panda-iframe" src="/widget.html" title="Agent Ask Shankar & AUX Assistant"></iframe>
      </div>
    `;

    // Hide launcher button on agent-home (since page has dedicated Launch button)
    if (window.location.pathname.includes('agent-home.html')) {
      launcher.style.display = 'none';
    }
    document.body.appendChild(launcher);
    document.body.appendChild(panel);

    const iframe = document.getElementById('floating-panda-iframe');
    const btnPopout = document.getElementById('fp-btn-popout');
    const btnExpand = document.getElementById('fp-btn-expand');
    const btnClose = document.getElementById('fp-btn-close');

    let isOpen = false;
    let isExpanded = false;

    // Toggle panel visibility
    function openPanel(full = false) {
      isOpen = true;
      panel.classList.add('open');
      launcher.classList.add('panel-open');
      if (full) {
        setFullScreen(true);
      }
      syncAgentToIframe();
    }

    function closePanel() {
      isOpen = false;
      panel.classList.remove('open');
      launcher.classList.remove('panel-open');
    }

    function togglePanel() {
      if (isOpen) {
        closePanel();
      } else {
        openPanel();
      }
    }

    function setFullScreen(full) {
      isExpanded = full;
      if (isExpanded) {
        panel.classList.add('fullscreen');
        panel.classList.add('open');
        panel.classList.remove('expanded');
        panel.style.top = '0px';
        panel.style.left = '0px';
        panel.style.right = '0px';
        panel.style.bottom = '0px';
        panel.style.width = '100vw';
        panel.style.height = '100vh';
        panel.style.transform = 'none';
        panel.style.opacity = '1';
        panel.style.pointerEvents = 'auto';
        panel.style.borderRadius = '0';
        if (btnExpand) {
          btnExpand.textContent = '🗗';
          btnExpand.title = 'Restore compact view';
        }
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage({ type: 'SET_ALL_SCREEN', enable: true }, '*');
        }
      } else {
        panel.classList.remove('fullscreen');
        panel.classList.remove('expanded');
        panel.style.top = '';
        panel.style.left = '';
        panel.style.right = '24px';
        panel.style.bottom = '24px';
        panel.style.width = '440px';
        panel.style.height = '680px';
        panel.style.transform = '';
        panel.style.borderRadius = '';
        if (btnExpand) {
          btnExpand.textContent = '🗖';
          btnExpand.title = 'Toggle full screen view';
        }
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage({ type: 'SET_ALL_SCREEN', enable: false }, '*');
        }
      }
    }

    function toggleExpand() {
      setFullScreen(!isExpanded);
    }

    function popoutWindow() {
      const activeAgent = localStorage.getItem('activeAgentId') || 'AGT-8842';
      const width = 460;
      const height = 740;
      const left = Math.max(0, (window.screen.availWidth - width - 40));
      const top = Math.max(0, (window.screen.availHeight - height - 60));
      window.open(
        `/widget.html?agent=${activeAgent}`,
        'ZEL_Ask_Shankar_Desktop_Widget',
        `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes,status=no,toolbar=no,menubar=no`
      );
      closePanel();
    }

    // Sync active agent persona between host page and iframe
    function syncAgentToIframe() {
      try {
        const savedAgent = localStorage.getItem('activeAgentId');
        if (savedAgent && iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage({ type: 'SYNC_AGENT', agentId: savedAgent }, '*');
        }
      } catch (err) {}
    }

    // Drag-and-drop capability for launcher button
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;
    let hasMoved = false;

    function onPointerDown(e) {
      if (e.button && e.button !== 0) return; // Only primary mouse button
      isDragging = true;
      hasMoved = false;
      launcher.classList.add('is-dragging');

      const rect = launcher.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;
      startX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      startY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('touchmove', onPointerMove, { passive: false });
      window.addEventListener('touchend', onPointerUp);
    }

    function onPointerMove(e) {
      if (!isDragging) return;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
      const deltaX = clientX - startX;
      const deltaY = clientY - startY;

      if (Math.abs(deltaX) > 6 || Math.abs(deltaY) > 6) {
        hasMoved = true;
        if (e.cancelable) e.preventDefault();
      }

      if (hasMoved) {
        const newLeft = Math.min(Math.max(10, initialLeft + deltaX), window.innerWidth - 72);
        const newTop = Math.min(Math.max(10, initialTop + deltaY), window.innerHeight - 72);
        launcher.style.left = newLeft + 'px';
        launcher.style.top = newTop + 'px';
        launcher.style.right = 'auto';
        launcher.style.bottom = 'auto';

        // Also adjust panel position if dragged
        adjustPanelPosition(newLeft, newTop);
      }
    }

    function onPointerUp(e) {
      if (!isDragging) return;
      isDragging = false;
      launcher.classList.remove('is-dragging');

      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);

      if (!hasMoved) {
        togglePanel();
      }
    }

    function adjustPanelPosition(launcherLeft, launcherTop) {
      const panelWidth = isExpanded ? 620 : 440;
      const panelHeight = isExpanded ? 740 : 680;

      // Position panel intelligently based on launcher quadrant
      if (launcherLeft < window.innerWidth / 2) {
        // Place panel on the right side of launcher
        panel.style.left = Math.min(window.innerWidth - panelWidth - 16, Math.max(16, launcherLeft)) + 'px';
        panel.style.right = 'auto';
      } else {
        // Place panel on the right edge
        panel.style.right = Math.min(window.innerWidth - 20, Math.max(20, window.innerWidth - launcherLeft - 72)) + 'px';
        panel.style.left = 'auto';
      }

      if (launcherTop < window.innerHeight / 2) {
        // Place below launcher
        panel.style.top = Math.min(window.innerHeight - panelHeight - 16, launcherTop + 72) + 'px';
        panel.style.bottom = 'auto';
      } else {
        // Place above launcher
        panel.style.bottom = Math.min(window.innerHeight - 20, Math.max(20, window.innerHeight - launcherTop + 10)) + 'px';
        panel.style.top = 'auto';
      }
    }

    launcher.addEventListener('pointerdown', onPointerDown);
    launcher.addEventListener('touchstart', onPointerDown, { passive: true });

    // Keyboard accessibility
    launcher.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        togglePanel();
      }
    });

    if (btnClose) btnClose.addEventListener('click', closePanel);
    if (btnExpand) btnExpand.addEventListener('click', toggleExpand);
    if (btnPopout) btnPopout.addEventListener('click', popoutWindow);

    // Escape key closes panel
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) {
        closePanel();
      }
    });

    // Listen for messages from iframe
    window.addEventListener('message', (e) => {
      if (!e.data) return;
      if (e.data.type === 'CLOSE_WIDGET') {
        closePanel();
      } else if (e.data.type === 'AGENT_CHANGED') {
        if (e.data.agentId) {
          localStorage.setItem('activeAgentId', e.data.agentId);
          // If on agent-home.html, update agent-select
          const agentSelect = document.getElementById('agent-select');
          if (agentSelect && agentSelect.value !== e.data.agentId) {
            agentSelect.value = e.data.agentId;
            if (typeof window.updateAgentView === 'function') {
              window.updateAgentView(e.data.agentId);
            }
          }
        }
      }
    });

    // Expose Global API
    window.openFloatingWidget = function (full = false) {
    if (typeof openPanel === 'function') openPanel(full);
  };
  window.openFullApp = function () {
    if (typeof openPanel === 'function') openPanel(true);
  };
    window.closeFloatingWidget = closePanel;
    window.toggleFloatingWidget = togglePanel;
    window.popoutFloatingWidget = popoutWindow;
  }

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFloatingWidget);
  } else {
    initFloatingWidget();
  }
})();
