// src/hooks/pages/useStudyPage.js
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useWords } from "@/hooks/useWords";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * StudySession 페이지의 핵심 로직을 관리하는 훅
 * 프로덕션 레벨: DB 연동, 키보드 단축키, 애니메이션 타이밍 제어 [cite: 5, 2025-07-07]
 */
export const useStudyPage = (deckId) => {
  const { fetchWordsByDeck, updateWordStatus, loading } = useWords();
  const cardRef = useRef();
  const location = useLocation();
  const navigate = useNavigate();

  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [counts, setCounts] = useState({ know: 0, unknown: 0 });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [studySettings, setStudySettings] = useState({
    isAutoPlay: false,
    viewMode: "frontFirst",
  });

  const total = words.length;
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (deckId) {
      fetchWordsByDeck(deckId).then((data) => {
        let finalWords = data || [];

        const filteredIds = location.state?.filteredIds;
        if (filteredIds) {
          finalWords = finalWords.filter((w) => filteredIds.includes(w.id));
        }

        setWords(finalWords);
      });
    }
  }, [deckId, fetchWordsByDeck, location.state]);

  useEffect(() => {
    if (total > 0 && currentIndex >= total) {
      setIsFinished(true);
    }
  }, [currentIndex, total]);

  useEffect(() => {
    if (total > 0 && currentIndex >= total) {
      setIsFinished(true);
    }
  }, [currentIndex, total]);

  const handleRetryUnknown = useCallback(() => {
    // 🌟 [수정] status가 'unknown'인 단어를 찾을 때,
    // 현재 세션에서 실시간으로 업데이트된 words를 정확히 필터링하는지 확인
    const unknownWords = words.filter((w) => w.status === "unknown");

    if (unknownWords.length > 0) {
      setWords(unknownWords);
      setCurrentIndex(0);
      setCounts({ know: 0, unknown: 0 });
      setIsFinished(false);
    } else {
      // 🌟 [중요] 만약 unknown 상태인 단어가 하나도 없으면
      // 유저에게 알림을 주거나 다른 처리를 해야 합니다.
      alert("모든 단어를 마스터하셨네요!");
      navigate(`/decks/${deckId}`);
    }
  }, [words, deckId, navigate]);

  // 2. 현재 카드 데이터 [cite: 2026-02-22]
  const currentCard = useMemo(
    () => words[currentIndex] || null,
    [words, currentIndex],
  );

  // 3. 상태 업데이트 및 다음 카드로 이동 [cite: 5, 2025-07-07]
  const handleNextCard = useCallback(
    async (direction) => {
      const status = direction === "right" ? "know" : "unknown";
      const currentWordId = words[currentIndex]?.id;

      // UI 즉시 반영 (카운트 증가)
      setCounts((prev) => ({ ...prev, [status]: prev[status] + 1 }));

      // DB 업데이트 (비동기로 백그라운드 처리)
      if (currentWordId) {
        updateWordStatus(currentWordId, status);
      }

      // 약간의 딜레이 후 다음 인덱스로 (애니메이션 시간 확보)
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, 100);
    },
    [words, currentIndex, updateWordStatus],
  );

  // 4. 외부 버튼 클릭 시 강제 스와이프 제어 [cite: 2026-02-22]
  const triggerSwipe = (direction) => {
    if (cardRef.current) {
      direction === "right"
        ? cardRef.current.swipeRight()
        : cardRef.current.swipeLeft();
    }
  };

  // 5. 키보드 단축키 지원 (UX 향상) [cite: 5, 2025-07-07]
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isSettingsOpen) return;
      if (e.key === "ArrowRight") triggerSwipe("right");
      if (e.key === "ArrowLeft") triggerSwipe("unknown");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSettingsOpen]);

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
