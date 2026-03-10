import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
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

      /** 덱 목록 가져오기 (Smart Fetching 적용) */
      fetchDecks: async (currentLangValue) => {
        if (!currentLangValue) return;

        const { lastFetchedLang } = get();
        const isDifferentLang = lastFetchedLang !== currentLangValue;

        if (isDifferentLang) {
          logger.start("fetchDecks (New Lang)", { currentLangValue });
          set({ decks: [], loading: true });
        } else {
          logger.start("fetchDecks (Background)", { currentLangValue });
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
            lastFetchedLang: currentLangValue,
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

        const existingDeck = get().decks.find((d) => d.id === deckId);
        if (existingDeck) {
          logger.success("fetchDeckById (Local Cache)", existingDeck);
          return existingDeck;
        }

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
            isFavorite: data[0].is_favorite,
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
            .order("display_order", { ascending: true });
          if (error) throw error;

          const normalized = (data ?? []).map((d) => ({
            id: d.id,
            word: d.word,
            meaning: d.meaning,
            example: d.example,
            status: d.status,
            deckId: d.deck_id,
            isFavorite: d.is_favorite,
            displayOrder: d.display_order,
            total: Number(d.total_count) || 0,
            progress:
              d.total_count > 0
                ? Math.round(
                    (Number(d.known_count) / Number(d.total_count)) * 100,
                  )
                : 0,
          }));

          set({ words: normalized });
          logger.success("fetchWordsByDeck", normalized);
          return normalized;
        } catch (error) {
          logger.error("fetchWordsByDeck", error);
          return [];
        }
      },

      addWord: async (deckId, wordData) => {
        logger.start("addWord", { deckId, wordData });
        try {
          // 1. 현재 덱의 단어 수로 다음 정렬 순서 결정
          const wordsInDeck = get().words.filter((w) => w.deckId === deckId);
          const nextOrder = wordsInDeck.length;

          const { data, error } = await supabase
            .from("words")
            .insert([
              {
                deck_id: deckId,
                ...wordData,
                status: "none",
                display_order: nextOrder, // 🌟 display_order 할당
              },
            ])
            .select();
          if (error) throw error;

          const rawWord = data[0];
          const newWord = {
            ...rawWord,
            deckId: rawWord.deck_id, // 🌟 deckId 매핑 보정
            isFavorite: rawWord.is_favorite,
            displayOrder: rawWord.display_order, // 🌟 camelCase 매핑 보정
          };

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
          const wordsInDeck = get().words.filter((w) => w.deckId === deckId);
          const startOrder = wordsInDeck.length;

          const payload = wordsList.map((w, i) => ({
            deck_id: deckId,
            word: w.word,
            meaning: w.meaning,
            example: w.example || null,
            status: "none",
            display_order: startOrder + i, // 🌟 순차적 순서 할당
          }));
          const { data, error } = await supabase
            .from("words")
            .insert(payload)
            .select();
          if (error) throw error;

          const normalized = data.map((w) => ({
            ...w,
            deckId: w.deck_id, // 🌟 deckId 매핑 추가
            isFavorite: w.is_favorite,
            displayOrder: w.display_order,
          }));

          set((state) => ({
            words: [...state.words, ...normalized],
            decks: state.decks.map((d) =>
              d.id === deckId
                ? { ...d, total: (d.total || 0) + data.length }
                : d,
            ),
          }));
          logger.success("addWordsBulk", data);
          toast.success(`${data.length}개 단어 등록 완료`);
          return normalized;
        } catch (error) {
          logger.error("addWordsBulk", error);
        }
      },

      updateWord: async (id, updates) => {
        logger.start("updateWord", { id, updates });
        try {
          const { data, error } = await supabase
            .from("words")
            .update({
              ...updates,
            })
            .eq("id", id)
            .select()
            .single();

          if (error) throw error;

          set((state) => ({
            words: state.words.map((w) =>
              w.id === id
                ? {
                    ...w,
                    ...data,
                    deckId: data.deck_id,
                    isFavorite: data.is_favorite,
                    displayOrder: data.display_order,
                  }
                : w,
            ),
          }));

          logger.success("updateWord", data);
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
            example: w.example || null,
            deck_id: w.deck_id || w.deckId,
            display_order: w.display_order ?? w.displayOrder ?? 0,
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
              if (updated) {
                return {
                  ...w,
                  ...updated,
                  deckId: updated.deck_id,
                  isFavorite: updated.is_favorite,
                  displayOrder: updated.display_order, // 🌟 로컬 상태 반영 누락 수정
                };
              }
              return w;
            }),
          }));

          // 2. 덱 진행률 재계산
          const updatedWords = get().words;
          set((state) => ({
            decks: state.decks.map((deck) => {
              const deckWords = updatedWords.filter(
                (w) => w.deckId === deck.id,
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
        const deckId = targetWord?.deckId;

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
            targetDeckId = w.deckId;
            return { ...w, status: newStatus };
          }
          return w;
        });

        const nextDecks = prevDecks.map((deck) => {
          if (deck.id === targetDeckId) {
            const deckWords = nextWords.filter(
              (w) => w.deckId === targetDeckId,
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
          set({ words: prevWords, decks: prevDecks });
        }
      },

      deleteAllWordsByDeck: async (deckId) => {
        logger.start("deleteAllWordsByDeck", { deckId });
        try {
          const { error } = await supabase
            .from("words")
            .delete()
            .eq("deck_id", deckId);

          if (error) throw error;

          set((state) => ({
            words: state.words.filter((w) => w.deckId !== deckId),
            decks: state.decks.map((d) =>
              d.id === deckId ? { ...d, total: 0, progress: 0 } : d,
            ),
          }));

          toast.success("모든 단어가 삭제되었습니다.");
        } catch (error) {
          logger.error("deleteAllWordsByDeck", error);
          toast.error("삭제 중 오류가 발생했습니다.");
        }
      },

      resetAllWordStatus: async (deckId) => {
        logger.start("resetAllWordStatus", { deckId });
        try {
          const { error } = await supabase
            .from("words")
            .update({ status: "none" })
            .eq("deck_id", deckId);

          if (error) throw error;

          set((state) => ({
            words: state.words.map((w) =>
              w.deckId === deckId ? { ...w, status: "none" } : w,
            ),
            decks: state.decks.map((d) =>
              d.id === deckId ? { ...d, progress: 0 } : d,
            ),
          }));

          toast.success("학습 상태가 초기화되었습니다.");
        } catch (error) {
          logger.error("resetAllWordStatus", error);
          toast.error("초기화 중 오류가 발생했습니다.");
        }
      },

      updateWordFavorite: async (id, isFavorite) => {
        logger.start("updateWordFavorite", { id, isFavorite });
        const prevWords = get().words;

        set((state) => ({
          words: state.words.map((w) =>
            w.id === id ? { ...w, isFavorite: isFavorite } : w,
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

    {
      name: "word-app-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        decks: state.decks,
        words: state.words,
        lastFetchedLang: state.lastFetchedLang,
      }),
    },
  ),
);
