import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export const useWords = () => {
  const [words, setWords] = useState([]);
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- 1. 초기 로드 ---
  // useWords.js의 fetchData 함수 내부
  const fetchData = async () => {
    try {
      setLoading(true);
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

      // ✅ 콘솔 추가: DB에서 가져온 덱 정보를 확인하세요.
      console.log("DB에서 가져온 덱 목록:", decksRes.data);

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

  // --- 2. 덱 관련 기능 ---
  const addDeck = async (name, langCode) => {
    try {
      const { data, error } = await supabase
        .from("decks")
        .insert([{ name, lang_code: langCode }])
        .select();
      if (error) throw error;
      setDecks((prev) => [...prev, data[0]]);
      return data[0];
    } catch (error) {
      alert("덱 생성 실패: " + error.message);
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
      setWords((prev) => prev.filter((w) => w.deck !== deckName));
    } catch (error) {
      alert("덱 삭제 실패: " + error.message);
    }
  };

  // ✅ SyntaxError가 자주 발생하는 구간 (괄호 체크 완료)
  const renameDeck = async (deckId, oldName, newName, newLang) => {
    if (
      !newName ||
      !newName.trim() ||
      (oldName === newName && newLang === undefined)
    )
      return;
    try {
      // 1. 단어들 덱 이름 업데이트
      await supabase
        .from("words")
        .update({ deck: newName })
        .eq("deck", oldName);

      // 2. 덱 테이블 업데이트 (이름과 언어코드)
      const { error } = await supabase
        .from("decks")
        .update({ name: newName, lang_code: newLang })
        .eq("id", deckId);

      if (error) throw error;

      // 3. 로컬 상태 업데이트 (중요: lang_code 포함)
      setDecks((prev) =>
        prev.map((d) =>
          d.id === deckId ? { ...d, name: newName, lang_code: newLang } : d,
        ),
      );
      setWords((prev) =>
        prev.map((w) => (w.deck === oldName ? { ...w, deck: newName } : w)),
      );
    } catch (error) {
      alert("덱 이름 수정 실패: " + error.message);
    }
  };

  // --- 3. 단어 관련 기능 ---
  const addWord = async (newWord) => {
    if (!newWord.word.trim()) return;
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

  const updateWord = async (id, updatedData) => {
    try {
      // 1. DB 업데이트 (Supabase)
      const { error } = await supabase
        .from("words")
        .update({
          word: updatedData.word,
          meaning: updatedData.meaning,
          example: updatedData.example || "",
        })
        .eq("id", id);

      if (error) throw error;

      // 2. 로컬 상태 업데이트 (UI 즉시 반영)
      setWords((prev) =>
        prev.map((w) => (w.id === id ? { ...w, ...updatedData } : w)),
      );

      return { success: true };
    } catch (error) {
      console.error("단어 수정 실패:", error.message);
      alert("수정에 실패했습니다.");
      return { success: false };
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
    renameDeck,
    deleteDeck,
    addWord,
    updateWord,
    deleteWord,
    updateWordStatus,
    addWordsBulk,
    refresh: fetchData,
  };
};
