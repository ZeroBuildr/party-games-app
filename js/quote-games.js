// 台词飞花 / 经典复刻 / 看图猜影视 - 游戏逻辑

// ==================== 台词飞花 ====================
let qb = {
  category: 'all',
  round: 10,
  currentIndex: 0,
  items: [],
  revealed: false,
};

function startQuoteBattle() {
  const items = getQuoteBattleWords(qb.category);
  if (items.length === 0) {
    showToast('该分类暂无词汇');
    return;
  }
  qb.items = shuffleArray(items);
  qb.currentIndex = 0;
  qb.revealed = false;
  renderQuoteBattlePage();
  navTo('quote-play');
}

function renderQuoteBattlePage() {
  const maxRound = qb.round === 0 ? qb.items.length : qb.round;
  if (qb.currentIndex >= maxRound || qb.currentIndex >= qb.items.length) {
    showQuoteBattleEnd();
    return;
  }

  const item = qb.items[qb.currentIndex];
  const numEl = document.getElementById('qb-num');
  const totalEl = document.getElementById('qb-total');
  if (numEl) numEl.textContent = qb.currentIndex + 1;
  if (totalEl) totalEl.textContent = qb.round === 0 ? qb.items.length : Math.min(qb.round, qb.items.length);

  const quoteEl = document.getElementById('qb-quote');
  if (quoteEl) quoteEl.textContent = item.quote;

  const answerArea = document.getElementById('qb-answer-area');
  const revealBtn = document.getElementById('qb-reveal-btn');
  const nextBtn = document.getElementById('qb-next-btn');

  if (answerArea) answerArea.style.display = 'none';
  if (revealBtn) revealBtn.style.display = 'block';
  if (nextBtn) nextBtn.style.display = 'none';
  qb.revealed = false;
}

function revealQuoteAnswer() {
  const item = qb.items[qb.currentIndex];
  const answerArea = document.getElementById('qb-answer-area');
  const revealBtn = document.getElementById('qb-reveal-btn');
  const nextBtn = document.getElementById('qb-next-btn');

  if (answerArea) {
    answerArea.style.display = 'block';
    const ansEl = document.getElementById('qb-answer');
    const srcEl = document.getElementById('qb-source');
    if (ansEl) ansEl.textContent = item.answer;
    if (srcEl) srcEl.textContent = '—— ' + item.source;
  }
  if (revealBtn) revealBtn.style.display = 'none';
  if (nextBtn) nextBtn.style.display = 'block';
  qb.revealed = true;
  vibrate(30);
}

function nextQuote() {
  qb.currentIndex++;
  renderQuoteBattlePage();
}

function showQuoteBattleEnd() {
  const endEl = document.getElementById('qb-end-round');
  if (endEl) endEl.textContent = qb.currentIndex;
  navTo('quote-result');
  saveStat('quotebattle', {
    result: '完成',
    players: 1,
    round: qb.currentIndex,
  });
}

function restartQuoteBattle() {
  startQuoteBattle();
}

function endQuoteBattle() {
  navTo('home');
}

// ==================== 经典复刻 ====================
let sg = {
  category: 'all',
  round: 10,
  currentIndex: 0,
  items: [],
  revealed: false,
};

function startSceneGuess() {
  const items = getSceneGuessWords(sg.category);
  if (items.length === 0) {
    showToast('该分类暂无词汇');
    return;
  }
  sg.items = shuffleArray(items);
  sg.currentIndex = 0;
  sg.revealed = false;
  renderSceneGuessPage();
  navTo('scene-play');
}

function renderSceneGuessPage() {
  const maxRound = sg.round === 0 ? sg.items.length : sg.round;
  if (sg.currentIndex >= maxRound || sg.currentIndex >= sg.items.length) {
    showSceneGuessEnd();
    return;
  }

  const item = sg.items[sg.currentIndex];
  const numEl = document.getElementById('sg-num');
  const totalEl = document.getElementById('sg-total');
  if (numEl) numEl.textContent = sg.currentIndex + 1;
  if (totalEl) totalEl.textContent = sg.round === 0 ? sg.items.length : Math.min(sg.round, sg.items.length);

  const sceneEl = document.getElementById('sg-scene');
  if (sceneEl) sceneEl.textContent = item.scene;

  const answerArea = document.getElementById('sg-answer-area');
  const revealBtn = document.getElementById('sg-reveal-btn');
  const nextBtn = document.getElementById('sg-next-btn');

  if (answerArea) answerArea.style.display = 'none';
  if (revealBtn) revealBtn.style.display = 'block';
  if (nextBtn) nextBtn.style.display = 'none';
  sg.revealed = false;
}

function revealSceneAnswer() {
  const item = sg.items[sg.currentIndex];
  const answerArea = document.getElementById('sg-answer-area');
  const revealBtn = document.getElementById('sg-reveal-btn');
  const nextBtn = document.getElementById('sg-next-btn');

  if (answerArea) {
    answerArea.style.display = 'block';
    const ansEl = document.getElementById('sg-answer');
    const srcEl = document.getElementById('sg-source');
    if (ansEl) ansEl.textContent = item.answer;
    if (srcEl) srcEl.textContent = '—— ' + item.source;
  }
  if (revealBtn) revealBtn.style.display = 'none';
  if (nextBtn) nextBtn.style.display = 'block';
  sg.revealed = true;
  vibrate(30);
}

function nextScene() {
  sg.currentIndex++;
  renderSceneGuessPage();
}

function showSceneGuessEnd() {
  const endEl = document.getElementById('sg-end-round');
  if (endEl) endEl.textContent = sg.currentIndex;
  navTo('scene-result');
  saveStat('sceneguess', {
    result: '完成',
    players: 1,
    round: sg.currentIndex,
  });
}

function restartSceneGuess() {
  startSceneGuess();
}

function endSceneGuess() {
  navTo('home');
}

// ==================== 看图猜影视 ====================
let eg = {
  category: 'all',
  round: 10,
  currentIndex: 0,
  items: [],
  revealed: false,
};

function startEmojiGuess() {
  const items = getEmojiGuessWords(eg.category);
  if (items.length === 0) {
    showToast('该分类暂无词汇');
    return;
  }
  eg.items = shuffleArray(items);
  eg.currentIndex = 0;
  eg.revealed = false;
  renderEmojiGuessPage();
  navTo('emoji-play');
}

function renderEmojiGuessPage() {
  const maxRound = eg.round === 0 ? eg.items.length : eg.round;
  if (eg.currentIndex >= maxRound || eg.currentIndex >= eg.items.length) {
    showEmojiGuessEnd();
    return;
  }

  const item = eg.items[eg.currentIndex];
  const numEl = document.getElementById('eg-num');
  const totalEl = document.getElementById('eg-total');
  if (numEl) numEl.textContent = eg.currentIndex + 1;
  if (totalEl) totalEl.textContent = eg.round === 0 ? eg.items.length : Math.min(eg.round, eg.items.length);

  const emojiEl = document.getElementById('eg-emoji');
  if (emojiEl) emojiEl.textContent = item.emoji;

  const answerArea = document.getElementById('eg-answer-area');
  const revealBtn = document.getElementById('eg-reveal-btn');
  const nextBtn = document.getElementById('eg-next-btn');

  if (answerArea) answerArea.style.display = 'none';
  if (revealBtn) revealBtn.style.display = 'block';
  if (nextBtn) nextBtn.style.display = 'none';
  eg.revealed = false;
}

function revealEmojiAnswer() {
  const item = eg.items[eg.currentIndex];
  const answerArea = document.getElementById('eg-answer-area');
  const revealBtn = document.getElementById('eg-reveal-btn');
  const nextBtn = document.getElementById('eg-next-btn');

  if (answerArea) {
    answerArea.style.display = 'block';
    const ansEl = document.getElementById('eg-answer');
    if (ansEl) ansEl.textContent = item.answer;
  }
  if (revealBtn) revealBtn.style.display = 'none';
  if (nextBtn) nextBtn.style.display = 'block';
  eg.revealed = true;
  vibrate(30);
}

function nextEmoji() {
  eg.currentIndex++;
  renderEmojiGuessPage();
}

function showEmojiGuessEnd() {
  const endEl = document.getElementById('eg-end-round');
  if (endEl) endEl.textContent = eg.currentIndex;
  navTo('emoji-result');
  saveStat('emojiguess', {
    result: '完成',
    players: 1,
    round: eg.currentIndex,
  });
}

function restartEmojiGuess() {
  startEmojiGuess();
}

function endEmojiGuess() {
  navTo('home');
}
