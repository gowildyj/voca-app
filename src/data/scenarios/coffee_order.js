export const coffeeOrder = {
  id: "coffee_order",
  title_learning: "Ordering Coffee at a Cafe",
  title_base: "카페에서 커피 주문하기",
  learning_lang: "en-US",
  steps: [
    {
      id: "c_step1",
      role: "left",
      text: "Hi! What can I get for you today?",
      translation: "안녕하세요! 오늘 무엇을 주문하시겠어요?",
    },
    {
      id: "c_step2",
      role: "right",
      text: "Can I get an iced {drink}, please?",
      translation: "아이스 {drink} 하나 주시겠어요?",
      options: [
        { word: "americano", meaning: "아메리카노" },
        { word: "latte", meaning: "라떼" },
        { word: "caramel macchiato", meaning: "카라멜 마끼아또" },
      ],
      default: { word: "americano", meaning: "아메리카노" },
    },
    {
      id: "c_step3",
      role: "left",
      text: "Sure. What size would you like for your {drink}?",
      translation: "네. 사이즈는 어떻게 하시겠어요?",
    },
    {
      id: "c_step4",
      role: "right",
      text: "I'll take a {size}, please.",
      translation: "{size} 사이즈로 주세요.",
      options: [
        { word: "tall", meaning: "톨" },
        { word: "grande", meaning: "그란데" },
        { word: "venti", meaning: "벤티" },
      ],
      default: { word: "grande", meaning: "그란데" },
    },
    {
      id: "c_step5",
      role: "left",
      text: "Alright, a {size} iced {drink}. That will be $5.50.",
      translation:
        "알겠습니다, {size} 아이스 {drink} 한 잔. 5달러 50센트입니다.",
    },
  ],
};
