const observer = new MutationObserver(e => {
    e.forEach(({addedNodes: e}) => {
        e.forEach(e => {
            if (e.nodeType === 1) {
                if (e.tagName === "IFRAME" && (e.src.includes("reviews") || e.src.includes("vimeo.com"))) {
                    e.setAttribute("loading", "lazy");
                    e.setAttribute("data-src", e.src);
                    e.removeAttribute("src");
                }
                if (e.tagName === "LINK" && (e.href.includes("place") || e.href.includes("vimo.com"))) {
                    e.setAttribute("data-href", e.href);
                    e.removeAttribute("href");
                }
                if (e.tagName === "IMG" && !e.src.includes("data:image")) {
                    e.setAttribute("loading", "lazy");
                }
                if (e.tagName === "SCRIPT") {
                    if (e.className === "analytics") {
                        e.type = "text/lazyload";
                    }
                    if (e.className === "boomerang") {
                        e.type = "text/lazyload";
                    }
                    if (e.innerHTML.includes("asyncLoad")) {
                        e.innerHTML = e.innerHTML.replace("if(window.attachEvent)", "document.addEventListener('asyncLazyLoad',function(event){asyncLoad();});if(window.attachEvent)").replaceAll(", asyncLoad", ", function(){}");
                    }
                    if (e.src.includes("assets/storefront") || e.src.includes("assets/shopify_pay/") || e.src.includes("cozy") || e.innerHTML.includes("gtag/js") || e.src.includes("smile") || e.src.includes("onsite") || e.src.includes("afterpay")) {
                        e.setAttribute("data-src", e.src);
                        e.removeAttribute("src");
                    }
                    if (e.innerText.includes("hotjar") || e.innerText.includes("cozycountryredirect") || e.innerText.includes("webPixelsManager") || e.innerText.includes("head.appendChild(jqueryScript);") || e.innerText.includes("prefetchAssets")) {
                        e.type = "text/lazyload";
                    }
                }
            }
        });
    });
});
observer.observe(document.documentElement, {childList: true, subtree: true});
