import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export const useWords = () => {
  const [words, setWords] = useState([]);
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);

  // 덱 목록 및 단어 개수 가져오기 (메모리 방식)
  const fetchDecks = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc("get_deck_stats");
      if (error) throw error;
      const rawDecks = data ?? [];
      // console.log("✅ RPC get_deck_stats 결과:", data);

      setDecks(
        rawDecks.map((deck) => ({
          ...deck,
          total: deck.total_count ?? 0,
          progress:
            deck.total_count > 0
              ? Math.round((deck.known_count / deck.total_count) * 100)
              : 0,
        })),
      );
    } catch (error) {
      console.error("덱 목록 로드 실패:", error.message);
      setDecks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Supabase 기본 조회 한도(1000행)를 넘기도록 페이지네이션으로 전부 가져오기
  const PAGE_SIZE = 1000;

  // 특정 덱의 모든 단어 가져오기 (페이지네이션)
  const fetchWordsByDeck = useCallback(async (deckId) => {
    if (!deckId) return [];
    try {
      const all = [];
      let from = 0;

      while (true) {
        const to = from + PAGE_SIZE - 1;
        const { data, error } = await supabase
          .from("words")
          .select("*")
          .eq("deck_id", deckId)
          .order("created_at", { ascending: true })
          .range(from, to);

        if (error) throw error;
        const chunk = data ?? [];
        all.push(...chunk);
        if (chunk.length < PAGE_SIZE) break;
        from += PAGE_SIZE;
      }

      console.log(`✅ 덱 ID ${deckId}의 총 단어 개수:`, all.length);
      console.log(`✅ 덱 ID ${deckId}의 단어 목록:`, all);

      setWords(all);
      return all;
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
  // 덱 추가
  const addDeck = async (deckName, langCode) => {
    try {
      const { data, error } = await supabase
        .from("decks")
        .insert([{ deck_name: deckName, lang_code: langCode }])
        .select();
      if (error) throw error;
      const newDeck = data?.[0] || null;
      if (newDeck) {
        setDecks((prev) => [...prev, { ...newDeck, total: 0, progress: 0 }]);
      }
      return newDeck;
    } catch (error) {
      alert("덱 추가 실패: " + error.message);
    }
  };

  // 덱 삭제 (연관된 단어도 함께 삭제)
  const deleteDeck = async (deckId) => {
    // UI 로직은 Dashboard에서 confirm을 수행했으므로 여기선 기능만 수행
    try {
      await supabase.from("words").delete().eq("deck_id", deckId);
      const { error } = await supabase.from("decks").delete().eq("id", deckId);
      if (error) throw error;
      setDecks((prev) => prev.filter((d) => d.id !== deckId));
    } catch (error) {
      alert("덱 삭제 실패: " + error.message);
    }
  };

  // 덱 수정
  const updateDeck = async (deckId, newDeckName, newLang) => {
    if (!newDeckName?.trim()) return;

    const { error } = await supabase
      .from("decks")
      .update({ deck_name: newDeckName, lang_code: newLang })
      .eq("id", deckId);

    if (error) throw error;

    setDecks((prev) =>
      prev.map((d) =>
        d.id === deckId
          ? { ...d, deck_name: newDeckName, lang_code: newLang }
          : d,
      ),
    );

    setWords((prev) => prev.map((w) => (w.deck_id === deckId ? { ...w } : w)));
  };

  // --- 단어 관련 기능 ---
  // 단어 추가
  const addWord = async (newWord) => {
    try {
      const { word, meaning, example, deck_id } = newWord;
      const row = {
        word,
        meaning,
        ...(example != null && { example }),
        deck_id,
        status: "none",
      };
      const { data, error } = await supabase
        .from("words")
        .insert([row])
        .select();
      if (error) throw error;
      setWords((prev) => [data[0], ...prev]);
      fetchDecks();
    } catch (error) {
      alert(error.message);
    }
  };

  // 단어 수정
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
      alert(error.message);
      return { success: false };
    }
  };

  // 단어 삭제
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

  // 단어 학습상태 변경
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

  // 단어 학습상태 초기화
  const resetDeckProgress = async (deckId) => {
    try {
      // DB 업데이트: 해당 덱의 모든 단어 status를 'none'으로 변경
      const { error } = await supabase
        .from("words")
        .update({ status: "none" })
        .eq("deck_id", deckId);
      if (error) throw error;

      // 로컬 words 상태 업데이트 (현재 화면 갱신용)
      setWords((prev) =>
        prev.map((w) => (w.deck_id === deckId ? { ...w, status: "none" } : w)),
      );

      // 덱 통계(진행률) 갱신
      fetchDecks();
      return true;
    } catch (error) {
      console.error("초기화 실패:", error.message);
      return false;
    }
  };

  // 단어 덱에 대량 추가
  const addWordsBulk = async (wordsArray) => {
    try {
      const rows = wordsArray.map((w) => ({
        word: w.word,
        meaning: w.meaning,
        example: w.example,
        deck_id: w.deck_id,
        status: "none",
      }));
      const { data, error } = await supabase
        .from("words")
        .insert(rows)
        .select();
      if (error) throw error;
      if (data) setWords((prev) => [...data, ...prev]);
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
    updateDeck,
    deleteDeck,
    addWord,
    updateWord,
    deleteWord,
    updateWordStatus,
    addWordsBulk,
    fetchDecks,
    fetchWordsByDeck,
    refresh: fetchDecks,
    resetDeckProgress,
  };
};
