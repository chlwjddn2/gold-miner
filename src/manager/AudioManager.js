class AudioManager {
  constructor() {
    this.sounds = {};
    this.scene = null; // Phaser.Scene 참조
  }

  // Scene 등록 (필수: sound 시스템 접근용)
  registerScene = (scene) => {
    this.scene = scene;
  }

  // 오디오 로드 및 인스턴스 생성
  add = (key, config = {}) => {
    if (!this.scene) throw new Error('Scene not registered');
    if (!this.sounds[key]) this.sounds[key] = this.scene.sound.add(key, config);
    return this.sounds[key];
  }

  play = (key, onComplete = null) => {
    const sound = this.sounds[key] || this.add(key);
    if (sound) sound.play();
    if (typeof onComplete === 'function') sound.once('complete', onComplete);
  }

  pause = (key) => {
    const sound = this.sounds[key];
    if (sound && sound.isPlaying) sound.pause();
  }

  resume = (key) => {
    const sound = this.sounds[key];z
    if (sound && sound.isPaused) sound.resume();
  }

  stop = (key) => {
    const sound = this.sounds[key];
    if (sound) sound.stop();
  }

  setVolume = (key, volume) => {
    const sound = this.sounds[key];
    if (sound) sound.setVolume(volume);
  }

  // 전체 오디오 제어
  pauseAll = () => {
    Object.values(this.sounds).forEach(sound => sound.isPlaying && sound.pause());
  }

  resumeAll = () => {
    Object.values(this.sounds).forEach(sound => sound.isPaused && sound.resume());
  }
  
  stopAll = () => {
    Object.values(this.sounds).forEach(sound => sound.stop());
  }
}

const audioManager = new AudioManager();
export default audioManager;
