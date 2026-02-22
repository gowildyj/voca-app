import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";

/**
 * useWords: 단어 및 덱(단어장)의 데이터 레이어를 관리하는 핵심 훅
 * 프로덕션 레벨: DB 레벨 필터링, RPC 인자 전달, 성능 최적화
 */
export const useWords = (currentLangValue = "all") => {
  const [words, setWords] = useState([]);
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(false);

  /**
   * 🌟 RPC에 매개변수를 전달하여 필요한 언어의 덱만 DB에서 가져옵니다.
   */
  const fetchDecks = useCallback(async () => {
    if (loading) return;

    try {
      setLoading(true);

      // SQL 함수에 정의된 p_lang_code 인자로 currentLangValue를 전달합니다.
      const { data, error } = await supabase.rpc("get_deck_stats", {
        p_lang_code: currentLangValue || "all",
      });

      if (error) throw error;

      const processedDecks = (data ?? []).map((deck) => ({
        ...deck,
        total: parseInt(deck.total_count, 10) || 0,
        progress:
          deck.total_count > 0
            ? Math.round(
                (Number(deck.known_count) / Number(deck.total_count)) * 100,
              )
            : 0,
      }));

      setDecks(processedDecks);
    } catch (error) {
      console.error("❌ 덱 로드 실패:", error.message);
      toast.error("단어장 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [currentLangValue]);

  // 언어 설정이 변경될 때마다 DB 조회를 다시 수행합니다.
  useEffect(() => {
    fetchDecks();
  }, [currentLangValue]);

  /**
   * 새로운 덱 추가 로직
   */
  const addDeck = async (deckName, langCode, icon = "📁") => {
    try {
      const { data, error } = await supabase
        .from("decks")
        .insert([{ deck_name: deckName, lang_code: langCode, icon }])
        .select();

      if (error) throw error;

      const newDeck = data?.[0];
      if (newDeck) {
        // UI 즉시 반영 (현재 선택된 언어와 일치할 때만 목록 상단에 추가)
        if (currentLangValue === "all" || currentLangValue === langCode) {
          setDecks((prev) => [{ ...newDeck, total: 0, progress: 0 }, ...prev]);
        }
        toast.success(`"${deckName}" 단어장이 생성되었습니다! 🎉`);
      }
      return newDeck;
    } catch (error) {
      toast.error("단어장 생성 실패: " + error.message);
      return null;
    }
  };

  /**
   * 덱 삭제 로직
   */
  const deleteDeck = async (deckId) => {
    try {
      const { error } = await supabase.from("decks").delete().eq("id", deckId);
      if (error) throw error;

      setDecks((prev) => prev.filter((d) => d.id !== deckId));
      toast.success("단어장이 삭제되었습니다.");
    } catch (error) {
      toast.error("삭제 실패: " + error.message);
    }
  };

  /**
   * 특정 덱의 단어 리스트 조회 (페이지네이션)
   */
  const fetchWordsByDeck = useCallback(async (deckId) => {
    if (!deckId) return [];
    try {
      const PAGE_SIZE = 1000;
      let allData = [];
      let from = 0;

      while (true) {
        const { data, error } = await supabase
          .from("words")
          .select("*")
          .eq("deck_id", deckId)
          .order("created_at", { ascending: true })
          .range(from, from + PAGE_SIZE - 1);

        if (error) throw error;
        allData = [...allData, ...(data ?? [])];
        if (data.length < PAGE_SIZE) break;
        from += PAGE_SIZE;
      }

      setWords(allData);
      return allData;
    } catch (error) {
      toast.error("단어 목록 로드 실패");
      return [];
    }
  }, []);

  /**
   * 단어 상태 업데이트 (낙관적 업데이트 적용)
   */
  const updateWordStatus = useCallback(
    async (id, newStatus) => {
      // UI 선반영
      setWords((prev) =>
        prev.map((w) => (w.id === id ? { ...w, status: newStatus } : w)),
      );

      try {
        const { error } = await supabase
          .from("words")
          .update({ status: newStatus })
          .eq("id", id);

        if (error) throw error;

        // 통계 갱신 (선택 사항: 지연 발생 시 백그라운드 갱신)
        fetchDecks();
      } catch (error) {
        console.error("상태 변경 실패:", error.message);
        toast.error("업데이트 실패");
      }
    },
    [fetchDecks],
  );

  return {
    words,
    decks,
    loading,
    fetchDecks,
    fetchWordsByDeck,
    addDeck,
    deleteDeck,
    updateWordStatus,
  };
};
