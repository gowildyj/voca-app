import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "@/styles/pages/scenarioList.css";

// 디자인 가이드 기반 컴포넌트 임포트
import FilterBar from "@/components/common/FilterBar";
import SearchBar from "@/components/common/SearchBar";
import ScenarioCard from "@/components/cards/ScenarioCard";
import { ROUTES, generatePath } from "@/routes/AppRoutes";

const ScenarioList = () => {
  const navigate = useNavigate();

  // 상태 관리
  const [activeTab, setActiveTab] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");

  // 샘플 데이터
  const scenarios = [
    {
      id: 1,
      title: "커피 주문하기",
      description: "카페에서 점원과 대화하며 메뉴를 고르고 결제해보세요.",
      level: "초급",
      tags: ["카페", "주문", "결제"],
      icon: "☕",
      category: "식당 🍽️",
    },
    {
      id: 2,
      title: "공항 체크인",
      description: "항공사 카운터에서 수하물을 부치고 탑승권을 받아보세요.",
      level: "중급",
      tags: ["여행", "공항", "체크인"],
      icon: "✈️",
      category: "여행 ✈️",
    },
    {
      id: 3,
      title: "비즈니스 미팅",
      description: "새로운 파트너와 인사를 나누고 회사 프로젝트를 소개합니다.",
      level: "고급",
      tags: ["비즈니스", "회의", "협상"],
      icon: "💼",
      category: "비즈니스 💼",
    },
    {
      id: 4,
      title: "길 묻기",
      description: "현지인에게 목적지까지 가는 법을 정중하게 물어보세요.",
      level: "초급",
      tags: ["일상", "길찾기", "방향"],
      icon: "📍",
      category: "일상 💬",
    },
  ];

  const categories = ["전체", "여행 ✈️", "식당 🍽️", "비즈니스 💼", "일상 💬"];

  // 필터링 로직
  const filteredScenarios = scenarios.filter((s) => {
    const matchesTab = activeTab === "전체" || s.category === activeTab;
    const matchesSearch =
      s.title.includes(searchQuery) || s.description.includes(searchQuery);
    return matchesTab && matchesSearch;
  });

  return (
    <div className="v-scenario-list-page">
      {/* 1. 상단 검색 및 필터 영역 */}
      <section className="v-list-header">
        <p className="v-welcome-msg">실제 상황처럼 대화하며 배워보세요! 💬</p>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="어떤 상황을 연습해 볼까요?"
        />
        <div className="v-filter-container">
          <FilterBar
            items={categories}
            activeItem={activeTab}
            onSelect={setActiveTab}
          />
        </div>
      </section>

      {/* 2. 시나리오 카드 리스트 */}
      <main className="v-scenario-grid-container">
        {filteredScenarios.length > 0 ? (
          <div className="v-scenario-grid">
            {filteredScenarios.map((item) => (
              <ScenarioCard
                key={item.id}
                title={item.title}
                description={item.description}
                level={item.level}
                tags={item.tags}
                icon={item.icon}
                onClick={() =>
                  navigate(
                    generatePath(ROUTES.SCENARIO_SESSION, { id: item.id }),
                  )
                }
              />
            ))}
          </div>
        ) : (
          <div className="v-empty-state">
            <p>찾으시는 시나리오가 아직 없네요. 😅</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ScenarioList;
