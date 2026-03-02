import React, { useState, useMemo } from "react";
import { HiMagnifyingGlass, HiXMark, HiPlus, HiKey } from "react-icons/hi2";
import Button from "@/components/common/Button"; // (필요 없다면 제거 가능)

const ItemSearchModal = ({ isOpen, onClose, onSelect, items = [] }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = useMemo(() => {
    if (!searchTerm) return items.slice(0, 20);
    const lowerTerm = searchTerm.toLowerCase();

    return items
      .filter((item) => {
        if (item.uq_key?.toLowerCase().includes(lowerTerm)) return true;
        const hasTranslation = item.item_translations?.some((t) =>
          t.content?.toLowerCase().includes(lowerTerm),
        );
        return hasTranslation;
      })
      .slice(0, 50);
  }, [items, searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">🔗 아이템 연결</h3>
          <button className="admin-modal-close-btn" onClick={onClose}>
            <HiXMark size={24} color="#64748b" />
          </button>
        </div>

        {/* 검색창 */}
        <div className="search-bar item-search-bar">
          <HiMagnifyingGlass className="search-icon" />
          <input
            placeholder="단어(사과) 또는 문장(Apple) 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
            className="admin-inline-input"
            style={{ width: "100%" }}
          />
        </div>

        {/* 리스트 영역 */}
        <div className="item-selection-list">
          {filtered.length === 0 ? (
            <div className="empty-result">
              <div className="empty-icon">🔍</div>
              검색 결과가 없습니다.
            </div>
          ) : (
            filtered.map((item) => {
              // 데이터 추출
              const koContent = item.item_translations?.find(
                (t) => t.lang_code === "ko-KR",
              )?.content;
              const enContent = item.item_translations?.find(
                (t) => t.lang_code === "en-US",
              )?.content;
              const mainTitle =
                koContent ||
                item.item_translations?.[0]?.content ||
                "내용 없음";
              const subTitle =
                enContent && enContent !== mainTitle ? enContent : null;

              return (
                <div
                  key={item.id}
                  className="selection-item-row"
                  onClick={() => {
                    onSelect(item.id);
                    onClose();
                  }}
                >
                  {/* 왼쪽: 콘텐츠 정보 */}
                  <div className="item-info">
                    <div className="item-title-row">
                      <span className="item-main-text">{mainTitle}</span> /
                      {subTitle && (
                        <span className="item-main-text">{subTitle}</span>
                      )}
                    </div>

                    <div className="item-meta-row">
                      <span
                        className={`badge ${item.item_type}`}
                        style={{ fontSize: "0.7rem", padding: "2px 6px" }}
                      >
                        {item.item_type}
                      </span>
                      <span className="item-id-tag">
                        <HiKey size={12} />
                        {item.id}
                      </span>
                    </div>
                  </div>

                  {/* 오른쪽: 추가 버튼 */}
                  <div className="item-add-btn">
                    <HiPlus size={20} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemSearchModal;
