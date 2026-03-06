import React, { useState } from "react";
import Button from "@/components/common/Button/Button";
import Badge from "@/components/common/Badge/Badge";
import SearchBar from "@/components/common/SearchBar/SearchBar";
import styles from "./DesignGuide.module.css";
import FilterTabs from "@/components/common/FilterTabs/FilterTabs";
import FilterBar from "@/components/common/FilterBar/FilterBar";
import VisibilityToggle from "@/components/common/VisibilityToggle/VisibilityToggle";
import SortSelector from "@/components/common/SortSelector/SortSelector";
import StudyControls from "@/components/ui/StudyControls/StudyControls";
import StudyCard from "@/components/common/StudyCard/StudyCard";

import { Star, PlayCircle, ChevronRight } from "lucide-react";

const DesignGuide = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTab, setCurrentTab] = useState("list");
  const tabs = [
    { id: "list", label: "전체" },
    { id: "add", label: "중요" },
    { id: "edit", label: "미학습" },
    { id: "known", label: "알아" },
    { id: "unknown", label: "몰라" },
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

  const items = [
    "여행",
    "음식",
    "비즈니스",
    "일상",
    "교통",
    "쇼핑",
    "관광",
    "취미",
    "스포츠",
    "IT",
    "언어",
    "문화",
    "자기계발",
    "건강",
    "영화",
    "음악",
    "게임",
  ];

  const [hideMode, setHideMode] = useState(null);
  const [revealedIds, setRevealedIds] = useState([]);
  const [sortType, setSortType] = useState("default");
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [isAutoAudio, setIsAutoAudio] = useState(true);
  const [viewMode, setViewMode] = useState("frontFirst");

  const handleToggleMode = (mode) => {
    setRevealedIds([]);
    setHideMode((prevMode) => (prevMode === mode ? null : mode));
  };

  const handleReveal = (id) => {
    setRevealedIds((prev) => [...prev, id]);
  };

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
              <Badge type="hash">hash</Badge>
              <Badge type="tag">tag</Badge>
              <Badge type="tag-ghost">tag-ghost</Badge>
              <Badge type="primary">primary</Badge>
              <Badge type="outline">outline</Badge>
              <Badge type="ghost">ghost</Badge>
              <Badge type="danger">danger</Badge>
              <Badge type="success">success</Badge>
              <Badge type="emoji">emoji</Badge>
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
        {/* <div className={styles.grid}> */}
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
        {/* </div> */}
      </section>

      {/* FilterBar 섹션 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Navigation (Tabs)</h2>
        <div className={styles.item}>
          <FilterTabs
            filters={tabs}
            currentFilter={currentTab}
            setFilter={setCurrentTab}
            filterCounts={{
              list: 12,
              add: 0,
              edit: 5,
              known: 3,
              unknown: 1000,
            }}
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
      {/* 1. 가로 스크롤 네비게이션 섹션 */}
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
            isScroll={true}
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

      {/* 2. 필터바 변형 섹션 (줄바꿈 모드) */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>FilterBar Variants</h2>

        {/* 카테고리 스타일 */}
        <div className={styles.item}>
          <h3>1. Category Style (초급/중급/고급)</h3>
          {/* 기본값인 줄바꿈 모드로 렌더링 */}
          <FilterBar
            items={["전체", "초급", "중급", "고급"]}
            activeItem={activeFilter}
            onSelect={setActiveFilter}
          />
        </div>

        {/* 해시태그 스타일 */}
        <div className={styles.item} style={{ marginTop: "30px" }}>
          <h3>2. Hashtag Style (isTag={true} + Wrap)</h3>
          <FilterBar
            isTag={true}
            items={items}
            activeItem={activeTagFilter}
            onSelect={setActiveTagFilter}
          />
        </div>
      </section>

      {/* VisibilityToggle 섹션 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Content Controls</h2>
        <div className={styles.item}>
          <h3>Visibility Toggle & Gray Overlay Test</h3>
          <div style={{ marginBottom: "20px" }}>
            <VisibilityToggle
              hideMode={hideMode}
              onToggleMode={handleToggleMode}
            />
          </div>

          {/* 길이가 다른 3가지 샘플 세트 */}
          <div className={styles.testContainer}>
            {[
              { id: 0, word: "Oui", meaning: "네 / 예" },
              { id: 1, word: "Enchanté", meaning: "만나서 반가워요" },
              {
                id: 2,
                word: "Je m'appelle Stella",
                meaning: "제 이름은 스텔라입니다",
              },
            ].map((item) => (
              <div key={item.id} className={styles.wordCardSample}>
                {/* 1. 단어 영역 */}
                <div className="hide-wrapper">
                  <span className={styles.wordText}>{item.word}</span>
                  {/* 전체 모드가 'word'이고, 개별 해제 목록에 없으면 가림 */}
                  {hideMode === "word" &&
                    !revealedIds.includes(`${item.id}-word`) && (
                      <div
                        className="hide-overlay"
                        onClick={() => handleReveal(`${item.id}-word`)}
                      />
                    )}
                </div>

                {/* 2. 뜻 영역 */}
                <div className="hide-wrapper">
                  <span className={styles.meaningText}>{item.meaning}</span>
                  {hideMode === "meaning" &&
                    !revealedIds.includes(`${item.id}-meaning`) && (
                      <div
                        className="hide-overlay"
                        onClick={() => handleReveal(`${item.id}-meaning`)}
                      />
                    )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 정렬 셀렉터 섹션 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>List Sorting</h2>
        <div className={styles.item}>
          <h3>Sort Selector</h3>
          <div className={styles.flex}>
            <SortSelector
              sortType={sortType}
              setSortType={setSortType}
              onShuffle={() => alert("리스트 셔플!")}
            />
          </div>
          <p
            style={{
              marginTop: "10px",
              fontSize: "0.8rem",
              color: "var(--text-sub)",
            }}
          >
            현재 정렬: <strong>{sortType}</strong>
          </p>
        </div>
      </section>

      {/* 스터디카드 컨트롤 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Study Session Controls</h2>
        <div className={styles.item}>
          <StudyControls
            onUndo={() => alert("이전 카드로!")}
            onShuffle={() => alert("리스트 셔플!")}
            isAutoPlay={isAutoPlay}
            toggleAutoPlay={() => setIsAutoPlay(!isAutoPlay)}
            isAutoAudio={isAutoAudio}
            toggleAutoAudio={() => setIsAutoAudio(!isAutoAudio)}
            viewMode={viewMode}
            toggleViewMode={() =>
              setViewMode((prev) =>
                prev === "frontFirst" ? "backFirst" : "frontFirst",
              )
            }
          />
        </div>
      </section>

      {/* 스터디덱 카드 섹션 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Dashboard Cards</h2>
        <div className={styles.grid}>
          <StudyCard
            title="프랑스어 기초 회화"
            lang="fr-FR"
            totalCount={102}
            progress={12}
            status={{ known: 12, unknown: 5, unlearned: 85 }}
            tags={["여행", "인사"]}
            isFavorite={true}
            onPlay={() => alert("학습 시작!")}
          />

          <StudyCard
            title="비즈니스 영어 이메일"
            lang="en-US"
            totalCount={50}
            progress={60}
            status={{ known: 30, unknown: 2, unlearned: 18 }}
            tags={items}
            onPlay={() => alert("비즈니스 학습!")}
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
