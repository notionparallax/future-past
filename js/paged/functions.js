//internally used
function findAllTextNodes(n) {
    var walker = n.ownerDocument.createTreeWalker(n, NodeFilter.SHOW_TEXT);
    var textNodes = [];
    while (walker.nextNode())
        if (walker.currentNode.parentNode.tagName != "SCRIPT")
            textNodes.push(walker.currentNode);
    return textNodes;
}

//externally used
function footnoteLinksInEachArticle(docFrag) {
    console.log("about to footnoteLinksInEachArticle");
    const show_links_header = false;
    docFrag.querySelectorAll(".paper-story").forEach((story) => {
        footnoteLinks(story.id, story.id, docFrag, show_links_header);
    });
    return docFrag;
}

function snapElementsToLineHeight(node) {
    if (node.matches(".pagedjs_page")) {
        console.log(node);
    }
    // if (
    //   node.src &&
    //   node.src ==
    //     "https://beta.techcrunch.com/wp-content/uploads/2017/02/amazon-prime-air_private-trial_ground-high-res.png"
    // ) {
    //   console.log("here");
    // }
    const doc = document.documentElement;
    const oneRem = parseFloat(getComputedStyle(doc).fontSize);
    const lineHeightRem = parseFloat(
        getComputedStyle(doc).getPropertyValue("--wp-line-height")
    );

    const containerWidth = node.parentElement.offsetWidth;
    let elHeight = node.height || node.offsetHeight || node.naturalHeight;
    const elWidth = node.width || node.offsetWidth || node.naturalWidth;
    if (node.naturalHeight && elHeight > node.naturalHeight) {
        elHeight = oneRem; //node.naturalHeight;
    }
    const aspectRatio = elHeight / elWidth;
    const niceHeightRaw = containerWidth * aspectRatio;

    const lineHeightPx = lineHeightRem * oneRem;
    let linesHigh = 10;
    if (node.src && niceHeightRaw > 0) {
        // this gives a little bit of padding if an image is on the upper half of n lines high
        linesHigh = Math.ceil(
            (niceHeightRaw + lineHeightPx * 0.5) / lineHeightPx
        );
    } else {
        linesHigh = Math.ceil(elHeight / lineHeightPx);
    }
    const newHeightPx = linesHigh * lineHeightPx;
    // x.style.height = `${newHeightPx / oneRem}rem`;
    const newHeight = `calc(var(--wp-line-height) * ${linesHigh})`;
    const bs =
        `snap: ${node.nodeName} ` +
        `(lines high: ${linesHigh} lines, ` +
        `line height: ${lineHeightPx}px, 1 rem: ${oneRem}px)` +
        `raw el height: ${elHeight}` +
        `el height:${elHeight / oneRem}rem->${newHeightPx / oneRem}rem ` +
        `newHeight: ${newHeight}`;
    if (linesHigh == 0) {
        console.log(bs, node);
        console.log();
    } else {
        node.style.height = newHeight;
        // node.style.display = "block";
        node.classList.add("snapped");
        node.dataset.snapAudit = bs;
    }
    // x.dataset.metaBullshit = bs;
    // console.log(bs);
}

function round(value, step, direction) {
    step || (step = 1.0);
    var inv = 1.0 / step;
    if (direction === "up") {
        return Math.ceil(value * inv) / inv;
    } else if (direction === "down") {
        return Math.floor(value * inv) / inv;
    } else {
        return Math.round(value * inv) / inv;
    }
}
function clamp(num, min, max) {
    return num <= min ? min : num >= max ? max : num;
}

function bumpBackPageContentToRealBackPage(pageFragment, pageNumberDivisor) {
    let backPage = pageFragment.querySelector(".back-page");
    if (backPage) {
        let pageNumberStr =
            backPage.closest(".pagedjs_page").dataset.pageNumber;
        let pageNumber = parseInt(pageNumberStr, 10);
        console.log("last page is on", pageNumber);
        if (pageNumber % pageNumberDivisor !== 0) {
            console.log("last page needs a nudge");
            let pageDiv = document.createElement("div");
            pageDiv.classList.add("end-vacat-page");
            backPage.parentElement.insertBefore(pageDiv, backPage);
        } else {
            console.log("All is well: last page will print on the back page");
        }
    }
}

function hydrateImages(content) {
    content.querySelectorAll("a").forEach((x) => {
        try {
            if (x.href.includes(".png") || x.href.includes(".jpg")) {
                if (x.innerText.length == 0) {
                    let image = document.createElement("img");
                    image.src = x.href;
                    x.replaceWith(image);
                }
            }
        } catch (e) {
            console.log("error in hydrateImages", e);
        }
    });
}

function fixImgUrls(content) {
    try {
        content.querySelectorAll("img").forEach((x) => {
            /* This bit's job is to unbreak the URLs that some websites use for.. reasons*/
            if (x.src.includes("cosmonautsavenue")) {
                x.src = x.src
                    .replace("i0.wp.com", "i2.wp.com")
                    .replace("/02/", "/03/")
                    .split("?")[0];
            }
            if (x.src.includes("https://www.infoq.com/articles")) {
                x.src = x.src.replace(
                    /https:\/\/www(\.infoq\.com\/articles\/.*)\/articles\/.*(\/en\/)/g,
                    "https://res$1$2"
                );
            }
            // if (x.src.includes("https://www.abc.net.au")) {
            //   // from: "https://www.abc.net.au/news/2020-07-21/anna-teen.jpg/12464266?nw=0"
            //   // to: "https://www.abc.net.au/news/image/12464266-3x2-940x627.jpg"
            //   let id;
            //   if (x.src.includes(".jpg/")) {
            //     id = x.src.split(".jpg/")[1].split("?")[0];
            //   } else if (x.src.includes(".jpeg/")) {
            //     id = x.src.split(".jpeg/")[1].split("?")[0];
            //   }
            //   x.src = `https://www.abc.net.au/news/image/${id}-3x2-940x627.jpg`;
            // }
            if (x.src.includes("trbimg")) {
                x.src = "https://www.trbimg" + x.src.split("www.trbimg")[1];
            }
            if (x.src.includes("thumbs-prod.si-cdn.com")) {
                x.src = "https://" + x.src.split("https:/")[2];
            }
        });
    } catch (e) {
        console.log("error in hydrateImages", e);
    }
}

/* <a data-replace-url=""
     data-anchor-title="(Credit: Wikimedia Commons)" 
     data-caption="Karl Maria Kertbeny created the label ’heterosexual&quot; (Credit: Wikimedia Commons)" 
     data-caption-title="" 
     data-replace-image="true" 
     data-is-portrait="false" 
     class="replace-image" 
     title="(Credit: Wikimedia Commons)" 
     href="http://ichef.bbci.co.uk/wwfeatures/wm/live/624_351/images/live/p0/4w/yq/p04wyqt2.jpg" 
     data-ref="d81a1b39-10c1-4a70-8d45-cb23bc56170a">
          View image of (Credit: Wikimedia Commons)
      </a> */
function hydrateImagesBBC(content) {
    console.log(content);
    content
        .querySelectorAll(".inline-media.inline-image a")
        .forEach(function (x) {
            console.log(content);
            if (x.href.includes(".png") || x.href.includes(".jpg")) {
                try {
                    let image = document.createElement("img");
                    image.src = x.href;

                    let capText = x.dataset.caption.split("(Credit")[0];
                    let caption = document.createElement("figcaption");
                    caption.innerHTML = `${capText} &ndash;<cite>${x.title}</cite>`;

                    let fig = document.createElement("figure");
                    fig.appendChild(image);
                    fig.appendChild(caption);
                    x.replaceWith(fig);
                } catch (e) {
                    console.log("error in hydrateImagesBBC", e, x);
                }
            }
        });
}

function hideWikipediaEditLinks(content) {
    console.log(content);
    content
        .querySelectorAll(".en\\.wikipedia\\.org span")
        .forEach(function (x) {
            let re = /\[edit\d*\]/;
            let dummySpan = document.createElement("span");
            if (x.innerText.search(re) !== -1) {
                console.log(x.innerText);
                x.replaceWith(dummySpan);
            }
        });
}

function removeThingsThatUpsetPagedJS(content) {
    content.querySelectorAll("*").forEach((el) => {
        el.removeAttribute("data-page");
        el.removeAttribute("nodeindex");
    });
}

function shortenWikipediaInternalLinks(content) {
    // console.log(content);
    let iconClass = "wikipedia-icon";
    let wikipediaIconURL =
        "https://upload.wikimedia.org/wikipedia/commons/thumb/" +
        "5/5a/Wikipedia%27s_W.svg/128px-Wikipedia%27s_W.svg.png";
    let wikipediaIcon = `<img class="wikipedia-icon" src="${wikipediaIconURL}">`;
    content
        .querySelectorAll(".en\\.wikipedia\\.org ol.printOnly li")
        .forEach((x) => {
            x.innerHTML = x.innerHTML.replace(
                "https://en.wikipedia.org/wiki",
                wikipediaIcon
            );
        });
}

function hideBoringExcerpts(content) {
    content.querySelectorAll(".paper-story").forEach((x) => {
        try {
            let exerpt = x.querySelector(".excerpt").innerText;
            let firstP = x.querySelector("p").innerText;

            if (exerpt == firstP || firstP.includes(exerpt)) {
                console.info("boring:", exerpt);
                x.querySelector(".excerpt").classList.add("boring-hidden");
            }
        } catch (e) {
            console.log("error in hideBoringExcerpts", e, x);
        }
    });
}

function tagIfHasXXX(content) {
    content.querySelectorAll(".paper-story").forEach((x) => {
        try {
            let pre = x.getElementsByTagName("pre");
            pre = Array.from(pre).filter(
                (x) => !Array.from(x.classList).includes("one-line")
            );
            if (pre.length > 0) x.classList.add("has-code");
        } catch (e) {
            console.log("error in tagIfHasCode - code", e, x);
        }

        try {
            let p = x.getElementsByTagName("p");
            p = Array.from(p).filter((x) => /\$\$[^$]+\$\$/.test(x.innerText));
            // if (p.length > 0) {
            //   console.log();
            // }
            if (p.length > 0) x.classList.add("has-latex");
        } catch (e) {
            console.log("error in tagIfHasCode - latex", e, x);
        }

        try {
            let table = x.getElementsByTagName("table");
            if (table.length > 0) {
                x.classList.add("has-table");
            }
        } catch (e) {
            console.log("error in tagIfHasCode - table", e, x);
        }

        try {
            let p = x.getElementsByTagName("p");
            let mathPs = Array.from(p).filter(
                (x) =>
                    // /[^$|^]\${2}[^$]/.test(x.innerText) ||
                    // NOTE: this was: x.innerText.includes("$$") ||
                    // this was finding $$$$$$$SCROOGE MC DUCK as well so [WP-72] tries
                    // to get around this by converting $$tex$$ to \[tex\] so that this
                    // doesn't even need to pick it up
                    x.innerText.includes("\\[") ||
                    x.innerText.includes("[tex]") ||
                    x.innerText.includes("\\(")
            );
            if (mathPs.length > 0) {
                x.classList.add("has-math");
                x.classList.add("pre-math");
            }
        } catch (e) {
            console.log("error in tagIfHasCode - math", e, x);
        }

        ///////////////////////////////
        // Language specific tagging //
        ///////////////////////////////
        // Russian etc.
        const cyrillicRegex = /[ЁёА-я]/g;
        if (cyrillicRegex.exec(x.innerText)) {
            x.classList.add("maybe-cyrillic");
        }
        // Turkish etc.
        const turkishRegex = /[ĞİŞğış]/g;
        if (turkishRegex.exec(x.innerText)) {
            x.classList.add("maybe-turkish");
        }
        // Korean Hangul
        const hangulRegex =
            /[\uac00-\ud7af]|[\u1100-\u11ff]|[\u3130-\u318f]|[\ua960-\ua97f]|[\ud7b0-\ud7ff]/g;
        if (hangulRegex.exec(x.innerText)) {
            x.classList.add("maybe-hangul");
        }
        // hebrew
        const hebrewRegex = /[\u0590-\u05fe]/g;
        if (hangulRegex.exec(x.innerText)) {
            x.classList.add("maybe-hebrew");
        }
    });
}

function makeLinksBreakCleanly(content) {
    //this is an example from the paged.js docs, lightly edited

    // first, look for all the links <a> that are referencing a link started by http or www
    const links = content.querySelectorAll("li.printed-link, span.url"); //their code had: a[href^="http"], a[href^="www"],
    // for each of those links,
    links.forEach((link) => {
        // Break after a colon or a double slash (//) or before a single slash (/), a tilde (~), a period, a comma, a hyphen, an underline (_), a question mark, a number sign, or a percent symbol.
        const content = link.textContent;
        let printableUrl = addBreaksToLink(content);
        // add a data-print-url to keep track of the previous link
        link.setAttribute("data-print-url", content);
        // modify the inner text of the link
        link.innerHTML = printableUrl;
    });
}

function addBreaksToLink(content) {
    let printableUrl = content.replace(/\/\//g, "//\u003Cwbr\u003E");
    printableUrl = printableUrl.replace(/\,/g, ",\u003Cwbr\u003E");
    // put a <wbr> element around to define where to break the line.
    printableUrl = printableUrl.replace(
        /(\/|\~|\-|\.|\,|\_|\?|\#|\%)/g,
        "\u003Cwbr\u003E$1"
    );
    // turn hyphen in non breaking hyphen
    printableUrl = printableUrl.replace(/\-/g, "\u003Cwbr\u003E&#x2011;");
    return printableUrl;
}

function upgradeMarkup(content) {
    // Record all the text nodes before we modify the tree,
    // otherwise we will re-process entries already processed
    content = content || document.body;
    var textNodes = findAllTextNodes(content);
    textNodes = textNodes.filter(
        (thisTextNode) =>
            thisTextNode.parentElement &&
            thisTextNode.parentElement.matches("div.body, div:not([class])")
    );
    textNodes.forEach((thisTextNode, i) => {
        let theText = thisTextNode.textContent.trim();
        if (theText.length > 0) {
            let parent = thisTextNode.parentElement;
            console.log(thisTextNode, theText, parent);
            newP = document.createElement("p");
            let guard = 0;
            while (thisTextNode.nextSibling && guard < 10) {
                guard++;
                console.log({
                    me: thisTextNode,
                    next: thisTextNode.nextSibling,
                });
                if (
                    thisTextNode.nextSibling &&
                    ["I", "B", "EM", "STRONG"].includes(
                        thisTextNode.nextSibling.tagName
                    )
                ) {
                    console.log("*".repeat(20), "an inline element");
                    theText += " " + thisTextNode.nextSibling.outerHTML;
                    parent.removeChild(thisTextNode.nextSibling);
                } else if (
                    thisTextNode.nextSibling &&
                    thisTextNode.nextSibling.nodeName == "#text"
                ) {
                    theText +=
                        " " + thisTextNode.nextSibling.textContent.trim();
                    parent.removeChild(thisTextNode.nextSibling);
                } else if (
                    thisTextNode.nextSibling &&
                    thisTextNode.nextSibling.tagName == "BR"
                ) {
                    parent.removeChild(thisTextNode.nextSibling);
                } else {
                    break;
                }
            }
            newP.innerHTML = theText;
            newP.classList.add("wp-upgraded-from-bare-text-node-by-js");
            thisTextNode.replaceWith(newP);
        }
    });
}

function setupMathjax() {
    (function () {
        var script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js";
        //           "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"
        script.async = true;
        document.head.appendChild(script);
    })();

    window.MathJax = {
        tex: {
            inlineMath: [
                // ["$", "$"], // This is just a disaster
                ["\\(", "\\)"],
            ],
            displayMath: [
                ["$$", "$$"],
                ["\\[", "\\]"],
                ["[tex]", "[/tex]"],
            ],
            processEscapes: true,
        },
        svg: {
            fontCache: "global",
        },
        startup: {
            ready: () => {
                console.log("MathJax is loaded, but not yet initialized");
                MathJax.startup.defaultReady();
                // console.log("MathJax is initialized, the initial typeset is queued");
                // MathJax.startup.promise.then(() => {
                //   // renderLatex();
                //   console.log("MathJax initial typesetting complete");
                // });
            },
        },
    };
}
function renderLatex() {
    console.log("about to re-typeset");
    // MathJax.typeset();
}

function caption_iframes(content) {
    console.log("let's caption some iframes");
    // make this:
    // show up after every iframe
    content.querySelectorAll("iframe").forEach((iframe) => {
        console.log("captioning", iframe);
        const cap = document.createElement("figcaption");
        cap.classList.add("iframe-caption");
        cap.innerHTML = `This was an iframe, it is <a href="${iframe.src}">from here</a>`;

        iframe.parentElement.insertBefore(cap, iframe);
    });
}

function bumpElementToNextPageOrColumn(node) {
    const nodeBottom = node.getBoundingClientRect().bottom;
    const nodeHeight = node.getBoundingClientRect().height;
    const cutoffs = { h1: 0.08, h2: 0.08, h3: 0.08, h4: 0.08, h5: 0.08 };
    let distBottom = cutoffs[node.tagName.toLowerCase()]; // distance (%) of the bottom of the page
    // // This isn't needed because articles always  start on their own page now.
    // if (
    //     node.tagName.toLowerCase() == "h1" &&
    //     node.classList.contains("article-title")
    // ) {
    //     // if not an article title, be a bit more lenient
    //     distBottom = 0.4;
    // }
    // find the overflow line -------------------------------------------------
    const pageContent = node.closest(".pagedjs_page_content");
    const pageContentHeight = pageContent.offsetHeight;
    // in the following code line, 40% from the bottom, so 60% from the top
    const lineOverflow = (1 - distBottom) * pageContentHeight;
    // distance of the bottom node from the top of content area ---------------
    const pageContentTop = pageContent.getBoundingClientRect().top;
    const dist = nodeBottom - pageContentTop;
    // add element to push the title next page / column ----------------------------
    if (dist > lineOverflow) {
        console.log("in renderNode", "bumping", node);
        const shimDiv = document.createElement("div");
        shimDiv.style.height = nodeHeight + pageContentHeight - dist - 1 + "px";
        shimDiv.classList.add("shim-div");
        shimDiv.style.columnSpan = window.getComputedStyle(node).columnSpan;
        // shimDiv.innerHTML = `dist: ${dist}<br>  lineOverflow: ${lineOverflow}`;
        node.parentNode.insertBefore(shimDiv, node);
    }
}

function imageAltTextForMissingImages(content) {
    content.querySelectorAll("img").forEach((img) => {
        if (img.classList.contains("toc_meta_publisher_icon")) {
            // img.onerror = "this.onerror=null; this.src='../pond_icon.png'";
            img.addEventListener(
                "error",
                (img) => (img.src = "../pond_icon.png")
            );
        } else {
            img.alt +=
                (img.alt ? " | " : "") +
                "The image that should be here isn't downloading 😥";
        }
    });
}

function upgrade_pstrong_to_h4(content) {
    // const selectors = [
    //   "p>span>b:only-child",
    //   "p>span>strong:only-child",
    //   "p>strong:only-child",
    //   "p>b:only-child",
    // ].join(", ");
    // content.querySelectorAll(selectors).forEach((thisEl) => {
    //   const parentP = thisEl.closest("p");
    //   let newEl;
    //   console.log("selected", thisEl.innerText, "parent", parentP.innerText);
    //   if (thisEl.innerText.length == parentP.innerText.length) {
    //     if (thisEl.innerText.length < 100) {
    //       newEl = document.createElement("h4");
    //     } else {
    //       // over 100, it should probably be made into a blockquote
    //       newEl = document.createElement("blockquote");
    //     }
    //     newEl.innerHTML = thisEl.innerText;
    //     newEl.classList.add("wp-upgraded-from-p");
    //     parentP.replaceWith(newEl);
    //     console.log("upgrade_pstrong_to_h4", parentP, "->", newEl);
    //   }
    // });
}
