/*------------------------------------------------------------------------------
Function:       footnoteLinks()
Author:         Aaron Gustafson (aaron at easy-designs dot net)
Creation Date:  8 May 2005
Version:        1.3
Homepage:       http://www.easy-designs.net/code/footnoteLinks/
License:        Creative Commons Attribution-ShareAlike 2.0 License
                http://creativecommons.org/licenses/by-sa/2.0/
Note:           This version has reduced functionality as it is a demo of 
                the script's development
------------------------------------------------------------------------------*/

window.failedLinks = [];
window.suceededLinks = [];

function footnoteLinks(containerID, targetID, docFrag, show_links_header) {
  console.log("about to footnote", containerID, targetID);
  if (documentNoGood()) return false;
  if (elementNoGood(containerID, targetID, docFrag)) return false;

  let container = docFrag.getElementById(containerID);
  if (container.classList.contains("noted")) return false; // already noted

  let target = docFrag.getElementById(targetID);
  if (show_links_header) {
    let h2 = document.createElement("h2");
    addClass.apply(h2, ["printOnly"]);
    let h2_txt = document.createTextNode("Links");
    h2.appendChild(h2_txt);
  }
  let coll = container.getElementsByTagName("*");
  let ol = document.createElement("ol");
  addClass.apply(ol, ["printOnly"]);
  let myArr = [];
  let thisLink;
  let num = 1;

  Array.from(coll).forEach((el) => {
    let thisClass = el.className;
    let link_href = el.getAttribute("href");
    let link_cite = el.getAttribute("cite");

    if (link_href || link_cite) {
      let thisLink = el.getAttribute("href") ? el.href : el.cite;

      if (el.innerText == "") {
        // TODO: check if there's an image inside
        console.warn(
          "Not footnoting this because it looks empty. Check that it really is",
          el
        );
      } else if (
        el &&
        el.getAttribute("href") &&
        el.getAttribute("href").includes("mailto:?")
      ) {
        console.warn(
          "Not footnoting this because it looks like an email share link",
          el
        );
      } else if (
        thisLink &&
        thisLink.includes("itm_content=footer-recirc") // New Yorker outlinks in footer
      ) {
        console.warn("Not footnoting this because it is an outlink", el);
      } else if (
        thisLink &&
        el.innerText.includes("¶") // ID/permalink to paragraph
      ) {
        console.warn("Not footnoting this because it is a ¶ permalink", el);
      } else if (["P", "DIV"].includes(el.tagName)) {
        console.warn(
          "Not footnoting this because it is a p, " +
            "what lunatic puts an href on a p?",
          el
        );
      } else {
        let note = document.createElement("sup");
        let classy = ["printOnly", ...Array.from(el.classList)];
        classy.forEach((c) => note.classList.add(c));
        // addClass.apply(note, c)
        let note_txt;
        let j = inArray.apply(myArr, [thisLink]);
        if (j || j === 0) {
          note_txt = document.createTextNode(j + 1);
        } else {
          if (thisLink && Object.keys(el.dataset).includes("short_code")) {
            // e.g.
            // <a
            //   data-hash_section=""
            //   data-short_code="VM1s"
            //   data-simplified_url="youtu.be"
            //   href="https://youtu.be/IO9XlQrEt2Y"
            // >
            let linkID = `shortlink${thisLink.hashCode()}`;
            const pondIcon = `<img class="pond-icon" src="../pond_icon.png">`;
            const origin = el.dataset.simplified_url;
            const slCode = el.dataset.short_code;
            const internalLink = el.dataset.hash_section;
            if (el.dataset && el.dataset.linkType == "mailto") {
              li_txt = `<span class="envelope-icon">💌</span> ${el.dataset.emailAddress}`;
            } else if (
              el.href &&
              !(el.href.includes("http") || el.href.includes("mailto"))
            ) {
              li_txt = `<span class="envelope-icon">👽</span> ${el.href}`;
            } else if (thisLink.length > 26) {
              li_txt =
                `<span class="shortened-link">` +
                `  <span class="slCode">${slCode}</span> ` +
                `  ${pondIcon} ` +
                `  <span class="origin">${origin}</span> ` +
                `</span>`;
            } else {
              li_txt = doThingsToFootnoteLinks(thisLink, linkID);
            }
            let li = document.createElement("li");
            li.id = linkID;
            addClass.apply(li, ["printed-link"]);
            li.dataset.sourceLink = thisLink;
            // li.appendChild(li_txt);
            li.innerHTML = li_txt;
            ol.appendChild(li);
            myArr.push(thisLink);
            note_txt = document.createTextNode(num);
            num++;
          } else {
            console.log("This didn't footnote:", el);
          }
        }
        if (el.tagName.toLowerCase() == "blockquote") {
          // let lastChild = lastChildContainingText.apply(coll);
          // lastChild.appendChild(note);
          // TODO: make sure that the number doesn't get a line of its own
          console.log("blockquote to footnote", el);
          construct_superscript_marker(el, note, note_txt);
        } else {
          construct_superscript_marker(el, note, note_txt);
        }
      }
    }
  });
  if (ol.children.length > 0) {
    if (show_links_header) target.appendChild(h2);
    target.appendChild(ol);
  }
  // addClass.apply(document.getElementsByTagName('html')[0],['noted']);
  addClass.apply(container, ["noted"]);
  return true;
}

function doThingsToFootnoteLinks(thisLink, linkID) {
  let li_text = thisLink;

  // https://www.archdaily.com/921333/house-concepts/5d1e35bc284dd15c3d0000ea-house is 78 chars
  const wikipediaIconURL =
    "https://upload.wikimedia.org/wikipedia/commons/thumb/" +
    "5/5a/Wikipedia%27s_W.svg/128px-Wikipedia%27s_W.svg.png";
  const wikipediaIcon = `<img class="wikipedia-icon" src="${wikipediaIconURL}">`;
  var upgrades = [
    {
      name: "remove https://www.",
      regex: /https:\/\/www\./g,
      replaceString: "",
    },
    {
      name: "remove https://",
      regex: /https:\/\//g,
      replaceString: "",
    },
    {
      name: "sub a wikipedia icon",
      regex: "https://en.wikipedia.org/wiki",
      replaceString: wikipediaIcon,
    },
    {
      name: "remove the trailing slash", // it often ends up on a new line on its own
      regex: /\/+$/g,
      replaceString: "",
    },
  ];

  upgrades.forEach((upgradeSpec) => {
    li_text = li_text.replace(upgradeSpec.regex, upgradeSpec.replaceString);
  });

  return li_text;
}

function elementNoGood(containerID, targetID, docFrag) {
  return (
    !docFrag.getElementById(containerID) || !docFrag.getElementById(targetID)
  );
}

function documentNoGood() {
  return (
    !document.getElementById ||
    !document.getElementsByTagName ||
    !document.createElement
  );
}

function construct_superscript_marker(el, note, note_txt) {
  // this fuck about is necesary because:
  // word° is good, but
  // word
  // °     is bad
  // and we can't just make the whole <a> no break because
  // it might be really long
  try {
    if (note_txt instanceof Element) {
    } else if (typeof note_txt == "string") {
      note_txt = document.createTextNode(note_txt);
    }

    makeNoteText(el, note, note_txt);
  } catch {
    console.log(
      "fuck, something went wrong with construct_superscript_marker when called with",
      el,
      note,
      note_txt
    );
  }
}

function makeNoteText(el, note, note_txt) {
  let pattern = /[\.\-&%—+= \/]+/g;
  let splitters = Array.from(el.innerText.matchAll(pattern)).map(
    (arr) => arr[0]
  );
  if (
    el.innerText.trim() == "" &&
    el.innerHTML.trim() != "" &&
    el.querySelector("figure")
  ) {
    // Here we're dealing with marking an element that doesn't have any text to
    // work with, producing:
    // <figcaption class="just-a-note-number">99</figcaption>

    el.classList.add("linked-fig");
    let cap = document.createElement("figcaption");
    cap.classList.add("just-a-note-number");
    cap.appendChild(note_txt);
    el.querySelector("figure").appendChild(cap);

    console.log("an image?", el);
  } else {
    let linkTextArray = el.innerText
      .split(pattern)
      .filter((x) => x != "" && x != "\n" && x != "\n\n");
    let lastWord = linkTextArray.pop();
    let endBit = document.createElement("nobr");
    endBit.append(lastWord);
    note.appendChild(note_txt);
    endBit.insertAdjacentHTML("beforeend", note.outerHTML);
    let newInner = linkTextArray
      .map((element, index) => [element, splitters[index]])
      .flat()
      .join(""); //TODO: work out how to rejoin things without adding space
    el.innerText = newInner;
    el.insertAdjacentHTML("beforeend", "<wbr>" + endBit.outerHTML);
  }
}

async function promiseToShortenLink(node) {
  const parts = node.innerText.split("#");
  node.innerText = parts[0];
  const internalLink = parts[1] || "";

  const api_key = "AIzaSyALDPnYGsg5CA0cuznLke-Jm5Yc82Jq3Bk";
  const url =
    "https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=" + api_key;
  const base = "https://pond.page.link";
  let toShorten = node.dataset.sourceLink;
  // innerText;
  // .includes("http://")
  //   ? node.innerText
  //   : "https://" + node.innerText;

  let options = {
    method: "POST",
    mode: "cors",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json;charset=UTF-8",
    },
    body: JSON.stringify({
      longDynamicLink: `${base}/?link=${toShorten}`,
      suffix: { option: "SHORT" },
    }),
  };

  async function doTheFetch(url, options) {
    try {
      return await fetch(url, options);
    } catch (e) {
      console.error(e, url, options);
    } finally {
      console.log("We do cleanup here");
    }
  }

  let response = await doTheFetch(url, options);

  const report = {
    body: {
      longDynamicLink: `${base}/?link=${toShorten}`,
      suffix: { option: "SHORT" },
    },
    options,
    response,
  };
  if (response.status != 200) {
    window.failedLinks.push(node.innerText);
    console.warn("❌❌❌link shortening failed", report);
    return node;
  } else {
    window.suceededLinks.push(node.innerText);
    console.warn("✔✔✔link shortening worked", report);
  }
  const data = await response.json();

  const pondIcon = `<img class="pond-icon" src="../pond_icon.png">`;
  const prefix = "https://pond.page.link/";
  const slCode = data.shortLink.replace(prefix, "");
  const origin = remove_www(node);
  const x =
    `<span class="shortened-link">` +
    `  <span class="origin">${origin}</span> ` +
    `  ${pondIcon} ` +
    `  <span class="slCode">${slCode}</span> ` +
    `  <span class="internalLink">${internalLink}</span>` +
    `</span>`;
  node.innerHTML = x;
  node.classList.add("shortened-link");
  node.dataset.shortLinkCode = slCode;
  return node;
}

Object.defineProperty(String.prototype, "hashCode", {
  value: function () {
    var hash = 0,
      i,
      chr;
    for (i = 0; i < this.length; i++) {
      chr = this.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  },
});

function remove_www(node) {
  const parts = node.innerText.split("/");
  if (parts[2]) {
    return parts[2].replace("www.", "");
  } else {
    return parts[0];
  }
}
