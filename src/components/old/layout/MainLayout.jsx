import React from "react";
import { Link } from "react-router-dom";
import { Settings } from "lucide-react";

const MainLayout = ({ children }) => {
  return (
    <div className="App">
      <nav className="app-nav">
        <Link
          to="/settings"
          className="app-nav-settings"
          aria-label="설정"
        >
          <Settings size={20} />
        </Link>
      </nav>
      <main>{children}</main>
    </div>
  );
};

export default MainLayout;
