import React from 'react';
import { Link } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-title-link">
          <h1 className="nav-title">工作流管理系统</h1>
        </Link>
      </div>
    </nav>
  );
};

export default Navigation;
