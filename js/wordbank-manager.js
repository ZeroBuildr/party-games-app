// 词库管理逻辑

let wbManager = {
  game: 'undercover',  // undercover | wordguess
  category: 'food',
};

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
  // 选择该游戏第一个可用分类
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
  const names = getCategoryNames();
  if (wbManager.game === 'undercover') {
    let cats = Object.keys(undercoverWordPairs);
    const custom = getCustomUC();
    for (let cat in custom) {
      if (!cats.includes(cat)) cats.push(cat);
    }
    return cats;
  } else {
    let cats = Object.keys(wordGuessWords);
    const custom = getCustomWG();
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
  const names = getCategoryNames();
  const cats = getWbCategories();
  container.innerHTML = '';
  cats.forEach(cat => {
    const chip = document.createElement('span');
    chip.className = 'wb-cat-chip' + (cat === wbManager.category ? ' active' : '');
    chip.textContent = names[cat] || cat;
    chip.onclick = () => {
      wbManager.category = cat;
      renderWbCategories();
      renderWbWords();
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
    // 标记是否自定义
    return [
      ...builtin.map(p => ({ words: p, isCustom: false })),
      ...custom.map(p => ({ words: p, isCustom: true })),
    ];
  } else {
    const builtin = wordGuessWords[cat] || [];
    const custom = (getCustomWG()[cat] || []);
    return [
      ...builtin.map(w => ({ words: [w], isCustom: false })),
      ...custom.map(w => ({ words: [w], isCustom: true })),
    ];
  }
}

// 渲染词汇列表
function renderWbWords() {
  const container = document.getElementById('wb-word-list');
  if (!container) return;
  const words = getWbWords();

  // 统计信息
  const customCount = words.filter(w => w.isCustom).length;
  const total = words.length;

  let html = `<div class="wb-list-header">
    <span class="wb-list-count">共 ${total} 个${wbManager.game === 'undercover' ? '词对' : '词汇'}${customCount > 0 ? `（自定义 ${customCount}）` : ''}</span>
  </div>`;

  if (total === 0) {
    html += `<div class="wb-empty">该分类还没有词汇，在下方添加吧</div>`;
  } else {
    html += '<div class="wb-word-grid">';
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
    html += '</div>';
  }

  container.innerHTML = html;
}

// 渲染添加输入框
function renderAddInputs() {
  const container = document.getElementById('wb-add-inputs');
  if (!container) return;
  const names = getCategoryNames();

  let html = `<div class="wb-add-hint">添加到：${names[wbManager.category] || wbManager.category}</div>`;

  if (wbManager.game === 'undercover') {
    html += `<div class="wb-input-row">
      <input type="text" id="wb-input-1" class="input-field" placeholder="平民词" maxlength="10">
      <input type="text" id="wb-input-2" class="input-field" placeholder="卧底词" maxlength="10">
    </div>`;
  } else {
    html += `<input type="text" id="wb-input-1" class="input-field wb-input-single" placeholder="输入要添加的词汇" maxlength="10">`;
  }

  container.innerHTML = html;
}

// 添加自定义词汇
function addCustomWord() {
  const input1 = document.getElementById('wb-input-1');
  const input2 = document.getElementById('wb-input-2');
  const cat = wbManager.category;

  if (!input1 || !input1.value.trim()) {
    showToast('请输入词汇');
    return;
  }

  const word1 = input1.value.trim();

  if (wbManager.game === 'undercover') {
    if (!input2 || !input2.value.trim()) {
      showToast('请输入卧底词');
      return;
    }
    const word2 = input2.value.trim();
    if (word1 === word2) {
      showToast('两个词不能相同');
      return;
    }

    const custom = getCustomUC();
    if (!custom[cat]) custom[cat] = [];
    // 检查重复
    const exists = custom[cat].some(p => p[0] === word1 && p[1] === word2);
    const builtinExists = (undercoverWordPairs[cat] || []).some(p => p[0] === word1 && p[1] === word2);
    if (exists || builtinExists) {
      showToast('该词对已存在');
      return;
    }
    custom[cat].push([word1, word2]);
    saveCustomUC(custom);
  } else {
    const custom = getCustomWG();
    if (!custom[cat]) custom[cat] = [];
    const builtinExists = (wordGuessWords[cat] || []).includes(word1);
    const customExists = custom[cat].includes(word1);
    if (builtinExists || customExists) {
      showToast('该词汇已存在');
      return;
    }
    custom[cat].push(word1);
    saveCustomWG(custom);
  }

  // 清空输入框
  if (input1) input1.value = '';
  if (input2) input2.value = '';

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
    // 计算自定义部分的索引
    const customIdx = idx - (undercoverWordPairs[cat] || []).length;
    if (customIdx >= 0 && customIdx < custom[cat].length) {
      custom[cat].splice(customIdx, 1);
      if (custom[cat].length === 0) delete custom[cat];
      saveCustomUC(custom);
    }
  } else {
    const custom = getCustomWG();
    if (!custom[cat]) return;
    const customIdx = idx - (wordGuessWords[cat] || []).length;
    if (customIdx >= 0 && customIdx < custom[cat].length) {
      custom[cat].splice(customIdx, 1);
      if (custom[cat].length === 0) delete custom[cat];
      saveCustomWG(custom);
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
