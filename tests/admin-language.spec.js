// tests/admin-language.spec.js
const { test, expect } = require("@playwright/test");

test("언어(Language) CRUD 자동화 테스트", async ({ page, request }) => {
  // ==========================================
  // 1. 페이지 접속 및 UI 렌더링 확인
  // ==========================================
  await page.goto("/#/admin/languages");

  // 페이지에 'Language Settings' 타이틀이 잘 떴는지 확인
  await expect(
    page.locator("h1", { hasText: "Language Management" }),
  ).toBeVisible();

  // ==========================================
  // 2. [Create] 새로운 언어 등록하기
  // ==========================================
  // 폼에 값 입력 (로봇이 엄청난 속도로 타이핑합니다!)
  await page.fill('input[name="code"]', "test-LANG");
  await page.fill('input[name="name"]', "테스트언어");
  await page.fill('input[name="emoji"]', "🤖");

  // '저장' 버튼 클릭
  await page.click('button:has-text("저장")');

  // 토스트 메시지(성공)가 떴는지 확인
  await expect(page.locator('text="성공"')).toBeVisible();

  // 테이블에 방금 등록한 데이터가 떴는지 확인
  await expect(page.locator("td", { hasText: "test-LANG" })).toBeVisible();

  // ==========================================
  // 3. [백엔드 검증] 진짜 DB에 들어갔는지 API로 확인!
  // ==========================================
  // 🌟 스텔라님의 실제 백엔드 API 주소로 찔러봅니다.
  const response = await request.get("http://localhost:8080/api/languages"); // 백엔드 주소로 수정 필요
  const data = await response.json();

  // 받아온 데이터 중에 우리가 방금 넣은 'test-LANG'이 있는지 검증
  const isCreatedInDB = data.some((lang) => lang.code === "test-LANG");
  expect(isCreatedInDB).toBeTruthy();

  // ==========================================
  // 4. [Delete] 데이터 삭제 후 청소하기
  // ==========================================
  // 방금 만든 '테스트언어' 줄에 있는 '삭제' 버튼 찾아서 클릭
  const testRow = page.locator("tr", { hasText: "test-LANG" });
  await testRow.locator('button:has-text("삭제")').click();

  // 브라우저의 window.confirm 창('삭제하시겠습니까?')이 뜨면 무조건 '확인(Accept)' 누르기 설정
  page.once("dialog", (dialog) => dialog.accept());

  // 테이블에서 사라졌는지 확인 (최종 정리)
  await expect(testRow).not.toBeVisible();
});
