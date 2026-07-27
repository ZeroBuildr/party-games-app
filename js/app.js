// 派对游戏盒 - 主应用逻辑

const app = {
  currentPage: 'home',
  currentTab: 'home',
  settings: {
    sound: true,
    vibrate: true,
    wakelock: true,
    describeTime: 30,
  },
  stats: [],
  statsFilter: 'all',
};

// ==================== 页面导航 ====================
function navTo(pageName) {
  // 清理计时器：离开谁是卧底描述阶段时
  if (app.currentPage === 'undercover-describe' && pageName !== 'undercover-describe') {
    if (typeof uc !== 'undefined' && uc.describeTimer) {
      clearInterval(uc.describeTimer);
      uc.describeTimer = null;
    }
  }
  // 清理猜词助手计时器
  if (app.currentPage === 'wordguess-play' && pageName !== 'wordguess-play') {
    if (typeof wg !== 'undefined' && wg.timer) {
      clearInterval(wg.timer);
      wg.timer = null;
    }
  }

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById('page-' + pageName);
  if (page) {
    page.classList.add('active');
    app.currentPage = pageName;
  }

  if (pageName === 'home' || pageName === 'stats' || pageName === 'settings') {
    updateNav(pageName);
  }

  if (page) {
    page.scrollTop = 0;
  }
}

function updateNav(tab) {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.dataset.page === tab) {
      item.classList.add('active');
    }
  });
  app.currentTab = tab;
  
  if (tab === 'stats') {
    renderStats();
  }
}

function switchTab(tab) {
  navTo(tab);
}

// ==================== 工具函数 ====================
function showToast(msg, duration = 2000) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.style.display = 'block';
  setTimeout(() => {
    toast.style.display = 'none';
  }, duration);
}

function vibrate(ms = 50) {
  if (app.settings.vibrate && navigator.vibrate) {
    navigator.vibrate(ms);
  }
}

// ==================== 通用弹窗 ====================
let modalCallback = null;

function showConfirmModal(title, message, callback) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-message').textContent = message;
  document.getElementById('confirm-modal').style.display = 'flex';
  modalCallback = callback;
}

function closeConfirmModal() {
  document.getElementById('confirm-modal').style.display = 'none';
  modalCallback = null;
}

function confirmModal() {
  if (modalCallback) {
    modalCallback();
  }
  closeConfirmModal();
}

// 兼容旧版
function showModal(id) {
  if (typeof id === 'string' && document.getElementById(id)) {
    document.getElementById(id).style.display = 'flex';
  } else if (typeof id === 'string') {
    showConfirmModal(id, arguments[1], arguments[2]);
  }
}

function closeModal(id) {
  if (typeof id === 'string' && document.getElementById(id)) {
    document.getElementById(id).style.display = 'none';
  }
}

// ==================== Chip选择器 ====================
function initChipGroups() {
  document.querySelectorAll('.chip-group').forEach(group => {
    group.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const groupId = group.id;
        
        if (groupId === 'uc-player-count') {
          group.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          if (typeof uc !== 'undefined') {
            uc.playerCount = parseInt(chip.dataset.val);
            if (typeof updateUCRuleText === 'function') {
              updateUCRuleText();
            }
          }
        } else if (groupId === 'uc-category') {
          group.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          if (typeof uc !== 'undefined') {
            uc.category = chip.dataset.val;
          }
        } else if (groupId === 'bomb-range') {
          group.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          if (typeof bomb !== 'undefined') {
            const val = chip.dataset.val;
            if (val === 'custom') {
              const el = document.getElementById('bomb-custom-range');
              if (el) el.style.display = 'block';
            } else {
              const el = document.getElementById('bomb-custom-range');
              if (el) el.style.display = 'none';
              bomb.maxNum = parseInt(val);
              bomb.minNum = 1;
            }
          }
        } else if (groupId === 'bomb-players') {
          group.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          if (typeof bomb !== 'undefined') {
            bomb.playerCount = parseInt(chip.dataset.val);
          }
        } else if (groupId === 'wg-duration') {
          group.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          if (typeof wg !== 'undefined') {
            wg.duration = parseInt(chip.dataset.val);
          }
        } else if (groupId === 'wg-category') {
          group.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          if (typeof wg !== 'undefined') {
            wg.category = chip.dataset.val;
          }
        }
      });
    });
  });
  
  document.querySelectorAll('.mode-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      if (typeof wg !== 'undefined') {
        wg.mode = card.dataset.val;
      }
    });
  });
  
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      app.statsFilter = chip.dataset.filter;
      renderStats();
    });
  });
}

// ==================== 战绩记录 ====================
function saveStat(gameType, data) {
  const record = {
    id: Date.now(),
    game: gameType,
    date: new Date().toISOString(),
    ...data,
  };
  
  app.stats.unshift(record);
  if (app.stats.length > 100) {
    app.stats = app.stats.slice(0, 100);
  }
  
  saveToStorage();
}

function renderStats() {
  const list = document.getElementById('stats-list');
  if (!list) return;
  
  const total = app.stats.length;
  const ucCount = app.stats.filter(s => s.game === 'undercover').length;
  const bombCount = app.stats.filter(s => s.game === 'bomb').length;
  const wgCount = app.stats.filter(s => s.game === 'wordguess').length;
  
  const totalEl = document.getElementById('stats-total');
  const ucEl = document.getElementById('stats-uc');
  const bombEl = document.getElementById('stats-bomb');
  const wgEl = document.getElementById('stats-wg');
  
  if (totalEl) totalEl.textContent = total;
  if (ucEl) ucEl.textContent = ucCount;
  if (bombEl) bombEl.textContent = bombCount;
  if (wgEl) wgEl.textContent = wgCount;
  
  let filtered = app.stats;
  if (app.statsFilter !== 'all') {
    filtered = app.stats.filter(s => s.game === app.statsFilter);
  }
  
  if (filtered.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📊</div>
        <p>还没有游戏记录</p>
        <p class="empty-sub">快去玩一局吧！</p>
      </div>
    `;
    return;
  }
  
  const gameNames = {
    undercover: '🕵️ 谁是卧底',
    bomb: '💣 数字炸弹',
    wordguess: '🤔 猜词助手',
  };
  
  list.innerHTML = filtered.map(record => {
    const date = new Date(record.date);
    const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    
    let detail = '';
    if (record.game === 'undercover') {
      detail = `${record.players}人 · ${record.round}轮 · ${record.result}`;
    } else if (record.game === 'bomb') {
      detail = `${record.players}人 · 猜了${record.guessCount}次 · ${record.result}`;
    } else if (record.game === 'wordguess') {
      detail = `猜中${record.correct}个 · 跳过${record.skip}个 · ${record.duration}秒`;
    }
    
    return `
      <div class="stat-record">
        <div class="stat-record-header">
          <span class="stat-record-game">${gameNames[record.game]}</span>
          <span class="stat-record-date">${dateStr}</span>
        </div>
        <div class="stat-record-detail">${detail}</div>
      </div>
    `;
  }).join('');
}

function clearStats() {
  showConfirmModal('清除记录', '确定要清除所有战绩记录吗？此操作不可恢复。', () => {
    app.stats = [];
    saveToStorage();
    renderStats();
    showToast('战绩记录已清除');
  });
}

// ==================== 设置 ====================
function saveSettings() {
  const soundEl = document.getElementById('set-sound');
  const vibrateEl = document.getElementById('set-vibrate');
  const wakelockEl = document.getElementById('set-wakelock');
  const describeEl = document.getElementById('set-describe-time');
  
  if (soundEl) app.settings.sound = soundEl.checked;
  if (vibrateEl) app.settings.vibrate = vibrateEl.checked;
  if (wakelockEl) app.settings.wakelock = wakelockEl.checked;
  if (describeEl) app.settings.describeTime = parseInt(describeEl.value);
  
  saveToStorage();
  
  if (app.settings.wakelock) {
    requestWakeLock();
  }
}

function loadSettings() {
  const soundEl = document.getElementById('set-sound');
  const vibrateEl = document.getElementById('set-vibrate');
  const wakelockEl = document.getElementById('set-wakelock');
  const describeEl = document.getElementById('set-describe-time');
  
  if (soundEl) soundEl.checked = app.settings.sound;
  if (vibrateEl) vibrateEl.checked = app.settings.vibrate;
  if (wakelockEl) wakelockEl.checked = app.settings.wakelock;
  if (describeEl) describeEl.value = app.settings.describeTime;
  
  const wordbankInfo = document.getElementById('set-wordbank-info');
  if (wordbankInfo && typeof getTotalWordCount === 'function') {
    const totalWords = getTotalWordCount();
    wordbankInfo.textContent = `${totalWords}+ 词汇`;
  }
}

let wakeLock = null;

async function requestWakeLock() {
  if (!app.settings.wakelock) return;
  
  try {
    if ('wakeLock' in navigator) {
      wakeLock = await navigator.wakeLock.request('screen');
    }
  } catch (err) {
    console.log('Wake Lock not available:', err);
  }
}

// ==================== 本地存储 ====================
function saveToStorage() {
  try {
    localStorage.setItem('partygame_settings', JSON.stringify(app.settings));
    localStorage.setItem('partygame_stats', JSON.stringify(app.stats));
  } catch (e) {
    console.log('Storage save failed:', e);
  }
}

function loadFromStorage() {
  try {
    const settings = localStorage.getItem('partygame_settings');
    if (settings) {
      app.settings = { ...app.settings, ...JSON.parse(settings) };
    }
    
    const stats = localStorage.getItem('partygame_stats');
    if (stats) {
      app.stats = JSON.parse(stats);
    }
  } catch (e) {
    console.log('Storage load failed:', e);
  }
}

// ==================== 初始化 ====================
function init() {
  loadFromStorage();
  initChipGroups();
  loadSettings();
  
  if (typeof updateWordbankInfo === 'function') {
    updateWordbankInfo();
  }
  
  requestWakeLock();
  
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && app.settings.wakelock) {
      requestWakeLock();
    }
  });
  
  document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      if (app.currentPage === 'bomb-play' && typeof guessBomb === 'function') {
        guessBomb();
      }
    }
  });
}

function updateWordbankInfo() {
  const infoEl = document.querySelector('.wordbank-info span');
  if (infoEl && typeof getTotalWordCount === 'function') {
    const totalWords = getTotalWordCount();
    infoEl.textContent = `已收录 ${totalWords}+ 词汇 · 持续更新中`;
  }
}

document.addEventListener('DOMContentLoaded', init);
