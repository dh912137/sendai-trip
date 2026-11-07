# 仙台七日行 · 集章之旅 — 專案交接

## 是什麼
把「銀山藏王樹冰去」Excel 行程做成的單頁網頁遊戲（送給妹妹的禮物）。
集章地圖 × 擲骰大富翁：沿 7 天 33 個真實景點的蛇形路線前進、落地蓋章觸發事件。
純前端、零相依、繁中介面。直接雙擊 `index.html` 可玩。

## 檔案
- `index.html` — 骨架：HUD、地圖容器、擲骰列、事件卡 modal、朱印帳、結算明信片
- `style.css` — 粉彩水彩風；`#map::before` 用 `assets/bg.jpg`(原行程圖) 高斯模糊當水彩底
- `data.js` — NODES[]（33 節點：中日文名、emoji、type、fx、座標由正弦波自動排）、NODE_IMG、NODE_CHOICE（二選一消費節點）、NODE_PASSBY（路過誘惑）、LOC_EVENTS（地點突發）、RANDOM_EVENTS、RANKS、常數
- `game.js` — 全部遊戲邏輯（IIFE，無框架）
- `assets/` — 從原行程圖/素材表/生成圖裁的節點插圖 + 5 張去背人物 pose_*.png + chibi.png + bg.jpg + title.png

## 怎麼跑/測試
- 本機靜態伺服器：`$env:TEMP\serve.ps1`（PowerShell HttpListener，port 8901，含 no-store header），用 `Start-Process powershell -ArgumentList ... serve.ps1` 啟動 → http://localhost:8901
- 無頭驗證：Edge `--headless=new --dump-dom` 數 `class="node"` 應為 33；`--screenshot` 截圖
- **主機沒有 python/node/unzip**；工具鏈是 PowerShell + System.Drawing（裁圖/去背都是這樣做的）
- 圖片去背法：白底圖 → 無彩色+高亮度(chroma<24 && min>200)→transparent，邊緣帶半透明

## 核心機制（重要，別弄壞）
- 體力：起步 14、上限 20。**每格 -2，有車 -1**（drainStep 有飄字）。休息 +5 限 3 次，但**體力歸零時緊急休息不限次**（防卡死）。旅館回復量依價格 +7~10（要明顯贏過免費休息）；網咖半補自動取 fx.st 一半
- 旅費：起步 ¥15,000，日本實價（纜車 ¥4,400、遊船 ¥3,600、大川莊 ¥5,000/晚）。飄字在 `applyFx`
- 擲骰：無車 1–4、有車 1–6；步數調整無車 ±1、有車自由（|差|×1體力，出發才扣）
- 移動：**體力決定步數上限**（走不動就中途累倒，btnGo 裡算 affordable）；落地事件用 `state.pos` 實際位置觸發（不要用預算 target，會被跳過機關騙到）
- **旅館格強制停下**：type 'hotel'（id 3/7/12/17/22）走到就停，沒走完的步數作廢（moveToken stop 條件，旅館是每天的收尾）
- 車（`state.car`）：node 4 是選擇節點，選租車 −¥3,000 才解鎖駕駛模式；**沒租時 `applyNoCar()` 把 node 31 換成機場Access線**（data.js `noCar` 欄位，data+DOM 一起換）；觸發點是 landOn 的 `idx > 4 && !state.car`——玩家可能骰過頭沒落在租車點，不能只掛在選擇卡裡
- 纜車（`state.ropewayPaid`/`state.skipSummit`）：node 8 落地選擇 + `must:true` 路過必問；**沒付錢越過 node 8 → node 9/10 變灰跳過**（檢查在 moveToken 的 do-while 裡，時序敏感，改過兩次了）
- 路過誘惑（moveToken 裡逐步觸發，走到那格停下來問）：名物店 60%、纜車必問；買到美食不蓋章
- 眼光攻勢（`state.begCount` 限 3 次）：選擇節點買不起 → +¥5,000；**旅館**買不起 → 哥哥信用卡代付（不扣錢）或網咖睡只回一半體力
- prepaid 住宿（瀧見館 id7、FLAT id22）：先扣款再跳「已付」卡退回；**只退實際扣到的**（錢不夠時 applyFx clamp 到 0，退全款會印鈔，已修過）
- 非選擇型付費節點（遊船/鶴城/狐狸村/善治郎/加油）：**沒錢落地＝含淚路過**，照樣蓋章但 fx 全空、special 不跑（`broke` 檢查在 landOn else 分支；旅館除外，有自己的借錢/網咖劇情）
- 結算：印章+美食+伴手禮+剩餘資源 → S/A/B/C 明信片

## 已知雷區
- `hidden` attribute 必須配 CSS `[hidden]{display:none!important}`（display:flex 會蓋過它）
- 事件文案不寫效果數字，效果只顯示在 icon chips（使用者明確要求）
- 編輯檔案後請提醒使用者 Ctrl+F5（雖然 server 有 no-store，他們習慣了）
