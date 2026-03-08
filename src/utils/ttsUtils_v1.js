/**
 * 브라우저 목소리 목록 중 품질과 성별 조건에 맞는 최적의 목소리 검색
 */
// export const speak = (voices, langCode, preferredGender) => {
//   if (!voices.length) return null;

//   const normalizedLang = langCode.toLowerCase().replace("_", "-");
//   const filteredVoices = voices.filter((v) =>
//     v.lang
//       .toLowerCase()
//       .replace("_", "-")
//       .startsWith(normalizedLang.split("-")[0]),
//   );

//   if (!filteredVoices.length) return voices[0];

//   const hqKeywords = ["Google", "Natural", "Premium", "Siri", "Enhanced"];
//   const genderKeywords = {
//     female: [
//       "Female",
//       "Samantha",
//       "Monica",
//       "Google UK English Female",
//       "Google US English Female",
//     ],
//     male: [
//       "Male",
//       "Daniel",
//       "David",
//       "Google UK English Male",
//       "Google US English Male",
//     ],
//   };

//   // 1순위: 고품질 + 성별 매칭
//   let match = filteredVoices.find(
//     (v) =>
//       hqKeywords.some((hq) => v.name.includes(hq)) &&
//       (preferredGender
//         ? genderKeywords[preferredGender].some((gk) => v.name.includes(gk))
//         : true),
//   );

//   // 2순위: 성별만 매칭
//   if (!match && preferredGender) {
//     match = filteredVoices.find((v) =>
//       genderKeywords[preferredGender].some((gk) => v.name.includes(gk)),
//     );
//   }

//   return match || filteredVoices[0];
// };

/**
 * 상세 이름 리스트 없이 성별/품질 키워드로만 검색
 */
export const speak = (voices, langCode, preferredGender) => {
  if (!voices.length) return null;

  const baseLang = langCode.toLowerCase().split("-")[0];
  const filteredVoices = voices.filter((v) =>
    v.lang.toLowerCase().replace("_", "-").startsWith(baseLang),
  );

  console.group(`🗣️ TTS Auto-Search: [${langCode}] / [${preferredGender}]`);

  if (!filteredVoices.length) {
    console.warn("⚠️ 해당 언어 목소리 없음");
    console.groupEnd();
    return voices[0];
  }

  const scoredVoices = filteredVoices.map((v) => {
    let score = 0;
    const name = v.name.toLowerCase();
    let reason = [];

    // 1. 품질 점수 (전 세계 공통 키워드)
    const hqKeywords = [
      "google",
      "natural",
      "premium",
      "enhanced",
      "siri",
      "neural",
    ];
    if (hqKeywords.some((kw) => name.includes(kw))) {
      score += 10;
      reason.push("High Quality");
    }

    // 2. 성별 점수 (키워드 매칭)
    // 영문/한글/일문 등 최소한의 공통 성별 단어만 사용
    const genderMap = {
      female: ["female", "woman", "girl", "여성", "여자", "女性", "女"],
      male: ["male", "man", "boy", "남성", "남자", "男性", "男"],
    };

    if (
      preferredGender &&
      genderMap[preferredGender].some((kw) => name.includes(kw))
    ) {
      score += 20; // 성별 키워드가 있으면 확실하게 점수 몰아주기
      reason.push("Gender Keyword Match");
    }

    // 3. 로컬 우선순위 (시스템 기본 보이스 방지)
    if (!name.includes("microsoft") || name.includes("online")) {
      score += 2; // 클라우드/온라인 보이스가 보통 더 자연스러움
      reason.push("Online Voice");
    }

    return { voice: v, score, reason: reason.join(", ") || "Default" };
  });

  // 점수 높은 순으로 정렬
  const sorted = scoredVoices.sort((a, b) => b.score - a.score);

  console.table(
    sorted.map((s) => ({
      Name: s.voice.name,
      Score: s.score,
      Reason: s.reason,
    })),
  );

  // 만약 모든 목소리가 0점이라면(성별 키워드가 하나도 없다면)?
  // 그나마 '여자' 목소리가 기본값인 경우가 많으니 첫 번째 걸 뱉습니다.
  const bestMatch = sorted[0].voice;
  console.log(`✅ 최종 선택: ${bestMatch.name}`);
  console.groupEnd();

  return bestMatch;
};

/**
 * 실제로 텍스트를 읽어주는 함수
 */
export const playText = (text, langCode = "fr-FR ") => {
  if (!window.speechSynthesis) {
    console.error("이 브라우저는 TTS를 지원하지 않습니다.");
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  const voices = window.speechSynthesis.getVoices();

  const selectedVoice = speak(voices, langCode, "female");

  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  utterance.lang = langCode;
  utterance.rate = 1.0; // 속도
  utterance.pitch = 1.0; // 음높이

  window.speechSynthesis.speak(utterance);
};
