// src/pages/admin/Languages/AdminLanguage.jsx

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useContentStore } from "@/store/useContentStore";
import { toast } from "react-hot-toast";
import styles from "./AdminLanguage.module.css";

const AdminLanguage = () => {
  const { languages, fetchLanguages, upsertLanguage, deleteLanguage } =
    useContentStore();

  // 상태 관리
  const [bulkMode, setBulkMode] = useState("list");
  const [editingId, setEditingId] = useState(null);
  const [newLang, setNewLang] = useState({
    id: null,
    code: "",
    name: "",
    emoji: "",
  });
  const [editFormData, setEditFormData] = useState({
    code: "",
    name: "",
    emoji: "",
  });

  useEffect(() => {
    fetchLanguages();
    setEditingId(null);
  }, [bulkMode]);

  // 핸들러 함수들 (기존 Test.jsx 로직 그대로 활용)
  const handleSave = async () => {
    if (!newLang.code.trim() || !newLang.name.trim())
      return toast.error("필수 입력!");
    await upsertLanguage(newLang);
    setNewLang({ id: null, code: "", name: "", emoji: "" });
    toast.success("저장 완료!");
  };

  const startEdit = (lang) => {
    setEditingId(lang.id);
    setEditFormData({
      code: lang.code,
      name: lang.name,
      emoji: lang.emoji || "",
    });
  };

  return (
    <AdminLayout title="🌐 언어 마스터 관리">
      {/* 1. 등록 폼 영역 (상단) */}
      <section className="admin-card">
        <h3 className={styles.sectionTitle}>새 언어 등록</h3>
        <div className={styles.formGrid}>
          <input
            placeholder="코드"
            value={newLang.code}
            onChange={(e) => setNewLang({ ...newLang, code: e.target.value })}
          />
          <input
            placeholder="이름"
            value={newLang.name}
            onChange={(e) => setNewLang({ ...newLang, name: e.target.value })}
          />
          <input
            placeholder="이모지"
            value={newLang.emoji}
            onChange={(e) => setNewLang({ ...newLang, emoji: e.target.value })}
          />
          <button className={styles.saveBtn} onClick={handleSave}>
            저장
          </button>
        </div>
      </section>

      {/* 2. 관리 영역 (하단) */}
      <section className="admin-card">
        <div className={styles.tabGroup}>
          <button
            className={bulkMode === "list" ? styles.activeTab : ""}
            onClick={() => setBulkMode("list")}
          >
            목록
          </button>
          <button
            className={bulkMode === "bulk" ? styles.activeTab : ""}
            onClick={() => setBulkMode("bulk")}
          >
            대량 작업
          </button>
        </div>

        <div className={styles.tabContent}>
          {bulkMode === "list" ? (
            <div className={styles.tableResponsive}>
              <table className={styles.adminTable}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>코드</th>
                    <th>언어명</th>
                    <th>이모지</th>
                    <th>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {languages?.map((lang) => (
                    <tr key={lang.id}>
                      {/* 인라인 수정 로직 삽입 */}
                      {/* ... (생략된 인라인 수정 코드) ... */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={styles.bulkBox}>
              <textarea placeholder="코드 | 이름 | 이모지" rows={10} />
              <button className={styles.saveBtn}>일괄 저장</button>
            </div>
          )}
        </div>
      </section>
    </AdminLayout>
  );
};

export default AdminLanguage;
