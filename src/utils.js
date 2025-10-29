/**
 * 배열 섞는 함수
 * @param {array} array
 */
export function shuffleArray(array) {
  for (let index = array.length - 1; index > 0; index--) {
    const randomPosition = Math.floor(Math.random() * (index + 1));
    const temporary = array[index];
    array[index] = array[randomPosition];
    array[randomPosition] = temporary;
  }
}

/**
 * 지정된 JSON 파일을 비동기적으로 로드하는 함수
 * @param {string} jsonUrl - JSON 파일 경로 (상대 또는 절대 URL)
 */
export async function loadJson(jsonUrl) {
  try {
    const res = await fetch(jsonUrl);
    if (!res.ok) throw new Error(`HTTP 오류! 상태: ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('JSON 로드 실패:', err);
    return null;
  }
}

/**
 * 단일 사운드 효과를 재생하는 함수
 * @param {string} src - 오디오 파일 경로
 * @param {number} [volume=1.0] - 볼륨 (0.0 ~ 1.0)
 */
export async function playSoundEffect(src, volume = 1.0) {
  try {
    const audio = new Audio(src);
    audio.volume = Math.min(Math.max(volume, 0), 1); // 볼륨 범위 제한
    await audio.play();
  } catch (e) {
    console.warn('사운드 재생 실패:', e);
  }
}