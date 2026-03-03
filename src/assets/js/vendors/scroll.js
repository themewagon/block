// expose scrollToSection on the window object so inline onclick handlers
// (e.g. <a onclick="scrollToSection('foo', event)">) keep working even when
// other scripts are loaded as modules
window.scrollToSection = function scrollToSection(id, event) {
    if (event && typeof event.preventDefault === 'function') event.preventDefault();
    const element = document.getElementById(id);
    if (!element) return;
    element.scrollIntoView({
         behavior: 'smooth',
         block: 'start'
    });
};

// Scroll-spy: add active color to nav links that target sections via
// onclick="scrollToSection('id', event)". This runs on DOMContentLoaded and
// updates on scroll/resize using requestAnimationFrame for performance.
(function () {
   function initScrollSpy() {
      const links = Array.from(document.querySelectorAll("a[onclick*='scrollToSection']"));
      if (!links.length) return;

      // Build mapping of link -> target element
      const items = links.map((link) => {
         const onclick = link.getAttribute('onclick') || '';
         const m = onclick.match(/scrollToSection\(['"]([^'"\)]+)['"]?/);
         const id = m ? m[1] : null;
         const section = id ? document.getElementById(id) : null;
         return { link, id, section };
      }).filter(item => item.section);

      if (!items.length) return;

      // Helper to set active class
      function setActiveLink(activeId) {
         items.forEach(({ link, id }) => {
            if (id === activeId) {
               link.classList.remove('text-gray-700');
               link.classList.add('text-purple-500');
            } else {
               link.classList.remove('text-purple-500');
               if (!link.classList.contains('text-gray-700')) link.classList.add('text-gray-700');
            }
         });
      }

      // Determine which section is currently active.
      function detectActive() {
         const offset = 120; // distance from top to consider active (adjustable)
         let activeId = null;

         for (const { id, section } of items) {
            const rect = section.getBoundingClientRect();
            if (rect.top <= offset && rect.bottom > offset) {
               activeId = id;
               break;
            }
         }

         // Fallback: use the section nearest to top if none matched above
         if (!activeId) {
            let closest = null;
            let closestDistance = Infinity;
            for (const { id, section } of items) {
               const rect = section.getBoundingClientRect();
               const dist = Math.abs(rect.top - 0);
               if (dist < closestDistance) {
                  closestDistance = dist;
                  closest = id;
               }
            }
            activeId = closest;
         }

         setActiveLink(activeId);
      }

      // Throttle via requestAnimationFrame
      let ticking = false;
      function onScroll() {
         if (!ticking) {
            window.requestAnimationFrame(() => {
               detectActive();
               ticking = false;
            });
            ticking = true;
         }
      }

      // Initial run
      detectActive();

      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
   }

   if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initScrollSpy);
   } else {
      initScrollSpy();
   }
})();