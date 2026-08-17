// app.js — Vanilla JavaScript helper utilities
// Used by dashboard.html for non-React pages

const API_BASE = '';   // Same origin as server.js

// ── Storage helpers (session token) ───────────────────────────────────────
const Auth = {
  setToken: (t) => sessionStorage.setItem('ia_token', t),
  getToken: ()  => sessionStorage.getItem('ia_token'),
  setUser:  (u) => sessionStorage.setItem('ia_user', JSON.stringify(u)),
  getUser:  ()  => JSON.parse(sessionStorage.getItem('ia_user') || 'null'),
  clear:    ()  => { sessionStorage.removeItem('ia_token'); sessionStorage.removeItem('ia_user'); },
  isLoggedIn: ()=> !!sessionStorage.getItem('ia_token'),
};

// ── API wrapper ────────────────────────────────────────────────────────────
async function api(method, path, body = null) {
  const opts = {
    method,
    headers: {
      'Content-Type':  'application/json',
      'x-auth-token':  Auth.getToken() || '',
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res  = await fetch(`${API_BASE}/api${path}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

const GET    = (path)        => api('GET',    path);
const POST   = (path, body)  => api('POST',   path, body);
const PUT    = (path, body)  => api('PUT',    path, body);
const DELETE = (path)        => api('DELETE', path);

// ── Validation ─────────────────────────────────────────────────────────────
const Validate = {
  name:  (v) => /^[A-Za-z\s.]+$/.test(v)  || 'Letters only',
  email: (v) => v.includes('@')            || 'Must contain @',
  phone: (v) => /^\d{10,}$/.test(v)        || 'Minimum 10 digits',
  id:    (v) => /^[A-Za-z0-9]+$/.test(v)   || 'Alphanumeric only',
  mark:  (v) => (+v >= 0 && +v <= 100)     || 'Must be 0–100',
  run: (rules, data) => {
    const errors = {};
    for (const [field, fn] of Object.entries(rules)) {
      const result = fn(data[field] ?? '');
      if (result !== true) errors[field] = result;
    }
    return errors;
  },
};

// ── Toast notification ─────────────────────────────────────────────────────
function showToast(msg, type = 'success') {
  const el   = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

// ── Avg + Result ───────────────────────────────────────────────────────────
function calcAverage(ia1, ia2, ia3)  { return +((+ia1 + +ia2 + +ia3) / 3).toFixed(2); }
function calcResult(avg)             { return avg >= 40 ? 'Pass' : 'Fail'; }

// ── Table builder helper ───────────────────────────────────────────────────
function buildTable(container, columns, rows) {
  const thead = columns.map(c => `<th>${c}</th>`).join('');
  const tbody = rows.map(row =>
    `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`
  ).join('');
  container.innerHTML = `
    <div class="table-wrap">
      <table class="ia-table">
        <thead><tr>${thead}</tr></thead>
        <tbody>${tbody || '<tr><td colspan="${columns.length}" style="text-align:center;color:var(--muted);padding:24px">No data found</td></tr>'}</tbody>
      </table>
    </div>`;
}

// ── Badge HTML helper ──────────────────────────────────────────────────────
function badge(text, type = 'accent') {
  return `<span class="badge badge-${type}">${text}</span>`;
}

// ── Chart helpers (Chart.js) ───────────────────────────────────────────────
const COLORS = ['#7c6af7','#f76a8c','#6af7c4','#f7c46a','#a78bfa','#fb7185'];
const CHART_DEFAULTS = {
  plugins: { legend: { labels: { color: '#9999aa', font: { family: 'DM Sans' } } } },
  scales: {
    x: { ticks: { color: '#6b6b80' }, grid: { color: '#2a2a38' } },
    y: { ticks: { color: '#6b6b80' }, grid: { color: '#2a2a38' } },
  },
};

function makeBarChart(canvasId, labels, data, label = 'Score') {
  const ctx = document.getElementById(canvasId)?.getContext('2d');
  if (!ctx) return null;
  return new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets: [{ label, data, backgroundColor: COLORS[0] + 'bb', borderRadius: 6 }] },
    options: { ...CHART_DEFAULTS, responsive: true, maintainAspectRatio: false, plugins: { ...CHART_DEFAULTS.plugins, legend: { display: false } }, scales: { ...CHART_DEFAULTS.scales, y: { ...CHART_DEFAULTS.scales.y, min: 0, max: 100 } } },
  });
}

function makePieChart(canvasId, labels, data) {
  const ctx = document.getElementById(canvasId)?.getContext('2d');
  if (!ctx) return null;
  return new Chart(ctx, {
    type: 'pie',
    data: { labels, datasets: [{ data, backgroundColor: ['rgba(74,222,128,0.85)', 'rgba(248,113,113,0.85)'], borderWidth: 2, borderColor: '#1e1e28' }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: CHART_DEFAULTS.plugins },
  });
}

function makeLineChart(canvasId, labels, datasets) {
  const ctx = document.getElementById(canvasId)?.getContext('2d');
  if (!ctx) return null;
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: datasets.map((d, i) => ({ label: d.label, data: d.data, borderColor: COLORS[i % COLORS.length], backgroundColor: 'transparent', tension: 0.4, pointRadius: 5 })),
    },
    options: { ...CHART_DEFAULTS, responsive: true, maintainAspectRatio: false, scales: { ...CHART_DEFAULTS.scales, y: { ...CHART_DEFAULTS.scales.y, min: 0, max: 100 } } },
  });
}

// ── CSV export ─────────────────────────────────────────────────────────────
function downloadCSV(rows, filename = 'report.csv') {
  const csv   = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const a     = document.createElement('a');
  a.href      = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  a.download  = filename;
  a.click();
}

// ── Redirect if not logged in ──────────────────────────────────────────────
function requireLogin(allowedRoles = []) {
  if (!Auth.isLoggedIn()) { window.location.href = '/'; return null; }
  const user = Auth.getUser();
  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    window.location.href = '/';
    return null;
  }
  return user;
}

// ── Export for module use ──────────────────────────────────────────────────
if (typeof module !== 'undefined') {
  module.exports = { Auth, api, GET, POST, PUT, DELETE, Validate, showToast, calcAverage, calcResult, buildTable, badge, makeBarChart, makePieChart, makeLineChart, downloadCSV, requireLogin };
}
