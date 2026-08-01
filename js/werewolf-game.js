// 狼人杀法官端 - 游戏流程逻辑

let ww = {
  playerCount: 12,
  boardType: 'basic',
  options: { sheriff: true, selfSaveFirstNight: false, lastWords: true, selfKill: true },
  players: [],
  phase: 'setup',
  round: 0,
  nightSteps: [],
  nightStepIndex: 0,
  nightActions: {},
  witchPotions: { save: 1, poison: 1 },
  guardLastProtected: null,
  nightDeaths: [],
  sheriff: null,
  sheriffCandidates: [],
  sheriffVotes: {},
  sheriffDone: false,
  exileVotes: {},
  voteStack: [],
  pkPlayers: [],
  pendingSkill: null,
  log: [],
  winner: null,
  winReason: '',
  selectedPlayer: null,
  dealIndex: 0,
  dealRevealed: false,
  dealDone: false,
};

const wwPhaseNames = {
  deal: '发牌阶段',
  night: '黑夜阶段',
  dawn: '天亮公布',
  campaign: '警长竞选',
  discuss: '白天发言',
  vote: '放逐投票',
  voteResult: '投票结果',
  end: '游戏结束',
};

// ==================== 初始化 ====================
function startWerewolf() {
  ww.playerCount = 12;
  ww.boardType = 'basic';
  ww.options = { sheriff: true, selfSaveFirstNight: false, lastWords: true, selfKill: true };
  ww.players = [];
  ww.phase = 'setup';
  ww.round = 0;
  ww.log = [];
  ww.winner = null;
  ww.dealIndex = 0;
  ww.dealRevealed = false;
  ww.dealDone = false;
  wwRenderSetupBoards();
  navTo('werewolf-setup');
}

function wwRenderSetupBoards() {
  const container = document.getElementById('ww-board-list');
  if (!container) return;
  const boards = getAvailableBoards(ww.playerCount);
  const defaultBoard = getDefaultBoard(ww.playerCount);
  if (!boards.find(b => b.key === ww.boardType)) {
    ww.boardType = defaultBoard;
  }
  container.innerHTML = boards.map(b => `
    <div class="ww-board-card ${b.key === ww.boardType ? 'active' : ''}" onclick="wwSelectBoard('${b.key}')">
      <div class="ww-board-name">${b.name}</div>
      <div class="ww-board-desc">${b.desc}</div>
      <div class="ww-board-roles">${wwGetConfigText(b.key, ww.playerCount)}</div>
    </div>
  `).join('');
}

function wwGetConfigText(boardKey, count) {
  const cfg = getBoardConfig(boardKey, count);
  if (!cfg) return '';
  const parts = [];
  if (cfg.wolf) parts.push(cfg.wolf + '狼');
  if (cfg.seer) parts.push('预言家');
  if (cfg.witch) parts.push('女巫');
  if (cfg.hunter) parts.push('猎人');
  if (cfg.guard) parts.push('守卫');
  if (cfg.idiot) parts.push('白痴');
  if (cfg.civilian) parts.push(cfg.civilian + '民');
  return parts.join('·');
}

function wwSelectBoard(key) {
  ww.boardType = key;
  wwRenderSetupBoards();
}

function wwToggleOption(key) {
  ww.options[key] = !ww.options[key];
}

function wwConfirmSetup() {
  const config = getBoardConfig(ww.boardType, ww.playerCount);
  if (!config) {
    showToast('该人数无可用配置');
    return;
  }
  const roles = wwShuffle(generateRoleList(config));
  ww.players = roles.map((role, i) => ({
    num: i + 1,
    role,
    alive: true,
    isSheriff: false,
    hasVoteRight: true,
    revealed: false,
  }));
  ww.round = 0;
  ww.phase = 'setup';
  ww.log = [];
  ww.witchPotions = { save: 1, poison: 1 };
  ww.guardLastProtected = null;
  ww.sheriff = null;
  ww.sheriffDone = false;
  ww.winner = null;
  ww.nightActions = {};
  ww.exileVotes = {};
  ww.sheriffVotes = {};
  ww.sheriffCandidates = [];
  ww.voteStack = [];
  ww.pkPlayers = [];
  ww.pendingSkill = null;
  ww.dealIndex = 0;
  ww.dealRevealed = false;
  ww.dealDone = false;
  wwRenderRoles();
  navTo('werewolf-roles');
}

function wwRenderRoles() {
  const config = getBoardConfig(ww.boardType, ww.playerCount);
  const summary = document.getElementById('ww-roles-summary');
  if (summary && config) {
    summary.innerHTML = `<span>${wwGetConfigText(ww.boardType, ww.playerCount)}</span>`;
  }

  const dealArea = document.getElementById('ww-deal-area');
  const allList = document.getElementById('ww-roles-list');
  const tip = document.getElementById('ww-roles-tip');
  const btn = document.getElementById('ww-roles-btn');
  if (!dealArea || !allList) return;

  if (ww.dealDone) {
    dealArea.style.display = 'none';
    allList.style.display = 'flex';
    if (tip) tip.innerHTML = '<strong>注意：</strong>所有玩家已查看身份。以下为全员身份，仅法官可见。';
    if (btn) {
      btn.textContent = '确认发牌，开始游戏';
      btn.style.display = 'block';
    }
    allList.innerHTML = ww.players.map(p => {
      const role = werewolfRoles[p.role];
      const teamClass = role.team === 'wolf' ? 'wolf' : 'good';
      return `
        <div class="ww-role-card ${teamClass}">
          <div class="ww-role-num">${p.num}</div>
          <div class="ww-role-icon">${role.icon}</div>
          <div class="ww-role-info">
            <div class="ww-role-name">${role.name}</div>
            <div class="ww-role-team">${role.team === 'wolf' ? '狼人阵营' : '好人阵营'}</div>
          </div>
        </div>
      `;
    }).join('');
    return;
  }

  allList.style.display = 'none';
  dealArea.style.display = 'flex';
  if (btn) btn.style.display = 'none';

  const player = ww.players[ww.dealIndex];
  if (!player) return;
  const role = werewolfRoles[player.role];
  const teamClass = role.team === 'wolf' ? 'wolf' : 'good';

  let cardHtml;
  if (ww.dealRevealed) {
    cardHtml = `
      <div class="ww-deal-card revealed ${teamClass}" onclick="wwHideDealCard()">
        <div class="ww-deal-num">${player.num} 号</div>
        <div class="ww-deal-icon">${role.icon}</div>
        <div class="ww-deal-name">${role.name}</div>
        <div class="ww-deal-team">${role.team === 'wolf' ? '狼人阵营' : '好人阵营'}</div>
        <div class="ww-deal-hint">再次点击卡片隐藏</div>
      </div>`;
  } else {
    cardHtml = `
      <div class="ww-deal-card" onclick="wwRevealDealCard()">
        <div class="ww-deal-num">${player.num} 号</div>
        <div class="ww-deal-cover">?</div>
        <div class="ww-deal-hint">点击查看你的身份</div>
      </div>`;
  }

  const isLast = ww.dealIndex >= ww.players.length - 1;
  dealArea.innerHTML = `
    <div class="ww-deal-progress">玩家 ${player.num} / ${ww.playerCount} 查看身份</div>
    ${cardHtml}
    ${ww.dealRevealed ? `
      <button class="btn-primary btn-full ww-deal-next-btn" onclick="wwDealNext()">
        ${isLast ? '全部查看完毕' : '下一位玩家'}
      </button>
    ` : ''}
    ${ww.dealIndex > 0 ? '<button class="btn-outline ww-deal-prev-btn" onclick="wwDealPrev()">上一位</button>' : ''}
  `;
}

function wwRevealDealCard() {
  ww.dealRevealed = true;
  wwRenderRoles();
}

function wwHideDealCard() {
  ww.dealRevealed = false;
  wwRenderRoles();
}

function wwDealNext() {
  if (ww.dealIndex >= ww.players.length - 1) {
    ww.dealDone = true;
    wwRenderRoles();
  } else {
    ww.dealIndex++;
    ww.dealRevealed = false;
    wwRenderRoles();
  }
}

function wwDealPrev() {
  if (ww.dealIndex > 0) {
    ww.dealIndex--;
    ww.dealRevealed = false;
    wwRenderRoles();
  }
}

function wwStartGame() {
  ww.phase = 'deal';
  ww.round = 1;
  wwAddLog(`第${ww.round}局开始，${ww.playerCount}人，${werewolfBoards[ww.boardType].name}`);
  wwRender();
  navTo('werewolf-game');
}

// ==================== 夜晚流程 ====================
function wwStartNight() {
  ww.phase = 'night';
  ww.nightActions = { guard: null, wolfKill: null, wolfSelfKill: false, witchSave: false, witchPoison: null, seerCheck: null };
  ww.nightSteps = wwGenerateNightSteps();
  ww.nightStepIndex = 0;
  ww.selectedPlayer = null;
  wwAddLog(`--- 第${ww.round}夜 ---`);
  wwRender();
}

function wwGenerateNightSteps() {
  const steps = [];
  const hasGuard = ww.players.some(p => p.role === 'guard' && p.alive);
  const hasWitch = ww.players.some(p => p.role === 'witch' && p.alive);
  const hasSeer = ww.players.some(p => p.role === 'seer' && p.alive);

  if (hasGuard) {
    steps.push({
      id: 'guard', title: '守卫回合', icon: '🛡️',
      guide: '请让所有玩家闭眼，仅守卫睁眼。\n守卫选择今晚守护的玩家，不可连续两晚守护同一人。',
      type: 'select-protect',
    });
  }
  steps.push({
    id: 'wolf', title: '狼人回合', icon: '🐺',
    guide: '所有玩家闭眼，所有狼人统一睁眼，共同商议击杀一名玩家。\n请选择被刀玩家编号。',
    type: 'select-kill',
  });
  if (hasWitch) {
    steps.push({
      id: 'witch', title: '女巫回合', icon: '🧪',
      guide: '所有玩家闭眼，女巫睁眼。',
      type: 'witch',
    });
  }
  if (hasSeer) {
    steps.push({
      id: 'seer', title: '预言家回合', icon: '🔮',
      guide: '所有玩家闭眼，预言家睁眼。\n选择一名玩家查验阵营（好人/狼人）。',
      type: 'seer',
    });
  }
  return steps;
}

function wwSelectPlayer(num) {
  const step = ww.nightSteps[ww.nightStepIndex];
  if (!step) return;

  if (step.type === 'select-protect') {
    if (num === ww.guardLastProtected) {
      showToast('不可连续两晚守护同一人');
      return;
    }
    ww.nightActions.guard = num;
    wwAddLog(`守卫守护 ${num} 号`);
  } else if (step.type === 'select-kill') {
    ww.nightActions.wolfKill = num;
    const target = ww.players.find(p => p.num === num);
    if (target && target.role === 'wolf') {
      ww.nightActions.wolfSelfKill = true;
      wwAddLog(`狼人自刀 ${num} 号`);
    } else {
      wwAddLog(`狼人刀 ${num} 号`);
    }
  }
  ww.selectedPlayer = num;
  wwRender();
}

function wwWitchSave() {
  if (ww.witchPotions.save <= 0) return;
  if (ww.nightActions.witchPoison !== null) {
    showToast('已使用毒药，不可同晚双开');
    return;
  }
  const witchPlayer = ww.players.find(p => p.role === 'witch');
  const killed = ww.nightActions.wolfKill;
  if (ww.round === 1 && !ww.options.selfSaveFirstNight && killed === witchPlayer.num) {
    showToast('首夜不可自救');
    return;
  }
  ww.nightActions.witchSave = !ww.nightActions.witchSave;
  wwAddLog(ww.nightActions.witchSave ? `女巫使用解药救 ${killed} 号` : '女巫取消解药');
  wwRender();
}

function wwWitchPoison(num) {
  if (ww.witchPotions.poison <= 0) return;
  if (ww.nightActions.witchSave) {
    showToast('已使用解药，不可同晚双开');
    return;
  }
  ww.nightActions.witchPoison = ww.nightActions.witchPoison === num ? null : num;
  if (ww.nightActions.witchPoison) {
    wwAddLog(`女巫毒杀 ${num} 号`);
  } else {
    wwAddLog('女巫取消毒药');
  }
  wwRender();
}

function wwSeerCheck(num) {
  const player = ww.players.find(p => p.num === num);
  if (!player) return;
  const result = player.role === 'wolf' ? '狼人' : '好人';
  ww.nightActions.seerCheck = { num, result };
  wwAddLog(`预言家查验 ${num} 号：${result}`);
  wwRender();
}

function wwNightNext() {
  const step = ww.nightSteps[ww.nightStepIndex];
  if (!step) return;

  if (step.id === 'guard' && ww.nightActions.guard === null) {
    showToast('请选择守护的玩家');
    return;
  }
  if (step.id === 'wolf' && ww.nightActions.wolfKill === null) {
    showToast('请选择被刀玩家');
    return;
  }

  if (step.id === 'guard') {
    ww.guardLastProtected = ww.nightActions.guard;
  }

  ww.nightStepIndex++;
  ww.selectedPlayer = null;
  if (ww.nightStepIndex >= ww.nightSteps.length) {
    wwDawn();
  } else {
    wwRender();
  }
}

function wwNightUndo() {
  if (ww.nightStepIndex > 0) {
    ww.nightStepIndex--;
    const step = ww.nightSteps[ww.nightStepIndex];
    if (step) {
      ww.nightActions[step.id === 'guard' ? 'guard' : step.id === 'wolf' ? 'wolfKill' : step.id] = step.id === 'guard' ? null : step.id === 'wolf' ? null : ww.nightActions[step.id];
    }
    ww.selectedPlayer = null;
    wwRender();
  } else {
    showToast('已是第一步');
  }
}

// ==================== 天亮 ====================
function wwDawn() {
  ww.phase = 'dawn';
  ww.nightDeaths = wwCalculateDeaths();
  ww.nightDeaths.forEach(d => {
    const player = ww.players.find(p => p.num === d.num);
    if (player) {
      player.alive = false;
      if (player.isSheriff) {
        player.isSheriff = false;
        ww.sheriff = null;
        wwAddLog(`警长 ${d.num} 号殉职`);
      }
    }
  });
  if (ww.nightDeaths.length > 0) {
    const deathsText = ww.nightDeaths.map(d => `${d.num}号(${d.cause})`).join('、');
    wwAddLog(`第${ww.round}夜出局：${deathsText}`);
  } else {
    wwAddLog(`第${ww.round}夜平安夜`);
  }
  wwRender();
}

function wwCalculateDeaths() {
  const deaths = [];
  const { guard, wolfKill, witchSave, witchPoison } = ww.nightActions;

  if (wolfKill !== null) {
    const isGuarded = guard === wolfKill;
    const isSaved = witchSave;
    if (isGuarded && isSaved) {
      deaths.push({ num: wolfKill, cause: '同守同救' });
    } else if (!isGuarded && !isSaved) {
      deaths.push({ num: wolfKill, cause: '刀杀' });
    }
  }
  if (witchPoison !== null) {
    if (!deaths.find(d => d.num === witchPoison)) {
      deaths.push({ num: witchPoison, cause: '毒杀' });
    }
  }
  return deaths;
}

function wwAfterDawn() {
  if (wwCheckWin()) {
    wwShowEnd();
    return;
  }
  const hasHunterDeath = ww.nightDeaths.some(d => {
    const p = ww.players.find(pl => pl.num === d.num);
    return p && p.role === 'hunter' && d.cause !== '毒杀';
  });
  if (hasHunterDeath) {
    ww.pendingSkill = { type: 'hunter-night', deaths: ww.nightDeaths.filter(d => {
      const p = ww.players.find(pl => pl.num === d.num);
      return p && p.role === 'hunter' && d.cause !== '毒杀';
    })};
    wwRender();
    return;
  }
  if (ww.round === 1 && ww.options.sheriff && !ww.sheriffDone) {
    wwStartCampaign();
  } else {
    wwStartDiscuss();
  }
}

// ==================== 警长竞选 ====================
function wwStartCampaign() {
  ww.phase = 'campaign';
  ww.sheriffCandidates = [];
  ww.sheriffVotes = {};
  wwAddLog('警长竞选开始');
  wwRender();
}

function wwToggleCandidate(num) {
  const idx = ww.sheriffCandidates.indexOf(num);
  if (idx >= 0) {
    ww.sheriffCandidates.splice(idx, 1);
  } else {
    ww.sheriffCandidates.push(num);
  }
  ww.sheriffVotes = {};
  wwRender();
}

function wwVoteSheriff(num) {
  ww.sheriffVotes[num] = (ww.sheriffVotes[num] || 0) + 1;
  wwRender();
}

function wwUndoSheriffVote() {
  const entries = Object.entries(ww.sheriffVotes);
  if (entries.length === 0) return;
  const last = entries[entries.length - 1];
  ww.sheriffVotes[last[0]] = last[1] - 1;
  if (ww.sheriffVotes[last[0]] <= 0) delete ww.sheriffVotes[last[0]];
  wwRender();
}

function wwConfirmSheriff(num) {
  ww.sheriff = num;
  const player = ww.players.find(p => p.num === num);
  if (player) player.isSheriff = true;
  ww.sheriffDone = true;
  wwAddLog(`${num} 号当选警长`);
  wwRender();
}

function wwWolfExplode() {
  wwAddLog('狼人自爆，终止白天流程');
  ww.sheriffDone = true;
  ww.round++;
  wwStartNight();
}

function wwAfterCampaign() {
  wwStartDiscuss();
}

// ==================== 白天发言 ====================
function wwStartDiscuss() {
  ww.phase = 'discuss';
  wwRender();
}

// ==================== 放逐投票 ====================
function wwStartVote() {
  ww.phase = 'vote';
  ww.exileVotes = {};
  ww.voteStack = [];
  ww.pkPlayers = [];
  wwRender();
}

function wwVoteFor(num) {
  const player = ww.players.find(p => p.num === num);
  if (!player || !player.alive) return;
  ww.exileVotes[num] = (ww.exileVotes[num] || 0) + 1;
  ww.voteStack.push(num);
  wwRender();
}

function wwUndoVote() {
  if (ww.voteStack.length === 0) return;
  const last = ww.voteStack.pop();
  ww.exileVotes[last] = ww.exileVotes[last] - 1;
  if (ww.exileVotes[last] <= 0) delete ww.exileVotes[last];
  wwRender();
}

function wwSubmitVote() {
  const totalVotes = Object.values(ww.exileVotes).reduce((a, b) => a + b, 0);
  const aliveVoters = ww.players.filter(p => p.alive && p.hasVoteRight).length;
  if (totalVotes < aliveVoters) {
    showToast(`还有 ${aliveVoters - totalVotes} 票未投`);
    return;
  }
  ww.phase = 'voteResult';
  const maxVotes = Math.max(...Object.values(ww.exileVotes), 0);
  const winners = Object.entries(ww.exileVotes).filter(([, v]) => v === maxVotes && v > 0).map(([k]) => parseInt(k));
  if (winners.length > 1) {
    ww.pkPlayers = winners;
  }
  wwRender();
}

// ==================== 投票结果 ====================
function wwStartPK() {
  ww.phase = 'vote';
  ww.exileVotes = {};
  ww.voteStack = [];
  wwAddLog(`PK：${ww.pkPlayers.join('、')} 号平票重新投票`);
  wwRender();
}

function wwHunterShoot(num) {
  const target = ww.players.find(p => p.num === num);
  if (target) {
    target.alive = false;
    wwAddLog(`猎人开枪带走 ${num} 号（${werewolfRoles[target.role].name}）`);
    if (target.isSheriff) {
      target.isSheriff = false;
      ww.sheriff = null;
    }
  }
  ww.pendingSkill = null;
  if (wwCheckWin()) {
    wwShowEnd();
  } else {
    wwRender();
  }
}

function wwHunterNoShoot() {
  wwAddLog('猎人选择不开枪');
  ww.pendingSkill = null;
  wwRender();
}

function wwIdiotFlip() {
  wwAddLog('白痴翻牌免死，失去投票权');
  ww.pendingSkill = null;
  wwRender();
}

function wwAfterVoteResult() {
  const maxVotes = Math.max(...Object.values(ww.exileVotes), 0);
  const winners = Object.entries(ww.exileVotes).filter(([, v]) => v === maxVotes && v > 0).map(([k]) => parseInt(k));

  if (winners.length > 1) {
    wwStartPK();
    return;
  }

  const outNum = winners[0];
  const player = ww.players.find(p => p.num === outNum);
  if (!player) return;

  if (player.role === 'idiot' && !player.revealed) {
    player.revealed = true;
    player.hasVoteRight = false;
    wwAddLog(`${outNum} 号白痴翻牌免死，失去投票权`);
    if (wwCheckWin()) { wwShowEnd(); return; }
    wwNextRound();
    return;
  }

  player.alive = false;
  if (player.isSheriff) {
    player.isSheriff = false;
    ww.sheriff = null;
    wwAddLog(`警长 ${outNum} 号被放逐`);
  }
  wwAddLog(`${outNum} 号被放逐（${werewolfRoles[player.role].name}）`);

  if (player.role === 'hunter') {
    ww.pendingSkill = { type: 'hunter-vote', num: outNum };
    wwRender();
    return;
  }

  if (wwCheckWin()) {
    wwShowEnd();
  } else {
    wwNextRound();
  }
}

function wwNextRound() {
  ww.round++;
  wwStartNight();
}

// ==================== 胜负判定 ====================
function wwCheckWin() {
  const aliveWolves = ww.players.filter(p => p.role === 'wolf' && p.alive).length;
  const aliveGods = ww.players.filter(p => ['seer', 'witch', 'hunter', 'guard', 'idiot'].includes(p.role) && p.alive).length;
  const aliveCivilians = ww.players.filter(p => p.role === 'civilian' && p.alive).length;

  if (aliveWolves === 0) {
    ww.winner = 'good';
    ww.winReason = '所有狼人出局，好人胜利！';
    return true;
  }
  if (aliveGods === 0) {
    ww.winner = 'wolf';
    ww.winReason = '神职全灭，狼人胜利！';
    return true;
  }
  if (aliveCivilians === 0) {
    ww.winner = 'wolf';
    ww.winReason = '平民全灭，狼人胜利！';
    return true;
  }
  return false;
}

function wwShowEnd() {
  ww.phase = 'end';
  wwAddLog(`游戏结束：${ww.winReason}`);
  if (typeof saveStat === 'function') {
    saveStat('werewolf', {
      players: ww.playerCount,
      rounds: ww.round,
      result: ww.winner === 'good' ? '好人胜' : '狼人胜',
    });
  }
  wwRenderEnd();
  navTo('werewolf-end');
}

// ==================== 渲染 ====================
function wwRender() {
  const phaseName = wwPhaseNames[ww.phase] || '';
  const phaseEl = document.getElementById('ww-phase-title');
  if (phaseEl && phaseEl.textContent !== phaseName) {
    phaseEl.textContent = phaseName;
    const page = document.getElementById('page-werewolf-game');
    if (page) page.scrollTop = 0;
  }

  const roundEl = document.getElementById('ww-round');
  if (roundEl) roundEl.textContent = ww.round;

  const stepNameEl = document.getElementById('ww-step-name');
  if (stepNameEl) stepNameEl.textContent = wwGetCurrentStepName();

  const guideIconEl = document.getElementById('ww-guide-icon');
  const guideTitleEl = document.getElementById('ww-guide-title');
  const guideTextEl = document.getElementById('ww-guide-text');
  const guide = wwGetGuide();
  if (guideIconEl) guideIconEl.textContent = guide.icon;
  if (guideTitleEl) guideTitleEl.textContent = guide.title;
  if (guideTextEl) guideTextEl.innerHTML = guide.text.replace(/\n/g, '<br>');

  const actionArea = document.getElementById('ww-action-area');
  if (actionArea) actionArea.innerHTML = wwRenderActionArea();

  wwRenderPlayerPanel();
  wwRenderButtons();
}

function wwGetCurrentStepName() {
  if (ww.phase === 'night' && ww.nightSteps[ww.nightStepIndex]) {
    return ww.nightSteps[ww.nightStepIndex].title;
  }
  return wwPhaseNames[ww.phase] || '';
}

function wwGetGuide() {
  if (ww.phase === 'deal') {
    return {
      icon: '🎴', title: '发牌阶段',
      text: `请给 1~${ww.playerCount} 号玩家依次发身份牌，仅本人查看，禁止传阅。\n狼人、神职、平民分开发放。\n发牌完毕点击下一步。`,
    };
  }
  if (ww.phase === 'night') {
    const step = ww.nightSteps[ww.nightStepIndex];
    if (!step) return { icon: '🌙', title: '黑夜', text: '' };
    return { icon: step.icon, title: step.title, text: step.guide };
  }
  if (ww.phase === 'dawn') {
    if (ww.nightDeaths.length === 0) {
      return { icon: '🌙', title: '平安夜', text: '昨晚是平安夜，无人出局。' };
    }
    let text = `昨晚出局：\n${ww.nightDeaths.map(d => `${d.num} 号（${d.cause}）`).join('、')}\n`;
    text += ww.round === 1 && ww.options.lastWords ? '首夜出局拥有遗言' : '夜间出局无遗言';
    return { icon: '☀️', title: '天亮', text };
  }
  if (ww.pendingSkill && ww.pendingSkill.type === 'hunter-night') {
    return { icon: '🎯', title: '猎人技能', text: `猎人被刀死亡，是否开枪带走一名玩家？\n（被毒死不可开枪）` };
  }
  if (ww.pendingSkill && ww.pendingSkill.type === 'hunter-vote') {
    return { icon: '🎯', title: '猎人技能', text: `猎人被投票出局，是否开枪带走一名玩家？\n（被毒死不可开枪）` };
  }
  if (ww.phase === 'campaign') {
    if (ww.sheriff) {
      return { icon: '👑', title: '警长已选出', text: `${ww.sheriff} 号当选警长，拥有1.5票投票权。\n警长决定发言顺序。` };
    }
    return {
      icon: '👑', title: '警长竞选',
      text: '想要竞选警长的玩家举手（警上），其余为警下。\n警上玩家按编号依次发言，发言完毕后警下投票。\n狼人可自爆吞警徽。',
    };
  }
  if (ww.phase === 'discuss') {
    let text = '按照警长指定顺序，存活玩家依次发言，禁止贴脸场外。\n\n存活玩家：';
    text += ww.players.filter(p => p.alive).map(p => p.num + '号').join('、');
    if (ww.sheriff) text += `\n警长：${ww.sheriff}号`;
    return { icon: '💬', title: '白天发言', text };
  }
  if (ww.phase === 'vote') {
    if (ww.pkPlayers.length > 0) {
      return { icon: '⚔️', title: 'PK投票', text: `平票玩家：${ww.pkPlayers.join('、')} 号\nPK发言后重新投票，仅可投给PK玩家。` };
    }
    return { icon: '🗳️', title: '放逐投票', text: '全体存活玩家匿名投票。\n法官依次唱票，点击被投票的玩家累计票数。' };
  }
  if (ww.phase === 'voteResult') {
    return { icon: '📋', title: '投票结果', text: '查看投票结果，处理出局玩家技能。' };
  }
  return { icon: '🎮', title: '', text: '' };
}

function wwRenderActionArea() {
  if (ww.pendingSkill && (ww.pendingSkill.type === 'hunter-night' || ww.pendingSkill.type === 'hunter-vote')) {
    return wwRenderHunterShoot();
  }
  if (ww.phase === 'night') return wwRenderNightAction();
  if (ww.phase === 'dawn') return wwRenderDawnAction();
  if (ww.phase === 'campaign') return wwRenderCampaignAction();
  if (ww.phase === 'discuss') return '';
  if (ww.phase === 'vote') return wwRenderVoteAction();
  if (ww.phase === 'voteResult') return wwRenderVoteResultAction();
  return '';
}

function wwRenderNightAction() {
  const step = ww.nightSteps[ww.nightStepIndex];
  if (!step) return '';

  if (step.type === 'select-protect') {
    return wwRenderSelectGrid({
      filter: p => p.alive,
      disabled: p => p.num === ww.guardLastProtected,
      disabledText: '昨晚已守护',
      selected: ww.nightActions.guard,
      onSelect: 'wwSelectPlayer',
    });
  }
  if (step.type === 'select-kill') {
    return wwRenderSelectGrid({
      filter: p => p.alive,
      disabled: p => p.role === 'wolf' && !ww.options.selfKill,
      disabledText: '禁止自刀',
      selected: ww.nightActions.wolfKill,
      onSelect: 'wwSelectPlayer',
    });
  }
  if (step.type === 'witch') return wwRenderWitchAction();
  if (step.type === 'seer') return wwRenderSeerAction();
  return '';
}

function wwRenderSelectGrid(opts) {
  const players = ww.players.filter(opts.filter);
  let html = '<div class="ww-select-label">选择玩家编号</div>';
  html += '<div class="ww-player-grid">';
  players.forEach(p => {
    const disabled = opts.disabled && opts.disabled(p);
    const selected = opts.selected === p.num;
    const role = werewolfRoles[p.role];
    html += `<div class="ww-player-cell ${disabled ? 'disabled' : ''} ${selected ? 'selected' : ''}" 
      ${disabled ? '' : `onclick="${opts.onSelect}(${p.num})"`}>
      <span class="ww-cell-num">${p.num}</span>
      ${selected ? `<span class="ww-cell-role">${role.icon}</span>` : ''}
      ${disabled ? `<span class="ww-cell-disabled-text">${opts.disabledText || ''}</span>` : ''}
    </div>`;
  });
  html += '</div>';
  if (selected !== undefined && opts.selected !== null) {
    const sel = ww.players.find(p => p.num === opts.selected);
    if (sel) {
      html += `<div class="ww-selected-info">已选择 ${sel.num} 号（${werewolfRoles[sel.role].name}）</div>`;
    }
  }
  return html;
}

function wwRenderWitchAction() {
  const killed = ww.nightActions.wolfKill;
  const witchPlayer = ww.players.find(p => p.role === 'witch');
  let html = '';

  if (killed !== null) {
    html += `<div class="ww-witch-info danger">今晚 ${killed} 号玩家被刀</div>`;
  } else {
    html += '<div class="ww-witch-info safe">今晚无人被刀</div>';
  }

  if (ww.witchPotions.save > 0 && killed !== null) {
    const canSave = !(ww.round === 1 && !ww.options.selfSaveFirstNight && killed === witchPlayer.num);
    if (canSave && !ww.nightActions.witchPoison) {
      html += `<button class="btn-outline ww-witch-btn ${ww.nightActions.witchSave ? 'active' : ''}" onclick="wwWitchSave()">
        ${ww.nightActions.witchSave ? '✓ 已使用解药救人' : '💊 使用解药救人'}
      </button>`;
    } else if (ww.nightActions.witchPoison) {
      html += '<div class="ww-witch-hint">已使用毒药，本晚不可用解药</div>';
    } else if (!canSave) {
      html += '<div class="ww-witch-hint">首夜不可自救</div>';
    }
  } else if (ww.witchPotions.save <= 0) {
    html += '<div class="ww-witch-hint">解药已用完</div>';
  }

  if (ww.witchPotions.poison > 0 && !ww.nightActions.witchSave) {
    html += '<div class="ww-select-label">使用毒药毒杀（点击选择，再次点击取消）</div>';
    html += '<div class="ww-player-grid">';
    ww.players.filter(p => p.alive).forEach(p => {
      const selected = ww.nightActions.witchPoison === p.num;
      html += `<div class="ww-player-cell ${selected ? 'selected poison' : ''}" onclick="wwWitchPoison(${p.num})">
        <span class="ww-cell-num">${p.num}</span>
      </div>`;
    });
    html += '</div>';
  } else if (ww.nightActions.witchSave) {
    html += '<div class="ww-witch-hint">已使用解药，本晚不可用毒药</div>';
  } else if (ww.witchPotions.poison <= 0) {
    html += '<div class="ww-witch-hint">毒药已用完</div>';
  }

  if (ww.nightActions.witchSave) ww.witchPotions.save = 0;
  if (ww.nightActions.witchPoison !== null) ww.witchPotions.poison = 0;

  return html;
}

function wwRenderSeerAction() {
  let html = '';
  if (ww.nightActions.seerCheck) {
    const check = ww.nightActions.seerCheck;
    const isWolf = check.result === '狼人';
    html += `<div class="ww-seer-result ${isWolf ? 'wolf' : 'good'}">
      <div class="ww-seer-result-num">${check.num} 号</div>
      <div class="ww-seer-result-icon">${isWolf ? '🐺' : '✓'}</div>
      <div class="ww-seer-result-text">${check.result}</div>
    </div>`;
    html += '<button class="btn-outline ww-recheck-btn" onclick="wwSeerRecheck()">重新查验</button>';
  } else {
    html += '<div class="ww-select-label">选择查验玩家</div>';
    html += '<div class="ww-player-grid">';
    ww.players.filter(p => p.alive && p.role !== 'seer').forEach(p => {
      html += `<div class="ww-player-cell" onclick="wwSeerCheck(${p.num})">
        <span class="ww-cell-num">${p.num}</span>
      </div>`;
    });
    html += '</div>';
  }
  return html;
}

function wwSeerRecheck() {
  ww.nightActions.seerCheck = null;
  wwRender();
}

function wwRenderDawnAction() {
  if (ww.nightDeaths.length === 0) {
    return '<div class="ww-dawn-safe">🌙 平安夜，无人出局</div>';
  }
  let html = '<div class="ww-dawn-deaths">';
  ww.nightDeaths.forEach(d => {
    const player = ww.players.find(p => p.num === d.num);
    html += `<div class="ww-death-item">
      <span class="ww-death-num">${d.num} 号</span>
      <span class="ww-death-cause">${d.cause}</span>
      <span class="ww-death-role">${player ? werewolfRoles[player.role].icon + werewolfRoles[player.role].name : ''}</span>
    </div>`;
  });
  html += '</div>';
  if (ww.round === 1 && ww.options.lastWords) {
    html += '<div class="ww-dawn-hint">首夜出局拥有遗言</div>';
  } else {
    html += '<div class="ww-dawn-hint">夜间出局无遗言</div>';
  }
  return html;
}

function wwRenderCampaignAction() {
  if (ww.sheriff) {
    return `<div class="ww-campaign-done">
      <div class="ww-sheriff-badge">👑 ${ww.sheriff} 号当选警长</div>
    </div>`;
  }
  let html = '';
  if (ww.sheriffCandidates.length === 0) {
    html += '<div class="ww-select-label">选择竞选警长的玩家（警上）</div>';
    html += '<div class="ww-player-grid">';
    ww.players.filter(p => p.alive).forEach(p => {
      html += `<div class="ww-player-cell" onclick="wwToggleCandidate(${p.num})">
        <span class="ww-cell-num">${p.num}</span>
      </div>`;
    });
    html += '</div>';
    html += '<button class="btn-danger ww-explode-btn" onclick="wwWolfExplode()">狼人自爆</button>';
  } else {
    html += '<div class="ww-select-label">警上玩家（再次点击取消）</div>';
    html += '<div class="ww-player-grid">';
    ww.players.filter(p => p.alive).forEach(p => {
      const isCand = ww.sheriffCandidates.includes(p.num);
      html += `<div class="ww-player-cell ${isCand ? 'selected' : ''}" onclick="wwToggleCandidate(${p.num})">
        <span class="ww-cell-num">${p.num}</span>
        ${isCand ? '<span class="ww-cell-tag">警上</span>' : ''}
      </div>`;
    });
    html += '</div>';

    html += '<div class="ww-select-label">警下投票（点击候选人累计票数）</div>';
    html += '<div class="ww-player-grid">';
    ww.sheriffCandidates.forEach(num => {
      const votes = ww.sheriffVotes[num] || 0;
      html += `<div class="ww-player-cell candidate" onclick="wwVoteSheriff(${num})">
        <span class="ww-cell-num">${num}</span>
        <span class="ww-cell-votes">${votes}票</span>
      </div>`;
    });
    html += '</div>';

    const totalVotes = Object.values(ww.sheriffVotes).reduce((a, b) => a + b, 0);
    const aliveVoters = ww.players.filter(p => p.alive && !ww.sheriffCandidates.includes(p.num)).length;
    html += `<div class="ww-vote-count">已投票 ${totalVotes} / ${aliveVoters}</div>`;
    if (totalVotes > 0) {
      html += '<button class="btn-outline ww-undo-vote" onclick="wwUndoSheriffVote()">撤销上一票</button>';
    }

    const maxVotes = Math.max(...Object.values(ww.sheriffVotes), 0);
    const winners = Object.entries(ww.sheriffVotes).filter(([, v]) => v === maxVotes && v > 0);
    if (winners.length === 1) {
      html += `<button class="btn-primary ww-confirm-sheriff" onclick="wwConfirmSheriff(${winners[0][0]})">确认 ${winners[0][0]} 号为警长</button>`;
    } else if (winners.length > 1) {
      html += '<div class="ww-pk-notice">⚠️ 平票！需要PK发言后重新投票</div>';
    }
    html += '<button class="btn-danger ww-explode-btn" onclick="wwWolfExplode()">狼人自爆</button>';
  }
  return html;
}

function wwRenderVoteAction() {
  let html = '<div class="ww-select-label">点击被投票的玩家（累计票数）</div>';
  html += '<div class="ww-player-grid">';
  const voteTargets = ww.pkPlayers.length > 0
    ? ww.players.filter(p => ww.pkPlayers.includes(p.num))
    : ww.players.filter(p => p.alive && p.hasVoteRight);
  voteTargets.forEach(p => {
    const votes = ww.exileVotes[p.num] || 0;
    html += `<div class="ww-player-cell" onclick="wwVoteFor(${p.num})">
      <span class="ww-cell-num">${p.num}</span>
      <span class="ww-cell-votes">${votes}票</span>
    </div>`;
  });
  html += '</div>';

  const totalVotes = Object.values(ww.exileVotes).reduce((a, b) => a + b, 0);
  const aliveVoters = ww.players.filter(p => p.alive && p.hasVoteRight).length;
  html += `<div class="ww-vote-count">已投票 ${totalVotes} / ${aliveVoters}</div>`;
  if (totalVotes > 0) {
    html += '<button class="btn-outline ww-undo-vote" onclick="wwUndoVote()">撤销上一票</button>';
  }
  return html;
}

function wwRenderVoteResultAction() {
  if (ww.pkPlayers.length > 1) {
    let html = '<div class="ww-vote-result-list">';
    Object.entries(ww.exileVotes).sort((a, b) => b[1] - a[1]).forEach(([num, votes]) => {
      const isPK = ww.pkPlayers.includes(parseInt(num));
      html += `<div class="ww-vote-result-item ${isPK ? 'pk' : ''}">
        <span>${num} 号</span>
        <span>${votes} 票</span>
      </div>`;
    });
    html += '</div>';
    html += '<div class="ww-pk-notice">⚠️ 平票！进入PK发言后重新投票</div>';
    html += '<button class="btn-primary ww-btn-full" onclick="wwStartPK()">开始PK投票</button>';
    return html;
  }

  const maxVotes = Math.max(...Object.values(ww.exileVotes), 0);
  const winners = Object.entries(ww.exileVotes).filter(([, v]) => v === maxVotes && v > 0);
  if (winners.length === 0) return '';

  const outNum = parseInt(winners[0][0]);
  const player = ww.players.find(p => p.num === outNum);
  if (!player) return '';

  let html = '<div class="ww-vote-result-list">';
  Object.entries(ww.exileVotes).sort((a, b) => b[1] - a[1]).forEach(([num, votes]) => {
    const isMax = parseInt(num) === outNum;
    html += `<div class="ww-vote-result-item ${isMax ? 'max' : ''}">
      <span>${num} 号</span>
      <span>${votes} 票</span>
    </div>`;
  });
  html += '</div>';

  if (player.role === 'idiot' && !player.revealed) {
    html += `<div class="ww-skill-trigger">🤡 ${outNum} 号是白痴，翻牌免死</div>`;
    html += `<button class="btn-primary ww-btn-full" onclick="wwIdiotFlip()">确认白痴翻牌</button>`;
  } else {
    html += `<div class="ww-vote-out">${outNum} 号被放逐（${werewolfRoles[player.role].name}）</div>`;
    if (player.role === 'hunter') {
      html += '<div class="ww-skill-trigger">🎯 猎人是否开枪带走一名玩家？</div>';
      html += wwRenderHunterTargets(outNum);
      html += '<button class="btn-outline ww-btn-full" onclick="wwHunterNoShoot()">不开枪</button>';
    } else {
      html += '<div class="ww-skill-none">无技能触发</div>';
    }
  }
  return html;
}

function wwRenderHunterShoot() {
  let html = '<div class="ww-skill-trigger">🎯 猎人开枪带走一名玩家</div>';
  html += wwRenderHunterTargets(null);
  html += '<button class="btn-outline ww-btn-full" onclick="wwHunterNoShoot()">不开枪</button>';
  return html;
}

function wwRenderHunterTargets(excludeNum) {
  let html = '<div class="ww-player-grid">';
  ww.players.filter(p => p.alive && p.num !== excludeNum).forEach(p => {
    html += `<div class="ww-player-cell" onclick="wwHunterShoot(${p.num})">
      <span class="ww-cell-num">${p.num}</span>
    </div>`;
  });
  html += '</div>';
  return html;
}

function wwRenderPlayerPanel() {
  const container = document.getElementById('ww-player-panel');
  if (!container) return;
  const collapsed = container.classList.contains('collapsed');
  let html = `<div class="ww-panel-title" onclick="wwTogglePanel()">
    <span>玩家状态</span>
    <span class="ww-panel-toggle">${collapsed ? '展开 ▼' : '收起 ▲'}</span>
  </div>`;
  html += '<div class="ww-panel-body">';
  html += '<div class="ww-panel-grid">';
  ww.players.forEach(p => {
    const role = werewolfRoles[p.role];
    const teamClass = role.team === 'wolf' ? 'wolf' : 'good';
    const deadClass = p.alive ? '' : 'dead';
    const sheriffClass = p.isSheriff ? 'sheriff' : '';
    html += `<div class="ww-panel-cell ${deadClass} ${sheriffClass} ${teamClass}">
      <span class="ww-panel-num">${p.num}</span>
      <span class="ww-panel-icon">${role.icon}</span>
      <span class="ww-panel-role">${role.name}</span>
      ${p.isSheriff ? '<span class="ww-panel-badge">👑</span>' : ''}
      ${!p.alive ? '<span class="ww-panel-dead">💀</span>' : ''}
      ${p.revealed ? '<span class="ww-panel-revealed">翻牌</span>' : ''}
    </div>`;
  });
  html += '</div>';
  html += `<div class="ww-panel-stats">
    <span>狼人 ${ww.players.filter(p => p.role === 'wolf' && p.alive).length}</span>
    <span>神职 ${ww.players.filter(p => ['seer','witch','hunter','guard','idiot'].includes(p.role) && p.alive).length}</span>
    <span>平民 ${ww.players.filter(p => p.role === 'civilian' && p.alive).length}</span>
  </div>`;
  html += '</div>';
  container.innerHTML = html;
}

function wwTogglePanel() {
  const container = document.getElementById('ww-player-panel');
  if (container) {
    container.classList.toggle('collapsed');
    wwRenderPlayerPanel();
  }
}

function wwRenderButtons() {
  const undoBtn = document.getElementById('ww-undo-btn');
  const nextBtn = document.getElementById('ww-next-btn');
  if (!undoBtn || !nextBtn) return;

  let nextText = '下一步';
  let nextAction = 'wwNext()';
  let showNext = true;
  let showUndo = false;

  if (ww.phase === 'deal') {
    nextText = '开始夜晚';
  } else if (ww.phase === 'night') {
    showUndo = ww.nightStepIndex > 0;
    nextText = ww.nightStepIndex >= ww.nightSteps.length - 1 ? '天亮' : '下一步';
    const step = ww.nightSteps[ww.nightStepIndex];
    if (step) {
      if ((step.id === 'guard' && ww.nightActions.guard === null) ||
          (step.id === 'wolf' && ww.nightActions.wolfKill === null)) {
        nextBtn.style.opacity = '0.5';
        nextBtn.style.pointerEvents = 'none';
      } else {
        nextBtn.style.opacity = '1';
        nextBtn.style.pointerEvents = 'auto';
      }
    }
  } else if (ww.phase === 'dawn') {
    nextText = '下一步';
  } else if (ww.pendingSkill) {
    showNext = false;
    showUndo = false;
  } else if (ww.phase === 'campaign') {
    if (ww.sheriff) {
      nextText = '确认进入发言';
    } else {
      showNext = false;
    }
  } else if (ww.phase === 'discuss') {
    nextText = '开始投票';
  } else if (ww.phase === 'vote') {
    showNext = false;
    const totalVotes = Object.values(ww.exileVotes).reduce((a, b) => a + b, 0);
    const aliveVoters = ww.players.filter(p => p.alive && p.hasVoteRight).length;
    if (totalVotes >= aliveVoters) {
      showNext = true;
      nextText = '确认投票结果';
    }
  } else if (ww.phase === 'voteResult') {
    if (ww.pkPlayers.length > 1) {
      showNext = false;
    } else {
      const maxVotes = Math.max(...Object.values(ww.exileVotes), 0);
      const winners = Object.entries(ww.exileVotes).filter(([, v]) => v === maxVotes && v > 0);
      if (winners.length === 1) {
        const outNum = parseInt(winners[0][0]);
        const player = ww.players.find(p => p.num === outNum);
        if (player && player.role === 'hunter' && !ww.pendingSkill) {
          nextText = '猎人开枪后继续';
          showNext = false;
        } else if (player && player.role === 'idiot' && !player.revealed) {
          nextText = '白痴翻牌后继续';
          showNext = false;
        } else {
          nextText = '进入下一夜';
        }
      } else {
        showNext = false;
      }
    }
  }

  undoBtn.style.display = showUndo ? 'block' : 'none';
  nextBtn.style.display = showNext ? 'block' : 'none';
  nextBtn.textContent = nextText;
}

function wwNext() {
  if (ww.phase === 'deal') {
    wwStartNight();
  } else if (ww.phase === 'night') {
    wwNightNext();
  } else if (ww.phase === 'dawn') {
    wwAfterDawn();
  } else if (ww.phase === 'campaign' && ww.sheriff) {
    wwAfterCampaign();
  } else if (ww.phase === 'discuss') {
    wwStartVote();
  } else if (ww.phase === 'vote') {
    wwSubmitVote();
  } else if (ww.phase === 'voteResult') {
    wwAfterVoteResult();
  }
}

function wwUndo() {
  if (ww.phase === 'night') {
    wwNightUndo();
  }
}

function wwRenderEnd() {
  const winnerEl = document.getElementById('ww-end-winner');
  const reasonEl = document.getElementById('ww-end-reason');
  const rolesEl = document.getElementById('ww-end-roles');
  const logEl = document.getElementById('ww-end-log');

  if (winnerEl) {
    winnerEl.textContent = ww.winner === 'good' ? '好人胜利' : '狼人胜利';
    winnerEl.className = 'ww-end-winner ' + ww.winner;
  }
  if (reasonEl) reasonEl.textContent = ww.winReason;
  if (rolesEl) {
    rolesEl.innerHTML = ww.players.map(p => {
      const role = werewolfRoles[p.role];
      return `<div class="ww-end-role ${p.alive ? 'alive' : 'dead'}">
        <span>${p.num}号</span>
        <span>${role.icon} ${role.name}</span>
        <span>${p.alive ? '存活' : '出局'}</span>
      </div>`;
    }).join('');
  }
  if (logEl) {
    logEl.innerHTML = ww.log.map(l => `<div class="ww-log-item">${l}</div>`).join('');
  }
}

function wwEndGame() {
  navTo('home');
}

function wwRestart() {
  startWerewolf();
}

function wwShowRules() {
  let html = '';
  for (const [key, role] of Object.entries(werewolfRoles)) {
    html += `<div class="ww-rule-item"><strong>${role.icon} ${role.name}：</strong>${werewolfRules[key]}</div>`;
  }
  html += `<div class="ww-rule-item"><strong>👑 警长：</strong>${werewolfRules.sheriff}</div>`;
  const rulesContent = document.getElementById('ww-rules-content');
  if (rulesContent) {
    rulesContent.innerHTML = html;
    document.getElementById('ww-rules-modal').style.display = 'flex';
  }
}

function wwCloseRules() {
  const modal = document.getElementById('ww-rules-modal');
  if (modal) modal.style.display = 'none';
}

function wwAddLog(text) {
  ww.log.push(text);
}

function wwTogglePlayerDead(num) {
  const player = ww.players.find(p => p.num === num);
  if (!player) return;
  player.alive = !player.alive;
  if (!player.alive && player.isSheriff) {
    player.isSheriff = false;
    ww.sheriff = null;
  }
  wwAddLog(`手动标记 ${num} 号${player.alive ? '复活' : '死亡'}`);
  wwRender();
}
