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
import { RotateCw, Volume2 } from "lucide-react";
import { speak } from "@/utils/tts";

const StudyCard = forwardRef(
  ({ word, onSwipe, langCode, isFront = true }, ref) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const controls = useAnimation();
    const x = useMotionValue(0);

    // --- 스타일 로직 ---
    const rotate = useTransform(x, [-200, 200], [-25, 25]);
    const opacity = useTransform(x, [-300, -150, 0, 150, 300], [0, 1, 1, 1, 0]);

    // 테두리 색상: 중앙에서는 투명(transparent) 혹은 연한 회색으로 두어 깔끔하게 유지
    const borderColor = useTransform(
      x,
      [-120, -40, 0, 40, 120],
      [
        "#ff4d4f", // 왼쪽 끝: 빨강
        "rgba(255, 77, 79, 0)", // 왼쪽 흐림
        "transparent", // 중앙: 투명 (테두리 없음)
        "rgba(82, 196, 26, 0)", // 오른쪽 흐림
        "#52c41a", // 오른쪽 끝: 초록
      ],
    );

    // ✅ [수정 1] 그림자를 아주 얕게 변경 (평면적인 느낌)
    // 기존: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" (붕 떠있는 느낌)
    const baseBoxShadow = "0 1px 3px rgba(0, 0, 0, 0.05)";

    useImperativeHandle(ref, () => ({
      async triggerSwipe(direction) {
        if (direction === "right") {
          await controls.start({
            x: 500,
            opacity: 0,
            transition: { duration: 0.3 },
          });
          onSwipe("right");
        } else {
          await controls.start({
            x: -500,
            opacity: 0,
            transition: { duration: 0.3 },
          });
          onSwipe("left");
        }
      },
    }));

    useEffect(() => {
      x.set(0);
      setIsFlipped(false);
    }, [word, x]);

    const handleDragEnd = async (event, info) => {
      const threshold = 100;
      const velocity = info.velocity.x;

      if (info.offset.x > threshold || velocity > 500) {
        await controls.start({
          x: 500,
          opacity: 0,
          transition: { duration: 0.2 },
        });
        onSwipe("right");
      } else if (info.offset.x < -threshold || velocity < -500) {
        await controls.start({
          x: -500,
          opacity: 0,
          transition: { duration: 0.2 },
        });
        onSwipe("left");
      } else {
        controls.start({
          x: 0,
          opacity: 1,
          transition: { type: "spring", stiffness: 300, damping: 20 },
        });
      }
    };

    const handleCardClick = () => {
      if (Math.abs(x.get()) < 5) setIsFlipped(!isFlipped);
    };

    const handleSpeakerClick = (e) => {
      e.stopPropagation();
      speak(word.word, langCode);
    };

    const backCardStyle = {
      scale: 0.95, // 뒷카드는 살짝만 작게
      y: 10, // 간격 좁힘
      opacity: 0.5,
      zIndex: 0,
      background: "var(--card)",
      boxShadow: "none", // 뒷카드는 그림자 제거해서 바닥에 붙임
      border: "1px solid rgba(0,0,0,0.05)", // 아주 연한 테두리만
    };

    const frontCardStyle = {
      x,
      rotate,
      opacity,
      zIndex: 10,
      background: "var(--card)",
      boxShadow: baseBoxShadow,
      borderWidth: "3px",
      borderStyle: "solid",
      borderColor,
      cursor: "grab",
      boxSizing: "border-box",
    };

    return (
      <div className="study-card-wrapper">
        <motion.div
          className="study-card-drag"
          style={isFront ? frontCardStyle : backCardStyle}
          animate={isFront ? controls : undefined}
          drag={isFront ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.7}
          onDragEnd={handleDragEnd}
          onClick={isFront ? handleCardClick : undefined}
          // ✅ [수정 2] 드래그할 때만 살짝 떠오르는 효과 (인터랙션 피드백)
          whileDrag={{
            scale: 1.02,
            boxShadow: "0 8px 20px rgba(0,0,0,0.1)", // 잡았을 때만 그림자 생김
            cursor: "grabbing",
          }}
          whileTap={isFront ? { cursor: "grabbing" } : undefined}
        >
          <div className={`study-card-inner ${isFlipped ? "flipped" : ""}`}>
            <div className="card-face front">
              <button
                onClick={handleSpeakerClick}
                className="card-speaker-btn"
                type="button"
              >
                <Volume2 size={20} />
              </button>
              <h2>{word.word}</h2>
              <div className="flip-hint">
                <RotateCw size={16} /> 클릭해서 뒤집기
              </div>
            </div>
            <div className="card-face back">
              <button
                onClick={handleSpeakerClick}
                className="card-speaker-btn"
                type="button"
              >
                <Volume2 size={20} />
              </button>
              <h2>{word.meaning}</h2>
              {word.example && <p>{word.example}</p>}
            </div>
          </div>
        </motion.div>
      </div>
    );
  },
);

export default StudyCard;
