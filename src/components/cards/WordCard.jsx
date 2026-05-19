import React, { useState, useEffect, useCallback } from "react";
import { Volume2, Edit3, Trash2, Star } from "lucide-react";
import "@/styles/components/cards/wordCard.css";

const WordCard = ({
  item,
  onEdit,
  onDelete,
  onPlay,
  onToggleWordFavorite,
  hideMode,
  langCode = "en-US",
}) => {
  const [tempShow, setTempShow] = useState(false);

  // 모드가 바뀌면 임시 보여주기 상태 리셋
  useEffect(() => {
    setTempShow(false);
  }, [hideMode]);

  if (!item) return null;

  const statusClass = item.status ? `status-${item.status}` : "";
  const isWordHidden = hideMode === "word" && !tempShow;
  const isMeaningHidden = hideMode === "meaning" && !tempShow;

  const isRTL = (text) => {
    if (!text) return false;
    const rtlRegex =
      /[\p{Script=Arabic}\p{Script=Hebrew}\p{Script=Syriac}\p{Script=Thaana}]/u;
    return rtlRegex.test(text);
  };

  const wordDir = isRTL(item.word) ? "rtl" : "ltr";
  const meaningDir = isRTL(item.meaning) ? "rtl" : "ltr";
  const exampleDir = isRTL(item.example) ? "rtl" : "ltr";

  // 🌟 [스펙 수정 1] 행 전체를 클릭했을 때의 동작
  const handleRowClick = useCallback(
    (text, lang) => {
      if (hideMode) {
        // 가리기 모드일 때 행을 누르면: 음성 재생 없이 오직 가리기 토글만 수행!
        setTempShow((prev) => !prev);
      } else {
        // 가리기 모드가 아닐 때 행을 누르면: 정상 음성 재생!
        if (onPlay) onPlay(text, lang);
      }
    },
    [hideMode, onPlay],
  );

  // 🌟 [스펙 수정 2] 오디오 버튼만 단독으로 클릭했을 때의 동작
  const handleAudioButtonClick = useCallback(
    (e, text, lang) => {
      e.stopPropagation(); // 💡 중요: 행 전체 클릭 이벤트가 발동해서 토글이 되어버리는 것을 원천 차단!
      if (onPlay) {
        onPlay(text, lang); // 가리기 모드든 아니든 오디오 버튼은 무조건 묻지도 따지지도 않고 재생!
      }
    },
    [onPlay],
  );

  return (
    <div className={`v-word-card ${statusClass}`}>
      {/* 본문 영역 */}
      <div className="v-word-body">
        {/* 🅰️ 단어 행 */}
        <div
          className="v-word-row-wrapper clickable-row"
          onClick={() => handleRowClick(item.word, langCode)}
        >
          <div className="v-card-audio-zone">
            <button
              className="v-word-audio-btn-sm"
              onClick={(e) => handleAudioButtonClick(e, item.word, langCode)}
              aria-label="단어 발음 듣기"
            >
              <Volume2 size={16} />
            </button>
          </div>
          <div className="v-word-main-wrapper" dir={wordDir}>
            <span className={`v-word-main ${isWordHidden ? "v-masked" : ""}`}>
              {item.word}
            </span>
          </div>
        </div>

        {/* 🅱️ 뜻 행 */}
        <div
          className="v-word-row-wrapper clickable-row"
          onClick={() => handleRowClick(item.meaning, "ko-KR")}
        >
          <div className="v-card-audio-zone">
            <button
              className="v-word-audio-btn-sm"
              onClick={(e) => handleAudioButtonClick(e, item.meaning, "ko-KR")}
              aria-label="뜻 듣기"
            >
              <Volume2 size={16} />
            </button>
          </div>
          <div className="v-word-sub-wrapper" dir={meaningDir}>
            <span className={`v-word-sub ${isMeaningHidden ? "v-masked" : ""}`}>
              {item.meaning}
            </span>
          </div>
        </div>

        {/* 🆃 예문 행 (값이 있을 때만) */}
        {item.example && (
          <div
            className="v-word-row-wrapper clickable-row"
            onClick={() => handleRowClick(item.example, langCode)}
          >
            <div className="v-card-audio-zone">
              <button
                className="v-word-audio-btn-sm"
                onClick={(e) =>
                  handleAudioButtonClick(e, item.example, langCode)
                }
                aria-label="예문 발음 듣기"
              >
                <Volume2 size={16} />
              </button>
            </div>
            <div className="v-word-sub-wrapper" dir={exampleDir}>
              <span
                className={`v-word-sub example-text ${isMeaningHidden ? "v-masked" : ""}`}
              >
                {item.example}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3. 액션 버튼 (우측 세로) */}
      <div className="v-word-actions">
        <button
          className={`v-action-icon-btn favorite ${item.isFavorite ? "active" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWordFavorite &&
              onToggleWordFavorite(item.id, item.isFavorite);
          }}
          aria-label="즐겨찾기"
        >
          <Star size={16} fill={item.isFavorite ? "currentColor" : "none"} />
        </button>

        <button
          className="v-action-icon-btn"
          onClick={(e) => {
            e.stopPropagation();
            onEdit && onEdit(item);
          }}
          aria-label="수정"
        >
          <Edit3 size={16} />
        </button>

        <button
          className="v-action-icon-btn delete"
          onClick={(e) => {
            e.stopPropagation();
            onDelete && onDelete(item.id);
          }}
          aria-label="삭제"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default React.memo(WordCard, (prev, next) => {
  return (
    prev.item.id === next.item.id &&
    prev.item.word === next.item.word &&
    prev.item.meaning === next.item.meaning &&
    prev.item.example === next.item.example &&
    prev.item.status === next.item.status &&
    prev.item.isFavorite === next.item.isFavorite &&
    prev.hideMode === next.hideMode
  );
});
