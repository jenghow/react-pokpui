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
