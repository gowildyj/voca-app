import React, { useState, useEffect } from "react";
import WordList from "./components/WordList";
import StudySession from "./components/StudySession";
import AddWordModal from "./components/AddWordModal"; // 1. 모달 임포트
import { useWords } from "./hooks/useWords"; // 2. 커스텀 훅 임포트
import { Settings, Plus } from "lucide-react"; // Plus 아이콘 추가
import "./styles/index.css";

function App() {
  const [theme, setTheme] = useState("modern");
  const [mode, setMode] = useState("list");
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태 추가

  const [studyWords, setStudyWords] = useState([]);

  // 3. 훅에서 데이터와 추가 함수 가져오기
  const { words, addWord, deleteWord, updateWordStatus } = useWords();

  const handleStartStudy = (filteredList) => {
    if (filteredList.length === 0) {
      alert("학습할 단어가 없습니다!");
      return;
    }
    setStudyWords(filteredList); // 필터링된 단어들만 저장
    setMode("study"); // 학습 모드로 전환
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div className="App">
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

      {/* 4. 화면 전환 로직 - words 데이터를 자식들에게 넘겨줌 */}
      {mode === "list" ? (
        <>
          <WordList
            words={words}
            onStartStudy={handleStartStudy}
            onDeleteWord={deleteWord}
          />
          {/* 단어 추가 플로팅 버튼 */}
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              position: "fixed",
              bottom: "30px",
              right: "30px",
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              backgroundColor: "var(--primary)",
              color: "white",
              border: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Plus size={30} />
          </button>
        </>
      ) : (
        <StudySession
          words={studyWords}
          onFinish={() => setMode("list")}
          onUpdateStatus={updateWordStatus}
        />
      )}

      {/* 5. 단어 추가 모달 연결 */}
      <AddWordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={addWord}
      />
    </div>
  );
}

export default App;
