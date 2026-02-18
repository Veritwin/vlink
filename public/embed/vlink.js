/**
 * VLink Embeddable Checkout Script
 * Self-contained vanilla JS (~4KB) — no dependencies
 *
 * Usage:
 *   <script src="https://vlink.nonlocal.info/embed/vlink.js"></script>
 *   <script>
 *     VLink.init({ merchantId: '...', apiKey: 'vl_...', environment: 'production' });
 *     VLink.checkout({ amount: 10000, currency: 'USD', description: '...', onSuccess: fn, onClose: fn, onError: fn });
 *   </script>
 */
(function (global) {
  "use strict";

  var BASE_URLS = {
    production: "https://vlink.nonlocal.info",
    development: "http://localhost:3000",
  };

  var config = null;
  var activePopup = null;
  var pollTimer = null;

  function getBaseUrl() {
    if (!config) return BASE_URLS.production;
    return BASE_URLS[config.environment] || BASE_URLS.production;
  }

  function init(opts) {
    if (!opts || !opts.merchantId || !opts.apiKey) {
      throw new Error("VLink.init requires merchantId and apiKey");
    }
    config = {
      merchantId: opts.merchantId,
      apiKey: opts.apiKey,
      environment: opts.environment || "production",
    };
  }

  function checkout(opts) {
    if (!config) {
      throw new Error("VLink.init must be called before VLink.checkout");
    }
    if (!opts || !opts.amount) {
      throw new Error("VLink.checkout requires amount");
    }

    var onSuccess = opts.onSuccess || function () {};
    var onClose = opts.onClose || function () {};
    var onError = opts.onError || function () {};

    // Open popup immediately on user gesture to avoid popup blocker
    var popup = window.open("about:blank", "vlink_checkout", popupFeatures());
    if (!popup) {
      onError({ code: "POPUP_BLOCKED", message: "Popup was blocked by the browser" });
      return;
    }

    activePopup = popup;

    // Show loading state in popup
    try {
      popup.document.write(
        "<!DOCTYPE html><html><head><title>VLink Checkout</title>" +
        "<style>body{margin:0;display:flex;align-items:center;justify-content:center;" +
        "min-height:100vh;background:#0a0a0a;color:#fff;font-family:system-ui,-apple-system,sans-serif;}" +
        ".loader{width:40px;height:40px;border:3px solid #333;border-top-color:#6366f1;" +
        "border-radius:50%;animation:spin 0.8s linear infinite;}@keyframes spin{to{transform:rotate(360deg);}}" +
        ".wrap{text-align:center;}.text{margin-top:16px;color:#999;font-size:14px;}</style></head>" +
        "<body><div class='wrap'><div class='loader'></div><div class='text'>Preparing checkout...</div></div></body></html>"
      );
      popup.document.close();
    } catch (e) {
      // Cross-origin write may fail — that's OK
    }

    // Listen for postMessage from the popup
    function messageHandler(event) {
      var baseUrl = getBaseUrl();
      // Validate origin
      if (event.origin !== baseUrl) return;
      if (!event.data || !event.data.type) return;

      switch (event.data.type) {
        case "vlink:payment_success":
          cleanup();
          onSuccess(event.data.data || {});
          break;
        case "vlink:payment_close":
          cleanup();
          onClose();
          break;
        case "vlink:payment_error":
          cleanup();
          onError(event.data.data || { code: "PAYMENT_ERROR", message: "Payment failed" });
          break;
      }
    }

    window.addEventListener("message", messageHandler);

    // Poll for popup closed as fallback
    pollTimer = setInterval(function () {
      if (popup && popup.closed) {
        cleanup();
        onClose();
      }
    }, 500);

    function cleanup() {
      window.removeEventListener("message", messageHandler);
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
      if (activePopup && !activePopup.closed) {
        activePopup.close();
      }
      activePopup = null;
    }

    // Create checkout session via API
    var baseUrl = getBaseUrl();
    fetch(baseUrl + "/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": config.apiKey,
      },
      body: JSON.stringify({
        amount: opts.amount,
        currency: opts.currency || "USD",
        description: opts.description || "",
        metadata: opts.metadata || {},
        successUrl: opts.successUrl,
        cancelUrl: opts.cancelUrl,
        expiresIn: opts.expiresIn || 3600,
      }),
    })
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        if (!data.success) {
          cleanup();
          onError({
            code: data.error?.code || "API_ERROR",
            message: data.error?.message || "Failed to create checkout session",
          });
          return;
        }

        // Navigate popup to checkout URL
        if (popup && !popup.closed) {
          popup.location.href = data.data.checkoutUrl;
        } else {
          cleanup();
          onClose();
        }
      })
      .catch(function (err) {
        cleanup();
        onError({ code: "NETWORK_ERROR", message: err.message || "Network error" });
      });
  }

  function popupFeatures() {
    var w = 480;
    var h = 700;
    var left = (screen.width - w) / 2;
    var top = (screen.height - h) / 2;
    return (
      "width=" + w +
      ",height=" + h +
      ",left=" + left +
      ",top=" + top +
      ",scrollbars=yes,resizable=yes,status=no,toolbar=no,menubar=no,location=no"
    );
  }

  // Expose globally
  global.VLink = {
    init: init,
    checkout: checkout,
  };
})(typeof window !== "undefined" ? window : this);
