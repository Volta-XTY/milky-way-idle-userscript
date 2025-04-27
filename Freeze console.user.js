// ==UserScript==
// @name         Freeze console
// @namespace    http://tampermonkey.net/
// @version      2025-04-27
// @description  Forbid any script to modify window.console
// @author       VoltaX
// @match        https://*/*
// @icon         http://milkywayidle.com/favicon.ico
// @run-at       document-start
// @grant        none
// ==/UserScript==
window.console.log(1);
Object.freeze(window.console);