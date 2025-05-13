// ==UserScript==
// @name         Better MWI Chat
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Make Chat Great Again!
// @author       VoltaX
// @match        https://www.milkywayidle.com/*
// @icon         http://milkywayidle.com/favicon.ico
// @grant        none
// ==/UserScript==
const css = 
`
.mwibetterchat-disable{
    display: none;
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
div.chat-message-body{
    border-radius: 10px;
    margin: 3px;
    background: #4357af;
    padding: 5px 8px;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    flex-shrink: 1;
    width: fit-content;
}
div.chat-message-body{
}
`;
const InsertStyleSheet = (style) => {
    const s = new CSSStyleSheet();
    s.replaceSync(style);
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, s];
};
InsertStyleSheet(css);
const HTML = (tagname, attrs, ...children) => {
    if(attrs === undefined) return document.createTextNode(tagname);
    const ele = document.createElement(tagname);
    if(attrs) for(const [key, value] of Object.entries(attrs)){
        if(value === null || value === undefined) continue;
        if(key.charAt(0) === "_"){
            const type = key.slice(1);
            ele.addEventListener(type, value);
        }
        else if(key === "eventListener"){
            for(const listener of value){
                ele.addEventListener(listener.type, listener.listener, listener.options);
            }
        }
        else ele.setAttribute(key, value);
    }
    for(const child of children) if(child) ele.append(child);
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
        const contentWrapper = HTML("div", {class: "chat-message-body"});
        contentWrapper.replaceChildren(...[...div.children]);
        div.replaceChildren(nameWrapper, contentWrapper); 
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
}
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
}
const MoveChatPannel = (firstInvoked = true) => {
    const chatDiv = document.querySelector(`div.Chat_chat__3DQkj${firstInvoked?":not([moved])":""}`);
    const characterDiv = document.querySelector(`div.CharacterManagement_characterManagement__2PhvW${firstInvoked?":not([moved])":""}`);
    if(!chatDiv || !characterDiv) return;
    if(firstInvoked) AddSwitchButton(chatDiv);
    chatDiv.setAttribute("moved", "");
    characterDiv.setAttribute("moved", "");
    const chatWrapper = chatDiv.parentElement;
    characterDiv.replaceWith(chatDiv);
    chatWrapper.replaceChildren(characterDiv);
}
const ManageScrolling = () => {
    document.querySelectorAll("div.ChatHistory_chatHistory__1EiG3:not([listening])").forEach(div => {
        div.setAttribute("listening", "");
        div.addEventListener("scroll", (ev) => {
            const t = ev.target;
            const shouldScrollToBottom = t.offsetHeight + t.scrollTop + 25 > t.scrollHeight;
            console.log("called", shouldScrollToBottom, t.offsetHeight, t.scrollTop, t.scrollHeight);
            if(shouldScrollToBottom) t.scrollTop = 99999;
        })
    })
}
const OnMutate = (mutlist, observer) => {
    observer.disconnect();
    MoveChatPannel();
    //ManageScrolling();
    ProcessChatMessage();
    observer.observe(document, {subtree: true, childList: true});
};
new MutationObserver(OnMutate).observe(document, {subtree: true, childList: true});