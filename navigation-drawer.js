function navigationDrawer(scope = document) {
  const roots = scope.querySelectorAll("[data-drawer]");
  const focusableSelector = [
    "a[href]",
    "button:not([disabled])",
    "textarea:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
  ].join(",");

  roots.forEach((root) => {
    const toggle = root.querySelector("[data-drawer-toggle]");
    const panel = root.querySelector("[data-drawer-panel]");
    const closeButtons = root.querySelectorAll("[data-drawer-close]");

    if (!toggle || !panel) return;

    if (root.drawerController) {
      root.drawerController.abort();
    }

    const controller = new AbortController();
    root.drawerController = controller;

    let previousOverflow = "";
    let previousScrollerOverflow = "";
    let previousFocus = null;
    const pageScroller = document.querySelector(".page-content");

    function getPanelFocusables() {
      return Array.from(panel.querySelectorAll(focusableSelector)).filter(
        (element) =>
          element.offsetParent !== null || element === document.activeElement,
      );
    }

    function setPanelFocusability(isOpen) {
      getPanelFocusables().forEach((element) => {
        if (isOpen) {
          if (element.dataset.drawerTabindex) {
            element.setAttribute("tabindex", element.dataset.drawerTabindex);
            delete element.dataset.drawerTabindex;
          } else {
            element.removeAttribute("tabindex");
          }
          return;
        }

        const tabindex = element.getAttribute("tabindex");
        if (tabindex !== null) {
          element.dataset.drawerTabindex = tabindex;
        } else {
          delete element.dataset.drawerTabindex;
        }
        element.setAttribute("tabindex", "-1");
      });
    }

    function isOpen() {
      return root.getAttribute("data-open") === "true";
    }

    function setOpen(nextOpen, options = {}) {
      if (root.hasAttribute("data-open") && nextOpen === isOpen()) return;

      root.setAttribute("data-open", nextOpen ? "true" : "false");
      toggle.setAttribute("aria-expanded", String(nextOpen));
      panel.setAttribute("aria-hidden", String(!nextOpen));

      if ("inert" in panel) {
        panel.inert = !nextOpen;
      }

      setPanelFocusability(nextOpen);

      if (nextOpen) {
        previousFocus = document.activeElement;
        previousOverflow = document.documentElement.style.overflow;
        document.documentElement.style.overflow = "hidden";
        if (pageScroller) {
          previousScrollerOverflow = pageScroller.style.overflow;
          pageScroller.style.overflow = "hidden";
        }
        return;
      }

      document.documentElement.style.overflow = previousOverflow;
      if (pageScroller) {
        pageScroller.style.overflow = previousScrollerOverflow;
      }

      if (options.restoreFocus === false) return;

      const focusTarget =
        previousFocus && document.contains(previousFocus) ? previousFocus : toggle;
      focusTarget.focus({ preventScroll: true });
    }

    function closeDrawer(options = {}) {
      setOpen(false, options);
    }

    setOpen(false, { restoreFocus: false });

    toggle.addEventListener(
      "click",
      () => {
        setOpen(!isOpen());
      },
      { signal: controller.signal },
    );

    closeButtons.forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          closeDrawer();
        },
        { signal: controller.signal },
      );
    });

    panel.querySelectorAll("a[href]").forEach((link) => {
      link.addEventListener(
        "click",
        (event) => {
          const target = new URL(link.href, window.location.href);
          const isSamePage =
            target.origin === window.location.origin &&
            target.pathname === window.location.pathname;

          if (isSamePage) {
            closeDrawer({ restoreFocus: false });
            if (target.hash) {
              const dest = document.getElementById(decodeURIComponent(target.hash.slice(1)));
              if (dest) {
                event.preventDefault();
                requestAnimationFrame(() => {
                  dest.scrollIntoView({ behavior: "smooth", block: "start" });
                  if (history.pushState) history.pushState(null, "", target.hash);
                });
              }
            }
          }
        },
        { signal: controller.signal },
      );
    });

    scope.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Escape" && isOpen()) {
          closeDrawer();
        }
      },
      { signal: controller.signal },
    );
  });
}

document.addEventListener("DOMContentLoaded", () => navigationDrawer());

/* Deep link (e.g. index.html#esperienze): re-align after late layout/animation setup */
window.addEventListener("load", () => {
  const id = decodeURIComponent((location.hash || "").slice(1));
  if (!id) return;
  const dest = document.getElementById(id);
  if (!dest) return;
  setTimeout(() => dest.scrollIntoView({ block: "start" }), 450);
});
