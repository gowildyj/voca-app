import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { supabase } from "@/lib/supabase";
import { logger } from "@/utils/logger";
import { toast } from "react-hot-toast";
import { translations } from "@/utils/i18n";

export const useUserStore = create(
  persist((set, get) => ({
    // --- State ---
    currentUser: null,
    learningLang: "en-US", // 기본 배울 언어
    nativeLang: "ko-KR", // 기본 모국어 (UI 언어 결정)

    // 인터페이스 번역 헬퍼 함수
    t: (key) => {
      const { nativeLang } = get();
      // 선택한 모국어의 번역본이 없으면 한국어(ko-KR)를 기본값으로 사용
      const langPack = translations[nativeLang] || translations["ko-KR"];
      return langPack[key] || key;
    },

    setLearningLang: (code) => set({ learningLang: code }),
    setNativeLang: (code) => set({ nativeLang: code }),

    // --- 유저 생성 (Guest) ---
    createGuestUser: async (params) => {
      const { nickname, nativeLang, learningLang } = params;
      const { t } = get();

      logger.start("createGuestUser", { nickname, nativeLang, learningLang });

      try {
        // 1. users 테이블에 유저 기본 정보 생성
        const { data: userData, error: userError } = await supabase
          .from("users")
          .insert([{ nickname: nickname || "Guest" }])
          .select()
          .single();

        if (userError) throw userError;

        // 2. user_languages 테이블에 초기 언어 설정 추가 (모국어 & 학습어)
        const languagesToInsert = [
          {
            user_id: userData.id,
            language_code: nativeLang || "ko-KR",
            type: "NATIVE",
            is_primary: true,
          },
          {
            user_id: userData.id,
            language_code: learningLang || "en-US",
            type: "LEARNING",
            is_primary: true,
          },
        ];

        const { error: langError } = await supabase
          .from("user_languages")
          .insert(languagesToInsert);

        if (langError) throw langError;

        // 3. 성공 시 스토어 상태 업데이트
        set({
          currentUser: userData,
          activeNativeLang: nativeLang || "ko-KR",
          activeLearningLang: learningLang || "en-US",
        });

        toast.success(`${userData.nickname}님, 환영합니다!`);
        return { success: true, data: userData };
      } catch (error) {
        logger.error("createGuestUser Error", error);
        toast.error("유저 생성 중 오류가 발생했습니다.");
        return { success: false, error };
      }
    },

    loginWithCode: async (code) => {
      logger.start("loginWithCode", { code });
      if (!code) return false;

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("sync_code", code)
        .single();

      if (!error && data) {
        set({
          currentUser: data,
          learningLang: data.target_language || "en-US",
          nativeLang: data.native_language || "ko-KR",
        });

        toast.success(`${t("welcome")}, ${data.nickname}!`);
        return true;
      }

      toast.error(t("failed"));
      return false;
    },

    logout: () => {
      logger.start("logout");

      const { currentUser, nativeLang } = get();

      if (!currentUser) {
        toast.error(t("failed"));
        return;
      }

      if (!confirm(t("logout_confirm"))) {
        toast.error(t("failed"));
        return;
      }

      set({ currentUser: null });
      toast.success(t("success"));
    },
  })),
);
