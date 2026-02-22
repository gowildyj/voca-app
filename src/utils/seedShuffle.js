/**
 * 결정론적 난수 생성기 (간단한 LCG 알고리즘)
 * seed 기반으로 일관된 난수를 발생시킴
 */
const createRandomGenerator = (seed) => {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

/**
 * 배열을 시드에 따라 결정적으로 섞은 새 배열 반환 (성능 최적화 버전)
 */
export function seededShuffle(array, seed) {
  if (!Array.isArray(array) || array.length <= 1) return [...array];

  const result = [...array];
  const random = createRandomGenerator(seed || 42);

  // Fisher-Yates 셔플 알고리즘 (가장 빠르고 균일함)
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}
