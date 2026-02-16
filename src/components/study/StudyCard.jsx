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

    // 1. 회전 (Tilt)
    const rotate = useTransform(x, [-200, 200], [-25, 25]);

    // 2. 투명도 (Opacity)
    const opacity = useTransform(x, [-300, -150, 0, 150, 300], [0, 1, 1, 1, 0]);

    // 3. 테두리 색상 (5단계 데드존 적용)
    const borderColor = useTransform(
      x,
      [-120, -40, 0, 40, 120],
      [
        "#ff4d4f", // 왼쪽 끝 (빨강)
        "rgba(255, 77, 79, 0)", // 왼쪽 흐림
        "transparent", // 중앙 (투명)
        "rgba(82, 196, 26, 0)", // 오른쪽 흐림
        "#52c41a", // 오른쪽 끝 (초록)
      ],
    );

    useEffect(() => {
      // 맨 앞장(isFront)이 아니면 키보드 이벤트 무시
      if (!isFront) return;

      const handleKeyDown = (e) => {
        if (e.code === "Space") {
          e.preventDefault(); // 스페이스바 누를 때 스크롤 내려가는 것 방지
          setIsFlipped((prev) => !prev);
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isFront]);

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
      // x값(framer-motion value)은 외부 시스템에 가까우므로 직접 수정해도 괜찮습니다.
      x.set(0);

      // 동기적인 setState 호출이 에러를 발생시킨다면,
      // 아주 짧은 딜레이를 주어 다음 틱에서 실행되게 합니다.
      const timer = setTimeout(() => {
        setIsFlipped(false);
      }, 0);

      return () => clearTimeout(timer);
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

    return (
      <div className="study-card-wrapper">
        <motion.div
          // ✅ CSS 클래스로 정적 스타일(배경, 그림자 등) 적용
          className={`study-card-drag ${isFront ? "front" : "back"}`}
          // ✅ JS로는 동적인 움직임 값만 제어
          style={
            isFront
              ? { x, rotate, opacity, borderColor }
              : { scale: 0.95, y: 10, opacity: 0.6 } // 뒷면 카드 위치
          }
          animate={isFront ? controls : undefined}
          drag={isFront ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.7}
          onDragEnd={handleDragEnd}
          onClick={isFront ? handleCardClick : undefined}
          // ✅ 드래그 시 살짝 떠오르는 효과 (그림자 진해짐 + 확대)
          whileDrag={{
            scale: 1,
            boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
            cursor: "grabbing",
          }}
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
                <RotateCw size={16} /> 클릭해서 뒤집기 / 스페이스바 눌러서
                뒤집기
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
