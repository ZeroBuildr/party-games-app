// 狼人杀法官端 - 角色配置与规则数据

const werewolfRoles = {
  wolf: { name: '狼人', icon: '🐺', team: 'wolf', desc: '夜晚统一睁眼，商议击杀一名玩家。白天伪装好人发言投票。' },
  seer: { name: '预言家', icon: '🔮', team: 'good', desc: '每晚查验一名玩家的阵营（好人/狼人）。' },
  witch: { name: '女巫', icon: '🧪', team: 'good', desc: '拥有解药和毒药各一瓶，不可同晚同时使用。' },
  hunter: { name: '猎人', icon: '🎯', team: 'good', desc: '被投票或被刀死时可开枪带走一人（被毒死不可开枪）。' },
  guard: { name: '守卫', icon: '🛡️', team: 'good', desc: '每晚守护一名玩家，不可连续两晚守护同一人。' },
  idiot: { name: '白痴', icon: '🤡', team: 'good', desc: '被投票出局时翻牌免死，但永久失去投票权。' },
  civilian: { name: '平民', icon: '👤', team: 'good', desc: '无特殊技能，白天发言投票。' },
};

const werewolfBoards = {
  speed: {
    name: '极简速推板',
    desc: '小人数专用，节奏快',
    minPlayers: 6,
    maxPlayers: 7,
    configs: {
      6: { wolf: 2, seer: 1, witch: 1, hunter: 0, guard: 0, idiot: 0, civilian: 2 },
      7: { wolf: 2, seer: 1, witch: 1, hunter: 1, guard: 0, idiot: 0, civilian: 2 },
    },
  },
  basic: {
    name: '新手基础板',
    desc: '预女猎白，经典配置',
    minPlayers: 8,
    maxPlayers: 15,
    configs: {
      8: { wolf: 3, seer: 1, witch: 1, hunter: 1, guard: 0, idiot: 0, civilian: 2 },
      9: { wolf: 3, seer: 1, witch: 1, hunter: 1, guard: 0, idiot: 0, civilian: 3 },
      10: { wolf: 3, seer: 1, witch: 1, hunter: 1, guard: 0, idiot: 1, civilian: 3 },
      11: { wolf: 3, seer: 1, witch: 1, hunter: 1, guard: 0, idiot: 1, civilian: 4 },
      12: { wolf: 4, seer: 1, witch: 1, hunter: 1, guard: 0, idiot: 1, civilian: 4 },
      13: { wolf: 4, seer: 1, witch: 1, hunter: 1, guard: 0, idiot: 1, civilian: 5 },
      14: { wolf: 4, seer: 1, witch: 1, hunter: 1, guard: 0, idiot: 1, civilian: 6 },
      15: { wolf: 5, seer: 1, witch: 1, hunter: 1, guard: 0, idiot: 1, civilian: 6 },
    },
  },
  advanced: {
    name: '进阶板',
    desc: '预女猎守，含守卫',
    minPlayers: 9,
    maxPlayers: 15,
    configs: {
      9: { wolf: 3, seer: 1, witch: 1, hunter: 1, guard: 1, idiot: 0, civilian: 2 },
      10: { wolf: 3, seer: 1, witch: 1, hunter: 1, guard: 1, idiot: 0, civilian: 3 },
      11: { wolf: 3, seer: 1, witch: 1, hunter: 1, guard: 1, idiot: 1, civilian: 3 },
      12: { wolf: 4, seer: 1, witch: 1, hunter: 1, guard: 1, idiot: 0, civilian: 4 },
      13: { wolf: 4, seer: 1, witch: 1, hunter: 1, guard: 1, idiot: 1, civilian: 4 },
      14: { wolf: 4, seer: 1, witch: 1, hunter: 1, guard: 1, idiot: 1, civilian: 5 },
      15: { wolf: 5, seer: 1, witch: 1, hunter: 1, guard: 1, idiot: 1, civilian: 5 },
    },
  },
};

const werewolfRules = {
  wolf: '狼人：夜晚统一睁眼，商议击杀一名玩家。白天伪装好人发言投票。可自爆终止白天流程。',
  seer: '预言家：每晚选择一名玩家查验阵营。结果仅法官可见。',
  witch: '女巫：拥有解药和毒药各一瓶。解药可救当晚被刀玩家，毒药可毒杀任意玩家。不可同晚同时使用。首夜是否可自救看设置。',
  hunter: '猎人：被投票出局或被狼人刀死时，可开枪带走一名玩家。被女巫毒死不可开枪。',
  guard: '守卫：每晚守护一名玩家，被守护的玩家不会被狼人刀杀。不可连续两晚守护同一人。同守同救（守卫+女巫解药同时作用于一人）该玩家仍会死亡。',
  idiot: '白痴：被投票出局时翻牌免死，但永久失去投票权。被狼人刀死或被毒杀正常死亡。',
  civilian: '平民：无特殊技能，通过白天发言投票找出狼人。',
  sheriff: '警长：竞选产生，拥有1.5票投票权，决定发言顺序。警长殉职时可移交警徽。',
};

function getAvailableBoards(playerCount) {
  return Object.entries(werewolfBoards)
    .filter(([, board]) => playerCount >= board.minPlayers && playerCount <= board.maxPlayers)
    .map(([key, board]) => ({ key, ...board }));
}

function getDefaultBoard(playerCount) {
  if (playerCount <= 7) return 'speed';
  return 'basic';
}

function getBoardConfig(boardType, playerCount) {
  const board = werewolfBoards[boardType];
  if (!board) return null;
  return board.configs[playerCount] || null;
}

function generateRoleList(config) {
  const roles = [];
  for (const [role, count] of Object.entries(config)) {
    for (let i = 0; i < count; i++) roles.push(role);
  }
  return roles;
}

function wwShuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
