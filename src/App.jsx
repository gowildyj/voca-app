import React, { useState, useEffect } from "react";
// 1. react-router-dom 관련 컴포넌트 임포트
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

// 라우팅 기능을 사용하기 위해 별도의 컴포넌트로 분리
function AppContent() {
  const navigate = useNavigate(); // 페이지 이동을 위한 훅
  const [theme, setTheme] = useState("modern");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [studyWords, setStudyWords] = useState([]);

  const {
    words,
    addWord,
    deleteWord,
    updateWordStatus,
    deleteDeck,
    renameDeck,
  } = useWords();

  // 학습 시작 시 동작
  const handleStartStudy = (filteredList) => {
    if (filteredList.length === 0) {
      alert("학습할 단어가 없습니다!");
      return;
    }
    setStudyWords(filteredList);
    navigate("/study"); // URL 이동
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div className="App">
      {/* 상단 네비게이션 (공통) */}
      <nav
        style={{
          display: "flex",
          justifyContent: "flex-end",
          padding: "20px 0",
          gap: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Settings size={18} opacity={0.5} />
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            style={{
              border: "none",
              background: "transparent",
              fontSize: "0.85rem",
              fontWeight: "600",
              color: "var(--text)",
              outline: "none",
            }}
          >
            <option value="modern">Modern</option>
            <option value="bw">B&W</option>
            <option value="pastel">Pastel</option>
            <option value="pink">Pink</option>
            <option value="blue">Blue</option>
          </select>
        </div>
      </nav>

      {/* 2. 라우트 경로 설정 */}
      <Routes>
        {/* 메인 대시보드 */}
        <Route
          path="/"
          element={
            <Dashboard
              words={words}
              onSelectDeck={(deckName) => {
                setSelectedDeck(deckName);
                navigate("/list"); // 리스트 페이지로 이동
              }}
              onAddDeck={() => {
                setSelectedDeck(null);
                setIsModalOpen(true);
              }}
              onDeleteDeck={deleteDeck}
              onRenameDeck={renameDeck}
            />
          }
        />

        {/* 단어 리스트 페이지 */}
        <Route
          path="/list"
          element={
            selectedDeck ? (
              <>
                <WordList
                  words={words.filter((w) => w.deck === selectedDeck)}
                  onBack={() => navigate("/")} // 대시보드로 이동
                  onStartStudy={handleStartStudy}
                  onDeleteWord={deleteWord}
                />
                <motion.button
                  onClick={() => setIsModalOpen(true)}
                  whileHover={{ scale: 1.1 }} // 마우스 올리면 커지고
                  whileTap={{ scale: 0.9 }} // 누를 때 쫀득하게 작아짐
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  style={{
                    position: "fixed",
                    bottom: "40px",
                    right: "30px",
                    width: "65px",
                    height: "65px",
                    borderRadius: "22px", // 완전 원형보다 살짝 각진 '스쿼클' 형태가 요즘 트렌드!
                    background:
                      "linear-gradient(135deg, var(--primary), #a29bfe)", // 은은한 그라데이션
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 10px 25px -5px rgba(108, 92, 231, 0.4)", // 깊이감 있는 그림자
                    zIndex: 100,
                  }}
                >
                  <Plus size={32} strokeWidth={2.5} />
                </motion.button>
              </>
            ) : (
              <Navigate to="/" replace /> // 선택된 덱이 없으면 대시보드로 튕겨냄
            )
          }
        />

        {/* 학습 페이지 */}
        <Route
          path="/study"
          element={
            <StudySession
              words={studyWords}
              onFinish={() => navigate("/list")} // 학습 종료 시 리스트로 이동
              onUpdateStatus={updateWordStatus}
            />
          }
        />
      </Routes>

      {/* 단어 추가 모달 (공통) */}
      <AddWordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={addWord}
        defaultDeck={selectedDeck}
      />
    </div>
  );
}

// 최종 App 컴포넌트: Router로 감싸줘야 함
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
