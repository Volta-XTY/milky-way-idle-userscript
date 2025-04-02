// ==UserScript==
// @name         MilkyWayIdle
// @namespace    http://tampermonkey.net/
// @version      2025-03-16
// @description  try to take over the world!
// @author       VoltaXTY
// @match        https://www.milkywayidle.com/game?*
// @icon         http://milkywayidle.com/favicon.ico
// @require      https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js
// @require          https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns@3.0.0/dist/chartjs-adapter-date-fns.bundle.min.js
// @require          https://cdn.jsdelivr.net/npm/chartjs-plugin-crosshair@2.0.0/dist/chartjs-plugin-crosshair.min.js
// @grant        none
// @run-at       document-start
// ==/UserScript==
(async () => {
class ObjectStoreMeta {
    constructor(name, options, indexArr) {
        this.name = name;
        this.options = options;
        this.keyPath = options?.keyPath;
        this.autoIncrement = (options?.autoIncrement) ?? false;
        this.index = indexArr;
    }
};
const DatabaseStructure = [
    new ObjectStoreMeta(
        "ChatMessage",
        {keyPath: "id"},
        [
            "channelTypeHrid",
            "timestamp",
            "characterID",
            "guildID",
            "partyID",
            "isSystemMessage",
            "isModMessage",
            "gameMode",
            "specialChatIconHrid",
            "chatIconHrid",
            "nameColorHrid",
            "senderName",
            "receiverCharacterID",
            "receiverName",
            "message",
            "linksMetadata",
            "cannotBlock",
            "isDeleted",
        ]
    ),
    new ObjectStoreMeta(
        "MarketInfo",
        {autoIncrement: true},
        [
            "itemHrid",
            "orderBooks",
            "dateTime",
        ]
    ),
    new ObjectStoreMeta(
        "ActivePlayerLog",
        {keyPath: "dateTime"},
        [
            "activePlayerCount",
        ]
    )
];
const DatabaseVersion = 5;
const InitDatabase = () => {
    return new Promise((res, err) => {
        const openRequest = window.indexedDB.open("MilkyWaySocketData", DatabaseVersion);
        openRequest.onupgradeneeded = async (event) => {
            const transaction = event.target.transaction;
            const db = event.target.result;
            const currNames = db.objectStoreNames;
            console.log(`List of object stores in older version:`, currNames);
            for(let i = 0; i < currNames.length; i++){
                const name = currNames.item(i);
                const objectStore = transaction.objectStore(name);
                const meta = DatabaseStructure.find(meta => meta.name === name);
                if(!meta || objectStore.keyPath !== (meta.keyPath ?? "") || objectStore.autoIncrement !== (meta.autoIncrement ?? false)){
                    db.deleteObjectStore(name);
                    console.log(`Object store ${name} was deleted`);
                }
            }
            const afterDeletion = db.objectStoreNames;
            for(const meta of DatabaseStructure){
                let objectStore;
                if(!afterDeletion.contains(meta.name)){
                    objectStore = db.createObjectStore(meta.name, meta.options);
                    console.log(`Object store ${meta.name} is to be created.`);
                }
                else objectStore = transaction.objectStore(meta.name);
                const currIndexes = objectStore.indexNames;
                console.log(`List of plain indexes in object store ${meta.name}:`, currIndexes);
                for(let i = 0; i < currIndexes.length; i++){
                    const indexName = currIndexes.item(i);
                    if(!meta.index.includes(indexName))
                        objectStore.deleteIndex(indexName);
                }
                const indexAfterDeletion = objectStore.indexNames;
                for(const indexName of meta.index){
                    if(!indexAfterDeletion.contains(indexName)){
                        objectStore.createIndex(indexName, indexName);
                    }
                }
                console.log(`List of plain indexes in object store ${meta.name} after modification:`, objectStore.indexNames);
            }
        }
        openRequest.onerror = (event) => err(event);
        openRequest.onsuccess = (event) => res(event.target.result);
    })
};
const db = await InitDatabase();
const IDBRead = async(storeName, key, {isIndex = false, indexName = "", update = false, multi = false} = {}) => {
    //console.log(`IDBRead(): storeName=${storeName}, key=${key}, isIndex=${isIndex}, indexName="${indexName}", update=${update}, multi=${multi}`);
    const searchReq = isIndex ?
        db.transaction([storeName], update ? "readwrite" : "readonly").objectStore(storeName).index(indexName).openCursor(key) :
        db.transaction([storeName], update ? "readwrite" : "readonly").objectStore(storeName).openCursor(key);
    const value = await new Promise((res, err) => {
        let result = [];
        searchReq.onerror = (event) => {console.error(event); err(event)};
        searchReq.onsuccess = multi ?
        (event) => {
            const cursor = event.target.result;
            if(cursor){
                result.push(cursor.value);
                cursor.continue();
            }
            else res(result);
        }:
        (event) => {
            const cursor = event.target.result;
            if(cursor) res(cursor);
            else res(undefined);
        }
    });
    return value;
};
const IDBAdd = async (storeName, data) => {
    //console.log("IDBAdd(): ", storeName, data);
    const Store = db.transaction([storeName], "readwrite");
    const addReq = Store.objectStore(storeName).add(data);
    const success = new Promise((res, err) => {
        addReq.onerror = (event) => {console.error(`Error occurred while trying add`, data, `to objectStore ${storeName}: `, event); err(event)};
        addReq.onsuccess = (event) => {res(event)};
    });
    const complete = new Promise((res, err) => {
        Store.oncomplete = (event) => {res(event)};
    })
    await Promise.all([success, complete]);
};
const IDBUpdate = (cursor, newData) => {
    //console.log(`IDBUpdate() | source: ${cursor.source instanceof IDBObjectStore ? cursor.source.name : `${cursor.source.objectStore}[${cursor.source.name}]`} | newData: `, newData);
    return new Promise((res, rej) => {
        const request = cursor.update(newData);
        request.onsuccess = res;
        request.onerror = rej;
    });
}
const css = 
`
.NavigationBar_navigationBarContainer__18vsw .NavigationBar_navigationBar__1gRln .NavigationBar_navigationLinks__1XSSb .NavigationBar_navigationLink__3eAHA .NavigationBar_nav__3uuUl .NavigationBar_contentContainer__1x6WS .NavigationBar_textContainer__7TdaI .NavigationBar_level__3C7eR{
    width: 110px;
}
.ujs-invisible{
    display: none;
}
.ujs-green-border{
    border: 2px solid green;
}
.ujs-red-border{
    border: 2px solid red;
}
img.user-avatar{
    width: 100%;
    height: 100%;
}
#profit-panel{
    position: fixed;
    top: 10px;
    left: 10px;
    width: 600px;
    height: 200px;
    resize: both;
    overflow-x: hidden;
    overflow-y: scroll;
    backgroundColor: #0009;
    color: #fff;
    zIndex: 9999;
    border: 1px solid #fff8;
    display: grid;
    grid-template-columns: 200px 1fr 30px;
    grid-template-rows: 30px 1fr;
}
#profit-panel > .close-button{
    grid-column: 3 / 4;
    grid-row: 1 / 2;
}
#profit-panel > .select-type{
    grid-column: 1 / 2;
    grid-row: 2 / 3;
    display: flex;
    flex-direction: column;
    overflow-y: scroll;
}
#profit-panel > .select-type > li{
    cursor: pointer;
}
#profit-panel > .select-type > li:hover{
    background-color: #fff9;
}
#profit-panel > .show-detail{
    grid-column: 2 / 4;
    grid-row: 2 / 3;
    display: flex;
    flex-direction: column:
    overflow-y: scroll;
}
#ActivePlayerChart{
    z-index: 12345;
    background-color: #131419;
    position: fixed;
    width: 80%;
    height: 80%;
    left: 10%;
    top: 10%;
}
#ActivePlayerChartCanvas{
    width: 100%;
    height: 100%;
}
`;
const clientData = JSON.parse(window.localStorage.getItem("initClientData"));
const itemHrid2CN = new Map(Object.entries(JSON.parse(window.localStorage.getItem("ItemNames"))));
const CN2ItemHrid = new Map([...itemHrid2CN.entries()].map(([En, Ch]) => [Ch, En]));
const InsertStyleSheet = (style) => {
    const s = new CSSStyleSheet();
    s.replaceSync(style);
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, s];
};
let REG_HTML = null;
InsertStyleSheet(css);
const HTML = (tagname, attrs, ...children) => {
    let REG_FLAG = false;
    if(attrs === undefined) return document.createTextNode(tagname);
    const ele = document.createElement(tagname);
    if(attrs) for(const [key, value] of Object.entries(attrs)){
        if(value === null || value === undefined) continue;
        if(key === "REG") REG_FLAG = true;
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
    if(REG_FLAG) REG_HTML = ele;
    return ele;
};
const NotificationHooks = [];
const ReplaceAvatar = () => {
    document.querySelectorAll("div:not(.checked)").forEach((div) =>{
        const className = div.getAttribute("class");
        if(className?.startsWith("FullAvatar_avatar__")){
            div.children[0].replaceWith(
                HTML("img", {class: "user-avatar Icon_icon__2LtL_", role: "img", "aria-label": "avatar", src: "https://s2.loli.net/2025/03/23/wNU8DaFne3qRhiS.jpg"})
            );
        }
        if(className?.startsWith("FullAvatar_avatarOutfit__")){
            div.remove();
        }
        div.classList.add("checked");
    })
}
const AddOrderCountButton = () => {
    document.querySelectorAll("div:not(.checked)").forEach((div) => {
        const className = div.getAttribute("class");
        if(className?.startsWith("MarketplacePanel_label__")){
            div.classList.add("checked");
            const inputEle = div.parentElement.querySelector(":scope input");
            div.parentElement.insertAdjacentElement("beforeend",
                HTML("div", {class: "order-count-group"},
                    ...([100, 500, 1000].map(count => HTML("div", {class: "order-count",}, count))) // TODO
                )
            )
        }
    })
}
const ObserveExperienceBar = () => {
    document.querySelectorAll("div.NavigationBar_experienceBar__2fo3Q > div.NavigationBar_currentExperience__3GDeX:not(.observing)").forEach(div => {
        const target = div.parentElement.parentElement.children[0].children[1];
        target.classList.add("observing");
        const OnMutate = () => {
            const lvl = Math.floor(Number(target.textContent));
            const percent = Number(div.style.width.slice(0, -1)) / 100;
            target.textContent = `${lvl}.${percent.toFixed(6).slice(2)}`;
        };
        OnMutate();
        new MutationObserver(OnMutate).observe(div, {attributes: true, attributeFilter: ["style"]})
    })
}
const ColorMarketItems = (obj) => {
    const avail = new Set(obj.avail);
    const inavail = new Set(obj.inavail);
    document.querySelectorAll("div.MarketplacePanel_marketItems__D4k7e > div").forEach(div => {
        const bordered = div.children[0].children[0];
        const svg = bordered.children[0].children[0];
        const nameCN = svg.getAttribute("aria-label");
        const itemHrid = CN2ItemHrid.get(nameCN);
        bordered.classList.remove("ujs-green-border");
        bordered.classList.remove("ujs-red-border");
        if(avail.has(itemHrid)){
            bordered.classList.add("ujs-green-border");
        }
        else if(inavail.has(itemHrid)){
            bordered.classList.add("ujs-red-border");
        }
        else console.warn(`${itemHrid}既不在avail也不在inavail中`);
    })
}
const ObserveMarketElements = () => {
    const marketPanelEle = document.querySelector("div.TabPanel_tabPanel__tXMJF:not(.TabPanel_hidden__26UM3, [observing])");
    if(!marketPanelEle) return;
    const tabs = marketPanelEle.querySelector(":scope div.MuiTabs-flexContainer")?.children;
    if(!tabs) return;
    marketPanelEle.setAttribute("observing", "");
    let lastName = "";
    const categoryCache = new Map();
    const callback = (observer) => {
        if(marketPanelEle.classList.contains("TabPanel_hidden__26UM3")) return;
        const activeTab = marketPanelEle.querySelector(":scope button.MuiButtonBase-root.MuiTab-root.MuiTab-textColorPrimary.Mui-selected ");
        const categoryName = activeTab.children[0].textContent;
        if(!categoryCache.has(categoryName)){
            const itemHrids = [...document.querySelectorAll("div.MarketplacePanel_marketItems__D4k7e svg")].map(svg => CN2ItemHrid.get(svg.getAttribute("aria-label")))
            categoryCache.set(categoryName, JSON.stringify(itemHrids));
        }
        if(categoryName === lastName) return;
        else lastName = categoryName;
        console.log("切换市场栏", categoryName);
        fetch("http://localhost:12112/marketstatus", {
            method: "POST",
            mode: "cors",
            body: categoryCache.get(categoryName),
        }).then(res => res.json()).then(ColorMarketItems);
    };
    if(tabs.length !== 6) alert("市场物品分类数不等于6");
    new MutationObserver(callback).observe(marketPanelEle, {attributeFilter: ["class"], attributes: true});
    for(let i = 0; i < 6; i++){
        new MutationObserver(callback).observe(tabs[i], {attributeFilter: ["class"], attributes: true});
    }
    callback();
}
const OnMutate = (mutlist, observer) => {
    observer.disconnect();
    for(const hook of NotificationHooks) hook();
    //AddOrderCountButton(); //TODO
    ObserveExperienceBar();
    ObserveMarketElements();
    observer.observe(document, {subtree: true, childList: true});
};
new MutationObserver(OnMutate).observe(document, {subtree: true, childList: true});
const Market = new Map();
const UpdateMarketInfo = (info) => {
    const orderBooks = info.orderBooks[0];
    [orderBooks.bids, orderBooks.asks].forEach(list => {
        let pos = 0, nextpos = 1;
        while(pos < list.length){
            while(nextpos < list.length){
                if(list[nextpos].price === list[pos].price) list[pos].quantity += list[nextpos].quantity;
                nextpos += 1;
            }
            list.splice(pos + 1, nextpos - pos - 1);
            pos = nextpos;
        }
    })
    Market.set(info.itemHrid, orderBooks);
    if(typeof(CalculateProfit(info.itemHrid)) !== "string") UpdateProfitPanel(info.itemHrid);
}
let UserStat = null;
const OriginalWebSocket = window.WebSocket;
window.QueryMarket = async (itemHrid, askData = true) => {
    let result = await IDBRead("MarketInfo", undefined, {isIndex: true, indexName: "itemHrid", multi: true})
    result = result.filter(a => a.itemHrid === itemHrid).sort((a, b) => b.dateTime - a.dateTime).map(a => {
        const arr = askData ? a.orderBooks[0].asks : a.orderBooks[0].bids;
        return {
            dateTime: new Date(a.dateTime).toString(),
            data: arr.reduce((result, item) => {
                if(result.length != 0 && item.price === result.at(-1).price) result.at(-1).quantity += item.quantity;
                else result.push(item);
                return result;
            }, [])
        };
    });
    console.log(result);
}
window.ToggleChart = async (type) => {
    switch(type){
        case "ActivePlayer": {
            let ele = document.getElementById("ActivePlayerChart");
            let data = await IDBRead("ActivePlayerLog", undefined, {multi: true});
            data = data.map(({dateTime, activePlayerCount}) => ({x: dateTime, y: activePlayerCount})).sort((a, b) => a.x - b.x);
            console.log(data);
            if(ele){
                ele.classList.toggle("ujs-invisible");
                break;
            }
            ele = HTML("div", {id: "ActivePlayerChart"},
                HTML("canvas", {id: "ActivePlayerChartCanvas"})
            );
            document.body.append(ele);
            const canvas = document.getElementById("ActivePlayerChartCanvas");
            new ResizeObserver((entries) => {
                const entry = entries.at(-1);
                canvas.width = entry.contentBoxSize[0].inlineSize;
                canvas.height = entry.contentBoxSize[0].blockSize;
            }).observe(ele);
            new Chart(canvas,{
                type: "line",
                data: {datasets: [{data: data}]},
                options: {
                    parsing: false,
                    scales: {
                        x: {
                            type: "time",
                            time: {
                                unit: "day",
                                displayFormats: {
                                    hour: "HH:mm",
                                    day: "MM/dd",
                                },
                                ticks: {
                                    color: "#FFFFFF",
                                }
                            }
                        }
                    }
                }
            })
            break;
        }
    }
}
window.ExportChat = async () => {

};
window.WebSocket = function (...args) {
    const ws = new OriginalWebSocket(...args);
    ws.addEventListener('message', (event) => {
        const json = event.data;
        try{
            const obj = JSON.parse(json);
            console.log(obj);
            switch(obj.type){
                case "market_item_order_books_updated":{
                    obj.marketItemOrderBooks.dateTime = new Date().getTime();
                    IDBAdd("MarketInfo", obj.marketItemOrderBooks);
                    fetch("http://localhost:12112/setmarket", {
                        mode: "cors",
                        method: "POST",
                        body: JSON.stringify(obj.marketItemOrderBooks)
                    })
                    break;
                }
                case "chat_message_received":{
                    if(obj.message.isModMessage || obj.message.seacialChatIconHrid === "/chat_icons/moderator"){
                        new Notification(`管理员 ${obj.message.senderName} 的发言：`, {body: obj.message.message});
                    }
                    if(obj.message.channelTypeHrid === "/chat_channel_types/guild" && obj.message.senderName !== "VoltaX"){
                        new Notification(`${obj.message.senderName}: `, {body: obj.message.message})
                    }
                    IDBAdd("ChatMessage", obj.message);
                    break;
                }
                case "action_type_consumable_slots_updated":{
                    for(const action of ["/action_types/brewing", "/action_types/crafting"]) if(obj.actionTypeDrinkSlotsMap[action].slice(0, 3).find(item => !item || !item.isActive)) new Notification("冲泡饮料已用完！", {requireInteraction: true});
                    break;
                }
                case "init_character_data":{
                    UserStat = obj;
                    break;
                }
                case "market_listings_updated":{
                    for(const listing of obj.endMarketListings){
                        const count = listing.isSell ? listing.unclaimedCoinCount / (listing.price - Math.floor(listing.price* 0.02)) : list.unclaimedItemCount;
                        if(count >= 10 || count / listing.orderQuantity >= 0.1)
                            new Notification(`${listing.isSell ? "卖出" : "收购"} ${itemHrid2CN.get(listing.itemHrid)} ${count}`);
                    }
                    break;
                }
                case "active_player_count_updated":{
                    IDBAdd("ActivePlayerLog", {dateTime: new Date().getTime(), activePlayerCount: obj.activePlayerCount});
                    break;
                }
            }
        }
        catch(e){
            if(e instanceof SyntaxError) console.log("Syntax Error");
            else console.error(e);
        }
    });

    return ws;
};
const FindBackToMarketButton = () => {
    for(const button of [...document.querySelectorAll("button.Button_button__1Fe9z")]){
        if(button.textContent === "查看所有物品"){
            button.click();
            break;
        }
    }
}
// 保留 WebSocket 的其余属性和方法
window.WebSocket.prototype = OriginalWebSocket.prototype;
console.log('WebSocket hijacking initialized with immediate message capture and delayed UI!');
document.addEventListener("keydown", (ev) => {
    if(Notification.permission !== "granted"){
        Notification.requestPermission();
    }
    if(!ev.altKey) return;
    switch(ev.code){
        case "KeyA":
            ToggleChart("ActivePlayer");
            break;
        case "KeyP":
            ToggleProfitPanel();
            break;
        case "KeyQ":
            FindBackToMarketButton();
            break;
    }
});
})();