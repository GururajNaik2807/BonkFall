export class AudioManager {
  private ctx: AudioContext | null = null;
  private buffers: Map<string, AudioBuffer> = new Map();
  private lastVoiceTime: number = 0;
  
  // Audio Pools (4-5 clips per category)
  private warriorVoices = ['warrior_voice_1', 'warrior_voice_2', 'warrior_voice_3', 'warrior_voice_4', 'warrior_voice_5'];
  private mageVoices = ['mage_voice_1', 'mage_voice_2', 'mage_voice_3', 'mage_voice_4'];
  private warriorFx = ['warrior_slash_1', 'warrior_slash_2', 'warrior_slash_3', 'warrior_slash_4'];
  private mageFx = ['mage_whoosh_1', 'mage_whoosh_2', 'mage_whoosh_3', 'mage_whoosh_4'];

  private lastIndices: Record<string, number> = {
    warriorVoice: -1, mageVoice: -1, warriorFx: -1, mageFx: -1
  };

  private initialized = false;
  private noiseBuffer: AudioBuffer | null = null;

  constructor() {
    const initAudio = () => {
      this.init();
      window.removeEventListener('keydown', initAudio);
      window.removeEventListener('click', initAudio);
    };
    window.addEventListener('keydown', initAudio);
    window.addEventListener('click', initAudio);
  }

  async init() {
    if (this.initialized) return;
    this.initialized = true;
    
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.createNoiseBuffer();
      
      const allAssets = [
        ...this.warriorVoices, ...this.mageVoices, 
        ...this.warriorFx, ...this.mageFx
      ];

      for (const name of allAssets) {
        this.loadSound(name, `/sounds/${name}.mp3`);
      }
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }

  private createNoiseBuffer() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 1.5; 
    this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = this.noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  }

  private async loadSound(key: string, url: string) {
    if (!this.ctx) return;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const arrayBuffer = await res.arrayBuffer();
      const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
      this.buffers.set(key, audioBuffer);
    } catch (e) {
      // Missing assets seamlessly fall back to synthesis
    }
  }

  private getRandomIndex(poolLength: number, lastIndexKey: string): number {
    let idx = Math.floor(Math.random() * poolLength);
    if (poolLength > 1) {
      while (idx === this.lastIndices[lastIndexKey]) {
        idx = Math.floor(Math.random() * poolLength);
      }
    }
    this.lastIndices[lastIndexKey] = idx;
    return idx;
  }

  public playWarriorAttack(isHeavy: boolean = false) {
    this.playFX(this.warriorFx, 'warrior', 'warriorFx', isHeavy);
    this.playVoice(this.warriorVoices, 'warrior', 'warriorVoice', isHeavy);
  }

  public playMageAttack(isHeavy: boolean = false) {
    this.playFX(this.mageFx, 'mage', 'mageFx', isHeavy);
    this.playVoice(this.mageVoices, 'mage', 'mageVoice', isHeavy);
  }

  private playFX(pool: string[], type: 'warrior' | 'mage', tracker: string, isHeavy: boolean) {
    if (!this.ctx) return;
    
    const idx = this.getRandomIndex(pool.length, tracker);
    const key = pool[idx];
    const buffer = this.buffers.get(key);
    
    // Playback rate 0.94x to 1.06x
    const pitchJitter = 0.94 + Math.random() * 0.12; 
    // Volume jitter ±5%
    const baseVol = isHeavy ? 1.3 : 1.0;
    const volJitter = baseVol * (0.95 + Math.random() * 0.1);  

    if (buffer) {
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.value = pitchJitter * (isHeavy ? 0.9 : 1.0); // heavier attacks pitch down
      const gainNode = this.ctx.createGain();
      gainNode.gain.value = volJitter;
      source.connect(gainNode);
      gainNode.connect(this.ctx.destination);
      source.start(0);
    } else {
      this.playFallbackSynthFX(type, pitchJitter, volJitter, isHeavy, idx);
    }
  }

  private playVoice(pool: string[], type: 'warrior' | 'mage', tracker: string, isHeavy: boolean) {
    if (!this.ctx) return;
    
    const now = this.ctx.currentTime;
    
    // Cooldown logic: bypass if it's a heavy/combo attack to guarantee shout
    if (!isHeavy) {
      if (now - this.lastVoiceTime < 0.35) return;
      if (Math.random() > 0.60) return; // 60% probability for normal attacks
    }
    
    this.lastVoiceTime = now;

    const idx = this.getRandomIndex(pool.length, tracker);
    const key = pool[idx];
    const buffer = this.buffers.get(key);
    
    const pitchJitter = 0.94 + Math.random() * 0.12; 
    const baseVol = isHeavy ? 0.8 : 0.5;
    const volJitter = baseVol * (0.95 + Math.random() * 0.1); 

    if (buffer) {
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.value = pitchJitter * (isHeavy ? 0.85 : 1.0);
      const gainNode = this.ctx.createGain();
      gainNode.gain.value = volJitter; 
      source.connect(gainNode);
      gainNode.connect(this.ctx.destination);
      source.start(0);
    } else {
      this.playFallbackSynthVoice(type, pitchJitter, volJitter, isHeavy, idx);
    }
  }

  private playFallbackSynthFX(type: 'warrior' | 'mage', pitch: number, vol: number, isHeavy: boolean, variant: number) {
    if (!this.ctx || !this.noiseBuffer) return;
    const now = this.ctx.currentTime;

    if (type === 'warrior') {
      const duration = isHeavy ? 0.25 : 0.15;
      const baseFreq = isHeavy ? 800 : (1200 + variant * 100);
      
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq * pitch, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + duration);
      
      oscGain.gain.setValueAtTime(0.8 * vol, now);
      oscGain.gain.exponentialRampToValueAtTime(0.01, now + duration);
      
      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + duration);

      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = isHeavy ? 'bandpass' : 'highpass';
      filter.frequency.value = isHeavy ? 1000 : 2000;
      
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.6 * vol, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + duration);
      
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      
      noise.start(now);
      noise.stop(now + duration);

    } else {
      const duration = isHeavy ? 0.6 : 0.3;
      
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(400 * pitch, now);
      filter.frequency.linearRampToValueAtTime(isHeavy ? 2000 : 1200, now + duration * 0.33);
      filter.frequency.linearRampToValueAtTime(isHeavy ? 100 : 300, now + duration);
      filter.Q.value = 3 + variant * 0.5; 

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0, now);
      noiseGain.gain.linearRampToValueAtTime(1.2 * vol, now + duration * 0.16);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + duration);
      
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      
      noise.start(now);
      noise.stop(now + duration);

      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300 * pitch, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + duration * 0.33);
      osc.frequency.exponentialRampToValueAtTime(isHeavy ? 50 : 200, now + duration);
      
      oscGain.gain.setValueAtTime(0, now);
      oscGain.gain.linearRampToValueAtTime(0.3 * vol, now + duration * 0.16);
      oscGain.gain.exponentialRampToValueAtTime(0.01, now + duration);
      
      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + duration);
    }
  }

  private playFallbackSynthVoice(type: 'warrior' | 'mage', pitch: number, vol: number, isHeavy: boolean, variant: number) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    if (type === 'warrior') {
      const duration = isHeavy ? 0.4 : 0.25;
      osc.type = 'sawtooth';
      const baseFreq = (isHeavy ? 70 : 90 + variant * 5) * pitch;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.6, now + duration);
      
      gain.gain.setValueAtTime(0.4 * vol, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + duration);
    } else {
      const duration = isHeavy ? 0.3 : 0.18;
      osc.type = 'triangle';
      const baseFreq = (isHeavy ? 300 : 450 + variant * 20) * pitch;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * (isHeavy ? 2.5 : 1.6), now + duration);
      
      const tremolo = this.ctx.createOscillator();
      tremolo.frequency.value = 15 + variant * 2;
      const tremoloGain = this.ctx.createGain();
      tremoloGain.gain.value = 0.5;
      tremolo.connect(tremoloGain.gain);
      tremolo.start(now);
      tremolo.stop(now + duration);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.3 * vol, now + duration * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + duration);
    }
  }
}

export const audioManager = new AudioManager();
