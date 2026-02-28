import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware"; // 🌟 추가됨
import { supabase } from "@/lib/supabase";
import { logger } from "@/utils/logger";
import { toast } from "react-hot-toast";

export const useWordStore = create(
  persist(
    (set, get) => ({
      // --- [State] ---
      decks: [],
      words: [],
      loading: false,
      lastFetchedLang: null,

      // --- [Deck Actions] ---

      /** * 덱 목록 가져오기 (Smart Fetching 적용)
       * - 언어가 바뀌면: 화면 비우고 로딩 시작
       * - 같은 언어면: 기존 데이터 보여주면서 백그라운드 갱신 (로딩X)
       */
      fetchDecks: async (currentLangValue) => {
        if (!currentLangValue) return;

        const { lastFetchedLang } = get();
        const isDifferentLang = lastFetchedLang !== currentLangValue;

        // 언어가 다를 때만 로딩 바 노출 및 초기화
        if (isDifferentLang) {
          logger.start("fetchDecks (New Lang)", { currentLangValue });
          set({ decks: [], loading: true });
        } else {
          logger.start("fetchDecks (Background)", { currentLangValue });
          // 같은 언어일 땐 loading: true를 하지 않음 (깜빡임 방지)
        }

        try {
          const { data, error } = await supabase.rpc("get_deck_stats", {
            p_lang_code: currentLangValue,
          });
          if (error) throw error;

          const normalized = (data ?? []).map((d) => ({
            id: d.id,
            name: d.deck_name,
            language: d.lang_code,
            icon: d.icon,
            description: d.description,
            isFavorite: d.is_favorite,
            total: Number(d.total_count) || 0,
            progress:
              d.total_count > 0
                ? Math.round(
                    (Number(d.known_count) / Number(d.total_count)) * 100,
                  )
                : 0,
          }));

          set({
            decks: normalized,
            lastFetchedLang: currentLangValue, // 언어 기록 업데이트
            loading: false,
          });

          logger.success("fetchDecks", normalized);
        } catch (error) {
          logger.error("fetchDecks", error);
          set({ loading: false });
        }
      },

      fetchDeckById: async (deckId) => {
        if (!deckId) return null;
        logger.start("fetchDeckById", { deckId });

        // 1. 로컬 캐시 우선 확인
        const existingDeck = get().decks.find((d) => d.id === deckId);
        if (existingDeck) {
          logger.success("fetchDeckById (Local Cache)", existingDeck);
          return existingDeck;
        }

        // 2. 없으면 서버 요청
        try {
          const { data, error } = await supabase
            .from("decks")
            .select("*")
            .eq("id", deckId)
            .single();

          if (error) throw error;

          const normalized = {
            id: data.id,
            name: data.deck_name,
            language: data.lang_code,
            icon: data.icon,
            description: data.description,
            isFavorite: data.is_favorite,
            total: 0,
            progress: 0,
          };

          logger.success("fetchDeckById (Remote)", normalized);
          return normalized;
        } catch (error) {
          logger.error("fetchDeckById", error);
          return null;
        }
      },

      addDeck: async ({ name, language, icon = "", description = "" }) => {
        logger.start("addDeck", { name, language, icon, description });
        try {
          const { data, error } = await supabase
            .from("decks")
            .insert([
              { deck_name: name, lang_code: language, icon, description },
            ])
            .select();
          if (error) throw error;

          const newDeck = {
            ...data[0],
            name: data[0].deck_name,
            language: data[0].lang_code,
            total: 0,
            progress: 0,
          };

          set((state) => ({ decks: [newDeck, ...state.decks] }));
          logger.success("addDeck", newDeck);
          return newDeck;
        } catch (error) {
          logger.error("addDeck", error);
          return null;
        }
      },

      updateDeck: async (id, updates) => {
        logger.start("updateDeck", { id, updates });
        try {
          const { error } = await supabase
            .from("decks")
            .update({
              deck_name: updates.name,
              description: updates.description,
              icon: updates.icon,
              lang_code: updates.language,
            })
            .eq("id", id);
          if (error) throw error;

          set((state) => ({
            decks: state.decks.map((d) =>
              d.id === id ? { ...d, ...updates } : d,
            ),
          }));

          logger.success("updateDeck", { id, updates });
        } catch (error) {
          logger.error("updateDeck", error);
        }
      },

      deleteDeck: async (id) => {
        logger.start("deleteDeck", { id });
        try {
          const { error } = await supabase.from("decks").delete().eq("id", id);
          if (error) throw error;
          set((state) => ({ decks: state.decks.filter((d) => d.id !== id) }));
          logger.success("deleteDeck", { id });
        } catch (error) {
          logger.error("deleteDeck", error);
        }
      },

      updateDeckFavorite: async (id, isFavorite) => {
        logger.start("updateDeckFavorite", { id, isFavorite });

        const prevDecks = get().decks;
        set((state) => ({
          decks: state.decks.map((d) =>
            d.id === id ? { ...d, isFavorite } : d,
          ),
        }));

        try {
          const { error } = await supabase
            .from("decks")
            .update({ is_favorite: isFavorite })
            .eq("id", id);
          if (error) throw error;

          logger.success("updateDeckFavorite", { id, isFavorite });
        } catch (error) {
          set({ decks: prevDecks });
          logger.error("updateDeckFavorite", error);
        }
      },

      // --- [Word Actions] ---

      fetchWordsByDeck: async (deckId) => {
        logger.start("fetchWordsByDeck", { deckId });
        if (!deckId) return [];
        try {
          const { data, error } = await supabase
            .from("words")
            .select("*")
            .eq("deck_id", deckId)
            .order("created_at", { ascending: true });
          if (error) throw error;
          set({ words: data });
          logger.success("fetchWordsByDeck", data);
          return data;
        } catch (error) {
          logger.error("fetchWordsByDeck", error);
          return [];
        }
      },

      addWord: async (deckId, wordData) => {
        logger.start("addWord", { deckId, wordData });
        try {
          const { data, error } = await supabase
            .from("words")
            .insert([{ deck_id: deckId, ...wordData, status: "none" }])
            .select();
          if (error) throw error;

          const newWord = data[0];
          set((state) => ({
            words: [...state.words, newWord],
            decks: state.decks.map((d) =>
              d.id === deckId ? { ...d, total: (d.total || 0) + 1 } : d,
            ),
          }));
          logger.success("addWord", newWord);
          return newWord;
        } catch (error) {
          logger.error("addWord", error);
        }
      },

      addWordsBulk: async (deckId, wordsList) => {
        logger.start("addWordsBulk", { deckId, wordsList });
        try {
          const payload = wordsList.map((w) => ({
            deck_id: deckId,
            word: w.word,
            meaning: w.meaning,
            example: w.example || null,
            status: "none",
          }));
          const { data, error } = await supabase
            .from("words")
            .insert(payload)
            .select();
          if (error) throw error;

          set((state) => ({
            words: [...state.words, ...data],
            decks: state.decks.map((d) =>
              d.id === deckId
                ? { ...d, total: (d.total || 0) + data.length }
                : d,
            ),
          }));
          logger.success("addWordsBulk", data);
          toast.success(`${data.length}개 단어 등록 완료`);
          return data;
        } catch (error) {
          logger.error("addWordsBulk", error);
        }
      },

      updateWord: async (id, updates) => {
        logger.start("updateWord", { id, updates });
        try {
          const { error } = await supabase
            .from("words")
            .update(updates)
            .eq("id", id);
          if (error) throw error;

          set((state) => ({
            words: state.words.map((w) =>
              w.id === id ? { ...w, ...updates } : w,
            ),
          }));

          logger.success("updateWord", updates);
        } catch (error) {
          logger.error("updateWord", error);
        }
      },

      updateWordsBulk: async (wordsList) => {
        logger.start("updateWordsBulk", { wordsList });
        try {
          const payload = wordsList.map((w) => ({
            id: w.id,
            word: w.word,
            meaning: w.meaning,
            deck_id: w.deck_id,
          }));

          const { data, error } = await supabase
            .from("words")
            .upsert(payload, { onConflict: "id" })
            .select();

          if (error) throw error;

          // 1. 단어 목록 업데이트
          set((state) => ({
            words: state.words.map((w) => {
              const updated = data.find((nw) => nw.id === w.id);
              return updated ? { ...w, ...updated } : w;
            }),
          }));

          // 2. 덱 진행률 재계산 (서버 fetch 없이 로컬 데이터로)
          const updatedWords = get().words;
          set((state) => ({
            decks: state.decks.map((deck) => {
              const deckWords = updatedWords.filter(
                (w) => w.deck_id === deck.id,
              );
              const knownCount = deckWords.filter(
                (w) => w.status === "know",
              ).length;
              return {
                ...deck,
                progress:
                  deckWords.length > 0
                    ? Math.round((knownCount / deckWords.length) * 100)
                    : 0,
              };
            }),
          }));

          logger.success("updateWordsBulk", data);
          return data;
        } catch (error) {
          logger.error("updateWordsBulk", error);
          return null;
        }
      },

      deleteWord: async (id) => {
        logger.start("deleteWord", { id });
        const targetWord = get().words.find((w) => w.id === id);
        const deckId = targetWord?.deck_id;

        try {
          const { error } = await supabase.from("words").delete().eq("id", id);
          if (error) throw error;

          set((state) => ({
            words: state.words.filter((w) => w.id !== id),
            decks: state.decks.map((d) =>
              d.id === deckId
                ? { ...d, total: Math.max(0, (d.total || 0) - 1) }
                : d,
            ),
          }));
          logger.success("deleteWord", { id });
        } catch (error) {
          logger.error("deleteWord", error);
        }
      },

      updateWordStatus: async (id, newStatus) => {
        logger.start("updateWordStatus", { id, newStatus });
        const prevWords = get().words;
        const prevDecks = get().decks;

        let targetDeckId = null;

        const nextWords = prevWords.map((w) => {
          if (w.id === id) {
            targetDeckId = w.deck_id;
            return { ...w, status: newStatus };
          }
          return w;
        });

        const nextDecks = prevDecks.map((deck) => {
          if (deck.id === targetDeckId) {
            const deckWords = nextWords.filter(
              (w) => w.deck_id === targetDeckId,
            );
            const knownCount = deckWords.filter(
              (w) => w.status === "know",
            ).length;
            return {
              ...deck,
              progress:
                deckWords.length > 0
                  ? Math.round((knownCount / deckWords.length) * 100)
                  : 0,
            };
          }
          return deck;
        });

        set({ words: nextWords, decks: nextDecks });

        try {
          const { error } = await supabase
            .from("words")
            .update({ status: newStatus })
            .eq("id", id);
          if (error) throw error;
        } catch (error) {
          set({ words: prevWords, decks: prevDecks }); // Rollback
        }
      },

      updateWordFavorite: async (id, isFavorite) => {
        logger.start("updateWordFavorite", { id, isFavorite });
        const prevWords = get().words;

        set((state) => ({
          words: state.words.map((w) =>
            w.id === id ? { ...w, is_favorite: isFavorite } : w,
          ),
        }));

        try {
          const { error } = await supabase
            .from("words")
            .update({ is_favorite: isFavorite })
            .eq("id", id);
          if (error) throw error;

          logger.success("updateWordFavorite", { id, isFavorite });
        } catch (error) {
          set({ words: prevWords });
          logger.error("updateWordFavorite", error);
        }
      },
    }),

    // --- [Persist Configuration] ---
    {
      name: "word-app-storage", // 로컬 스토리지 키 이름
      storage: createJSONStorage(() => localStorage), // 저장소 (기본값: localStorage)

      // loading 상태는 저장하지 않습니다. (새로고침 시 로딩 상태가 true로 남는 것 방지)
      partialize: (state) => ({
        decks: state.decks,
        words: state.words,
        lastFetchedLang: state.lastFetchedLang,
      }),
    },
  ),
);
