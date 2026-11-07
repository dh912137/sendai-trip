/* ============================================================
   仙台七日行 · 集章之旅 — 行程資料
   資料來源：銀山藏王樹冰去.xlsx「行」sheet (2026/12/09 - 12/15)
   ============================================================ */

// type: start / food / onsen / temple / view / shop / hotel / event / transport / finish
// fx: { st:體力, money:旅費, food:'美食名', souvenir:伴手禮數 }
// special: 交由 game.js 處理的隨機/特殊事件
const NODES = [
  // ── Day 1 · 12/09 三 ──────────────────────────────
  { id: 0, day: 1, name: '仙台空港', jp: 'JX862', emoji: '✈️', type: 'start',
    title: '抵達！仙台空港',
    text: '星宇 JX862 準時降落！東北之旅正式開始。拿出西瓜卡，準備搭 25 分鐘地鐵進市區。',
    fx: {} },
  { id: 1, day: 1, name: 'JR仙台驛', jp: 'ずんだ茶寮', emoji: '🚉', type: 'food',
    title: 'JR 仙台驛 · ずんだ茶寮',
    text: '3 樓牛舌通入口旁就是ずんだ茶寮！第一站先來杯毛豆泥奶昔，甜甜的豆子味意外好喝。',
    fx: { money: -500, food: '🍵 ずんだ奶昔' } },
  { id: 2, day: 1, name: '定禪寺通', jp: '光之樂章', emoji: '✨', type: 'view',
    title: '定禪寺通 · SENDAI 光之樂章',
    text: '搭南北線到勾当台公園站，櫸木大道上百萬顆 LED 點亮冬夜，整條街變成光的隧道。',
    fx: { st: 2 } },
  { id: 3, day: 1, name: 'APA飯店', jp: 'TKP 仙台車站北', emoji: '🏨', type: 'hotel',
    title: 'APA 飯店 TKP 仙台車站北',
    text: 'Check in！第一天趕路辛苦了，明天開始就是自駕行程，早點休息。',
    fx: { st: 8, money: -2000 } },

  // ── Day 2 · 12/10 四 ──────────────────────────────
  { id: 4, day: 2, name: 'TOYOTA租車', jp: '仙台新幹線口店', emoji: '🚗', type: 'transport',
    title: 'TOYOTA 租車 仙台新幹線口店',
    text: '從飯店走路 5 分鐘取車！接下來四天的東北縱走就靠它了，雪胎確認 OK。',
    fx: { money: -3000 } },
  { id: 5, day: 2, name: '最上川遊船', jp: 'もがみ川舟下り', emoji: '🚢', type: 'view',
    title: '最上川遊船',
    text: '開了 1 小時 50 分到古口港！船頭坐左邊風景比較好是內行人的知識。船夫的船歌迴盪在峽谷間。',
    fx: { money: -3600 }, special: 'boat' },
  { id: 6, day: 2, name: '銀山溫泉', jp: 'ぎんざんおんせん', emoji: '♨️', type: 'onsen',
    title: '銀山溫泉',
    text: '大正浪漫木造旅館街！傍晚煤氣燈亮起、雪落在河面上，整條溫泉街像神隱少女的世界。',
    fx: { st: 4 } },
  { id: 7, day: 2, name: '瀧見館', jp: '滝と蕎麦の宿', emoji: '🏨', type: 'hotel',
    title: '滝と蕎麦の宿 瀧見館',
    text: '今晚住銀山溫泉的瀧見館，個室食事処享用懷石晚餐。窗外就是瀑布聲，一泊二食太幸福。',
    fx: { st: 10, money: -4000 }, prepaid: '預訂時信用卡已付' },

  // ── Day 3 · 12/11 五 ──────────────────────────────
  { id: 8, day: 3, name: '藏王纜車', jp: '蔵王ロープウェイ', emoji: '🚠', type: 'transport',
    title: '藏王纜車',
    text: '山麓線→樹冰高原→山頂線，兩段纜車約 17 分鐘直衝樹冰帶！窗外從森林漸漸變成銀白世界。',
    fx: { money: -4400 } },
  { id: 9, day: 3, name: '樹冰高原', jp: 'スノーモンスター', emoji: '❄️', type: 'view',
    title: '藏王樹冰 · 雪怪現身',
    text: '整片山坡的針葉樹被冰雪包覆成巨大雪怪！零下十度但完全值得，相機拍不停。',
    fx: { st: -2 } },
  { id: 10, day: 3, name: '山頂餐廳', jp: 'レストラン山頂', emoji: '🍴', type: 'food',
    title: 'レストラン山頂',
    text: '山頂站裡的餐廳，邊吃熱食邊看窗外的雪怪群。在山頂吃飯的感覺很特別。',
    fx: { money: -1500, food: '❄️ 山頂午餐' } },
  { id: 11, day: 3, name: '立石寺', jp: '山寺・1000階', emoji: '⛩️', type: 'temple',
    title: '立石寺（山寺）',
    text: '松尾芭蕉寫下「閑さや岩にしみ入蝉の声」的地方。爬完 1000 階腳好酸，但五大堂望出去的景色絕美——山下的櫻桃冰淇淋是犒賞。',
    fx: { st: -3, money: -300 } },
  { id: 12, day: 3, name: '大川莊', jp: '鬼滅の宿・蘆之牧溫泉', emoji: '🏨', type: 'hotel',
    title: '蘆之牧溫泉 大川莊（鬼滅之宿）',
    text: '開 2 小時 10 分抵達！傳說中神似無限城的溫泉旅館，太鼓表演配上浮舞台，鬼滅迷必訪聖地。',
    fx: { st: 10, money: -5000 } },

  // ── Day 4 · 12/12 六 ──────────────────────────────
  { id: 13, day: 4, name: '湯野上溫泉站', jp: '茅葺屋根の駅', emoji: '🚉', type: 'view',
    title: '湯野上溫泉站',
    text: '日本唯一的茅草屋頂車站！候車室裡有地爐可以烤火，像走進昭和時代。',
    fx: {} },
  { id: 14, day: 4, name: '大內宿', jp: '三澤屋 蔥蕎麥', emoji: '🏘️', type: 'food',
    title: '大內宿 · 三澤屋高遠蕎麥麵',
    text: '江戶宿場茅草屋聚落！名物是用整根大蔥當筷子吃的「蔥蕎麥」，邊撈麵邊咬蔥，嗆辣過癮。',
    fx: { money: -1200, food: '🥬 蔥蕎麥' } },
  { id: 15, day: 4, name: '蘆之牧溫泉站', jp: 'ねこ駅長', emoji: '🐱', type: 'view',
    title: '蘆之牧溫泉站',
    text: '貓奴注意！這裡有貓站長值班，毛茸茸地在剪票口打瞌睡。',
    fx: { st: 2 } },
  { id: 16, day: 4, name: '會津若松城', jp: '鶴ヶ城', emoji: '🏯', type: 'temple',
    title: '會津若松城（鶴城）',
    text: '紅瓦白牆的東北名城，戊辰戰爭的舞台。天守閣俯瞰會津盆地，冬雪裡格外有氣勢。',
    fx: { money: -400 } },
  { id: 17, day: 4, name: '大川莊·第二晚', jp: 'もう一泊', emoji: '🏨', type: 'hotel',
    title: '大川莊・第二晚',
    text: '今晚繼續住無限城（誤）。泡完溫泉再聽一次太鼓，還是起雞皮疙瘩。',
    fx: { st: 10, money: -5000 } },

  // ── Day 5 · 12/13 日 ──────────────────────────────
  { id: 18, day: 5, name: '藏王狐狸村', jp: '宮城蔵王キツネ村', emoji: '🦊', type: 'event',
    title: '藏王狐狸村',
    text: '一百多隻狐狸放養的村子！抱狐狸體驗一天只有 11:00 和 14:00 兩場……',
    fx: { money: -1500 }, special: 'fox' },
  { id: 19, day: 5, name: 'ITAGAKI', jp: 'いたがき本店', emoji: '🍓', type: 'food',
    title: 'いたがき (ITAGAKI) 本店',
    text: '仙台老字號水果店！水果三明治和現打果汁都超強，回程前順手補貨。',
    fx: { money: -1000, food: '🍓 水果三明治' } },
  { id: 20, day: 5, name: '光之樂章·再訪', jp: '三瀧山不動院', emoji: '✨', type: 'view',
    title: 'Clis Road 商店街 → 光之樂章',
    text: '先繞去三瀧山不動院拜福神仙台四郎，求全家財源廣進，再順著商店街逛到定禪寺通看點燈。',
    fx: {} },
  { id: 21, day: 5, name: '善治郎牛舌', jp: 'たんや善治郎', emoji: '🥩', type: 'food',
    title: 'たんや善治郎（牛舌排隊賭博）',
    text: '善治郎不開放預約，只能現場排——排隊 3-4 組內就賭下去！萬一大排長龍，備案是隔壁的喜助……',
    fx: { money: -2500, food: '🥩 厚切牛舌' }, special: 'gyutan' },
  { id: 22, day: 5, name: 'FLAT GORIN', jp: 'Sendai FLAT 01', emoji: '🏨', type: 'hotel',
    title: 'Sendai FLAT 01 GORIN',
    text: '回到仙台的民宿窩。空間大又舒服，明天是松島一日遊。',
    fx: { st: 7, money: -1500 }, prepaid: '預訂時已付（不能退款）' },

  // ── Day 6 · 12/14 一 ──────────────────────────────
  { id: 23, day: 6, name: '松島海岸', jp: '日本三景', emoji: '🌊', type: 'view',
    title: '松島海岸',
    text: '日本三景之一！兩百多座松樹小島散落在海灣裡，冬天的海面特別藍。',
    fx: {} },
  { id: 24, day: 6, name: '五大堂·瑞巖寺', jp: '伊達政宗の寺', emoji: '⛩️', type: 'temple',
    title: '五大堂 · 瑞巖寺',
    text: '走過紅色透橋到五大堂，再訪伊達政宗重建的國寶瑞巖寺，莊嚴的金襴障壁畫值得細看。',
    fx: {} },
  { id: 25, day: 6, name: '仙貝+烤魚板', jp: '雪竹屋・蒲鉾本舗', emoji: '🍘', type: 'food',
    title: '雪竹屋仙貝 × 蒲鉾本舗烤魚板',
    text: '比臉大的現烤醬油仙貝，再自己圍爐烤笹魚板！剛烤好的魚板熱呼呼、Q 彈彈。',
    fx: { money: -1000, food: '🍘 現烤仙貝＆魚板' } },
  { id: 26, day: 6, name: '松島漁市', jp: '松島さかな市場', emoji: '🐟', type: 'food',
    title: '松島漁市午餐',
    text: '魚市場二樓餐廳直球對決：海鮮丼、烤牡蠣、大干貝，全都要。',
    fx: { money: -2000, food: '🐟 漁市海鮮' } },
  { id: 27, day: 6, name: '三井Outlet', jp: '仙台港', emoji: '🛍️', type: 'shop',
    title: '三井 Outlet Park 仙台港',
    text: '旅行尾聲的購物時間！東北最大 outlet，一不小心就逛三小時。',
    fx: { money: -3000, souvenir: 2 } },
  { id: 28, day: 6, name: 'せり草庵', jp: '仙台せり鍋', emoji: '🍲', type: 'food',
    title: '仙台せり鍋と個室和食 せり草庵',
    text: '仙台冬季鄉土料理「水芹鍋」——連根的水芹涮進雞湯裡，爽脆甘甜，冬天限定！',
    fx: { money: -3000, food: '🍲 せり鍋' } },

  // ── Day 7 · 12/15 二 ──────────────────────────────
  { id: 29, day: 7, name: '金蛇水神社', jp: '金運UP', emoji: '🐍', type: 'temple',
    title: '金蛇水神社',
    text: '求財運超靈的神社！蛇紋石摸一摸、金運御守買起來，錢包好像真的變厚了？',
    fx: { money: 1000 } },
  { id: 30, day: 7, name: '閖上浜や', jp: '漁師の海鮮丼', emoji: '🍣', type: 'food',
    title: '閖上港 漁師の海鮮丼 浜や',
    text: '最後一頓正餐用豪華海鮮丼收尾！閖上港直送的漁師丼飯，料多到看不見飯。',
    fx: { money: -1800, food: '🍣 海鮮丼' } },
  { id: 31, day: 7, name: '加油還車', jp: 'レンタカー返却', emoji: '⛽', type: 'transport',
    title: '加油・還車',
    text: '機場聯絡道旁加滿油、還車。四天的夥伴辛苦了，總里程意外驚人。',
    fx: { money: -1500 },
    // 沒租車時由 applyNoCar() 整個換掉（地圖名稱、圖示、事件卡、朱印帳同步）
    noCar: { name: '機場Access線', jp: '仙台空港アクセス線', emoji: '🚃', img: null,
             title: '仙台機場Access線',
             text: '沒開車的日子靠電車！搭機場Access線慢慢搖回仙台空港，東北的雪景看到最後一刻。',
             fx: { money: -650 } } },
  { id: 32, day: 7, name: '仙台機場·回程', jp: 'JX863', emoji: '🏁', type: 'finish',
    title: '仙台機場 · JX863',
    text: '安檢前最後瘋狂採買：萩之月、毛豆泥大福塞滿行李箱！JX863 起飛——東北七日行，圓滿落幕。',
    fx: { money: -1500, souvenir: 1 } },
];

/* 蛇形路線座標（正弦波，模仿原圖的 S 彎）
   x: 百分比 0-100，y: px */
const ROW_H = 150;
const MAP_TOP = 90;
const MAP_BOTTOM = 120;
NODES.forEach((n, i) => {
  n.x = 50 + 34 * Math.sin(i * 0.62);
  n.y = MAP_TOP + i * ROW_H;
});
const MAP_HEIGHT = MAP_TOP + (NODES.length - 1) * ROW_H + MAP_BOTTOM;

/* 節點插圖（自原行程圖裁切，放 assets/） */
const NODE_IMG = {
  0: 'plane', 1: 'zunda', 2: 'jozenji2', 3: 'apahotel', 4: 'car', 5: 'boat',
  6: 'ginzan', 7: 'takimikan', 8: 'cablecar', 9: 'snowtree',
  10: 'restaurant', 11: 'yamadera', 12: 'okawaso', 13: 'yunokami', 14: 'ouchijuku',
  15: 'cat', 16: 'castle', 17: 'okawaso', 18: 'bigfox', 19: 'itagaki', 20: 'jozenji',
  21: 'gyutan2', 22: 'flat', 23: 'matsushima', 24: 'godaido', 25: 'senbei', 26: 'seafood',
  27: 'outlet', 28: 'seri', 29: 'torii', 30: 'seafooddon', 31: 'gas', 32: 'plane2',
};
NODES.forEach(n => { if (NODE_IMG[n.id]) n.img = `assets/${NODE_IMG[n.id]}.png`; });

/* 選擇節點：落地時讓玩家二選一（花錢吃買 vs 省錢路過）
   標記：🍽️=美食收集 🎁=伴手禮收集 🔋=體力 */
const NODE_CHOICE = {
  4: { a: { label: '租車自駕 −¥3,000（解鎖駕駛模式）', fx: { money: -3000 },
           text: '牽到車了！接下來移動省體力、骰子可到 6、步數自由調。' },
       b: { label: '不租，靠大眾運輸', fx: {},
           text: '省一筆！但接下來只能靠雙腳和班次…走路消耗加倍喔。' } },
  8: { a: { label: '搭纜車上山 −¥4,400', fx: { money: -4400 },
           text: '兩段纜車直衝樹冰帶！窗外從森林漸漸變成銀白世界。' },
       b: { label: '不搭，直接開往會津', fx: {},
           text: '纜車太貴了！沿著山路繞去會津，樹冰就留到下次吧。（跳過樹冰＆山頂餐廳）' } },
  1: { a: { label: 'ずんだ奶昔！ −¥600 🍽️+1🔋', fx: { money: -600, st: 1, food: '🍵 ずんだ奶昔' },
           text: '甜甜沙沙的毛豆泥奶昔，第一口就上癮！' },
       b: { label: '省錢，拍照就好', fx: {},
           text: '把錢留給後面的大餐……理智！' } },
  6: { a: { label: '日歸溫泉泡湯 −¥1,500 🔋+7', fx: { money: -1500, st: 7 },
           text: '雪裡泡湯是人生極樂，從腳底暖到頭皮。' },
       b: { label: '只逛溫泉街 🔋+1', fx: { st: 1 },
           text: '煤氣燈下的雪景隨便拍都美。' } },
  10: { a: { label: '山頂午餐 −¥1,800 🍽️+2🔋', fx: { money: -1800, st: 2, food: '❄️ 山頂午餐' },
           text: '配著雪怪群吃熱食，冷掉的胃瞬間復活。' },
       b: { label: '吃自備飯糰 🔋+1', fx: { st: 1 },
           text: '便利商店飯糰配雪景，省錢但還是很幸福。' } },
  11: { a: { label: '搭接駁車 −¥800 🔋−1', fx: { money: -800, st: -1 },
           text: '省腿力但錢包哭了。五大堂景色一樣震撼！' },
       b: { label: '硬爬 1000 階！ 🔋−3', fx: { st: -3 },
           text: '爬到懷疑人生，但登頂的成就感無價——來支櫻桃冰淇淋！' } },
  14: { a: { label: '蔥蕎麥挑戰 −¥1,400 🍽️+2🔋', fx: { money: -1400, st: 2, food: '🥬 蔥蕎麥' },
           text: '用整根大蔥當筷子，越吃越上癮，嗆辣爽快！' },
       b: { label: '只逛茅屋聚落', fx: {},
           text: '在江戶宿場散步拍照，錢包安全。' } },
  19: { a: { label: '水果三明治 −¥1,500 🍽️+1🔋', fx: { money: -1500, st: 1, food: '🍓 水果三明治' },
           text: '生奶油＋新鮮水果的斷面秀，每一口都是幸福的形狀。' },
       b: { label: '只喝果汁 −¥600 🔋+1', fx: { money: -600, st: 1 },
           text: '清爽果汁補充維他命，繼續走！' } },
  24: { a: { label: '買個御守 −¥800 🎁', fx: { money: -800, souvenir: 1 },
           text: '瑞巖寺的御守做工精緻，旅途平安！' },
       b: { label: '誠心參拜（免費）', fx: {},
           text: '雙手合十，祈求接下來骰運亨通。' } },
  25: { a: { label: '烤魚板體驗 −¥1,500 🍽️+2🔋', fx: { money: -1500, st: 2, food: '🍘 現烤仙貝＆魚板' },
           text: '自己圍爐烤的笹魚板熱呼呼，還有比臉大的仙貝！' },
       b: { label: '聞香就好', fx: {},
           text: '炭火香免費，口水自己擦。' } },
  26: { a: { label: '漁市海鮮丼 −¥2,800 🍽️+2🔋', fx: { money: -2800, st: 2, food: '🐟 漁市海鮮' },
           text: '牡蠣干貝堆成小山，鮮甜到說不出話。' },
       b: { label: '茶碗蒸暖胃 −¥1,000 🔋+1', fx: { money: -1000, st: 1 },
           text: '小而美的茶碗蒸，熱熱的也滿足。' } },
  27: { a: { label: '爆買模式 −¥5,000 🎁🎁', fx: { money: -5000, souvenir: 2 },
           text: '行李箱重量 +5kg，戰利品 +2！' },
       b: { label: '小買一下 −¥2,000 🎁', fx: { money: -2000, souvenir: 1 },
           text: '克制地只買了一點點，成熟的大人。' } },
  28: { a: { label: 'せり鍋全餐 −¥4,500 🍽️+2🔋', fx: { money: -4500, st: 2, food: '🍲 せり鍋' },
           text: '水芹連根涮進雞湯，爽脆甘甜——冬天限定的幸福！' },
       b: { label: '只吃小菜 −¥1,200 🔋+1', fx: { money: -1200, st: 1 },
           text: '聞著別桌的鍋香吃小菜，忍耐也是一種修行。' } },
  29: { a: { label: '金運御守 −¥1,000 🎁', fx: { money: -1000, souvenir: 1 },
           text: '金蛇大人保佑！據說帶著它錢包會變厚。' },
       b: { label: '摸蛇紋石（免費 +¥1,000）', fx: { money: 1000 },
           text: '摸了傳說中的蛇紋石……錢包好像真的變厚了？' } },
  30: { a: { label: '海鮮丼 −¥2,500 🍽️+2🔋', fx: { money: -2500, st: 2, food: '🍣 海鮮丼' },
           text: '最後一頓就是要浮誇！料多到看不見飯。' },
       b: { label: '味噌湯定食 −¥800 🔋+1', fx: { money: -800, st: 1 },
           text: '簡單暖胃，把肚子留給機場的萩之月。' } },
  32: { a: { label: '萩之月爆買 −¥2,000 🎁', fx: { money: -2000, souvenir: 1 },
           text: '萩之月、毛豆泥大福塞滿行李箱，圓滿！' },
       b: { label: '空手登機', fx: {},
           text: '伴手禮？心意到了就好（其實是沒錢了）。' } },
};
NODES.forEach(n => { if (NODE_CHOICE[n.id]) n.choice = NODE_CHOICE[n.id]; });

/* 路過誘惑：走經過（沒落地）時 60% 機率問要不要回頭買
   買到美食但不蓋章 */
const NODE_PASSBY = {
  8: { must: true,  // 必問：是上山閘門不是誘惑
       text: '纜車站就在眼前——上山才能看到樹冰，要搭嗎？',
       label: '搭纜車上山 −¥4,400', fx: { money: -4400 } },
  1: { text: '路過ずんだ茶寮，奶昔在向你招手……',
       label: '回頭買！ −¥600 🍽️+1🔋', fx: { money: -600, st: 1, food: '🍵 ずんだ奶昔' } },
  14: { text: '大內宿飄來陣陣蕎麥麵香……',
        label: '回頭吃蔥蕎麥 −¥1,400 🍽️+2🔋', fx: { money: -1400, st: 2, food: '🥬 蔥蕎麥' } },
  19: { text: 'ITAGAKI 的水果三明治斷面秀在櫥窗發光……',
        label: '回頭買！ −¥1,500 🍽️+1🔋', fx: { money: -1500, st: 1, food: '🍓 水果三明治' } },
  25: { text: '烤仙貝的炭火香直竄鼻腔……',
        label: '回頭買！ −¥1,500 🍽️+2🔋', fx: { money: -1500, st: 2, food: '🍘 現烤仙貝' } },
  26: { text: '漁市場烤牡蠣的香味隔條街都聞得到……',
        label: '回頭吃！ −¥2,800 🍽️+2🔋', fx: { money: -2800, st: 2, food: '🐟 漁市海鮮' } },
  30: { text: '浜や的漁師丼招牌在閃閃發亮……',
        label: '回頭吃！ −¥2,500 🍽️+2🔋', fx: { money: -2500, st: 2, food: '🍣 海鮮丼' } },
};
NODES.forEach(n => { if (NODE_PASSBY[n.id]) n.passBy = NODE_PASSBY[n.id]; });

/* 地點限定突發事件：落地後 50% 機率觸發（與全域隨機事件互斥） */
const LOC_EVENTS = {
  5: [{ emoji: '🎶', title: '船夫的歌聲',
        text: '船夫在最上川上即興唱起民謠，迴盪在峽谷間超有感覺！', fx: { st: 2 } }],
  6: [{ emoji: '👘', title: '偶遇和服情侶',
        text: '穿大正和服的情侶在橋上拍照，拜託之下幫你們也拍了一張。', fx: { st: 2 } },
      { emoji: '🌨️', title: '雪變大了',
        text: '銀山溫泉瞬間變成全白世界，美到說不出話……但也冷到發抖。', fx: { st: -2 } }],
  9: [{ emoji: '🚫', title: '纜車臨時停駛',
        text: '山頂風太大，纜車停駛 20 分鐘，在站裡發抖等復駛。', fx: { st: -2 } },
      { emoji: '👹', title: '雪怪正臉！',
        text: '雲霧散開的瞬間，整排樹冰怪獸露出正臉，快門按到手軟！', fx: { st: 2 } }],
  12: [{ emoji: '🥁', title: '太鼓第一排',
        text: '剛好坐上太鼓表演第一排！鼓聲震到心臟跟著跳，雞皮疙瘩滿點。', fx: { st: 2 } },
       { emoji: '⚔️', title: '鬼殺隊coser',
        text: '大廳遇到全套炭治郎 cosplay！合照＋拿到聯名小卡！', fx: { souvenir: 1 } }],
  16: [{ emoji: '🥷', title: '忍者出沒？！',
        text: '城外有忍者裝扮的活動，拿到手裏劍造型鑰匙圈！', fx: { souvenir: 1 } }],
  24: [{ emoji: '🙏', title: '方丈開示',
        text: '剛好遇到方丈開放講堂，聽了一場心靈雞湯。', fx: { st: 2 } }],
  27: [{ emoji: '🏷️', title: '周年慶折扣',
        text: '碰上 outlet 周年慶，滿額再折 10%！荷包意外省到！', fx: { money: 1000 } }],
  29: [{ emoji: '🎊', title: '抽到大吉！',
        text: '順手抽支籤——大吉！金蛇大人加持，感覺做什麼都會順！', fx: { money: 1000 } }],
  30: [{ emoji: '🧑‍🍳', title: '老闆招待',
        text: '豪爽的浜や老闆端出招待小菜：「遠道而來的客人嘛！」', fx: { st: 2 } }],
};
NODES.forEach(n => { if (LOC_EVENTS[n.id]) n.loc = LOC_EVENTS[n.id]; });

const DAY_TITLES = {
  1: '仙台市區・點燈之夜',
  2: '最上川→銀山溫泉',
  3: '藏王樹冰→會津',
  4: '會津散策',
  5: '狐狸村→回仙台',
  6: '松島・日本三景',
  7: '金蛇水神社→回家',
};

/* 擲骰移動後的隨機事件（不覆蓋落地事件，附加觸發） */
const RANDOM_EVENTS = [
  { emoji: '❄️', title: '突然下雪了！',
    text: '東北的十二月，雪說下就下。好美但好冷！',
    fx: { st: -2 } },
  { emoji: '🥛', title: '菅生 PA 休息站',
    text: '藏王牛奶冰淇淋和仙台牛舌便當在招手，手滑就買了。',
    fx: { money: -800, st: 2 } },
  { emoji: '🎁', title: '伴手禮店陷阱',
    text: '「最後再買就好」……結果已經買了。',
    fx: { money: -1200, souvenir: 1 } },
  { emoji: '📸', title: '拍到神級照片',
    text: '快門一按，雪景＋毛茸茸同框成功！心情大好！',
    fx: { st: 2 } },
  { emoji: '🍡', title: 'ずんだ餅補給',
    text: '看到毛豆泥餅就忍不住了。',
    fx: { money: -600, st: 2 } },
  { emoji: '💤', title: '車上睡著',
    text: '暖氣太舒服，在副駕睡到流口水。',
    fx: { st: 2 } },
  { emoji: '🥶', title: '寒流來襲',
    text: '體感溫度直逼零下！發熱衣也擋不住。',
    fx: { st: -2 } },
  { emoji: '🧧', title: '扭蛋一發入魂',
    text: '車站扭蛋機轉到想要的狐狸吊飾！',
    fx: { money: -600, souvenir: 1 } },
];

const RANKS = [
  { min: 300, grade: 'S', title: '傳說級東北旅人', note: '完美！這趟旅程可以寫進族譜。' },
  { min: 150, grade: 'A', title: '資深旅人', note: '充實又盡興的一週！' },
  { min: 90,  grade: 'B', title: '開心旅人', note: '玩得開心就好，留點遺憾下次再來。' },
  { min: -1,  grade: 'C', title: '走馬看花', note: '趕趕趕的一週……下次慢慢來吧。' },
];

const ST_MAX = 20;
const START_ST = 14;
const START_MONEY = 15000;
const REST_GAIN = 5;
