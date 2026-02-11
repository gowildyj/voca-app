import React, { useState, useEffect } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  useNavigate,
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
  const [theme, setTheme] = useState(
    () => localStorage.getItem("app-theme") || "system",
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studyWords, setStudyWords] = useState([]);
  const [modalMode, setModalMode] = useState("word");

  const {
    words,
    decks,
    addDeck,
    addWord,
    deleteWord,
    updateWord,
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
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", theme);
    }
    localStorage.setItem("app-theme", theme);
  }, [theme]);

  const handleSelectDeck = (deckName) => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    navigate(`/list/${encodeURIComponent(deckName)}`);
  };

  const handleOpenWordModal = () => {
    setModalMode("word");
    setIsModalOpen(true);
  };
  const handleOpenDeckModal = () => {
    setModalMode("deck");
    setIsModalOpen(true);
  };

  const handleStartStudy = (filteredList, deckName) => {
    if (filteredList.length === 0) {
      alert("학습할 단어가 없습니다!");
      return;
    }
    setStudyWords(filteredList);
    navigate(`/study/${encodeURIComponent(deckName)}`);
  };

  if (loading)
    return <div className="loading-screen">데이터를 불러오는 중...</div>;

  return (
    <div className="App">
      <nav className="app-nav">
        <div className="flex-center" style={{ gap: "8px" }}>
          <Settings size={18} opacity={0.5} />
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="theme-select"
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
              decks={decks}
              words={words}
              onSelectDeck={handleSelectDeck}
              onAddDeck={handleOpenDeckModal}
              onDeleteDeck={deleteDeck}
              onRenameDeck={renameDeck}
            />
          }
        />

        <Route
          path="/list/:deckName"
          element={
            <>
              <WordList
                words={words}
                decks={decks}
                onUpdateWord={updateWord}
                onBack={() => navigate("/")}
                onStartStudy={handleStartStudy}
                onDeleteWord={deleteWord}
              />
              <motion.button
                onClick={handleOpenWordModal}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="floating-plus-btn"
              >
                <Plus size={32} strokeWidth={2.5} />
              </motion.button>
            </>
          }
        />

        <Route
          path="/study/:deckName"
          element={
            <StudySession
              words={studyWords}
              decks={decks}
              onFinish={(name) => navigate(`/list/${encodeURIComponent(name)}`)}
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
        onAddDeck={addDeck}
      />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
