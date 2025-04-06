// ==UserScript==
// @name         MilkyWayIdle
// @namespace    http://tampermonkey.net/
// @version      2025-03-16
// @description  try to take over the world!
// @author       VoltaXTY
// @match        https://www.milkywayidle.com/game?*
// @icon         http://milkywayidle.com/favicon.ico
// @require      https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js
// @require      https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns@3.0.0/dist/chartjs-adapter-date-fns.bundle.min.js
// @require      https://cdn.jsdelivr.net/npm/chartjs-plugin-crosshair@2.0.0/dist/chartjs-plugin-crosshair.min.js
// @grant        none
// @run-at       document-start
// ==/UserScript==
(async () => {
const skillNames =  {
'/skills/total_level': '\u603b\u7b49\u7ea7',
'/skills/milking': '\u6324\u5976',
'/skills/foraging': '\u91c7\u6458',
'/skills/woodcutting': '\u4f10\u6728',
'/skills/cheesesmithing': '\u5976\u916a\u953b\u9020',
'/skills/crafting': '\u5236\u4f5c',
'/skills/tailoring': '\u7f1d\u7eab',
'/skills/cooking': '\u70f9\u996a',
'/skills/brewing': '\u51b2\u6ce1',
'/skills/alchemy': '\u70bc\u91d1',
'/skills/enhancing': '\u5f3a\u5316',
'/skills/stamina': '\u8010\u529b',
'/skills/intelligence': '\u667a\u529b',
'/skills/attack': '\u653b\u51fb',
'/skills/power': '\u529b\u91cf',
'/skills/defense': '\u9632\u5fa1',
'/skills/ranged': '\u8fdc\u7a0b',
'/skills/magic': '\u9b54\u6cd5'
};
const abilityNames = {
'/abilities/poke': '\u7834\u80c6\u4e4b\u523a',
'/abilities/impale': '\u900f\u9aa8\u4e4b\u523a',
'/abilities/puncture': '\u7834\u7532\u4e4b\u523a',
'/abilities/penetrating_strike': '\u8d2f\u5fc3\u4e4b\u523a',
'/abilities/scratch': '\u722a\u5f71\u65a9',
'/abilities/cleave': '\u5206\u88c2\u65a9',
'/abilities/maim': '\u8840\u5203\u65a9',
'/abilities/crippling_slash': '\u81f4\u6b8b\u65a9',
'/abilities/smack': '\u91cd\u78be',
'/abilities/sweep': '\u91cd\u626b',
'/abilities/stunning_blow': '\u91cd\u9524',
'/abilities/quick_shot': '\u5feb\u901f\u5c04\u51fb',
'/abilities/aqua_arrow': '\u6d41\u6c34\u7bad',
'/abilities/flame_arrow': '\u70c8\u7130\u7bad',
'/abilities/rain_of_arrows': '\u7bad\u96e8',
'/abilities/silencing_shot': '\u6c89\u9ed8\u4e4b\u7bad',
'/abilities/steady_shot': '\u7a33\u5b9a\u5c04\u51fb',
'/abilities/pestilent_shot': '\u75ab\u75c5\u5c04\u51fb',
'/abilities/penetrating_shot': '\u8d2f\u7a7f\u5c04\u51fb',
'/abilities/water_strike': '\u6d41\u6c34\u51b2\u51fb',
'/abilities/ice_spear': '\u51b0\u67aa\u672f',
'/abilities/frost_surge': '\u51b0\u971c\u7206\u88c2',
'/abilities/mana_spring': '\u6cd5\u529b\u55b7\u6cc9',
'/abilities/entangle': '\u7f20\u7ed5',
'/abilities/toxic_pollen': '\u5267\u6bd2\u7c89\u5c18',
'/abilities/natures_veil': '\u81ea\u7136\u83cc\u5e55',
'/abilities/fireball': '\u706b\u7403',
'/abilities/flame_blast': '\u7194\u5ca9\u7206\u88c2',
'/abilities/firestorm': '\u706b\u7130\u98ce\u66b4',
'/abilities/smoke_burst': '\u70df\u7206\u706d\u5f71',
'/abilities/minor_heal': '\u521d\u7ea7\u81ea\u6108\u672f',
'/abilities/heal': '\u81ea\u6108\u672f',
'/abilities/quick_aid': '\u5feb\u901f\u6cbb\u7597\u672f',
'/abilities/rejuvenate': '\u7fa4\u4f53\u6cbb\u7597\u672f',
'/abilities/taunt': '\u5632\u8bbd',
'/abilities/provoke': '\u6311\u8845',
'/abilities/toughness': '\u575a\u97e7',
'/abilities/elusiveness': '\u95ea\u907f',
'/abilities/precision': '\u7cbe\u786e',
'/abilities/berserk': '\u72c2\u66b4',
'/abilities/frenzy': '\u72c2\u901f',
'/abilities/elemental_affinity': '\u5143\u7d20\u589e\u5e45',
'/abilities/spike_shell': '\u5c16\u523a\u9632\u62a4',
'/abilities/arcane_reflection': '\u5965\u672f\u53cd\u5c04',
'/abilities/vampirism': '\u5438\u8840',
'/abilities/revive': '\u590d\u6d3b',
'/abilities/insanity': '\u75af\u72c2',
'/abilities/invincible': '\u65e0\u654c',
'/abilities/fierce_aura': '\u7269\u7406\u5149\u73af',
'/abilities/aqua_aura': '\u6d41\u6c34\u5149\u73af',
'/abilities/sylvan_aura': '\u81ea\u7136\u5149\u73af',
'/abilities/flame_aura': '\u706b\u7130\u5149\u73af',
'/abilities/speed_aura': '\u901f\u5ea6\u5149\u73af',
'/abilities/critical_aura': '\u66b4\u51fb\u5149\u73af',
'/abilities/promote': '\u664b\u5347'
};
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
    ),
    new ObjectStoreMeta(
        "GuildMemberStatLog",
        {autoIncrement: true},
        [
            "guildID",
            "characterID",
            "guildExperience",
            "dateTime"
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
.HitpointsBar_currentHp__5exLr, .ManapointsBar_currentMp__3xpqC{
    transition: transform 0.3s ease;
}
.
`;
const clientData = JSON.parse(window.localStorage.getItem("initClientData"));
const Hrid2CN = new Map([
    ...Object.entries(JSON.parse(window.localStorage.getItem("ItemNames"))),
    ...Object.entries(skillNames),
    ...Object.entries(abilityNames),
]);
const CN2ItemHrid = new Map([...Hrid2CN.entries()].map(([En, Ch]) => [Ch, En]));
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
    document.querySelectorAll("div.NavigationBar_experienceBar__2fo3Q > div.NavigationBar_currentExperience__3GDeX:not([observing])").forEach(div => {
        const target = div.parentElement.parentElement.children[0].children[1];
        div.setAttribute("observing", "");
        const OnMutate = () => {
            const lvl = Math.floor(Number(target.textContent.split("+").at(0)));
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
    if(tabs.length !== 6) return;
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
    new MutationObserver(callback).observe(marketPanelEle, {attributeFilter: ["class"], attributes: true});
    for(let i = 0; i < 6; i++){
        new MutationObserver(callback).observe(tabs[i], {attributeFilter: ["class"], attributes: true});
    }
    callback();
}
const AddBattleCountInputButton = () => {
    document.querySelectorAll("div.CombatZones_combatZones__6VliY div.SkillActionDetail_label__1mGQJ").forEach(div => {
        if(div.textContent !== "战斗" || div.hasAttribute("checked")) return;
        div.setAttribute("checked", "");
        const input = div.nextElementSibling.children[0].children[0];
        const _click = () => {
            const prev = input.value;
            input.value = 9;
            const ev = new Event("input", {bubbles: true});
            ev.simulated = true;
            const tracker = input._valueTracker;
            if(tracker) tracker.setValue(prev);
            input.dispatchEvent(ev);
        };
        div.nextElementSibling.insertAdjacentElement("afterend",
            HTML("button", {class: "Button_button__1Fe9z Button_small__3fqC7", _click: _click}, 9)
        )
        _click();
    })
}
const OnMutate = (mutlist, observer) => {
    observer.disconnect();
    for(const hook of NotificationHooks) hook();
    //AddOrderCountButton(); //TODO
    ObserveExperienceBar();
    ObserveMarketElements();
    AddBattleCountInputButton();
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
window.QueryChat = async (playerName) => {
    let result = await IDBRead("ChatMessage", playerName, {isIndex: true, indexName: "senderName", multi: true});
    result.sort((a, b) => b.timestamp - a.timestamp);
    console.log(`${playerName}的所有发言：`);
    for(const message of result)
        console.log(new Date(message.timestamp).toString(), message.message);
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
        console.log(json);
        try{
            const obj = JSON.parse(json);
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
                    if(obj.message.channelTypeHrid === "/chat_channel_types/guild" && obj.message.senderName !== UserStat.character.name){
                        new Notification(`${obj.message.senderName}: `, {body: obj.message.message, requireInteraction: !document.hasFocus()})
                    }
                    if(obj.message.channelTypeHrid === "/chat_channel_types/whisper" && obj.message.senderName !== UserStat.character.name){
                        new Notification(`${obj.message.senderName}: `, {body: obj.message.message, requireInteraction: !document.hasFocus()});
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
                        const count = listing.isSell ? listing.unclaimedCoinCount / (listing.price - Math.floor(listing.price * 0.02)) : listing.unclaimedItemCount;
                        if(count >= 10 || count / listing.orderQuantity >= 0.1)
                            new Notification(`${listing.isSell ? "卖出" : "收购"} ${Hrid2CN.get(listing.itemHrid)} ${count}`);
                    }
                    break;
                }
                case "active_player_count_updated":{
                    IDBAdd("ActivePlayerLog", {dateTime: new Date().getTime(), activePlayerCount: obj.activePlayerCount});
                    break;
                }
                case "actions_updated":{
                    if(obj.endCharacterActions[0].isDone){
                        new Notification("工作完成！", { requireInteraction: !document.hasFocus(), });
                        window.focus();
                    }
                    break;
                }
                case "info":{
                    if(obj.message === "infoNotification.characterLeveledUp"){
                        new Notification(`${Hrid2CN.get(obj.variables[1].data.split(".").at(-1))} 升级至 ${obj.variables[0].data} 级`, {requireInteraction: !document.hasFocus()});
                    }
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