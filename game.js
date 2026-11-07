/* ===== 仙台七日行 · 集章之旅 — 遊戲邏輯 ===== */
(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const fmtYen = (n) => '¥' + n.toLocaleString('en-US');
  const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

  const state = {
    pos: 0,
    st: START_ST,
    money: START_MONEY,
    visited: new Set([0]),
    foods: [],
    souvenirs: 0,
    day: 1,
    over: false,
    busy: false,
    pendingSteps: 0,
    rolled: 0,
    begCount: 0,
    restCount: 0,
    skipSummit: false,
    ropewayPaid: false,
    car: false,
    passed: [],
  };

  /* ---------- 建地圖 ---------- */
  const mapEl = $('map'), nodesEl = $('nodes'), tokenEl = $('token');
  mapEl.style.height = MAP_HEIGHT + 'px';

  const svg = $('path-svg');
  svg.setAttribute('viewBox', `0 0 100 ${MAP_HEIGHT}`);
  $('path-line').setAttribute('points',
    NODES.map(n => `${n.x},${n.y}`).join(' '));

  NODES.forEach(n => {
    const d = document.createElement('div');
    d.className = `node ${n.type}`;
    d.id = `node-${n.id}`;
    d.style.left = n.x + '%';
    d.style.top = n.y + 'px';
    const icon = n.img ? `<img src="${n.img}" alt="">` : n.emoji;
    d.innerHTML = `<div class="bubble">${icon}</div>
      <div class="name">${n.name}<small>${n.jp}</small></div>`;
    nodesEl.appendChild(d);
  });

  // Day 標籤：放在每天第一個節點上方偏左
  const labelLayer = $('day-labels');
  let lastDay = 0;
  NODES.forEach(n => {
    if (n.day !== lastDay) {
      lastDay = n.day;
      const l = document.createElement('div');
      l.className = 'day-label';
      l.textContent = `Day ${n.day}`;
      l.style.left = Math.min(85, n.x + 14) + '%';
      l.style.top = (n.y - 62) + 'px';
      labelLayer.appendChild(l);
    }
  });

  const nodeXY = (n) => ({
    x: mapEl.clientWidth * n.x / 100,
    y: n.y,
  });

  // 依景點類型換角色動作
  const POSES = {
    food: 'eat', view: 'camera', temple: 'camera', event: 'camera',
    onsen: 'drink', hotel: 'drink',
    transport: 'map', shop: 'map', start: 'map', finish: 'map',
  };
  const tokenImg = $('token-img');
  function setPose(type) {
    tokenImg.src = `assets/pose_${POSES[type] || 'walk'}.png`;
  }

  function placeToken(idx) {
    const { x, y } = nodeXY(NODES[idx]);
    tokenEl.style.left = x + 'px';
    tokenEl.style.top = y + 'px';
    document.querySelectorAll('.node.here').forEach(e => e.classList.remove('here'));
    $(`node-${idx}`).classList.add('here');
  }

  function scrollToPos(idx) {
    $(`node-${idx}`).scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* ---------- HUD ---------- */
  function updateHUD() {
    $('stat-day').textContent = `Day ${state.day}`;
    const stEl = $('stat-st');
    stEl.textContent = `🔋 ${state.st}`;
    stEl.classList.toggle('low', state.st <= 2);
    $('stat-money').textContent = `💴 ${fmtYen(state.money)}`;
    // 休息 3 次上限只防濫用；體力歸零時緊急休息永遠可用，不然會卡死
    btnRest.disabled = state.restCount >= REST_MAX && state.st > 0;
  }

  // 資源變動飄字（體力/旅費 chip 下方）
  function floatFx(chipId, text, bad) {
    const r = $(chipId).getBoundingClientRect();
    const f = document.createElement('div');
    f.className = 'hud-float ' + (bad ? 'bad' : 'good');
    f.textContent = text;
    f.style.left = (r.left + r.width / 2 + (Math.random() * 16 - 8)) + 'px';
    f.style.top = (r.bottom + 2) + 'px';
    document.body.appendChild(f);
    setTimeout(() => f.remove(), 900);
  }

  function applyFx(fx) {
    if (fx.st) {
      state.st = Math.max(0, Math.min(ST_MAX, state.st + fx.st));
      floatFx('stat-st', (fx.st > 0 ? '+' : '') + fx.st, fx.st < 0);
    }
    if (fx.money) {
      state.money = Math.max(0, state.money + fx.money);
      floatFx('stat-money', (fx.money > 0 ? '+' : '−') + fmtYen(Math.abs(fx.money)), fx.money < 0);
    }
    if (fx.food) state.foods.push(fx.food);
    if (fx.souvenir) state.souvenirs += fx.souvenir;
    updateHUD();
  }

  function fxChips(fx) {
    const chips = [];
    if (fx.st > 0) chips.push(`<span class="fx-chip good">🔋 +${fx.st}</span>`);
    if (fx.st < 0) chips.push(`<span class="fx-chip bad">🔋 ${fx.st}</span>`);
    if (fx.money > 0) chips.push(`<span class="fx-chip good">💴 +${fmtYen(fx.money)}</span>`);
    if (fx.money < 0) chips.push(`<span class="fx-chip bad">💴 ${fmtYen(fx.money)}</span>`);
    if (fx.food) chips.push(`<span class="fx-chip good">🍽️ 美食+1</span>`);
    if (fx.souvenir) chips.push(`<span class="fx-chip good">🎁 +${fx.souvenir}</span>`);
    return chips.join('');
  }

  /* ---------- 事件卡 ---------- */
  function showCard({ emoji, title, sub, text, fx, showStamp }) {
    return new Promise(resolve => {
      const ce = $('card-emoji');
      if (emoji && emoji.startsWith('imgw:')) {
        ce.innerHTML = `<img class="card-img" src="${emoji.slice(5)}" alt="">`;
      } else if (emoji && emoji.startsWith('img:')) {
        ce.innerHTML = `<img class="card-img round" src="${emoji.slice(4)}" alt="">`;
      } else {
        ce.textContent = emoji;
      }
      $('card-title').textContent = title;
      $('card-sub').textContent = sub || '';
      $('card-text').textContent = text;
      $('card-effects').innerHTML = fx ? fxChips(fx) : '';
      const stamp = $('stamp-mark');
      stamp.classList.remove('show');
      $('card-ok').style.display = '';
      $('modal').hidden = false;
      if (showStamp) setTimeout(() => stamp.classList.add('show'), 350);
      $('card-ok').onclick = () => { $('modal').hidden = true; resolve(); };
    });
  }

  // 二選一節點卡：a=花錢享受 b=省錢/替代方案
  function showChoice(node) {
    return new Promise(resolve => {
      const ce = $('card-emoji');
      ce.innerHTML = node.img
        ? `<img class="card-img round" src="${node.img}" alt="">`
        : node.emoji;
      $('card-title').textContent = node.title;
      $('card-sub').textContent = node.jp;
      $('card-text').textContent = node.text + '\n\n要怎麼做？';
      $('card-effects').innerHTML =
        `<button class="btn primary choice-btn" id="ch-a">${node.choice.a.label}</button>` +
        `<button class="btn choice-btn" id="ch-b">${node.choice.b.label}</button>`;
      $('stamp-mark').classList.remove('show');
      $('card-ok').style.display = 'none';
      // 錢不夠的選項直接灰掉
      const afford = (fx) => !fx.money || state.money >= -fx.money;
      const okA = afford(node.choice.a.fx), okB = afford(node.choice.b.fx);
      $('ch-a').disabled = !okA;
      $('ch-b').disabled = !okB;
      // 兩個都買不起 → b 變成免費路過
      if (!okA && !okB) {
        $('ch-b').disabled = false;
        $('ch-b').textContent = '錢包空空，只能路過…';
        $('ch-b').dataset.free = '1';
      } else {
        delete $('ch-b').dataset.free;
      }
      $('modal').hidden = false;
      $('ch-a').onclick = () => { $('modal').hidden = true; resolve('a'); };
      $('ch-b').onclick = () => {
        $('modal').hidden = true;
        resolve($('ch-b').dataset.free ? 'free' : 'b');
      };
    });
  }

  // 眼光攻勢：旅費不夠時先問要不要向哥哥撒嬌（限 3 次）
  const BEG_LINES = [
    '哥哥：「欸欸你又來……好吧。」\n¥5,000 入帳！',
    '哥哥：「說好，這是最後一次喔。」\n（第 2 次）¥5,000 入帳！',
    '哥哥含淚把信用卡交出來了……\n（第 3 次）¥5,000 入帳！',
  ];
  // 住宿專用：哥哥拿出信用卡問「要說什麼？」
  function showBegCard() {
    return new Promise(resolve => {
      const ce = $('card-emoji');
      ce.innerHTML = '💳';
      $('card-title').textContent = '（眼光攻勢）';
      $('card-sub').textContent = '';
      $('card-text').textContent = '住宿費付不出來……\n哥哥拿出信用卡問：「要說什麼？」';
      $('card-effects').innerHTML =
        `<button class="btn primary choice-btn" id="bg-y">說謝謝 🥺</button>` +
        `<button class="btn choice-btn" id="bg-n">不說謝謝 😤</button>`;
      $('stamp-mark').classList.remove('show');
      $('card-ok').style.display = 'none';
      $('modal').hidden = false;
      $('bg-y').onclick = () => { $('modal').hidden = true; resolve(true); };
      $('bg-n').onclick = () => { $('modal').hidden = true; resolve(false); };
    });
  }

  // 路過誘惑：二選一卡（回頭買 / 繼續走）
  function showTempt(node) {
    return new Promise(resolve => {
      const ce = $('card-emoji');
      ce.innerHTML = node.img
        ? `<img class="card-img round" src="${node.img}" alt="">`
        : node.emoji;
      $('card-title').textContent = node.name + '（路過）';
      $('card-sub').textContent = '誘惑來了';
      $('card-text').textContent = node.passBy.text + '\n要回頭嗎？';
      $('card-effects').innerHTML =
        `<button class="btn primary choice-btn" id="tp-y">${node.passBy.label}</button>` +
        `<button class="btn choice-btn" id="tp-n">忍住，繼續走</button>`;
      $('stamp-mark').classList.remove('show');
      $('card-ok').style.display = 'none';
      $('modal').hidden = false;
      $('tp-y').onclick = () => { $('modal').hidden = true; resolve(true); };
      $('tp-n').onclick = () => { $('modal').hidden = true; resolve(false); };
    });
  }

  function showBeg() {
    return new Promise(resolve => {
      const ce = $('card-emoji');
      ce.innerHTML = '🥺';
      $('card-title').textContent = '旅費見底了！';
      $('card-sub').textContent = '';
      $('card-text').textContent = '錢包已經空了……\n要使用必殺技「眼光攻勢」向哥哥撒嬌討旅費嗎？';
      $('card-effects').innerHTML =
        `<button class="btn primary choice-btn" id="bg-y">🥺 是！（+¥5,000）</button>` +
        `<button class="btn choice-btn" id="bg-n">不了，我有骨氣</button>`;
      $('stamp-mark').classList.remove('show');
      $('card-ok').style.display = 'none';
      $('modal').hidden = false;
      $('bg-y').onclick = () => { $('modal').hidden = true; resolve(true); };
      $('bg-n').onclick = () => { $('modal').hidden = true; resolve(false); };
    });
  }

  /* ---------- 特殊節點事件 ---------- */
  function resolveSpecial(key, node) {
    const fx = Object.assign({}, node.fx);
    let extra = '';
    if (key === 'boat') {
      if (Math.random() < 0.5) {
        extra = '\n\n🎉 搶到左邊的位置！峽谷雪景第一排，太幸運了。';
        fx.st = (fx.st || 0) + 2;
      } else {
        extra = '\n\n右邊的位置也不錯啦，船夫的吆喝聲聽得更清楚。';
      }
    } else if (key === 'fox') {
      if (Math.random() < 0.5) {
        extra = '\n\n🎉 剛好趕上抱狐狸場次！毛茸茸的狐狸抱在懷裡，人生值得了。';
        fx.souvenir = (fx.souvenir || 0) + 1;
      } else {
        extra = '\n\n😢 撲空了！抱狐狸時段剛過……只能隔著圍欄看狐狸打滾，還是很可愛啦。';
      }
    } else if (key === 'gyutan') {
      const r = Math.random();
      if (r < 0.4) {
        extra = '\n\n🎉 秒入座！厚切牛舌炭火香爆棚，麥飯加山藥泥是標配。';
      } else if (r < 0.75) {
        extra = '\n\n😅 排了 30 分鐘隊伍……牛舌上桌那刻一切都值得了。';
        fx.st = (fx.st || 0) - 2;
      } else {
        extra = '\n\n😵 大排長龍！立刻啟動備案，轉戰隔壁喜助——秘傳味噌醬汁的厚切牛舌也超強，安全感 200%！';
      }
    }
    return { fx, extra };
  }

  // 沒租車：node 31「加油還車」整個換成搭電車，地圖/事件卡/朱印帳一致
  function applyNoCar() {
    const g = NODES[31];
    if (!g.noCar || g.swapped) return;
    g.swapped = true;
    Object.assign(g, g.noCar);
    const el = $('node-31');
    el.querySelector('.bubble').textContent = g.emoji;
    el.querySelector('.name').innerHTML = `${g.name}<small>${g.jp}</small>`;
  }

  /* ---------- Day 橫幅 ---------- */
  function showDayBanner(day) {
    return new Promise(resolve => {
      $('banner-day').textContent = `Day ${day}`;
      $('banner-title').textContent = DAY_TITLES[day] || '';
      const b = $('day-banner');
      b.hidden = false;
      setTimeout(() => {
        b.classList.add('out');
        setTimeout(() => { b.hidden = true; b.classList.remove('out'); resolve(); }, 400);
      }, 1400);
    });
  }

  /* ---------- 落地處理 ---------- */
  async function landOn(idx) {
    // 過了租車點還是沒車（含沒落在 node 4 的情況）→ 還車格換成搭電車
    if (idx > 4 && !state.car) applyNoCar();
    const node = NODES[idx];
    state.visited.add(idx);
    $(`node-${idx}`).classList.add('visited');

    if (node.day > state.day) {
      state.day = node.day;
      updateHUD();
      await showDayBanner(node.day);
    }

    const icon = node.img ? `img:${node.img}` : node.emoji;

    if (node.choice) {
      // 買不起 → 眼光攻勢（限 3 次）
      const needA = node.choice.a.fx.money < 0 && state.money < -node.choice.a.fx.money;
      if (needA && state.begCount < BEG_LINES.length) {
        const beg = await showBeg();
        if (beg) {
          state.begCount++;
          await showCard({
            emoji: '🥹', title: '眼光攻勢大成功！',
            text: BEG_LINES[state.begCount - 1], fx: { money: 5000 },
          });
          applyFx({ money: 5000 });
        }
      }
      const pick = await showChoice(node);
      const opt = pick === 'free'
        ? { fx: {}, text: '錢包空空，只能含淚路過……下次帶夠錢再來！' }
        : node.choice[pick];
      // 租車：選 a 才解鎖駕駛模式
      if (node.id === 4 && pick === 'a') {
        state.car = true;
        await showCard({
          emoji: '🚗', title: '解鎖駕駛模式！',
          text: '拿到車鑰匙了！接下來：\n\n・移動體力消耗減半（一格 -1）\n・骰子可以擲到 6\n・步數可自由調整（每格 1 體力）',
          fx: null,
        });
      }
      // 沒租車：node 31 加油還車換成搭電車
      if (node.id === 4 && pick !== 'a') applyNoCar();
      // 纜車：付錢才能上山；沒付 → 樹冰＆山頂餐廳整段跳過
      if (node.id === 8) {
        if (pick === 'a') { state.ropewayPaid = true; }
        else { state.skipSummit = true; [9, 10].forEach(i => $(`node-${i}`).classList.add('blocked')); }
      }
      await showCard({
        emoji: icon, title: node.title, sub: node.jp,
        text: opt.text, fx: opt.fx, showStamp: true,
      });
      applyFx(opt.fx);
    } else {
      let fx = node.fx || {};
      let text = node.text;
      // 沒錢（旅館除外，有自己的借錢/網咖劇情）→ 含淚路過：蓋章但沒效果、不跑 special
      const broke = node.type !== 'hotel' && fx.money < 0 && state.money < -fx.money;
      if (node.special && !broke) {
        const r = resolveSpecial(node.special, node);
        fx = r.fx;
        text += r.extra;
      }
      // 住宿費付不起 → 眼光攻勢：哥哥拿出信用卡問「要說什麼？」
      if (node.type === 'hotel' && fx.money < 0 && !node.prepaid
          && state.money < -fx.money && state.begCount < BEG_LINES.length) {
        const said = await showBegCard();
        if (said) {
          state.begCount++;
          const freeFx = Object.assign({}, fx, { money: 0 });
          await showCard({
            emoji: icon, title: node.title, sub: node.jp,
            text: text + '\n\n說了謝謝，然後抽走信用卡狂奔！住宿費哥哥買單～',
            fx: freeFx, showStamp: true,
          });
          applyFx(freeFx);
        } else {
          const cheapFx = { st: Math.ceil((fx.st || 0) / 2) };
          await showCard({
            emoji: icon, title: node.title, sub: node.jp,
            text: text + '\n\n但拉不下臉……一個人默默走去網咖包夜，體力只恢復一半。',
            fx: cheapFx, showStamp: true,
          });
          applyFx(cheapFx);
        }
      } else if (broke) {
      await showCard({
        emoji: icon, title: node.title, sub: node.jp,
        text: text + '\n\n……但摸摸口袋錢不夠，只能含淚路過。',
        fx: {}, showStamp: true,
      });
      } else {
      const moneyBefore = state.money;
      await showCard({
        emoji: icon, title: node.title, sub: node.jp,
        text, fx, showStamp: true,
      });
      applyFx(fx);
      // 早就付掉的住宿：扣款嚇一跳 → 翻訂單退款（只退實際扣到的，沒錢就不會印鈔）
      if (node.prepaid && fx.money < 0) {
        const paid = moneyBefore - state.money;
        if (paid > 0) {
          await showCard({
            emoji: '🧾', title: '等等…翻一下訂單',
            text: `原來這間${node.prepaid}！這晚根本不用掏錢，虛驚一場。`,
            fx: { money: paid },
          });
          applyFx({ money: paid });
        } else {
          await showCard({
            emoji: '🧾', title: '等等…翻一下訂單',
            text: `原來這間${node.prepaid}！反正身上也沒錢可扣，等於免費住一晚，賺到！`,
            fx: null,
          });
        }
      }
      }
    }

    if (node.type === 'finish') { endGame(); return; }

    // 隨機事件（30%）；沒觸發時改骰地點限定突發事件（50%）
    // 要花錢的事件若旅費不足 → 整個泡湯，效果拿不到
    const gated = (ev) => (ev.fx.money < 0 && state.money < -ev.fx.money)
      ? Object.assign({}, ev, { text: ev.text + '\n\n……但摸摸口袋錢不夠，只能含淚路過。', fx: {} })
      : ev;
    let fired = false;
    if (Math.random() < 0.3) {
      const ev = gated(RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)]);
      await showCard({ emoji: ev.emoji, title: ev.title, sub: '隨機事件', text: ev.text, fx: ev.fx });
      applyFx(ev.fx);
      fired = true;
    }
    if (!fired && node.loc && Math.random() < 0.5) {
      const ev = gated(node.loc[Math.floor(Math.random() * node.loc.length)]);
      await showCard({ emoji: ev.emoji, title: ev.title, sub: '突發事件', text: ev.text, fx: ev.fx });
      applyFx(ev.fx);
    }

    state.passed = [];

    state.busy = false;
    setMsg(nextHint());
  }

  function nextHint() {
    if (state.over) return '';
    if (state.st <= 0) return '🔋 體力歸零！按「休息」恢復體力再出發。';
    return '擲骰子繼續前進！';
  }

  function setMsg(t) { $('msg').textContent = t; }

  // 每走一格 -1 體力，並在體力 chip 下方飄 -1
  const hasCar = () => state.car; // 選擇租車才有車

  function drainStep() {
    const cost = hasCar() ? 1 : 2; // 有車省腳力
    state.st = Math.max(0, state.st - cost);
    updateHUD();
    floatFx('stat-st', `-${cost}`, true);
  }

  /* ---------- 移動 ---------- */
  function moveToken(steps) {
    return new Promise(resolve => {
      tokenEl.classList.add('walk');
      setPose('walk');
      let moved = 0;
      const step = async () => {
        // 被跳過的節點不計步數、不停留；越過纜車站沒付錢 → 山上鎖死
        do {
          state.pos = Math.min(NODES.length - 1, state.pos + 1);
          if (state.pos > 8 && !state.ropewayPaid && !state.skipSummit) {
            state.skipSummit = true;
            [9, 10].forEach(i => $(`node-${i}`).classList.add('blocked'));
          }
        } while (state.skipSummit && (state.pos === 9 || state.pos === 10)
                 && state.pos < NODES.length - 1);
        placeToken(state.pos);
        scrollToPos(state.pos);
        drainStep();
        moved++;
        const n = NODES[state.pos];
        // 旅館強制停下：今晚就住這裡，沒走完的步數作廢
        if (moved >= steps || state.pos >= NODES.length - 1 || n.type === 'hotel') {
          tokenEl.classList.remove('walk');
          setPose(n.type);
          if (n.type === 'hotel' && moved < steps)
            setMsg('🏨 抵達今晚住宿！剩下的路明天再走～');
          setTimeout(resolve, 200);
          return;
        }
        // 走到誘惑點就停下來問，答完繼續走
        if (n.passBy && (!n.passBy.fx.money || state.money >= -n.passBy.fx.money)
            && (n.passBy.must || Math.random() < 0.6)) {
          const buy = await showTempt(n);
          if (buy) {
            applyFx(n.passBy.fx);
            if (n.id === 8) state.ropewayPaid = true;
          }
          setTimeout(step, 150);
        } else {
          setTimeout(step, 420);
        }
      };
      setTimeout(step, 150);
    });
  }

  /* ---------- 擲骰流程 ---------- */
  const btnRoll = $('btn-roll'), btnRest = $('btn-rest'), btnGo = $('btn-go');
  const adjRow = $('adjust-row'), diceEl = $('dice'), resEl = $('roll-result');

  btnRoll.onclick = () => {
    if (state.busy || state.over) return;
    if (state.st <= 0) { setMsg('先休息恢復體力！'); return; }
    btnRoll.disabled = btnRest.disabled = true;
    diceEl.classList.add('rolling');
    setMsg('骰子旋轉中…');
    let ticks = 0;
    const roll = setInterval(() => {
      const diceMax = hasCar() ? 6 : 4;
      diceEl.textContent = DICE_FACES[Math.floor(Math.random() * diceMax)];
      if (++ticks > 8) {
        clearInterval(roll);
        diceEl.classList.remove('rolling');
        state.pendingSteps = 1 + Math.floor(Math.random() * diceMax);
        state.rolled = state.pendingSteps;
        diceEl.textContent = DICE_FACES[state.pendingSteps - 1];
        showAdjust();
      }
    }, 70);
  };

  // 調整不即時扣體力；出發時依 |最終步數-原骰點| 一次扣
  function showAdjust() {
    resEl.textContent = state.pendingSteps;
    adjRow.hidden = false;
    const cost = Math.abs(state.pendingSteps - state.rolled);
    // 無車：只能 ±1 微調；有車：可自由調整，但每步花 1 體力
    const lo = hasCar() ? 1 : Math.max(1, state.rolled - 1);
    const hi = hasCar() ? 6 : Math.min(6, state.rolled + 1);
    $('adj-minus').disabled = state.pendingSteps <= lo
      || Math.abs(state.pendingSteps - 1 - state.rolled) > state.st;
    $('adj-plus').disabled = state.pendingSteps >= hi
      || Math.abs(state.pendingSteps + 1 - state.rolled) > state.st;
    if (cost > state.st) { $('adj-minus').disabled = $('adj-plus').disabled = true; }
    btnGo.disabled = cost > state.st;
    setMsg(cost > 0
      ? '確定花 1 點體力微調？'
      : '要花 1 點體力把步數 ±1 嗎？（瞄準想去的店！）');
  }

  function adjust(d) {
    const next = Math.max(1, Math.min(6, state.pendingSteps + d));
    if (next === state.pendingSteps) return;
    state.pendingSteps = next;
    diceEl.textContent = DICE_FACES[state.pendingSteps - 1];
    showAdjust();
  }
  $('adj-minus').onclick = () => adjust(-1);
  $('adj-plus').onclick = () => adjust(1);

  btnGo.onclick = async () => {
    adjRow.hidden = true;
    state.busy = true;
    // 體力決定能走幾格：沒力走不到就中途累倒（至少 1 格）
    const stepCost = hasCar() ? 1 : 2;
    const affordable = Math.max(1, Math.floor(state.st / stepCost));
    const steps = Math.min(state.pendingSteps, affordable);
    const cost = Math.abs(state.pendingSteps - state.rolled);
    if (cost > 0) {
      state.st = Math.max(0, state.st - cost);
      updateHUD();
      floatFx('stat-st', `-${cost}`, true);
    }
    const target = Math.min(NODES.length - 1, state.pos + steps);
    void target;
    setMsg(steps < state.pendingSteps
      ? `體力不足！走 ${steps} 格就累倒了…`
      : `前進 ${steps} 步！`);
    await moveToken(steps);
    state.busy = false;
    btnRoll.disabled = btnRest.disabled = false;
    landOn(state.pos); // 用實際停下的格子觸發事件（可能被機關跳過）
  };

  const REST_MAX = 3;
  btnRest.onclick = () => {
    if (state.busy || state.over) return;
    const emergency = state.st <= 0;
    if (!emergency && state.restCount >= REST_MAX) {
      setMsg('休息次數用完了！省點體力繼續走～');
      return;
    }
    if (!emergency) state.restCount++;
    state.st = Math.min(ST_MAX, state.st + REST_GAIN);
    btnRest.textContent = emergency
      ? `😴 緊急休息 +${REST_GAIN}🔋`
      : `😴 休息 +${REST_GAIN}🔋（剩${REST_MAX - state.restCount}次）`;
    updateHUD();
    setMsg(emergency
      ? '😴 累到倒地……強制休息回復體力！'
      : `😴 好好休息了一下，體力 +${REST_GAIN}！`);
  };

  /* ---------- 朱印帳 ---------- */
  $('btn-book').onclick = () => {
    const list = $('book-list');
    let html = '';
    let lastDay = 0;
    NODES.forEach(n => {
      if (n.day !== lastDay) {
        lastDay = n.day;
        html += `<div class="book-day">Day ${n.day} · ${DAY_TITLES[n.day]}</div>`;
      }
      const got = state.visited.has(n.id);
      html += `<div class="book-item ${got ? '' : 'miss'}">
        <span class="e">${n.emoji}</span> ${n.name}
        <span class="red">${got ? '印' : '？'}</span></div>`;
    });
    list.innerHTML = html;
    $('book').hidden = false;
  };
  $('book-close').onclick = () => { $('book').hidden = true; };

  /* ---------- 結算 ---------- */
  function endGame() {
    state.over = true;
    const score = state.visited.size * 10
      + state.foods.length * 15
      + state.souvenirs * 10
      + state.st * 2
      + Math.floor(state.money / 2000);
    const rank = RANKS.find(r => score >= r.min);
    $('pc-rank').textContent = rank.grade;
    $('pc-rank-title').textContent = rank.title;
    $('pc-note').textContent = rank.note;
    $('pc-stats').innerHTML = `
      <div>📕 印章 ${state.visited.size} / ${NODES.length}</div>
      <div>🍽️ 美食 ${state.foods.length} 項</div>
      <div>🎁 伴手禮 ${state.souvenirs} 件</div>
      <div>💴 剩餘 ${fmtYen(state.money)}</div>`;
    $('pc-foods').innerHTML = state.foods.length
      ? '<b>🍱 吃到的美食</b>' + state.foods.join('、')
      : '<b>🍱 吃到的美食</b>什麼都沒吃到……下次再戰！';
    setTimeout(() => { $('ending').hidden = false; }, 400);
  }

  $('btn-again').onclick = () => location.reload();

  /* ---------- 開場 ---------- */
  placeToken(0);
  $(`node-0`).classList.add('visited');
  updateHUD();

  showCard({
    emoji: 'imgw:assets/title.png', title: '', sub: '12/09 → 12/15',
    text: '照著行程圖擲骰前進吧！落地就能蓋章、觸發事件。\n\n・每走一格就消耗 1 點體力（旅行很累的），溫泉和旅館才能充電\n・骰完點數可以花 1 點體力把步數 ±1，瞄準想吃的店\n・體力空了按「休息」\n・有些景點要自己決定要不要花錢，預算省著用！\n・經過旅館格就會強制 check-in 住一晚（行程就是這樣排的！）\n・錯過的景點就蓋不到章囉！',
    fx: null, showStamp: false,
  });
})();
