// src/pages/admin/DesignGuide.jsx
import React from "react";
import Button from "@/components/common/Button/Button";
import Badge from "@/components/common/Badge/Badge";
import styles from "./DesignGuide.module.css";

const DesignGuide = () => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>🎨 Design System Guide</h1>
        <p>프로젝트 공통 컴포넌트 및 테마 변수 확인 페이지</p>
      </header>

      {/* 1. Buttons 섹션 */}
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

      {/* 2. Badges 섹션 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Badges Showcase</h2>
        <div className={styles.grid}>
          {/* 난이도 배지 (글자만) */}
          <div className={styles.item}>
            <h3>Level Badges (Text Only)</h3>
            <div className={styles.flex}>
              <Badge type="primary">초급</Badge>
              <Badge type="primary">중급</Badge>
              <Badge type="outline">고급</Badge>
            </div>
          </div>

          {/* 해시태그 배지 (자동 # 추가) */}
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
                왕초보
              </Badge>
              <Badge type="tag" emoji="✈️">
                해외여행
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Color Palette 섹션 (variables.css 확인용) */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Theme Colors</h2>
        <div className={styles.colorGrid}>
          <div
            className={styles.colorBox}
            style={{ background: "var(--primary)" }}
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
            style={{ background: "var(--text-main)", color: "#fff" }}
          >
            --text-main
          </div>
        </div>
      </section>
    </div>
  );
};

export default DesignGuide;
