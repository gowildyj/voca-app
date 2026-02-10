import React, { useState, useEffect } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  useNavigate,
  Navigate,
} from "react-router-dom";
import Dashboard from "./components/Dashboard";
import WordList from "./components/WordList";
import StudySession from "./components/StudySession";
import AddWordModal from "./components/AddWordModal";
import { useWords } from "./hooks/useWords";
import { Settings, Plus } from "lucide-react";
import { motion } from "framer-motion";
import "./styles/index.css";

function AppContent() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("app-theme") || "system";
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [studyWords, setStudyWords] = useState([]);
  const [modalMode, setModalMode] = useState("word");

  // ✅ useWords에서 decks와 addDeck을 추가로 가져옵니다.
  const {
    words,
    decks, // 추가
    addDeck, // 추가
    addWord,
    deleteWord,
    updateWordStatus,
    deleteDeck,
    renameDeck,
    addWordsBulk,
    loading,
  } = useWords();

  // 테마 적용 로직
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const applySystemTheme = () => {
        root.removeAttribute("data-theme");
      };
      applySystemTheme();
      mediaQuery.addEventListener("change", applySystemTheme);
      return () => mediaQuery.removeEventListener("change", applySystemTheme);
    } else {
      root.setAttribute("data-theme", theme);
    }
    localStorage.setItem("app-theme", theme);
  }, [theme]);

  // 모달 열기 핸들러
  const handleOpenWordModal = () => {
    setModalMode("word");
    setIsModalOpen(true);
  };

  const handleOpenDeckModal = () => {
    setModalMode("deck");
    setIsModalOpen(true);
  };

  const handleStartStudy = (filteredList) => {
    if (filteredList.length === 0) {
      alert("학습할 단어가 없습니다!");
      return;
    }
    setStudyWords(filteredList);
    navigate("/study");
  };

  const handleSelectDeck = (deckName) => {
    // TTS 엔진 활성화 (크롬 대응)
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const initialUtter = new SpeechSynthesisUtterance(" ");
      initialUtter.volume = 0;
      window.speechSynthesis.speak(initialUtter);
    }
    setSelectedDeck(deckName);
    navigate("/list");
  };

  const currentDeckInfo = decks.find((d) => d.name === selectedDeck);

  console.log("현재 선택된 덱 정보:", currentDeckInfo);

  if (loading)
    return <div className="loading-screen">데이터를 불러오는 중...</div>;

  return (
    <div className="App">
      <nav style={navStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Settings size={18} opacity={0.5} />
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            style={selectStyle}
          >
            <option value="system">자동 (시스템 설정)</option>
            <option value="dark">다크 모드 🌙</option>
            <option value="modern">Modern (Light)</option>
            <option value="bw">B&W</option>
            <option value="pastel">Pastel</option>
            <option value="pink">Pink</option>
            <option value="blue">Blue</option>
          </select>
        </div>
      </nav>

      <Routes>
        <Route
          path="/"
          element={
            <Dashboard
              decks={decks} // ✅ 이제 words가 아닌 decks 테이블 데이터를 넘깁니다.
              words={words} // 통계 계산을 위해 words도 함께 넘깁니다.
              onSelectDeck={handleSelectDeck}
              onAddDeck={handleOpenDeckModal}
              onDeleteDeck={deleteDeck}
              onRenameDeck={renameDeck}
            />
          }
        />

        <Route
          path="/list"
          element={
            selectedDeck ? (
              <>
                <WordList
                  words={words} // 내부에서 filter 하므로 전체 전달
                  deckName={selectedDeck} // ✅ 덱 이름을 명시적으로 전달
                  langCode={currentDeckInfo?.lang_code}
                  onBack={() => navigate("/")}
                  onStartStudy={handleStartStudy}
                  onDeleteWord={deleteWord}
                />
                <motion.button
                  onClick={handleOpenWordModal}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="floating-plus-btn"
                  style={floatingBtnStyle}
                >
                  <Plus size={32} strokeWidth={2.5} />
                </motion.button>
              </>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/study"
          element={
            <StudySession
              words={studyWords}
              langCode={currentDeckInfo?.lang_code}
              onFinish={() => navigate("/list")}
              onUpdateStatus={updateWordStatus}
            />
          }
        />
      </Routes>

      <AddWordModal
        isOpen={isModalOpen}
        mode={modalMode}
        onClose={() => setIsModalOpen(false)}
        onAdd={addWord}
        onAddBulk={addWordsBulk}
        onAddDeck={addDeck} // ✅ 덱 추가 함수 전달
        defaultDeck={selectedDeck}
      />
    </div>
  );
}

// 스타일 가이드
const navStyle = {
  display: "flex",
  justifyContent: "flex-end",
  padding: "20px 0",
  gap: "10px",
};
const selectStyle = {
  border: "none",
  background: "transparent",
  fontSize: "0.85rem",
  fontWeight: "600",
  color: "var(--text)",
  outline: "none",
};
const floatingBtnStyle = {
  position: "fixed",
  bottom: "40px",
  right: "30px",
  width: "65px",
  height: "65px",
  borderRadius: "22px",
  background: "linear-gradient(135deg, var(--primary), #a29bfe)",
  color: "white",
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 10px 25px -5px rgba(108, 92, 231, 0.4)",
  zIndex: 100,
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
