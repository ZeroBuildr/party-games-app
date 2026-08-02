// 瞎掰王 - 角色定义与词库数据

const blufferRoles = {
  smart: {
    name: '大聪明',
    icon: '🧐',
    desc: '不知道词汇的真实含义。听完所有人发言后，投票选出你认为的老实人。找对则大聪明与老实人获胜，找错则瞎掰阵营获胜。',
  },
  honest: {
    name: '老实人',
    icon: '📖',
    desc: '可以看到词汇的真实含义。需要如实解释，但注意不要太过明显，否则容易被瞎掰人识破。',
  },
  bluffer: {
    name: '瞎掰人',
    icon: '🎭',
    desc: '只能看到词汇本身，不知道真实含义。需要根据词汇瞎掰出一个看似合理的解释，骗过大聪明。',
  },
};

const blufferCategories = {
  idiom: '成语典故',
  history: '历史文化',
  nature: '自然百科',
  life: '生活百科',
  dialect: '方言俗语',
};

const blufferWords = [
  // 成语典故
  { word: '差强人意', meaning: '大体上还能使人满意', category: 'idiom' },
  { word: '望其项背', meaning: '能够看到别人的背影，比喻赶得上或比得上', category: 'idiom' },
  { word: '不刊之论', meaning: '不可更改的言论，指正确的言论', category: 'idiom' },
  { word: '首鼠两端', meaning: '犹豫不决，动摇不定', category: 'idiom' },
  { word: '暴虎冯河', meaning: '比喻有勇无谋，冒险蛮干', category: 'idiom' },
  { word: '鞭辟入里', meaning: '形容能透彻说明问题，深入内部', category: 'idiom' },
  { word: '空穴来风', meaning: '有了洞穴才有风进来，比喻传言有根据', category: 'idiom' },
  { word: '捉襟见肘', meaning: '拉一下衣襟就露出胳膊肘，形容顾此失彼', category: 'idiom' },
  { word: '炙手可热', meaning: '手一靠近就觉得很烫，比喻权势大气焰盛', category: 'idiom' },
  { word: '举重若轻', meaning: '举重东西像举轻的，比喻对付困难从容不迫', category: 'idiom' },
  { word: '久假不归', meaning: '长期借用不还', category: 'idiom' },
  { word: '罪不容诛', meaning: '罪恶极大，杀了也抵偿不了', category: 'idiom' },
  { word: '万人空巷', meaning: '家家户户都从巷里出来，形容庆祝盛况', category: 'idiom' },
  { word: '涣然冰释', meaning: '形容疑虑、误会完全消除', category: 'idiom' },
  { word: '洛阳纸贵', meaning: '比喻著作广泛流传', category: 'idiom' },
  { word: '目无全牛', meaning: '比喻技艺到了纯熟的地步', category: 'idiom' },
  { word: '曾几何时', meaning: '时间过去没多久', category: 'idiom' },
  { word: '明日黄花', meaning: '比喻过时的事物', category: 'idiom' },
  { word: '振聋发聩', meaning: '用语言文字唤醒糊涂的人', category: 'idiom' },
  { word: '危言危行', meaning: '说正直的话，做正直的事', category: 'idiom' },

  // 历史文化
  { word: '束脩', meaning: '古代学生送给老师的见面礼，泛指学费', category: 'history' },
  { word: '执牛耳', meaning: '古代诸侯结盟时割牛耳取血，后指在某领域居领导地位', category: 'history' },
  { word: '付梓', meaning: '交付印刷，梓是木刻印书的木板', category: 'history' },
  { word: '黉门', meaning: '学校的门，借指学校', category: 'history' },
  { word: '案牍', meaning: '公文案卷', category: 'history' },
  { word: '连中三元', meaning: '科举考试中乡试、会试、殿试都考第一名', category: 'history' },
  { word: '丁忧', meaning: '遭遇父母丧事', category: 'history' },
  { word: '致仕', meaning: '辞官退休', category: 'history' },
  { word: '加冠', meaning: '古代男子二十岁行冠礼，表示成年', category: 'history' },
  { word: '及笄', meaning: '古代女子十五岁把头发簪起，表示成年', category: 'history' },
  { word: '花甲', meaning: '六十岁', category: 'history' },
  { word: '古稀', meaning: '七十岁', category: 'history' },
  { word: '期颐', meaning: '一百岁', category: 'history' },
  { word: '破天荒', meaning: '比喻事情第一次出现', category: 'history' },
  { word: '弱冠', meaning: '男子二十岁', category: 'history' },

  // 自然百科
  { word: '饕餮', meaning: '传说中一种贪吃的怪兽，比喻贪吃的人', category: 'nature' },
  { word: '鲲鹏', meaning: '庄子笔下的大鱼和大鸟', category: 'nature' },
  { word: '蝾螈', meaning: '一种两栖动物，形似蜥蜴', category: 'nature' },
  { word: '鸱鸮', meaning: '猫头鹰一类的鸟', category: 'nature' },
  { word: '犰狳', meaning: '一种全身有鳞甲的哺乳动物', category: 'nature' },
  { word: '鼯鼠', meaning: '一种能滑翔的啮齿动物', category: 'nature' },
  { word: '鹪鹩', meaning: '一种小型鸣禽', category: 'nature' },
  { word: '螽斯', meaning: '一种昆虫，也叫蝈蝈', category: 'nature' },
  { word: '菖蒲', meaning: '一种水生植物，古人端午悬挂驱邪', category: 'nature' },
  { word: '芫荽', meaning: '香菜的学名', category: 'nature' },
  { word: '荸荠', meaning: '一种水生植物的球茎，可食用', category: 'nature' },
  { word: '苜蓿', meaning: '一种牧草，可作绿肥', category: 'nature' },
  { word: '蓍草', meaning: '一种古代用于占卜的草', category: 'nature' },
  { word: '曼珠沙华', meaning: '彼岸花的别称', category: 'nature' },
  { word: '含羞草', meaning: '一种触碰后叶片会合拢的植物', category: 'nature' },

  // 生活百科
  { word: '拿铁', meaning: '意大利语牛奶的意思，拿铁咖啡即牛奶咖啡', category: 'life' },
  { word: '培根', meaning: '西式烟熏腌肉，源自人名', category: 'life' },
  { word: '沙龙', meaning: '法语客厅的意思，后指文人雅士的聚会', category: 'life' },
  { word: '幽默', meaning: '英语humor的音译', category: 'life' },
  { word: '引擎', meaning: '发动机的音译', category: 'life' },
  { word: '雷达', meaning: '利用电磁波探测目标的电子设备', category: 'life' },
  { word: '咖啡', meaning: '源自阿拉伯语，一种提神饮料', category: 'life' },
  { word: '巧克力', meaning: '源自美洲可可豆制成的食品', category: 'life' },
  { word: '三明治', meaning: '两片面包夹馅的食物，源自三明治伯爵', category: 'life' },
  { word: '汉堡', meaning: '源自德国汉堡市的肉饼', category: 'life' },

  // 方言俗语
  { word: '贼星', meaning: '流星的俗称', category: 'dialect' },
  { word: '打牙祭', meaning: '偶尔吃一顿好的', category: 'dialect' },
  { word: '二把刀', meaning: '技术不精，半吊子', category: 'dialect' },
  { word: '寒碜', meaning: '丑陋，丢脸', category: 'dialect' },
  { word: '磨叽', meaning: '磨蹭，拖沓', category: 'dialect' },
  { word: '忽悠', meaning: '蒙骗，吹捧', category: 'dialect' },
  { word: '扎堆', meaning: '凑在一起', category: 'dialect' },
  { word: '拾掇', meaning: '整理，收拾', category: 'dialect' },
  { word: '跑腿子', meaning: '被人差遣跑路的人', category: 'dialect' },
  { word: '老边', meaning: '外行，不懂行的人', category: 'dialect' },
];

function getBlufferWordsByCategory(category) {
  if (category === 'all') return blufferWords;
  return blufferWords.filter(w => w.category === category);
}

function getBlufferRandomWord(category, excludeWords = []) {
  const pool = getBlufferWordsByCategory(category).filter(w => !excludeWords.includes(w.word));
  if (pool.length === 0) return getBlufferWordsByCategory(category)[0];
  return pool[Math.floor(Math.random() * pool.length)];
}
