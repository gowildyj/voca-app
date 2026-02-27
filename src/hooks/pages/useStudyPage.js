import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useWords } from "@/hooks/useWords";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

/**
 * StudySession 페이지의 모든 로직을 관리하는 통합 훅
 */
export const useStudyPage = (deckId) => {
  const { fetchWordsByDeck, updateWordStatus, loading } = useWords();
  const [currentDeck, setCurrentDeck] = useState(null);
  const cardRef = useRef();
  const location = useLocation();
  const navigate = useNavigate();
  const transitionLock = useRef(false);

  // --- [1] 상태 관리 ---
  const [words, setWords] = useState([]); // 전체 학습 단어 리스트
  const [currentIndex, setCurrentIndex] = useState(0);
  const [counts, setCounts] = useState({ know: 0, unknown: 0 });
  const [unknownStack, setUnknownStack] = useState([]); // 복습용 오답 스택
  const [isFinished, setIsFinished] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // 설정 상태 (LocalStorage 연동)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [studySettings, setStudySettings] = useState(() => {
    try {
      const saved = localStorage.getItem("study_settings");
      return saved
        ? JSON.parse(saved)
        : { isAutoPlay: false, viewMode: "frontFirst" };
    } catch {
      return { isAutoPlay: false, viewMode: "frontFirst" };
    }
  });

  // --- [2] 초기 데이터 로드 ---
  useEffect(() => {
    if (deckId) {
      fetchWordsByDeck(deckId).then((data) => {
        let finalWords = data || [];
        const filteredIds = location.state?.filteredIds;
        if (filteredIds) {
          finalWords = finalWords.filter((w) => filteredIds.includes(w.id));
        }
        setWords(finalWords);
        setUnknownStack([]);
        setCurrentIndex(0);
        setIsFinished(false);
      });
      const loadDeckInfo = async () => {
        const { data } = await supabase
          .from("decks")
          .select("*")
          .eq("id", deckId)
          .single();
        if (data) {
          setCurrentDeck({
            id: data.id,
            name: data.deck_name,
            language: data.lang_code,
          });
        }
      };
    }
  }, [deckId, fetchWordsByDeck, location.state]);

  // --- [3] 설정 변경 및 저장 ---
  const updateSettings = useCallback((newSettings) => {
    setStudySettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem("study_settings", JSON.stringify(updated));
      return updated;
    });
  }, []);

  // --- [4] 핵심: 다음 카드로 넘기기 (Swipe Logic) ---
  const handleNextCard = useCallback(
    (direction) => {
      if (transitionLock.current || currentIndex >= words.length) return;

      const currentWord = words[currentIndex];
      if (!currentWord) return;

      const isKnown = direction === "right";
      const status = isKnown ? "know" : "unknown";

      // 락(Lock) 및 애니메이션 상태 설정
      transitionLock.current = true;
      setIsAnimating(true);

      // 1. 카운트 및 오답 스택 기록
      setCounts((prev) => ({ ...prev, [status]: prev[status] + 1 }));
      if (!isKnown) {
        setUnknownStack((prev) => [...prev, currentWord]);
      }

      // 2. DB 업데이트
      updateWordStatus(currentWord.id, status);

      // 3. 인덱스 증가 (애니메이션 대기)
      setTimeout(() => {
        setCurrentIndex((prev) => {
          const nextIndex = prev + 1;
          if (nextIndex >= words.length) setIsFinished(true);
          return nextIndex;
        });
        setIsAnimating(false);
        transitionLock.current = false;
      }, 300);
    },
    [words, currentIndex, updateWordStatus],
  );

  // --- [5] 유틸리티 기능 (Undo, Shuffle, Retry) ---

  // Undo: 이전 카드로 되돌리기
  const handleUndo = useCallback(() => {
    if (currentIndex > 0 && !transitionLock.current) {
      const prevIndex = currentIndex - 1;
      const prevWord = words[prevIndex];

      // 결과 기록에서 제거 (마지막 기록 기반으로 유추)
      // 실제로는 더 정밀한 기록 관리가 필요할 수 있으나 기본 구현
      setCurrentIndex(prevIndex);
      toast("이전 카드로 되돌아갔습니다.", { icon: "↩️" });
    }
  }, [currentIndex, words]);

  // Shuffle: 남은 단어 섞기
  const handleShuffle = useCallback(() => {
    setWords((prev) => {
      const alreadyPlayed = prev.slice(0, currentIndex);
      const remaining = prev
        .slice(currentIndex)
        .sort(() => Math.random() - 0.5);
      return [...alreadyPlayed, ...remaining];
    });
    toast.success("남은 단어들을 섞었습니다! 🔀");
  }, [currentIndex]);

  // Retry: 틀린 단어 다시 풀기
  const handleRetryUnknown = useCallback(() => {
    if (unknownStack.length > 0) {
      setWords([...unknownStack].sort(() => Math.random() - 0.5));
      setUnknownStack([]);
      setCurrentIndex(0);
      setCounts({ know: 0, unknown: 0 });
      setIsFinished(false);
      toast.success("틀린 단어 복습을 시작합니다! 🔥");
    } else {
      toast.success("모든 단어를 마스터하셨습니다! 🎉");
      navigate(`/decks/${deckId}`);
    }
  }, [unknownStack, deckId, navigate]);

  // 외부 제어 (버튼 클릭 등)
  const triggerSwipe = (direction) => {
    if (cardRef.current && !transitionLock.current) {
      direction === "right"
        ? cardRef.current.swipeRight()
        : cardRef.current.swipeLeft();
    }
  };

  // --- [6] 키보드 단축키 ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isSettingsOpen || isFinished) return;
      if (e.key === "ArrowRight") triggerSwipe("right");
      if (e.key === "ArrowLeft") triggerSwipe("left");
      if (e.key === "z" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleUndo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSettingsOpen, isFinished, handleUndo]);

  const currentCard = useMemo(
    () => words[currentIndex] || null,
    [words, currentIndex],
  );

  return {
    // 상태
    words,
    currentCard,
    total: words.length,
    currentIndex,
    counts,
    loading,
    isFinished,
    isAnimating,
    isSettingsOpen,
    studySettings,
    cardRef,
    progress: words.length > 0 ? (currentIndex / words.length) * 100 : 0,

    // 액션
    setIsSettingsOpen,
    setStudySettings: updateSettings,
    handleNextCard,
    handleUndo,
    handleShuffle,
    handleRetryUnknown,
    triggerSwipe,
    currentDeck,
  };
};
