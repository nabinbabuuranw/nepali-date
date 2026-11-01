import {
  adToBs, bsToAd, todayBs, daysInBsMonth, formatBs, toNepaliDigits,
  BS_MONTHS_EN, BS_MONTHS_NE, WEEKDAYS_EN, WEEKDAYS_NE, MIN_BS_YEAR, MAX_BS_YEAR,
} from '../src/nepali-date.js';

const $ = (id) => document.getElementById(id);
const AD_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const T = {
  en: { title: 'Nepali Date', today: 'Today', adToBs: 'AD → BS', bsToAd: 'BS → AD', pickAd: 'Pick an English (AD) date', pickBs: 'Pick a Nepali (BS) date', copy: 'Copy', copied: 'Copied ✓', calNote: 'Big number = BS day · small number = AD day · Saturday is the public holiday.', dev: 'For developers', devText: 'Zero-dependency JavaScript library, MIT licensed. Supports 2000–2090 BS, every day tested.', toggle: 'नेपाली' },
  ne: { title: 'नेपाली मिति', today: 'आज', adToBs: 'ई.सं. → वि.सं.', bsToAd: 'वि.सं. → ई.सं.', pickAd: 'अंग्रेजी (ई.सं.) मिति छान्नुहोस्', pickBs: 'नेपाली (वि.सं.) मिति छान्नुहोस्', copy: 'कपी', copied: 'कपी भयो ✓', calNote: 'ठूलो अंक = वि.सं. गते · सानो अंक = ई.सं. तारिख · शनिबार सार्वजनिक बिदा।', dev: 'डेभलपरका लागि', devText: 'कुनै dependency बिनाको JavaScript लाइब्रेरी, MIT लाइसेन्स। वि.सं. २०००–२०९० सम्म, हरेक दिन टेस्ट गरिएको।', toggle: 'English' },
};
let lang = localStorage.getItem('nd-lang') === 'ne' ? 'ne' : 'en';
const now = todayBs();
let view = { year: now.year, month: now.month };

const adText = (ad, wd) => `${(lang === 'ne' ? WEEKDAYS_NE : WEEKDAYS_EN)[wd]}, ${ad.day} ${AD_MONTHS[ad.month - 1]} ${ad.year}`;
const bsText = (bs) => formatBs(bs, lang === 'ne' ? 'YYYY MMMM D, dddd' : 'dddd, D MMMM YYYY', lang);
const num = (n) => (lang === 'ne' ? toNepaliDigits(n) : String(n));

function renderToday() {
  $('todayBs').textContent = formatBs(now, lang === 'ne' ? 'YYYY MMMM D' : 'D MMMM YYYY', lang);
  const d = new Date();
  $('todayAd').textContent = adText({ year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() }, d.getDay());
}

function renderAd() {
  const v = $('adInput').value;
  if (!v) return;
  try {
    const bs = adToBs(v);
    $('adOut').innerHTML = `${bsText(bs)}<small>${formatBs(bs, 'YYYY-MM-DD', lang)} ${lang === 'ne' ? 'वि.सं.' : 'BS'}</small>`;
  } catch (e) { $('adOut').textContent = e.message; }
}

function fillSelect(sel, items, value) {
  sel.innerHTML = items.map(([v, label]) => `<option value="${v}"${v === value ? ' selected' : ''}>${label}</option>`).join('');
}
function fillBsSelects(y, m, d) {
  const years = []; for (let i = MIN_BS_YEAR; i <= MAX_BS_YEAR; i++) years.push([i, num(i)]);
  fillSelect($('bsY'), years, y);
  fillSelect($('bsM'), (lang === 'ne' ? BS_MONTHS_NE : BS_MONTHS_EN).map((n, i) => [i + 1, n]), m);
  const dim = daysInBsMonth(y, m);
  const days = []; for (let i = 1; i <= dim; i++) days.push([i, num(i)]);
  fillSelect($('bsD'), days, Math.min(d, dim));
}
function renderBs() {
  const y = +$('bsY').value, m = +$('bsM').value;
  fillBsSelects(y, m, +$('bsD').value);
  const ad = bsToAd(y, m, +$('bsD').value);
  const iso = `${ad.year}-${String(ad.month).padStart(2, '0')}-${String(ad.day).padStart(2, '0')}`;
  $('bsOut').innerHTML = `${adText(ad, ad.weekday)}<small>${iso} AD</small>`;
}

function renderCal() {
  const { year, month } = view;
  $('calTitle').textContent = `${(lang === 'ne' ? BS_MONTHS_NE : BS_MONTHS_EN)[month - 1]} ${num(year)}`;
  const first = bsToAd(year, month, 1);
  const dim = daysInBsMonth(year, month);
  const wds = (lang === 'ne' ? WEEKDAYS_NE : WEEKDAYS_EN).map((w) => (lang === 'ne' ? w.replace('बार', '') : w.slice(0, 3)));
  let html = wds.map((w) => `<div class="wd">${w}</div>`).join('');
  for (let i = 0; i < first.weekday; i++) html += '<div class="d empty"></div>';
  for (let d = 1; d <= dim; d++) {
    const ad = new Date(first.date.getTime() + (d - 1) * 86400000);
    const wd = (first.weekday + d - 1) % 7;
    const cls = ['d', wd === 6 ? 'sat' : '', year === now.year && month === now.month && d === now.day ? 'now' : ''].join(' ');
    html += `<div class="${cls}" role="gridcell" title="${ad.getUTCFullYear()}-${ad.getUTCMonth() + 1}-${ad.getUTCDate()} AD">${num(d)}<small>${ad.getUTCDate()}${ad.getUTCDate() === 1 ? ' ' + AD_MONTHS[ad.getUTCMonth()].slice(0, 3) : ''}</small></div>`;
  }
  $('cal').innerHTML = html;
  $('prev').disabled = year === MIN_BS_YEAR && month === 1;
  $('next').disabled = year === MAX_BS_YEAR && month === 12;
}

function applyLang() {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = T[lang][el.dataset.i18n]; });
  $('lang').textContent = T[lang].toggle;
  fillBsSelects(+$('bsY').value || now.year, +$('bsM').value || now.month, +$('bsD').value || now.day);
  renderToday(); renderAd(); renderBs(); renderCal();
}

$('lang').addEventListener('click', () => { lang = lang === 'en' ? 'ne' : 'en'; localStorage.setItem('nd-lang', lang); applyLang(); });
$('adInput').addEventListener('input', renderAd);
['bsY', 'bsM', 'bsD'].forEach((id) => $(id).addEventListener('change', renderBs));
$('prev').addEventListener('click', () => { view.month--; if (view.month < 1) { view.month = 12; view.year--; } renderCal(); });
$('next').addEventListener('click', () => { view.month++; if (view.month > 12) { view.month = 1; view.year++; } renderCal(); });
document.querySelectorAll('.copy').forEach((b) => b.addEventListener('click', async () => {
  const text = $(b.dataset.copy).innerText.replace(/\n/g, ' · ');
  try { await navigator.clipboard.writeText(text); b.textContent = T[lang].copied; setTimeout(() => { b.textContent = T[lang].copy; }, 1500); } catch { /* clipboard blocked */ }
}));

const d = new Date();
$('adInput').value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
fillBsSelects(now.year, now.month, now.day);
applyLang();
