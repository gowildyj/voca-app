import React, { useState } from "react";
import Button from "@/components/common/Button/Button";
import Badge from "@/components/common/Badge/Badge";
import SearchBar from "@/components/common/SearchBar/SearchBar";
import styles from "./DesignGuide.module.css";
import FilterTabs from "@/components/common/FilterTabs/FilterTabs";
import FilterBar from "@/components/common/FilterBar/FilterBar";

const DesignGuide = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTab, setCurrentTab] = useState("list");
  const tabs = [
    { id: "list", label: "목록 관리" },
    { id: "add", label: "대량 등록" },
    { id: "edit", label: "대량 수정" },
    { id: "edit2", label: "대량 수정2" },
  ];

  const [activeFilter, setActiveFilter] = useState("전체");
  const [activeTagFilter, setActiveTagFilter] = useState("전체");
  const filterItems = [
    "전체",
    "여행",
    "음식",
    "비즈니스",
    "일상",
    "교통",
    "쇼핑",
    "관광",
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>🎨 Design System Guide</h1>
        <p>프로젝트 공통 컴포넌트 및 테마 변수 확인 페이지</p>
      </header>

      {/* Buttons 섹션 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Buttons</h2>
        <div className={styles.grid}>
          <div className={styles.item}>
            <h3>Variants</h3>
            <div className={styles.flex}>
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
            </div>
          </div>
          <div className={styles.item}>
            <h3>Sizes</h3>
            <div className={styles.flex}>
              <Button size="sm">Small</Button>
              <Button size="base">Base</Button>
              <Button size="lg">Large</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Badges 섹션 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Badges Showcase</h2>
        <div className={styles.grid}>
          {/* 난이도 배지 */}
          <div className={styles.item}>
            <h3>Level Badges (Text Only)</h3>
            <div className={styles.flex}>
              <Badge type="primary">초급</Badge>
              <Badge type="primary">중급</Badge>
              <Badge type="outline">고급</Badge>
            </div>
          </div>

          {/* 해시태그 배지 */}
          <div className={styles.item}>
            <h3>Tag Badges (Auto-Hash)</h3>
            <div className={styles.flex}>
              <Badge type="tag">여행</Badge>
              <Badge type="tag">음식</Badge>
              <Badge type="tag">비즈니스</Badge>
            </div>
          </div>

          {/* 이모지 혼합형 */}
          <div className={styles.item}>
            <h3>With Emojis</h3>
            <div className={styles.flex}>
              <Badge type="primary" emoji="🌱">
                초급
              </Badge>
              <Badge type="tag" emoji="✈️">
                여행
              </Badge>
              <Badge type="outline" emoji="✅">
                완료
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* SearchBar 섹션 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Forms & Inputs</h2>
        <div className={styles.grid}>
          <div className={styles.item}>
            <h3>SearchBar</h3>
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="언어 또는 태그 검색..."
            />
            <p
              style={{
                marginTop: "12px",
                fontSize: "0.85rem",
                color: "var(--text-sub)",
                background: "var(--bg-layer)",
                padding: "8px",
                borderRadius: "6px",
              }}
            >
              🔍 실시간 입력값: <strong>{searchTerm || "(내용 없음)"}</strong>
            </p>
          </div>
        </div>
      </section>

      {/* FilterBar 섹션 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Navigation (Tabs)</h2>
        <div className={styles.item} style={{ maxWidth: "500px" }}>
          <FilterTabs
            filters={tabs}
            currentFilter={currentTab}
            setFilter={setCurrentTab}
            filterCounts={{ list: 12, add: 0, edit: 5 }}
          />
          <p
            style={{
              marginTop: "12px",
              textAlign: "center",
              color: "var(--text-sub)",
            }}
          >
            현재 선택된 탭: <strong>{currentTab}</strong>
          </p>
        </div>
      </section>

      {/* FilterBar 섹션 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          Horizontal Navigation (FilterBar)
        </h2>
        <div className={styles.item}>
          <p
            style={{
              marginBottom: "10px",
              fontSize: "0.8rem",
              color: "var(--text-sub)",
            }}
          >
            ← 가로로 스크롤 해보세요
          </p>
          <FilterBar
            items={filterItems}
            activeItem={activeFilter}
            onSelect={setActiveFilter}
          />
          <div
            style={{
              padding: "20px",
              textAlign: "center",
              background: "var(--bg-layer)",
              borderRadius: "12px",
              marginTop: "10px",
            }}
          >
            현재 선택된 카테고리: <strong>{activeFilter}</strong>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>FilterBar Variants</h2>

        <div className={styles.item}>
          <h3>1. Category Style (초급/중급/고급)</h3>
          <FilterBar
            items={["전체", "초급", "중급", "고급"]}
            activeItem={activeFilter}
            onSelect={setActiveFilter}
          />
        </div>

        <div className={styles.item} style={{ marginTop: "20px" }}>
          <h3>2. Hashtag Style (isTag={true})</h3>
          <FilterBar
            isTag={true}
            items={["여행", "음식", "비즈니스", "일상", "교통"]}
            activeItem={activeTagFilter}
            onSelect={setActiveTagFilter}
          />
        </div>
      </section>

      {/* Color Palette 섹션 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Theme Colors</h2>
        <div className={styles.colorGrid}>
          <div
            className={styles.colorBox}
            style={{ background: "var(--primary)", color: "white" }}
          >
            --primary
          </div>
          <div
            className={styles.colorBox}
            style={{ background: "var(--bg-layer)" }}
          >
            --bg-layer
          </div>
          <div
            className={styles.colorBox}
            style={{ background: "var(--border)" }}
          >
            --border
          </div>
          <div
            className={styles.colorBox}
            style={{ background: "var(--text-main)", color: "var(--bg)" }}
          >
            --text-main
          </div>
        </div>
      </section>
    </div>
  );
};

export default DesignGuide;
