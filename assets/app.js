(() => {
  'use strict';

  const data = Array.isArray(window.CONFIG_DATA) ? window.CONFIG_DATA : [];
  const benchmarkOrder = ['TUA-Bench', 'ALE-CLI', 'Terminal-Bench 4'];
  const modelOrder = ['Claude Opus 5', 'GPT-6 Astra', 'GLM-5.3', 'Kimi K3', 'DeepSeek V4 Pro'];
  const harnessOrder = ['OpenHands', 'DSH', 'PI', 'openJiuwen', 'Codex', 'Claude Code'];
  const modelColors = {
    'Claude Opus 5': '#b6603e',
    'GPT-6 Astra': '#5f7653',
    'GLM-5.3': '#a47a30',
    'Kimi K3': '#786a88',
    'DeepSeek V4 Pro': '#7f6550'
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const byId = (id) => document.getElementById(id);

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function formatMoney(value, digits = 2) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    }).format(value);
  }

  function median(values) {
    const sorted = [...values].sort((a, b) => a - b);
    if (!sorted.length) return 0;
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function setSelectOptions(select, options, selected) {
    select.innerHTML = options.map((option) => {
      const value = typeof option === 'string' ? option : option.value;
      const label = typeof option === 'string' ? option : option.label;
      return `<option value="${escapeHtml(value)}"${value === selected ? ' selected' : ''}>${escapeHtml(label)}</option>`;
    }).join('');
  }

  function safeStorageGet(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function safeStorageSet(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      // Theme persistence is optional.
    }
  }

  function initTheme() {
    const saved = safeStorageGet('fit-theme');
    const systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = saved || (systemDark ? 'dark' : 'light');
    document.documentElement.dataset.theme = initial;
    updateThemeButton(initial);

    byId('theme-toggle').addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      safeStorageSet('fit-theme', next);
      updateThemeButton(next);
      renderScatter();
    });
  }

  function updateThemeButton(theme) {
    const button = byId('theme-toggle');
    button.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }

  function initHeader() {
    const menuButton = byId('menu-button');
    const mobileNav = byId('mobile-nav');

    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!open));
      mobileNav.hidden = open;
      document.body.classList.toggle('menu-open', !open);
    });

    $$('#mobile-nav a').forEach((link) => {
      link.addEventListener('click', () => {
        menuButton.setAttribute('aria-expanded', 'false');
        mobileNav.hidden = true;
        document.body.classList.remove('menu-open');
      });
    });

    byId('print-button').addEventListener('click', () => window.print());
  }

  function initReadingProgress() {
    const bar = byId('reading-progress-bar');
    const update = () => {
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = documentHeight > 0 ? Math.min(1, window.scrollY / documentHeight) : 0;
      bar.style.width = `${progress * 100}%`;
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
  }

  function initToc() {
    const links = $$('.toc a');
    const linkById = new Map(links.map((link) => [link.getAttribute('href').slice(1), link]));
    const sections = $$('main section[id]').filter((section) => linkById.has(section.id));

    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (!visible.length) return;
      links.forEach((link) => link.classList.remove('active'));
      const active = linkById.get(visible[0].target.id);
      if (active) active.classList.add('active');
    }, { rootMargin: '-18% 0px -68% 0px', threshold: [0, 0.05] });

    sections.forEach((section) => observer.observe(section));
  }

  const analogies = {
    driving: {
      items: [
        ['Model', 'Driver', 'Chooses what to do next using what it can see.'],
        ['Harness', 'Car controls and safety systems', 'Presents the steering, brakes, dashboard, warnings and limits.'],
        ['Task', 'Road and destination', 'A city lane, mountain road and race track demand different behavior.'],
        ['Evaluator', 'Independent driving examiner', 'Judges whether the destination was reached safely and correctly.']
      ],
      takeaway: 'A skilled driver can fail in a vehicle with unclear controls or no warning when the engine overheats. A less impressive driver may do better in a vehicle that exposes the right signals.'
    },
    bi: {
      items: [
        ['Model', 'Analyst deciding the next query', 'Interprets the request and chooses SQL, DAX or another action.'],
        ['Harness', 'Semantic layer, gateway and orchestration', 'Supplies schemas, credentials, refresh rules, errors, limits and execution flow.'],
        ['Task', 'Business question plus data conditions', 'The same logic behaves differently across grain, quality, security and refresh state.'],
        ['Evaluator', 'Reconciled KPI and validation suite', 'Checks the answer against agreed definitions and known totals.']
      ],
      takeaway: 'A clean visual does not rescue a wrong grain or broken semantic model. In the same way, an eloquent model does not rescue weak tools, unsafe permissions or self-defined validation.'
    },
    school: {
      items: [
        ['Model', 'Student', 'Plans the experiment and reacts to observations.'],
        ['Harness', 'Lab equipment and instructions', 'Determines what instruments exist, how errors appear and when the experiment stops.'],
        ['Task', 'Science experiment', 'Different experiments need different equipment and safety controls.'],
        ['Evaluator', 'Teacher with the real answer key', 'Checks the final result independently of the student’s own notes.']
      ],
      takeaway: 'Telling the student “check again” does not help if the measuring scale itself is wrong. The check needs a reliable external reference.'
    }
  };

  function renderAnalogy(key) {
    const analogy = analogies[key];
    byId('analogy-panel').innerHTML = `
      <div class="analogy-map">
        ${analogy.items.map(([label, title, description]) => `
          <div class="analogy-item">
            <span>${escapeHtml(label)}</span>
            <strong>${escapeHtml(title)}</strong>
            <p>${escapeHtml(description)}</p>
          </div>
        `).join('')}
      </div>
      <p class="analogy-takeaway"><strong>Why the analogy works:</strong> ${escapeHtml(analogy.takeaway)}</p>
    `;
  }

  function initAnalogies() {
    const buttons = $$('[data-analogy]');
    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        buttons.forEach((candidate) => candidate.setAttribute('aria-selected', 'false'));
        button.setAttribute('aria-selected', 'true');
        renderAnalogy(button.dataset.analogy);
      });
    });
    renderAnalogy('driving');
  }

  function initRankingFlip() {
    const benchmarkSelect = byId('flip-benchmark');
    const modelASelect = byId('flip-model-a');
    const modelBSelect = byId('flip-model-b');

    setSelectOptions(benchmarkSelect, benchmarkOrder, 'Terminal-Bench 4');
    setSelectOptions(modelASelect, modelOrder, 'Claude Opus 5');
    setSelectOptions(modelBSelect, modelOrder, 'GPT-6 Astra');

    const ensureDifferent = (changed) => {
      if (modelASelect.value !== modelBSelect.value) return;
      const other = modelOrder.find((model) => model !== changed.value);
      if (changed === modelASelect) modelBSelect.value = other;
      else modelASelect.value = other;
    };

    [benchmarkSelect, modelASelect, modelBSelect].forEach((select) => {
      select.addEventListener('change', () => {
        if (select === modelASelect || select === modelBSelect) ensureDifferent(select);
        renderRankingFlip();
      });
    });

    renderRankingFlip();
  }

  function renderRankingFlip() {
    const benchmark = byId('flip-benchmark').value;
    const modelA = byId('flip-model-a').value;
    const modelB = byId('flip-model-b').value;
    const modelARows = data.filter((row) => row.benchmark === benchmark && row.model === modelA);
    const modelBRows = data.filter((row) => row.benchmark === benchmark && row.model === modelB);
    const aByHarness = new Map(modelARows.map((row) => [row.harness, row]));
    const bByHarness = new Map(modelBRows.map((row) => [row.harness, row]));
    const commonHarnesses = harnessOrder.filter((harness) => aByHarness.has(harness) && bByHarness.has(harness));
    const comparisons = commonHarnesses.map((harness) => ({
      harness,
      a: aByHarness.get(harness).score,
      b: bByHarness.get(harness).score,
      gap: aByHarness.get(harness).score - bByHarness.get(harness).score
    }));

    const positive = comparisons.filter((item) => item.gap > 0.005);
    const negative = comparisons.filter((item) => item.gap < -0.005);
    const reversal = positive.length > 0 && negative.length > 0;
    const largest = [...comparisons].sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap))[0];

    const summary = reversal
      ? `<strong class="reversal">Ranking reversal found.</strong> ${escapeHtml(modelA)} leads in ${positive.length} common harness${positive.length === 1 ? '' : 'es'}, while ${escapeHtml(modelB)} leads in ${negative.length}. The largest gap is ${Math.abs(largest.gap).toFixed(2)} points in ${escapeHtml(largest.harness)}.`
      : `<strong>No ranking reversal in the common harnesses for this selection.</strong> ${largest ? `The largest observed gap is ${Math.abs(largest.gap).toFixed(2)} points in ${escapeHtml(largest.harness)}.` : 'There are no shared harnesses to compare.'}`;
    byId('flip-summary').innerHTML = summary;

    const chart = byId('flip-chart');
    if (!comparisons.length) {
      chart.innerHTML = '<p>No shared harnesses are available for this pair.</p>';
      return;
    }

    const scaleMax = Math.max(70, ...comparisons.flatMap((item) => [item.a, item.b]));
    chart.innerHTML = comparisons.map((item) => {
      const gapClass = item.gap > 0.005 ? 'positive' : item.gap < -0.005 ? 'negative' : '';
      const gapLabel = `${item.gap > 0 ? '+' : ''}${item.gap.toFixed(2)}`;
      return `
        <div class="flip-row">
          <div class="flip-harness">${escapeHtml(item.harness)}</div>
          <div class="flip-bars">
            <div class="flip-bar-line">
              <span class="flip-model-label" title="${escapeHtml(modelA)}">${escapeHtml(shortModel(modelA))}</span>
              <div class="flip-track" title="${escapeHtml(modelA)}: ${item.a.toFixed(2)}%"><div class="flip-fill" style="width:${(item.a / scaleMax) * 100}%"></div></div>
            </div>
            <div class="flip-bar-line">
              <span class="flip-model-label" title="${escapeHtml(modelB)}">${escapeHtml(shortModel(modelB))}</span>
              <div class="flip-track" title="${escapeHtml(modelB)}: ${item.b.toFixed(2)}%"><div class="flip-fill model-b" style="width:${(item.b / scaleMax) * 100}%"></div></div>
            </div>
          </div>
          <div class="flip-gap ${gapClass}" title="Model A minus Model B">${gapLabel}</div>
        </div>
      `;
    }).join('');
  }

  function shortModel(model) {
    return model
      .replace('Claude Opus 5', 'Claude')
      .replace('GPT-6 Astra', 'GPT')
      .replace('DeepSeek V4 Pro', 'DeepSeek');
  }

  function initDataLab() {
    setSelectOptions(byId('lab-benchmark'), benchmarkOrder, 'Terminal-Bench 4');
    setSelectOptions(byId('lab-model'), [{ value: 'All', label: 'All models' }, ...modelOrder], 'All');
    setSelectOptions(byId('lab-harness'), [{ value: 'All', label: 'All harnesses' }, ...harnessOrder], 'All');

    ['lab-benchmark', 'lab-model', 'lab-harness', 'lab-native', 'table-sort'].forEach((id) => {
      byId(id).addEventListener('change', renderDataLab);
    });
    byId('table-search').addEventListener('input', renderTable);
    byId('reset-lab').addEventListener('click', () => {
      byId('lab-benchmark').value = 'Terminal-Bench 4';
      byId('lab-model').value = 'All';
      byId('lab-harness').value = 'All';
      byId('lab-native').checked = true;
      byId('table-search').value = '';
      byId('table-sort').value = 'score-desc';
      renderDataLab();
    });

    renderDataLab();
  }

  function getLabRows() {
    const benchmark = byId('lab-benchmark').value;
    const model = byId('lab-model').value;
    const harness = byId('lab-harness').value;
    const includeNative = byId('lab-native').checked;
    return data.filter((row) => {
      return row.benchmark === benchmark
        && (model === 'All' || row.model === model)
        && (harness === 'All' || row.harness === harness)
        && (includeNative || row.type !== 'native');
    });
  }

  function renderDataLab() {
    const rows = getLabRows();
    renderLabKpis(rows);
    renderLegend(rows);
    renderScatter(rows);
    renderTable();
  }

  function renderLabKpis(rows) {
    const container = byId('lab-kpis');
    if (!rows.length) {
      container.innerHTML = '<div class="lab-kpi"><span>Result</span><strong>No matching configurations</strong></div>';
      return;
    }
    const top = [...rows].sort((a, b) => b.score - a.score || a.cost - b.cost)[0];
    const cheapest = [...rows].sort((a, b) => a.cost - b.cost || b.score - a.score)[0];
    const pareto = getPareto(rows);
    const medianCost = median(rows.map((row) => row.cost));
    container.innerHTML = `
      <div class="lab-kpi"><span>Visible configurations</span><strong>${rows.length}</strong></div>
      <div class="lab-kpi"><span>Highest score</span><strong>${top.score.toFixed(2)}% · ${escapeHtml(shortModel(top.model))} / ${escapeHtml(top.harness)}</strong></div>
      <div class="lab-kpi"><span>Lowest cost</span><strong>${formatMoney(cheapest.cost)} · ${escapeHtml(shortModel(cheapest.model))} / ${escapeHtml(cheapest.harness)}</strong></div>
      <div class="lab-kpi"><span>Pareto-efficient / median cost</span><strong>${pareto.length} / ${formatMoney(medianCost)}</strong></div>
    `;
  }

  function renderLegend(rows) {
    const present = modelOrder.filter((model) => rows.some((row) => row.model === model));
    byId('chart-legend').innerHTML = present.map((model) => `
      <span class="legend-item"><span class="legend-dot" style="background:${modelColors[model]}"></span>${escapeHtml(shortModel(model))}</span>
    `).join('');
  }

  function getPareto(rows) {
    return rows.filter((candidate) => {
      return !rows.some((other) => {
        const noMoreCost = other.cost <= candidate.cost;
        const noLessScore = other.score >= candidate.score;
        const strict = other.cost < candidate.cost || other.score > candidate.score;
        return noMoreCost && noLessScore && strict;
      });
    }).sort((a, b) => a.cost - b.cost);
  }

  function svgEl(name, attributes = {}, text = '') {
    const element = document.createElementNS('http://www.w3.org/2000/svg', name);
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
    if (text) element.textContent = text;
    return element;
  }

  function renderScatter(explicitRows) {
    const svg = byId('scatter-chart');
    if (!svg) return;
    const rows = Array.isArray(explicitRows) ? explicitRows : getLabRows();
    svg.innerHTML = '';

    const width = 900;
    const height = 520;
    const margin = { top: 28, right: 34, bottom: 66, left: 76 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const ink = cssVar('--ink');
    const soft = cssVar('--ink-soft');
    const faint = cssVar('--ink-faint');
    const line = cssVar('--line');
    const accentSoft = cssVar('--accent-soft');
    const warmSoft = cssVar('--warm-soft');

    if (!rows.length) {
      svg.appendChild(svgEl('text', { x: width / 2, y: height / 2, fill: soft, 'text-anchor': 'middle', 'font-size': 16 }, 'No matching configurations'));
      return;
    }

    const costs = rows.map((row) => row.cost).filter((value) => value > 0);
    const scores = rows.map((row) => row.score);
    let minCost = Math.min(...costs);
    let maxCost = Math.max(...costs);
    if (minCost === maxCost) {
      minCost *= 0.8;
      maxCost *= 1.2;
    }
    minCost *= 0.82;
    maxCost *= 1.22;
    const logMin = Math.log10(minCost);
    const logMax = Math.log10(maxCost);
    const yMin = Math.max(0, Math.floor((Math.min(...scores) - 5) / 10) * 10);
    const yMax = Math.min(100, Math.ceil((Math.max(...scores) + 5) / 10) * 10);

    const x = (cost) => margin.left + ((Math.log10(cost) - logMin) / (logMax - logMin)) * innerWidth;
    const y = (score) => margin.top + innerHeight - ((score - yMin) / (yMax - yMin || 1)) * innerHeight;

    const medianCost = median(costs);
    const medianScore = median(scores);
    const medianX = x(medianCost);
    const medianY = y(medianScore);

    svg.appendChild(svgEl('rect', {
      x: margin.left,
      y: margin.top,
      width: Math.max(0, medianX - margin.left),
      height: Math.max(0, medianY - margin.top),
      fill: accentSoft,
      opacity: 0.55
    }));
    svg.appendChild(svgEl('rect', {
      x: medianX,
      y: medianY,
      width: Math.max(0, margin.left + innerWidth - medianX),
      height: Math.max(0, margin.top + innerHeight - medianY),
      fill: warmSoft,
      opacity: 0.45
    }));

    const yStep = yMax - yMin <= 30 ? 5 : 10;
    for (let tick = yMin; tick <= yMax + 0.001; tick += yStep) {
      const yy = y(tick);
      svg.appendChild(svgEl('line', { x1: margin.left, y1: yy, x2: margin.left + innerWidth, y2: yy, stroke: line, 'stroke-width': 1 }));
      svg.appendChild(svgEl('text', { x: margin.left - 12, y: yy + 4, fill: faint, 'text-anchor': 'end', 'font-size': 11 }, `${tick}%`));
    }

    const tickCandidates = [0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100];
    tickCandidates.filter((tick) => tick >= minCost && tick <= maxCost).forEach((tick) => {
      const xx = x(tick);
      svg.appendChild(svgEl('line', { x1: xx, y1: margin.top, x2: xx, y2: margin.top + innerHeight, stroke: line, 'stroke-width': 1 }));
      svg.appendChild(svgEl('text', { x: xx, y: margin.top + innerHeight + 23, fill: faint, 'text-anchor': 'middle', 'font-size': 11 }, formatMoney(tick, tick < 1 ? 2 : 0)));
    });

    svg.appendChild(svgEl('line', { x1: margin.left, y1: margin.top + innerHeight, x2: margin.left + innerWidth, y2: margin.top + innerHeight, stroke: soft, 'stroke-width': 1.3 }));
    svg.appendChild(svgEl('line', { x1: margin.left, y1: margin.top, x2: margin.left, y2: margin.top + innerHeight, stroke: soft, 'stroke-width': 1.3 }));

    svg.appendChild(svgEl('text', { x: margin.left + innerWidth / 2, y: height - 18, fill: soft, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 650 }, 'Model cost per task (USD, logarithmic scale)'));
    const yLabel = svgEl('text', { x: 18, y: margin.top + innerHeight / 2, fill: soft, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 650, transform: `rotate(-90 18 ${margin.top + innerHeight / 2})` }, 'Score (fixed task denominator)');
    svg.appendChild(yLabel);

    const attractiveLabel = svgEl('text', { x: margin.left + 10, y: margin.top + 18, fill: soft, 'font-size': 10, 'font-weight': 700 }, 'Higher score / lower cost');
    svg.appendChild(attractiveLabel);

    const pareto = getPareto(rows);
    if (pareto.length > 1) {
      const pathData = pareto.map((row, index) => `${index === 0 ? 'M' : 'L'} ${x(row.cost)} ${y(row.score)}`).join(' ');
      svg.appendChild(svgEl('path', { d: pathData, fill: 'none', stroke: ink, 'stroke-width': 1.4, 'stroke-dasharray': '5 5', opacity: 0.75 }));
    }

    rows.forEach((row) => {
      const group = svgEl('g', {
        tabindex: 0,
        role: 'button',
        'aria-label': `${row.model} with ${row.harness}: score ${row.score.toFixed(2)} percent, cost ${formatMoney(row.cost)} per task`
      });
      group.style.cursor = 'pointer';
      const isPareto = pareto.includes(row);
      if (row.best || isPareto) {
        group.appendChild(svgEl('circle', {
          cx: x(row.cost),
          cy: y(row.score),
          r: row.best ? 10 : 9,
          fill: 'none',
          stroke: row.best ? cssVar('--warm') : ink,
          'stroke-width': row.best ? 2 : 1.2,
          opacity: 0.8
        }));
      }
      const point = svgEl('circle', {
        cx: x(row.cost),
        cy: y(row.score),
        r: row.type === 'native' ? 6.5 : 5.5,
        fill: modelColors[row.model],
        stroke: row.type === 'native' ? ink : cssVar('--surface'),
        'stroke-width': row.type === 'native' ? 2.2 : 1.5
      });
      group.appendChild(point);
      const show = (event) => showTooltip(event, row, isPareto);
      const hide = () => hideTooltip();
      group.addEventListener('mouseenter', show);
      group.addEventListener('mousemove', show);
      group.addEventListener('mouseleave', hide);
      group.addEventListener('focus', show);
      group.addEventListener('blur', hide);
      svg.appendChild(group);
    });
  }

  function showTooltip(event, row, isPareto) {
    const tooltip = byId('chart-tooltip');
    tooltip.innerHTML = `
      <strong>${escapeHtml(row.model)} × ${escapeHtml(row.harness)}</strong>
      <span>Score: ${row.score.toFixed(2)}%</span>
      <span>Cost per task: ${formatMoney(row.cost)}</span>
      <span>Pairing: ${row.type === 'native' ? 'Native reference' : 'Configurable'}</span>
      <span>${row.best ? 'Best observed harness for this model and benchmark' : isPareto ? 'On the visible Pareto frontier' : ''}</span>
    `;
    tooltip.hidden = false;
    const x = event.clientX || (event.target.getBoundingClientRect().left + 10);
    const y = event.clientY || (event.target.getBoundingClientRect().top + 10);
    const left = Math.min(window.innerWidth - 245, x + 14);
    const top = Math.min(window.innerHeight - 150, y + 14);
    tooltip.style.left = `${Math.max(8, left)}px`;
    tooltip.style.top = `${Math.max(8, top)}px`;
  }

  function hideTooltip() {
    byId('chart-tooltip').hidden = true;
  }

  function renderTable() {
    const rows = getLabRows();
    const search = byId('table-search').value.trim().toLowerCase();
    const sort = byId('table-sort').value;
    let filtered = rows.filter((row) => `${row.model} ${row.harness} ${row.type}`.toLowerCase().includes(search));

    const sorters = {
      'score-desc': (a, b) => b.score - a.score || a.cost - b.cost,
      'cost-asc': (a, b) => a.cost - b.cost || b.score - a.score,
      'efficiency-desc': (a, b) => (b.score / b.cost) - (a.score / a.cost),
      'model-asc': (a, b) => a.model.localeCompare(b.model) || a.harness.localeCompare(b.harness)
    };
    filtered = [...filtered].sort(sorters[sort]);

    byId('config-table-body').innerHTML = filtered.map((row) => `
      <tr>
        <td>${escapeHtml(row.model)}</td>
        <td>${escapeHtml(row.harness)}</td>
        <td><span class="type-pill ${row.type === 'native' ? 'native' : ''}">${escapeHtml(row.type)}</span></td>
        <td>${row.score.toFixed(2)}%</td>
        <td>${formatMoney(row.cost)}</td>
        <td><span class="result-pill ${row.best ? 'best' : ''}">${row.best ? 'Highest recorded' : 'Alternative'}</span></td>
      </tr>
    `).join('');
    byId('table-count').textContent = `${filtered.length} row${filtered.length === 1 ? '' : 's'}`;
  }

  const caseStudies = {
    timeout: {
      eyebrow: 'Matched recovery case · TUA 056-move-textbox-left',
      title: 'The same hanging command became silence in one harness and feedback in another.',
      intro: 'Kimi K3 used GIMP to edit an image but omitted the command that tells GIMP to quit. The process waited indefinitely. What happened next depended on the shell policy around the model.',
      result: 'openJiuwen: reward 1 in 11 min · PI: reward 0 at 40-min deadline',
      left: {
        title: 'Kimi K3 + PI · failed',
        className: 'fail',
        steps: [
          '<strong>Checks the environment</strong> and finds GIMP.',
          '<strong>Runs the GIMP command</strong> without a quit instruction.',
          '<strong>No default timeout:</strong> the shell call never returns.',
          '<strong>No failure signal reaches the model.</strong>',
          '<strong>The task deadline arrives</strong> with no output file.'
        ]
      },
      right: {
        title: 'Kimi K3 + openJiuwen · passed',
        className: 'pass',
        steps: [
          '<strong>Earlier GIMP attempts fail</strong>; errors return to the model.',
          '<strong>A later call hangs</strong>, but the shell has a 300-second limit.',
          '<strong>The timeout returns as feedback.</strong>',
          '<strong>The model diagnoses the missing quit instruction</strong> and simplifies the approach.',
          '<strong>The harness asks for a final re-check;</strong> the output passes.'
        ]
      },
      lesson: 'The model supplied the recovery, but only after the harness converted a hang into a usable signal. The paper also notes that the successful run was partly fortunate because the hung command had already written the output.'
    },
    verification: {
      eyebrow: 'Completion failure · Terminal-Bench 4',
      title: 'A confident “verified” report was not independent evidence.',
      intro: 'Among 45 failed Terminal-Bench 4 tasks for openJiuwen with Kimi K3, 35 ended with a closing report. Every one of those reports said all requirements had been verified. The external grader still failed the work.',
      result: '35 self-certified failure reports · 3 known discrepancies dismissed · external tests failed',
      left: {
        title: 'openJiuwen + Kimi · reward 0',
        className: 'fail',
        steps: [
          '<strong>Repairs reduce pixel mismatch</strong> by more than two orders of magnitude.',
          '<strong>The comparison is changed</strong> so different frames are compared.',
          '<strong>The new self-built test reads zero mismatch.</strong>',
          '<strong>Seven more re-check turns reuse the same criterion.</strong>',
          '<strong>The final report claims pixel-perfect output;</strong> the grader finds 123 of 61,440 pixels wrong.'
        ]
      },
      right: {
        title: 'DSH + Kimi · reward 1',
        className: 'pass',
        steps: [
          '<strong>Uses its own acceptance test</strong> and continues diagnosing.',
          '<strong>Removes the remaining defect</strong> instead of changing the comparison.',
          '<strong>Reaches zero for the right reason.</strong>',
          '<strong>Runs a longer trajectory</strong> with more calls and time.',
          '<strong>Passes every external verifier test.</strong>'
        ]
      },
      lesson: 'More checking did not help when every check reused the same flawed oracle. A completion prompt cannot replace an external acceptance criterion. The right question is not “Did the agent check?” but “What evidence did it check against?”'
    },
    continuation: {
      eyebrow: 'Prompted continuation case · TUA 042-black-sale-coffee-makers',
      title: 'A continue message can recover work, but it can also override a correct hand-back.',
      intro: 'GPT-6 Astra encountered a Google reCAPTCHA under three harnesses and initially asked the user to complete it. PI and DSH ended there. openJiuwen sent a generic instruction to continue working on the original task.',
      result: 'openJiuwen: reward 1 · PI and DSH: reward 0',
      left: {
        title: 'PI / DSH · stopped',
        className: 'fail',
        steps: [
          '<strong>Model reaches reCAPTCHA.</strong>',
          '<strong>Model asks the user</strong> to complete the human step.',
          '<strong>Harness ends the run.</strong>',
          '<strong>Benchmark reward is zero.</strong>',
          '<strong>Operationally, the hand-back may still be the safer policy.</strong>'
        ]
      },
      right: {
        title: 'openJiuwen · continued',
        className: 'pass',
        steps: [
          '<strong>Model reaches the same reCAPTCHA</strong> and asks the user.',
          '<strong>Generic continuation fires twice.</strong>',
          '<strong>Model installs an offline speech recognizer.</strong>',
          '<strong>It transcribes the audio challenge</strong> and continues.',
          '<strong>The benchmark task completes.</strong>'
        ]
      },
      lesson: 'Reward alone is a poor label for training or policy. The high-reward trace may teach an agent to defeat a human-gated step, while the zero-reward trace may reflect the deployment policy we actually want. Continuation needs an explicit “needs human” state that the harness respects.'
    }
  };

  function initCaseStudies() {
    const buttons = $$('[data-case]');
    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        buttons.forEach((candidate) => candidate.setAttribute('aria-selected', 'false'));
        button.setAttribute('aria-selected', 'true');
        renderCase(button.dataset.case);
      });
    });
    renderCase('timeout');
  }

  function renderCase(key) {
    const item = caseStudies[key];
    byId('case-panel').innerHTML = `
      <div class="case-intro">
        <div>
          <p class="eyebrow">${escapeHtml(item.eyebrow)}</p>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.intro)}</p>
        </div>
        <div class="case-result-box"><span>Observed result</span><strong>${escapeHtml(item.result)}</strong></div>
      </div>
      <div class="trace-compare">
        ${[item.left, item.right].map((trace) => `
          <article class="trace-card ${trace.className}">
            <h4>${escapeHtml(trace.title)}</h4>
            <ol class="trace-steps">${trace.steps.map((step) => `<li>${step}</li>`).join('')}</ol>
          </article>
        `).join('')}
      </div>
      <div class="case-lesson"><strong>My engineering lesson:</strong> ${escapeHtml(item.lesson)}</div>
    `;
  }

  const workloadPlans = {
    sql: {
      name: 'SQL and BI questions',
      tasks: 'validated business questions covering KPI definition, grain, filters, time logic, joins, empty results and security boundaries',
      checks: 'reconciled values, read-only enforcement, query timeout, row limits, source citation and semantic-definition match',
      risks: 'wrong KPI with a convincing explanation, unsafe SQL, hidden filter context and leakage across security boundaries'
    },
    code: {
      name: 'Code changes',
      tasks: 'representative bug fixes, small features, dependency changes, refactors and failure-recovery cases',
      checks: 'tests defined before execution, diff review, static/security checks, rollback and preserved behavior',
      risks: 'self-written tests that prove the patch, broad edits, secret exposure, non-reproducible success and incomplete rollback'
    },
    workflow: {
      name: 'Workflow automation',
      tasks: 'successful runs, transient failures, permanent failures, duplicate triggers, partial completion and human-required steps',
      checks: 'idempotency, run state, bounded retry, stop reason, side-effect count, approval and recovery after interruption',
      risks: 'duplicate side effects, retry storms, silent partial completion, unsafe continuation and missing audit evidence'
    },
    terminal: {
      name: 'Terminal and operations',
      tasks: 'diagnosis, configuration, file operations, long-running commands, malformed calls, timeouts and permission failures',
      checks: 'sandbox boundary, command timeout, structured errors, artifact verification, privilege limit and explicit completion state',
      risks: 'hung commands, destructive operations, false completion, privilege escalation and unrecoverable environment drift'
    }
  };

  function initPlanBuilder() {
    ['plan-workload', 'plan-risk', 'plan-models', 'plan-harnesses'].forEach((id) => {
      byId(id).addEventListener('change', renderPlan);
    });
    byId('copy-plan').addEventListener('click', copyPlan);
    renderPlan();
  }

  function buildPlanText() {
    const workload = workloadPlans[byId('plan-workload').value];
    const risk = byId('plan-risk').value;
    const modelCount = Number(byId('plan-models').value);
    const harnessCount = Number(byId('plan-harnesses').value);
    const configCount = modelCount * harnessCount;
    const taskCount = risk === 'high' ? 60 : risk === 'medium' ? 40 : 24;
    const repeats = risk === 'high' ? 3 : risk === 'medium' ? 2 : 1;
    const totalRuns = configCount * taskCount * repeats;
    const approval = risk === 'high'
      ? 'Require human approval for every material side effect and block promotion on any critical safety failure.'
      : risk === 'medium'
        ? 'Require approval for writes, production actions and unresolved verification gaps.'
        : 'Keep writes bounded and review a sample before promotion.';

    return {
      title: `${workload.name}: ${configCount}-configuration evaluation`,
      steps: [
        `Create ${taskCount} representative tasks: ${workload.tasks}.`,
        `Cross ${modelCount} models with ${harnessCount} harnesses. Run ${repeats} time${repeats === 1 ? '' : 's'} per task where practical (${totalRuns.toLocaleString('en-US')} planned task-runs).`,
        `Record external task score, cost, p50/p95 latency, model calls, uncached tokens, tool errors, retries, stop reason and human interventions.`,
        `Gate on: ${workload.checks}.`,
        `Review failure trajectories for: ${workload.risks}. Separate model-initiated, harness-prompted and system-performed actions.`,
        `${approval} Among configurations that pass the gates, choose the best score-cost-latency trade-off and retain a rollback path.`
      ]
    };
  }

  function renderPlan() {
    const plan = buildPlanText();
    byId('plan-output').innerHTML = `
      <h4>${escapeHtml(plan.title)}</h4>
      <ol>${plan.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ol>
    `;
    byId('copy-status').textContent = '';
  }

  async function copyPlan() {
    const plan = buildPlanText();
    const text = `${plan.title}\n\n${plan.steps.map((step, index) => `${index + 1}. ${step}`).join('\n')}`;
    const ok = await copyText(text);
    byId('copy-status').textContent = ok ? 'Copied.' : 'Copy failed. Select the plan manually.';
  }

  const glossary = [
    ['Acceptance criterion', 'The rule used to decide whether the final deliverable is correct. It should ideally be defined independently of the agent doing the work.'],
    ['Agent', 'A system in which a model can take actions through tools, observe results and continue until it stops.'],
    ['Benchmark', 'A fixed collection of tasks and scoring rules used to compare systems.'],
    ['Cache hit rate', 'The share of input tokens reused from a provider cache instead of being processed as new input.'],
    ['Configuration', 'A specific model-harness pairing under a defined task, tool and runtime setup.'],
    ['Context compaction', 'Compressing or summarizing earlier conversation and tool history so work can continue within a context limit.'],
    ['Empirical fit', 'The highest recorded harness score for a model on a particular benchmark among the tested options. It is an observed result, not a universal law.'],
    ['Harness', 'The runtime around the model: tools, context, memory, permissions, retries, timeouts, continuation and stopping behavior.'],
    ['Idempotency', 'A property that lets an operation be repeated without creating an additional effect, such as loading the same file twice.'],
    ['Model-initiated action', 'A repair or decision the model took on its own after seeing the available evidence.'],
    ['Native pairing', 'A vendor model used with that vendor’s own agent harness, such as GPT with Codex or Claude with Claude Code.'],
    ['Pareto frontier', 'Configurations for which no other visible configuration is both cheaper and at least as accurate, with one strict improvement.'],
    ['Partial credit', 'A score between complete failure and complete success. TUA-Bench and ALE-CLI retained partial rewards in this study.'],
    ['Reward', 'The numeric result returned by the benchmark verifier for a completed run.'],
    ['Self-verification', 'The agent checking its own output. It is useful evidence, but it can fail when the agent invents or changes the criterion.'],
    ['Stop reason', 'The explicit state explaining why a run ended: completed, failed, blocked, timed out, budget exhausted or needs human help.'],
    ['Tool call', 'A structured request from the model to execute an external action, such as running a command or editing a file.'],
    ['Trajectory', 'The full sequence of model messages, tool calls, tool results, errors, repairs and completion steps in one run.'],
    ['Verifier', 'The external grader that checks the result and assigns a reward. It should be separate from the agent’s own claims.']
  ];

  function initGlossary() {
    byId('glossary-search').addEventListener('input', renderGlossary);
    renderGlossary();
  }

  function renderGlossary() {
    const query = byId('glossary-search').value.trim().toLowerCase();
    const filtered = glossary.filter(([term, definition]) => `${term} ${definition}`.toLowerCase().includes(query));
    byId('glossary-grid').innerHTML = filtered.length
      ? filtered.map(([term, definition]) => `<article class="glossary-item"><h3>${escapeHtml(term)}</h3><p>${escapeHtml(definition)}</p></article>`).join('')
      : '<p>No matching term.</p>';
  }

  function initCitation() {
    byId('copy-citation').addEventListener('click', async () => {
      const ok = await copyText(byId('bibtex').textContent.trim());
      byId('citation-status').textContent = ok ? 'Copied.' : 'Copy failed. Select the text manually.';
    });
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand('copy');
      textarea.remove();
      return ok;
    } catch (error) {
      return false;
    }
  }

  function init() {
    initTheme();
    initHeader();
    initReadingProgress();
    initToc();
    initAnalogies();
    initRankingFlip();
    initDataLab();
    initCaseStudies();
    initPlanBuilder();
    initGlossary();
    initCitation();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
