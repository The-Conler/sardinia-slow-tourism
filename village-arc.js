(function () {
  function init() {
    var root = document.querySelector("[data-village-arc]");
    if (!root) return;
    var cards = [].slice.call(root.querySelectorAll(".village-arc__card"));
    var n = cards.length, step = 20, span = n * step;
    function measure() { var cw = cards[0].offsetWidth, r = parseFloat(getComputedStyle(cards[0]).transformOrigin.split(' ')[1]) || 600; step = Math.min(30, (cw * 1.9 / r) * 180 / Math.PI); span = n * step; }
    measure(); window.addEventListener('resize', measure);
    var offset = 0, speed = 4, boost = 0, last = performance.now();
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function render() {
      for (var i = 0; i < n; i++) {
        var a = (((i * step + offset) % span) + span * 1.5) % span - span / 2;
        var c = cards[i];
        c.style.transform = "rotate(" + a.toFixed(3) + "deg)";
        c.style.visibility = Math.abs(a) > 80 ? "hidden" : "visible";
        c.classList.toggle("is-center", Math.abs(a) < step / 2);
      }
    }
    function tick(now) {
      var dt = Math.min((now - last) / 1000, 0.1); last = now;
      if (!reduce) offset -= (speed + boost) * dt;
      boost *= Math.pow(0.05, dt);
      render(); requestAnimationFrame(tick);
    }
    var sc = document.querySelector(".page-content") || window, lastY = null;
    sc.addEventListener("scroll", function () {
      var y = sc === window ? window.scrollY : sc.scrollTop;
      if (lastY !== null) boost = Math.max(-60, Math.min(60, boost + (y - lastY) * 0.2));
      lastY = y;
    }, { passive: true });
    render(); requestAnimationFrame(tick);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
