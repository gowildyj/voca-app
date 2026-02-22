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

// forwardRef를 사용하여 부모가 이 컴포넌트의 함수를 부를 수 있게 함
const StudyCard = forwardRef(({ cardData, onSwipe, isNextPreview }, ref) => {
  // === 1. 애니메이션 값 ===
  const x = useMotionValue(0);
  const controls = useAnimation();
  const rotate = useTransform(x, [-200, 200], [-25, 25]);

  // 테두리 색상 (Orange -> Transparent -> Green)
  const borderColor = useTransform(
    x,
    [-200, 0, 200],
    ["#f97316", "rgba(0,0,0,0)", "#10b981"],
  );

  if (isNextPreview) {
    return (
      <div className="study-card-container preview">
        <div className="card-inner">
          <div className="card-face card-front">
            {/* 메인 카드와 동일한 구성 요소 배치 */}
            <span className="emoji-display">{cardData.emoji || "📝"}</span>
            <h2 className="word-text">{cardData.word}</h2>
            <span className="pronunciation-text">
              [{cardData.pronunciation}]
            </span>
            <div className="hint-text"></div>
          </div>
        </div>
      </div>
    );
  }

  // === 2. 부모에서 호출할 수 있는 함수 (버튼 클릭 시 스와이프) ===
  useImperativeHandle(ref, () => ({
    swipeRight: async () => {
      await controls.start({
        x: 500,
        opacity: 0,
        transition: { duration: 0.2 },
      });
      onSwipe("right");
    },
    swipeLeft: async () => {
      await controls.start({
        x: -500,
        opacity: 0,
        transition: { duration: 0.2 },
      });
      onSwipe("left");
    },
  }));

  // === 3. 카드 뒤집기 상태 ===
  const [isFlipped, setIsFlipped] = useState(false);

  // 데이터 변경 시 초기화
  useEffect(() => {
    x.set(0);
    controls.set({ x: 0, opacity: 1 }); // 위치/투명도 리셋
    setIsFlipped(false);
  }, [cardData, x, controls]);

  // === 4. 드래그 종료 핸들러 ===
  const handleDragEnd = async (event, info) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset > 100 || velocity > 500) {
      await controls.start({ x: 500, opacity: 0 });
      onSwipe("right");
    } else if (offset < -100 || velocity < -500) {
      await controls.start({ x: -500, opacity: 0 });
      onSwipe("left");
    } else {
      controls.start({ x: 0, opacity: 1 });
    }
  };

  const handleFlip = () => {
    if (Math.abs(x.get()) < 5) setIsFlipped(!isFlipped);
  };

  if (!cardData) return null;

  return (
    <div className="study-card-container">
      {/* 5. 뒷장 카드 효과 (배경에 깔리는 카드) */}
      {/* <div className="card-background-effect" /> */}

      <motion.div
        className="card-motion-wrapper"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ x, rotate }}
        onClick={handleFlip}
      >
        {/* === 실제 카드 내용 === */}
        <motion.div
          className="card-inner"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.3 }} // 회전 속도 0.6 -> 0.3s로 단축
          style={{
            border: "3px solid transparent", // 테두리 두께 살짝 키움
            borderColor: borderColor,
          }}
        >
          {/* === 공통 아이콘 (앞/뒤 모두 보임) === */}
          {/* z-index를 높여서 클릭 가능하게 함 */}
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

          {/* 앞면 */}
          <div className="card-face card-front">
            <span className="emoji-display">{cardData.emoji || "📝"}</span>
            <h2 className="word-text">{cardData.word}</h2>
            <span className="pronunciation-text">
              [{cardData.pronunciation}]
            </span>
            <div className="hint-text"></div>
          </div>

          {/* 뒷면 */}
          <div className="card-face card-back">
            <span className="part-of-speech">{cardData.partOfSpeech}</span>
            <h3 className="meaning-text">{cardData.meaning}</h3>
            <div className="example-box">
              <p className="example-en">“{cardData.exampleEn}”</p>
              <p className="example-ko">{cardData.exampleKo}</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
});

export default StudyCard;
