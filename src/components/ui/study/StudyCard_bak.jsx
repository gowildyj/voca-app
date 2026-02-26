import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useAnimation,
} from "framer-motion";
import { Volume2, Star } from "lucide-react";
import "@/styles/components/ui/study/studyCard.css";

const StudyCard = forwardRef(({ cardData, onSwipe, isNextPreview }, ref) => {
  // === 1. 상태 및 애니메이션 값 선언 (순서 중요!) ===
  const [isFlipped, setIsFlipped] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null); // 'left', 'right', null

  const x = useMotionValue(0);
  const controls = useAnimation();
  const rotate = useTransform(x, [-200, 200], [-25, 25]);

  // === 2. 실시간 드래그 감지 (테두리 색상 피드백용) ===
  // === 2. 실시간 드래그 감지 (테두리 색상 피드백용) ===
  useEffect(() => {
    const unsubscribe = x.on("change", (latestX) => {
      // 🌟 오직 거리(100px)만 기준으로 테두리 불을 켭니다.
      if (latestX > 100) {
        setSwipeDirection("right");
      } else if (latestX < -100) {
        setSwipeDirection("left");
      } else {
        setSwipeDirection(null);
      }
    });
    return () => unsubscribe();
  }, [x]);

  // 데이터 변경 시 초기화
  useEffect(() => {
    x.set(0);
    controls.set({ x: 0, opacity: 1 });
    setIsFlipped(false);
    setSwipeDirection(null);
  }, [cardData, x, controls]);

  // === 3. 외부 호출 함수 (하단 버튼 클릭용) ===
  useImperativeHandle(ref, () => ({
    swipeRight: async () => {
      setSwipeDirection("right");
      await controls.start({
        x: 500,
        opacity: 0,
        transition: { duration: 0.1 },
      });
      onSwipe("right");
    },
    swipeLeft: async () => {
      setSwipeDirection("left");
      await controls.start({
        x: -500,
        opacity: 0,
        transition: { duration: 0.1 },
      });
      onSwipe("left");
    },
  }));

  // === 4. 드래그 종료 핸들러 (판정 로직) ===
  // === 4. 드래그 종료 핸들러 (판정 로직) ===
  const handleDragEnd = async (event, info) => {
    // 🌟 핵심: info.offset 대신 실제 카드의 위치(x.get())와
    // 이미 계산된 swipeDirection을 활용합니다.

    const velocity = info.velocity.x;

    // 1. 오른쪽 판정: 테두리 불이 켜져 있거나, (중앙보다 오른쪽에 있으면서 휙 던졌을 때)
    if (swipeDirection === "right" || (x.get() > 20 && velocity > 400)) {
      await controls.start({
        x: 500,
        opacity: 0,
        transition: { duration: 0.1 },
      });
      onSwipe("right");
    }
    // 2. 왼쪽 판정: 테두리 불이 켜져 있거나, (중앙보다 왼쪽에 있으면서 휙 던졌을 때)
    else if (swipeDirection === "left" || (x.get() < -20 && velocity < -400)) {
      await controls.start({
        x: -500,
        opacity: 0,
        transition: { duration: 0.1 },
      });
      onSwipe("left");
    }
    // 3. 그 외: 테두리 불도 안 켜졌고 툭 던지지도 않았다면 복귀!
    else {
      controls.start({
        x: 0,
        opacity: 1,
        transition: { type: "spring", stiffness: 300, damping: 20 },
      });
      setSwipeDirection(null);
    }
  };

  const handleFlip = () => {
    if (Math.abs(x.get()) < 5) setIsFlipped(!isFlipped);
  };

  const getBorderStyle = () => {
    if (swipeDirection === "right") return "#10b981";
    if (swipeDirection === "left") return "#ef4444";
    return "transparent";
  };

  if (!cardData) return null;

  // 다음 카드 프리뷰 모드
  if (isNextPreview) {
    return (
      <div className="study-card-container preview next-card-preview">
        <div className="card-inner preview-mode">
          <div className="card-face card-front">
            <h2 className="word-text">{cardData.word}</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="study-card-container">
      <motion.div
        className="card-motion-wrapper"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ x, rotate, transformOrigin: "center 800px" }}
        onClick={handleFlip}
      >
        <motion.div
          className="card-inner"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          style={{
            border: "3px solid",
            borderColor: getBorderStyle(),
            transition: "border-color 0.1s ease",
          }}
        >
          {/* 아이콘 레이어 */}
          <div className="card-icons-layer">
            <button
              className="icon-btn volume"
              onClick={(e) => {
                e.stopPropagation();
                console.log("Speak");
              }}
            >
              <Volume2 size={24} />
            </button>
            <button
              className="icon-btn star"
              onClick={(e) => {
                e.stopPropagation();
                console.log("Bookmark");
              }}
            >
              <Star size={24} />
            </button>
          </div>

          <div className="card-face card-front">
            <h2 className="word-text">{cardData.word}</h2>
            <div className="hint-text">클릭해서 뜻 보기</div>
          </div>

          <div className="card-face card-back">
            <h3 className="meaning-text">{cardData.meaning}</h3>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
});

export default StudyCard;
