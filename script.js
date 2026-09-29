// The Ukrainian page sets <html lang="uk">; everything else is English.
const UK = document.documentElement.lang === 'uk';
const tr = (en, uk) => (UK ? uk : en);

// Count-up animation for hero KPI ticker
function animateCountUp(el) {
  const target = parseFloat(el.dataset.target);
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const duration = 1200;
  const start = performance.now();

  const finalText = prefix + target + suffix;
  let done = false;

  function settle() {
    if (done) return;
    done = true;
    el.textContent = finalText;
  }

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = prefix + Math.round(target * eased) + suffix;
    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      settle();
    }
  }
  requestAnimationFrame(tick);

  // rAF is paused while the page isn't rendering (background tab, hidden view),
  // which can strand the counter on a partial value. Guarantee the real number.
  setTimeout(settle, duration + 200);
}

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Reveal-on-scroll for pacing bars and case/job elements
const revealTargets = document.querySelectorAll('.pacing-bar, .case, .situation-log li, .step, .format');
revealTargets.forEach((el) => el.classList.add('reveal'));

const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.2, rootMargin: '0px 0px -40px 0px' });

revealTargets.forEach((el) => io.observe(el));

// Hero KPI count-up, fires once hero is in view
const kpiTicker = document.querySelector('.kpi-ticker');
if (kpiTicker) {
  const kpiObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        document.querySelectorAll('.count-up').forEach((el) => {
          if (reduceMotion) {
            el.textContent = (el.dataset.prefix || '') + el.dataset.target + (el.dataset.suffix || '');
          } else {
            animateCountUp(el);
          }
        });
        kpiObserver.disconnect();
      }
    });
  }, { threshold: 0.4 });
  kpiObserver.observe(kpiTicker);
}

// Service category tabs
const serviceNavItems = document.querySelectorAll('.service-nav-item');
serviceNavItems.forEach((item) => {
  item.addEventListener('click', () => {
    const category = item.dataset.category;
    serviceNavItems.forEach((btn) => {
      const active = btn === item;
      btn.classList.toggle('is-active', active);
      if (active) {
        btn.setAttribute('aria-current', 'true');
      } else {
        btn.removeAttribute('aria-current');
      }
    });
    document.querySelectorAll('.service-panel').forEach((panel) => {
      panel.classList.toggle('is-active', panel.dataset.panel === category);
    });
  });
});

// Contact form -> mailto
const form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    const need = document.getElementById('need').value;
    const budget = document.getElementById('budget').value;

    const subject = encodeURIComponent(tr(`Project inquiry from ${name}`, `Запит на співпрацю від ${name}`));
    const details = [
      need && tr('Looking for: ', 'Потрібно: ') + need,
      budget && tr('Monthly ad budget: ', 'Рекламний бюджет на місяць: ') + budget,
    ].filter(Boolean).join('\n');
    const body = encodeURIComponent(`${details ? details + '\n\n' : ''}${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:kristyzakharchenko@gmail.com?subject=${subject}&body=${body}`;

    const note = document.getElementById('form-note');
    note.textContent = tr('Opening your email app now...', 'Відкриваю вашу пошту…');
  });
}

// ===== Reporting demo dashboard (sample data) =====
(function initDashboard() {
  const dash = document.getElementById('dash');
  if (!dash) return;

  const WEEKS = UK
    ? ['6 лип', '13 лип', '20 лип', '27 лип', '3 серп', '10 серп',
       '17 серп', '24 серп', '31 серп', '7 вер', '14 вер', '21 вер']
    : ['Jul 6', 'Jul 13', 'Jul 20', 'Jul 27', 'Aug 3', 'Aug 10',
       'Aug 17', 'Aug 24', 'Aug 31', 'Sep 7', 'Sep 14', 'Sep 21'];

  // Sample numbers only. Spend in $K per week.
  const DATA = {
    ecom: {
      spend: [18.0, 18.5, 19.0, 19.2, 20.0, 20.5, 21.0, 21.5, 22.0, 23.0, 23.5, 24.0],
      roas:  [2.50, 2.55, 2.65, 2.80, 2.85, 3.00, 3.10, 3.20, 3.15, 3.30, 3.40, 3.50],
      target: 3.0,
      // share of spend, and each channel's ROAS relative to blended
      channels: [
        { name: 'Meta',   spend: 0.55, ratio: 1.00 },
        { name: 'Google', spend: 0.30, ratio: 1.15 },
        { name: 'TikTok', spend: 0.15, ratio: 0.70 },
      ],
    },
    lead: {
      spend: [4.0, 4.1, 4.2, 4.2, 4.4, 4.5, 4.5, 4.6, 4.8, 4.8, 5.0, 5.0],
      cpl:   [38, 36, 34, 33, 31, 29, 28, 27, 26, 24, 23, 22],
      qual:  [0.40, 0.41, 0.42, 0.44, 0.45, 0.47, 0.48, 0.50, 0.51, 0.52, 0.54, 0.55],
      target: 25,
      // share of spend and share of leads
      channels: [
        { name: 'Meta',   spend: 0.60, leads: 0.66 },
        { name: 'Google', spend: 0.30, leads: 0.28 },
        { name: 'TikTok', spend: 0.10, leads: 0.06 },
      ],
    },
  };

  const state = { mode: 'ecom', range: 12, hover: null };

  const $ = (id) => document.getElementById(id);
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  const sum = (a) => a.reduce((x, y) => x + y, 0);
  // Ukrainian: decimal comma, space for thousands.
  const dec = (v, d) => (UK ? v.toFixed(d).replace('.', ',') : v.toFixed(d));
  const int = (n) => Math.round(n).toLocaleString(UK ? 'uk-UA' : 'en-US');
  const money = (k) => '$' + (k >= 1000 ? dec(k / 1000, 2) + 'M' : dec(k, 1) + 'K');
  const usd = (v, d) => '$' + dec(v, d);

  const STATUS_LABEL = UK
    ? { ok: 'У нормі', watch: 'Увага', risk: 'Ризик' }
    : { ok: 'On track', watch: 'Watch', risk: 'At risk' };
  const statusHigherBetter = (v, t) => (v >= t ? 'ok' : v >= t * 0.9 ? 'watch' : 'risk');
  const statusLowerBetter = (v, t) => (v <= t ? 'ok' : v <= t * 1.15 ? 'watch' : 'risk');
  const statusEl = (s) => el('span', 'status status--' + s, STATUS_LABEL[s]);

  // Rich text from parts: strings stay plain, {b: '...'} becomes <strong>.
  function rich(parts) {
    const li = el('li');
    const body = el('span');
    parts.forEach((p) => body.appendChild(typeof p === 'string' ? document.createTextNode(p) : el('strong', null, p.b)));
    li.appendChild(body);
    return li;
  }

  function compute() {
    const d = DATA[state.mode];
    const from = WEEKS.length - state.range;
    const weeks = WEEKS.slice(from);
    const spend = d.spend.slice(from);
    const rangeLabel = state.range + tr(' weeks', ' тижнів');

    if (state.mode === 'ecom') {
      const roasW = d.roas.slice(from);
      const revenue = sum(spend.map((s, i) => s * roasW[i]));
      const totalSpend = sum(spend);
      const roas = revenue / totalSpend;
      const target = dec(d.target, 1);
      const change = roasW.at(-1) - roasW[0];
      return {
        weeks, series: roasW, target: d.target,
        fmt: (v) => dec(v, 2),
        targetLabel: tr('Target ', 'Ціль ') + target,
        title: tr('Weekly ROAS', 'ROAS по тижнях'),
        note: tr('Revenue ÷ ad spend · target ', 'Дохід ÷ витрати на рекламу · ціль ') + target,
        kpis: [
          { label: tr('Ad spend', 'Витрати на рекламу'), value: money(totalSpend), sub: rangeLabel },
          { label: tr('Revenue', 'Дохід'), value: money(revenue), sub: tr('From paid channels', 'З платних каналів') },
          { label: tr('Blended ROAS', 'Загальний ROAS'), value: dec(roas, 2), sub: tr('Target ', 'Ціль ') + target, status: statusHigherBetter(roas, d.target) },
          { label: tr('ROAS change', 'Зміна ROAS'), value: (change >= 0 ? '+' : '') + dec(change, 2), sub: weeks[0] + ' → ' + weeks.at(-1) },
        ],
        channelHead: tr(['Channel', 'Spend', 'ROAS', 'Status'], ['Канал', 'Витрати', 'ROAS', 'Статус']),
        channels: d.channels.map((c) => {
          const r = roas * c.ratio;
          return { name: c.name, spend: money(totalSpend * c.spend), metric: dec(r, 2), status: statusHigherBetter(r, d.target), raw: r };
        }),
        notes: (ch) => {
          const google = ch.find((c) => c.name === 'Google');
          const tiktok = ch.find((c) => c.name === 'TikTok');
          return UK ? [
            ['Загальний ROAS — ', { b: dec(roas, 2) }, (roas >= d.target ? ', вище' : ', нижче') + ' цілі ' + target + ' і зріс з ' + dec(roasW[0], 2) + ' у перший тиждень цього періоду.'],
            ['TikTok дає ', { b: tiktok.metric }, ' проти ' + google.metric + ' у Google. Переношу близько 15% бюджету TikTok у Google Shopping і перевіряю результат за два тижні.'],
            ['Наступний тест: ', { b: 'два нові креативні підходи в Meta' }, ', де сидить більша частина бюджету.'],
          ] : [
            ['Blended ROAS is ', { b: dec(roas, 2) }, roas >= d.target ? ', above the ' : ', below the ', target + ' target, and up from ' + dec(roasW[0], 2) + ' in the first week of this range.'],
            ['TikTok returns ', { b: tiktok.metric }, ' against Google’s ' + google.metric + '. I’m moving about 15% of TikTok budget into Google Shopping and re-checking in two weeks.'],
            ['Next test: ', { b: 'two new creative angles on Meta' }, ', where most of the budget sits.'],
          ];
        },
      };
    }

    const cplW = d.cpl.slice(from);
    const qualW = d.qual.slice(from);
    const leadsW = spend.map((s, i) => (s * 1000) / cplW[i]);
    const leads = sum(leadsW);
    const totalSpend = sum(spend);
    const cpl = (totalSpend * 1000) / leads;
    const qual = sum(leadsW.map((l, i) => l * qualW[i])) / leads;
    return {
      weeks, series: cplW, target: d.target,
      fmt: (v) => usd(v, 0),
      targetLabel: tr('Target $', 'Ціль $') + d.target,
      title: tr('Weekly cost per lead', 'Вартість ліда по тижнях'),
      note: tr('Lower is better · target $', 'Що нижче, то краще · ціль $') + d.target,
      kpis: [
        { label: tr('Ad spend', 'Витрати на рекламу'), value: money(totalSpend), sub: rangeLabel },
        { label: tr('Leads', 'Ліди'), value: int(leads), sub: int(leads * qual) + tr(' qualified', ' кваліфікованих') },
        { label: tr('Cost per lead', 'Вартість ліда'), value: usd(cpl, 2), sub: tr('Target $', 'Ціль $') + d.target, status: statusLowerBetter(cpl, d.target) },
        { label: tr('Qualified rate', 'Частка кваліфікованих'), value: Math.round(qual * 100) + '%', sub: tr('Passed pre-qualification', 'Пройшли попередню кваліфікацію') },
      ],
      channelHead: tr(['Channel', 'Spend', 'CPL', 'Status'], ['Канал', 'Витрати', 'CPL', 'Статус']),
      channels: d.channels.map((c) => {
        const v = cpl * (c.spend / c.leads);
        return { name: c.name, spend: money(totalSpend * c.spend), metric: usd(v, 2), status: statusLowerBetter(v, d.target), raw: v };
      }),
      notes: (ch) => {
        const meta = ch.find((c) => c.name === 'Meta');
        const tiktok = ch.find((c) => c.name === 'TikTok');
        const times = dec(tiktok.raw / meta.raw, 1);
        return UK ? [
          ['Вартість ліда — ', { b: usd(cpl, 2) }, cpl <= d.target ? ', в межах цілі $' + d.target + '.' : ', поки вище цілі $' + d.target + ', але знижується щотижня: з $' + cplW[0] + ' до $' + cplW.at(-1) + '.'],
          ['Ліди з TikTok коштують ', { b: tiktok.metric }, ', у ' + times + ' раза дорожче, ніж у Meta. Вимикаю два найслабші оголошення й оновлюю креативи, перш ніж додавати бюджет.'],
          ['Частка кваліфікованих — ', { b: Math.round(qual * 100) + '%' }, '. Питання для попередньої кваліфікації у формі працює, тож залишаємо його.'],
        ] : [
          ['Cost per lead is ', { b: usd(cpl, 2) }, cpl <= d.target ? ', inside the $' + d.target + ' target.' : ', still above the $' + d.target + ' target, but falling every week: from $' + cplW[0] + ' to $' + cplW.at(-1) + '.'],
          ['TikTok leads cost ', { b: tiktok.metric }, ', ' + times + '× Meta’s. Pausing the two weakest ads and refreshing creative before adding budget.'],
          ['Qualified rate is ', { b: Math.round(qual * 100) + '%' }, '. The pre-qualification question on the form is working, so it stays.'],
        ];
      },
    };
  }

  function renderKpis(v) {
    const box = $('dash-kpis');
    box.replaceChildren();
    v.kpis.forEach((k) => {
      const wrap = el('div', 'dash-kpi');
      wrap.appendChild(el('dt', null, k.label));
      const dd = el('dd');
      dd.appendChild(el('span', 'dash-kpi-value', k.value));
      const sub = el('span', 'dash-kpi-sub', k.sub);
      if (k.status) sub.appendChild(statusEl(k.status));
      dd.appendChild(sub);
      wrap.appendChild(dd);
      box.appendChild(wrap);
    });
  }

  function renderChannels(v) {
    const t = $('dash-channels');
    t.replaceChildren();
    const head = el('tr');
    v.channelHead.forEach((h) => { const th = el('th', null, h); th.scope = 'col'; head.appendChild(th); });
    const thead = el('thead'); thead.appendChild(head); t.appendChild(thead);
    const tbody = el('tbody');
    v.channels.forEach((c) => {
      const row = el('tr');
      row.appendChild(el('td', null, c.name));
      row.appendChild(el('td', null, c.spend));
      row.appendChild(el('td', null, c.metric));
      const td = el('td'); td.appendChild(statusEl(c.status)); row.appendChild(td);
      tbody.appendChild(row);
    });
    t.appendChild(tbody);
  }

  function renderNotes(v) {
    const ol = $('dash-notes');
    ol.replaceChildren(...v.notes(v.channels).map(rich));
  }

  function renderTable(v) {
    const t = $('dash-table');
    t.replaceChildren();
    t.appendChild(el('caption', null, v.title + tr(' (sample data)', ' (демо-дані)')));
    v.weeks.forEach((w, i) => {
      const row = el('tr');
      const th = el('th', null, tr('Week of ', 'Тиждень ') + w); th.scope = 'row';
      row.appendChild(th);
      row.appendChild(el('td', null, v.fmt(v.series[i])));
      t.appendChild(row);
    });
  }

  function niceStep(span) {
    const raw = span / 4;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const n = raw / mag;
    return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * mag;
  }

  const NS = 'http://www.w3.org/2000/svg';
  const svgEl = (tag, attrs) => {
    const n = document.createElementNS(NS, tag);
    Object.entries(attrs || {}).forEach(([k, val]) => n.setAttribute(k, val));
    return n;
  };

  function renderChart(v) {
    const box = $('dash-chart');
    box.replaceChildren();
    const W = box.clientWidth;
    const H = box.clientHeight;
    if (!W || !H) return;

    const m = { top: 14, right: 52, bottom: 28, left: 42 };
    const pw = W - m.left - m.right;
    const ph = H - m.top - m.bottom;

    const lo = Math.min(...v.series, v.target);
    const hi = Math.max(...v.series, v.target);
    const step = niceStep(hi - lo);
    const y0 = Math.floor(lo / step) * step - (lo % step === 0 ? step : 0);
    const y1 = Math.ceil(hi / step) * step + (hi % step === 0 ? step : 0);
    const n = v.series.length;
    const x = (i) => m.left + (n === 1 ? pw / 2 : (i / (n - 1)) * pw);
    const y = (val) => m.top + ph - ((val - y0) / (y1 - y0)) * ph;

    const svg = svgEl('svg', { width: W, height: H, tabindex: 0, role: 'group',
      'aria-label': v.title + tr(', sample data. Use left and right arrow keys to read each week.',
        ', демо-дані. Стрілки вліво та вправо — перегляд по тижнях.') });

    // Recessive grid + y labels
    for (let t = y0; t <= y1 + 1e-9; t += step) {
      svg.appendChild(svgEl('line', { x1: m.left, x2: m.left + pw, y1: y(t), y2: y(t), stroke: 'var(--d-line)', 'stroke-width': 1 }));
      const lab = svgEl('text', { x: m.left - 10, y: y(t) + 4, 'text-anchor': 'end' });
      lab.textContent = v.fmt(t);
      svg.appendChild(lab);
    }

    // X labels, thinned to fit
    const every = Math.ceil(n / Math.max(2, Math.floor(pw / 64)));
    v.weeks.forEach((w, i) => {
      if ((n - 1 - i) % every !== 0) return;
      const lab = svgEl('text', { x: x(i), y: H - 6, 'text-anchor': 'middle' });
      lab.textContent = w;
      svg.appendChild(lab);
    });

    // Target reference line
    svg.appendChild(svgEl('line', { x1: m.left, x2: m.left + pw, y1: y(v.target), y2: y(v.target),
      stroke: 'var(--d-text-2)', 'stroke-width': 1, 'stroke-dasharray': '4 4' }));
    const tl = svgEl('text', { x: m.left + 6, y: y(v.target) - 7 });
    tl.textContent = v.targetLabel.toUpperCase();
    tl.setAttribute('letter-spacing', '0.1em');
    svg.appendChild(tl);

    // Series line
    const d = v.series.map((val, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(val).toFixed(1)).join(' ');
    svg.appendChild(svgEl('path', { d, fill: 'none', stroke: 'var(--d-series)', 'stroke-width': 2,
      'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));

    // Endpoint marker + direct label
    const li = n - 1;
    svg.appendChild(svgEl('circle', { cx: x(li), cy: y(v.series[li]), r: 5, fill: 'var(--d-series)', stroke: 'var(--d-card)', 'stroke-width': 2 }));
    const end = svgEl('text', { x: x(li) + 10, y: y(v.series[li]) + 4 });
    end.textContent = v.fmt(v.series[li]);
    end.setAttribute('style', 'fill: var(--d-text); font-weight: 500;');
    svg.appendChild(end);

    // Hover layer
    const cross = svgEl('line', { y1: m.top, y2: m.top + ph, stroke: 'var(--d-text-2)', 'stroke-width': 1, opacity: 0 });
    const dot = svgEl('circle', { r: 5, fill: 'var(--d-series)', stroke: 'var(--d-card)', 'stroke-width': 2, opacity: 0 });
    const hit = svgEl('rect', { x: m.left - 8, y: m.top, width: pw + 16, height: ph, fill: 'transparent' });
    svg.append(cross, dot, hit);
    box.appendChild(svg);

    const tip = el('div', 'dash-tip');
    tip.setAttribute('aria-hidden', 'true');
    box.appendChild(tip);

    function show(i) {
      state.hover = i;
      const cx = x(i);
      const cy = y(v.series[i]);
      cross.setAttribute('x1', cx); cross.setAttribute('x2', cx); cross.setAttribute('opacity', 1);
      dot.setAttribute('cx', cx); dot.setAttribute('cy', cy); dot.setAttribute('opacity', 1);

      tip.replaceChildren();
      tip.appendChild(el('strong', null, v.fmt(v.series[i])));
      const row = el('span');
      row.appendChild(el('span', 'tip-key'));
      row.appendChild(document.createTextNode(tr('Week of ', 'Тиждень ') + v.weeks[i] + ' · ' + v.targetLabel.toLowerCase()));
      tip.appendChild(row);
      tip.classList.add('is-on');
      const tw = tip.offsetWidth;
      const left = cx + 14 + tw > W ? cx - 14 - tw : cx + 14;
      tip.style.left = left + 'px';
      tip.style.top = Math.max(0, Math.min(cy - 24, H - tip.offsetHeight)) + 'px';
    }
    function hide() {
      state.hover = null;
      cross.setAttribute('opacity', 0);
      dot.setAttribute('opacity', 0);
      tip.classList.remove('is-on');
    }
    const nearest = (px) => Math.max(0, Math.min(n - 1, Math.round(((px - m.left) / pw) * (n - 1))));

    hit.addEventListener('pointermove', (e) => {
      const r = svg.getBoundingClientRect();
      show(nearest(e.clientX - r.left));
    });
    hit.addEventListener('pointerleave', hide);
    svg.addEventListener('focus', () => show(state.hover ?? n - 1));
    svg.addEventListener('blur', hide);
    svg.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      const cur = state.hover ?? n - 1;
      show(Math.max(0, Math.min(n - 1, cur + (e.key === 'ArrowRight' ? 1 : -1))));
    });
  }

  let view;
  function render() {
    view = compute();
    $('dash-chart-title').textContent = view.title;
    $('dash-chart-note').textContent = view.note;
    renderKpis(view);
    renderChannels(view);
    renderNotes(view);
    renderTable(view);
    state.hover = null;
    renderChart(view);
  }

  dash.querySelectorAll('.seg-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.mode ? 'mode' : 'range';
      state[key] = key === 'mode' ? btn.dataset.mode : Number(btn.dataset.range);
      btn.parentElement.querySelectorAll('.seg-btn').forEach((b) => {
        const on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      render();
    });
  });

  render();
  new ResizeObserver(() => view && renderChart(view)).observe($('dash-chart'));
})();
