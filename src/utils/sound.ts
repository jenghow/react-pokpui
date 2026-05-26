let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

export function playWoodHitSound() {
  try {
    const ctx = getAudioContext();
    const sampleRate = ctx.sampleRate;
    const duration = 0.12;
    const length = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 35);
      const noise = (Math.random() * 2 - 1) * 0.4;
      const tone = Math.sin(t * 2800 * (1 - t * 5)) * 0.3;
      const click = Math.sin(t * 12000) * Math.exp(-t * 200) * 0.2;
      data[i] = (noise + tone + click) * envelope;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 700;
    filter.Q.value = 2.5;

    const gain = ctx.createGain();
    gain.gain.value = 0.6;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start();
  } catch { /* audio context may not be available */ }
}
