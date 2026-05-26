import * as THREE from 'three';

export function createBrickTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#8a8a8a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const brickW = 48;
  const brickH = 20;
  const gap = 4;

  ctx.fillStyle = '#6d6d6d';

  const rows = Math.ceil(canvas.height / (brickH + gap)) + 1;
  const cols = Math.ceil(canvas.width / (brickW + gap)) + 1;

  for (let row = 0; row < rows; row++) {
    const offsetX = row % 2 === 0 ? 0 : (brickW + gap) / 2;
    for (let col = 0; col < cols; col++) {
      const x = col * (brickW + gap) + offsetX + gap / 2;
      const y = row * (brickH + gap) + gap / 2;
      ctx.fillRect(x, y, brickW, brickH);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 2);
  texture.anisotropy = 4;
  return texture;
}

export function createWoodTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const imageData = ctx.createImageData(256, 256);
  for (let y = 0; y < 256; y++) {
    for (let x = 0; x < 256; x++) {
      const noise = (Math.random() - 0.5) * 12;
      const r = 195 + noise;
      const g = 80 + noise * 0.5;
      const b = 58 + noise * 0.3;
      const idx = (y * 256 + x) * 4;
      imageData.data[idx] = r;
      imageData.data[idx + 1] = g;
      imageData.data[idx + 2] = b;
      imageData.data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);

  for (let i = 0; i < 35; i++) {
    const baseY = Math.random() * 256;
    const alpha = Math.random() * 0.2 + 0.05;
    ctx.strokeStyle = `rgba(110, 42, 28, ${alpha})`;
    ctx.lineWidth = Math.random() * 2 + 0.5;
    ctx.beginPath();
    for (let x = 0; x <= 256; x += 2) {
      const wave = Math.sin(x * 0.03 + i * 1.5) * 4 + Math.sin(x * 0.07 + i * 3) * 2;
      ctx.lineTo(x, baseY + wave);
    }
    ctx.stroke();
  }

  for (let i = 0; i < 6; i++) {
    const y = Math.random() * 256;
    ctx.strokeStyle = `rgba(80, 28, 18, ${Math.random() * 0.12 + 0.04})`;
    ctx.lineWidth = Math.random() * 4 + 2;
    ctx.beginPath();
    for (let x = 0; x <= 256; x += 4) {
      const wave = Math.sin(x * 0.02 + i * 2) * 6;
      ctx.lineTo(x, y + wave);
    }
    ctx.stroke();
  }

  for (let i = 0; i < 3; i++) {
    const kx = Math.random() * 256;
    const ky = Math.random() * 256;
    const r = Math.random() * 6 + 3;
    const grad = ctx.createRadialGradient(kx, ky, 0, kx, ky, r);
    grad.addColorStop(0, 'rgba(55, 16, 8, 0.8)');
    grad.addColorStop(0.5, 'rgba(80, 28, 18, 0.4)');
    grad.addColorStop(1, 'rgba(110, 42, 28, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(kx, ky, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 4;
  return texture;
}

export function createTileTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const tileSize = 32;
  const grout = 2;

  ctx.fillStyle = '#3a3a3a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const cols = Math.ceil(canvas.width / (tileSize + grout));
  const rows = Math.ceil(canvas.height / (tileSize + grout));

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * (tileSize + grout) + grout;
      const y = r * (tileSize + grout) + grout;
      const shade = 45 + Math.floor(Math.random() * 25);
      ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
      ctx.fillRect(x, y, tileSize, tileSize);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(7, 7);
  texture.anisotropy = 4;
  return texture;
}
