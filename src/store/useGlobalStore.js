import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { supabase } from "@/lib/supabase";
import { logger } from "@/utils/logger";
import { showToast } from "@/utils/toast";
import { translations } from "@/utils/i18n";

export const useGlobalStore = create(
  persist(
    (set, get) => ({
      // --- State ---
      currentUser: null,
      languages: [],
      categories: [],
      items: [],

      // --- User Settings ---
      learningLang: "en-US", // 기본 배울 언어
      nativeLang: "ko-KR", // 기본 모국어 (UI 언어 결정)
      // 인터페이스 번역 헬퍼 함수
      t: (key) => {
        const { nativeLang } = get();
        // 선택한 모국어의 번역본이 없으면 한국어(ko-KR)를 기본값으로 사용
        const langPack = translations[nativeLang] || translations["ko-KR"];
        return langPack[key] || key;
      },

      // --- Actions ---
      setLearningLang: (code) => set({ learningLang: code }),
      setNativeLang: (code) => set({ nativeLang: code }),

      // 0. 유저 인증 (기기 연동)
      loginWithCode: async (code) => {
        if (!code) return false;

        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("sync_code", code)
          .single();

        if (!error && data) {
          set({
            currentUser: data,
            nativeLang: data.native_language || "ko-KR",
            learningLang: data.target_language || "en-US",
          });

          showToast.success(`환영합니다, ${data.nickname}님!`);
          return true;
        }

        showToast.error("연동 코드가 올바르지 않습니다.");
        return false;
      },

      logout: () => {
        if (confirm("기기 연동을 해제하시겠습니까?")) {
          set({ currentUser: null });
          showToast.success("연동이 해제되었습니다.");
        }
      },

      // 1. 언어 관련
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

      addLanguage: async (langData) => {
        logger.start("addLanguage", langData);
        try {
          const { data, error } = await supabase
            .from("languages")
            .insert([langData])
            .select()
            .single();

          if (error) {
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
          return true;
        } catch (error) {
          logger.error("addLanguage", error);
          showToast.error("등록 중 오류가 발생했습니다.");
          return false;
        }
      },

      addLanguagesBulk: async (langList) => {
        logger.start("addLanguagesBulk", langList);
        try {
          const { data, error } = await supabase
            .from("languages")
            .upsert(langList, { onConflict: "code" })
            .select();

          if (error) throw error;

          await get().fetchLanguages();
          showToast.success("언어 일괄 등록 완료");
          return true;
        } catch (error) {
          logger.error("addLanguagesBulk", error);
          alert("오류: " + error.message);
          return false;
        }
      },

      deleteLanguage: async (code) => {
        logger.start("deleteLanguage", { code });
        if (!window.confirm("정말 이 언어를 삭제하시겠습니까?")) return;

        try {
          const { error } = await supabase
            .from("languages")
            .delete()
            .eq("code", code);
          if (error) throw error;

          set((state) => ({
            languages: state.languages.filter((l) => l.code !== code),
          }));
          logger.success("deleteLanguage", { code });
        } catch (error) {
          logger.error("deleteLanguage", error);
          alert("삭제 실패 (다른 데이터와 연결되어 있을 수 있습니다)");
        }
      },

      // 2. 카테고리(해시태그) 관련
      fetchAdminCategories: async () => {
        logger.start("fetchAdminCategories");
        const { data, error } = await supabase
          .from("hashtag_master")
          .select(`*, hashtag_translations(*)`)
          .order("display_order", { ascending: true });

        if (error) logger.error("fetchAdminCategories", error);
        else {
          set({ categories: data });
          logger.success("fetchAdminCategories", data);
        }
      },

      addCategoriesBulk: async (categoryList) => {
        try {
          for (const cat of categoryList) {
            const { data: master, error: mErr } = await supabase
              .from("hashtag_master")
              .upsert(
                {
                  uq_key: cat.uq_key,
                  icon_emoji: cat.icon_emoji || null,
                  display_order: cat.display_order || 999,
                  is_main_category: cat.is_main_category || false,
                },
                { onConflict: "uq_key" },
              )
              .select()
              .single();
            if (mErr) throw mErr;

            if (cat.langs) {
              const transPayload = Object.entries(cat.langs)
                .map(([lang, val]) => ({
                  // 🌟 val로 수정
                  tag_id: master.id,
                  lang_code: lang,
                  tag_name:
                    typeof val === "object" && val !== null
                      ? val.content || ""
                      : val,
                }))
                .filter((t) => t.tag_name);

              await supabase
                .from("hashtag_translations")
                .upsert(transPayload, { onConflict: "tag_id,lang_code" });
            }
          }
          await get().fetchAdminCategories();
          showToast.success("카테고리 저장 완료");
          return true;
        } catch (error) {
          logger.error(error);
          return false;
        }
      },

      deleteCategory: async (id) => {
        if (!confirm("삭제하시겠습니까?")) return;
        const { error } = await supabase
          .from("hashtag_master")
          .delete()
          .eq("id", id);
        if (!error) {
          set((state) => ({
            categories: state.categories.filter((c) => c.id !== id),
          }));
          showToast.success("삭제되었습니다.");
        }
      },

      updateCategory: async (id, updates) => {
        logger.start("updateCategory", { id, updates });
        try {
          const { error: mErr } = await supabase
            .from("hashtag_master")
            .update({
              uq_key: updates.uq_key,
              icon_emoji: updates.icon_emoji,
              display_order: updates.display_order,
              is_main_category: updates.is_main_category,
            })
            .eq("id", id);
          if (mErr) throw mErr;

          if (updates.langs) {
            const transPayload = Object.entries(updates.langs)
              .map(([lang, val]) => ({
                tag_id: id,
                lang_code: lang,
                // 🌟 여기서도 객체 구조 대응 추가
                tag_name:
                  typeof val === "object" && val !== null
                    ? val.content || ""
                    : val,
              }))
              .filter((t) => t.tag_name);

            const { error: tErr } = await supabase
              .from("hashtag_translations")
              .upsert(transPayload, { onConflict: "tag_id,lang_code" });
            if (tErr) throw tErr;
          }

          await get().fetchAdminCategories();
          showToast.success("수정 완료");
          return true;
        } catch (error) {
          alert("수정 실패: " + error.message);
          return false;
        }
      },

      // 3. 아이템(콘텐츠) 관련
      fetchAdminItems: async () => {
        logger.start("fetchAdminItems");
        const { data, error } = await supabase
          .from("master_items")
          .select(`*, item_translations(*), item_tag_map(tag_id)`)
          .order("created_at", { ascending: false });

        if (error) logger.error("fetchAdminItems", error);
        else {
          set({ items: data });
          logger.success("fetchAdminItems", data);
        }
      },

      addItemsBulk: async (itemList) => {
        logger.start("addItemsBulk", itemList);
        try {
          for (const item of itemList) {
            let master;

            // 1. Master Item Upsert
            if (item.id) {
              const { data, error } = await supabase
                .from("master_items")
                .upsert({
                  id: item.id,
                  uq_key: item.uq_key,
                  item_type: item.item_type,
                  image_url: item.image_url,
                })
                .select()
                .single();
              if (error) throw error;
              master = data;
            } else {
              if (!item.uq_key) continue;
              const { data, error } = await supabase
                .from("master_items")
                .upsert(
                  {
                    uq_key: item.uq_key,
                    item_type: item.item_type,
                    image_url: item.image_url,
                  },
                  { onConflict: "uq_key" },
                )
                .select()
                .single();
              if (error) throw error;
              master = data;
            }

            // 2. Translations Upsert
            if (item.langs) {
              const transPayload = Object.entries(item.langs)
                .map(([code, info]) => ({
                  master_item_id: master.id,
                  lang_code: code,
                  // 🌟 객체 구조 대응
                  content:
                    typeof info === "object" && info !== null
                      ? info.content || ""
                      : info,
                  definition: info.definition || null,
                  example_sentence: info.example || null,
                }))
                .filter((t) => t.content);

              const { error: tErr } = await supabase
                .from("item_translations")
                .upsert(transPayload, {
                  onConflict: "master_item_id,lang_code",
                });
              if (tErr) throw tErr;
            }

            // 3. Tags Update
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

          await get().fetchAdminItems();
          showToast.success("데이터 통합 완료!");
          return true;
        } catch (error) {
          logger.error("addItemsBulk", error);
          alert("오류: " + error.message);
          return false;
        }
      },

      deleteItem: async (id) => {
        if (!confirm("삭제하시겠습니까?")) return;
        const { error } = await supabase
          .from("master_items")
          .delete()
          .eq("id", id);
        if (!error) {
          set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
          showToast.success("삭제 완료");
        }
      },

      updateItem: async (id, updates) => {
        logger.start("updateItem", { id, updates });
        try {
          await supabase
            .from("master_items")
            .update({
              item_type: updates.item_type,
              image_url: updates.image_url,
            })
            .eq("id", id);

          if (updates.langs) {
            const transPayload = Object.entries(updates.langs)
              .map(([code, info]) => ({
                master_item_id: id,
                lang_code: code,
                // 🌟 객체 구조 대응
                content:
                  typeof info === "object" && info !== null
                    ? info.content || ""
                    : info,
                example_sentence: info.example || null,
              }))
              .filter((t) => t.content);
            await supabase
              .from("item_translations")
              .upsert(transPayload, { onConflict: "master_item_id,lang_code" });
          }

          if (updates.tag_ids) {
            await supabase
              .from("item_tag_map")
              .delete()
              .eq("master_item_id", id);
            const tagPayload = updates.tag_ids.map((tagId) => ({
              master_item_id: id,
              tag_id: tagId,
            }));
            await supabase.from("item_tag_map").insert(tagPayload);
          }

          await get().fetchAdminItems();
          showToast.success("수정 완료");
          return true;
        } catch (error) {
          logger.error("updateItem", error);
          return false;
        }
      },
    }),
    {
      name: "stella-lingo-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentUser: state.currentUser,
        learningLang: state.learningLang,
        nativeLang: state.nativeLang,
      }),
    },
  ),
);
