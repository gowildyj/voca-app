import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Plus,
  Volume2,
  Star,
  Trash2,
  RotateCcw,
  Play,
  Shuffle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "@/styles/pages/designGuide.css";

import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import FilterBar from "@/components/common/FilterBar";
import ComplexFilterBar from "@/components/common/ComplexFilterBar";
import Spinner from "@/components/common/Spinner";
import SearchBar from "@/components/common/SearchBar";
import { StyledInput, StyledTextArea } from "@/components/common/FormElements";
import BottomSheet from "@/components/modals/BottomSheet";
import StudyHeader from "@/components/ui/study/StudyHeader";
import WordEditForm from "@/components/modals/WordEditForm";
import WordBulkAddForm from "@/components/modals/WordBulkAddForm";
import WordAddTabsForm from "@/components/modals/WordAddTabsForm";
import DeckCard from "@/components/cards/DeckCard";
import AddDeckCard from "@/components/cards/AddDeckCard";
import HeroCard from "@/components/cards/HeroCard";
import WordCard from "@/components/cards/WordCard";
import WordListHeader from "@/components/ui/word/WordListHeader";
import ChatBubble from "@/components/cards/ChatBubble";
import SelectorModal from "@/components/modals/SelectorModal";
import ScenarioCard from "@/components/cards/ScenarioCard";
import StudyCard from "@/components/cards/WordCard";

const DesignGuide = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("전체");

  const [currentFilter, setFilter] = useState("all");
  const [sortType, setSortType] = useState("default");
  const [hideMode, setHideMode] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const inputRef = useRef(null);

  const [isWordModalOpen, setIsWordModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  const [isCombinedModalOpen, setIsCombinedModalOpen] = useState(false);
  const [openThemeId, setOpenThemeId] = useState(null); // 아코디언 상태 추가

  const testFilters = [
    { id: "all", label: "전체" },
    { id: "new", label: "미학습" },
    { id: "review", label: "몰라" },
    { id: "mastered", label: "알아" },
  ];

  const THEME_LIST = [
    { id: "modern", name: "모던 (Modern)", desc: "차분하고 깔끔한 기본 테마" },
    { id: "dark", name: "다크 (Dark)", desc: "깊은 밤처럼 눈이 편안한 테마" },
    { id: "bw", name: "흑백 (B&W)", desc: "강렬한 대비의 클래식 룩" },
    { id: "pink", name: "분홍 (Pink)", desc: "말린 장미빛 인디핑크" },
    { id: "blue", name: "파랑 (Blue)", desc: "청량하고 맑은 스카이 블루" },
    {
      id: "green",
      name: "초록 (Green)",
      desc: "심리적 안정을 주는 세이지 그린",
    },
    {
      id: "yellow",
      name: "노랑 (Yellow)",
      desc: "따뜻하고 포근한 버터 옐로우",
    },
    { id: "purple", name: "보라 (Purple)", desc: "우아하고 신비로운 라벤더" },
    { id: "pastel", name: "파스텔 (Pastel)", desc: "달콤한 솜사탕 믹스 테마" },
  ];

  const colorVars = [
    { name: "Background", var: "--bg" },
    { name: "Layer", var: "--bg-layer" },
    { name: "Card", var: "--card" },
    { name: "Primary", var: "--primary" },
    { name: "Accent", var: "--accent" },
    { name: "Text Main", var: "--text-main" },
    { name: "Text Sub", var: "--text-sub" },
    { name: "Text Muted", var: "--text-muted" },
    { name: "Border", var: "--border" },
    { name: "Border Active", var: "--border-active" },
    { name: "Danger", var: "--danger" },
    { name: "Success", var: "--success" },
  ];

  const handleToggleMode = (mode) => {
    setHideMode((prev) => (prev === mode ? null : mode));
  };

  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [currentOptions, setCurrentOptions] = useState([]);
  const [activeSlot, setActiveSlot] = useState("");
  const [selections, setSelections] = useState({
    drink: { word: "coffee", meaning: "커피" },
  });

  const handleOpenSelector = (name, options) => {
    setActiveSlot(name);
    setCurrentOptions(options);
    setIsSelectorOpen(true);
  };

  const handleSelect = (option) => {
    setSelections((prev) => ({ ...prev, [activeSlot]: option }));
  };

  useEffect(() => {
    if (isModalOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isModalOpen]);

  return (
    <div className="design-guide-page">
      {/* 상단 헤더 */}
      {/* <header className="design-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <h1>Design Guide & Components</h1>
      </header> */}

      <main className="design-content">
        <section className="design-intro">
          <h2>공통 UI 컴포넌트</h2>
          <p>앱 전반에서 사용하는 재사용 가능한 컴포넌트들을 정리합니다.</p>
        </section>

        <section className="component-section">
          <h3 className="section-title">0. 테마 컬러 팔레트 가이드</h3>
          <p className="section-desc">
            모든 테마의 색상 규격을 한눈에 확인하고 비교할 수 있습니다.
          </p>

          <div className="theme-accordion-container">
            {THEME_LIST.map((theme) => {
              const isOpen = openThemeId === theme.id;

              return (
                <div
                  key={theme.id}
                  className={`theme-accordion-item ${isOpen ? "is-open" : ""}`}
                  data-theme={theme.id} // 🌟 해당 테마의 CSS 변수를 강제로 주입
                >
                  <button
                    className="theme-accordion-header"
                    onClick={() => setOpenThemeId(isOpen ? null : theme.id)}
                  >
                    <div className="theme-header-info">
                      <span
                        className="theme-dot"
                        style={{ backgroundColor: "var(--primary)" }}
                      ></span>
                      <span className="theme-name">{theme.name}</span>
                      <span className="theme-desc-mini">{theme.desc}</span>
                    </div>
                    {isOpen ? (
                      <ChevronUp size={18} />
                    ) : (
                      <ChevronDown size={18} />
                    )}
                  </button>

                  {isOpen && (
                    <div className="theme-accordion-content">
                      <div className="color-palette-grid">
                        {colorVars.map((v) => (
                          <div className="color-item" key={v.var}>
                            <div
                              className="color-swatch"
                              style={{
                                backgroundColor: `var(${v.var})`,
                                border: "1px solid var(--border)",
                              }}
                            ></div>
                            <div className="color-info">
                              <span className="color-name">{v.name}</span>
                              <span className="color-var">{v.var}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* --- Color Palette Section --- */}
        <section className="component-section">
          <h3 className="section-title">0. 테마 컬러 팔레트 (Current Theme)</h3>
          <p className="section-desc">
            현재 적용된 테마의 주요 색상 변수들입니다.
          </p>

          <div className="color-palette-grid">
            {/* 배경 및 카드 */}
            <div className="color-item">
              <div
                className="color-swatch"
                style={{
                  backgroundColor: "var(--bg)",
                  border: "1px solid var(--border)",
                }}
              ></div>
              <div className="color-info">
                <span className="color-name">Background</span>
                <span className="color-var">--bg</span>
              </div>
            </div>
            <div className="color-item">
              <div
                className="color-swatch"
                style={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                }}
              ></div>
              <div className="color-info">
                <span className="color-name">Card</span>
                <span className="color-var">--card</span>
              </div>
            </div>

            {/* 포인트 컬러 */}
            <div className="color-item">
              <div
                className="color-swatch"
                style={{ backgroundColor: "var(--primary)" }}
              ></div>
              <div className="color-info">
                <span className="color-name">Primary</span>
                <span className="color-var">--primary</span>
              </div>
            </div>
            <div className="color-item">
              <div
                className="color-swatch"
                style={{ backgroundColor: "var(--accent)" }}
              ></div>
              <div className="color-info">
                <span className="color-name">Accent</span>
                <span className="color-var">--accent</span>
              </div>
            </div>

            {/* 텍스트 컬러 */}
            <div className="color-item">
              <div
                className="color-swatch"
                style={{ backgroundColor: "var(--text-main)" }}
              ></div>
              <div className="color-info">
                <span className="color-name">Text Main</span>
                <span className="color-var">--text-main</span>
              </div>
            </div>
            <div className="color-item">
              <div
                className="color-swatch"
                style={{ backgroundColor: "var(--text-sub)" }}
              ></div>
              <div className="color-info">
                <span className="color-name">Text Sub</span>
                <span className="color-var">--text-sub</span>
              </div>
            </div>

            {/* 상태 컬러 */}
            <div className="color-item">
              <div
                className="color-swatch"
                style={{ backgroundColor: "var(--danger)" }}
              ></div>
              <div className="color-info">
                <span className="color-name">Danger</span>
                <span className="color-var">--danger</span>
              </div>
            </div>
            <div className="color-item">
              <div
                className="color-swatch"
                style={{ backgroundColor: "var(--success)" }}
              ></div>
              <div className="color-info">
                <span className="color-name">Success</span>
                <span className="color-var">--success</span>
              </div>
            </div>
          </div>
        </section>

        {/* --- Badge Section --- */}
        <section className="component-section">
          <h3 className="section-title">1. Badges & Tags</h3>
          <div className="component-display">
            <div className="component-item">
              <span className="item-label">Default Tag (Hash)</span>
              <div className="flex-row">
                <Badge type="tag">여행</Badge>
                <Badge type="tag">식당</Badge>
                <Badge type="tag">비즈니스</Badge>
              </div>
            </div>

            <div className="component-item">
              <span className="item-label">Primary Badge (Level)</span>
              <div className="flex-row">
                <Badge type="primary">Beginner</Badge>
                <Badge type="primary">Intermediate</Badge>
                <Badge type="primary">Advanced</Badge>
              </div>
            </div>

            <div className="component-item">
              <span className="item-label">Outline & Ghost</span>
              <div className="flex-row">
                <Badge type="outline">24개 단어</Badge>
                <Badge type="ghost">진행률 30%</Badge>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Buttons Section */}
        <section className="component-section">
          <h3 className="section-title">2. Buttons (Action Elements)</h3>
          <div className="component-display">
            {/* Variants */}
            <div className="component-item">
              <span className="item-label">Variants</span>
              <div className="flex-row flex-wrap">
                <Button variant="primary">Primary Button</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost Button</Button>
                <Button variant="danger" icon={<Trash2 size={18} />}>
                  Delete
                </Button>
              </div>
            </div>

            {/* Sizes */}
            <div className="component-item">
              <span className="item-label">Sizes</span>
              <div className="flex-row align-end">
                <Button size="sm">Small</Button>
                <Button>Default</Button>
                <Button size="lg">Large Size</Button>
              </div>
            </div>

            {/* Icon Buttons */}
            <div className="component-item">
              <span className="item-label">Icon Buttons</span>
              <div className="flex-row">
                <Button variant="icon" icon={<Volume2 size={20} />} />
                <Button
                  variant="icon"
                  icon={<Star size={20} />}
                  active={true}
                />
              </div>
            </div>

            {/* Full Width */}
            <div className="component-item">
              <span className="item-label">Full Width</span>
              <Button fullWidth={true}>Full Width Button</Button>
            </div>
          </div>
        </section>

        {/* FAB는 우측 하단에 고정되어 나타납니다 */}
        {/* <Button variant="fab" icon={<Plus size={28} />} aria-label="추가하기" /> */}

        {/* 3. Filter Bar Section */}
        <section className="component-section">
          <h3 className="section-title">3. Filter & Category Bar</h3>
          <div className="component-display">
            <div className="component-item">
              <span className="item-label">Horizontal Scroll Filter</span>
              {/* activeTab 상태는 디자인 가이드 상단에 
          const [activeTab, setActiveTab] = useState("전체"); 로 선언해서 사용 
      */}
              <FilterBar
                items={["전체", "여행 ✈️", "식당 🍽️", "비즈니스 💼", "일상 💬"]}
                activeItem={activeTab}
                onSelect={setActiveTab}
              />
            </div>
          </div>
        </section>

        {/* 3. Complex Filter Bar Section */}
        <section className="component-section">
          <h3 className="section-title">3. Complex Filter & Controls</h3>
          <div className="component-display">
            <div className="component-item">
              <span className="item-label">Word List Filter Bar</span>
              <ComplexFilterBar
                filters={testFilters}
                currentFilter={currentFilter}
                setFilter={setFilter}
                sortType={sortType}
                setSortType={setSortType}
                hideMode={hideMode}
                onToggleMode={handleToggleMode}
                filterCounts={{ all: 20, new: 5, review: 2, mastered: 13 }}
                onShuffle={() => alert("Shuffled!")}
              />
            </div>

            <div className="selected-info">
              <p>
                필터: <strong>{currentFilter}</strong> | 정렬:{" "}
                <strong>{sortType}</strong> | 가리기:{" "}
                <strong>{hideMode || "None"}</strong>
              </p>
            </div>
          </div>
        </section>

        {/* 4. Loaders Section */}
        <section className="component-section">
          <h3 className="section-title">4. Loaders (Spinner)</h3>
          <div className="component-display">
            <div className="component-item">
              <span className="item-label">Spinner Sizes</span>
              <div className="flex-row align-center">
                <Spinner size="sm" />
                <Spinner size="base" />
                <Spinner size="lg" />
              </div>
            </div>

            <div className="component-item">
              <span className="item-label">In Button Example</span>
              <div className="flex-row">
                <Button disabled>
                  <Spinner size="sm" white className="mr-8" />
                  불러오는 중...
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Study Session Buttons Section */}
        <section className="component-section">
          <h3 className="section-title">5. Study Session Specifics</h3>
          <div className="component-display">
            {/* 도구 버튼 그룹 */}
            <div className="component-item">
              <span className="item-label">Study Tool Buttons</span>
              <div className="flex-row">
                <Button
                  variant="tool"
                  icon={<RotateCcw size={20} />}
                  aria-label="이전 카드"
                />
                <Button
                  variant="tool"
                  className="active"
                  icon={<Play size={20} fill="currentColor" />}
                  aria-label="자동 재생"
                />
                <Button
                  variant="tool"
                  icon={<Shuffle size={20} />}
                  aria-label="셔플 모드"
                />
              </div>
            </div>

            {/* 평가 버튼 그룹 */}
            <div className="component-item">
              <span className="item-label">Evaluation Buttons</span>
              <div className="btn-group-row">
                <Button variant="eval" className="unknown">
                  <span>몰라요</span>
                  <span className="btn-badge">2</span>
                </Button>
                <Button variant="eval" className="know">
                  <span>알아요 ✨</span>
                  <span className="btn-badge">5</span>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Inputs Section */}
        <section className="component-section">
          <h3 className="section-title">6. Search Bar (Inputs)</h3>
          <div className="component-display">
            <div className="component-item">
              <span className="item-label">Standard Search Bar</span>
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="단어나 뜻을 검색해 보세요"
              />
            </div>

            <div className="selected-info">
              입력된 검색어: <strong>{searchQuery || "(없음)"}</strong>
            </div>
          </div>
        </section>

        {/* 7. Forms & Modals Section */}
        <section className="component-section">
          <h3 className="section-title">7. Forms & Modals</h3>
          <div className="component-display">
            <div className="component-item">
              <span className="item-label">Styled Inputs</span>
              <StyledInput label="단어 이름" placeholder="예: Serendipity" />
              <StyledTextArea label="뜻 / 설명" placeholder="예: 뜻밖의 행운" />
            </div>

            <div className="component-item">
              <span className="item-label">Bottom Sheet Modal</span>
              <Button variant="secondary" onClick={() => setIsModalOpen(true)}>
                모달 열기 (자동 포커스 테스트)
              </Button>

              <BottomSheet
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="단어장 수정하기"
              >
                <div style={{ paddingBottom: "20px" }}>
                  {/* ★ 핵심: ref={inputRef} 를 추가하여 자동 포커스 연결 */}
                  <StyledInput
                    ref={inputRef}
                    label="단어장 제목"
                    defaultValue="스페인어 기초"
                    placeholder="열리자마자 포커스가 잡힙니다"
                  />
                  <StyledInput
                    ref={inputRef}
                    label="단어장 제목"
                    defaultValue="스페인어 기초"
                    placeholder="열리자마자 포커스가 잡힙니다"
                  />
                  <Button
                    fullWidth
                    onClick={() => setIsModalOpen(false)}
                    className="mt-16"
                  >
                    저장하기
                  </Button>
                </div>
              </BottomSheet>
            </div>
          </div>
        </section>

        {/* 8. Study Session Headers Section */}
        <section className="component-section">
          <h3 className="section-title">8. Study Session Header</h3>
          <div className="component-display">
            <div className="component-item">
              <span className="item-label">Learning Progress (15 / 24)</span>
              <div
                className="component-preview"
                style={{
                  border: "1px solid #eee",
                  borderRadius: "12px",
                  overflow: "hidden",
                }}
              >
                <StudyHeader
                  current={15}
                  total={24}
                  onClose={() => alert("Close Clicked")}
                  onSettings={() => alert("Settings Clicked")}
                />
              </div>
            </div>

            <div className="component-item">
              <span className="item-label">Initial State (1 / 24)</span>
              <div
                className="component-preview"
                style={{
                  border: "1px solid #eee",
                  borderRadius: "12px",
                  overflow: "hidden",
                }}
              >
                <StudyHeader
                  current={1}
                  total={24}
                  onClose={() => {}}
                  onSettings={() => {}}
                />
              </div>
            </div>
          </div>
        </section>

        {/* 9. Word Management Modals */}
        <section className="component-section">
          <h3 className="section-title">9. Word Management Modals</h3>
          <div className="component-display">
            <div className="component-item">
              <span className="item-label">Single & Bulk Add</span>
              <div className="flex-row">
                <Button
                  variant="secondary"
                  onClick={() => setIsWordModalOpen(true)}
                >
                  단어 하나 추가
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setIsBulkModalOpen(true)}
                >
                  대량 단어 추가
                </Button>
              </div>
            </div>

            {/* 개별 추가 모달 */}
            <WordEditForm
              isOpen={isWordModalOpen}
              onClose={() => setIsWordModalOpen(false)}
            />

            {/* 벌크 추가 모달 */}
            <WordBulkAddForm
              isOpen={isBulkModalOpen}
              onClose={() => setIsBulkModalOpen(false)}
            />
          </div>
        </section>

        {/* 9. Unified Word Management */}
        <section className="component-section">
          <h3 className="section-title">9. Unified Word Modal (Tabs)</h3>
          <div className="component-display">
            <div className="component-item">
              <span className="item-label">Single & Bulk Tabs</span>
              <Button
                variant="primary"
                onClick={() => setIsCombinedModalOpen(true)}
              >
                단어 추가 모달 열기
              </Button>
            </div>

            {/* 통합 탭 모달 */}
            <WordAddTabsForm
              isOpen={isCombinedModalOpen}
              onClose={() => setIsCombinedModalOpen(false)}
            />
          </div>
        </section>

        {/* 10. Cards Section */}
        <section className="component-section">
          <h3 className="section-title">10. Content Cards</h3>
          <div className="component-display">
            <div className="component-item">
              <span className="item-label">Hero & Banner Cards</span>
              <div className="btn-group">
                <HeroCard
                  title="오늘의 학습 시작"
                  subTitle="아직 학습하지 않은 단어 12개가 있어요"
                  badge="DAILY"
                />
                <HeroCard
                  variant="banner"
                  title="스페인어 기초 정복하기"
                  subTitle="진행률 45%"
                />
              </div>
            </div>

            <div className="component-item">
              <span className="item-label">Deck Cards</span>
              <div className="cards-grid-layout">
                <DeckCard
                  title="스페인어 기초"
                  wordCount={24}
                  progress={30}
                  icon="🇪🇸"
                />
                <AddDeckCard
                  label="새 단어장"
                  onClick={() => setIsCombinedModalOpen(true)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* 11. Word List Cards Section */}
        <section className="component-section">
          <h3 className="section-title">11. Word Cards (List Item)</h3>
          <div className="component-display">
            <div className="component-item">
              <span className="item-label">Default States</span>
              <WordCard
                item={{
                  id: 1,
                  word: "Butterfly",
                  meaning: "나비",
                  isFavorite: false,
                }}
                onPlay={(w) => alert(`Playing: ${w}`)}
              />
              <WordCard
                item={{
                  id: 2,
                  word: "Serendipity",
                  meaning: "뜻밖의 행운",
                  isFavorite: true,
                }}
                status="mastered"
              />
            </div>

            <div className="component-item">
              <span className="item-label">Masking Mode (hideMode="word")</span>
              <WordCard
                item={{ id: 3, word: "Hidden", meaning: "가려진 단어" }}
                hideMode="word"
              />
            </div>

            <div className="component-item">
              <span className="item-label">Empty Guide State</span>
              <WordCard item={{ isGuide: true }} />
            </div>
          </div>
        </section>

        {/* 12. Word List Header Section */}
        <section className="component-section">
          <h3 className="section-title">13. Interactive Scenario Bubbles</h3>
          <div className="component-display">
            <div className="component-item">
              <span className="item-label">Slot Selection & Masking</span>
              <div
                className="v-chat-preview"
                style={{
                  backgroundColor: "var(--bg)",
                  padding: "20px",
                  borderRadius: "16px",
                }}
              >
                <ChatBubble
                  step={{
                    role: "other",
                    text: "Would you like to drink some {drink}?",
                    translation: "{drink} 좀 마시겠어요?",
                  }}
                  selections={{ drink: { word: "coffee", meaning: "커피" } }}
                  allSteps={[
                    {
                      text: "{drink}",
                      options: [
                        { word: "coffee", meaning: "커피" },
                        { word: "tea", meaning: "차" },
                      ],
                    },
                  ]}
                  onOpenSelector={(name, opts) => alert(`${name} 선택창 열림`)}
                  onPlayAudio={(txt) => console.log("TTS:", txt)}
                  showMeaning={false} // 뜻 가리기 테스트
                />

                <ChatBubble
                  step={{
                    role: "me",
                    text: "Yes, I'd like a cup of {drink}, please.",
                    translation: "네, {drink} 한 잔 주세요.",
                  }}
                  selections={{ drink: { word: "coffee", meaning: "커피" } }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* 14. Selector Modal Section */}
        <section className="component-section">
          <h3 className="section-title">14. Interactive Selector</h3>
          <div className="component-display">
            <div className="component-item">
              <span className="item-label">
                Try clicking the underlined word
              </span>
              <ChatBubble
                step={{
                  role: "other",
                  text: "Would you like to drink some {drink}?",
                  translation: "{drink} 좀 마시겠어요?",
                }}
                selections={selections}
                allSteps={[
                  {
                    text: "{drink}",
                    options: [
                      { word: "coffee", meaning: "커피" },
                      { word: "tea", meaning: "차" },
                      { word: "juice", meaning: "주스" },
                    ],
                  },
                ]}
                onOpenSelector={handleOpenSelector}
              />
            </div>

            {/* 선택 모달 */}
            <SelectorModal
              isOpen={isSelectorOpen}
              onClose={() => setIsSelectorOpen(false)}
              options={currentOptions}
              selectedValue={selections[activeSlot]}
              onSelect={handleSelect}
              title="무엇을 마실까요?"
            />
          </div>
        </section>

        {/* 15. Scenario Selection Section */}
        <section className="component-section">
          <h3 className="section-title">15. Scenario Selection Cards</h3>
          <div className="component-display">
            <div className="component-item">
              <span className="item-label">Scenario List Item</span>
              <div className="cards-grid-layout">
                <ScenarioCard
                  title="커피 주문하기"
                  description="카페에서 점원과 대화하며 메뉴를 고르고 결제해보세요."
                  level="초급"
                  tags={["카페", "주문", "결제"]}
                  icon="☕"
                  onClick={() => console.log("시작!")}
                />
              </div>
            </div>
          </div>
        </section>

        {/* 16. Flashcard Section */}
        <section className="component-section">
          <h3 className="section-title">16. Interactive Flashcard</h3>
          <div className="component-display">
            <div className="component-item">
              <span className="item-label">Swipe & Flip Test</span>
              <StudyCard
                cardData={{
                  word: "Serendipity",
                  pronunciation: "ˌserənˈdipədē",
                  emoji: "✨",
                  meaning: "뜻밖의 행운",
                  partOfSpeech: "Noun",
                  exampleEn: "It was a serendipity that I met her.",
                  exampleKo: "그녀를 만난 것은 뜻밖의 행운이었다.",
                }}
                onSwipe={(dir) => console.log(`Swiped ${dir}`)}
              />
            </div>
          </div>
        </section>

        {/* 17. Study Session Section */}
        <section className="component-section">
          <h3 className="section-title">17. Study Session</h3>
          <div className="component-display">
            <div className="component-item">
              <span className="item-label">Study Session Test</span>
              <StudySession />
            </div>
          </div>
        </section>

        {/* 신규 컴포넌트를 추가할 때 아래 구조를 복사해서 쓰세요 */}
        {/* <section className="component-section">
          <h3 className="section-title">N. 컴포넌트 이름</h3>
          <div className="component-display">
            <div className="component-item">
              <span className="item-label">상세 옵션명</span>
              // 컴포넌트 위치
            </div>
          </div>
        </section> 
        */}
      </main>
    </div>
  );
};

export default DesignGuide;
