function kachingBundleDeselect(bundle) {
  bundle.querySelectorAll('.kaching-bundles__bar').forEach((el) => {
    if (el.classList.contains('kaching-bundles__bar--selected')) {
      el.querySelector('.kaching-bundles__bar-radio').click();
    }
  });
}

(function () {
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function(mutation) {
      const bundle_week = document.querySelector('kaching-bundle[product-id="7850086138010"]');
      const bundle_month = document.querySelector('kaching-bundle[product-id="5505065910426"]');
      
      bundle_week.querySelectorAll('.kaching-bundles__bar').forEach((el, index) => {
        el.addEventListener('click', function() {
          kachingBundleDeselect(bundle_month);
        });
      });
 
      bundle_month.querySelectorAll('.kaching-bundles__bar').forEach((el, index) => {
        el.addEventListener('click', function() {
          kachingBundleDeselect(bundle_week);
        });
      });
    });
  });

  // Observe changes to the document body (child elements) to catch dynamic updates
  observer.observe(document.querySelector('.product'), { childList: true, subtree: true });
})();
