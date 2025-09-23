export default function playSoundEffect(src, volume = 1.0) {
  const audio = new Audio(src);
  audio.volume = volume;  // 0.0 ~ 1.0
  audio.play().catch((e) => {
    console.warn('사운드 재생 실패:', e);
  });
}