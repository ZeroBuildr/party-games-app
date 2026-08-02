// 瞎掰王 - 游戏流程逻辑

let bk = {
  playerCount: 5,
  category: 'all',
  players: [],
  phase: 'setup',
  word: null,
  meaning: null,
  speakIndex: 0,
  speakDone: false,
  voteTarget: null,
  voteDone: false,
  winner: null,
  winReason: '',
  log: [],
  dealIndex: 0,
  dealRevealed: false,
  dealDone: false,
};

const bkPhaseNames = {
  speak: '发言阶段',
  vote: '投票阶段',
  result: '结果公布',
  end: '游戏结束',
};

// ==================== 初始化 ====================
function startBluffer() {
  bk.playerCount = 5;
  bk.category = 'all';
  bk.players = [];
  bk.phase = 'setup';
  bk.word = null;
  bk.meaning = null;
  bk.speakIndex = 0;
  bk.speakDone = false;
  bk.voteTarget = null;
  bk.voteDone = false;
  bk.winner = null;
  bk.log = [];
  bk.dealIndex = 0;
  bk.dealRevealed = false;
  bk.dealDone = false;
  bkSyncSetupChips();
  navTo('bk-setup');
}

function bkSyncSetupChips() {
  document.querySelectorAll('#bk-player-count .chip').forEach(c => {
    c.classList.toggle('active', parseInt(c.dataset.val) === bk.playerCount);
  });
  document.querySelectorAll('#bk-category .chip').forEach(c => {
    c.classList.toggle('active', c.dataset.val === bk.category);
  });
}

function bkToggleCategory(val) {
  bk.category = val;
  document.querySelectorAll('#bk-category .chip').forEach(c => {
    c.classList.toggle('active', c.dataset.val === val);
  });
}

function bkConfirmSetup() {
  const roles = bkGenerateRoles(bk.playerCount);
  const wordEntry = getBlufferRandomWord(bk.category);
  bk.word = wordEntry.word;
  bk.meaning = wordEntry.meaning;
  bk.players = roles.map((role, i) => ({
    num: i + 1,
    role,
    spoken: false,
  }));
  bk.dealIndex = 0;
  bk.dealRevealed = false;
  bk.dealDone = false;
  bk.log = [];
  bkAddLog(`词汇：${bk.word}`);
  bkRenderRoles();
  navTo('bk-roles');
}

function bkGenerateRoles(count) {
  const roles = [];
  roles.push('smart');
  roles.push('honest');
  for (let i = 0; i < count - 2; i++) roles.push('bluffer');
  return bkShuffle(roles);
}

function bkShuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ==================== 角色分配（逐个查看）====================
function bkRenderRoles() {
  const dealArea = document.getElementById('bk-deal-area');
  const allList = document.getElementById('bk-roles-list');
  const tip = document.getElementById('bk-roles-tip');
  const btn = document.getElementById('bk-roles-btn');
  if (!dealArea || !allList) return;

  allList.style.display = 'none';
  dealArea.style.display = 'flex';
  if (btn) btn.style.display = 'none';

  const player = bk.players[bk.dealIndex];
  if (!player) return;
  const role = blufferRoles[player.role];

  let cardContent;
  if (bk.dealRevealed) {
    let extraInfo = '';
    if (player.role === 'honest') {
      const briefMeaning = bk.meaning.split('。')[0] + '。';
      extraInfo = `
        <div class="bk-deal-word">词汇：${bk.word}</div>
        <div class="bk-deal-meaning">简要含义：${briefMeaning}</div>`;
    } else if (player.role === 'bluffer') {
      extraInfo = `<div class="bk-deal-word">词汇：${bk.word}</div>
        <div class="bk-deal-hint-bluffer">你需要瞎掰这个词的含义</div>`;
    } else {
      extraInfo = `<div class="bk-deal-hint-smart">你不知道词汇含义，听完所有人发言后投票选出老实人</div>`;
    }
    cardContent = `
      <div class="bk-deal-card revealed" onclick="bkHideDealCard()">
        <div class="bk-deal-num">${player.num} 号</div>
        <div class="bk-deal-icon">${role.icon}</div>
        <div class="bk-deal-name">${role.name}</div>
        <div class="bk-deal-desc">${role.desc}</div>
        ${extraInfo}
        <div class="bk-deal-rehint">再次点击卡片隐藏</div>
      </div>`;
  } else {
    cardContent = `
      <div class="bk-deal-card" onclick="bkRevealDealCard()">
        <div class="bk-deal-num">${player.num} 号</div>
        <div class="bk-deal-cover">?</div>
        <div class="bk-deal-hint">点击查看你的身份</div>
      </div>`;
  }

  const isLast = bk.dealIndex >= bk.players.length - 1;
  dealArea.innerHTML = `
    <div class="bk-deal-progress">玩家 ${player.num} / ${bk.playerCount} 查看身份</div>
    ${cardContent}
    ${bk.dealRevealed ? `
      <button class="btn-primary btn-full bk-deal-next-btn" onclick="bkDealNext()">
        ${isLast ? '全部查看完毕' : '下一位玩家'}
      </button>
    ` : ''}
    ${bk.dealIndex > 0 ? '<button class="btn-outline bk-deal-prev-btn" onclick="bkDealPrev()">上一位</button>' : ''}
  `;
}

function bkRevealDealCard() {
  bk.dealRevealed = true;
  bkRenderRoles();
}

function bkHideDealCard() {
  bk.dealRevealed = false;
  bkRenderRoles();
}

function bkDealNext() {
  if (bk.dealIndex >= bk.players.length - 1) {
    bkStartGame();
  } else {
    bk.dealIndex++;
    bk.dealRevealed = false;
    bkRenderRoles();
  }
}

function bkDealPrev() {
  if (bk.dealIndex > 0) {
    bk.dealIndex--;
    bk.dealRevealed = false;
    bkRenderRoles();
  }
}

// ==================== 开始游戏 ====================
function bkStartGame() {
  bk.phase = 'speak';
  bk.speakIndex = 0;
  bk.speakDone = false;
  bk.voteTarget = null;
  bk.voteDone = false;
  bkAddLog('游戏开始，进入发言阶段');
  navTo('bk-game');
  bkRender();
}

// ==================== 发言阶段 ====================
function bkGetSpeakOrder() {
  return bk.players.filter(p => p.role !== 'smart');
}

function bkNextSpeaker() {
  const order = bkGetSpeakOrder();
  if (bk.speakIndex < order.length - 1) {
    const prevPlayer = order[bk.speakIndex];
    if (prevPlayer) prevPlayer.spoken = true;
    bk.speakIndex++;
    bkRender();
  } else {
    const lastPlayer = order[bk.speakIndex];
    if (lastPlayer) lastPlayer.spoken = true;
    bk.speakDone = true;
    bkAddLog('所有人发言完毕，进入投票');
    bkStartVote();
  }
}

function bkPrevSpeaker() {
  if (bk.speakIndex > 0) {
    const order = bkGetSpeakOrder();
    const currPlayer = order[bk.speakIndex];
    if (currPlayer) currPlayer.spoken = false;
    bk.speakIndex--;
    const prevPlayer = order[bk.speakIndex];
    if (prevPlayer) prevPlayer.spoken = false;
    bkRender();
  } else {
    showToast('已是第一位');
  }
}

// ==================== 投票阶段 ====================
function bkStartVote() {
  bk.phase = 'vote';
  bk.voteTarget = null;
  bkRender();
}

function bkSelectVote(num) {
  bk.voteTarget = num;
  bkRender();
}

function bkConfirmVote() {
  if (bk.voteTarget === null) {
    showToast('请选择一位玩家');
    return;
  }
  bk.phase = 'result';
  bk.voteDone = true;
  const target = bk.players.find(p => p.num === bk.voteTarget);
  if (target && target.role === 'honest') {
    bk.winner = 'good';
    bk.winReason = `大聪明找出了老实人 ${bk.voteTarget} 号！大聪明与老实人获胜！`;
  } else {
    bk.winner = 'bluffer';
    bk.winReason = `${bk.voteTarget} 号是${blufferRoles[target.role].name}，大聪明找错了！瞎掰阵营获胜！`;
  }
  bkAddLog(`大聪明投票：${bk.voteTarget} 号`);
  bkAddLog(`结果：${bk.winReason}`);
  if (typeof saveStat === 'function') {
    saveStat('bluffer', {
      players: bk.playerCount,
      word: bk.word,
      result: bk.winner === 'good' ? '大聪明胜' : '瞎掰胜',
    });
  }
  bkRender();
}

// ==================== 结束 ====================
function bkShowEnd() {
  bkRenderEnd();
  navTo('bk-end');
}

function bkEndGame() {
  navTo('home');
}

function bkRestart() {
  startBluffer();
}

// ==================== 渲染 ====================
function bkRender() {
  const phaseName = bkPhaseNames[bk.phase] || '';
  const phaseEl = document.getElementById('bk-phase-title');
  if (phaseEl) phaseEl.textContent = phaseName;

  const stepNameEl = document.getElementById('bk-step-name');
  if (stepNameEl) stepNameEl.textContent = phaseName;

  const wordEl = document.getElementById('bk-word');
  const meaningEl = document.getElementById('bk-meaning');
  if (wordEl) wordEl.textContent = bk.word;
  if (meaningEl) {
    if (bk.phase === 'result') {
      meaningEl.style.display = 'block';
      meaningEl.textContent = bk.meaning;
    } else {
      meaningEl.style.display = 'none';
    }
  }

  const guide = bkGetGuide();
  const guideIconEl = document.getElementById('bk-guide-icon');
  const guideTitleEl = document.getElementById('bk-guide-title');
  const guideTextEl = document.getElementById('bk-guide-text');
  if (guideIconEl) guideIconEl.textContent = guide.icon;
  if (guideTitleEl) guideTitleEl.textContent = guide.title;
  if (guideTextEl) guideTextEl.innerHTML = guide.text.replace(/\n/g, '<br>');

  const actionArea = document.getElementById('bk-action-area');
  if (actionArea) actionArea.innerHTML = bkRenderActionArea();

  bkRenderPlayerPanel();
  bkRenderButtons();

  if (bk.phase === 'result') {
    const resultEl = document.getElementById('bk-result-area');
    if (resultEl) {
      const target = bk.players.find(p => p.num === bk.voteTarget);
      resultEl.innerHTML = `
        <div class="bk-result-card ${bk.winner}">
          <div class="bk-result-icon">${bk.winner === 'good' ? '🎯' : '🎭'}</div>
          <div class="bk-result-text">${bk.winReason}</div>
        </div>
        <div class="bk-result-vote">大聪明投了 ${bk.voteTarget} 号（${target ? blufferRoles[target.role].name : ''}）</div>
        <div class="bk-result-reveal">
          ${bk.players.map(p => {
            const role = blufferRoles[p.role];
            const isTarget = p.num === bk.voteTarget;
            const isHonest = p.role === 'honest';
            return `<div class="bk-reveal-item ${isTarget ? 'voted' : ''} ${isHonest ? 'honest' : ''}">
              <span class="bk-reveal-num">${p.num}号</span>
              <span class="bk-reveal-role">${role.icon} ${role.name}</span>
              ${isTarget ? '<span class="bk-reveal-tag">被投</span>' : ''}
              ${isHonest ? '<span class="bk-reveal-tag honest">老实人</span>' : ''}
            </div>`;
          }).join('')}
        </div>`;
    }
  }
}

function bkGetGuide() {
  if (bk.phase === 'speak') {
    const order = bkGetSpeakOrder();
    const current = order[bk.speakIndex];
    if (!current) return { icon: '🎤', title: '发言阶段', text: '' };
    return {
      icon: '🎤',
      title: `${current.num} 号发言`,
      text: `请 ${current.num} 号玩家解释"${bk.word}"的含义。\n每人轮流发言，大聪明注意听。`,
    };
  }
  if (bk.phase === 'vote') {
    const smart = bk.players.find(p => p.role === 'smart');
    return {
      icon: '🗳️',
      title: '大聪明投票',
      text: `所有非大聪明玩家已发言完毕。\n大聪明请选出你认为的老实人。\n找对则大聪明与老实人获胜，找错则瞎掰阵营获胜。`,
    };
  }
  if (bk.phase === 'result') {
    return {
      icon: bk.winner === 'good' ? '🎯' : '🎭',
      title: '游戏结束',
      text: bk.winReason,
    };
  }
  return { icon: '🎮', title: '', text: '' };
}

function bkRenderActionArea() {
  if (bk.phase === 'speak') {
    const order = bkGetSpeakOrder();
    let html = '<div class="bk-speak-list">';
    order.forEach((p, i) => {
      const isCurrent = i === bk.speakIndex;
      const isDone = p.spoken;
      html += `<div class="bk-speak-item ${isCurrent ? 'current' : ''} ${isDone ? 'done' : ''}">
        <span class="bk-speak-num">${p.num}号</span>
        <span class="bk-speak-status">${isCurrent ? '🗣️ 发言中' : isDone ? '✓ 已发言' : '⏳ 待发言'}</span>
      </div>`;
    });
    html += '</div>';
    return html;
  }
  if (bk.phase === 'vote') {
    let html = '<div class="bk-select-label">大聪明选择老实人</div>';
    html += '<div class="bk-player-grid">';
    const voteTargets = bk.players.filter(p => p.role !== 'smart');
    voteTargets.forEach(p => {
      const selected = bk.voteTarget === p.num;
      html += `<div class="bk-player-cell ${selected ? 'selected' : ''}" onclick="bkSelectVote(${p.num})">
        <span class="bk-cell-num">${p.num}</span>
      </div>`;
    });
    html += '</div>';
    if (bk.voteTarget !== null) {
      html += `<div class="bk-selected-info">已选择 ${bk.voteTarget} 号</div>`;
    }
    return html;
  }
  if (bk.phase === 'result') {
    return '<div id="bk-result-area"></div>';
  }
  return '';
}

function bkRenderPlayerPanel() {
  const container = document.getElementById('bk-player-panel');
  if (!container) return;
  const collapsed = container.classList.contains('collapsed');

  if (bk.phase === 'result') {
    let html = `<div class="bk-panel-title" onclick="bkTogglePanel()">
      <span>全员身份</span>
      <span class="bk-panel-toggle">${collapsed ? '展开 ▼' : '收起 ▲'}</span>
    </div>`;
    html += '<div class="bk-panel-body">';
    html += '<div class="bk-panel-grid">';
    bk.players.forEach(p => {
      const role = blufferRoles[p.role];
      const teamClass = p.role === 'bluffer' ? 'bluffer' : 'good';
      html += `<div class="bk-panel-cell ${teamClass}">
        <span class="bk-panel-num">${p.num}</span>
        <span class="bk-panel-icon">${role.icon}</span>
        <span class="bk-panel-role">${role.name}</span>
      </div>`;
    });
    html += '</div>';
    html += '</div>';
    container.innerHTML = html;
    return;
  }

  let html = `<div class="bk-panel-title" onclick="bkTogglePanel()">
    <span>玩家状态</span>
    <span class="bk-panel-toggle">${collapsed ? '展开 ▼' : '收起 ▲'}</span>
  </div>`;
  html += '<div class="bk-panel-body">';
  html += '<div class="bk-panel-grid">';
  const speakOrder = bkGetSpeakOrder();
  bk.players.forEach(p => {
    const isSmart = p.role === 'smart';
    const inSpeakOrder = speakOrder.includes(p);
    const hasSpoken = p.spoken;
    const isCurrentSpeaker = bk.phase === 'speak' && inSpeakOrder && speakOrder[bk.speakIndex] === p;
    let statusIcon = '⏳';
    if (isSmart) statusIcon = '👂';
    else if (hasSpoken) statusIcon = '✓';
    else if (isCurrentSpeaker) statusIcon = '🗣️';
    html += `<div class="bk-panel-cell neutral">
      <span class="bk-panel-num">${p.num}</span>
      <span class="bk-panel-icon">${statusIcon}</span>
      <span class="bk-panel-role">${isSmart ? '听众' : hasSpoken ? '已发言' : isCurrentSpeaker ? '发言中' : '待发言'}</span>
    </div>`;
  });
  html += '</div>';
  html += '</div>';
  container.innerHTML = html;
}

function bkTogglePanel() {
  const container = document.getElementById('bk-player-panel');
  if (container) {
    container.classList.toggle('collapsed');
    bkRenderPlayerPanel();
  }
}

function bkRenderButtons() {
  const undoBtn = document.getElementById('bk-undo-btn');
  const nextBtn = document.getElementById('bk-next-btn');
  if (!undoBtn || !nextBtn) return;

  let nextText = '下一步';
  let showNext = true;
  let showUndo = false;

  if (bk.phase === 'speak') {
    showUndo = bk.speakIndex > 0;
    const order = bkGetSpeakOrder();
    nextText = bk.speakIndex >= order.length - 1 ? '进入投票' : '下一位发言';
  } else if (bk.phase === 'vote') {
    nextText = '确认投票';
    if (bk.voteTarget === null) {
      nextBtn.style.opacity = '0.5';
      nextBtn.style.pointerEvents = 'none';
    } else {
      nextBtn.style.opacity = '1';
      nextBtn.style.pointerEvents = 'auto';
    }
  } else if (bk.phase === 'result') {
    nextText = '查看详情';
  }

  undoBtn.style.display = showUndo ? 'block' : 'none';
  nextBtn.style.display = showNext ? 'block' : 'none';
  nextBtn.textContent = nextText;
}

function bkNext() {
  if (bk.phase === 'speak') {
    bkNextSpeaker();
  } else if (bk.phase === 'vote') {
    bkConfirmVote();
  } else if (bk.phase === 'result') {
    bkShowEnd();
  }
}

function bkUndo() {
  if (bk.phase === 'speak') {
    bkPrevSpeaker();
  } else if (bk.phase === 'vote') {
    bk.voteTarget = null;
    bkRender();
  }
}

function bkRenderEnd() {
  const winnerEl = document.getElementById('bk-end-winner');
  const reasonEl = document.getElementById('bk-end-reason');
  const wordEl = document.getElementById('bk-end-word');
  const rolesEl = document.getElementById('bk-end-roles');
  const logEl = document.getElementById('bk-end-log');

  if (winnerEl) {
    winnerEl.textContent = bk.winner === 'good' ? '大聪明获胜' : '瞎掰获胜';
    winnerEl.className = 'bk-end-winner ' + bk.winner;
  }
  if (reasonEl) reasonEl.textContent = bk.winReason;
  if (wordEl) wordEl.innerHTML = `词汇：<strong>${bk.word}</strong><br>真实含义：${bk.meaning}`;
  if (rolesEl) {
    rolesEl.innerHTML = bk.players.map(p => {
      const role = blufferRoles[p.role];
      return `<div class="bk-end-role">
        <span>${p.num}号</span>
        <span>${role.icon} ${role.name}</span>
      </div>`;
    }).join('');
  }
  if (logEl) {
    logEl.innerHTML = bk.log.map(l => `<div class="bk-log-item">${l}</div>`).join('');
  }
}

function bkAddLog(text) {
  bk.log.push(text);
}

function bkShowRules() {
  let html = '';
  for (const [key, role] of Object.entries(blufferRoles)) {
    html += `<div class="bk-rule-item"><strong>${role.icon} ${role.name}：</strong>${role.desc}</div>`;
  }
  const rulesContent = document.getElementById('bk-rules-content');
  if (rulesContent) {
    rulesContent.innerHTML = html;
    document.getElementById('bk-rules-modal').style.display = 'flex';
  }
}

function bkCloseRules() {
  const modal = document.getElementById('bk-rules-modal');
  if (modal) modal.style.display = 'none';
}
