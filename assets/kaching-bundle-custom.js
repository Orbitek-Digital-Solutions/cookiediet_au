function kachingBundleDeselect(bundle) {
  bundle.querySelectorAll('.kaching-bundles__bar').forEach((el) => {
    if (el.classList.contains('kaching-bundles__bar--selected')) {
      el.querySelector('.kaching-bundles__bar-radio').click();
    }
  });

  bundle.querySelectorAll('input[type="radio"]').forEach((el) => {
    el.checked = false;
  });
}

setTimeout(function(){
  const product_week_id = "7850086138010";
  const product_month_id = "8428651544730";

  const bundle_week = document.querySelector('kaching-bundle[product-id="' + CSS.escape(product_week_id) + '"]');
  const bundle_month = document.querySelector('kaching-bundle[product-id="' + CSS.escape(product_month_id) + '"]');

  // const form = document.querySelector('form[action="/cart/add"]');
  // const form_submit_new = document.createElement("button");
  // form_submit_new.textContent = 'Click me!';
  // form.appendChild(form_submit_new);

  // const form_submit = document.querySelector('form[action="/cart/add"] [type="submit"]');
  // const form_submit_clone = form_submit.cloneNode(true);
  // form_submit.parentNode.insertBefore(form_submit_clone, form_submit.nextSibling);
  // form_submit.style.display = 'none';



  // let form_product_id = document.querySelector('form[action="/cart/add"] input[name="product-id"]');

  bundle_week.querySelectorAll('.kaching-bundles__bar').forEach((el, index) => {
    el.addEventListener('click', function() {
      // form_product_id.value = product_week_id;
      kachingBundleDeselect(bundle_month);
    });
  });

  bundle_month.querySelectorAll('.kaching-bundles__bar').forEach((el, index) => {
    el.addEventListener('click', function() {
      // form_product_id.value = product_month_id;
      kachingBundleDeselect(bundle_week);
    });
  });
},1000);
