const pageLoader = document.querySelector(".page-loader");
const loaderCount = document.querySelector("[data-loader-count]");
const loaderBar = document.querySelector("[data-loader-bar]");
const loaderPlaces = document.querySelectorAll("[data-loader-place]");

document.body.classList.add("is-loading");

if (window.gsap && pageLoader && loaderCount && loaderBar) {
  const loaderState = { value: 0 };
  const placeState = { index: 0 };

  const loaderTimeline = gsap.timeline({
    onComplete: () => {
      document.body.classList.remove("is-loading");
    },
  });

  loaderTimeline
    .to(loaderState, {
      value: 100,
      duration: 2.2,
      ease: "power2.inOut",
      onUpdate: () => {
        const currentValue = Math.round(loaderState.value);
        loaderCount.textContent = currentValue;
        loaderBar.style.width = `${currentValue}%`;
      },
    })
    .to(
      placeState,
      {
        index: loaderPlaces.length - 1,
        duration: 1.95,
        ease: "none",
        onUpdate: () => {
          const activeIndex = Math.round(placeState.index);
          loaderPlaces.forEach((place, index) => {
            place.classList.toggle("is-active", index === activeIndex);
          });
        },
      },
      0.08
    )
    .to(
      ".loader-inner",
      {
        y: -28,
        autoAlpha: 0,
        duration: 0.55,
        ease: "power2.in",
      },
      "-=0.1"
    )
    .to(
      ".loader-places",
      {
        y: 18,
        autoAlpha: 0,
        duration: 0.45,
        ease: "power2.in",
      },
      "-=0.38"
    )
    .to(
      ".loader-bar",
      {
        scaleX: 0,
        transformOrigin: "right center",
        duration: 0.45,
        ease: "power2.inOut",
      },
      "-=0.28"
    )
    .to(
      pageLoader,
      {
        yPercent: -100,
        duration: 0.95,
        ease: "power4.inOut",
      },
      "-=0.05"
    )
    .set(pageLoader, { display: "none" });
} else {
  document.body.classList.remove("is-loading");
}
