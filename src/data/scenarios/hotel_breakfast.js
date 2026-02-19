export const hotelBreakfast = {
  id: "hb_01",
  learning_lang: "en",
  base_lang: "ko",
  title_learning: "Ordering Hotel Breakfast",
  title_base: "호텔 조식 주문하기",
  steps: [
    {
      id: 1,
      role: "staff",
      text: "Good morning! Would you like some coffee or tea to start?",
      translation: "좋은 아침입니다! 먼저 커피나 차를 준비해 드릴까요?",
    },
    {
      id: 2,
      role: "user",
      text: "Good morning. I’ll have a hot {drink}, please.",
      translation: "좋은 아침이에요. 따뜻한 {drink} 한 잔 주세요.",
      options: [
        { word: "americano", meaning: "아메리카노" },
        { word: "caffe latte", meaning: "카페라떼" },
        { word: "espresso", meaning: "에스프레소" },
      ],
      default: { word: "americano", meaning: "아메리카노" },
    },
    {
      id: 3,
      role: "staff",
      text: "Sure. And how would you like your eggs?",
      translation: "네, 알겠습니다. 계란 요리는 어떻게 해 드릴까요?",
    },
    {
      id: 4,
      role: "user",
      text: "{egg_style}, please.",
      translation: "{egg_style} 주세요.",
      options: [
        { word: "an omelet with everything", meaning: "재료 전부 넣은 오믈렛" },
        { word: "scrambled eggs", meaning: "스크램블 에그" },
        { word: "sunny-side up", meaning: "서니사이드업" },
      ],
      default: {
        word: "an omelet with everything",
        meaning: "재료 전부 넣은 오믈렛",
      },
    },
    {
      id: 5,
      role: "staff",
      text: "Certainly. I'll prepare a hot {drink} and {egg_style} for you.",
      translation:
        "알겠습니다. 따뜻한 {drink} 한 잔과 {egg_style} 준비해 드릴게요.",
    },
  ],
};
