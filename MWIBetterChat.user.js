// ==UserScript==
// @name         Better MWI Chat
// @namespace    http://tampermonkey.net/
// @version      1.2.3
// @description  Make Chat Great Again!
// @author       VoltaX
// @match        https://www.milkywayidle.com/*
// @icon         http://milkywayidle.com/favicon.ico
// @grant        none
// ==/UserScript==
let Setting = {
};
const LoadSetting = () => {
    try{
        Setting = {...Setting, ...JSON.parse(window.localStorage.getItem("better-chat-settings") ?? "{}")};
    }
    catch(e){
        console.error(e);
    }
};
const SaveSetting = () => window.localStorage.setItem("better-chat-settings", JSON.stringify(Setting));
const css = 
`
.mwibetterchat-invisible{
    opacity: 0;
}
.mwibetterchat-disable{
    display: none;
    opacity: 0;
}
.rotate-left{
    transform: rotate(90deg);
}
.rotate-right{
    transform: rotate(-90deg);
}
div.ChatMessage_chatMessage__2wev4[processed]:not([not-modified]){
    display: flex;
    flex-direction: column;
}
div.chat-message-header{
    display: flex;
    flex-direction: row;
}
div.chat-message-header span.timespan{
    display: none;
}
div.chat-message-header:hover span.timespan{
    display: auto;
}
input.Chat_chatInput__16dhX{
    width: 100%;
}
div.chat-message-body{
    border-radius: 10px;
    margin: 3px;
    background: var(--color-space-600);
    padding: 5px 8px;
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    flex-shrink: 1;
    width: fit-content;
}
div.chat-message-line{
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    width: fit-content;
}
img.chat-image{
    margin: 3px 0px;
    display: block;
    max-width: 100%;
    height: auto;
    border-radius: 5px;
}
div.chat-message-body-wrapper{
    display: flex;
    flex-direction: row;
    flex-wrap: no-wrap;
    align-items: end;
}
button.repeat-msg-button:hover, div.chat-message-body-wrapper:hover button.repeat-msg-button, div.ChatMessage_chatMessage__2wev4:hover button.repeat-msg-button{
    opacity: 1;
}
button.repeat-msg-button:hover{
    cursor: pointer;
}
button.repeat-msg-button{
    display: inline-block;
    opacity: 0;
    margin: 3px 3px 6px;
    padding: 0px -2px;
    width: 24px;
    height: 24px;
    line-height: 16px;
    font-size: 10px;
    text-wrap: nowrap;
    border-radius: 12px;
    --repeat-button-color: var(--color-ocean-250);
    border: 2px solid var(--repeat-button-color);
    color: var(--repeat-button-color);
    background: rgba(0, 0, 0, 0);
}
div.input-wrapper{
    flex-grow: 1;
}
button.input-clear-button{
    position: absolute;
    right: 62px;
    top: 4px;
    background: none;
    border: none;
}
button.input-clear-button:hover{
    cursor: pointer;
}
button.scroll-to-bottom{
    position: absolute;
    height: 40px;
    width: 40px;
    border-radius: 20px;
    border: none;
    background: var(--color-market-buy);
    bottom: 40px;
    right: 10px;
    opacity: 1;
    @starting-style{
        opacity: 0;
    }
    transition: 0.3s ease allow-discrete;
}
button.scroll-to-bottom:hover{
    cursor: pointer;
    background: var(--color-market-buy-hover);
    opacity: 1;
}
`;
const html = (html) => {
    const t = document.createElement("template");
    t.innerHTML = html;
    return t.content.firstElementChild;
};
const svg_cross = html(`<svg role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 15" height="20px" focusable="false"> <path fill="currentColor" fillRule="evenodd" d="M11.782 4.032a.575.575 0 1 0-.813-.814L7.5 6.687L4.032 3.218a.575.575 0 0 0-.814.814L6.687 7.5l-3.469 3.468a.575.575 0 0 0 .814.814L7.5 8.313l3.469 3.469a.575.575 0 0 0 .813-.814L8.313 7.5z" clipRule="evenodd"/> </svg>`);
const svg_mention = html(`<svg width="800px" height="800px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools --> <title>ic_fluent_mention_24_regular</title> <desc>Created with Sketch.</desc> <g id="🔍-Product-Icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="ic_fluent_mention_24_regular" fill="#212121" fill-rule="nonzero"> <path d="M22,12 L22,13.75 C22,15.8210678 20.3210678,17.5 18.25,17.5 C16.7458289,17.5 15.4485014,16.6143971 14.8509855,15.3361594 C14.032894,16.3552078 12.8400151,17 11.5,17 C8.99236936,17 7,14.7419814 7,12 C7,9.25801861 8.99236936,7 11.5,7 C12.6590052,7 13.7079399,7.48235986 14.5009636,8.27192046 L14.5,7.75 C14.5,7.33578644 14.8357864,7 15.25,7 C15.6296958,7 15.943491,7.28215388 15.9931534,7.64822944 L16,7.75 L16,13.75 C16,14.9926407 17.0073593,16 18.25,16 C19.440864,16 20.4156449,15.0748384 20.4948092,13.9040488 L20.5,13.75 L20.5,12 C20.5,7.30557963 16.6944204,3.5 12,3.5 C7.30557963,3.5 3.5,7.30557963 3.5,12 C3.5,16.6944204 7.30557963,20.5 12,20.5 C13.032966,20.5 14.0394669,20.3160231 14.9851556,19.9612482 C15.3729767,19.8157572 15.8053117,20.0122046 15.9508027,20.4000257 C16.0962937,20.7878469 15.8998463,21.2201818 15.5120251,21.3656728 C14.3985007,21.7834112 13.2135869,22 12,22 C6.4771525,22 2,17.5228475 2,12 C2,6.4771525 6.4771525,2 12,2 C17.4292399,2 21.8479317,6.32667079 21.9961582,11.7200952 L22,12 L22,13.75 L22,12 Z M11.5,8.5 C9.86549502,8.5 8.5,10.047561 8.5,12 C8.5,13.952439 9.86549502,15.5 11.5,15.5 C13.134505,15.5 14.5,13.952439 14.5,12 C14.5,10.047561 13.134505,8.5 11.5,8.5 Z" id="🎨-Color"> </path> </g> </g> </svg>`);
const svg_arrow_head = html(`<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M12 5V19M12 19L6 13M12 19L18 13" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/> </svg>`)
const InsertStyleSheet = (style) => {
    const s = new CSSStyleSheet();
    s.replaceSync(style);
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, s];
};
InsertStyleSheet(css);
const HTML = (tagname, attrs, ...children) => {
    if(attrs === undefined) return document.createTextNode(tagname);
    const ele = document.createElement(tagname);
    let outputFlag = false;
    let outputTarget = null;
    if(attrs) for(const [key, value] of Object.entries(attrs)){
        if(value === null || value === undefined) continue;
        if(key.charAt(0) === "_"){
            const type = key.slice(1);
            ele.addEventListener(type, value);
        }
        if(key.charAt(0) === "!"){
            outputFlag = key.slice(1);
            if(typeof(value) === "object") outputTarget = value;
        }
        else if(key === "eventListener"){
            for(const listener of value){
                ele.addEventListener(listener.type, listener.listener, listener.options);
            }
        }
        else ele.setAttribute(key, value);
    }
    for(const child of children) if(child) ele.append(child);
    if(outputFlag && outputTarget) outputTarget[outputFlag] = ele;
    return ele;
};
const ProcessChatMessage = () => {
    document.querySelectorAll("div.ChatHistory_chatHistory__1EiG3 > div.ChatMessage_chatMessage__2wev4:not([processed])").forEach(div => {
        div.setAttribute("processed", "");
        const timeSpan = div.children[0];
        const parent = div.parentElement;
        const isLastChild = parent.querySelector(":scope > div:nth-last-child(1)") === div;
        timeSpan.classList.add("timespan");
        const nameSpan = div.querySelector(":scope span.ChatMessage_name__1W9tB.ChatMessage_clickable__58ej2")?.parentElement?.parentElement?.parentElement;
        if(!nameSpan) {
            div.setAttribute("not-modified", "");
            return;
        }
        const nameWrapper = HTML("div", {class: "chat-message-header"});
        nameWrapper.replaceChildren(nameSpan, timeSpan);
        const bubble = HTML("div", {class: "chat-message-body-wrapper"});
        const contentWrapper = HTML("div", {class: "chat-message-body"});
        contentWrapper.replaceChildren(...[...div.children].reduce(({newLine, lines}, ele) => {
            if(ele.tagName === "A" && ele.type?.includes("image/") || /\.(?:apng|avif|bmp|gif|ico|jpeg|jpg|png|tif|tiff|webp)$/.test(ele.href)){
                lines.push(HTML("div", {class: "chat-message-line"},
                    HTML("img", {class: "chat-image", src: ele.href})
                ));
                newLine = true;
            }
            else if(newLine) lines.push(HTML("div", {class: "chat-message-line"}, ele));
            else lines.at(-1).append(ele);
            return {newLine, lines};
        }, {newLine: false, lines: [HTML("div", {class: "chat-message-line"})]}).lines);
        const repeatBtn = HTML("button", {class: "repeat-msg-button", _click: () => {
            const contentBuilder = [];
            [...contentWrapper.children].flatMap(line => [...line.children]).forEach(ele => {
                if(ele.tagName === "SPAN") contentBuilder.push(ele.innerText);
                else if(ele.tagName === "A") contentBuilder.push(ele.getAttribute("href"));
                else if(ele.tagName === "IMG") contentBuilder.push(ele.getAttribute("src"));
                else if(ele.tagName === "DIV" && ele.classList.contains("ChatMessage_linkContainer__18Kv3")){
                    const svg = ele.querySelector(':scope svg[aria-label="Skill"]');
                    if(svg) contentBuilder.push(`[${svg.children[0].getAttribute("href").split("#").at(-1)}]`);
                }
            });
            console.log(contentBuilder);
            const input = document.querySelector("input.Chat_chatInput__16dhX");
            const prevVal = input.value;
            input.value = contentBuilder.join("");
            const ev = new Event("input", {bubbles: true});
            ev.simulated = true;
            const tracker = input._valueTracker;
            if(tracker) tracker.setValue(prevVal);
            input.dispatchEvent(ev);
        }}, "+1");
        bubble.replaceChildren(contentWrapper, repeatBtn);
        div.replaceChildren(nameWrapper, bubble); 
        const contentHeight = div.getBoundingClientRect().height;
        if(isLastChild && (parent.offsetHeight + parent.scrollTop + contentHeight > parent.scrollHeight)) parent.scrollTop = parent.scrollTop + contentHeight;
        /*
        const texts = [...div.querySelectorAll(`:scope > span:not([style="display: inline-block;"]):not(.ChatMessage_timestamp__1iRZO)`)];
        texts.forEach(text => text.textContent = text.textContent.replaceAll("喵", ""));
        const userName = div.querySelector(":scope div.CharacterName_name__1amXp")?.dataset?.name;
        if(!userName) return;
        const content = texts.map(span => span.textContent).join("");
        if(content.length > 0){
            const DoRepeat = () => {
                const input = document.querySelector("input.Chat_chatInput__16dhX");
                const prevVal = input.value;
                input.value = content;
                const ev = new Event("input", {bubbles: true});
                ev.simulated = true;
                const tracker = input._valueTracker;
                if(tracker) tracker.setValue(prevVal);
                input.dispatchEvent(ev);
            }
            div.insertAdjacentElement("beforeend",
                HTML("button", {class: "comment-improvement-button repeat-comment-button", _click: DoRepeat}, " + 1 ")
            );
            texts.forEach(text => text.addEventListener("click", DoRepeat));
        }
        const DoMentionOrWhisper = (isMention) => () => {
            const mentionStr = `@${userName}`;
            const input = document.querySelector("input.Chat_chatInput__16dhX");
            const prevVal = input.value;
            input.value = isMention ? `${mentionStr} ${prevVal.replaceAll(/@[a-zA-Z0-9]+/g, "")}` : `/w ${userName} ${prevVal.replaceAll(/\/w [a-zA-Z0-9]+/g, "")}`;
            const ev = new Event("input", {bubbles: true});
            ev.simulated = true;
            const tracker = input._valueTracker;
            if(tracker) tracker.setValue(prevVal);
            input.dispatchEvent(ev);
        };
        div.insertAdjacentElement("beforeend",
            HTML("button", {class: "comment-improvement-button mention-sender-button", _click: DoMentionOrWhisper(true)}, "@此人")
        );
        div.insertAdjacentElement("beforeend",
            HTML("button", {class: "comment-improvement-button whisper-button", _click: DoMentionOrWhisper(false)}, "私聊")
        );
        */
    })
};
const AddSwitchButton = (chatDiv) => {
    const collapse = chatDiv.querySelector(":scope div.TabsComponent_expandCollapseButton__6nOWk");
    const collapsedupe = collapse.cloneNode(true);
    const arrowSVG = collapsedupe.children[0];
    arrowSVG.classList.add("rotate-left");
    collapsedupe.addEventListener("click", () => {
        collapse.classList.toggle("mwibetterchat-disable");
        arrowSVG.classList.toggle("rotate-left");
        arrowSVG.classList.toggle("rotate-right");
        MoveChatPannel(false);
    })
    collapse.classList.add("mwibetterchat-disable");
    collapse.insertAdjacentElement("afterend", collapsedupe);
};
const AddToBottomButton = (chatDiv) => {
    const temp = {};
    chatDiv.insertAdjacentElement("beforeend",
        HTML("button", {class: "scroll-to-bottom", "!retVal": temp, _click: () => {
            const chat = document.querySelector("div.TabPanel_tabPanel__tXMJF:not(.TabPanel_hidden__26UM3) div.ChatHistory_chatHistory__1EiG3");
            console.log(chat);
            if(!chat) return;
            chat.scrollTop = 99999;
        }}, svg_arrow_head.cloneNode(true))
    );
    document.querySelectorAll("div.ChatHistory_chatHistory__1EiG3:not([listening])").forEach(div => {
        div.setAttribute("listening", "");
        div.addEventListener("scroll", (ev) => {
            const t = ev.target;
            const atBottom = t.offsetHeight + t.scrollTop + 25 > t.scrollHeight;
            if(atBottom) temp.retVal.classList.add("mwibetterchat-disable");
            else temp.retVal.classList.remove("mwibetterchat-disable");
        })
    });
}
const MoveChatPannel = (firstInvoked = true) => {
    const chatDiv = document.querySelector(`div.Chat_chat__3DQkj${firstInvoked?":not([moved])":""}`);
    const characterDiv = document.querySelector(`div.CharacterManagement_characterManagement__2PhvW${firstInvoked?":not([moved])":""}`);
    if(!chatDiv || !characterDiv) return;
    if(firstInvoked){
        AddSwitchButton(chatDiv);
        AddToBottomButton(chatDiv);
    }
    chatDiv.setAttribute("moved", "");
    characterDiv.setAttribute("moved", "");
    const chatWrapper = chatDiv.parentElement;
    characterDiv.replaceWith(chatDiv);
    chatWrapper.replaceChildren(characterDiv);
};
const ModifyChatInput = () => {
    const input = document.querySelector("input.Chat_chatInput__16dhX:not([clear-button-added])");
    if(!input) return;
    input.setAttribute("clear-button-added", "");
    const wrapper = HTML("div", {class: "input-wrapper"});
    const clearBtn = HTML("button", {class: "input-clear-button", _click: () => {
        const prevVal = input.value;
        input.value = ""
        const ev = new Event("input", {bubbles: true});
        ev.simulated = true;
        const tracker = input._valueTracker;
        if(tracker) tracker.setValue(prevVal);
        input.dispatchEvent(ev);
    }}, svg_cross.cloneNode(true));
    input.replaceWith(wrapper);
    wrapper.replaceChildren(input, clearBtn);
};
const OnMutate = (mutlist, observer) => {
    observer.disconnect();
    MoveChatPannel();
    ModifyChatInput();
    ProcessChatMessage();
    observer.observe(document, {subtree: true, childList: true});
};
new MutationObserver(OnMutate).observe(document, {subtree: true, childList: true});