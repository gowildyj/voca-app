/**
 * 브라우저 목소리 목록 중 품질과 성별 조건에 맞는 최적의 목소리 검색
 */
export const speak = (voices, langCode, preferredGender) => {
  if (!voices.length) return null;

  const normalizedLang = langCode.toLowerCase().replace("_", "-");
  const filteredVoices = voices.filter((v) =>
    v.lang
      .toLowerCase()
      .replace("_", "-")
      .startsWith(normalizedLang.split("-")[0]),
  );

  if (!filteredVoices.length) return voices[0];

  const hqKeywords = ["Google", "Natural", "Premium", "Siri", "Enhanced"];
  const genderKeywords = {
    female: [
      "Female",
      "Samantha",
      "Monica",
      "Google UK English Female",
      "Google US English Female",
    ],
    male: [
      "Male",
      "Daniel",
      "David",
      "Google UK English Male",
      "Google US English Male",
    ],
  };

  // 1순위: 고품질 + 성별 매칭
  let match = filteredVoices.find(
    (v) =>
      hqKeywords.some((hq) => v.name.includes(hq)) &&
      (preferredGender
        ? genderKeywords[preferredGender].some((gk) => v.name.includes(gk))
        : true),
  );

  // 2순위: 성별만 매칭
  if (!match && preferredGender) {
    match = filteredVoices.find((v) =>
      genderKeywords[preferredGender].some((gk) => v.name.includes(gk)),
    );
  }

  return match || filteredVoices[0];
};
