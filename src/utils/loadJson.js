export default async function loadJson(json) {
  try {
    const res = await fetch(json);
    if (!res.ok) throw new Error(`HTTP 오류! 상태: ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('JSON 로드 실패:', err);
    return null;
  }
}