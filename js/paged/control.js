// window.PagedConfig = { auto: false };
const pageCountMultiple = 12;

const titles = "h1, h2, h3, h4, h5";

class MyHandler extends Paged.Handler {
    constructor(chunker, polisher, caller) {
        super(chunker, polisher, caller);
    }

    // beforeParsed(content) {
    //     console.log("in beforeParsed"); //, content);
    //     // setupMathjax();
    //     // removeThingsThatUpsetPagedJS(content);
    //     // upgradeMarkup(content);
    //     // upgrade_pstrong_to_h4(content);
    //     // imageAltTextForMissingImages(content);
    //     // hideWikipediaEditLinks(content);
    //     // shortenWikipediaInternalLinks(content);
    //     // tagIfHasXXX(content);
    //     // hydrateImagesBBC(content);
    //     // hydrateImages(content);
    //     // makeLinksBreakCleanly(content);
    //     // fixImgUrls(content);
    //     // caption_iframes(content);
    //     // footnoteLinksInEachArticle(content); // (containerID, targetID)

    //     console.log("pre");
    //     // shortenFootnoteLinks(content);
    // }

    // afterParsed(parsed) {
    //     // console.log("in afterParsed"); //, parsed);
    // }

    // beforePageLayout(page) {
    //     // console.log("in beforePageLayout"); //, page);
    // }

    renderNode(node) {
        handleNoderendering(node);
    }

    // afterPageLayout(pageFragment, page, breakToken) {
    //     // console.log("in afterPageLayout"); //, pageFragment, page, breakToken);
    //     // pages.forEach((page) => {
    //     // let a = page.element.querySelector("article");
    //     // if (
    //     //     a &&
    //     //     page.element.querySelectorAll("pre").length === 0 &&
    //     //     a.classList.contains("has-code")
    //     // ) {
    //     //     // TODO: turn col-span 1 to 2
    //     //     // Not working because it's not reflowing the next page.
    //     //     // a.classList.remove("has-code");
    //     // }
    //     // if (
    //     //     a &&
    //     //     page.element.querySelectorAll(".shim-div").length === 0 &&
    //     //     page.element.querySelector(".tail-meta")
    //     // ) {
    //     //     a.style.columnFill = "balance";
    //     // }
    //     // });
    // }

    // afterRendered(pages) {
    //     console.log("in afterRendered"); //, pages);
    //     // console.log("ready to bump the pack page");
    //     // bumpBackPageContentToRealBackPage(pageFragment, 2);
    //     // console.log("ready to balance");
    //     // balanceText("h1, h2, h3, li.printed-link, .back-page-toc li");
    //     // hidePageNumberOnBackPage();
    //     console.log("all done!");
    //     document.querySelector("body").classList = "";
    //     // MathJax.typesetPromise();
    //     // document
    //     //     .querySelectorAll("article.pre-math")
    //     //     .forEach((x) => x.classList.remove("pre-math"));
    // }
}
// Paged.registerHandlers(MyHandler);

function hidePageNumberOnBackPage() {
    Array.from(document.querySelectorAll(".back-page"))
        .pop()
        .closest(".pagedjs_pagebox")
        .classList.add("the-real-back-page");
}

async function handleNoderendering(node) {
    if (node && node.nodeType == Node.ELEMENT_NODE) {
        if (node.matches("h1.article-title, h1, h2, h3, h4, h5")) {
            bumpElementToNextPageOrColumn(node);
            if (node.matches("h1.article-title")) {
                if (node.innerText.length > 120) {
                    node.classList.add("very-long-article-title");
                } else if (node.innerText.length > 90) {
                    node.classList.add("quite-long-article-title");
                }
            }
        } else if (node.matches("img, figcaption, .ril_caption, .toc li")) {
            // snapElementsToLineHeight(node);
        } else if (node.matches("li.printed-link")) {
        }
    }
    return node;
}
