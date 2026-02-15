import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom"; // navigate 추가
import { Play, ArrowLeft, Plus, Edit3, Trash2 } from "lucide-react";
import WordItem from "@/components/wordlist/WordItem";
import EditWordModal from "@/components/common/modals/EditWordModal";
import AddWordModal from "@/components/common/modals/AddWordModal";
import SearchBar from "@/components/wordlist/SearchBar";
import FilterBar from "@/components/wordlist/FilterBar";
import { seededShuffle } from "@/utils/seedShuffle";
import UpdateDeckModal from "@/components/common/modals/UpdateDeckModal";

const WordList = ({
  decks = [],
  onStartStudy,
  updateWord,
  deleteWord,
  fetchWordsByDeck,
  onBack,
  addWord,
  addWordsBulk,
  updateDeck,
  onDeleteDeck,
}) => {
  const navigate = useNavigate();
  const { deckName: urlDeckParam } = useParams();

  // 1. 컨텍스트 추출 (Memoized)
  const currentDeckName = useMemo(
    () => decodeURIComponent(urlDeckParam || ""),
    [urlDeckParam],
  );
  const foundDeck = useMemo(
    () => decks?.find((d) => d.deck_name === currentDeckName),
    [decks, currentDeckName],
  );
  const currentDeckId = foundDeck?.id;
  const currentLangCode = foundDeck?.lang_code;

  // 2. 상태 관리
  const [filter, setFilter] = useState("all");
  const [sortType, setSortType] = useState("default");
  const [searchQuery, setSearchQuery] = useState("");
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [targetWord, setTargetWord] = useState(null);
  const [displayLimit, setDisplayLimit] = useState(10);
  const [localWords, setLocalWords] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);

  const observerTarget = useRef(null);

  // 3. 데이터 로딩 (Memory Leak 방지)
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      if (!currentDeckId || typeof fetchWordsByDeck !== "function") return;
      setListLoading(true);
      try {
        const data = await fetchWordsByDeck(currentDeckId);
        if (isMounted) setLocalWords(data || []);
      } finally {
        if (isMounted) setListLoading(false);
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, [currentDeckId, fetchWordsByDeck]);

  // 4. 필터링 및 정렬 (성능 핵심: useMemo)
  const filteredWords = useMemo(() => {
    const valid = localWords.filter((w) => w.word?.trim());

    let result = valid.filter((word) => {
      const matchesFilter =
        filter === "all"
          ? true
          : filter === "none"
            ? !word.status || word.status === "none"
            : word.status === filter;
      const matchesSearch =
        word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
        word.meaning.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });

    if (sortType === "alpha")
      result.sort((a, b) => a.word.localeCompare(b.word));
    else if (sortType === "shuffle")
      result = seededShuffle(result, shuffleSeed);

    return result;
  }, [localWords, filter, searchQuery, sortType, shuffleSeed]);

  // 필터 카운트 별도 계산 (성능 최적화)
  const filterCounts = useMemo(() => {
    const valid = localWords.filter((w) => w.word?.trim());
    return {
      all: valid.length,
      none: valid.filter((w) => !w.status || w.status === "none").length,
      unknown: valid.filter((w) => w.status === "unknown").length,
      know: valid.filter((w) => w.status === "know").length,
    };
  }, [localWords]);

  // 5. 무한 스크롤 (Observer 최적화)
  useEffect(() => {
    if (listLoading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && filteredWords.length > displayLimit) {
          setDisplayLimit((prev) => prev + 30);
        }
      },
      { threshold: 0.1 },
    );

    const target = observerTarget.current;
    if (target) observer.observe(target);
    return () => {
      if (target) observer.unobserve(target);
    };
  }, [filteredWords.length, displayLimit, listLoading]);

  // 6. 핸들러 메모이제이션
  const handleRefreshList = useCallback(async () => {
    if (currentDeckId) {
      const data = await fetchWordsByDeck(currentDeckId);
      setLocalWords(data || []);
    }
  }, [currentDeckId, fetchWordsByDeck]);

  const onUpdateAction = useCallback(
    async (action, ...args) => {
      const result = await action(...args);
      await handleRefreshList();
      return result;
    },
    [handleRefreshList],
  );

  // 진입 시 임시 세션 정리
  useEffect(() => {
    const keys = ["temp_study_words", "temp_study_index", "temp_study_deck_id"];
    keys.forEach((k) => localStorage.removeItem(k));
  }, []);

  return (
    <div className="word-list-page">
      <header className="list-header">
        <div className="header-left">
          <button onClick={onBack} className="back-btn">
            <ArrowLeft size={24} />
          </button>
          <h1 className="list-header-title">{currentDeckName}</h1>
        </div>
        <div className="header-right">
          <button
            onClick={() => setIsRenameOpen(true)}
            className="deck-action-btn"
          >
            <Edit3 size={18} />
          </button>
          <button
            onClick={() => {
              if (
                window.confirm(`"${currentDeckName}" 덱을 삭제하시겠습니까?`)
              ) {
                onDeleteDeck(currentDeckId, currentDeckName);
                navigate("/");
              }
            }}
            className="deck-action-btn"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </header>

      <SearchBar query={searchQuery} setQuery={setSearchQuery} />

      <div
        className="study-start-card"
        onClick={() =>
          filteredWords.length > 0 &&
          onStartStudy(filteredWords, currentDeckId, currentDeckName)
        }
        style={{
          opacity: filteredWords.length > 0 ? 1 : 0.5,
          cursor: filteredWords.length > 0 ? "pointer" : "default",
        }}
      >
        <div className="study-card-info">
          <h3>학습 시작</h3>
          <p>{filteredWords.length}개의 단어 준비됨</p>
        </div>
        <Play fill="white" size={24} />
      </div>

      <FilterBar
        currentFilter={filter}
        setFilter={setFilter}
        sortType={sortType}
        setSortType={setSortType}
        onShuffle={() => {
          setShuffleSeed(Math.random());
          setDisplayLimit(30);
        }}
        filterCounts={filterCounts}
      />

      <div
        className={`list-container ${listLoading ? "list-container--loading" : ""}`}
      >
        {listLoading ? (
          <div className="list-loading">
            <span>불러오는 중...</span>
          </div>
        ) : (
          <div className="word-items-wrapper">
            <AnimatePresence>
              {filteredWords.slice(0, displayLimit).map((item) => (
                <WordItem
                  key={item.id}
                  item={item}
                  langCode={currentLangCode}
                  onEdit={(word) => {
                    setTargetWord(word);
                    setIsEditOpen(true);
                  }}
                  onDelete={(id) => onUpdateAction(deleteWord, id)}
                />
              ))}
            </AnimatePresence>
            {filteredWords.length === 0 && (
              <EmptyGuide searchQuery={searchQuery} />
            )}
            <div ref={observerTarget} style={{ height: "20px" }} />
          </div>
        )}
      </div>

      <motion.button
        onClick={() => setIsAddModalOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="floating-plus-btn"
      >
        <Plus size={32} strokeWidth={2.5} />
      </motion.button>

      {/* Modals - Conditional Rendering for Performance */}
      {isAddModalOpen && (
        <AddWordModal
          isOpen={isAddModalOpen}
          mode="word"
          onClose={() => setIsAddModalOpen(false)}
          onAdd={(word) => onUpdateAction(addWord, word)}
          onAddBulk={(bulk) => onUpdateAction(addWordsBulk, bulk)}
          defaultDeckId={currentDeckId}
          defaultDeckName={currentDeckName}
        />
      )}

      {isEditOpen && (
        <EditWordModal
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setTargetWord(null);
          }}
          item={targetWord}
          onUpdate={(id, data) => onUpdateAction(updateWord, id, data)}
        />
      )}

      {isRenameOpen && (
        <UpdateDeckModal
          key={currentDeckId}
          isOpen={isRenameOpen}
          deckId={currentDeckId}
          oldName={currentDeckName}
          oldLangCode={currentLangCode}
          onClose={() => setIsRenameOpen(false)}
          onRename={updateDeck}
        />
      )}
    </div>
  );
};

const EmptyGuide = ({ searchQuery }) => (
  <div className="word-item-card guide-mode">
    <div className="word-item-content">
      <div className="word-text">
        {searchQuery
          ? `"${searchQuery}" 검색 결과가 없어요.`
          : "첫 단어를 추가해보세요."}
      </div>
      <div className="word-meaning">
        {searchQuery
          ? "단어를 추가해보세요! 🚀"
          : "우측 하단의 + 버튼 클릭! 🚀"}
      </div>
    </div>
  </div>
);

export default WordList;
