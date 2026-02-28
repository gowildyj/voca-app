import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";
import { showToast } from "@/utils/toast";
import { getFormData } from "@/utils/commonUtils";
import { logger } from "@/utils/logger";

/**
 * useWords
 * Data Layer 전용 훅
 * - DB 통신
 * - 상태 정규화
 * - 낙관적 업데이트
 */

export const useWords = (currentLangValue = "all") => {
  const [words, setWords] = useState([]);
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(false);

  // =====================================================
  // Deck
  // =====================================================

  // fetchDecks
  const fetchDecks = useCallback(async () => {
    logger.start("fetchDecks", { currentLangValue });
    if (!currentLangValue) return;
    try {
      setLoading(true);
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
            ? Math.round((Number(d.known_count) / Number(d.total_count)) * 100)
            : 0,
      }));

      setDecks(normalized);
      logger.success("fetchDecks", normalized);
    } catch (error) {
      logger.error("fetchDecks", error);
    } finally {
      setLoading(false);
    }
  }, [currentLangValue]);

  // fetchDeckById
  const fetchDeckById = useCallback(async (deckId) => {
    logger.start("fetchDeckById", { deckId });
    if (!deckId) return;

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
      };

      logger.success("fetchDeckById", normalized);
      return normalized;
    } catch (error) {
      logger.error("fetchDeckById", error);
      return null;
    }
  }, []);

  // addDeck
  const addDeck = async ({ name, language, icon = "", description = "" }) => {
    logger.start("addDeck", { name, language });
    try {
      const { data, error } = await supabase
        .from("decks")
        .insert([{ deck_name: name, lang_code: language, icon, description }])
        .select();

      if (error) throw error;

      const newDeck = {
        ...data[0],
        name: data[0].deck_name,
        language: data[0].lang_code,
        total: 0,
        progress: 0,
      };

      setDecks((prev) => [newDeck, ...prev]);
      logger.success("addDeck", newDeck);
      return newDeck;
    } catch (error) {
      logger.error("addDeck", error);
      return null;
    }
  };

  // updateDeck
  const updateDeck = async (id, updates) => {
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

      setDecks((prev) =>
        prev.map((d) => (d.id === id ? { ...d, ...updates } : d)),
      );

      logger.success("updateDeck", updates);
    } catch (error) {
      logger.error("updateDeck", error);
    }
  };

  // deleteDeck
  const deleteDeck = async (id) => {
    logger.start("deleteDeck", { id });
    try {
      const { error } = await supabase.from("decks").delete().eq("id", id);
      if (error) throw error;

      setDecks((prev) => prev.filter((d) => d.id !== id));
      logger.success("deleteDeck", id);
    } catch (error) {
      logger.error("deleteDeck", error);
    }
  };

  // updateDeckFavorite
  const updateDeckFavorite = async (id, isFavorite) => {
    logger.start("updateDeckFavorite", { id, isFavorite });
    setDecks((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isFavorite } : d)),
    );

    try {
      const { error } = await supabase
        .from("decks")
        .update({ is_favorite: isFavorite })
        .eq("id", id);
      if (error) throw error;
      logger.success("updateDeckFavorite", { id, isFavorite });
    } catch (error) {
      setDecks((prev) =>
        prev.map((d) => (d.id === id ? { ...d, isFavorite: !isFavorite } : d)),
      );
      logger.error("updateDeckFavorite", error);
    }
  };

  // =====================================================
  // Word
  // =====================================================

  // fetchWordsByDeck
  const fetchWordsByDeck = useCallback(async (deckId) => {
    logger.start("fetchWordsByDeck", { deckId });
    if (!deckId) return [];
    try {
      const { data, error } = await supabase
        .from("words")
        .select("*")
        .eq("deck_id", deckId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setWords(data);
      logger.success("fetchWordsByDeck", data);
      return data;
    } catch (error) {
      logger.error("fetchWordsByDeck", error);
      return [];
    }
  }, []);

  // addWord
  const addWord = async (deckId, wordData) => {
    logger.start("addWord", { deckId, wordData });
    try {
      const { data, error } = await supabase
        .from("words")
        .insert([{ deck_id: deckId, ...wordData, status: "none" }])
        .select();

      if (error) throw error;

      const newWord = data[0];
      setWords((prev) => [...prev, newWord]);

      setDecks((prev) =>
        prev.map((d) =>
          d.id === deckId ? { ...d, total: (d.total || 0) + 1 } : d,
        ),
      );

      logger.success("addWord", newWord);
      return newWord;
    } catch (error) {
      logger.error("addWord", error);
    }
  };
  // Bulk Insert Words
  const addWordsBulk = async (deckId, wordsList) => {
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

      setWords((prev) => [...prev, ...data]);

      setDecks((prev) =>
        prev.map((d) =>
          d.id === deckId ? { ...d, total: d.total + data.length } : d,
        ),
      );

      toast.success(`${data.length}개 단어 등록 완료`);
      logger.success("addWordsBulk", data);
      return data;
    } catch (error) {
      logger.error("addWordsBulk", error);
    }
  };

  // updateWord
  const updateWord = async (id, updates) => {
    logger.start("updateWord", { id, updates });
    try {
      const { error } = await supabase
        .from("words")
        .update(updates)
        .eq("id", id);
      if (error) throw error;

      setWords((prev) =>
        prev.map((w) => (w.id === id ? { ...w, ...updates } : w)),
      );
      logger.success("updateWord", updates);
    } catch (error) {
      logger.error("updateWord", error);
    }
  };

  // updateWordsBulk
  const updateWordsBulk = async (wordsList) => {
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

      // setWords를 사용하여 UI 리스트를 즉시 갱신
      setWords((prev) =>
        prev.map((w) => {
          const updated = data.find((nw) => nw.id === w.id);
          return updated ? { ...w, ...updated } : w;
        }),
      );

      // 대량 수정으로 인해 덱의 통계(progress)가 변했을 수 있으므로 동기화 호출
      fetchDecks();

      logger.success("updateWordsBulk", data);
      toast.success("일괄 수정이 완료되었습니다.");
      return data;
    } catch (error) {
      logger.error("updateWordsBulk", error);
      toast.error("일괄 수정에 실패했습니다.");
      return null;
    }
  };

  // deleteWord
  const deleteWord = async (id) => {
    logger.start("deleteWord", { id });
    try {
      const targetWord = words.find((w) => w.id === id);
      const deckId = targetWord?.deck_id;

      const { error } = await supabase.from("words").delete().eq("id", id);
      if (error) throw error;

      setWords((prev) => prev.filter((w) => w.id !== id));

      if (deckId) {
        setDecks((prev) =>
          prev.map((d) => {
            if (d.id === deckId) {
              const newTotal = Math.max(0, (d.total || 0) - 1);
              return { ...d, total: newTotal };
            }
            return d;
          }),
        );
      }

      logger.success("deleteWord", id);
    } catch (error) {
      logger.error("deleteWord", error);
    }
  };

  // updateWordStatus
  const updateWordStatus = async (id, newStatus) => {
    logger.start("updateWordStatus", { id, newStatus });

    let previousWords = []; // 롤백을 위한 이전 상태 저장
    let targetDeckId = null;

    // 낙관적 업데이트 수행
    setWords((prevWords) => {
      previousWords = prevWords; // 이전 상태 백업
      const nextWords = prevWords.map((w) => {
        if (w.id === id) {
          targetDeckId = w.deck_id;
          return { ...w, status: newStatus };
        }
        return w;
      });

      // 덱 진행률 실시간 계산
      if (targetDeckId) {
        setDecks((prevDecks) =>
          prevDecks.map((deck) => {
            if (deck.id === targetDeckId) {
              const deckWords = nextWords.filter(
                (w) => w.deck_id === targetDeckId,
              );
              const knownCount = deckWords.filter(
                (w) => w.status === "know",
              ).length;
              const totalCount = deckWords.length;
              return {
                ...deck,
                progress:
                  totalCount > 0
                    ? Math.round((knownCount / totalCount) * 100)
                    : 0,
              };
            }
            return deck;
          }),
        );
      }
      return nextWords;
    });

    try {
      const { error } = await supabase
        .from("words")
        .update({ status: newStatus })
        .eq("id", id);
      if (error) throw error;
      logger.success("updateWordStatus", { id, newStatus });
    } catch (error) {
      logger.error("updateWordStatus", error);

      setWords(previousWords);
      fetchDecks();

      toast.error("상태 변경에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // updateWordFavorite
  const updateWordFavorite = async (id, isFavorite) => {
    logger.start("updateWordFavorite", { id, isFavorite });
    setWords((prev) =>
      prev.map((w) => (w.id === id ? { ...w, is_favorite: isFavorite } : w)),
    );
    try {
      const { error } = await supabase
        .from("words")
        .update({ is_favorite: isFavorite })
        .eq("id", id);
      if (error) throw error;
      logger.success("updateWordFavorite", { id, isFavorite });
    } catch (error) {
      setWords((prev) =>
        prev.map((w) => (w.id === id ? { ...w, is_favorite: !isFavorite } : w)),
      );
      logger.error("updateWordFavorite", error);
    }
  };

  return {
    words,
    decks,
    loading,
    fetchDecks,
    fetchDeckById,
    addDeck,
    updateDeck,
    deleteDeck,
    updateDeckFavorite,
    fetchWordsByDeck,
    addWord,
    addWordsBulk,
    updateWord,
    updateWordsBulk,
    deleteWord,
    updateWordStatus,
    updateWordFavorite,
  };
};
