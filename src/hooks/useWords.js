import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";

export const useWords = () => {
  const [words, setWords] = useState([]);
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- [1] 덱(Deck) 관련 로직 ---

  /**
   * 모든 덱 목록과 통계 정보를 가져옵니다. (RPC 사용)
   */
  const fetchDecks = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc("get_deck_stats");

      if (error) throw error;

      const processedDecks = (data ?? []).map((deck) => ({
        ...deck,
        total: deck.total_count ?? 0,
        progress:
          deck.total_count > 0
            ? Math.round((deck.known_count / deck.total_count) * 100)
            : 0,
      }));

      setDecks(processedDecks);
    } catch (error) {
      console.error("덱 로드 실패:", error.message);
      toast.error("덱 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 새로운 덱을 추가합니다.
   */
  const addDeck = async (deckName, langCode) => {
    try {
      const { data, error } = await supabase
        .from("decks")
        .insert([{ deck_name: deckName, lang_code: langCode }])
        .select();

      if (error) throw error;

      const newDeck = data?.[0];
      if (newDeck) {
        setDecks((prev) => [...prev, { ...newDeck, total: 0, progress: 0 }]);
        toast.success("새로운 단어장이 생성되었습니다! 🎉");
      }
      return newDeck;
    } catch (error) {
      toast.error("단어장 생성 실패: " + error.message);
      return null;
    }
  };

  /**
   * 덱의 정보를 수정합니다.
   */
  const updateDeck = async (deckId, newDeckName, newLang) => {
    try {
      if (!newDeckName?.trim()) throw new Error("이름을 입력해주세요.");

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
      toast.success("단어장 정보가 수정되었습니다.");
    } catch (error) {
      toast.error(error.message);
    }
  };

  /**
   * 덱과 그 안의 모든 단어를 삭제합니다.
   */
  const deleteDeck = async (deckId) => {
    try {
      // 1. 단어 삭제 (DB 제약 조건에 따라 자동 삭제될 수 있으나 명시적 처리)
      await supabase.from("words").delete().eq("deck_id", deckId);

      // 2. 덱 삭제
      const { error } = await supabase.from("decks").delete().eq("id", deckId);

      if (error) throw error;

      setDecks((prev) => prev.filter((d) => d.id !== deckId));
      toast.success("단어장이 삭제되었습니다.");
    } catch (error) {
      toast.error("삭제 실패: " + error.message);
    }
  };

  // --- [2] 단어(Word) 관련 로직 ---

  /**
   * 특정 덱의 모든 단어를 페이지네이션으로 가져옵니다. (1000개 한도 극복)
   */
  const fetchWordsByDeck = useCallback(async (deckId) => {
    if (!deckId) return [];
    try {
      const PAGE_SIZE = 1000;
      let allData = [];
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

        allData = [...allData, ...(data ?? [])];
        if (data.length < PAGE_SIZE) break;
        from += PAGE_SIZE;
      }

      setWords(allData);
      return allData;
    } catch (error) {
      toast.error("단어 목록을 불러오지 못했습니다.");
      return [];
    }
  }, []);

  /**
   * 단일 단어 추가
   */
  const addWord = async (newWordData) => {
    try {
      const { word, meaning, example, deck_id } = newWordData;
      const { data, error } = await supabase
        .from("words")
        .insert([{ word, meaning, example, deck_id, status: "none" }])
        .select();

      if (error) throw error;

      setWords((prev) => [data[0], ...prev]);
      fetchDecks(); // 상위 덱 통계 갱신
      toast.success("단어가 추가되었습니다.");
    } catch (error) {
      toast.error("추가 실패: " + error.message);
    }
  };

  /**
   * 단일 단어 수정
   */
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
      toast.success("수정 완료!");
      return { success: true };
    } catch (error) {
      toast.error(error.message);
      return { success: false };
    }
  };

  /**
   * 단일 단어 삭제
   */
  const deleteWord = async (id) => {
    try {
      const { error } = await supabase.from("words").delete().eq("id", id);
      if (error) throw error;

      setWords((prev) => prev.filter((w) => w.id !== id));
      fetchDecks(); // 덱 통계 갱신
      toast.success("삭제되었습니다.");
    } catch (error) {
      toast.error("삭제 실패");
    }
  };

  /**
   * 학습 상태 변경 (know, unknown, none)
   */
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
      console.error("상태 변경 실패:", error.message);
    }
  };

  /**
   * 특정 덱의 모든 학습 진행 상황 초기화
   */
  const resetDeckProgress = async (deckId) => {
    try {
      const { error } = await supabase
        .from("words")
        .update({ status: "none" })
        .eq("deck_id", deckId);

      if (error) throw error;

      setWords((prev) =>
        prev.map((w) => (w.deck_id === deckId ? { ...w, status: "none" } : w)),
      );
      fetchDecks();
      toast.success("학습 기록이 초기화되었습니다.");
      return true;
    } catch (error) {
      toast.error("초기화 실패");
      return false;
    }
  };

  // --- [3] 대량 작업(Bulk Operations) 로직 ---

  /**
   * 여러 단어 한꺼번에 추가
   */
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
      toast.success(`${data.length}개의 단어를 가져왔습니다!`);
      return { success: true };
    } catch (error) {
      toast.error("대량 추가 실패: " + error.message);
      return { success: false, error: error.message };
    }
  };

  /**
   * 여러 단어 한꺼번에 수정 (Upsert 방식)
   */
  const updateWordsBulk = async (updatedWordsArray) => {
    try {
      if (!updatedWordsArray || updatedWordsArray.length === 0) return;

      const { data, error } = await supabase
        .from("words")
        .upsert(updatedWordsArray)
        .select();

      if (error) throw error;

      setWords((prev) =>
        prev.map((existing) => {
          const match = data.find((u) => u.id === existing.id);
          return match ? { ...existing, ...match } : existing;
        }),
      );
      toast.success("일괄 수정이 완료되었습니다.");
      return { success: true };
    } catch (error) {
      toast.error("일괄 수정 실패");
      return { success: false, error: error.message };
    }
  };

  // 초기 실행: 덱 목록 로드
  useEffect(() => {
    fetchDecks();
  }, [fetchDecks]);

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
    updateWordsBulk,
    fetchDecks,
    fetchWordsByDeck,
    resetDeckProgress,
    refreshDecks: fetchDecks,
  };
};
