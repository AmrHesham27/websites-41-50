(function () {

  /* ===== GLOBAL SETTINGS ===== */
  const DIRECTION = "down";   // "up" | "down" | "left" | "right" | "fade"
  const DURATION  = 850;
  const DISTANCE  = 30;
  const EASING    = "ease";
  const THRESHOLD = 0.15;

  const style = document.createElement("style");

  let transformStart = "none";

  if (DIRECTION === "up")    transformStart = `translateY(${DISTANCE}px)`;
  if (DIRECTION === "down")  transformStart = `translateY(-${DISTANCE}px)`;
  if (DIRECTION === "left")  transformStart = `translateX(${DISTANCE}px)`;
  if (DIRECTION === "right") transformStart = `translateX(-${DISTANCE}px)`;

  style.innerHTML = `
    .reveal {
      opacity: 0;
      transform: ${transformStart};
      transition:
        opacity ${DURATION}ms ${EASING},
        transform ${DURATION}ms ${EASING};
    }

    .reveal.is-visible {
      opacity: 1;
      transform: none;
    }
  `;

  document.head.appendChild(style);

  function initReveal() {
    const elements = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    }, { threshold: THRESHOLD });

    elements.forEach(el => observer.observe(el));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initReveal);
  } else {
    initReveal();
  }

})();