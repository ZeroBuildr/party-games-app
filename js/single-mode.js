// 单机模式游戏逻辑

let uc = {
  playerCount: 4,
  category: 'all',
  wordPair: [],
  civilianWord: '',
  undercoverWord: '',
  undercoverPlayers: [],
  currentPlayer: 0,
  viewedPlayers: [],
  players: [],
  alivePlayers: [],
  round: 1,
  currentSpeaker: 0,
  describeTimer: null,
  describeTimeLeft: 30,
  selectedVote: null,
};

let bomb = {
  minNum: 1,
  maxNum: 100,
  bombNum: 0,
  currentMin: 1,
  currentMax: 100,
  playerCount: 4,
  currentPlayer: 0,
  guessCount: 0,
  history: [],
};

let wg = {
  mode: 'gesture',
  category: 'all',
  duration: 60,
  timeLeft: 60,
  timer: null,
  words: [],
  currentWordIndex: 0,
  correct: 0,
  skip: 0,
  usedWords: [],
};

function startSingleGame(game) {
  if (game === 'undercover') {
    initSingleUC();
    navTo('undercover-setup');
  } else if (game === 'bomb') {
    initSingleBomb();
    navTo('bomb-setup');
  } else if (game === 'wordguess') {
    initSingleWG();
    navTo('wordguess-setup');
  }
}

function initSingleUC() {
  updateUCRuleText();
}

function updateUCRuleText() {
  const count = uc.playerCount;
  let undercoverCount;
  if (count <= 5) undercoverCount = 1;
  else if (count <= 8) undercoverCount = 2;
  else undercoverCount = 3;
  
  const civilianCount = count - undercoverCount;
  const el = document.getElementById('uc-rule-text');
  if (el) {
    el.textContent = 
      `${count}人中${undercoverCount}人为卧底，${civilianCount}人为平民。每人轮流描述词语一轮后投票。`;
  }
}

function getUndercoverCount(playerCount) {
  if (playerCount <= 5) return 1;
  if (playerCount <= 8) return 2;
  return 3;
}

function startSingleUndercover() {
  const pairs = getUndercoverPairs(uc.category);
  if (pairs.length < 5) {
    showToast('该分类词库较少，建议选择综合分类');
    return;
  }
  
  const shuffledPairs = shuffleArray(pairs);
  uc.wordPair = shuffledPairs[0];
  
  if (Math.random() > 0.5) {
    uc.civilianWord = uc.wordPair[0];
    uc.undercoverWord = uc.wordPair[1];
  } else {
    uc.civilianWord = uc.wordPair[1];
    uc.undercoverWord = uc.wordPair[0];
  }
  
  const playerNums = Array.from({ length: uc.playerCount }, (_, i) => i);
  const shuffled = shuffleArray(playerNums);
  const undercoverCount = getUndercoverCount(uc.playerCount);
  uc.undercoverPlayers = shuffled.slice(0, undercoverCount);
  
  uc.currentPlayer = 0;
  uc.viewedPlayers = [];
  uc.players = Array.from({ length: uc.playerCount }, (_, i) => ({
    id: i,
    name: `玩家 ${i + 1}`,
    alive: true,
  }));
  uc.alivePlayers = uc.players.filter(p => p.alive);
  
  updateUCDealPage();
  navTo('undercover-deal');
}

function updateUCDealPage() {
  document.getElementById('uc-current-player').textContent = uc.currentPlayer + 1;
  document.getElementById('uc-total-players').textContent = uc.playerCount;
  document.getElementById('uc-viewed-count').textContent = uc.viewedPlayers.length;
  document.getElementById('uc-total-count').textContent = uc.playerCount;
  
  const dotsContainer = document.getElementById('uc-dots');
  dotsContainer.innerHTML = '';
  for (let i = 0; i < uc.playerCount; i++) {
    const dot = document.createElement('span');
    dot.className = 'dot' + (i < uc.viewedPlayers.length ? ' active' : '');
    dotsContainer.appendChild(dot);
  }
  
  resetWordCard();
}

function resetWordCard() {
  const roleTag = document.getElementById('uc-role-tag');
  const wordDisplay = document.getElementById('uc-word-display');
  const wordHint = document.getElementById('uc-word-hint');
  const nextBtn = document.getElementById('uc-next-btn');
  
  if (roleTag) roleTag.textContent = '点击查看你的词语';
  if (wordDisplay) wordDisplay.textContent = '？？？';
  if (wordHint) wordHint.textContent = '请确保周围没有其他人偷看';
  if (nextBtn) {
    nextBtn.style.opacity = '0.5';
    nextBtn.style.pointerEvents = 'none';
  }
}

function revealWord() {
  const roleTag = document.getElementById('uc-role-tag');
  const wordDisplay = document.getElementById('uc-word-display');
  const wordHint = document.getElementById('uc-word-hint');
  const nextBtn = document.getElementById('uc-next-btn');
  
  vibrate(30);
  
  const isUndercover = uc.undercoverPlayers.includes(uc.currentPlayer);
  if (roleTag) {
    roleTag.textContent = isUndercover ? '你的身份：卧底' : '你的身份：平民';
  }
  if (wordDisplay) {
    wordDisplay.textContent = isUndercover ? uc.undercoverWord : uc.civilianWord;
  }
  if (wordHint) {
    wordHint.textContent = '请记住你的词语，不要让其他人看到';
  }
  if (nextBtn) {
    nextBtn.style.opacity = '1';
    nextBtn.style.pointerEvents = 'auto';
  }
}

function nextPlayer() {
  if (!uc.viewedPlayers.includes(uc.currentPlayer)) {
    uc.viewedPlayers.push(uc.currentPlayer);
  }
  
  vibrate(30);
  
  if (uc.currentPlayer < uc.playerCount - 1) {
    uc.currentPlayer++;
    updateUCDealPage();
  } else {
    startDescribePhase();
  }
}

function confirmExitUC() {
  showModal('确认退出', '确定要退出吗？当前游戏进度将丢失。', () => {
    if (uc.describeTimer) clearInterval(uc.describeTimer);
    navTo('undercover-setup');
  });
}

function startDescribePhase() {
  uc.round = 1;
  uc.alivePlayers = uc.players.filter(p => p.alive);
  uc.currentSpeaker = 0;
  
  updateDescribePage();
  navTo('undercover-describe');
  startDescribeTimer();
}

function updateDescribePage() {
  document.getElementById('uc-round-num').textContent = uc.round;
  document.getElementById('uc-alive-count').textContent = uc.alivePlayers.length;
  
  const alivePlayer = uc.alivePlayers[uc.currentSpeaker];
  document.getElementById('uc-speaker-num').textContent = alivePlayer.id + 1;
}

function startDescribeTimer() {
  if (uc.describeTimer) {
    clearInterval(uc.describeTimer);
  }
  
  uc.describeTimeLeft = app.settings.describeTime;
  updateDescribeTimerDisplay();
  
  uc.describeTimer = setInterval(() => {
    uc.describeTimeLeft--;
    updateDescribeTimerDisplay();
    
    if (uc.describeTimeLeft <= 0) {
      clearInterval(uc.describeTimer);
      vibrate(100);
      nextSpeaker();
    }
  }, 1000);
}

function updateDescribeTimerDisplay() {
  const timerEl = document.getElementById('uc-describe-timer');
  if (!timerEl) return;
  timerEl.textContent = uc.describeTimeLeft + 's';
  
  if (uc.describeTimeLeft <= 5) {
    timerEl.classList.add('warning');
  } else {
    timerEl.classList.remove('warning');
  }
}

function nextSpeaker() {
  if (uc.describeTimer) {
    clearInterval(uc.describeTimer);
  }
  
  vibrate(30);
  
  if (uc.currentSpeaker < uc.alivePlayers.length - 1) {
    uc.currentSpeaker++;
    updateDescribePage();
    startDescribeTimer();
  }
}

function prevSpeaker() {
  if (uc.describeTimer) {
    clearInterval(uc.describeTimer);
  }
  
  if (uc.currentSpeaker > 0) {
    uc.currentSpeaker--;
    updateDescribePage();
    startDescribeTimer();
  }
}

function goToVote() {
  if (uc.describeTimer) {
    clearInterval(uc.describeTimer);
  }
  
  uc.selectedVote = null;
  renderVoteList();
  navTo('undercover-vote');
}

function renderVoteList() {
  const list = document.getElementById('uc-vote-list');
  if (!list) return;
  list.innerHTML = '';
  
  uc.alivePlayers.forEach((player, index) => {
    const item = document.createElement('div');
    item.className = 'player-item' + (uc.selectedVote === player.id ? ' selected' : '');
    item.innerHTML = `
      <div class="player-avatar">${player.id + 1}</div>
      <span class="player-name">${player.name}</span>
      <span class="player-status">${uc.selectedVote === player.id ? '已选' : '选择'}</span>
    `;
    item.addEventListener('click', () => {
      uc.selectedVote = player.id;
      renderVoteList();
      const btn = document.getElementById('uc-submit-vote');
      if (btn) {
        btn.style.opacity = '1';
        btn.style.pointerEvents = 'auto';
      }
    });
    list.appendChild(item);
  });
}

function submitVote() {
  if (uc.selectedVote === null) return;
  
  vibrate(50);
  
  const eliminatedPlayer = uc.players.find(p => p.id === uc.selectedVote);
  eliminatedPlayer.alive = false;
  
  const isUndercover = uc.undercoverPlayers.includes(uc.selectedVote);
  showUCResult(eliminatedPlayer, isUndercover);
}

function showUCResult(eliminatedPlayer, isUndercover) {
  document.getElementById('uc-eliminated').textContent = eliminatedPlayer.name;
  document.getElementById('uc-identity').textContent = isUndercover ? '卧底' : '平民';
  document.getElementById('uc-civilian-word').textContent = uc.civilianWord;
  document.getElementById('uc-undercover-word').textContent = uc.undercoverWord;
  
  const aliveUndercover = uc.undercoverPlayers.filter(id => {
    const p = uc.players.find(pl => pl.id === id);
    return p && p.alive;
  });
  
  const aliveCivilians = uc.players.filter(p => p.alive && !uc.undercoverPlayers.includes(p.id));
  
  let civilianWin = false;
  let title = '';
  let desc = '';
  let icon = '';
  
  if (isUndercover) {
    if (aliveUndercover.length === 0) {
      civilianWin = true;
      title = '平民胜利！';
      desc = '所有卧底都被找出了';
      icon = '🎉';
      saveStat('undercover', {
        result: '平民胜利',
        players: uc.playerCount,
        round: uc.round,
      });
    } else {
      title = isUndercover ? '卧底被投出' : '平民被投出';
      desc = '还有卧底在潜伏，继续游戏';
      icon = '😏';
    }
  } else {
    if (aliveCivilians.length <= aliveUndercover.length) {
      civilianWin = false;
      title = '卧底胜利！';
      desc = '卧底成功隐藏到了最后';
      icon = '😎';
      saveStat('undercover', {
        result: '卧底胜利',
        players: uc.playerCount,
        round: uc.round,
      });
    } else {
      title = '平民被投出';
      desc = '还有卧底在潜伏，继续游戏';
      icon = '😱';
    }
  }
  
  document.getElementById('uc-result-title').textContent = title;
  document.getElementById('uc-result-desc').textContent = desc;
  document.getElementById('uc-result-icon').textContent = icon;
  
  navTo('undercover-result');
}

function restartUndercover() {
  startSingleUndercover();
}

// ==================== 数字炸弹 - 单机 ====================
function initSingleBomb() {
}

function startSingleBomb() {
  const rangeType = document.querySelector('#bomb-range .chip.active').dataset.val;
  
  if (rangeType === 'custom') {
    const min = parseInt(document.getElementById('bomb-min').value);
    const max = parseInt(document.getElementById('bomb-max').value);
    if (isNaN(min) || isNaN(max) || min >= max || max - min < 10) {
      showToast('请输入有效的数字范围（差值需≥10）');
      return;
    }
    bomb.minNum = min;
    bomb.maxNum = max;
  }
  
  bomb.currentMin = bomb.minNum;
  bomb.currentMax = bomb.maxNum;
  bomb.bombNum = Math.floor(Math.random() * (bomb.currentMax - bomb.currentMin - 1)) + bomb.currentMin + 1;
  bomb.currentPlayer = 0;
  bomb.guessCount = 0;
  bomb.history = [];
  
  updateBombPlayPage();
  navTo('bomb-play');
  
  setTimeout(() => {
    const input = document.getElementById('bomb-input');
    if (input) input.focus();
  }, 300);
}

function updateBombPlayPage() {
  document.getElementById('bomb-current-player').textContent = `玩家 ${bomb.currentPlayer + 1}`;
  document.getElementById('bomb-range-display').textContent = `${bomb.currentMin} ~ ${bomb.currentMax}`;
  const input = document.getElementById('bomb-input');
  if (input) {
    input.value = '';
    input.placeholder = `输入 ${bomb.currentMin}-${bomb.currentMax} 之间的数字`;
  }
  
  renderBombHistory();
}

function renderBombHistory() {
  const list = document.getElementById('bomb-history-list');
  if (!list) return;
  list.innerHTML = '';
  
  bomb.history.slice().reverse().forEach(item => {
    const div = document.createElement('div');
    div.className = 'history-item';
    div.innerHTML = `<span class="dot-accent"></span>玩家${item.player}猜了 ${item.num} → 范围 ${item.newMin}~${item.newMax}`;
    list.appendChild(div);
  });
}

function guessBomb() {
  const input = document.getElementById('bomb-input');
  const num = parseInt(input.value);
  
  if (isNaN(num) || num < bomb.currentMin || num > bomb.currentMax) {
    showToast(`请输入 ${bomb.currentMin} ~ ${bomb.currentMax} 之间的数字`);
    vibrate(100);
    input.classList.add('shake');
    setTimeout(() => input.classList.remove('shake'), 500);
    return;
  }
  
  bomb.guessCount++;
  vibrate(30);
  
  if (num === bomb.bombNum) {
    showBombExplode();
    return;
  }
  
  let newMin = bomb.currentMin;
  let newMax = bomb.currentMax;
  
  if (num < bomb.bombNum) {
    newMin = num + 1;
  } else {
    newMax = num - 1;
  }
  
  bomb.history.push({
    player: bomb.currentPlayer + 1,
    num: num,
    newMin: newMin,
    newMax: newMax,
  });
  
  bomb.currentMin = newMin;
  bomb.currentMax = newMax;
  bomb.currentPlayer = (bomb.currentPlayer + 1) % bomb.playerCount;
  
  updateBombPlayPage();
  
  setTimeout(() => {
    input.focus();
  }, 100);
}

function showBombExplode() {
  vibrate([100, 50, 100, 50, 200]);
  
  document.getElementById('bomb-loser').textContent = `玩家 ${bomb.currentPlayer + 1}`;
  document.getElementById('bomb-answer').textContent = bomb.bombNum;
  document.getElementById('bomb-guess-count').textContent = bomb.guessCount;
  
  saveStat('bomb', {
    result: `玩家${bomb.currentPlayer + 1}被炸`,
    players: bomb.playerCount,
    guessCount: bomb.guessCount,
    bombNum: bomb.bombNum,
  });
  
  navTo('bomb-explode');
}

function confirmExitBomb() {
  showModal('确认退出', '确定要退出吗？当前游戏进度将丢失。', () => {
    navTo('bomb-setup');
  });
}

function restartBomb() {
  startSingleBomb();
}

// ==================== 猜词助手 - 单机 ====================
function initSingleWG() {
}

function startSingleWordGuess() {
  const allWords = getWordGuessWords(wg.category);
  wg.words = shuffleArray(allWords);
  wg.currentWordIndex = 0;
  wg.correct = 0;
  wg.skip = 0;
  wg.usedWords = [];
  wg.timeLeft = wg.duration;
  
  updateWGPlayPage();
  navTo('wordguess-play');
  startWGTimer();
}

function updateWGPlayPage() {
  document.getElementById('wg-word-num').textContent = wg.currentWordIndex + 1;
  document.getElementById('wg-current-word').textContent = wg.words[wg.currentWordIndex];
  
  const categoryNames = {
    all: '综合',
    food: '食物',
    star: '明星',
    daily: '日常',
    idiom: '成语',
    animal: '动物',
    movie: '影视',
  };
  const catLabel = document.getElementById('wg-category-label');
  if (catLabel) catLabel.textContent = categoryNames[wg.category] || '综合';
  
  const modeTips = {
    verbal: '用语言描述，不能说出词语本身',
    gesture: '用肢体动作比划，不能说话',
    draw: '在纸上画出词语让队友猜',
  };
  const modeTip = document.getElementById('wg-mode-tip');
  if (modeTip) modeTip.textContent = modeTips[wg.mode] || '';
  
  document.getElementById('wg-correct').textContent = wg.correct;
  document.getElementById('wg-skip').textContent = wg.skip;
  
  updateWGTimerDisplay();
}

function startWGTimer() {
  if (wg.timer) {
    clearInterval(wg.timer);
  }
  
  wg.timer = setInterval(() => {
    wg.timeLeft--;
    updateWGTimerDisplay();
    
    if (wg.timeLeft <= 0) {
      clearInterval(wg.timer);
      vibrate([100, 50, 100]);
      showWGResult();
    }
  }, 1000);
}

function updateWGTimerDisplay() {
  const timerEl = document.getElementById('wg-timer');
  if (!timerEl) return;
  const minutes = Math.floor(wg.timeLeft / 60);
  const seconds = wg.timeLeft % 60;
  timerEl.textContent = `⏱ ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  if (wg.timeLeft <= 10) {
    timerEl.classList.add('warning');
  } else {
    timerEl.classList.remove('warning');
  }
}

function correctWord() {
  wg.correct++;
  vibrate(30);
  nextWGWord();
}

function skipWord() {
  wg.skip++;
  vibrate(20);
  nextWGWord();
}

function nextWGWord() {
  wg.usedWords.push(wg.words[wg.currentWordIndex]);
  wg.currentWordIndex++;
  
  if (wg.currentWordIndex >= wg.words.length) {
    if (wg.timer) {
      clearInterval(wg.timer);
    }
    showWGResult();
    showToast('词库已全部出完！');
    return;
  }
  
  updateWGPlayPage();
}

function showWGResult() {
  if (wg.timer) {
    clearInterval(wg.timer);
  }
  
  document.getElementById('wg-final-score').textContent = wg.correct;
  document.getElementById('wg-final-correct').textContent = wg.correct;
  document.getElementById('wg-final-skip').textContent = wg.skip;
  document.getElementById('wg-final-total').textContent = wg.correct + wg.skip;
  
  saveStat('wordguess', {
    result: `猜中${wg.correct}个`,
    mode: wg.mode,
    correct: wg.correct,
    skip: wg.skip,
    duration: wg.duration,
  });
  
  navTo('wordguess-result');
}

function nextGroupWG() {
  startSingleWordGuess();
}
