/**
 * 시드 기반 간단 해시 (문자열 -> 숫자)
 * shuffle 정렬 시 같은 시드면 같은 순서 보장
 */
function hash(str) {
  if (typeof str !== "string") str = String(str);
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return h;
}

/**
 * 배열을 시드에 따라 결정적으로 섞은 새 배열 반환 (원본 변경 없음)
 */
export function seededShuffle(array, seed) {
  const seedStr = String(seed);
  return [...array].sort(
    (a, b) =>
      hash(String(a?.id ?? a) + seedStr) - hash(String(b?.id ?? b) + seedStr),
  );
}
