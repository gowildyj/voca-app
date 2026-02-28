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
import { playText } from "@/utils/ttsUtils";
import "@/styles/components/ui/study/studyCard.css";

const StudyCard = forwardRef(
  ({ cardData, onSwipe, isNextPreview, language }, ref) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [swipeDirection, setSwipeDirection] = useState(null);

    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const controls = useAnimation();

    // 회전은 x축
    const rotate = useTransform(x, [-200, 200], [-25, 25]);

    // 테두리 피드백
    useEffect(() => {
      const unsubscribe = x.on("change", (latestX) => {
        if (latestX > 50) {
          setSwipeDirection("right");
        } else if (latestX < -50) {
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
      y.set(0);
      controls.set({ x: 0, y: 0, opacity: 1 });
      setIsFlipped(false);
      setSwipeDirection(null);
    }, [cardData, x, y, controls]);

    // 버튼 클릭 스와이프
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

    // 드래그 종료 핸들러
    const handleDragEnd = async (event, info) => {
      const offset = info.offset.x;

      if (offset > 50) {
        await controls.start({
          x: 500,
          opacity: 0,
          transition: { duration: 0.1 },
        });
        onSwipe("right");
      } else if (offset < -50) {
        await controls.start({
          x: -500,
          opacity: 0,
          transition: { duration: 0.1 },
        });
        onSwipe("left");
      } else {
        controls.start({ x: 0, y: 0, opacity: 1 });
      }
    };

    const handleFlip = () => {
      if (Math.abs(x.get()) < 5) setIsFlipped(!isFlipped);
    };

    // Space 카드뒤집기
    useEffect(() => {
      const handleKeyDown = (e) => {
        if (e.code === "Space" || e.key === " ") {
          if (e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
            e.preventDefault();
            handleFlip();
          }
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleFlip]);

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
          <div className="card-motion-wrapper">
            <div className="card-icons-layer">
              <button className="icon-btn volume">
                <Volume2 size={24} />
              </button>

              <button className="icon-btn star">
                <Star size={24} />
              </button>
            </div>
            <div
              className="card-inner preview-mode"
              style={{ border: "2px solid transparent" }}
            >
              <div className="card-face card-front">
                <span className="word-text">{cardData.word}</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="study-card-container">
        <motion.div
          className="card-motion-wrapper"
          tabIndex="0"
          onKeyDown={(e) => {
            if (e.key === " " || e.code === "Space") {
              e.preventDefault();
              handleFlip();
            }
          }}
          drag={true}
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          dragElastic={1}
          onDragEnd={handleDragEnd}
          animate={controls}
          style={{ x, y, rotate }}
          onClick={handleFlip}
        >
          <div className="card-icons-layer">
            <button
              className="icon-btn volume"
              onClick={(e) => {
                e.stopPropagation();
                if (cardData?.word) {
                  playText(cardData.word, language || "en-US");
                }
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
          <motion.div
            className="card-inner"
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            style={{
              border: "2px solid",
              borderColor: getBorderStyle(),
              transition: "border-color 0.1s ease",
            }}
          >
            <div className="card-face card-front">
              <span className="word-text">{cardData.word}</span>
              {/* <div className="hint-text">클릭해서 뜻 보기</div> */}
            </div>

            <div className="card-face card-back">
              <span className="meaning-text">{cardData.meaning}</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  },
);

export default StudyCard;
