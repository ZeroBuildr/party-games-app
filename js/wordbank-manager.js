// 词库管理逻辑

let wbManager = {
  game: 'undercover',  // undercover | wordguess | bluffer
  category: 'food',
  showImport: false,
};

// 初始化词库管理页
function initWordbankManager() {
  wbManager.game = 'undercover';
  wbManager.category = 'food';
  wbManager.showImport = false;
  document.querySelectorAll('.wb-game-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.game === 'undercover');
  });
  renderWbCategories();
  renderWbWords();
  renderAddInputs();
  renderImportArea();
}

// 切换游戏
function switchWbGame(game) {
  wbManager.game = game;
  wbManager.showImport = false;
  // 选择该游戏第一个可用分类
  const cats = getWbCategories();
  wbManager.category = cats[0];
  document.querySelectorAll('.wb-game-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.game === game);
  });
  renderWbCategories();
  renderWbWords();
  renderAddInputs();
  renderImportArea();
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
    let cats = Object.keys(blufferCategories);
    const custom = getCustomBK();
    for (let cat in custom) {
      if (!cats.includes(cat)) cats.push(cat);
    }
    return cats;
  }
}

// 获取当前游戏分类名映射
function getWbCategoryNames() {
  if (wbManager.game === 'bluffer') return getBlufferCategoryNames();
  return getCategoryNames();
}

// 渲染分类标签
function renderWbCategories() {
  const container = document.getElementById('wb-category-list');
  if (!container) return;
  const names = getWbCategoryNames();
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
    const builtin = blufferWords.filter(w => w.category === cat);
    const custom = (getCustomBK()[cat] || []);
    return [
      ...builtin.map(w => ({ words: [w.word, w.meaning], isCustom: false })),
      ...custom.map(w => ({ words: [w.word, w.meaning], isCustom: true })),
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
  const unit = wbManager.game === 'undercover' ? '词对' : '词汇';

  let html = `<div class="wb-list-header">
    <span class="wb-list-count">共 ${total} 个${unit}${customCount > 0 ? `（自定义 ${customCount}）` : ''}</span>
  </div>`;

  if (total === 0) {
    html += `<div class="wb-empty">该分类还没有词汇，在下方添加或批量导入吧</div>`;
  } else {
    html += '<div class="wb-word-grid">';
    words.forEach((item, idx) => {
      let display;
      if (wbManager.game === 'bluffer') {
        display = `${item.words[0]}：${item.words[1]}`;
      } else {
        display = item.words.join(' / ');
      }
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
  const names = getWbCategoryNames();

  let html = `<div class="wb-add-hint">添加到：${names[wbManager.category] || wbManager.category}</div>`;

  if (wbManager.game === 'undercover') {
    html += `<div class="wb-input-row">
      <input type="text" id="wb-input-1" class="input-field" placeholder="平民词" maxlength="10">
      <input type="text" id="wb-input-2" class="input-field" placeholder="卧底词" maxlength="10">
    </div>`;
  } else if (wbManager.game === 'wordguess') {
    html += `<input type="text" id="wb-input-1" class="input-field wb-input-single" placeholder="输入要添加的词汇" maxlength="10">`;
  } else {
    html += `<div class="wb-input-row bk-input-row">
      <input type="text" id="wb-input-1" class="input-field" placeholder="词汇" maxlength="20">
      <input type="text" id="wb-input-2" class="input-field" placeholder="真实含义" maxlength="50">
    </div>`;
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
    const exists = custom[cat].some(p => p[0] === word1 && p[1] === word2);
    const builtinExists = (undercoverWordPairs[cat] || []).some(p => p[0] === word1 && p[1] === word2);
    if (exists || builtinExists) {
      showToast('该词对已存在');
      return;
    }
    custom[cat].push([word1, word2]);
    saveCustomUC(custom);
  } else if (wbManager.game === 'wordguess') {
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
  } else {
    if (!input2 || !input2.value.trim()) {
      showToast('请输入真实含义');
      return;
    }
    const meaning = input2.value.trim();
    const custom = getCustomBK();
    if (!custom[cat]) custom[cat] = [];
    const builtinExists = blufferWords.some(w => w.word === word1 && w.category === cat);
    const customExists = custom[cat].some(w => w.word === word1);
    if (builtinExists || customExists) {
      showToast('该词汇已存在');
      return;
    }
    custom[cat].push({ word: word1, meaning, category: cat });
    saveCustomBK(custom);
  }

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
    const custom = getCustomBK();
    if (!custom[cat]) return;
    const builtinCount = blufferWords.filter(w => w.category === cat).length;
    const customIdx = idx - builtinCount;
    if (customIdx >= 0 && customIdx < custom[cat].length) {
      custom[cat].splice(customIdx, 1);
      if (custom[cat].length === 0) delete custom[cat];
      saveCustomBK(custom);
    }
  }

  showToast('已删除');
  renderWbWords();
  renderWbCategories();
  updateWordbankInfo();
}

// ==================== 批量导入 ====================
function toggleImportArea() {
  wbManager.showImport = !wbManager.showImport;
  renderImportArea();
}

function renderImportArea() {
  const container = document.getElementById('wb-import-area');
  if (!container) return;
  const names = getWbCategoryNames();

  if (!wbManager.showImport) {
    container.innerHTML = '';
    container.style.display = 'none';
    return;
  }

  container.style.display = 'block';

  let formatHint = '';
  let placeholder = '';
  if (wbManager.game === 'undercover') {
    formatHint = '每行一个词对，用逗号或空格分隔<br>格式：平民词,卧底词<br>示例：可乐,雪碧<br>汉堡,三明治';
    placeholder = '可乐,雪碧\n汉堡,三明治\n米饭,面条';
  } else if (wbManager.game === 'wordguess') {
    formatHint = '每行一个词汇<br>格式：词汇<br>示例：苹果\n香蕉\n西瓜';
    placeholder = '苹果\n香蕉\n西瓜';
  } else {
    formatHint = '每行一个词条，用竖线|分隔词汇和含义<br>格式：词汇|含义<br>示例：差强人意|大体上还能使人满意';
    placeholder = '差强人意|大体上还能使人满意\n束脩|古代学生送给老师的见面礼';
  }

  container.innerHTML = `
    <div class="wb-import-header">
      <div class="wb-add-hint">批量导入到：${names[wbManager.category] || wbManager.category}</div>
      <span class="wb-import-close" onclick="toggleImportArea()">收起</span>
    </div>
    <div class="wb-import-format">${formatHint}</div>
    <textarea id="wb-import-textarea" class="input-field wb-import-textarea" placeholder="${placeholder}" rows="8"></textarea>
    <div class="wb-import-actions">
      <button class="btn-outline" onclick="toggleImportArea()">取消</button>
      <button class="btn-primary" onclick="confirmImport()">导入</button>
    </div>
  `;
}

function confirmImport() {
  const textarea = document.getElementById('wb-import-textarea');
  if (!textarea || !textarea.value.trim()) {
    showToast('请输入要导入的内容');
    return;
  }
  const text = textarea.value.trim();
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  const cat = wbManager.category;
  let added = 0;
  let skipped = 0;

  if (wbManager.game === 'undercover') {
    const custom = getCustomUC();
    if (!custom[cat]) custom[cat] = [];
    const builtin = undercoverWordPairs[cat] || [];
    lines.forEach(line => {
      const parts = line.split(/[,，\s]+/).map(p => p.trim()).filter(p => p);
      if (parts.length < 2) { skipped++; return; }
      const w1 = parts[0], w2 = parts[1];
      if (w1 === w2) { skipped++; return; }
      const exists = custom[cat].some(p => p[0] === w1 && p[1] === w2) || builtin.some(p => p[0] === w1 && p[1] === w2);
      if (exists) { skipped++; return; }
      custom[cat].push([w1, w2]);
      added++;
    });
    if (added > 0) saveCustomUC(custom);
  } else if (wbManager.game === 'wordguess') {
    const custom = getCustomWG();
    if (!custom[cat]) custom[cat] = [];
    const builtin = wordGuessWords[cat] || [];
    lines.forEach(line => {
      const w = line.split(/[,，\s]+/)[0].trim();
      if (!w) { skipped++; return; }
      const exists = custom[cat].includes(w) || builtin.includes(w);
      if (exists) { skipped++; return; }
      custom[cat].push(w);
      added++;
    });
    if (added > 0) saveCustomWG(custom);
  } else {
    const custom = getCustomBK();
    if (!custom[cat]) custom[cat] = [];
    const builtin = blufferWords.filter(w => w.category === cat);
    lines.forEach(line => {
      const parts = line.split('|').map(p => p.trim()).filter(p => p);
      if (parts.length < 2) { skipped++; return; }
      const word = parts[0], meaning = parts.slice(1).join('|');
      const exists = custom[cat].some(w => w.word === word) || builtin.some(w => w.word === word);
      if (exists) { skipped++; return; }
      custom[cat].push({ word, meaning, category: cat });
      added++;
    });
    if (added > 0) saveCustomBK(custom);
  }

  textarea.value = '';
  wbManager.showImport = false;
  renderImportArea();
  renderWbWords();
  renderWbCategories();
  updateWordbankInfo();

  if (added > 0) {
    showToast(`成功导入 ${added} 个${skipped > 0 ? `，跳过 ${skipped} 个重复` : ''}`);
  } else {
    showToast('没有新词汇被导入（全部重复或格式错误）');
  }
}

// HTML转义
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
