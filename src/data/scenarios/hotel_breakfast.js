export const hotelBreakfast = {
  id: "hb_01",
  title: "호텔 조식 주문하기",
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
      variable: "drink",
      text: "Good morning. I’ll have a hot {drink}, please.",
      translation: "좋은 아침이에요. 따뜻한 {drink_ko} 한 잔 주세요.",
      options: [
        { value: "Americano", ko: "아메리카노" },
        { value: "Caffe Latte", ko: "카페라떼" },
      ],
      default: { value: "Americano", ko: "아메리카노" },
    },
  ],
};
