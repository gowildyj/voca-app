// src/pages/users/CategoryWordList.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGlobalStore } from "@/store/useGlobalStore";
import { playText } from "@/utils/ttsUtils";
import WordCard from "@/components/cards/WordCard";
import HeroCard from "@/components/cards/HeroCard";
import VisibilityToggle from "@/components/common/VisibilityToggle";
import StudyPage from "@/pages/StudyPage";
import { ROUTES, generatePath } from "@/routes/AppRoutes";

const CategoryWordList = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { items, fetchAdminItems, learningLang, nativeLang, categories } =
    useGlobalStore();

  const [hideMode, setHideMode] = useState("none");
  const [isStudyOpen, setIsStudyOpen] = useState(false);

  useEffect(() => {
    fetchAdminItems();
  }, [fetchAdminItems]);

  // 카테고리에 속한 아이템 필터링
  const categoryItems = items.filter((item) =>
    item.item_tag_map?.some((tag) => tag.tag_id === categoryId),
  );

  const currentCategory = categories.find((c) => c.id === categoryId);
  const categoryName =
    currentCategory?.hashtag_translations?.find(
      (t) => t.lang_code === nativeLang,
    )?.tag_name || currentCategory?.unique_key;

  return (
    <div className="v-word-list-page">
      <header className="v-word-list-intro">
        <h1 className="v-deck-title">{categoryName}</h1>
        <p className="v-deck-desc">{learningLang} 단어 정복 중 ✈️</p>
      </header>

      <section className="v-word-list-header">
        <HeroCard
          variant="banner"
          title="학습 모드로 전환"
          subTitle={`${categoryItems.length}개의 카드`}
          onClick={() => setIsStudyOpen(true)}
        />
      </section>

      <section className="v-word-list-controls">
        <div className="bottom-control-bar">
          <VisibilityToggle
            hideMode={hideMode}
            onToggleMode={() => {
              const modes = ["none", "word", "meaning"];
              setHideMode(modes[(modes.indexOf(hideMode) + 1) % modes.length]);
            }}
          />
          <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
            음성 버튼을 눌러 발음을 확인하세요
          </span>
        </div>
      </section>

      <main className="v-word-card-stack">
        {categoryItems.map((item) => {
          const target = item.item_translations?.find(
            (t) => t.lang_code === learningLang,
          );
          const native = item.item_translations?.find(
            (t) => t.lang_code === nativeLang,
          );

          return (
            <WordCard
              key={item.id}
              item={{
                ...item,
                word: target?.content || "---",
                meaning: native?.content || "---",
                example: target?.example_sentence,
              }}
              hideMode={hideMode}
              onPlay={() => playText(target?.content, learningLang)}
              // 관리 전용 버튼(onEdit, onDelete)은 전달하지 않음
            />
          );
        })}
      </main>

      <StudyPage
        isOpen={isStudyOpen}
        onClose={() => setIsStudyOpen(false)}
        initialWords={categoryItems}
      />
    </div>
  );
};

export default CategoryWordList;
