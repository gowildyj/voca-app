// src/pages/users/CategoryExplorer.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalStore } from "@/store/useGlobalStore";
import SearchBar from "@/components/common/SearchBar";
import DeckCard from "@/components/cards/DeckCard";
import FilterTabs from "@/components/common/FilterTabs";
import { ROUTES, generatePath } from "@/routes/AppRoutes";

const CategoryExplorer = () => {
  const navigate = useNavigate();
  const { categories, fetchAdminCategories, nativeLang } = useGlobalStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentFilter, setCurrentFilter] = useState("all");

  useEffect(() => {
    fetchAdminCategories();
  }, [fetchAdminCategories]);

  // 🌟 [수정] 로그에 찍힌 'uq_key' 필드를 사용하도록 보정
  const getTagName = (cat) => {
    const trans = cat.hashtag_translations?.find(
      (t) => t.lang_code === nativeLang,
    );
    return trans ? trans.tag_name : cat.uq_key || cat.unique_key || "Unknown";
  };

  const filteredCategories = useMemo(() => {
    let list = categories;
    if (currentFilter === "favorite") list = list.filter((c) => c.is_favorite);
    if (searchQuery) {
      list = list.filter((c) =>
        getTagName(c).toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    return list;
  }, [categories, currentFilter, searchQuery, nativeLang]);

  return (
    <div className="v-deck-list-page">
      <section className="v-deck-list-header">
        <p className="v-deck-welcome-msg">어떤 주제를 정복해볼까요? 🔥</p>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="카테고리 검색..."
        />
        <div className="v-filter-wrapper">
          <FilterTabs
            filters={[
              { id: "all", label: "전체" },
              { id: "favorite", label: "즐겨찾기" },
            ]}
            currentFilter={currentFilter}
            setFilter={setCurrentFilter}
            filterCounts={{
              all: categories.length,
              favorite: categories.filter((c) => c.is_favorite).length,
            }}
          />
        </div>
      </section>

      <main className="v-deck-grid-container">
        <div className="v-home-grid">
          {filteredCategories.map((cat) => (
            <DeckCard
              key={cat.id}
              title={getTagName(cat)}
              icon={cat.icon_emoji || "📁"}
              isFavorite={cat.is_favorite || false}
              // 🌟 [에러 해결] DeckCard가 기다리는 필수 숫자 데이터 전달
              wordCount={0}
              progress={0}
              onClick={() =>
                navigate(
                  generatePath(ROUTES.CATEGORY_DETAIL, { categoryId: cat.id }),
                )
              }
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default CategoryExplorer;
