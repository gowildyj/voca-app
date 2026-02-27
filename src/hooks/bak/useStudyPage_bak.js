import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useWords } from "@/hooks/useWords";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

/**
 * StudySession 페이지의 핵심 로직을 관리하는 훅
 */
export const useStudyPage = (deckId) => {
  const { fetchWordsByDeck, updateWordStatus, loading } = useWords();
  const cardRef = useRef();
  const location = useLocation();
  const navigate = useNavigate();

  // === 1. 상태 관리 ===
  const [words, setWords] = useState([]); // 현재 학습할 단어 리스트
  const [currentIndex, setCurrentIndex] = useState(0);
  const [counts, setCounts] = useState({ know: 0, unknown: 0 });
  const [isFinished, setIsFinished] = useState(false);

  // 🌟 [핵심] 이번 세션에서 틀린 단어를 모아두는 스택
  const [unknownStack, setUnknownStack] = useState([]);

  // 설정 모달 상태
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [studySettings, setStudySettings] = useState({
    isAutoPlay: false,
    viewMode: "frontFirst",
  });

  // === 2. 초기 데이터 로드 ===
  useEffect(() => {
    if (deckId) {
      fetchWordsByDeck(deckId).then((data) => {
        let finalWords = data || [];

        // 만약 이전 페이지(단어 목록)에서 필터링된 리스트를 넘겨줬다면 그것만 학습
        const filteredIds = location.state?.filteredIds;
        if (filteredIds) {
          finalWords = finalWords.filter((w) => filteredIds.includes(w.id));
        }

        setWords(finalWords);
        setUnknownStack([]); // 스택 초기화
      });
    }
  }, [deckId, fetchWordsByDeck, location.state]);

  // === 3. 학습 종료 체크 ===
  useEffect(() => {
    if (words.length > 0 && currentIndex >= words.length) {
      setIsFinished(true);
    }
  }, [currentIndex, words.length]);

  // === 4. 다음 카드로 넘기기 (Swipe Action) ===
  const handleNextCard = useCallback(
    (direction) => {
      // direction: "left"(몰라요) or "right"(알아요)
      const status = direction === "right" ? "know" : "unknown";
      const currentWord = words[currentIndex];

      if (!currentWord) return;

      // 1. UI 카운트 증가
      setCounts((prev) => ({
        ...prev,
        [status]: prev[status] + 1, // know 또는 unknown 카운트 증가
      }));

      // 🌟 2. '몰라요(left)'인 경우 스택에 추가 (나중에 다시 풀기 위해)
      if (direction === "left") {
        setUnknownStack((prev) => [...prev, currentWord]);
      }

      // 3. DB 상태 업데이트 (비동기)
      updateWordStatus(currentWord.id, status);

      // 4. 다음 카드로 이동 (애니메이션 시간 고려하여 약간 딜레이)
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, 200);
    },
    [words, currentIndex, updateWordStatus],
  );

  // === 5. 틀린 단어 다시 풀기 (Retry Logic) ===
  const handleRetryUnknown = useCallback(() => {
    // 🌟 저장해둔 unknownStack이 있으면 그걸로 단어장 교체
    if (unknownStack.length > 0) {
      setWords([...unknownStack]); // 틀린 단어들로 교체
      setUnknownStack([]); // 다음 라운드를 위해 스택 비우기
      setCurrentIndex(0); // 인덱스 초기화
      setCounts({ know: 0, unknown: 0 }); // 카운트 초기화
      setIsFinished(false); // 종료 상태 해제

      toast.success(`${unknownStack.length}개의 틀린 단어를 다시 학습합니다!`);
    } else {
      // 틀린 게 없으면 목록으로 이동
      toast.success("완벽해요! 모든 단어를 맞히셨습니다. 🎉");
      navigate(`/decks/${deckId}`);
    }
  }, [unknownStack, deckId, navigate]);

  // === 6. 외부 제어 (버튼 클릭 등) ===
  const triggerSwipe = (direction) => {
    if (cardRef.current) {
      direction === "right"
        ? cardRef.current.swipeRight()
        : cardRef.current.swipeLeft();
    }
  };

  // === 7. 키보드 단축키 ===
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isSettingsOpen || isFinished) return;
      if (e.key === "ArrowRight") triggerSwipe("right");
      if (e.key === "ArrowLeft") triggerSwipe("left");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSettingsOpen, isFinished]);

  // 현재 보여줄 카드 계산
  const currentCard = useMemo(
    () => words[currentIndex] || null,
    [words, currentIndex],
  );

  return {
    words,
    currentCard,
    total: words.length,
    currentIndex,
    counts,
    loading,
    cardRef,
    isSettingsOpen,
    setIsSettingsOpen,
    studySettings,
    setStudySettings,
    handleNextCard,
    triggerSwipe,
    isFinished,
    handleRetryUnknown,
  };
};
