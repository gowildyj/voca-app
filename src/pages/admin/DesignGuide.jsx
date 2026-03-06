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
import VocabItem from "@/components/ui/VocabItem/VocabItem";

import { Star, PlayCircle, ChevronRight, Volume2 } from "lucide-react";

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

  const handleReveal = (revealKey) => {
    setRevealedIds((prev) =>
      prev.includes(revealKey) ? prev : [...prev, revealKey],
    );
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
        <h2 className={styles.sectionTitle}>
          Content Controls (VocabItem Test)
        </h2>
        <div className={styles.item}>
          <h3>Visibility Toggle & VocabItem Integration</h3>
          <div style={{ marginBottom: "20px" }}>
            <VisibilityToggle
              hideMode={hideMode}
              onToggleMode={handleToggleMode}
            />
          </div>

          <div className={styles.vocabContainer}>
            {[
              {
                id: 101,
                word: "Oui",
                meaning: "네 / 예",
                example: "Oui, c'est ça.",
                isFavorite: true,
              },
              {
                id: 102,
                word: "Enchanté",
                meaning: "만나서 반가워요",
                example: "Enchanté de vous voir.",
                isFavorite: false,
              },
              {
                id: 103,
                word: "C'est la vie",
                meaning: "그것이 인생이다",
                example: null,
                isFavorite: false,
              },
            ].map((item) => (
              <VocabItem
                key={item.id}
                item={item}
                hideMode={hideMode}
                revealedIds={revealedIds}
                onReveal={handleReveal}
                onPlayAudio={() => console.log("Audio:", item.word)}
                onToggleFavorite={() => console.log("Fav:", item.id)}
              />
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

      {/* 단어 영역 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Vocabulary Infinite List</h2>
        <div className={styles.item}>
          <p
            style={{
              marginBottom: "12px",
              fontSize: "0.85rem",
              color: "var(--text-sub)",
            }}
          >
            총 2,540개의 단어 중 30개 표시 중 (스크롤 테스트용)
          </p>

          {/* 실제 단어들이 나열되는 컨테이너 */}
          <div className={styles.vocabListContainer}>
            {[
              {
                id: 101,
                word: "Bonjour",
                meaning: "안녕하세요",
                example: "Bonjour, 아침 인사예요.",
                isFavorite: true,
              },
              {
                id: 102,
                word: "Merci beaucoup",
                meaning: "매우 감사합니다",
                example: null,
                isFavorite: false,
              },
              {
                id: 103,
                word: "Je t'aime",
                meaning: "사랑해",
                example: "Je t'aime de tout mon cœur.",
                isFavorite: true,
              },
              {
                id: 104,
                word: "Où est la gare?",
                meaning: "기차역이 어디인가요?",
                example: null,
                isFavorite: false,
              },
              {
                id: 105,
                word: "Enchanté",
                meaning: "만나서 반가워요",
                example: "Enchanté de vous rencontrer.",
                isFavorite: false,
              },
              {
                id: 106,
                word: "C'est combien?",
                meaning: "이건 얼마예요?",
                example: null,
                isFavorite: true,
              },
            ].map((item) => (
              <VocabItem
                key={item.id}
                item={item}
                hideMode={hideMode} // 상단 토글 상태 연결
                revealedIds={revealedIds}
                onReveal={handleReveal}
                onPlayAudio={() => console.log(`${item.word} 재생`)}
                onToggleFavorite={() => console.log(`${item.id} 즐겨찾기 토글`)}
              />
            ))}

            {/* 로딩 표시 샘플 (수천 개 데이터를 가져올 때 하단에 표시될 요소) */}
            <div className={styles.listLoader}>
              <span className={styles.loaderText}>
                새로운 단어를 불러오는 중...
              </span>
            </div>
          </div>
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
