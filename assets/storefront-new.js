const observer = new MutationObserver(mutations => {
    mutations.forEach(({ addedNodes }) => {
        addedNodes.forEach(node => {
            if (node.nodeType === 1) { // Check if node is an element
                if (node.tagName === "IFRAME" && (node.src.includes("reviews") || node.src.includes("vimeo.com"))) {
                    node.setAttribute("loading", "lazy");
                    node.setAttribute("data-src", node.src);
                    node.removeAttribute("src");
                }
                if (node.tagName === "LINK" && (node.href.includes("place") || node.href.includes("vimo.com"))) {
                    node.setAttribute("data-href", node.href);
                    node.removeAttribute("href");
                }
                if (node.tagName === "IMG" && !node.src.includes("data:image")) {
                    node.setAttribute("loading", "lazy");
                }
                if (node.tagName === "SCRIPT") {
                    if (node.classList.contains("analytics") || node.classList.contains("boomerang") || 
                        node.innerHTML.includes("asyncLoad") || node.src.includes("assets/storefront") || 
                        node.src.includes("assets/shopify_pay/") || node.src.includes("cozy") || 
                        node.innerHTML.includes("gtag/js") || node.src.includes("smile") || 
                        node.src.includes("onsite") || node.src.includes("afterpay")) {
                        node.setAttribute("data-src", node.src);
                        node.removeAttribute("src");
                    }
                    if (node.innerText.includes("hotjar") || node.innerText.includes("cozycountryredirect") || 
                        node.innerText.includes("webPixelsManager") || node.innerText.includes("head.appendChild(jqueryScript);") || 
                        node.innerText.includes("prefetchAssets")) {
                        node.type = "text/lazyload";
                    }
                }
            }
        });
    });
});
observer.observe(document.documentElement, { childList: true, subtree: true });

function loadJSscripts() {
    if (!script_loaded) {
        if (typeof observer !== 'undefined') observer.disconnect();
        if (typeof window.yett !== 'undefined') window.yett.unblock();
        script_loaded = true;
        
        document.querySelectorAll("iframe[data-src], script[data-src]").forEach(el => {
            const dataSrc = el.getAttribute("data-src");
            if (dataSrc) el.src = dataSrc;
        });
        
        document.querySelectorAll("link[data-href]").forEach(el => {
            const dataHref = el.getAttribute("data-href");
            if (dataHref) el.href = dataHref;
        });
        
        document.querySelectorAll("script[type='text/lazyload']").forEach(el => {
            const script = document.createElement("script");
            [...el.attributes].forEach(attr => script.setAttribute(attr.name, attr.value));
            script.type = "text/javascript";
            script.innerHTML = el.innerHTML;
            el.parentNode.insertBefore(script, el);
            el.parentNode.removeChild(el);
        });
        
        document.dispatchEvent(new CustomEvent("asyncLazyLoad"));
    }
}

const activityEvents = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click", "keypress", "touchmove"];
activityEvents.forEach(event => window.addEventListener(event, loadJSscripts, { once: true }));
