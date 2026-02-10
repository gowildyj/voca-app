import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export const useWords = () => {
  const [words, setWords] = useState([]);
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- 1. 초기 로드 (데이터 합치기) ---
  const fetchData = async () => {
    try {
      setLoading(true);
      // 덱과 단어를 동시에 가져옵니다.
      const [decksRes, wordsRes] = await Promise.all([
        supabase
          .from("decks")
          .select("*")
          .order("created_at", { ascending: true }),
        supabase
          .from("words")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);

      if (decksRes.error) throw decksRes.error;
      if (wordsRes.error) throw wordsRes.error;

      setDecks(decksRes.data || []);
      setWords(wordsRes.data || []);
    } catch (error) {
      console.error("데이터 로딩 실패:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- 2. 덱 관련 기능 (Decks Table) ---
  const addDeck = async (name) => {
    try {
      const { data, error } = await supabase
        .from("decks")
        .insert([{ name }])
        .select();
      if (error) throw error;
      setDecks((prev) => [...prev, data[0]]);
      return data[0];
    } catch (error) {
      alert("덱 생성 실패: " + error.message);
    }
  };

  const deleteDeck = async (deckId, deckName) => {
    if (
      !window.confirm(`"${deckName}" 덱과 포함된 모든 단어를 삭제하시겠습니까?`)
    )
      return;
    try {
      // 1. 해당 덱의 단어들 먼저 삭제
      await supabase.from("words").delete().eq("deck", deckName);
      // 2. 덱 삭제
      const { error } = await supabase.from("decks").delete().eq("id", deckId);
      if (error) throw error;

      setDecks((prev) => prev.filter((d) => d.id !== deckId));
      setWords((prev) => prev.filter((w) => w.deck !== deckName));
    } catch (error) {
      alert("덱 삭제 실패: " + error.message);
    }
  };

  const renameDeck = async (deckId, oldName, newName) => {
    if (!newName || !newName.trim() || oldName === newName) return; // ✅ newName 존재 여부 먼저 확인
    try {
      // 1. 단어들의 덱 이름 업데이트
      await supabase
        .from("words")
        .update({ deck: newName })
        .eq("deck", oldName);
      // 2. 덱 테이블 업데이트
      const { error } = await supabase
        .from("decks")
        .update({ name: newName })
        .eq("id", deckId);
      if (error) throw error;

      setDecks((prev) =>
        prev.map((d) => (d.id === deckId ? { ...d, name: newName } : d)),
      );
      setWords((prev) =>
        prev.map((w) => (w.deck === oldName ? { ...w, deck: newName } : w)),
      );
    } catch (error) {
      alert("덱 이름 수정 실패: " + error.message);
    }
  };

  // --- 3. 단어 관련 기능 (Words Table) ---
  const addWord = async (newWord) => {
    if (!newWord.word.trim()) return; // 빈 단어 방지 로직
    try {
      const { data, error } = await supabase
        .from("words")
        .insert([
          {
            word: newWord.word,
            meaning: newWord.meaning,
            example: newWord.example || "",
            deck: newWord.deck,
            status: "none",
          },
        ])
        .select();
      if (error) throw error;
      setWords((prev) => [data[0], ...prev]);
    } catch (error) {
      alert("단어 추가 실패: " + error.message);
    }
  };

  const addWordsBulk = async (wordsArray) => {
    try {
      const { data, error } = await supabase
        .from("words")
        .insert(
          wordsArray.map((w) => ({
            word: w.word,
            meaning: w.meaning,
            example: w.example || "",
            deck: w.deck,
            status: "none",
          })),
        )
        .select();
      if (error) throw error;
      setWords((prev) => [...(data || []), ...prev]);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const deleteWord = async (id) => {
    if (!window.confirm("이 단어를 삭제하시겠습니까?")) return;
    try {
      const { error } = await supabase.from("words").delete().eq("id", id);
      if (error) throw error;
      setWords((prev) => prev.filter((word) => word.id !== id));
    } catch (error) {
      alert("삭제 실패: " + error.message);
    }
  };

  const updateWordStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from("words")
        .update({ status: newStatus })
        .eq("id", id);
      if (error) throw error;
      setWords((prev) =>
        prev.map((w) => (w.id === id ? { ...w, status: newStatus } : w)),
      );
    } catch (error) {
      console.error("상태 업데이트 실패:", error.message);
    }
  };

  return {
    words,
    decks,
    loading,
    addDeck,
    deleteDeck,
    renameDeck,
    addWord,
    deleteWord,
    updateWordStatus,
    addWordsBulk,
    refresh: fetchData,
  };
};
