import { hotelBreakfast } from "./hotel_breakfast";
import { coffeeOrder } from "./coffee_order";

// ID로 특정 대화문을 찾기 쉽도록 객체 형태로 묶음
export const scenarios = {
  hotel_breakfast: hotelBreakfast,
  coffee_order: coffeeOrder,
};

// 리스트 화면에 뿌려주기 쉽도록 배열 형태로도 제공
export const scenarioList = Object.values(scenarios);
