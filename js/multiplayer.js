// 多人联机模式 - 基于 LeanCloud Object Storage + LiveQuery

const room = {
  id: null,
  gameType: 'undercover',
  isHost: false,
  myPlayerId: null,
  myNickname: '',
  players: [],
  gameState: 'lobby', // lobby, playing, result
  data: {},
  dbRef: null,       // AV.Object 引用 (GameRoom)
  liveQuery: null,   // AV.LiveQuery 实例
  listener: null,
  settings: {},
};

let selectedGameType = 'undercover';

// ==================== 房间系统 ====================

function showCreateRoom() {
  if (!leancloudAvailable) {
    showModal('leancloud-setup-modal');
    return;
  }
  selectedGameType = 'undercover';
  document.getElementById('create-room-modal').style.display = 'flex';
}

function showJoinRoom() {
  if (!leancloudAvailable) {
    showModal('leancloud-setup-modal');
    return;
  }
  
  const urlParams = new URLSearchParams(window.location.search);
  const roomParam = urlParams.get('room');
  if (roomParam) {
    document.getElementById('join-room-id').value = roomParam;
  }
  
  document.getElementById('join-room-modal').style.display = 'flex';
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

function selectGame(game) {
  selectedGameType = game;
  document.querySelectorAll('.game-select-item').forEach(item => {
    item.classList.remove('active');
    if (item.dataset.game === game) {
      item.classList.add('active');
    }
  });
}

function generateRoomId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function createRoom() {
  const nickname = document.getElementById('create-nickname').value.trim();
  if (!nickname) {
    showToast('请输入你的昵称');
    return;
  }
  
  const roomId = generateRoomId();
  const playerId = Date.now() + '';
  
  const gameNames = {
    undercover: '谁是卧底',
    bomb: '数字炸弹',
    wordguess: '猜词助手',
  };
  
  const roomObj = new AV.Object('GameRoom');
  roomObj.set('roomId', roomId);
  roomObj.set('gameType', selectedGameType);
  roomObj.set('hostId', playerId);
  roomObj.set('gameState', 'lobby');
  roomObj.set('settings', {
    category: 'all',
    duration: 60,
    mode: 'gesture',
  });
  roomObj.set('players', {
    [playerId]: {
      id: playerId,
      nickname: nickname,
      isHost: true,
      joinedAt: Date.now(),
    }
  });
  roomObj.set('gameData', {});
  
  roomObj.save().then((savedObj) => {
    room.id = roomId;
    room.gameType = selectedGameType;
    room.isHost = true;
    room.myPlayerId = playerId;
    room.myNickname = nickname;
    room.dbRef = savedObj;
    
    closeModal('create-room-modal');
    listenToRoom();
    enterLobby();
    
    const newUrl = window.location.origin + window.location.pathname + '?room=' + roomId;
    window.history.replaceState({ roomId: roomId }, '', newUrl);
  }).catch(err => {
    console.error('创建房间失败:', err);
    showToast('创建房间失败，请检查网络');
  });
}

function joinRoom() {
  const roomId = document.getElementById('join-room-id').value.trim().toUpperCase();
  const nickname = document.getElementById('join-nickname').value.trim();
  
  if (!roomId || roomId.length !== 6) {
    showToast('请输入6位房间号');
    return;
  }
  if (!nickname) {
    showToast('请输入你的昵称');
    return;
  }
  
  const query = new AV.Query('GameRoom');
  query.equalTo('roomId', roomId);
  query.first().then((existingObj) => {
    if (!existingObj) {
      showToast('房间不存在');
      return;
    }
    
    const gameState = existingObj.get('gameState');
    if (gameState !== 'lobby') {
      showToast('游戏已开始，无法加入');
      return;
    }
    
    const players = existingObj.get('players') || {};
    const playerCount = Object.keys(players).length;
    if (playerCount >= 10) {
      showToast('房间人数已满');
      return;
    }
    
    const playerId = Date.now() + '';
    
    players[playerId] = {
      id: playerId,
      nickname: nickname,
      isHost: false,
      joinedAt: Date.now(),
    };
    
    existingObj.set('players', players);
    existingObj.save().then((savedObj) => {
      room.id = roomId;
      room.gameType = savedObj.get('gameType');
      room.isHost = false;
      room.myPlayerId = playerId;
      room.myNickname = nickname;
      room.dbRef = savedObj;
      
      closeModal('join-room-modal');
      listenToRoom();
      enterLobby();
      
      const newUrl = window.location.origin + window.location.pathname + '?room=' + roomId;
      window.history.replaceState({ roomId: roomId }, '', newUrl);
    });
  }).catch(err => {
    console.error('加入房间失败:', err);
    showToast('加入房间失败，请检查网络');
  });
}

function listenToRoom() {
  // 先取消旧的 LiveQuery 订阅
  if (room.liveQuery) {
    try {
      room.liveQuery.unsubscribe();
    } catch (e) {
      console.log('取消旧订阅失败:', e);
    }
    room.liveQuery = null;
  }
  
  if (!room.dbRef || !room.dbRef.id) return;
  
  // 使用 objectId 创建 LiveQuery
  const query = new AV.Query('GameRoom');
  query.equalTo('objectId', room.dbRef.id);
  
  const liveQuery = AV.LiveQuery.init(query);
  room.liveQuery = liveQuery;
  
  liveQuery.on('create', (newObj) => {
    // 对象创建（正常情况下不会走到这里，因为房间已经存在）
    console.log('LiveQuery: create event');
  });
  
  liveQuery.on('update', (updatedObj) => {
    const gameState = updatedObj.get('gameState');
    const players = updatedObj.get('players');
    const gameData = updatedObj.get('gameData');
    const settings = updatedObj.get('settings');
    
    room.gameType = updatedObj.get('gameType');
    room.gameState = gameState;
    room.players = players ? Object.values(players).sort((a, b) => a.joinedAt - b.joinedAt) : [];
    room.data = gameData || {};
    room.settings = settings || {};
    
    // 更新 dbRef 引用，保持使用最新的对象
    room.dbRef = updatedObj;
    
    const host = room.players.find(p => p.isHost);
    room.isHost = host && host.id === room.myPlayerId;
    
    onRoomUpdate();
  });
  
  liveQuery.on('delete', () => {
    showToast('房间已解散');
    leaveRoom();
  });
  
  liveQuery.subscribe().then(() => {
    console.log('LiveQuery 订阅成功');
  }).catch(err => {
    console.error('LiveQuery 订阅失败:', err);
  });
}

function onRoomUpdate() {
  if (room.gameState === 'lobby') {
    if (app.currentPage !== 'room-lobby') {
      enterLobby();
    } else {
      renderLobby();
    }
  } else if (room.gameState === 'playing') {
    if (app.currentPage === 'room-lobby' || 
        app.currentPage.startsWith('page-mu') || 
        app.currentPage.startsWith('page-mb') || 
        app.currentPage.startsWith('page-mw')) {
      if (room.gameType === 'undercover') {
        updateUndercoverGame();
      } else if (room.gameType === 'bomb') {
        updateBombGame();
      } else if (room.gameType === 'wordguess') {
        updateWordGuessGame();
      }
    }
  } else if (room.gameState === 'result') {
    if (room.gameType === 'undercover') {
      showUCMultiResult();
    } else if (room.gameType === 'bomb') {
      showBombMultiResult();
    } else if (room.gameType === 'wordguess') {
      showWGMultiResult();
    }
  }
}

function enterLobby() {
  navTo('room-lobby');
  renderLobby();
}

function renderLobby() {
  document.getElementById('room-id-display').textContent = room.id;
  
  const gameEmojis = {
    undercover: '🕵️',
    bomb: '💣',
    wordguess: '🤔',
  };
  const gameNames = {
    undercover: '谁是卧底',
    bomb: '数字炸弹',
    wordguess: '猜词助手',
  };
  document.getElementById('lobby-game-type').textContent = 
    `${gameEmojis[room.gameType]} ${gameNames[room.gameType]}`;
  
  document.getElementById('player-count-num').textContent = room.players.length;
  
  const grid = document.getElementById('lobby-player-list');
  grid.innerHTML = room.players.map(p => `
    <div class="player-card ${p.id === room.myPlayerId ? 'me' : ''}">
      <div class="player-avatar-lg">${p.nickname.charAt(0)}</div>
      <div class="player-nickname">${p.nickname}</div>
      ${p.isHost ? '<div class="host-badge">房主</div>' : ''}
      ${p.id === room.myPlayerId ? '<div class="me-badge">我</div>' : ''}
    </div>
  `).join('');
  
  const startBtn = document.getElementById('start-game-btn');
  const waitingBtn = document.getElementById('waiting-btn');
  
  if (room.isHost) {
    startBtn.style.display = 'block';
    waitingBtn.style.display = 'none';
    startBtn.style.opacity = room.players.length < 3 ? '0.5' : '1';
    startBtn.style.pointerEvents = room.players.length < 3 ? 'none' : 'auto';
  } else {
    startBtn.style.display = 'none';
    waitingBtn.style.display = 'block';
  }
  
  const settingsSection = document.getElementById('room-settings-section');
  if (room.isHost) {
    settingsSection.innerHTML = `
      <h4>游戏设置</h4>
      <div class="setup-section">
        <h4 style="font-size:12px">词库分类</h4>
        <div class="chip-group" id="room-category">
          <span class="chip ${room.settings.category === 'all' ? 'active' : ''}" data-val="all" onclick="changeSetting('category', 'all')">综合</span>
          <span class="chip ${room.settings.category === 'food' ? 'active' : ''}" data-val="food" onclick="changeSetting('category', 'food')">食物</span>
          <span class="chip ${room.settings.category === 'star' ? 'active' : ''}" data-val="star" onclick="changeSetting('category', 'star')">明星</span>
          <span class="chip ${room.settings.category === 'daily' ? 'active' : ''}" data-val="daily" onclick="changeSetting('category', 'daily')">日常</span>
          <span class="chip ${room.settings.category === 'idiom' ? 'active' : ''}" data-val="idiom" onclick="changeSetting('category', 'idiom')">成语</span>
        </div>
      </div>
    `;
  } else {
    settingsSection.innerHTML = '';
  }
}

function changeSetting(key, value) {
  if (!room.isHost || !room.dbRef) return;
  const settings = { ...(room.settings || {}) };
  settings[key] = value;
  room.dbRef.set('settings', settings);
  room.dbRef.save().catch(err => {
    console.error('更新设置失败:', err);
  });
}

function copyRoomLink() {
  const link = window.location.origin + window.location.pathname + '?room=' + room.id;
  
  if (navigator.clipboard) {
    navigator.clipboard.writeText(link).then(() => {
      showToast('链接已复制，快分享给朋友吧！');
    }).catch(() => {
      prompt('复制以下链接分享给朋友：', link);
    });
  } else {
    prompt('复制以下链接分享给朋友：', link);
  }
}

function startRoomGame() {
  if (!room.isHost) return;
  if (room.players.length < 3) {
    showToast('至少需要3人才能开始游戏');
    return;
  }
  
  if (room.gameType === 'undercover') {
    startUndercoverGame();
  } else if (room.gameType === 'bomb') {
    startBombGame();
  } else if (room.gameType === 'wordguess') {
    startWordGuessGame();
  }
}

function leaveRoom() {
  if (room.dbRef && room.myPlayerId) {
    const players = room.dbRef.get('players') || {};
    delete players[room.myPlayerId];
    
    const playerCount = Object.keys(players).length;
    
    if (playerCount <= 0) {
      // 房间无人，销毁
      room.dbRef.destroy().catch(() => {});
    } else {
      // 如果我是房主且还有人，转移房主
      if (room.isHost) {
        const remainingIds = Object.keys(players);
        if (remainingIds.length > 0) {
          const newHostId = remainingIds[0];
          players[newHostId].isHost = true;
        }
      }
      
      room.dbRef.set('players', players);
      room.dbRef.save().catch(() => {});
    }
  }
  
  // 取消 LiveQuery 订阅
  if (room.liveQuery) {
    try {
      room.liveQuery.unsubscribe();
    } catch (e) {
      // ignore
    }
  }
  
  room.id = null;
  room.myPlayerId = null;
  room.dbRef = null;
  room.liveQuery = null;
  room.listener = null;
  room.players = [];
  room.data = {};
  room.settings = {};
  room.gameState = 'lobby';
  
  navTo('home');
  window.history.replaceState({}, '', window.location.pathname);
}

function backToLobby() {
  if (!room.dbRef) return;
  // 批量更新：设置 gameState 和清空 gameData
  room.dbRef.set('gameState', 'lobby');
  room.dbRef.set('gameData', {});
  room.dbRef.save().catch(err => {
    console.error('返回大厅失败:', err);
  });
}

function confirmLeaveGame() {
  showModal('确认退出', '确定要退出游戏吗？', () => {
    leaveRoom();
  });
}

// ==================== 谁是卧底 - 联机版 ====================

function startUndercoverGame() {
  const pairs = getUndercoverPairs(room.settings.category || 'all');
  const shuffledPairs = shuffleArray(pairs);
  const wordPair = shuffledPairs[0];
  
  let civilianWord, undercoverWord;
  if (Math.random() > 0.5) {
    civilianWord = wordPair[0];
    undercoverWord = wordPair[1];
  } else {
    civilianWord = wordPair[1];
    undercoverWord = wordPair[0];
  }
  
  const playerCount = room.players.length;
  let undercoverCount;
  if (playerCount <= 5) undercoverCount = 1;
  else if (playerCount <= 8) undercoverCount = 2;
  else undercoverCount = 3;
  
  const shuffledPlayers = shuffleArray([...room.players]);
  const undercoverIds = shuffledPlayers.slice(0, undercoverCount).map(p => p.id);
  
  const gameData = {
    civilianWord: civilianWord,
    undercoverWord: undercoverWord,
    undercoverIds: undercoverIds,
    round: 1,
    currentSpeakerIndex: 0,
    phase: 'describe', // describe, vote
    alivePlayerIds: room.players.map(p => p.id),
    votes: {},
  };
  
  room.dbRef.set('gameData', gameData);
  room.dbRef.set('gameState', 'playing');
  room.dbRef.save().catch(err => {
    console.error('开始卧底游戏失败:', err);
  });
}

function updateUndercoverGame() {
  const data = room.data;
  if (!data) return;
  
  if (data.phase === 'describe' || data.phase === 'vote') {
    if (app.currentPage !== 'multi-undercover') {
      navTo('multi-undercover');
    }
    renderUndercoverGame();
  }
}

function renderUndercoverGame() {
  const data = room.data;
  const myPlayer = room.players.find(p => p.id === room.myPlayerId);
  const isUndercover = data.undercoverIds && data.undercoverIds.includes(room.myPlayerId);
  
  document.getElementById('mu-round').textContent = data.round || 1;
  document.getElementById('mu-alive').textContent = (data.alivePlayerIds || []).length;
  
  const myWord = isUndercover ? data.undercoverWord : data.civilianWord;
  document.getElementById('mu-my-word').textContent = myWord;
  
  const alivePlayers = room.players.filter(p => data.alivePlayerIds && data.alivePlayerIds.includes(p.id));
  const speakerIndex = data.currentSpeakerIndex || 0;
  const currentSpeaker = alivePlayers[speakerIndex];
  
  document.getElementById('mu-current-speaker').textContent = 
    currentSpeaker ? currentSpeaker.nickname : '未知';
  
  const phaseTitle = document.querySelector('#mu-phase-info .phase-title');
  const phaseDesc = document.querySelector('#mu-phase-info .phase-desc');
  if (data.phase === 'describe') {
    phaseTitle.textContent = '描述阶段';
  } else if (data.phase === 'vote') {
    phaseTitle.textContent = '投票阶段';
  }
  
  const list = document.getElementById('mu-player-list');
  list.innerHTML = alivePlayers.map(p => `
    <div class="mu-player-item ${p.id === room.myPlayerId ? 'me' : ''}">
      <div class="mu-player-avatar">${p.nickname.charAt(0)}</div>
      <span class="mu-player-name">${p.nickname}</span>
      ${p.id === (currentSpeaker && currentSpeaker.id) ? '<span class="speaking-badge">发言中</span>' : ''}
      ${p.id === room.myPlayerId ? '<span class="me-small">我</span>' : ''}
    </div>
  `).join('');
  
  const nextBtn = document.getElementById('mu-next-btn');
  const voteBtn = document.getElementById('mu-vote-btn');
  
  if (room.isHost) {
    if (data.phase === 'describe') {
      nextBtn.style.display = 'block';
      voteBtn.style.display = speakerIndex >= alivePlayers.length - 1 ? 'block' : 'none';
      nextBtn.textContent = speakerIndex >= alivePlayers.length - 1 ? '最后一位' : '下一位发言';
      nextBtn.style.opacity = speakerIndex >= alivePlayers.length - 1 ? '0.5' : '1';
      nextBtn.style.pointerEvents = speakerIndex >= alivePlayers.length - 1 ? 'none' : 'auto';
    } else {
      nextBtn.style.display = 'none';
      voteBtn.style.display = 'none';
    }
  } else {
    nextBtn.style.display = 'none';
    voteBtn.style.display = 'none';
  }
}

function muNextSpeaker() {
  if (!room.isHost || !room.dbRef) return;
  
  const data = room.data;
  const alivePlayers = room.players.filter(p => data.alivePlayerIds && data.alivePlayerIds.includes(p.id));
  const nextIndex = (data.currentSpeakerIndex || 0) + 1;
  
  if (nextIndex < alivePlayers.length) {
    const gameData = { ...data };
    gameData.currentSpeakerIndex = nextIndex;
    room.dbRef.set('gameData', gameData);
    room.dbRef.save().catch(err => {
      console.error('切换发言者失败:', err);
    });
  }
}

function muGoToVote() {
  if (!room.isHost || !room.dbRef) return;
  const gameData = { ...(room.data || {}) };
  gameData.phase = 'vote';
  gameData.votes = {};
  room.dbRef.set('gameData', gameData);
  room.dbRef.save().then(() => {
    navTo('mu-vote');
    renderMuVoteList();
  }).catch(err => {
    console.error('进入投票阶段失败:', err);
  });
}

function renderMuVoteList() {
  const data = room.data;
  const alivePlayers = room.players.filter(p => data.alivePlayerIds && data.alivePlayerIds.includes(p.id));
  
  const myVote = data.votes && data.votes[room.myPlayerId];
  
  const list = document.getElementById('mu-vote-list');
  list.innerHTML = alivePlayers.map(p => `
    <div class="player-item ${myVote === p.id ? ' selected' : ''}" onclick="muVoteFor('${p.id}')">
      <div class="player-avatar">${p.nickname.charAt(0)}</div>
      <span class="player-name">${p.nickname}</span>
      <span class="player-status">${myVote === p.id ? '已选' : '选择'}</span>
    </div>
  `).join('');
  
  const submitBtn = document.getElementById('mu-submit-vote');
  const votedCount = data.votes ? Object.keys(data.votes).length : 0;
  const totalAlive = alivePlayers.length;
  
  if (room.isHost) {
    submitBtn.textContent = votedCount >= totalAlive ? `公布结果 (${votedCount}/${totalAlive}人已投)` : `等待投票 (${votedCount}/${totalAlive}人已投)`;
    submitBtn.style.opacity = votedCount >= totalAlive ? '1' : '0.7';
    submitBtn.style.pointerEvents = votedCount >= totalAlive ? 'auto' : 'none';
  } else {
    submitBtn.textContent = myVote ? '已投票，等待其他人' : '请先选择投票对象';
    submitBtn.style.opacity = '0.7';
    submitBtn.style.pointerEvents = 'none';
  }
}

function muVoteFor(playerId) {
  if (!room.dbRef) return;
  const gameData = { ...(room.data || {}) };
  if (!gameData.votes) gameData.votes = {};
  gameData.votes[room.myPlayerId] = playerId;
  room.dbRef.set('gameData', gameData);
  room.dbRef.save().catch(err => {
    console.error('投票失败:', err);
  });
  renderMuVoteList();
}

function muSubmitVote() {
  if (!room.isHost || !room.dbRef) return;
  
  const data = room.data;
  const votes = data.votes || {};
  
  const voteCounts = {};
  for (let voterId in votes) {
    const targetId = votes[voterId];
    voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
  }
  
  let maxVotes = 0;
  let eliminatedId = null;
  for (let playerId in voteCounts) {
    if (voteCounts[playerId] > maxVotes) {
      maxVotes = voteCounts[playerId];
      eliminatedId = playerId;
    }
  }
  
  if (!eliminatedId) {
    showToast('投票无效');
    return;
  }
  
  const newAlive = (data.alivePlayerIds || []).filter(id => id !== eliminatedId);
  const isUndercover = data.undercoverIds.includes(eliminatedId);
  
  const aliveUndercover = data.undercoverIds.filter(id => newAlive.includes(id));
  const aliveCivilians = newAlive.filter(id => !data.undercoverIds.includes(id));
  
  let gameOver = false;
  let result = '';
  
  if (isUndercover && aliveUndercover.length === 0) {
    gameOver = true;
    result = 'civilian_win';
  } else if (!isUndercover && aliveCivilians.length <= aliveUndercover.length) {
    gameOver = true;
    result = 'undercover_win';
  }
  
  const gameData = { ...data };
  
  if (gameOver) {
    gameData.eliminatedId = eliminatedId;
    gameData.result = result;
    room.dbRef.set('gameData', gameData);
    room.dbRef.set('gameState', 'result');
  } else {
    gameData.alivePlayerIds = newAlive;
    gameData.round = (data.round || 1) + 1;
    gameData.currentSpeakerIndex = 0;
    gameData.phase = 'describe';
    gameData.votes = {};
    room.dbRef.set('gameData', gameData);
  }
  
  room.dbRef.save().catch(err => {
    console.error('提交投票结果失败:', err);
  });
}

function showUCMultiResult() {
  const data = room.data;
  const eliminated = room.players.find(p => p.id === data.eliminatedId);
  
  const isEliminatedUndercover = data.undercoverIds.includes(data.eliminatedId);
  
  document.getElementById('mu-eliminated').textContent = eliminated ? eliminated.nickname : '-';
  document.getElementById('mu-identity').textContent = isEliminatedUndercover ? '卧底' : '平民';
  document.getElementById('mu-civilian-word').textContent = data.civilianWord;
  document.getElementById('mu-undercover-word').textContent = data.undercoverWord;
  
  if (data.result === 'civilian_win') {
    document.getElementById('mu-result-title').textContent = '平民胜利！';
    document.getElementById('mu-result-desc').textContent = '所有卧底都被找出了';
    document.getElementById('mu-result-icon').textContent = '🎉';
  } else if (data.result === 'undercover_win') {
    document.getElementById('mu-result-title').textContent = '卧底胜利！';
    document.getElementById('mu-result-desc').textContent = '卧底成功隐藏到了最后';
    document.getElementById('mu-result-icon').textContent = '😎';
  }
  
  navTo('mu-result');
  
  const restartBtn = document.getElementById('mu-restart-btn');
  if (room.isHost) {
    restartBtn.style.display = 'block';
  } else {
    restartBtn.style.display = 'none';
  }
}

function muRestart() {
  if (!room.isHost) return;
  startUndercoverGame();
}

// ==================== 数字炸弹 - 联机版 ====================

function startBombGame() {
  const minNum = 1;
  const maxNum = 100;
  const bombNum = Math.floor(Math.random() * (maxNum - minNum - 1)) + minNum + 1;
  
  const gameData = {
    minNum: minNum,
    maxNum: maxNum,
    bombNum: bombNum,
    currentMin: minNum,
    currentMax: maxNum,
    currentPlayerIndex: 0,
    guessCount: 0,
    history: [],
  };
  
  room.dbRef.set('gameData', gameData);
  room.dbRef.set('gameState', 'playing');
  room.dbRef.save().catch(err => {
    console.error('开始数字炸弹失败:', err);
  });
}

function updateBombGame() {
  if (app.currentPage !== 'multi-bomb') {
    navTo('multi-bomb');
  }
  renderBombGame();
}

function renderBombGame() {
  const data = room.data;
  const currentPlayer = room.players[data.currentPlayerIndex || 0];
  const isMyTurn = currentPlayer && currentPlayer.id === room.myPlayerId;
  
  document.getElementById('mb-current-player').textContent = 
    currentPlayer ? currentPlayer.nickname : '未知';
  document.getElementById('mb-range-display').textContent = 
    `${data.currentMin} ~ ${data.currentMax}`;
  
  const inputSection = document.getElementById('mb-input-section');
  const waiting = document.getElementById('mb-waiting');
  
  if (isMyTurn) {
    inputSection.style.display = 'flex';
    waiting.style.display = 'none';
  } else {
    inputSection.style.display = 'none';
    waiting.style.display = 'block';
  }
  
  const historyList = document.getElementById('mb-history-list');
  const history = data.history || [];
  historyList.innerHTML = history.slice().reverse().map(item => {
    const player = room.players.find(p => p.id === item.playerId);
    return `<div class="history-item">
      <span class="dot-accent"></span>${player ? player.nickname : '玩家'}猜了 ${item.num} → 范围 ${item.newMin}~${item.newMax}
    </div>`;
  }).join('');
}

function mbGuess() {
  if (!room.dbRef) return;
  
  const data = room.data;
  const currentPlayer = room.players[data.currentPlayerIndex || 0];
  if (!currentPlayer || currentPlayer.id !== room.myPlayerId) {
    showToast('还没轮到你');
    return;
  }
  
  const input = document.getElementById('mb-input');
  const num = parseInt(input.value);
  
  if (isNaN(num) || num < data.currentMin || num > data.currentMax) {
    showToast(`请输入 ${data.currentMin} ~ ${data.currentMax} 之间的数字`);
    return;
  }
  
  vibrate(30);
  
  const gameData = { ...data };
  
  if (num === data.bombNum) {
    gameData.history = [...(data.history || []), {
      playerId: room.myPlayerId,
      num: num,
      newMin: data.currentMin,
      newMax: data.currentMax,
    }];
    gameData.guessCount = (data.guessCount || 0) + 1;
    gameData.loserId = room.myPlayerId;
    
    room.dbRef.set('gameData', gameData);
    room.dbRef.set('gameState', 'result');
    room.dbRef.save().catch(err => {
      console.error('更新失败:', err);
    });
    return;
  }
  
  let newMin = data.currentMin;
  let newMax = data.currentMax;
  
  if (num < data.bombNum) {
    newMin = num + 1;
  } else {
    newMax = num - 1;
  }
  
  gameData.history = [...(data.history || []), {
    playerId: room.myPlayerId,
    num: num,
    newMin: newMin,
    newMax: newMax,
  }];
  gameData.currentMin = newMin;
  gameData.currentMax = newMax;
  gameData.currentPlayerIndex = (data.currentPlayerIndex + 1) % room.players.length;
  gameData.guessCount = (data.guessCount || 0) + 1;
  
  room.dbRef.set('gameData', gameData);
  room.dbRef.save().catch(err => {
    console.error('猜测失败:', err);
  });
  
  input.value = '';
}

function showBombMultiResult() {
  const data = room.data;
  const loser = room.players.find(p => p.id === data.loserId);
  
  document.getElementById('mb-loser').textContent = loser ? loser.nickname : '-';
  document.getElementById('mb-answer').textContent = data.bombNum;
  document.getElementById('mb-guess-count').textContent = data.guessCount || 0;
  
  navTo('mb-explode');
  
  vibrate([100, 50, 100, 50, 200]);
  
  const restartBtn = document.getElementById('mb-restart-btn');
  if (room.isHost) {
    restartBtn.style.display = 'block';
  } else {
    restartBtn.style.display = 'none';
  }
}

function mbRestart() {
  if (!room.isHost) return;
  startBombGame();
}

// ==================== 猜词助手 - 联机版 ====================

function startWordGuessGame() {
  const allWords = getWordGuessWords(room.settings.category || 'all');
  const shuffledWords = shuffleArray(allWords).slice(0, 50);
  
  const gameData = {
    words: shuffledWords,
    currentWordIndex: 0,
    correct: 0,
    skip: 0,
    duration: room.settings.duration || 60,
    timeLeft: room.settings.duration || 60,
    mode: room.settings.mode || 'gesture',
    phase: 'ready', // ready, playing, finished
    startTime: null,
  };
  
  room.dbRef.set('gameData', gameData);
  room.dbRef.set('gameState', 'playing');
  room.dbRef.save().catch(err => {
    console.error('开始猜词游戏失败:', err);
  });
}

function updateWordGuessGame() {
  if (app.currentPage !== 'multi-wordguess') {
    navTo('multi-wordguess');
  }
  renderWordGuessGame();
}

let mwLocalTimer = null;

function renderWordGuessGame() {
  const data = room.data;
  const words = data.words || [];
  const currentIndex = data.currentWordIndex || 0;
  const currentWord = words[currentIndex] || '准备开始';
  
  const categoryNames = {
    all: '综合',
    food: '食物',
    star: '明星',
    daily: '日常',
    idiom: '成语',
    animal: '动物',
    movie: '影视',
  };
  
  const modeNames = {
    verbal: '口头描述',
    gesture: '你比我猜',
    draw: '你画我猜',
  };
  
  document.getElementById('mw-category').textContent = categoryNames[room.settings.category] || '综合';
  document.getElementById('mw-current-word').textContent = currentWord;
  document.getElementById('mw-mode-tip').textContent = modeNames[data.mode] || '';
  document.getElementById('mw-word-num').textContent = currentIndex + 1;
  document.getElementById('mw-score').textContent = data.correct || 0;
  
  const timeLeft = data.timeLeft || 0;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  document.getElementById('mw-timer').textContent = 
    `⏱ ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  const timerEl = document.getElementById('mw-timer');
  if (timeLeft <= 10) {
    timerEl.classList.add('warning');
  } else {
    timerEl.classList.remove('warning');
  }
  
  const actions = document.getElementById('mw-actions');
  const waiting = document.getElementById('mw-waiting');
  
  if (room.isHost) {
    actions.style.display = 'flex';
    waiting.style.display = 'none';
  } else {
    actions.style.display = 'none';
    waiting.style.display = 'block';
  }
  
  const teamTurn = document.getElementById('mw-team-turn');
  if (data.phase === 'ready') {
    teamTurn.textContent = data.startTime ? '游戏即将开始...' : '等待房主开始';
  } else if (data.phase === 'playing') {
    teamTurn.textContent = '游戏进行中，加油！';
  }
}

function mwCorrect() {
  if (!room.isHost || !room.dbRef) return;
  const data = room.data;
  const nextIndex = (data.currentWordIndex || 0) + 1;
  const words = data.words || [];
  
  const gameData = { ...data };
  gameData.correct = (data.correct || 0) + 1;
  
  if (nextIndex >= words.length) {
    gameData.phase = 'finished';
    room.dbRef.set('gameData', gameData);
    room.dbRef.set('gameState', 'result');
  } else {
    gameData.currentWordIndex = nextIndex;
    room.dbRef.set('gameData', gameData);
  }
  
  room.dbRef.save().catch(err => {
    console.error('操作失败:', err);
  });
  
  vibrate(30);
}

function mwSkip() {
  if (!room.isHost || !room.dbRef) return;
  const data = room.data;
  const nextIndex = (data.currentWordIndex || 0) + 1;
  const words = data.words || [];
  
  const gameData = { ...data };
  gameData.skip = (data.skip || 0) + 1;
  
  if (nextIndex >= words.length) {
    gameData.phase = 'finished';
    room.dbRef.set('gameData', gameData);
    room.dbRef.set('gameState', 'result');
  } else {
    gameData.currentWordIndex = nextIndex;
    room.dbRef.set('gameData', gameData);
  }
  
  room.dbRef.save().catch(err => {
    console.error('操作失败:', err);
  });
  
  vibrate(20);
}

function showWGMultiResult() {
  const data = room.data;
  const correct = data.correct || 0;
  const skip = data.skip || 0;
  
  document.getElementById('mw-final-score').textContent = correct;
  document.getElementById('mw-final-correct').textContent = correct;
  document.getElementById('mw-final-skip').textContent = skip;
  document.getElementById('mw-final-total').textContent = correct + skip;
  
  navTo('mw-result');
  
  const restartBtn = document.getElementById('mw-restart-btn');
  if (room.isHost) {
    restartBtn.style.display = 'block';
  } else {
    restartBtn.style.display = 'none';
  }
}

function mwRestart() {
  if (!room.isHost) return;
  startWordGuessGame();
}

// ==================== 自动加入房间（通过URL） ====================

function checkAutoJoin() {
  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get('room');
  
  if (roomId && leancloudAvailable) {
    document.getElementById('join-room-id').value = roomId;
    showJoinRoom();
  }
}
