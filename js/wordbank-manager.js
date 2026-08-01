// 词库管理逻辑

let wbManager = {
  game: 'undercover',
  category: 'food',
};

const wbGameCategoryNames = {
  quotebattle: { movie: '电影', skit: '小品', tv: '电视剧', anime: '动漫' },
  sceneguess: { movie: '电影', skit: '小品', tv: '电视剧', anime: '动漫' },
  emojiguess: { movie: '电影', skit: '小品', tv: '电视剧', anime: '动漫' },
};

function getWbCategoryName(cat) {
  if (wbManager.game === 'quotebattle' || wbManager.game === 'sceneguess' || wbManager.game === 'emojiguess') {
    return (wbGameCategoryNames[wbManager.game] && wbGameCategoryNames[wbManager.game][cat]) || cat;
  }
  const names = getCategoryNames();
  return names[cat] || cat;
}

// 获取新游戏的 localStorage 自定义数据
function getCustomNewGame(game) {
  try {
    const key = { quotebattle: 'partygame_custom_qb', sceneguess: 'partygame_custom_sg', emojiguess: 'partygame_custom_eg' }[game];
    return JSON.parse(localStorage.getItem(key) || '{}');
  } catch (e) { return {}; }
}

function saveCustomNewGame(game, data) {
  const key = { quotebattle: 'partygame_custom_qb', sceneguess: 'partygame_custom_sg', emojiguess: 'partygame_custom_eg' }[game];
  localStorage.setItem(key, JSON.stringify(data));
}

function getNewGameData(game) {
  if (game === 'quotebattle') return typeof quoteBattleData !== 'undefined' ? quoteBattleData : {};
  if (game === 'sceneguess') return typeof sceneGuessData !== 'undefined' ? sceneGuessData : {};
  if (game === 'emojiguess') return typeof emojiGuessData !== 'undefined' ? emojiGuessData : {};
  return {};
}

// 初始化词库管理页
function initWordbankManager() {
  wbManager.game = 'undercover';
  wbManager.category = 'food';
  document.querySelectorAll('.wb-game-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.game === 'undercover');
  });
  renderWbCategories();
  renderWbWords();
  renderAddInputs();
}

// 切换游戏
function switchWbGame(game) {
  wbManager.game = game;
  const cats = getWbCategories();
  wbManager.category = cats[0];
  document.querySelectorAll('.wb-game-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.game === game);
  });
  renderWbCategories();
  renderWbWords();
  renderAddInputs();
}

// 获取当前游戏的所有分类
function getWbCategories() {
  if (wbManager.game === 'undercover') {
    let cats = Object.keys(undercoverWordPairs);
    const custom = getCustomUC();
    for (let cat in custom) {
      if (!cats.includes(cat)) cats.push(cat);
    }
    return cats;
  } else if (wbManager.game === 'wordguess') {
    let cats = Object.keys(wordGuessWords);
    const custom = getCustomWG();
    for (let cat in custom) {
      if (!cats.includes(cat)) cats.push(cat);
    }
    return cats;
  } else {
    const data = getNewGameData(wbManager.game);
    let cats = Object.keys(data);
    const custom = getCustomNewGame(wbManager.game);
    for (let cat in custom) {
      if (!cats.includes(cat)) cats.push(cat);
    }
    return cats;
  }
}

// 渲染分类标签
function renderWbCategories() {
  const container = document.getElementById('wb-category-list');
  if (!container) return;
  const cats = getWbCategories();
  container.innerHTML = '';
  cats.forEach(cat => {
    const chip = document.createElement('span');
    chip.className = 'wb-cat-chip' + (cat === wbManager.category ? ' active' : '');
    chip.textContent = getWbCategoryName(cat);
    chip.onclick = () => {
      wbManager.category = cat;
      renderWbCategories();
      renderWbWords();
      renderAddInputs();
    };
    container.appendChild(chip);
  });
}

// 获取当前分类的词汇列表
function getWbWords() {
  const cat = wbManager.category;
  if (wbManager.game === 'undercover') {
    const builtin = undercoverWordPairs[cat] || [];
    const custom = (getCustomUC()[cat] || []);
    return [
      ...builtin.map(p => ({ words: p, isCustom: false })),
      ...custom.map(p => ({ words: p, isCustom: true })),
    ];
  } else if (wbManager.game === 'wordguess') {
    const builtin = wordGuessWords[cat] || [];
    const custom = (getCustomWG()[cat] || []);
    return [
      ...builtin.map(w => ({ words: [w], isCustom: false })),
      ...custom.map(w => ({ words: [w], isCustom: true })),
    ];
  } else {
    const data = getNewGameData(wbManager.game);
    const builtin = data[cat] || [];
    const custom = (getCustomNewGame(wbManager.game)[cat] || []);
    return [
      ...builtin.map(item => ({ item, isCustom: false })),
      ...custom.map(item => ({ item, isCustom: true })),
    ];
  }
}

// 渲染词汇列表
function renderWbWords() {
  const container = document.getElementById('wb-word-list');
  if (!container) return;
  const words = getWbWords();

  const customCount = words.filter(w => w.isCustom).length;
  const total = words.length;
  const unit = (wbManager.game === 'undercover') ? '词对' : '词条';

  let html = `<div class="wb-list-header">
    <span class="wb-list-count">共 ${total} 个${unit}${customCount > 0 ? `（自定义 ${customCount}）` : ''}</span>
  </div>`;

  if (total === 0) {
    html += `<div class="wb-empty">该分类还没有词汇，在下方添加吧</div>`;
  } else {
    html += '<div class="wb-word-grid">';
    if (wbManager.game === 'undercover' || wbManager.game === 'wordguess') {
      words.forEach((item, idx) => {
        const display = item.words.join(' / ');
        if (item.isCustom) {
          html += `<div class="wb-word-item custom">
            <span class="wb-word-text">${escapeHtml(display)}</span>
            <span class="wb-word-del" onclick="deleteCustomWord(${idx})">×</span>
          </div>`;
        } else {
          html += `<div class="wb-word-item">
            <span class="wb-word-text">${escapeHtml(display)}</span>
          </div>`;
        }
      });
    } else {
      words.forEach((item, idx) => {
        const it = item.item;
        let display = '';
        if (wbManager.game === 'quotebattle') {
          display = `${it.quote} → ${it.answer}（${it.source}）`;
        } else if (wbManager.game === 'sceneguess') {
          display = `${it.scene} → ${it.answer}（${it.source}）`;
        } else if (wbManager.game === 'emojiguess') {
          display = `${it.emoji} → ${it.answer}`;
        }
        if (item.isCustom) {
          html += `<div class="wb-word-item custom wb-word-long">
            <span class="wb-word-text">${escapeHtml(display)}</span>
            <span class="wb-word-del" onclick="deleteCustomWord(${idx})">×</span>
          </div>`;
        } else {
          html += `<div class="wb-word-item wb-word-long">
            <span class="wb-word-text">${escapeHtml(display)}</span>
          </div>`;
        }
      });
    }
    html += '</div>';
  }

  container.innerHTML = html;
}

// 渲染添加输入框
function renderAddInputs() {
  const container = document.getElementById('wb-add-inputs');
  if (!container) return;

  let html = `<div class="wb-add-hint">添加到：${getWbCategoryName(wbManager.category)}</div>`;

  if (wbManager.game === 'undercover') {
    html += `<div class="wb-input-row">
      <input type="text" id="wb-input-1" class="input-field" placeholder="平民词" maxlength="10">
      <input type="text" id="wb-input-2" class="input-field" placeholder="卧底词" maxlength="10">
    </div>`;
  } else if (wbManager.game === 'wordguess') {
    html += `<input type="text" id="wb-input-1" class="input-field wb-input-single" placeholder="输入要添加的词汇" maxlength="10">`;
  } else if (wbManager.game === 'quotebattle') {
    html += `<input type="text" id="wb-input-1" class="input-field wb-input-single" placeholder="经典台词（上半句）" maxlength="60">
    <input type="text" id="wb-input-2" class="input-field wb-input-single" placeholder="下一句台词" maxlength="60">
    <input type="text" id="wb-input-3" class="input-field wb-input-single" placeholder="出处（作品名）" maxlength="20">`;
  } else if (wbManager.game === 'sceneguess') {
    html += `<input type="text" id="wb-input-1" class="input-field wb-input-single" placeholder="场景描述" maxlength="80">
    <input type="text" id="wb-input-2" class="input-field wb-input-single" placeholder="答案（作品名）" maxlength="20">
    <input type="text" id="wb-input-3" class="input-field wb-input-single" placeholder="类型（电影/小品/电视剧/动漫）" maxlength="10">`;
  } else if (wbManager.game === 'emojiguess') {
    html += `<input type="text" id="wb-input-1" class="input-field wb-input-single" placeholder="表情符号（如 🚢❄️💔）" maxlength="30">
    <input type="text" id="wb-input-2" class="input-field wb-input-single" placeholder="答案（作品名）" maxlength="20">`;
  }

  container.innerHTML = html;
}

// 添加自定义词汇
function addCustomWord() {
  const input1 = document.getElementById('wb-input-1');
  const input2 = document.getElementById('wb-input-2');
  const input3 = document.getElementById('wb-input-3');
  const cat = wbManager.category;

  if (!input1 || !input1.value.trim()) {
    showToast('请输入内容');
    return;
  }

  if (wbManager.game === 'undercover') {
    if (!input2 || !input2.value.trim()) { showToast('请输入卧底词'); return; }
    const word1 = input1.value.trim();
    const word2 = input2.value.trim();
    if (word1 === word2) { showToast('两个词不能相同'); return; }
    const custom = getCustomUC();
    if (!custom[cat]) custom[cat] = [];
    const exists = custom[cat].some(p => p[0] === word1 && p[1] === word2);
    const builtinExists = (undercoverWordPairs[cat] || []).some(p => p[0] === word1 && p[1] === word2);
    if (exists || builtinExists) { showToast('该词对已存在'); return; }
    custom[cat].push([word1, word2]);
    saveCustomUC(custom);
  } else if (wbManager.game === 'wordguess') {
    const word1 = input1.value.trim();
    const custom = getCustomWG();
    if (!custom[cat]) custom[cat] = [];
    const builtinExists = (wordGuessWords[cat] || []).includes(word1);
    const customExists = custom[cat].includes(word1);
    if (builtinExists || customExists) { showToast('该词汇已存在'); return; }
    custom[cat].push(word1);
    saveCustomWG(custom);
  } else if (wbManager.game === 'quotebattle') {
    if (!input2 || !input2.value.trim()) { showToast('请输入下一句台词'); return; }
    const quote = input1.value.trim();
    const answer = input2.value.trim();
    const source = input3 ? input3.value.trim() : '未知';
    const newItem = { quote, answer, source };
    const custom = getCustomNewGame(wbManager.game);
    if (!custom[cat]) custom[cat] = [];
    const data = getNewGameData(wbManager.game);
    const builtinExists = (data[cat] || []).some(it => it.quote === quote);
    const customExists = custom[cat].some(it => it.quote === quote);
    if (builtinExists || customExists) { showToast('该台词已存在'); return; }
    custom[cat].push(newItem);
    saveCustomNewGame(wbManager.game, custom);
  } else if (wbManager.game === 'sceneguess') {
    if (!input2 || !input2.value.trim()) { showToast('请输入答案'); return; }
    const scene = input1.value.trim();
    const answer = input2.value.trim();
    const source = input3 ? input3.value.trim() : '未知';
    const newItem = { scene, answer, source };
    const custom = getCustomNewGame(wbManager.game);
    if (!custom[cat]) custom[cat] = [];
    const data = getNewGameData(wbManager.game);
    const builtinExists = (data[cat] || []).some(it => it.scene === scene);
    const customExists = custom[cat].some(it => it.scene === scene);
    if (builtinExists || customExists) { showToast('该场景已存在'); return; }
    custom[cat].push(newItem);
    saveCustomNewGame(wbManager.game, custom);
  } else if (wbManager.game === 'emojiguess') {
    if (!input2 || !input2.value.trim()) { showToast('请输入答案'); return; }
    const emoji = input1.value.trim();
    const answer = input2.value.trim();
    const newItem = { emoji, answer };
    const custom = getCustomNewGame(wbManager.game);
    if (!custom[cat]) custom[cat] = [];
    const data = getNewGameData(wbManager.game);
    const builtinExists = (data[cat] || []).some(it => it.emoji === emoji);
    const customExists = custom[cat].some(it => it.emoji === emoji);
    if (builtinExists || customExists) { showToast('该表情谜题已存在'); return; }
    custom[cat].push(newItem);
    saveCustomNewGame(wbManager.game, custom);
  }

  if (input1) input1.value = '';
  if (input2) input2.value = '';
  if (input3) input3.value = '';

  showToast('添加成功');
  renderWbWords();
  renderWbCategories();
  updateWordbankInfo();
}

// 删除自定义词汇
function deleteCustomWord(idx) {
  const cat = wbManager.category;
  const words = getWbWords();
  const item = words[idx];
  if (!item || !item.isCustom) return;

  if (wbManager.game === 'undercover') {
    const custom = getCustomUC();
    if (!custom[cat]) return;
    const customIdx = idx - (undercoverWordPairs[cat] || []).length;
    if (customIdx >= 0 && customIdx < custom[cat].length) {
      custom[cat].splice(customIdx, 1);
      if (custom[cat].length === 0) delete custom[cat];
      saveCustomUC(custom);
    }
  } else if (wbManager.game === 'wordguess') {
    const custom = getCustomWG();
    if (!custom[cat]) return;
    const customIdx = idx - (wordGuessWords[cat] || []).length;
    if (customIdx >= 0 && customIdx < custom[cat].length) {
      custom[cat].splice(customIdx, 1);
      if (custom[cat].length === 0) delete custom[cat];
      saveCustomWG(custom);
    }
  } else {
    const custom = getCustomNewGame(wbManager.game);
    if (!custom[cat]) return;
    const data = getNewGameData(wbManager.game);
    const customIdx = idx - (data[cat] || []).length;
    if (customIdx >= 0 && customIdx < custom[cat].length) {
      custom[cat].splice(customIdx, 1);
      if (custom[cat].length === 0) delete custom[cat];
      saveCustomNewGame(wbManager.game, custom);
    }
  }

  showToast('已删除');
  renderWbWords();
  renderWbCategories();
  updateWordbankInfo();
}

// HTML转义
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
