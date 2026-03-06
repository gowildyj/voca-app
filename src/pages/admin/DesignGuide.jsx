import React, { useState } from "react"; // 1. useState 임포트 확인
import Button from "@/components/common/Button/Button";
import Badge from "@/components/common/Badge/Badge";
import SearchBar from "@/components/common/SearchBar/SearchBar"; // 2. 중괄호 제거 (Default Export)
import styles from "./DesignGuide.module.css";

const DesignGuide = () => {
  // 🌟 3. useState는 반드시 컴포넌트 '내부'에 있어야 합니다.
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>🎨 Design System Guide</h1>
        <p>프로젝트 공통 컴포넌트 및 테마 변수 확인 페이지</p>
      </header>

      {/* Buttons 섹션 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Buttons</h2>
        <div className={styles.grid}>
          <div className={styles.item}>
            <h3>Variants</h3>
            <div className={styles.flex}>
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
            </div>
          </div>
          <div className={styles.item}>
            <h3>Sizes</h3>
            <div className={styles.flex}>
              <Button size="sm">Small</Button>
              <Button size="base">Base</Button>
              <Button size="lg">Large</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Badges 섹션 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Badges Showcase</h2>
        <div className={styles.grid}>
          {/* 난이도 배지 */}
          <div className={styles.item}>
            <h3>Level Badges (Text Only)</h3>
            <div className={styles.flex}>
              <Badge type="primary">초급</Badge>
              <Badge type="primary">중급</Badge>
              <Badge type="outline">고급</Badge>
            </div>
          </div>

          {/* 해시태그 배지 */}
          <div className={styles.item}>
            <h3>Tag Badges (Auto-Hash)</h3>
            <div className={styles.flex}>
              <Badge type="tag">여행</Badge>
              <Badge type="tag">음식</Badge>
              <Badge type="tag">비즈니스</Badge>
            </div>
          </div>

          {/* 이모지 혼합형 */}
          <div className={styles.item}>
            <h3>With Emojis</h3>
            <div className={styles.flex}>
              <Badge type="primary" emoji="🌱">
                초급
              </Badge>
              <Badge type="tag" emoji="✈️">
                여행
              </Badge>
              <Badge type="outline" emoji="✅">
                완료
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* SearchBar 섹션 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Forms & Inputs</h2>
        <div className={styles.grid}>
          <div className={styles.item}>
            <h3>SearchBar</h3>
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="언어 또는 태그 검색..."
            />
            <p
              style={{
                marginTop: "12px",
                fontSize: "0.85rem",
                color: "var(--text-sub)",
                background: "var(--bg-layer)",
                padding: "8px",
                borderRadius: "6px",
              }}
            >
              🔍 실시간 입력값: <strong>{searchTerm || "(내용 없음)"}</strong>
            </p>
          </div>
        </div>
      </section>

      {/* Color Palette 섹션 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Theme Colors</h2>
        <div className={styles.colorGrid}>
          <div
            className={styles.colorBox}
            style={{ background: "var(--primary)", color: "white" }}
          >
            --primary
          </div>
          <div
            className={styles.colorBox}
            style={{ background: "var(--bg-layer)" }}
          >
            --bg-layer
          </div>
          <div
            className={styles.colorBox}
            style={{ background: "var(--border)" }}
          >
            --border
          </div>
          <div
            className={styles.colorBox}
            style={{ background: "var(--text-main)", color: "var(--bg)" }}
          >
            --text-main
          </div>
        </div>
      </section>
    </div>
  );
};

export default DesignGuide;
