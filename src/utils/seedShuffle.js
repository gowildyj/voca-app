// src/utils/seedShuffle.js

/**
 * 배열을 시드에 따라 결정적으로 섞은 새 배열 반환 (성능 최적화 버전)
 */

export function seededShuffle(array, seed) {
  if (!Array.isArray(array) || array.length <= 1) return [...array];

  const result = [...array];

  // 🌟 조금 더 균일한 난수를 위한 간단한 해시 함수 적용
  let s = seed || 42;
  const random = () => {
    s = Math.sin(s) * 10000;
    return s - Math.floor(s);
  };

  // Fisher-Yates 셔플
  for (let i = result.length - 1; i > 0; i--) {
    // 0부터 i까지의 인덱스 중 하나를 무작위로 선택
    const j = Math.floor(random() * (i + 1));

    // i번째와 j번째를 교체
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}
