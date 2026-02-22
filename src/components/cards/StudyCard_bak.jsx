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
import Button from "@/components/common/Button";
import "@/styles/components/cards/studyCard.css";

const StudyCard = forwardRef(({ cardData, onSwipe }, ref) => {
  const x = useMotionValue(0);
  const controls = useAnimation();
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const borderColor = useTransform(
    x,
    [-200, 0, 200],
    ["#f97316", "rgba(0,0,0,0)", "#10b981"],
  );

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

  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    x.set(0);
    controls.set({ x: 0, opacity: 1 });
    setIsFlipped(false);
  }, [cardData, x, controls]);

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
    <div className="v-study-card-container">
      <div className="v-card-background-effect" />
      <motion.div
        className="v-card-motion-wrapper"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ x, rotate }}
        onClick={handleFlip}
      >
        <motion.div
          className="v-card-inner"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          style={{ border: "3px solid transparent", borderColor }}
        >
          <div className="v-card-icons-layer">
            <Button variant="icon" icon={<Volume2 size={20} />} />
            <button
              className="v-card-icon-btn volume"
              onClick={(e) => {
                e.stopPropagation();
                console.log("Speak");
              }}
            >
              <Volume2 size={24} />
            </button>
            <button
              className="v-card-icon-btn star"
              onClick={(e) => {
                e.stopPropagation();
                console.log("Bookmark");
              }}
            >
              <Star size={24} />
            </button>
          </div>

          <div className="v-card-face v-card-front">
            <span className="v-emoji-display">{cardData.emoji || "📝"}</span>
            <h2 className="v-word-text">{cardData.word}</h2>
            <span className="v-pronunciation-text">
              [{cardData.pronunciation}]
            </span>
            <div className="v-hint-text">터치하면 뜻, 밀면 넘김!</div>
          </div>

          <div className="v-card-face v-card-back">
            <span className="v-part-of-speech">{cardData.partOfSpeech}</span>
            <h3 className="v-meaning-text">{cardData.meaning}</h3>
            <div className="v-example-box">
              <p className="v-example-en">“{cardData.exampleEn}”</p>
              <p className="v-example-ko">{cardData.exampleKo}</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
});

export default StudyCard;
