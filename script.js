// =============================================
// بطاقات الكلمات — إنجليزي ← عربي
// كل البيانات بتنحفظ على جهاز المستخدم (localStorage)
// =============================================

// ----- التصنيفات: كل تصنيف إله إيموجي وألوان خاصة فيه -----
// c1 و c2: تدرّج البطاقة، shade: الظل تحتها، text: لون الكلمة عالوجه الأمامي
const CATEGORIES = [
  { id: 'food',     name: 'أكل',        emoji: '🍎', c1: '#ff6b6b', c2: '#ff9f45', shade: '#d84a4a', text: '#ffffff' },
  { id: 'animals',  name: 'حيوانات',    emoji: '🐾', c1: '#ffd43b', c2: '#ffb020', shade: '#d99a00', text: '#2a1e5c' },
  { id: 'colors',   name: 'ألوان',      emoji: '🎨', c1: '#8b5cf6', c2: '#d946ef', shade: '#6a35c9', text: '#ffffff' },
  { id: 'family',   name: 'عيلة',       emoji: '💕', c1: '#ff5d8f', c2: '#ff8fab', shade: '#d63c6e', text: '#ffffff' },
  { id: 'things',   name: 'أشياء',      emoji: '🏠', c1: '#3b82f6', c2: '#38bdf8', shade: '#2563c9', text: '#ffffff' },
  { id: 'nature',   name: 'طبيعة',      emoji: '🌳', c1: '#12b886', c2: '#5cd65c', shade: '#0c8a63', text: '#ffffff' },
  { id: 'describe', name: 'صفات',       emoji: '✨', c1: '#15aabf', c2: '#3bc9db', shade: '#0c8599', text: '#ffffff' },
  { id: 'mine',     name: 'كلماتي',     emoji: '⭐', c1: '#2a1e5c', c2: '#5b3fa8', shade: '#1a1240', text: '#ffffff' },
];

// «الكل» مش تصنيف حقيقي، بس خيار بالفلتر
const ALL = { id: 'all', name: 'الكل', emoji: '🌈' };

// ----- الكلمات الجاهزة للمبتدئين: [إنجليزي، عربي، إيموجي، تصنيف] -----
const DEFAULT_WORDS = [
  ['apple', 'تفاحة', '🍎', 'food'], ['banana', 'موزة', '🍌', 'food'], ['water', 'ماء', '💧', 'food'],
  ['bread', 'خبز', '🍞', 'food'], ['milk', 'حليب', '🥛', 'food'], ['egg', 'بيضة', '🥚', 'food'],

  ['cat', 'قطة', '🐱', 'animals'], ['dog', 'كلب', '🐶', 'animals'], ['bird', 'عصفور', '🐦', 'animals'],
  ['fish', 'سمكة', '🐟', 'animals'], ['horse', 'حصان', '🐴', 'animals'], ['rabbit', 'أرنب', '🐰', 'animals'],

  ['red', 'أحمر', '🔴', 'colors'], ['blue', 'أزرق', '🔵', 'colors'], ['green', 'أخضر', '🟢', 'colors'],
  ['yellow', 'أصفر', '🟡', 'colors'], ['black', 'أسود', '⚫', 'colors'], ['white', 'أبيض', '⚪', 'colors'],

  ['mother', 'أم', '👩', 'family'], ['father', 'أب', '👨', 'family'], ['brother', 'أخ', '👦', 'family'],
  ['sister', 'أخت', '👧', 'family'], ['baby', 'طفل', '👶', 'family'], ['grandma', 'جدّة', '👵', 'family'],

  ['house', 'بيت', '🏠', 'things'], ['school', 'مدرسة', '🏫', 'things'], ['book', 'كتاب', '📖', 'things'],
  ['car', 'سيارة', '🚗', 'things'], ['pen', 'قلم', '✏️', 'things'], ['door', 'باب', '🚪', 'things'],

  ['sun', 'شمس', '☀️', 'nature'], ['moon', 'قمر', '🌙', 'nature'], ['tree', 'شجرة', '🌳', 'nature'],
  ['flower', 'وردة', '🌸', 'nature'], ['sea', 'بحر', '🌊', 'nature'], ['star', 'نجمة', '⭐', 'nature'],

  ['happy', 'سعيد', '😄', 'describe'], ['sad', 'حزين', '😢', 'describe'], ['big', 'كبير', '🐘', 'describe'],
  ['small', 'صغير', '🐭', 'describe'], ['hot', 'سخن', '🔥', 'describe'], ['cold', 'بارد', '❄️', 'describe'],
];

// ----- رسائل التشجيع -----
const CHEERS_KNOW = ['برافو! 🌟', 'ممتاز! 👏', 'شاطر! 💪', 'يا سلام! 🎉', 'كمّل هيك! 🚀'];
const CHEERS_AGAIN = ['ولا يهمّك، رح ترجعلك بعد شوي 💪', 'عادي، بالتكرار بتنحفظ 🙂', 'المرة الجاية بتعرفها! ✨'];

const STORAGE_KEY = 'flashcards-app-v1';
const STATE_VERSION = 2;

// ----- عناصر الصفحة -----
const $ = (id) => document.getElementById(id);
const cardEl = $('card');
const answerEl = $('answer');
const cheerEl = $('cheer');
const resetBtn = $('resetBtn');

// ----- حالة التطبيق -----
let state = loadState();   // { version, words: [...], settings: { cat, shuffle } }
let queue = [];            // البطاقات الباقية بالجولة الحالية (ids)
let current = null;        // البطاقة المعروضة هلّق
let lastId = null;         // آخر بطاقة، عشان ما تتكرر ورا بعض
let busy = false;          // بيمنع الكبس المتكرر وقت الحركة

// =============================================
// الحفظ والتحميل
// =============================================
function makeDefaultWord([en, ar, emoji, cat], i) {
  return { id: 'd' + i, en, ar, emoji, cat, known: false };
}

function defaultState() {
  return {
    version: STATE_VERSION,
    words: DEFAULT_WORDS.map(makeDefaultWord),
    settings: { cat: 'all', shuffle: true },
  };
}

function loadState() {
  let saved = null;
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch (e) { /* إذا التخزين مش متاح، بنبدأ من الكلمات الجاهزة */ }

  if (!saved || !Array.isArray(saved.words)) return defaultState();
  return upgradeState(saved);
}

// بيحدّث البيانات المحفوظة من النسخة القديمة (بدون تصنيفات) بدون ما يضيع التقدّم
function upgradeState(saved) {
  const byEn = new Map(DEFAULT_WORDS.map((w) => [w[0], w]));
  const validCats = new Set(CATEGORIES.map((c) => c.id));

  saved.words.forEach((w) => {
    if (!validCats.has(w.cat)) {
      const def = byEn.get(String(w.en).toLowerCase());
      w.cat = def ? def[3] : 'mine';
    }
  });

  // أول مرة بعد التحديث: نضيف الكلمات الجاهزة الجديدة
  if ((saved.version || 1) < STATE_VERSION) {
    const have = new Set(saved.words.map((w) => String(w.en).toLowerCase()));
    DEFAULT_WORDS.forEach((w, i) => {
      if (!have.has(w[0])) saved.words.push({ ...makeDefaultWord(w, i), id: 'd' + i + '-v2' });
    });
    saved.version = STATE_VERSION;
  }

  saved.settings = Object.assign({ cat: 'all', shuffle: true }, saved.settings);
  if (saved.settings.cat !== 'all' && !validCats.has(saved.settings.cat)) saved.settings.cat = 'all';
  return saved;
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) { /* التطبيق بضل شغّال حتى لو ما قدر يحفظ */ }
}

// =============================================
// التصنيفات
// =============================================
const catById = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
const selectedCat = () => (state.settings.cat === 'all' ? ALL : catById(state.settings.cat));
const findWord = (id) => state.words.find((w) => w.id === id);

// الكلمات بالتصنيف المختار
function wordsInView() {
  const cat = state.settings.cat;
  return cat === 'all' ? state.words : state.words.filter((w) => w.cat === cat);
}

// يحط ألوان التصنيف على عنصر معيّن
function applyColors(el, cat) {
  el.style.setProperty('--c1', cat.c1);
  el.style.setProperty('--c2', cat.c2);
  el.style.setProperty('--shade', cat.shade);
  el.style.setProperty('--text', cat.text);
}

function renderCats() {
  const nav = $('cats');
  nav.innerHTML = '';

  [ALL, ...CATEGORIES].forEach((cat) => {
    const words = cat.id === 'all' ? state.words : state.words.filter((w) => w.cat === cat.id);
    // نخفي «كلماتي» إذا لسّا ما في كلمات فيه
    if (cat.id === 'mine' && words.length === 0) return;

    const known = words.filter((w) => w.known).length;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chip' + (state.settings.cat === cat.id ? ' active' : '');
    btn.setAttribute('aria-pressed', state.settings.cat === cat.id);
    if (cat.c1) {
      btn.style.setProperty('--chip', cat.c1);
      btn.style.setProperty('--chip-text', cat.text);
    }

    const label = document.createElement('span');
    label.textContent = cat.emoji + ' ' + cat.name;
    const count = document.createElement('span');
    count.className = 'count';
    count.textContent = known + '/' + words.length;
    btn.append(label, count);

    btn.addEventListener('click', () => selectCategory(cat.id));
    nav.append(btn);
  });

  // عالموبايل: نتأكد إن التصنيف المختار باين بالسطر
  const active = nav.querySelector('.chip.active');
  if (active && nav.scrollWidth > nav.clientWidth) {
    active.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
}

function selectCategory(id) {
  if (busy || state.settings.cat === id) return;
  state.settings.cat = id;
  saveState();
  cheerEl.textContent = '';
  lastId = null;
  buildQueue();
  syncCatSelect();
  updateAll();
  goNext();
}

// قائمة التصنيفات بخانة «ضيف كلمة»
function renderCatSelect() {
  const select = $('catSelect');
  select.innerHTML = '';
  CATEGORIES.forEach((cat) => {
    const opt = document.createElement('option');
    opt.value = cat.id;
    opt.textContent = cat.emoji + ' ' + cat.name;
    select.append(opt);
  });
  syncCatSelect();
}

// لما تختار تصنيف، بيصير هو الافتراضي للكلمة الجديدة
function syncCatSelect() {
  $('catSelect').value = state.settings.cat === 'all' ? 'mine' : state.settings.cat;
}

// =============================================
// الجولة: ترتيب البطاقات والخلط
// الجولة فيها الكلمات اللي لسّا ما انحفظت.
// إذا كلهم محفوظين، بتصير جولة مراجعة لكل الكلمات.
// =============================================
function shuffleArray(arr) {
  // خلط Fisher–Yates
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function orderIndex(id) {
  return state.words.findIndex((w) => w.id === id);
}

function buildQueue() {
  const pool = wordsInView();
  let list = pool.filter((w) => !w.known);
  if (list.length === 0) list = pool.slice();

  queue = list.map((w) => w.id);
  if (state.settings.shuffle) shuffleArray(queue);

  // ما نبدأ بنفس البطاقة اللي خلصنا فيها
  if (queue.length > 1 && queue[0] === lastId) queue.push(queue.shift());
}

// بيرجّع البطاقة الجاية من الجولة (وإذا خلصت، بيبدأ جولة جديدة)
function takeNext() {
  queue = queue.filter((id) => findWord(id));
  let newRound = false;
  if (queue.length === 0) {
    buildQueue();
    newRound = true;
  }
  const word = queue.length ? findWord(queue.shift()) : null;
  return { word, newRound };
}

function setShuffle(on) {
  if (busy) return;
  state.settings.shuffle = on;
  saveState();

  if (on) {
    shuffleArray(queue);
    cheerEl.textContent = 'خلطناهم! 🔀';
    // البطاقة بتهتز، وبتطلع بطاقة جديدة من الكومة المخلوطة
    if (current) {
      queue.push(current.id);
      shuffleArray(queue);
      if (queue.length > 1 && queue[0] === current.id) queue.push(queue.shift());
      cardEl.classList.remove('shuffling');
      void cardEl.offsetWidth;
      cardEl.classList.add('shuffling');
      busy = true;
      setTimeout(() => { busy = false; goNext(); }, 560);
    }
  } else {
    queue.sort((a, b) => orderIndex(a) - orderIndex(b));
    cheerEl.textContent = 'رجّعناهم بالترتيب 📋';
  }
  updateToolbar();
}

$('orderBtn').addEventListener('click', () => setShuffle(false));
$('shuffleBtn').addEventListener('click', () => setShuffle(true));
cardEl.addEventListener('animationend', () => cardEl.classList.remove('pop', 'shuffling'));

// =============================================
// عرض البطاقة
// =============================================
function showCard(word) {
  current = word || null;

  cardEl.hidden = !current;
  $('emptyMsg').hidden = Boolean(current);
  if (!current) { setFlipped(false); updateToolbar(); return; }

  lastId = current.id;
  const cat = catById(current.cat);
  applyColors(cardEl, cat);

  const tag = cat.emoji + ' ' + cat.name;
  const emoji = current.emoji || cat.emoji;
  $('frontTag').textContent = tag;
  $('backTag').textContent = tag;
  $('frontEmoji').textContent = emoji;
  $('backEmoji').textContent = emoji;
  $('frontWord').textContent = current.en;
  $('backWord').textContent = current.ar;
  $('backSub').textContent = current.en;
  updateToolbar();
}

function setFlipped(flipped) {
  cardEl.classList.toggle('flipped', flipped);
  answerEl.classList.toggle('show', flipped);
  cardEl.setAttribute('aria-label', flipped && current ? 'المعنى: ' + current.ar : 'اكبس عشان تقلب البطاقة');
}

// بطاقة جديدة مع حركة طلوع ودخول
function goNext() {
  if (busy) return;
  busy = true;
  cardEl.classList.add('leaving');

  setTimeout(() => {
    cardEl.classList.add('instant');       // نرجّع البطاقة لوجهها بدون ما يبيّن المعنى الجديد
    setFlipped(false);
    const { word, newRound } = takeNext();
    showCard(word);
    if (newRound && word && !cheerEl.textContent.includes('🎉')) {
      cheerEl.textContent = allKnownInView() ? 'جولة مراجعة 🔁' : 'جولة جديدة! يلا 🎈';
    }
    void cardEl.offsetWidth;               // بيجبر المتصفح يطبّق التغيير قبل الحركة
    cardEl.classList.remove('instant', 'leaving', 'shuffling');
    cardEl.classList.add('pop');
    busy = false;
  }, 220);
}

// =============================================
// التفاعل مع البطاقة
// =============================================
cardEl.addEventListener('click', () => {
  if (busy || !current) return;
  setFlipped(!cardEl.classList.contains('flipped'));
});

$('knowBtn').addEventListener('click', () => answer(true));
$('againBtn').addEventListener('click', () => answer(false));

function answer(known) {
  if (busy || !current) return;
  const wasAllKnown = allKnownInView();

  current.known = known;
  // «لسّا»: البطاقة بترجع بعد ٣ بطاقات
  if (!known) queue.splice(Math.min(3, queue.length), 0, current.id);
  saveState();
  updateAll();

  if (known && !wasAllKnown && allKnownInView()) {
    const cat = selectedCat();
    cheerEl.textContent = cat.id === 'all'
      ? '🎉 يا بطل! حفظت كل الكلمات!'
      : '🎉 يا بطل! حفظت كل كلمات «' + cat.name + '»!';
    queue = [];   // الجولة خلصت
    confetti();
  } else {
    cheerEl.textContent = randomItem(known ? CHEERS_KNOW : CHEERS_AGAIN);
  }
  goNext();
}

// =============================================
// الإحصائيات وقائمة الكلمات
// =============================================
function allKnownInView() {
  const words = wordsInView();
  return words.length > 0 && words.every((w) => w.known);
}

function updateAll() {
  renderCats();
  updateProgress();
  renderList();
  updateToolbar();
}

function updateProgress() {
  const words = wordsInView();
  const total = words.length;
  const known = words.filter((w) => w.known).length;
  const pct = total ? Math.round((known / total) * 100) : 0;
  const cat = selectedCat();

  const text = $('progressText');
  text.innerHTML = '';
  const k = document.createElement('strong');
  k.textContent = known;
  const t = document.createElement('strong');
  t.textContent = total;
  text.append('حفظت ', k, ' من ', t, cat.id === 'all' ? ' كلمة' : ' بـ «' + cat.name + '»');

  const fill = $('progressFill');
  fill.style.width = pct + '%';
  fill.classList.toggle('rainbow', cat.id === 'all');
  if (cat.c1) applyColors(fill, cat);
  $('progressBar').setAttribute('aria-valuenow', pct);
}

function updateToolbar() {
  const shuffle = state.settings.shuffle;
  $('orderBtn').classList.toggle('active', !shuffle);
  $('shuffleBtn').classList.toggle('active', shuffle);
  $('orderBtn').setAttribute('aria-pressed', !shuffle);
  $('shuffleBtn').setAttribute('aria-pressed', shuffle);

  const left = queue.length + (current ? 1 : 0);
  $('leftCount').textContent = left ? 'باقي ' + left + ' بالجولة' : '';
}

function renderList() {
  const list = $('wordList');
  const words = wordsInView();
  list.innerHTML = '';
  $('listCount').textContent = words.length;

  words.forEach((w) => {
    const cat = catById(w.cat);
    const li = document.createElement('li');
    li.style.setProperty('--dot', cat.c1);

    const emoji = document.createElement('span');
    emoji.className = 'w-emoji';
    emoji.textContent = w.emoji || cat.emoji;

    const text = document.createElement('span');
    text.className = 'w-text';
    const en = document.createElement('bdi');
    en.className = 'w-en';
    en.textContent = w.en;
    const ar = document.createElement('span');
    ar.className = 'w-ar';
    ar.textContent = ' — ' + w.ar;
    text.append(en, ar);

    li.append(emoji, text);

    if (w.known) {
      const badge = document.createElement('span');
      badge.className = 'badge';
      badge.textContent = '✓ محفوظة';
      li.append(badge);
    }

    const del = document.createElement('button');
    del.className = 'del';
    del.type = 'button';
    del.textContent = '×';
    del.setAttribute('aria-label', 'احذف ' + w.en);
    del.addEventListener('click', () => deleteWord(w.id));
    li.append(del);

    list.append(li);
  });
}

function deleteWord(id) {
  state.words = state.words.filter((w) => w.id !== id);
  queue = queue.filter((q) => q !== id);

  // إذا «كلماتي» فضي وهو المختار، بنرجع لـ «الكل»
  if (state.settings.cat !== 'all' && wordsInView().length === 0 && state.settings.cat === 'mine') {
    state.settings.cat = 'all';
    buildQueue();
    syncCatSelect();
  }
  saveState();

  // إذا حذفنا البطاقة المعروضة، بنجيب غيرها
  if (current && current.id === id) {
    lastId = null;
    setFlipped(false);
    showCard(takeNext().word);
  }
  updateAll();
}

// =============================================
// إضافة كلمة جديدة
// =============================================
$('addForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const enInput = $('enInput');
  const arInput = $('arInput');
  const en = enInput.value.trim();
  const ar = arInput.value.trim();
  const catId = $('catSelect').value;
  const msg = $('formMsg');

  if (!en || !ar) return;

  if (state.words.some((w) => w.en.toLowerCase() === en.toLowerCase())) {
    msg.textContent = 'هاي الكلمة موجودة أصلاً 😉';
    msg.className = 'form-msg err';
    return;
  }

  const word = { id: 'c' + Date.now(), en, ar, emoji: '', cat: catId, known: false };
  state.words.push(word);

  // إذا الكلمة من التصنيف المعروض، بندخّلها بالجولة الحالية
  const inView = state.settings.cat === 'all' || state.settings.cat === catId;
  if (inView) {
    const pos = state.settings.shuffle ? Math.floor(Math.random() * (queue.length + 1)) : queue.length;
    queue.splice(pos, 0, word.id);
  }
  saveState();

  const cat = catById(catId);
  msg.textContent = '«' + en + '» انضافت لـ ' + cat.emoji + ' ' + cat.name + ' ✓';
  msg.className = 'form-msg ok';
  enInput.value = '';
  arInput.value = '';
  enInput.focus();

  if (!current && inView) showCard(takeNext().word);
  updateAll();
});

// =============================================
// تصفير التقدّم بالتصنيف المختار (كبستين للتأكيد)
// =============================================
let resetTimer = null;

resetBtn.addEventListener('click', () => {
  const cat = selectedCat();
  if (!resetBtn.classList.contains('confirm')) {
    resetBtn.classList.add('confirm');
    resetBtn.textContent = cat.id === 'all'
      ? 'متأكد؟ رح يتصفّر كل التقدّم — اكبس كمان مرة'
      : 'متأكد؟ رح يتصفّر تقدّم «' + cat.name + '» — اكبس كمان مرة';
    resetTimer = setTimeout(cancelReset, 3500);
    return;
  }
  clearTimeout(resetTimer);
  cancelReset();
  wordsInView().forEach((w) => { w.known = false; });
  saveState();
  lastId = null;
  buildQueue();
  updateAll();
  cheerEl.textContent = 'يلا نبدأ من جديد! 🎈';
  goNext();
});

function cancelReset() {
  resetBtn.classList.remove('confirm');
  resetBtn.textContent = 'ابدأ من جديد';
}

// =============================================
// أدوات صغيرة
// =============================================
function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// قصاصات ملوّنة بتنزل لما يحفظ كل كلمات التصنيف
function confetti() {
  for (let i = 0; i < 60; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti';
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.background = randomItem(CATEGORIES).c1;
    piece.style.animationDuration = 1.6 + Math.random() * 1.4 + 's';
    piece.style.animationDelay = Math.random() * 0.4 + 's';
    document.body.append(piece);
    setTimeout(() => piece.remove(), 3600);
  }
}

// =============================================
// البداية
// =============================================
saveState();          // بيحفظ أي تحديث للبيانات القديمة
renderCatSelect();
buildQueue();
showCard(takeNext().word);
updateAll();
