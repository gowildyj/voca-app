import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { logger } from "@/utils/logger";
import { v4 as uuidv4 } from "uuid"; // npm install uuid 필요 (없으면 임의 문자열 사용)

export const useGlobalStore = create((set, get) => ({
  // --- State ---
  languages: [],
  categories: [],
  scenarios: [],

  // --- Actions ---

  // 1. 기초 데이터: 언어 목록 가져오기
  fetchLanguages: async () => {
    logger.start("fetchLanguages");

    const { data, error } = await supabase
      .from("languages")
      .select("*")
      .order("code", { ascending: true });

    if (error) logger.error("fetchLanguages", error);
    else {
      set({ languages: data });
      logger.success("fetchLanguages", data);
    }
  },

  // 1-2. 언어 추가 (INSERT)
  addLanguage: async (langData) => {
    logger.start("addLanguage", langData);
    try {
      const { data, error } = await supabase
        .from("languages")
        .insert([langData]) // { code: 'fr', name: 'Français', emoji: '🇫🇷' }
        .select()
        .single();

      if (error) throw error;

      // 스토어 상태 즉시 업데이트 (새로고침 없이 반영)
      set((state) => ({
        languages: [...state.languages, data].sort((a, b) =>
          a.code.localeCompare(b.code),
        ),
      }));
      logger.success("addLanguage", data);
      return true;
    } catch (error) {
      logger.error("addLanguage", error);
      alert("언어 추가 실패: " + error.message);
      return false;
    }
  },

  // 1-3. 언어 삭제 (DELETE)
  deleteLanguage: async (code) => {
    logger.start("deleteLanguage", { code });
    if (!window.confirm("정말 이 언어를 삭제하시겠습니까?")) return;

    try {
      const { error } = await supabase
        .from("languages")
        .delete()
        .eq("code", code);

      if (error) throw error;

      // 스토어 상태 업데이트
      set((state) => ({
        languages: state.languages.filter((l) => l.code !== code),
      }));
      logger.success("deleteLanguage", { code });
    } catch (error) {
      logger.error("deleteLanguage", error);
      alert("삭제 실패 (다른 데이터와 연결되어 있을 수 있습니다)");
    }
  },

  // 1-4. 언어 일괄 등록 (Bulk Insert)
  addLanguagesBulk: async (langList) => {
    logger.start("addLanguagesBulk", langList);
    try {
      // code가 중복되면 업데이트하도록 upsert 사용
      const { data, error } = await supabase
        .from("languages")
        .upsert(langList, { onConflict: "code" })
        .select();

      if (error) throw error;

      // 목록 새로고침
      await get().fetchLanguages();
      logger.success("addLanguagesBulk", data);
      return true;
    } catch (error) {
      logger.error("addLanguagesBulk", error);
      alert("일괄 등록 실패: " + error.message);
      return false;
    }
  },

  // 1-5. 언어 정보 수정 (UPDATE)
  updateLanguage: async (code, updates) => {
    logger.start("updateLanguage", { code, updates });
    try {
      const { data, error } = await supabase
        .from("languages")
        .update(updates) // { name: '...', emoji: '...' }
        .eq("code", code)
        .select()
        .single();

      if (error) throw error;

      // 스토어 상태 업데이트 (배열에서 해당 항목만 교체)
      set((state) => ({
        languages: state.languages.map((l) => (l.code === code ? data : l)),
      }));
      logger.success("updateLanguage", data);
      return true;
    } catch (error) {
      logger.error("updateLanguage", error);
      alert("수정 실패: " + error.message);
      return false;
    }
  },

  // 2. 기초 데이터: 카테고리(해시태그) 가져오기
  fetchCategories: async (langCode = "ko") => {
    logger.start("fetchCategories", { langCode });
    // 해시태그 마스터와 번역 테이블을 조인해서 가져옴
    const { data, error } = await supabase
      .from("hashtag_master")
      .select(
        `
        *,
        hashtag_translations!inner(tag_name)
      `,
      )
      .eq("hashtag_translations.lang_code", langCode)
      .order("display_order", { ascending: true });

    if (error) logger.error("fetchCategories", error);
    else {
      const normalized = data.map((tag) => ({
        id: tag.id,
        emoji: tag.icon_emoji,
        name: tag.hashtag_translations[0].tag_name,
        isMain: tag.is_main_category,
      }));
      set({ categories: normalized });
      logger.success("fetchCategories", normalized);
    }
  },

  // 3. [핵심] 단어 추가 테스트 (Master -> Translation -> Reading)
  // 원래는 Admin 페이지에서 할 일이지만, 로직 검증을 위해 여기서 테스트
  addTestWord: async () => {
    const testPayload = {
      content: "Apple",
      meaning: "사과",
      reading: "애플",
      langCode: "en",
      nativeCode: "ko",
    };
    logger.start("addTestWord (Transaction)", testPayload);

    try {
      // (1) Master Item 생성
      const { data: master, error: masterErr } = await supabase
        .from("master_items")
        .insert([{ item_type: "WORD" }])
        .select()
        .single();
      if (masterErr) throw masterErr;

      // (2) Translation (영어 데이터 + 한국어 뜻)
      // *주의: 실제로는 ko row, en row를 따로 넣어야 하지만,
      // 테스트를 위해 en row에 definition(뜻)을 임시로 넣거나
      // 설계대로 2번 insert 해야 함. 여기선 약식으로 진행.
      const { data: trans, error: transErr } = await supabase
        .from("item_translations")
        .insert([
          {
            master_item_id: master.id,
            lang_code: "en",
            content: "Apple",
            example_sentence: "I ate an apple.",
          },
        ])
        .select()
        .single();
      if (transErr) throw transErr;

      // (2-1) 한국어 뜻 데이터 추가 (설계 원칙 준수)
      await supabase.from("item_translations").insert([
        {
          master_item_id: master.id,
          lang_code: "ko",
          content: "사과",
        },
      ]);

      // (3) Reading (독음)
      const { data: reading, error: readErr } = await supabase
        .from("item_readings")
        .insert([
          {
            item_translation_id: trans.id,
            native_lang_code: "ko",
            reading_content: "애플",
          },
        ])
        .select();
      if (readErr) throw readErr;

      logger.success("addTestWord", { master, trans, reading });
      alert("단어 추가 성공! 콘솔 확인");
    } catch (error) {
      logger.error("addTestWord", error);
    }
  },

  // 4. [핵심] 글로벌 단어 조회 (Join Query)
  fetchStudyItems: async (targetLang = "en", nativeLang = "ko") => {
    logger.start("fetchStudyItems", { targetLang, nativeLang });

    // Supabase의 강력한 Join 기능 사용
    const { data, error } = await supabase
      .from("master_items")
      .select(
        `
        id,
        image_url,
        target:item_translations!inner(content, audio_url, example_sentence, example_audio_url),
        native:item_translations(content),
        reading:item_translations!inner(
          item_readings(reading_content)
        )
      `,
      )
      .eq("target.lang_code", targetLang) // 학습 언어
      .eq("native.lang_code", nativeLang) // 모국어 (뜻)
      .eq("reading.item_readings.native_lang_code", nativeLang); // 독음

    if (error) logger.error("fetchStudyItems", error);
    else {
      // 데이터 정규화 (프론트에서 쓰기 편하게)
      const normalized = data.map((item) => ({
        id: item.id,
        word: item.target[0].content,
        meaning: item.native[0]?.content || "뜻 없음",
        reading: item.reading[0]?.item_readings[0]?.reading_content || "",
        example: item.target[0].example_sentence,
      }));
      logger.success("fetchStudyItems", normalized);
    }
  },

  // 5. 시나리오 목록 가져오기
  fetchScenarios: async (langCode = "en") => {
    logger.start("fetchScenarios");
    const { data, error } = await supabase
      .from("scenarios")
      .select(
        `
        id,
        difficulty_level,
        scenario_translations!inner(title, description)
      `,
      )
      .eq("scenario_translations.lang_code", langCode);

    if (error) logger.error("fetchScenarios", error);
    else {
      logger.success("fetchScenarios", data);
      set({ scenarios: data });
    }
  },

  // 6. 유저 생성 (기기 ID)
  createGuestUser: async () => {
    // 실제로는 로컬스토리지 체크 후 없으면 생성
    const fakeDeviceId = "device_" + Math.floor(Math.random() * 10000);
    logger.start("createGuestUser", { fakeDeviceId });

    const { data, error } = await supabase
      .from("users")
      .insert([{ device_id: fakeDeviceId }])
      .select()
      .single();

    if (error) logger.error("createGuestUser", error);
    else logger.success("createGuestUser", data);
  },
}));
