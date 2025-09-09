export default class setBgm{
  constructor(mp3) {
    this.isPlaying = false;
    this.audio = new Audio(`${mp3}`);
    this.audio.loop = true;
    this.audio.volume = 0.2;
  }

  play() {
    this.isPlaying = true;
    this.audio.play();
  }

  pause() {
    this.isPlaying = false;
    this.audio.pause();
  }

  toggle() { 
    this.isPlaying ? this.pause() : this.play();
  }
}