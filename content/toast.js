window.SelectionTTS = window.SelectionTTS || {};

(function setupToastModule(namespace) {
  const TOAST_ID = "selection-tts-toast";
  const DEFAULT_DURATION = 1600;
  let hideTimerId = null;

  function ensureToastElement() {
    let toast = document.getElementById(TOAST_ID);
    if (toast) {
      return toast;
    }

    toast = document.createElement("div");
    toast.id = TOAST_ID;
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    toast.style.position = "fixed";
    toast.style.top = "16px";
    toast.style.left = "50%";
    toast.style.transform = "translateX(-50%)";
    toast.style.zIndex = "2147483647";
    toast.style.padding = "10px 14px";
    toast.style.borderRadius = "10px";
    toast.style.background = "rgba(20, 20, 20, 0.88)";
    toast.style.color = "#ffffff";
    toast.style.fontSize = "14px";
    toast.style.fontWeight = "600";
    toast.style.lineHeight = "1.2";
    toast.style.opacity = "0";
    toast.style.pointerEvents = "none";
    toast.style.transition = "opacity 140ms ease";
    toast.style.maxWidth = "92vw";
    toast.style.whiteSpace = "nowrap";
    toast.style.textOverflow = "ellipsis";
    toast.style.overflow = "hidden";
    document.documentElement.appendChild(toast);

    return toast;
  }

  function showToast(message, options = {}) {
    if (!message) {
      return;
    }

    const toast = ensureToastElement();
    const duration =
      typeof options.duration === "number" ? options.duration : DEFAULT_DURATION;

    toast.textContent = message;
    toast.style.opacity = "1";

    if (hideTimerId) {
      window.clearTimeout(hideTimerId);
    }

    hideTimerId = window.setTimeout(() => {
      toast.style.opacity = "0";
    }, duration);
  }

  namespace.showToast = showToast;
})(window.SelectionTTS);
