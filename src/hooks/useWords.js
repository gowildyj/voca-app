import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

export const useWords = () => {
  const [words, setWords] = useState([]);
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ 1. 덱 목록 및 단어 개수 가져오기 (메모리 방식)
  const fetchDecks = useCallback(async () => {
    try {
      setLoading(true);

      // 1. 덱 목록 가져오기
      const { data: decksData, error: decksError } = await supabase
        .from("decks")
        .select("*")
        .order("created_at", { ascending: true });

      if (decksError) throw decksError;

      // 2. 각 덱별 단어 개수를 개별적으로 가져오기 (가장 확실한 방법)
      const processedDecks = await Promise.all(
        decksData.map(async (deck) => {
          const { count, error: countError } = await supabase
            .from("words")
            .select("*", { count: "exact", head: true }) // head: true는 데이터 본문 없이 개수만 가져옴
            .eq("deck", deck.name);

          return {
            ...deck,
            total: count || 0,
          };
        }),
      );

      setDecks(processedDecks);
    } catch (error) {
      console.error("덱 로딩 실패:", error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ 2. 특정 덱의 단어만 가져오기 (On-demand 로딩)
  const fetchWordsByDeck = useCallback(async (deckName) => {
    try {
      const { data, error } = await supabase
        .from("words")
        .select("*")
        .eq("deck", deckName)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWords(data || []);
      return data;
    } catch (error) {
      console.error("단어 로딩 실패:", error.message);
      return [];
    }
  }, []);

  // 앱 시작 시 덱 정보만 먼저 가져옴
  useEffect(() => {
    fetchDecks();
  }, [fetchDecks]);

  // --- 덱 관련 기능 ---
  const addDeck = async (name, langCode) => {
    try {
      const { data, error } = await supabase
        .from("decks")
        .insert([{ name, lang_code: langCode }])
        .select();
      if (error) throw error;
      setDecks((prev) => [...prev, { ...data[0], total: 0 }]);
      return data[0];
    } catch (error) {
      alert(error.message);
    }
  };

  const deleteDeck = async (deckId, deckName) => {
    if (!window.confirm(`"${deckName}" 덱과 모든 단어를 삭제하시겠습니까?`))
      return;
    try {
      await supabase.from("words").delete().eq("deck", deckName);
      const { error } = await supabase.from("decks").delete().eq("id", deckId);
      if (error) throw error;
      setDecks((prev) => prev.filter((d) => d.id !== deckId));
    } catch (error) {
      alert(error.message);
    }
  };

  const renameDeck = async (deckId, oldName, newName, newLang) => {
    if (!newName || !newName.trim()) return;
    try {
      await supabase
        .from("words")
        .update({ deck: newName })
        .eq("deck", oldName);
      const { error } = await supabase
        .from("decks")
        .update({ name: newName, lang_code: newLang })
        .eq("id", deckId);
      if (error) throw error;

      setDecks((prev) =>
        prev.map((d) =>
          d.id === deckId ? { ...d, name: newName, lang_code: newLang } : d,
        ),
      );
      setWords((prev) =>
        prev.map((w) => (w.deck === oldName ? { ...w, deck: newName } : w)),
      );
    } catch (error) {
      alert(error.message);
    }
  };

  // --- 단어 관련 기능 ---
  const addWord = async (newWord) => {
    try {
      const { data, error } = await supabase
        .from("words")
        .insert([{ ...newWord, status: "none" }])
        .select();
      if (error) throw error;
      setWords((prev) => [data[0], ...prev]);
      fetchDecks(); // 덱 카운트 갱신
    } catch (error) {
      alert(error.message);
    }
  };

  const updateWord = async (id, updatedData) => {
    try {
      const { error } = await supabase
        .from("words")
        .update(updatedData)
        .eq("id", id);
      if (error) throw error;
      setWords((prev) =>
        prev.map((w) => (w.id === id ? { ...w, ...updatedData } : w)),
      );
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  };

  const deleteWord = async (id) => {
    if (!window.confirm("삭제할까요?")) return;
    try {
      await supabase.from("words").delete().eq("id", id);
      setWords((prev) => prev.filter((word) => word.id !== id));
      fetchDecks(); // 덱 카운트 갱신
    } catch (error) {
      alert(error.message);
    }
  };

  const updateWordStatus = async (id, newStatus) => {
    try {
      await supabase.from("words").update({ status: newStatus }).eq("id", id);
      setWords((prev) =>
        prev.map((w) => (w.id === id ? { ...w, status: newStatus } : w)),
      );
    } catch (error) {
      console.error(error.message);
    }
  };

  // 대량 추가 기능 (누락 방지)
  const addWordsBulk = async (wordsArray) => {
    try {
      const { data, error } = await supabase
        .from("words")
        .insert(wordsArray.map((w) => ({ ...w, status: "none" })))
        .select();
      if (error) throw error;
      setWords((prev) => [...(data || []), ...prev]);
      fetchDecks();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return {
    words,
    decks,
    loading,
    addDeck,
    renameDeck,
    deleteDeck,
    addWord,
    updateWord,
    deleteWord,
    updateWordStatus,
    addWordsBulk,
    fetchDecks,
    fetchWordsByDeck,
    refresh: fetchDecks,
  };
};
