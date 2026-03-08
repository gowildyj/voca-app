import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";
import { logger } from "@/utils/logger";
import { Languages } from "lucide-react";
import i18next from "i18next";

export const useContentStore = create(
  persist(
    (set, get) => ({
      // --- State ---
      languages: [],
      tags: [],
      items: [],
      statsInfo: {},
      learningLang: "en-US",
      nativeLang: "ko-KR",
      appLang: "ko",
      isLoading: false,

      // // 인터페이스 번역 헬퍼 함수 -> i18n 변경
      // t: (key) => {
      //   const { nativeLang } = get();
      //   const langPack = translations[nativeLang] || translations["ko-KR"];
      //   return langPack[key] || key;
      // },

      // --- Actions ---
      setLanguages: (languages) => set({ languages }),
      setTags: (tags) => set({ tags }),
      setItems: (items) => set({ items }),
      setAppLang: (lang) => {
        const shortLang = lang.split("-")[0];
        set({ appLang: shortLang });
        i18next.changeLanguage(shortLang);
      },

      // 언어 목록 가져오기
      fetchLanguages: async () => {
        logger.start("[content]fetchLanguages");

        const { data, error } = await supabase
          .from("languages")
          .select("*")
          .order("code", { ascending: true });

        if (error) {
          logger.error("fetchLanguages", error.message);
          throw error;
        }

        set({ languages: data });
        logger.success(`[content]fetchLanguages : ${data.length}`, data);
        return data;
      },

      // 언어 등록 (Upsert - 있으면 수정, 없으면 등록)
      upsertLanguage: async (langData) => {
        logger.start("[content]upsertLanguage", langData);

        const saveData = { ...langData };
        if (!saveData.id) delete saveData.id;

        const { data, error } = await supabase
          .from("languages")
          .upsert(saveData, { onConflict: "id", ignoreDuplicates: false })
          .select()
          .single();

        if (error) {
          logger.error("[content]upsertLanguage", error.message);
          throw error;
        }

        const currentLanguages = get().languages || [];
        const isExisting = currentLanguages.some((lang) => lang.id === data.id);

        if (isExisting) {
          set({
            languages: currentLanguages.map((lang) =>
              lang.id === data.id ? data : lang,
            ),
          });
        } else {
          const newLanguages = [...currentLanguages, data].sort((a, b) =>
            a.code.localeCompare(b.code),
          );
          set({ languages: newLanguages });
        }

        logger.success("[content]upsertLanguage", data);
        return data;
      },

      // 언어 삭제
      deleteLanguage: async (id, code) => {
        logger.start("[content]deleteLanguage", code);
        const { error } = await supabase
          .from("languages")
          .delete()
          .eq("id", id);

        if (error) {
          logger.error("[content]deleteLanguage", error.message);
          throw error;
        }

        const currentLanguages = get().languages || [];
        const updatedLanguages = currentLanguages.filter(
          (lang) => lang.id !== id,
        );
        set({ languages: updatedLanguages });
        logger.success("[content]deleteLanguage", "Deleted");
        return true;
      },

      // 해시태그 목록 가져오기 (master + translations)
      fetchTags: async () => {
        logger.start("[content]fetchTags");

        const { data, error } = await supabase
          .from("hashtag_master")
          .select(`*, hashtag_translations(*)`)
          .order("display_order", { ascending: true });

        if (error) {
          logger.error("[content]fetchTags", error.message);
          throw error;
        }

        set({ tags: data });
        logger.success("[content]fetchTags", data);
      },

      // 언어별 해시태그 목록 가져오기
      fetchTagsByLang: async (lang) => {
        logger.start("[content]fetchTagsByLang", lang || "all");

        let query = supabase.from("hashtag_master");
        if (lang) {
          query = query
            .select(`*, hashtag_translations!inner(*)`)
            .eq("hashtag_translations.lang_code", lang);
        } else {
          query = query.select(`*, hashtag_translations(*)`);
        }

        const { data, error } = await query.order("display_order", {
          ascending: true,
        });

        if (error) {
          logger.error("[content]fetchTagsByLang", error.message);
          throw error;
        }

        set({ tags: data });
        logger.success("[content]fetchTagsByLang", data);
      },

      // 필터항목별 단어 정보와 개수 가져오기(word, sentence, known, unknown, favorite)
      fetchStatsInfoByLang: async (learningLang, userId) => {
        logger.start("[content]fetchStatsInfoByLang", { learningLang, userId });

        if (!learningLang) {
          logger.error(
            "[content]fetchStatsInfoByLang",
            "learningLang이 없습니다!",
          );
          return;
        }

        try {
          // 공통쿼리
          const commonQueries = [
            supabase
              .from("master_items")
              .select("id, item_translations!inner(id)", {
                count: "exact",
                head: true,
              })
              .eq("item_translations.lang_code", learningLang),
            supabase
              .from("master_items")
              .select("id, item_translations!inner(id)", {
                count: "exact",
                head: true,
              })
              .eq("item_type", "WORD")
              .eq("item_translations.lang_code", learningLang),
            supabase
              .from("master_items")
              .select("id, item_translations!inner(id)", {
                count: "exact",
                head: true,
              })
              .eq("item_type", "SENTENCE")
              .eq("item_translations.lang_code", learningLang),
          ];
          // 유저용 쿼리
          let userQueries = [];
          if (userId) {
            userQueries = [
              supabase
                .from("favorites")
                .select(
                  "master_item_id, master_items!inner(item_translations!inner(id))",
                  { count: "exact", head: true },
                )
                .eq("user_id", userId)
                .eq("master_items.item_translations.lang_code", learningLang),
              supabase
                .from("user_study_records")
                .select(
                  "master_item_id, master_items!inner(item_translations!inner(id))",
                  { count: "exact", head: true },
                )
                .eq("user_id", userId)
                .eq("status", "KNOWN")
                .eq("learning_lang", learningLang),
              supabase
                .from("user_study_records")
                .select(
                  "master_item_id, master_items!inner(item_translations!inner(id))",
                  { count: "exact", head: true },
                )
                .eq("user_id", userId)
                .eq("status", "UNKNOWN")
                .eq("learning_lang", learningLang),
            ];
          }

          const results = await Promise.all([...commonQueries, ...userQueries]);

          const stats = {
            total: results[0]?.count || 0,
            word: results[1]?.count || 0,
            sentence: results[2]?.count || 0,
            favorite: userId ? results[3]?.count || 0 : 0,
            known: userId ? results[4]?.count || 0 : 0,
            unknown: userId ? results[5]?.count || 0 : 0,
          };

          set({ statsInfo: stats });
          logger.success("[content]fetchStatsInfoByLang", stats);
        } catch (error) {
          logger.error("[content]fetchStatsInfoByLang", error.message);
        }
      },

      // 해시태그별 정보와 개수 가져오기
      fetchTagsInfoByLang: async (learningLang, nativeLang) => {
        logger.start("[content]fetchTagsInfoByLang", {
          learningLang,
          nativeLang,
        });

        const { data, error } = await supabase
          .from("hashtag_master")
          .select(
            `*, hashtag_translations!inner(tag_name),item_count:item_tag_map!inner(count)`,
          )
          .eq("hashtag_translations.lang_code", nativeLang)
          .eq("is_visible", true)
          .order("display_order", { ascending: true });

        if (error) {
          logger.error("[content]fetchTagsInfoByLang", error.message);
          throw error;
        }

        const normalized = data.map((tag) => ({
          id: tag.id,
          key: tag.unique_key,
          emoji: tag.icon_emoji,
          name: tag.hashtag_translations[0]?.tag_name,
          totalItems: tag.item_count[0]?.count || 0,
          isMain: tag.is_main_category,
        }));

        set({ tags: normalized });
        logger.success("[content]fetchTagsInfoByLang", normalized);
      },

      // 필터별 단어목록 가져오기
      fetchItemsByFilter: async ({
        learningLang,
        nativeLang,
        userId,
        itemType,
        status,
        isFavorite,
        tagId,
      }) => {
        logger.start("[content]fetchItemsByFilter", {
          learningLang,
          nativeLang,
          userId,
          itemType,
          status,
          isFavorite,
          tagId,
        });
        set({ isLoading: true });

        try {
          let query = supabase
            .from("master_items")
            .select(
              `
        *, 
        learning_translation:item_translations!inner(*),
        native_translation:item_translations!inner(*),
        user_study_records(status, learning_lang),
        favorites(created_at),
        item_tag_map!inner(tag_id)
      `,
            )
            .eq("learning_translation.lang_code", learningLang)
            .eq("native_translation.lang_code", nativeLang);

          if (itemType) query = query.eq("item_type", itemType);

          if (status && userId) {
            query = query
              .eq("user_study_records.status", status)
              .eq("user_study_records.user_id", userId)
              .eq("user_study_records.learning_lang", learningLang);
          }

          if (isFavorite && userId) {
            query = query
              .not("favorites", "is", null)
              .eq("favorites.user_id", userId);
          }

          if (tagId) query = query.eq("item_tag_map.tag_id", tagId);

          const { data, error } = await query.order("created_at", {
            ascending: false,
          });

          if (error) {
            logger.error("[content]fetchItemsByFilter", error.message);
            throw error;
          }

          const normalized = data.map((item) => ({
            id: item.id,
            type: item.item_type,
            key: item.unique_key,
            imageUrl: item.image_url,
            // 배울언어
            content: item.learning_translation[0]?.content,
            example: item.learning_translation[0]?.example_sentence,
            definition: item.learning_translation[0]?.definition,
            phonetic: item.learning_translation[0]?.phonetic_symbol,
            audioUrl: item.learning_translation[0]?.audio_url,
            // 모국어
            meaning: item.native_translation[0]?.content,
            meaningExample: item.native_translation[0]?.example_sentence,
            // 상태 데이터
            status: item.user_study_records?.[0]?.status || "NONE",
            isFavorite: !!item.favorites?.[0],
            tagIds: item.item_tag_map?.map((t) => t.tag_id) || [],
          }));

          set({ items: normalized });
          logger.success("[content]fetchItemsByFilter", normalized);
        } catch (error) {
          logger.error("[content]fetchItemsByFilter", error.message);
        } finally {
          set({ isLoading: false });
        }
      },

      // 아이템 대량등록
      handleBulkRegister: async (itemList) => {},
    }),
    {
      name: "voca-app-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
