import { formatStepText } from "../utils/scenarioUtils";

describe("시나리오 텍스트 치환 테스트", () => {
  test('변수명 {drink}를 선택된 값인 "Americano"로 치환해야 한다', () => {
    const text = "I’ll have a hot {drink}, please.";
    const selections = { drink: "Americano" };
    const result = formatStepText(text, "drink", selections);

    expect(result).toBe("I’ll have a hot Americano, please.");
  });

  test("선택된 값이 없을 경우 기본값을 보여줘야 한다", () => {
    const text = "I’ll have a hot {drink}, please.";
    const result = formatStepText(text, "drink", {}, "Coffee");

    expect(result).toBe("I’ll have a hot Coffee, please.");
  });
});
