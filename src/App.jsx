import React, { useState, useEffect } from "react";
import WordList from "./components/WordList";
import StudySession from "./components/StudySession";
import { Settings } from "lucide-react";
import "./index.css";

function App() {
  const [theme, setTheme] = useState("modern");
  const [mode, setMode] = useState("list");

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
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
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
              cursor: "pointer",
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

      {/* 화면 전환 로직 */}
      {mode === "list" ? (
        <WordList onStartStudy={() => setMode("study")} />
      ) : (
        <StudySession onFinish={() => setMode("list")} />
      )}
    </div>
  );
}

export default App;
