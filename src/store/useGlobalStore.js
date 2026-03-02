import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { logger } from "@/utils/logger";
import { v4 as uuidv4 } from "uuid";
import { showToast } from "@/utils/toast";

export const useGlobalStore = create((set, get) => ({
  // --- State ---
  languages: [],
  categories: [],
  scenarios: [],
  items: [],

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
        .insert([langData])
        .select()
        .single();

      if (error) {
        // 🌟 [핵심] 중복 에러(409/23505) 처리
        if (error.code === "23505") {
          showToast.error(`이미 존재하는 코드(${langData.code})입니다!`);
          return false;
        }
        throw error;
      }

      set((state) => ({
        languages: [...state.languages, data].sort((a, b) =>
          a.code.localeCompare(b.code),
        ),
      }));

      showToast.success(`${data.name} 언어가 추가되었습니다.`);
      logger.success("addLanguage", data);
      return true;
    } catch (error) {
      logger.error("addLanguage", error);
      showToast.error("등록 중 오류가 발생했습니다.");
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

  /// --- [Hashtag Actions] ---

  // 2-1. 카테고리 전체 목록 가져오기 (관리자용 - 모든 번역 포함)
  fetchAdminCategories: async () => {
    logger.start("fetchAdminCategories");
    const { data, error } = await supabase
      .from("hashtag_master")
      .select(
        `
        *,
        hashtag_translations(*) 
      `,
      )
      .order("display_order", { ascending: true });

    if (error) {
      logger.error("fetchAdminCategories", error);
    } else {
      set({ categories: data });
      logger.success("fetchAdminCategories", data);
    }
  },

  // 2-2. 카테고리 일괄 등록 및 업데이트 (Upsert Mode)
  // 🌟 이제 tag_key를 기준으로 중복을 체크하여 기존 데이터에 새 언어를 추가합니다.
  addCategoriesBulk: async (categoryList) => {
    logger.start("addCategoriesBulk (tag_key 기준)", categoryList);
    try {
      for (const cat of categoryList) {
        // 1. Master 생성 또는 업데이트 (tag_key 기준 Upsert)
        // 🌟 onConflict: 'tag_key'를 사용하여 영문 키가 같으면 업데이트함
        const { data: master, error: mErr } = await supabase
          .from("hashtag_master")
          .upsert(
            {
              tag_key: cat.tag_key, // 🌟 고유 영문 키 (예: 'food')
              icon_emoji: cat.icon_emoji || null,
              display_order: cat.display_order || 999,
              is_main_category: cat.is_main_category || false,
            },
            { onConflict: "tag_key" },
          )
          .select()
          .single();

        if (mErr) throw mErr;

        // 2. 번역 정보 Upsert (tag_id와 lang_code 쌍으로 중복 체크)
        if (cat.langs) {
          const transPayload = Object.entries(cat.langs).map(
            ([lang, name]) => ({
              tag_id: master.id,
              lang_code: lang,
              tag_name: name,
            }),
          );

          const { error: tErr } = await supabase
            .from("hashtag_translations")
            .upsert(transPayload, { onConflict: "tag_id,lang_code" });

          if (tErr) throw tErr;
        }
      }

      await get().fetchAdminCategories();
      logger.success("addCategoriesBulk 성공");
      showToast.success("카테고리 데이터가 성공적으로 통합되었습니다.");
      return true;
    } catch (error) {
      logger.error("addCategoriesBulk", error);
      alert("등록 중 오류가 발생했습니다: " + error.message);
      return false;
    }
  },

  // 2-3. 카테고리 삭제
  deleteCategory: async (id) => {
    if (
      !confirm(
        "이 카테고리를 삭제하시겠습니까? 연결된 콘텐츠와의 링크도 모두 끊어집니다.",
      )
    )
      return;

    const { error } = await supabase
      .from("hashtag_master")
      .delete()
      .eq("id", id);

    if (!error) {
      set((state) => ({
        categories: state.categories.filter((c) => c.id !== id),
      }));
      showToast.success("삭제되었습니다.");
    } else {
      logger.error("deleteCategory", error);
    }
  },

  // 2-4. 카테고리 정보 수정 (상세 편집)
  updateCategory: async (id, updates) => {
    logger.start("updateCategory", { id, updates });
    try {
      // 1. Master 정보 업데이트
      const { error: mErr } = await supabase
        .from("hashtag_master")
        .update({
          tag_key: updates.tag_key, // 🌟 키값 수정 가능
          icon_emoji: updates.icon_emoji,
          display_order: updates.display_order,
          is_main_category: updates.is_main_category,
        })
        .eq("id", id);

      if (mErr) throw mErr;

      // 2. 다국어 번역 정보 업데이트 (langs 객체 처리)
      if (updates.langs) {
        const transPayload = Object.entries(updates.langs).map(
          ([lang, name]) => ({
            tag_id: id,
            lang_code: lang,
            tag_name: name,
          }),
        );

        const { error: tErr } = await supabase
          .from("hashtag_translations")
          .upsert(transPayload, { onConflict: "tag_id,lang_code" });

        if (tErr) throw tErr;
      }

      await get().fetchAdminCategories();
      logger.success("updateCategory 성공");
      showToast.success("변경사항이 저장되었습니다.");
      return true;
    } catch (error) {
      logger.error("updateCategory", error);
      alert("수정 실패: " + error.message);
      return false;
    }
  },

  /// --- [Content (Items) Actions] ---

  // 3-1. 관리자용 콘텐츠 목록 조회 (번역 및 태그 포함)
  fetchAdminItems: async () => {
    logger.start("fetchAdminItems");
    const { data, error } = await supabase
      .from("master_items")
      .select(
        `
        *,
        item_translations(*),
        item_tag_map(tag_id)
      `,
      )
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("fetchAdminItems", error);
    } else {
      set({ items: data }); // 스토어 상단 state에 items: [] 추가 필요
      logger.success("fetchAdminItems", data);
    }
  },

  // 3-2. 콘텐츠 일괄 등록 및 Upsert
  // 3-2. 콘텐츠 일괄 등록 및 Upsert (중복 방지 강화)
  addItemsBulk: async (itemList) => {
    logger.start("addItemsBulk (Upsert Mode)", itemList);
    try {
      for (const item of itemList) {
        // 🌟 1. Master Item Upsert (item_key 기준)
        // item_key가 같으면 신규 생성하지 않고 기존 ID를 가져옵니다.
        const { data: master, error: mErr } = await supabase
          .from("master_items")
          .upsert(
            {
              item_key:
                item.item_key || item.langs["en-US"]?.content.toLowerCase(), // 키가 없으면 영어 단어를 키로 사용
              item_type: item.item_type,
              image_url: item.image_url,
            },
            { onConflict: "item_key" },
          )
          .select()
          .single();

        if (mErr) throw mErr;

        // 2. Translations 등록
        const transPayload = Object.entries(item.langs).map(([code, info]) => ({
          master_item_id: master.id,
          lang_code: code,
          content: info.content,
          definition: info.definition || null,
          example_sentence: info.example || null,
        }));

        const { error: tErr } = await supabase
          .from("item_translations")
          .upsert(transPayload, { onConflict: "master_item_id,lang_code" });

        if (tErr) throw tErr;

        // 3. 태그 매핑 (Upsert 개념으로 기존 삭제 후 재등록)
        if (item.tag_ids && item.tag_ids.length > 0) {
          await supabase
            .from("item_tag_map")
            .delete()
            .eq("master_item_id", master.id);
          const tagPayload = item.tag_ids.map((tagId) => ({
            master_item_id: master.id,
            tag_id: tagId,
          }));
          await supabase.from("item_tag_map").insert(tagPayload);
        }
      }

      // 🌟 중요: 저장 후 목록을 다시 불러옵니다.
      await get().fetchAdminItems();
      showToast.success("데이터 통합 완료!");
      return true;
    } catch (error) {
      logger.error("addItemsBulk 실패", error);
      alert("오류 발생: " + error.message);
      return false;
    }
  },

  // 3-3. 콘텐츠 삭제
  deleteItem: async (id) => {
    if (
      !confirm(
        "이 콘텐츠를 삭제하시겠습니까? 번역과 태그 연결이 모두 삭제됩니다.",
      )
    )
      return;

    const { error } = await supabase.from("master_items").delete().eq("id", id);

    if (!error) {
      set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
      showToast.success("삭제 완료");
    }
  },

  // 3-4. 콘텐츠 수정 (Master + Translations + Tags)
  updateItem: async (id, updates) => {
    logger.start("updateItem", { id, updates });
    try {
      // 1. Master 업데이트 (이미지, 타입)
      await supabase
        .from("master_items")
        .update({
          item_type: updates.item_type,
          image_url: updates.image_url,
        })
        .eq("id", id);

      // 2. 번역 업데이트
      if (updates.langs) {
        const transPayload = Object.entries(updates.langs).map(
          ([code, info]) => ({
            master_item_id: id,
            lang_code: code,
            content: info.content,
            example_sentence: info.example,
          }),
        );
        await supabase
          .from("item_translations")
          .upsert(transPayload, { onConflict: "master_item_id,lang_code" });
      }

      // 3. 태그 업데이트 (기존 삭제 후 재등록 방식이 가장 깔끔)
      if (updates.tag_ids) {
        await supabase.from("item_tag_map").delete().eq("master_item_id", id);
        const tagPayload = updates.tag_ids.map((tagId) => ({
          master_item_id: id,
          tag_id: tagId,
        }));
        await supabase.from("item_tag_map").insert(tagPayload);
      }

      await get().fetchAdminItems();
      showToast.success("수정되었습니다.");
      return true;
    } catch (error) {
      logger.error("updateItem 실패", error);
      return false;
    }
  },

  // --- [Item Actions] ---
  fetchItems: async () => {
    logger.start("fetchItems");
    const { data, error } = await supabase
      .from("master_items")
      .select(
        `
        *,
        item_translations(*),
        item_tag_map(
          tag:hashtag_master(
            *,
            hashtag_translations(*)
          )
        )
      `,
      )
      .order("created_at", { ascending: false });

    if (error) {
      logger.error(error); // logger 대신 console 사용 가능
    } else {
      set({ items: data }); // 🌟 여기서 items 상태를 채워줍니다!
    }
  },

  /// --- [Scenario Actions] ---

  // 4-1. 시나리오 전체 목록 (관리자용 - 모든 관계 데이터 포함)
  fetchAdminScenarios: async () => {
    logger.start("fetchAdminScenarios");
    const { data, error } = await supabase
      .from("scenarios")
      .select(
        `
        *,
        scenario_translations(*),
        scenario_dialogues(
          *,
          scenario_options(
            *,
            choice_item:master_items!scenario_options_choice_item_id_fkey(
              item_translations(content, lang_code)
            )
          )
        )
      `,
      )
      .order("created_at", { ascending: false });

    if (error) logger.error("fetchAdminScenarios", error);
    else {
      set({ scenarios: data });
      logger.success("fetchAdminScenarios", data);
    }
  },

  // 4-2. 시나리오 기본 정보 저장/수정 (Upsert)
  saveScenario: async (scenarioData) => {
    logger.start("saveScenario", scenarioData);
    try {
      // 1. Master Upsert
      const { data: master, error: mErr } = await supabase
        .from("scenarios")
        .upsert({
          id: scenarioData.id || undefined,
          difficulty_level: scenarioData.difficulty_level || "Easy",
        })
        .select()
        .single();
      if (mErr) throw mErr;

      // 2. Translations Upsert
      const transPayload = Object.entries(scenarioData.langs).map(
        ([code, info]) => ({
          scenario_id: master.id,
          lang_code: code,
          title: info.title,
          description: info.description,
        }),
      );
      await supabase
        .from("scenario_translations")
        .upsert(transPayload, { onConflict: "scenario_id,lang_code" });

      await get().fetchAdminScenarios();
      showToast.success("시나리오 마스터 정보 저장 완료");
      return master.id;
    } catch (error) {
      logger.error("saveScenario 실패", error);
      return null;
    }
  },

  // 4-3. 대화(Dialogue) 저장/수정
  saveDialogue: async (dialogueData) => {
    logger.start("saveDialogue", dialogueData);

    // 🌟 중요: 관계 데이터(scenario_options 등)를 제외하고 테이블 컬럼만 추출
    const payload = {
      id: dialogueData.id || undefined,
      scenario_id: dialogueData.scenario_id,
      order_index: dialogueData.order_index,
      speaker_type: dialogueData.speaker_type,
      template_text: dialogueData.template_text,
      default_master_item_id: dialogueData.default_master_item_id || null,
      has_choices: dialogueData.has_choices || false,
    };

    const { data, error } = await supabase
      .from("scenario_dialogues")
      .upsert(payload) // 🌟 정제된 payload만 전송
      .select();

    if (error) {
      logger.error("saveDialogue 실패", error);
      return null;
    }

    await get().fetchAdminScenarios();
    return data[0];
  },

  // 4-4. 대화 삭제
  deleteDialogue: async (dialogueId) => {
    const { error } = await supabase
      .from("scenario_dialogues")
      .delete()
      .eq("id", dialogueId);

    if (!error) await get().fetchAdminScenarios();
  },

  // 4-5. (UPGRADE) 시나리오 + 옵션 + 다국어 일괄 등록
  addScenarioBulk: async (json) => {
    logger.start("addScenarioBulk (Full)", json);
    try {
      // 1. 시나리오 마스터 생성
      const { data: master, error: mErr } = await supabase
        .from("scenarios")
        .insert([{ difficulty_level: json.difficulty }])
        .select()
        .single();
      if (mErr) throw mErr;

      // 2. 시나리오 번역 등록 (JSON의 title 객체 순회)
      const sTrans = Object.keys(json.title).map((langCode) => ({
        scenario_id: master.id,
        lang_code: langCode,
        title: json.title[langCode],
        description: json.description[langCode] || "",
      }));
      await supabase.from("scenario_translations").insert(sTrans);

      // 3. 대화문 루프
      for (const d of json.dialogues) {
        // 3-1. 대화문 등록 (기본 텍스트는 영어나 첫 번째 언어로 저장)
        // 실제 앱에서는 언어별 템플릿 테이블이 따로 있으면 좋지만, 일단 template_text에 대표 언어(영어) 저장
        const defaultTemplate =
          d.template["en-US"] || Object.values(d.template)[0];

        const { data: dialogue, error: dErr } = await supabase
          .from("scenario_dialogues")
          .insert([
            {
              scenario_id: master.id,
              order_index: d.order,
              speaker_type: d.speaker,
              template_text: defaultTemplate,
              has_choices: d.has_choices,
            },
          ])
          .select()
          .single();

        if (dErr) throw dErr;

        // 3-2. 옵션(아이템) 처리
        if (d.has_choices && d.options && d.options.length > 0) {
          // 🌟 안전장치: AI가 is_default를 하나도 안 줬을 경우를 대비해 첫 번째를 true로
          const hasDefault = d.options.some((o) => o.is_default);

          for (let i = 0; i < d.options.length; i++) {
            const opt = d.options[i];

            // A. 아이템 마스터 Upsert
            const { data: item, error: iErr } = await supabase
              .from("master_items")
              .upsert(
                {
                  item_key: opt.item_key,
                  item_type: opt.item_type || "WORD",
                },
                { onConflict: "item_key" },
              )
              .select()
              .single();

            if (iErr) throw iErr;

            // B. 아이템 번역 Upsert
            const iTrans = Object.keys(opt.content).map((langCode) => ({
              master_item_id: item.id,
              lang_code: langCode,
              content: opt.content[langCode],
            }));
            await supabase
              .from("item_translations")
              .upsert(iTrans, { onConflict: "master_item_id,lang_code" });

            // C. 시나리오 옵션 연결 (is_default 저장)
            // 🌟 로직: JSON에 true가 있으면 그거 쓰고, 없으면 첫번째(index 0)를 true로 설정
            const isDefault = opt.is_default || (!hasDefault && i === 0);

            await supabase.from("scenario_options").insert([
              {
                dialogue_id: dialogue.id,
                choice_item_id: item.id,
                is_default: isDefault, // 👈 DB의 is_default 컬럼에 저장
              },
            ]);
          }
        }
      }

      await get().fetchAdminScenarios();
      showToast.success(`시나리오 '${json.title["ko-KR"]}' 생성 완료!`);
      return true;
    } catch (error) {
      logger.error("addScenarioBulk 실패", error);
      showToast.error("시나리오 생성 중 오류 발생: " + error.message);
      return false;
    }
  },

  // 4-6. 대화 선택지(Option) 추가
  addDialogueOption: async (dialogueId, masterItemId) => {
    logger.start("addDialogueOption", { dialogueId, masterItemId });
    const { error } = await supabase.from("scenario_options").insert([
      {
        dialogue_id: dialogueId,
        choice_item_id: masterItemId,
        is_default: false,
      },
    ]);

    if (error) {
      logger.error("addDialogueOption 실패", error);
      return false;
    }
    await get().fetchAdminScenarios(); // 갱신
    return true;
  },

  // 4-7. 대화 선택지 삭제
  deleteDialogueOption: async (optionId) => {
    const { error } = await supabase
      .from("scenario_options")
      .delete()
      .eq("id", optionId);

    if (!error) await get().fetchAdminScenarios();
  },

  // 4-8. (NEW) 기존 시나리오를 JSON으로 추출 (Export)
  exportScenarioToJson: async (scenarioId) => {
    const s = get().scenarios.find((item) => item.id === scenarioId);
    if (!s) return null;

    // DB 데이터를 JSON 포맷으로 변환
    const json = {
      difficulty: s.difficulty_level,
      title: {},
      description: {},
      dialogues: [],
    };

    // 제목/설명 매핑
    s.scenario_translations?.forEach((t) => {
      json.title[t.lang_code] = t.title;
      json.description[t.lang_code] = t.description;
    });

    // 대화문 매핑
    // 주의: 실제 DB에는 dialogue template의 다국어가 따로 저장되지 않고 하나만 있음.
    // 완벽한 다국어 복원을 위해서는 DB 구조 개선이 필요하나, 현재 구조상 template_text를 넣습니다.
    json.dialogues = s.scenario_dialogues?.map((d) => {
      const dialogueObj = {
        order: d.order_index,
        speaker: d.speaker_type,
        template: { "en-US": d.template_text }, // 현재 DB 한계로 일단 영어 키에 할당
        has_choices: d.has_choices,
        options: [],
      };

      // 옵션 매핑
      if (d.scenario_options && d.scenario_options.length > 0) {
        dialogueObj.options = d.scenario_options.map((opt) => {
          const item = opt.choice_item; // fetchAdminScenarios에서 조인된 데이터
          const contentMap = {};

          // item_translations 배열을 객체로 변환
          if (Array.isArray(item?.item_translations)) {
            item.item_translations.forEach((it) => {
              contentMap[it.lang_code] = it.content;
            });
          }

          return {
            item_key: item?.item_key || `gen_${item?.id}`, // item_key가 없으면 ID라도
            item_type: item?.item_type || "WORD",
            content: contentMap,
          };
        });
      }
      return dialogueObj;
    });

    return JSON.stringify(json, null, 2);
  },

  // 4-9. 옵션 기본값(Default) 설정
  setDialogueOptionDefault: async (dialogueId, optionId) => {
    // 1. 해당 대화의 모든 옵션을 먼저 false(기본값 아님)로 초기화
    await supabase
      .from("scenario_options")
      .update({ is_default: false })
      .eq("dialogue_id", dialogueId);

    // 2. 클릭한 옵션만 true(기본값)로 설정
    const { error } = await supabase
      .from("scenario_options")
      .update({ is_default: true })
      .eq("id", optionId);

    if (error) {
      logger.error("기본값 설정 실패", error);
    } else {
      await get().fetchAdminScenarios(); // 화면 갱신
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
