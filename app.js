const imageInput = document.getElementById('imageInput');
const beadWidthInput = document.getElementById('beadWidth');
const beadHeightInput = document.getElementById('beadHeight');
const beadSizeInput = document.getElementById('beadSize');
const paletteSizeInput = document.getElementById('paletteSize');
const generateBtn = document.getElementById('generateBtn');
const downloadPngBtn = document.getElementById('downloadPngBtn');
const downloadCsvBtn = document.getElementById('downloadCsvBtn');
const summary = document.getElementById('summary');
const rowGuide = document.getElementById('rowGuide');
const sourceCanvas = document.getElementById('sourceCanvas');
const beadCanvas = document.getElementById('beadCanvas');
const legend = document.getElementById('legend');

const sourceCtx = sourceCanvas.getContext('2d');
const beadCtx = beadCanvas.getContext('2d');

let loadedImage = null;
let lastPattern = null;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function rgbToHex(r, g, b) {
  const toHex = (n) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function quantizeColor(r, g, b, levels) {
  const step = 255 / (levels - 1);
  const q = (v) => Math.round(v / step) * step;
  return [q(r), q(g), q(b)].map((v) => clamp(Math.round(v), 0, 255));
}

function drawCircle(ctx, x, y, radius, fillStyle) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = fillStyle;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.35, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fill();
}

function renderLegend(usageMap, paletteByFrequency) {
  legend.innerHTML = '';

  paletteByFrequency.forEach((hex, index) => {
    const count = usageMap.get(hex) || 0;
    const item = document.createElement('div');
    item.className = 'legend-item';

    const swatch = document.createElement('span');
    swatch.className = 'swatch';
    swatch.style.backgroundColor = hex;

    const code = document.createElement('span');
    code.className = 'code';
    code.textContent = `C${index + 1}`;

    const text = document.createElement('span');
    text.textContent = `${hex.toUpperCase()} · ${count} bolitas`;

    item.append(swatch, code, text);
    legend.appendChild(item);
  });
}

function createCsvFromMatrix(matrix) {
  return matrix.map((row) => row.join(',')).join('\n');
}

function compressRow(row) {
  if (row.length === 0) {
    return '';
  }

  const parts = [];
  let current = row[0];
  let count = 1;

  for (let i = 1; i < row.length; i += 1) {
    if (row[i] === current) {
      count += 1;
    } else {
      parts.push(`${current}x${count}`);
      current = row[i];
      count = 1;
    }
  }

  parts.push(`${current}x${count}`);
  return parts.join(' · ');
}

function renderRowGuide(matrix) {
  const lines = matrix.map((row, idx) => `Fila ${idx + 1}: ${compressRow(row)}`);
  rowGuide.textContent = lines.join('\n');
}

function generatePattern() {
  if (!loadedImage) {
    alert('Primero sube una imagen.');
    return;
  }

  const beadWidth = clamp(parseInt(beadWidthInput.value, 10) || 200, 40, 400);
  const beadHeight = clamp(parseInt(beadHeightInput.value, 10) || 12, 6, 30);
  const beadSize = clamp(parseInt(beadSizeInput.value, 10) || 10, 4, 30);
  const paletteSize = clamp(parseInt(paletteSizeInput.value, 10) || 12, 2, 32);

  sourceCanvas.width = loadedImage.width;
  sourceCanvas.height = loadedImage.height;
  sourceCtx.clearRect(0, 0, sourceCanvas.width, sourceCanvas.height);
  sourceCtx.drawImage(loadedImage, 0, 0);

  const downsampleCanvas = document.createElement('canvas');
  downsampleCanvas.width = beadWidth;
  downsampleCanvas.height = beadHeight;
  const downsampleCtx = downsampleCanvas.getContext('2d');
  downsampleCtx.drawImage(loadedImage, 0, 0, beadWidth, beadHeight);

  const imgData = downsampleCtx.getImageData(0, 0, beadWidth, beadHeight);
  const { data } = imgData;

  beadCanvas.width = beadWidth * beadSize;
  beadCanvas.height = beadHeight * beadSize;
  beadCtx.clearRect(0, 0, beadCanvas.width, beadCanvas.height);

  const quantLevels = clamp(Math.round(Math.cbrt(paletteSize) + 1), 2, 8);
  const usageMap = new Map();

  const colors = [];
  for (let y = 0; y < beadHeight; y += 1) {
    for (let x = 0; x < beadWidth; x += 1) {
      const idx = (y * beadWidth + x) * 4;
      const [qr, qg, qb] = quantizeColor(data[idx], data[idx + 1], data[idx + 2], quantLevels);
      const hex = rgbToHex(qr, qg, qb);
      colors.push(hex);
      usageMap.set(hex, (usageMap.get(hex) || 0) + 1);
    }
  }

  const paletteByFrequency = Array.from(usageMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, paletteSize)
    .map(([hex]) => hex);

  const fallbackColor = paletteByFrequency[0];
  const colorToId = new Map(paletteByFrequency.map((hex, i) => [hex, i + 1]));
  const matrix = [];

  for (let y = 0; y < beadHeight; y += 1) {
    const row = [];
    for (let x = 0; x < beadWidth; x += 1) {
      const idx = y * beadWidth + x;
      let hex = colors[idx];
      if (!colorToId.has(hex)) {
        hex = fallbackColor;
      }

      const colorId = colorToId.get(hex);
      row.push(`C${colorId}`);

      const centerX = x * beadSize + beadSize / 2;
      const centerY = y * beadSize + beadSize / 2;
      drawCircle(beadCtx, centerX, centerY, beadSize * 0.45, hex);
    }
    matrix.push(row);
  }

  summary.textContent = `Manilla: ${beadWidth} columnas × ${beadHeight} filas (${beadWidth * beadHeight} bolitas) · ${paletteByFrequency.length} colores.`;
  renderLegend(usageMap, paletteByFrequency);
  renderRowGuide(matrix);

  lastPattern = {
    beadWidth,
    beadHeight,
    matrix,
  };

  downloadPngBtn.disabled = false;
  downloadCsvBtn.disabled = false;
}

function downloadPatternPng() {
  if (!lastPattern) {
    return;
  }

  const link = document.createElement('a');
  link.href = beadCanvas.toDataURL('image/png');
  link.download = `miyuki-manilla-${lastPattern.beadWidth}x${lastPattern.beadHeight}.png`;
  link.click();
}

function downloadPatternCsv() {
  if (!lastPattern) {
    return;
  }

  const csv = createCsvFromMatrix(lastPattern.matrix);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `miyuki-manilla-${lastPattern.beadWidth}x${lastPattern.beadHeight}.csv`;
  link.click();

  URL.revokeObjectURL(url);
}

imageInput.addEventListener('change', (event) => {
  const [file] = event.target.files;
  if (!file) {
    return;
  }

  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    loadedImage = img;
    generatePattern();
    URL.revokeObjectURL(url);
  };
  img.src = url;
});

generateBtn.addEventListener('click', generatePattern);
downloadPngBtn.addEventListener('click', downloadPatternPng);
downloadCsvBtn.addEventListener('click', downloadPatternCsv);
