import React, { useState, useMemo } from "react";
import { HiMagnifyingGlass, HiXMark, HiCheck } from "react-icons/hi2";
import Button from "@/components/common/Button";

const ItemSearchModal = ({ isOpen, onClose, onSelect, items = [] }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = useMemo(() => {
    if (!searchTerm) return items.slice(0, 20); // 초기엔 20개만
    return items
      .filter((item) =>
        JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase()),
      )
      .slice(0, 50);
  }, [items, searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="admin-modal-overlay">
      <div
        className="admin-modal-content"
        style={{ width: "500px", maxHeight: "80vh" }}
      >
        <div className="admin-modal-header">
          <h3>연결할 아이템 검색</h3>
          <button onClick={onClose}>
            <HiXMark size={24} />
          </button>
        </div>

        <div className="search-bar" style={{ margin: "16px 0" }}>
          <HiMagnifyingGlass className="search-icon" />
          <input
            placeholder="단어 또는 문장 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </div>

        <div
          className="item-selection-list"
          style={{ overflowY: "auto", maxHeight: "400px" }}
        >
          {filtered.map((item) => {
            const content =
              item.item_translations?.[0]?.content || "No Content";
            return (
              <div
                key={item.id}
                className="selection-item-row"
                onClick={() => {
                  onSelect(item.id);
                  onClose();
                }}
              >
                <div>
                  <div style={{ fontWeight: "bold" }}>{content}</div>
                  <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>
                    {item.item_type} | ID: {item.id.slice(0, 8)}
                  </div>
                </div>
                <HiPlus color="#2563eb" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ItemSearchModal;
