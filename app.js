const palette    = document.getElementById('palette');
const modeSelect = document.getElementById('modeSelect');
const generateBtn= document.getElementById('generateBtn');
const exportBtn  = document.getElementById('exportBtn');
const exportBox  = document.getElementById('exportBox');
const exportText = document.getElementById('exportText');
const copyExport = document.getElementById('copyExport');

let currentColors = [];

generateBtn.addEventListener('click', generate);
exportBtn.addEventListener('click', toggleExport);
copyExport.addEventListener('click', () => {
  navigator.clipboard.writeText(exportText.value);
  copyExport.textContent = 'Copied!';
  setTimeout(() => copyExport.textContent = 'Copy', 1500);
});

document.addEventListener('keydown', e => {
  if (e.code === 'Space' && e.target === document.body) {
    e.preventDefault();
    generate();
  }
});

// ── Color math ──────────────────────────────────────────
function randHue() { return Math.floor(Math.random() * 360); }

function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgb(${r}, ${g}, ${b})`;
}

function generateColors(mode) {
  const h = randHue();
  const s = 65 + Math.random() * 20;
  switch (mode) {
    case 'analogous':
      return [-40,-20,0,20,40].map(offset => hslToHex((h + offset + 360) % 360, s, 55));
    case 'complementary': {
      const l = [30,45,60,45,30];
      return [h,h,h, (h+180)%360, (h+180)%360].map((hue,i) => hslToHex(hue, s, l[i]));
    }
    case 'triadic':
      return [0,0,120,120,240].map((offset,i) =>
        hslToHex((h + offset) % 360, s, [45,60,45,60,55][i]));
    case 'monochromatic':
      return [25,38,52,66,80].map(l => hslToHex(h, s, l));
    default: // random
      return Array.from({length:5}, () => hslToHex(randHue(), 55 + Math.random()*30, 45 + Math.random()*20));
  }
}

// ── Render ───────────────────────────────────────────────
function generate() {
  currentColors = generateColors(modeSelect.value);
  palette.innerHTML = '';

  currentColors.forEach(hex => {
    const swatch = document.createElement('div');
    swatch.className = 'swatch';
    swatch.style.background = hex;

    const info = document.createElement('div');
    info.className = 'swatch-info';
    info.innerHTML = `<div class="swatch-hex">${hex.toUpperCase()}</div>
                      <div class="swatch-rgb">${hexToRgb(hex)}</div>`;

    const toast = document.createElement('div');
    toast.className = 'copy-toast';
    toast.textContent = 'Copied!';

    swatch.appendChild(info);
    swatch.appendChild(toast);

    swatch.addEventListener('click', () => {
      navigator.clipboard.writeText(hex.toUpperCase());
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 1000);
    });

    palette.appendChild(swatch);
  });

  if (!exportBox.classList.contains('hidden')) renderExport();
}

function toggleExport() {
  exportBox.classList.toggle('hidden');
  if (!exportBox.classList.contains('hidden')) renderExport();
}

function renderExport() {
  const css = `:root {\n${currentColors.map((c,i) => `  --color-${i+1}: ${c.toUpperCase()};`).join('\n')}\n}`;
  exportText.value = css;
}

generate();
