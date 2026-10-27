/* Partner timeline: label centrale + indicatore paese corrente (202610231610) */
(function () {
  function init() {
    var root = document.querySelector("[data-ptl]");
    if (!root) return;
    var villages = [].slice.call(root.querySelectorAll("[data-ptl-village]"));
    var labels = [].slice.call(root.querySelectorAll("[data-ptl-label]"));
    var list = root.querySelector(".ptl-labels");
    var sticky = root.querySelector(".ptl-sticky");
    if (!villages.length || !labels.length) return;
    var total = villages.length;
    var pad = function (n) { return (n < 10 ? "0" : "") + n; };
    var names = labels.map(function (l) { var n = l.querySelector(".ptl-name"); return n ? n.textContent.trim() : ""; });
    var counts = labels.map(function (l) { var c = l.querySelector(".ptl-count"); return c ? c.textContent.trim() : ""; });

    /* HUD: indicatore persistente */
    var hud = document.createElement("div");
    hud.className = "ptl-hud";
    hud.setAttribute("aria-live", "polite");
    hud.innerHTML =
      '<span class="ptl-hud__index"><span class="ptl-hud__cur">01</span><span class="ptl-hud__tot">/ ' + pad(total) + '</span></span>' +
      '<span class="ptl-hud__name"></span><span class="ptl-hud__count"></span>' +
      '<span class="ptl-hud__bar" aria-hidden="true"><span class="ptl-hud__fill"></span></span>';
    sticky.appendChild(hud);
    var hudCur = hud.querySelector(".ptl-hud__cur"), hudName = hud.querySelector(".ptl-hud__name"),
        hudCount = hud.querySelector(".ptl-hud__count"), hudFill = hud.querySelector(".ptl-hud__fill");

    villages.forEach(function (v, i) { v.setAttribute("data-ptl-index", pad(i + 1)); v.setAttribute("aria-label", names[i] || ""); });

    var hasGsap = window.gsap && window.ScrollTrigger;
    var current = -1;
    function setActive(i) {
      if (i < 0 || i >= labels.length) return;
      if (i === current) return;
      current = i;
      var h = labels[0].offsetHeight;
      labels.forEach(function (l, j) {
        l.classList.toggle("is-active", j === i);
        l.classList.toggle("is-past", j < i);
        l.classList.toggle("is-next", j > i);
      });
      villages.forEach(function (v, j) { v.classList.toggle("is-current", j === i); });
      hud.classList.remove("is-swap"); void hud.offsetWidth; hud.classList.add("is-swap");
      hudCur.textContent = pad(i + 1);
      hudName.textContent = names[i];
      hudCount.textContent = counts[i];
      hudFill.style.transform = "scaleX(" + ((i + 1) / total) + ")";
      var y = -(i * h) - h / 2;
      if (hasGsap) gsap.to(list, { y: y, duration: 1.05, ease: "power3.out", overwrite: true });
      else list.style.transform = "translateY(" + y + "px)";
    }
    function setVisible(on) { root.classList.toggle("is-in-view", on); }
    setActive(0);

    var scEl = document.querySelector(".page-content");
    if (scEl && !(scEl.scrollHeight > scEl.clientHeight + 10 && /(auto|scroll)/.test(getComputedStyle(scEl).overflowY))) scEl = null;

    if (hasGsap) {
      gsap.registerPlugin(ScrollTrigger);
      var sc = scEl || window;
      /* Ogni paese è attivo esattamente mentre attraversa il centro dello schermo: nessuna sovrapposizione */
      villages.forEach(function (v, i) {
        ScrollTrigger.create({
          trigger: v, scroller: sc, start: "top 50%", end: "bottom 50%",
          onToggle: function (self) { if (self.isActive) setActive(i); }
        });
      });
      ScrollTrigger.create({
        trigger: root, scroller: sc, start: "top 60%", end: "bottom 40%",
        onToggle: function (self) { setVisible(self.isActive); }
      });
      window.addEventListener("resize", function () {
        var c = current; current = -1; setActive(Math.max(c, 0));
        ScrollTrigger.refresh();
      });
    } else {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) setActive(villages.indexOf(e.target)); });
      }, { root: scEl, rootMargin: "-50% 0px -50% 0px", threshold: 0 });
      villages.forEach(function (v) { io.observe(v); });
      var io2 = new IntersectionObserver(function (es) { setVisible(es[0].isIntersecting); }, { root: scEl, rootMargin: "-40% 0px -40% 0px" });
      io2.observe(root);
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
