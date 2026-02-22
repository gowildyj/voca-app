import React from "react";
import { CheckSquare, Keyboard, Puzzle, Languages } from "lucide-react";
import "@/styles/components/ui/word/gameModeBar.css";

const GAMES = [
  {
    id: "choice-word",
    label: "단어 고르기",
    icon: Languages,
    color: "#8b5cf6", // 보라색
  },
  {
    id: "choice-meaning",
    label: "뜻 고르기",
    icon: CheckSquare,
    color: "#10b981", // 초록색
  },
  {
    id: "spelling",
    label: "스펠링 적기",
    icon: Keyboard,
    color: "#f59e0b", // 주황색
  },
  {
    id: "match",
    label: "짝맞추기",
    icon: Puzzle,
    color: "#3b82f6", // 파란색
  },
];

const GameModeBar = ({ onSelectGame }) => {
  return (
    <div className="game-mode-container">
      <h4 className="game-section-title">미니 게임</h4>
      <div className="game-scroll-area">
        {GAMES.map((game) => (
          <button
            key={game.id}
            className="game-card clickable-bounce"
            onClick={() => onSelectGame(game.id)}
          >
            <div
              className="game-icon-box"
              style={{ backgroundColor: `${game.color}15`, color: game.color }}
            >
              <game.icon size={22} strokeWidth={2.5} />
            </div>
            <span className="game-label">{game.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default GameModeBar;
