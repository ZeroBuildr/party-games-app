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
  { word: '不可理喻', meaning: '不能用道理使之明白，指态度蛮横不讲理', category: 'idiom' },
  { word: '文不加点', meaning: '文章一气呵成无须修改，形容文思敏捷', category: 'idiom' },
  { word: '七月流火', meaning: '指大火星西行天气转凉，常被误为形容天气炎热', category: 'idiom' },
  { word: '望洋兴叹', meaning: '在伟大事物前感叹自己渺小，本义为仰视而叹', category: 'idiom' },
  { word: '不足为训', meaning: '不能当作典范或准则', category: 'idiom' },
  { word: '登堂入室', meaning: '比喻学问技艺由浅入深达到高水平', category: 'idiom' },
  { word: '侧目而视', meaning: '斜着眼睛看，形容憎恨或畏惧而又愤恨', category: 'idiom' },
  { word: '贻笑大方', meaning: '让内行见笑', category: 'idiom' },
  { word: '罄竹难书', meaning: '形容罪恶多得写不完，含贬义', category: 'idiom' },
  { word: '巧夺天工', meaning: '人工的精巧胜过天然，用于人工制品', category: 'idiom' },
  { word: '师心自用', meaning: '固执己见，自以为是', category: 'idiom' },
  { word: '奉为圭臬', meaning: '把某种事物尊奉为准则', category: 'idiom' },
  { word: '不赞一词', meaning: '文章好不能增减一字，也指一言不发', category: 'idiom' },
  { word: '细大不捐', meaning: '大的小的都不抛弃', category: 'idiom' },
  { word: '莫衷一是', meaning: '不能得出一致结论', category: 'idiom' },
  { word: '屡试不爽', meaning: '屡次试验都没有差错', category: 'idiom' },
  { word: '不名一文', meaning: '一个钱也没有', category: 'idiom' },
  { word: '耳提面命', meaning: '提着耳朵当面教导，形容恳切教诲', category: 'idiom' },
  { word: '噤若寒蝉', meaning: '像寒天的蝉一样不敢作声', category: 'idiom' },
  { word: '暴殄天物', meaning: '任意糟蹋天然之物', category: 'idiom' },
  { word: '汗牛充栋', meaning: '形容书籍极多', category: 'idiom' },
  { word: '求全责备', meaning: '对人对事要求完美无缺', category: 'idiom' },
  { word: '胸无城府', meaning: '形容坦率真诚没有心机', category: 'idiom' },
  { word: '无所不为', meaning: '什么事都干，多含贬义', category: 'idiom' },

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
  { word: '杖朝', meaning: '八十岁，典出《礼记》"八十杖于朝"', category: 'history' },
  { word: '耄耋', meaning: '泛指八九十岁的老人', category: 'history' },
  { word: '鲐背', meaning: '九十岁，老人背上有斑如鲐鱼', category: 'history' },
  { word: '豆蔻', meaning: '指女子十三四岁', category: 'history' },
  { word: '襁褓', meaning: '本为背负婴儿的布，借指婴儿时期', category: 'history' },
  { word: '黄口', meaning: '本指雏鸟，借指十岁左右的儿童', category: 'history' },
  { word: '金乌', meaning: '太阳的代称，传说日中有三足乌鸦', category: 'history' },
  { word: '东床', meaning: '女婿的代称，典出王羲之东床坦腹', category: 'history' },
  { word: '拙荆', meaning: '旧时对自己妻子的谦称', category: 'history' },
  { word: '泰山', meaning: '岳父的别称', category: 'history' },
  { word: '连襟', meaning: '姐妹的丈夫之间的互称', category: 'history' },
  { word: '桑梓', meaning: '故乡的代称，古人宅旁种桑梓', category: 'history' },
  { word: '社稷', meaning: '国家的代称，社为土地神，稷为谷神', category: 'history' },
  { word: '黔首', meaning: '秦代对平民的称呼，以黑巾裹头', category: 'history' },
  { word: '解元', meaning: '科举乡试第一名', category: 'history' },
  { word: '会元', meaning: '科举会试第一名', category: 'history' },
  { word: '青衿', meaning: '古代学子的青色衣领，借指读书人', category: 'history' },
  { word: '五谷', meaning: '古代五种谷物：稻、麦、菽、黍、稷', category: 'history' },
  { word: '九州', meaning: '古代中国的代称，冀兖青徐扬荆豫梁雍', category: 'history' },
  { word: '三牲', meaning: '古代祭祀用的牛、羊、豕', category: 'history' },
  { word: '哀鸿', meaning: '比喻流离失所的灾民，典出《诗经》', category: 'history' },
  { word: '庙堂', meaning: '朝廷的代称', category: 'history' },

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
  { word: '鹈鹕', meaning: '一种嘴下有可伸缩皮囊的大型水鸟', category: 'nature' },
  { word: '鸸鹋', meaning: '澳洲特产的大型不会飞的鸟，体形似鸵鸟', category: 'nature' },
  { word: '鹤鸵', meaning: '俗称食火鸡，世界上最危险的鸟类之一', category: 'nature' },
  { word: '鸮鹦鹉', meaning: '新西兰特产，唯一不会飞的鹦鹉', category: 'nature' },
  { word: '鼋', meaning: '一种大型鳖类，俗称癞头鼋', category: 'nature' },
  { word: '鸊鷉', meaning: '一种体形小善于潜水的水鸟', category: 'nature' },
  { word: '大鲵', meaning: '俗称娃娃鱼，现存最大的两栖动物', category: 'nature' },
  { word: '麋鹿', meaning: '俗称四不像，角似鹿而非鹿', category: 'nature' },
  { word: '抹香鲸', meaning: '体型最大的齿鲸，肠道可产生龙涎香', category: 'nature' },
  { word: '龙涎香', meaning: '抹香鲸肠道分泌物，名贵香料', category: 'nature' },
  { word: '玳瑁', meaning: '一种海龟，背甲可制装饰品', category: 'nature' },
  { word: '王莲', meaning: '热带水生植物，叶片巨大可承重', category: 'nature' },
  { word: '猪笼草', meaning: '一种能捕食昆虫的植物', category: 'nature' },
  { word: '捕蝇草', meaning: '叶片能迅速闭合捕虫的食虫植物', category: 'nature' },
  { word: '桫椤', meaning: '现存唯一的木本蕨类，被誉为活化石', category: 'nature' },
  { word: '珙桐', meaning: '俗称鸽子树，中国特有的活化石植物', category: 'nature' },
  { word: '冬虫夏草', meaning: '虫草菌寄生蝙蝠蛾幼虫形成的复合体', category: 'nature' },
  { word: '灵芝', meaning: '一种多孔菌科药用真菌，又称仙草', category: 'nature' },
  { word: '沉香', meaning: '瑞香科植物受创后分泌的树脂木', category: 'nature' },
  { word: '牛黄', meaning: '牛胆囊中的结石，名贵中药材', category: 'nature' },
  { word: '蟾酥', meaning: '蟾蜍耳后腺分泌的白色浆液，可入药', category: 'nature' },
  { word: '没药', meaning: '橄榄科植物分泌的树脂，名贵香料', category: 'nature' },

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
  { word: '白兰地', meaning: '源自荷兰语，意为"燃烧的酒"', category: 'life' },
  { word: '威士忌', meaning: '源自盖尔语，意为"生命之水"', category: 'life' },
  { word: '伏特加', meaning: '源自俄语，本义为"小水"', category: 'life' },
  { word: '雪茄', meaning: '源自玛雅语sikar，意为"吸烟"', category: 'life' },
  { word: '香槟', meaning: '法国香槟产区产的起泡葡萄酒', category: 'life' },
  { word: '沙发', meaning: '英语sofa的音译，源自阿拉伯语', category: 'life' },
  { word: '扑克', meaning: '英语poker的音译', category: 'life' },
  { word: '的士', meaning: '英语taxi的音译', category: 'life' },
  { word: '巴士', meaning: '英语bus的音译', category: 'life' },
  { word: '麦克风', meaning: '英语microphone的音译', category: 'life' },
  { word: '吉普', meaning: '源自英文GP，即通用车辆的谐音', category: 'life' },
  { word: '番茄', meaning: '"番"指外来，原产南美洲', category: 'life' },
  { word: '胡桃', meaning: '"胡"指西域，原产波斯', category: 'life' },
  { word: '番薯', meaning: '"番"指外来，原产美洲', category: 'life' },
  { word: '菠菜', meaning: '古称波斯菜，原产波斯', category: 'life' },
  { word: '豆腐', meaning: '传为西汉淮南王刘安炼丹时偶然发明', category: 'life' },
  { word: '山葵', meaning: '常被误称为"芥末"的绿色调味，实为植物根茎', category: 'life' },
  { word: '槟榔', meaning: '棕榈科植物果实，部分地区有嚼食习俗', category: 'life' },
  { word: '寿司', meaning: '日语すし的音译，本义为酸饭', category: 'life' },
  { word: '天妇罗', meaning: '源自葡萄牙语，油炸面糊食物', category: 'life' },

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
  { word: '唠嗑', meaning: '东北话，聊天、闲谈', category: 'dialect' },
  { word: '扯犊子', meaning: '东北话，胡扯、说废话', category: 'dialect' },
  { word: '嘚瑟', meaning: '东北话，显摆、卖弄', category: 'dialect' },
  { word: '膈应', meaning: '东北话，让人不舒服、讨厌', category: 'dialect' },
  { word: '老铁', meaning: '东北话，好哥们、铁哥们', category: 'dialect' },
  { word: '秃噜', meaning: '东北话，滑脱或脱口而出', category: 'dialect' },
  { word: '寻思', meaning: '东北话，思考、琢磨', category: 'dialect' },
  { word: '滚犊子', meaning: '东北话，让人滚开', category: 'dialect' },
  { word: '撒丫子', meaning: '北京话，放开跑、撒腿就跑', category: 'dialect' },
  { word: '局气', meaning: '北京话，讲规矩、够朋友', category: 'dialect' },
  { word: '门儿清', meaning: '北京话，非常清楚内情', category: 'dialect' },
  { word: '露怯', meaning: '北京话，暴露出外行或怯场', category: 'dialect' },
  { word: '轴', meaning: '北京话，固执、一根筋', category: 'dialect' },
  { word: '掉链子', meaning: '北京话，关键时刻出问题', category: 'dialect' },
  { word: '老炮儿', meaning: '北京话，指有资历的老江湖', category: 'dialect' },
  { word: '咋呼', meaning: '北方话，大声叫嚷或虚张声势', category: 'dialect' },
  { word: '巴适', meaning: '四川话，舒服、很好', category: 'dialect' },
  { word: '龙门阵', meaning: '四川话，闲谈聊天', category: 'dialect' },
  { word: '瓜娃子', meaning: '四川话，傻孩子', category: 'dialect' },
  { word: '晓得', meaning: '四川话，知道', category: 'dialect' },
  { word: '要得', meaning: '四川话，好、行', category: 'dialect' },
  { word: '雄起', meaning: '四川话，加油、奋起', category: 'dialect' },
  { word: '唔该', meaning: '粤语，劳驾、谢谢', category: 'dialect' },
  { word: '冇', meaning: '粤语，没有', category: 'dialect' },
  { word: '靓仔', meaning: '粤语，年轻男子', category: 'dialect' },
  { word: '饮茶', meaning: '粤语，喝茶吃点心', category: 'dialect' },
  { word: '搞掂', meaning: '粤语，办妥、搞定', category: 'dialect' },
  { word: '猴赛雷', meaning: '粤语，好厉害', category: 'dialect' },
];

function getBlufferWordsByCategory(category) {
  const custom = getCustomBK();
  if (category === 'all') {
    let all = [...blufferWords];
    for (let cat in custom) all = all.concat(custom[cat]);
    return all;
  }
  return blufferWords.filter(w => w.category === category).concat(custom[category] || []);
}

function getBlufferRandomWord(category, excludeWords = []) {
  const pool = getBlufferWordsByCategory(category).filter(w => !excludeWords.includes(w.word));
  if (pool.length === 0) return getBlufferWordsByCategory(category)[0];
  return pool[Math.floor(Math.random() * pool.length)];
}

// ==================== 自定义词库（localStorage） ====================
const STORAGE_KEY_BK = 'partygame_custom_bk';

function getCustomBK() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_BK) || '{}');
  } catch (e) { return {}; }
}

function saveCustomBK(data) {
  localStorage.setItem(STORAGE_KEY_BK, JSON.stringify(data));
}

function getBlufferCategoryNames() {
  return { ...blufferCategories, all: '全部' };
}
