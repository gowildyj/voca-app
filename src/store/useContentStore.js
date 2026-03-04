import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";
import { logger } from "@/utils/logger";
import { translations } from "@/utils/i18n";

export const useContentStore = create(
  persist((set, get) => ({
    // --- State ---
    languages: null,
    tags: null,
    items: null,
    learningLang: "en-US",
    nativeLang: "ko-KR",

    // 인터페이스 번역 헬퍼 함수
    t: (key) => {
      const { nativeLang } = get();
      const langPack = translations[nativeLang] || translations["ko-KR"];
      return langPack[key] || key;
    },

    // --- Actions ---
    setLanguages: (languages) => set({ languages }),
    setTags: (tags) => set({ tags }),
    setItems: (items) => set({ items }),

    // 언어 목록 가져오기
    fetchLanguages: async () => {
      const { t } = get();
      logger.start("[content]fetchLanguages");

      const { data, error } = await supabase
        .from("languages")
        .select("*")
        .order("code", { ascending: true });

      if (error) {
        toast.error(t("error"));
        logger.error("fetchLanguages", error.message);
        return;
      }

      set({ languages: data });
      toast.success(t("success"));
      logger.success("[content]fetchLanguages", data);
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
        return;
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
        return;
      }

      set({ tags: data });
      logger.success("[content]fetchTagsByLang", data);
    },

    // 필터항목별 단어 정보와 개수 가져오기(word, sentence, known, unknown, favorite)
    fetchOverviewStats: async () => {},

    // 해시태그별 정보와 개수 가져오기
    fetchTagsInfoByLang: async (nativeLang, targetLang) => {
      logger.start("[content]fetchTagsInfoByLang", { nativeLang, targetLang });

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
        return;
      }

      const formatted = data.map((tag) => ({
        id: tag.id,
        key: tag.unique_key,
        emoji: tag.icon_emoji,
        name: tag.hashtag_translations[0]?.tag_name,
        totalItems: tag.item_count[0]?.count || 0,
        isMain: tag.is_main_category,
      }));

      set({ tags: formatted });
      logger.success("[content]fetchTagsInfoByLang", formatted);
    },

    // 해시태그별 단어목록 가져오기
  })),
);
