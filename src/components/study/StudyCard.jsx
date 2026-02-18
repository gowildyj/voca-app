import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
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
    const [prevWordId, setPrevWordId] = useState(word.id);
    const controls = useAnimation();
    const x = useMotionValue(0);

    const rotate = useTransform(x, [-200, 200], [-25, 25]);
    const opacity = useTransform(x, [-300, -150, 0, 150, 300], [0, 1, 1, 1, 0]);
    const borderColor = useTransform(
      x,
      [-120, -40, 0, 40, 120],
      [
        "#ff4d4f",
        "rgba(255, 77, 79, 0)",
        "transparent",
        "rgba(82, 196, 26, 0)",
        "#52c41a",
      ],
    );

    if (word.id !== prevWordId) {
      setPrevWordId(word.id);
      setIsFlipped(false);
    }

    useEffect(() => {
      x.set(0);
    }, [word.id, x]);

    useLayoutEffect(() => {
      if (!isFront) return;
      const handleKeyDown = (e) => {
        if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName))
          return;
        if (e.code === "Space") {
          e.preventDefault();
          setIsFlipped((prev) => !prev);
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isFront]);

    useImperativeHandle(ref, () => ({
      async triggerSwipe(direction) {
        const targetX = direction === "right" ? 500 : -500;
        await controls.start({
          x: targetX,
          opacity: 0,
          transition: { duration: 0.3 },
        });
        onSwipe(direction);
      },
    }));

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

    const handleToggleFlip = useCallback(() => {
      if (Math.abs(x.get()) < 5) setIsFlipped((prev) => !prev);
    }, [x]);

    const handleSpeakerClick = useCallback(
      (e) => {
        e.stopPropagation();
        if (word?.word) speak(word.word, langCode);
      },
      [word, langCode],
    );

    return (
      <div className="study-card-wrapper">
        <motion.div
          className={`study-card-drag ${isFront ? "front" : "back"}`}
          style={
            isFront
              ? { x, rotate, opacity, borderColor }
              : { scale: 0.95, y: 10, opacity: 0.6 }
          }
          animate={isFront ? controls : undefined}
          drag={isFront ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.7}
          onDragEnd={handleDragEnd}
          onClick={isFront ? handleToggleFlip : undefined}
          whileDrag={{
            scale: 1,
            boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
            cursor: "grabbing",
          }}
        >
          {isFront && (
            <button
              onClick={handleSpeakerClick}
              className="card-speaker-btn"
              type="button"
              style={{ zIndex: 10 }}
            >
              <Volume2 size={24} />
            </button>
          )}

          <div className={`study-card-inner ${isFlipped ? "flipped" : ""}`}>
            <div className="card-face front">
              <h2>{word.word}</h2>
              <div className="flip-hint">
                <RotateCw size={16} />
              </div>
            </div>
            <div className="card-face back">
              <h2>{word.meaning}</h2>
              {word.example && <p>{word.example}</p>}
            </div>
          </div>
        </motion.div>
      </div>
    );
  },
);

StudyCard.displayName = "StudyCard";
export default React.memo(StudyCard);
