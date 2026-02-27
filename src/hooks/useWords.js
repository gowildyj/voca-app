import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";
import { showToast } from "@/utils/toast";
import { getFormData } from "@/utils/commonUtils";

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

  const fetchDecks = useCallback(async () => {
    console.log("✅ fetchDecks", currentLangValue);
    if (!currentLangValue) return;

    try {
      setLoading(true);
      // console.log("🚀 DB 요청 언어:", currentLangValue);

      const { data, error } = await supabase.rpc("get_deck_stats", {
        p_lang_code: currentLangValue,
      });

      if (error) throw error;
      // console.log("data", data);
      console.log("✅ fetchDecks.total", data.length);

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
    } catch (error) {
      toast.error("단어장 목록 로드 실패");
    } finally {
      setLoading(false);
    }
  }, [currentLangValue]);

  const fetchDeckById = useCallback(async (deckId) => {
    console.log("✅ fetchDeckById");
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

      console.log("✅ [fetchDeckById]normalized", normalized);
      return normalized;
    } catch (error) {
      console.error("❌ 덱 정보 로드 실패:", error);
      showToast.error("단어장 정보 로드 실패");
      return null;
    }
  }, []);

  const addDeck = async ({ name, language, icon = "", description = "" }) => {
    console.log("✅ addDeck");
    try {
      const { data, error } = await supabase
        .from("decks")
        .insert([
          {
            deck_name: name,
            lang_code: language,
            icon,
            description,
          },
        ])
        .select();

      if (error) throw error;

      await fetchDecks();
      toast.success("단어장이 생성되었습니다.");
      return data?.[0];
    } catch (error) {
      toast.error("단어장 생성 실패");
      return null;
    }
  };

  const updateDeck = async (id, updates) => {
    console.log("✅ updateDeck");
    try {
      const { error } = await supabase
        .from("decks")
        .update({
          deck_name: updates.name,
          description: updates.description,
          icon: updates.icon,
        })
        .eq("id", id);

      if (error) throw error;

      await fetchDecks();
      toast.success("단어장 수정 완료");
    } catch {
      toast.error("단어장 수정 실패");
    }
  };

  const deleteDeck = async (id) => {
    console.log("✅ deleteDeck");
    try {
      const { error } = await supabase.from("decks").delete().eq("id", id);
      if (error) throw error;

      setDecks((prev) => prev.filter((d) => d.id !== id));
      toast.success("단어장 삭제 완료");
    } catch {
      toast.error("삭제 실패");
    }
  };

  const updateDeckFavorite = async (id, isFavorite) => {
    console.log("✅ updateDeckFavorite");
    try {
      const { error } = await supabase
        .from("decks")
        .update({ is_favorite: isFavorite })
        .eq("id", id);

      if (error) throw error;
    } catch (error) {
      console.error(error);
      toast.error("단어장 좋아요 실패");
    }
  };

  // =====================================================
  // Word
  // =====================================================

  const fetchWordsByDeck = useCallback(async (deckId) => {
    console.log("✅ fetchWordsByDeck");
    if (!deckId) return [];

    try {
      const { data, error } = await supabase
        .from("words")
        .select("*")
        .eq("deck_id", deckId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const normalized = (data ?? []).map((w) => ({
        id: w.id,
        deck_id: w.deck_id,
        word: w.word,
        meaning: w.meaning,
        example: w.example,
        status: w.status,
      }));

      setWords(normalized);
      return normalized;
    } catch {
      toast.error("단어 목록 로드 실패");
      return [];
    }
  }, []);

  const addWord = async (deckId, wordData) => {
    console.log("✅ addWord");
    try {
      const { data, error } = await supabase
        .from("words")
        .insert([
          {
            deck_id: deckId,
            word: wordData.word,
            meaning: wordData.meaning,
            example: wordData.example || null,
            status: "none",
          },
        ])
        .select();

      if (error) throw error;

      setWords((prev) => [...prev, ...data]);
      return data?.[0];
    } catch (error) {
      toast.error("단어 추가 실패");
    }
  };

  // ✅ Bulk Insert
  const addWordsBulk = async (deckId, wordsList) => {
    console.log("✅ addWordsBulk");
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
      toast.success(`${data.length}개 단어 등록 완료`);
      return data;
    } catch {
      toast.error("일괄 등록 실패");
    }
  };

  const updateWord = async (id, updates) => {
    console.log("✅ updateWord");
    try {
      const { error } = await supabase
        .from("words")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      setWords((prev) =>
        prev.map((w) => (w.id === id ? { ...w, ...updates } : w)),
      );

      toast.success("단어 수정 완료");
    } catch {
      toast.error("단어 수정 실패");
    }
  };

  // Bulk Upsert
  const updateWordsBulk = async (wordsList) => {
    try {
      console.log("✅ updateWordsBulk");
      // 🌟 전처리: deck_id가 유효하지 않거나 빈 객체가 들어가는 것을 방지
      const payload = wordsList.map((w) => ({
        id: w.id,
        word: w.word,
        meaning: w.meaning,
        deck_id: w.deck_id,
      }));

      const { data, error } = await supabase
        .from("words")
        .upsert(payload, {
          onConflict: "id",
        })
        .select();

      if (error) throw error;

      // 로컬 상태 즉시 업데이트
      setWords((prev) =>
        prev.map((w) => {
          const updated = payload.find((nw) => nw.id === w.id);
          return updated ? { ...w, ...updated } : w;
        }),
      );

      toast.success("일괄 수정이 완료되었습니다.");
      return data;
    } catch (error) {
      console.error("❌ Bulk Update Error:", error);
      toast.error("일괄 수정에 실패했습니다.");
    }
  };

  const deleteWord = async (id) => {
    console.log("✅ deleteWord");
    try {
      const { error } = await supabase.from("words").delete().eq("id", id);
      if (error) throw error;

      setWords((prev) => prev.filter((w) => w.id !== id));
      toast.success("단어 삭제 완료");
    } catch {
      toast.error("단어 삭제 실패");
    }
  };

  const updateWordStatus = async (id, newStatus) => {
    console.log("✅ updateWordStatus");
    setWords((prev) =>
      prev.map((w) => (w.id === id ? { ...w, status: newStatus } : w)),
    );

    try {
      const { error } = await supabase
        .from("words")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      fetchDecks();
    } catch {
      toast.error("상태 변경 실패");
    }
  };

  const updateWordFavorite = async (id, isFavorite) => {
    console.log("✅ updateWordFavorite");
    try {
      const { error } = await supabase
        .from("words")
        .update({ is_favorite: isFavorite })
        .eq("id", id);
    } catch (error) {
      console.error(error);
      toast.error("상태 변경 실패");
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
