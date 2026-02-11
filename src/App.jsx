import React, { useState } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import Dashboard from "@/pages/Dashboard";
import WordList from "@/pages/WordList";
import StudySession from "@/pages/StudySession";
import { useWords } from "@/hooks/useWords";

function AppContent() {
  const navigate = useNavigate();
  const [studyWords, setStudyWords] = useState([]);
  const wordHooks = useWords();

  const handleStartStudy = (filteredList, deckName) => {
    if (filteredList.length === 0) return alert("학습할 단어가 없습니다!");
    setStudyWords(filteredList);
    navigate(`/study/${encodeURIComponent(deckName)}`);
  };

  if (wordHooks.loading)
    return <div className="loading-screen">데이터 로딩 중...</div>;

  return (
    <MainLayout>
      <Routes>
        <Route
          path="/"
          element={
            <Dashboard
              {...wordHooks}
              onSelectDeck={(name) =>
                navigate(`/list/${encodeURIComponent(name)}`)
              }
            />
          }
        />

        <Route
          path="/list/:deckName"
          element={
            <WordList
              {...wordHooks}
              onBack={() => navigate("/")}
              onStartStudy={handleStartStudy}
            />
          }
        />

        <Route
          path="/study/:deckName"
          element={
            <StudySession
              words={studyWords}
              decks={wordHooks.decks}
              onFinish={(name) => navigate(`/list/${encodeURIComponent(name)}`)}
              onUpdateStatus={wordHooks.updateWordStatus}
            />
          }
        />
      </Routes>
    </MainLayout>
  );
}

const App = () => (
  <Router>
    <AppContent />
  </Router>
);
export default App;
