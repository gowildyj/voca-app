import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // 🌟 경로 이동을 위해 추가
import { useGlobalStore } from "@/store/useGlobalStore";
import LanguageSelectModal from "@/components/modals/LanguageSelectModal";
import Button from "@/components/common/Button";
import { HiLanguage, HiArrowPath, HiUserCircle } from "react-icons/hi2";

const UserHome = () => {
  const navigate = useNavigate();
  const {
    t,
    learningLang,
    nativeLang,
    languages,
    fetchLanguages,
    currentUser,
    loginWithCode,
    logout,
  } = useGlobalStore();

  const [modalType, setModalType] = useState(null);
  const [syncCodeInput, setSyncCodeInput] = useState(""); // 🌟 입력창 상태
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    fetchLanguages();
  }, []);

  const handleSync = async () => {
    if (!syncCodeInput.trim()) return;
    setIsSyncing(true);
    const success = await loginWithCode(syncCodeInput.trim());
    setIsSyncing(false);
    if (success) setSyncCodeInput("");
  };

  const getLangName = (code) =>
    languages.find((l) => l.code === code)?.name || code;
  const getLangEmoji = (code) =>
    languages.find((l) => l.code === code)?.emoji || "🌐";

  return (
    <div className="user-container">
      <header className="user-header">
        <h1>{t("welcome")}</h1>
        <p style={{ color: "#94a3b8", marginTop: "8px" }}>
          Stella Lingo - AI Language Tutor
        </p>
      </header>

      <div className="settings-section">
        {/* --- 🌟 1. 기기 연동 섹션 --- */}
        <div
          className="lang-select-card"
          style={{
            cursor: "default",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "12px",
          }}
        >
          <div
            className="lang-label"
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <HiArrowPath />{" "}
            {currentUser ? "연동된 계정 정보" : "기기 연동 코드로 시작하기"}
          </div>

          {currentUser ? (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
                alignItems: "center",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <HiUserCircle size={32} color="#2563eb" />
                <div>
                  <div className="lang-value">{currentUser.nickname}</div>
                  <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>
                    {currentUser.id.slice(0, 8)}...
                  </div>
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={logout}>
                해제
              </Button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: "8px", width: "100%" }}>
              <input
                className="admin-inline-input"
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.1)",
                  color: "white",
                  border: "none",
                }}
                placeholder="코드를 입력하세요"
                value={syncCodeInput}
                onChange={(e) => setSyncCodeInput(e.target.value)}
              />
              <Button size="sm" onClick={handleSync} loading={isSyncing}>
                연동
              </Button>
            </div>
          )}
        </div>

        {/* --- 2. 언어 설정 섹션 --- */}
        <div
          className="lang-select-card"
          onClick={() => setModalType("learning")}
        >
          <div className="lang-info">
            <span className="lang-emoji">{getLangEmoji(learningLang)}</span>
            <div>
              <div className="lang-label">{t("learning_lang")}</div>
              <div className="lang-value">{getLangName(learningLang)}</div>
            </div>
          </div>
          <HiLanguage size={20} color="#94a3b8" />
        </div>

        <div
          className="lang-select-card"
          onClick={() => setModalType("native")}
        >
          <div className="lang-info">
            <span className="lang-emoji">{getLangEmoji(nativeLang)}</span>
            <div>
              <div className="lang-label">{t("native_lang")}</div>
              <div className="lang-value">{getLangName(nativeLang)}</div>
            </div>
          </div>
          <HiLanguage size={20} color="#94a3b8" />
        </div>

        {/* --- 3. 학습 시작 버튼 (내 단어장으로 이동) --- */}
        <div style={{ marginTop: "20px" }}>
          <Button
            fullWidth
            size="lg"
            variant="primary"
            onClick={() => navigate("/decks")} // 🌟 /decks로 연결
          >
            {t("start_learning")}
          </Button>
        </div>
      </div>

      <LanguageSelectModal
        type={modalType}
        isOpen={!!modalType}
        onClose={() => setModalType(null)}
      />
    </div>
  );
};

export default UserHome;
