import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>工作流管理系统</h1>
        <p>高效管理结点和工作流，简化工作流程</p>
      </div>
      
      <div className="features-section">
        <div className="feature-card">
          <div className="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
          </div>
          <h2>结点管理</h2>
          <p>创建、编辑、发布和管理各种类型的结点，为工作流提供基础组件</p>
          <Link to="/admin" className="feature-button">
            进入结点管理
          </Link>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </div>
          <h2>工作流列表</h2>
          <p>查看、编辑、删除和管理所有已创建的工作流，方便流程的组织和维护</p>
          <Link to="/flow-list" className="feature-button">
            查看工作流列表
          </Link>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 11H4"></path>
              <path d="M12 20V4"></path>
            </svg>
          </div>
          <h2>工作流编辑器</h2>
          <p>使用已发布的结点和起始/结束结点，通过拖拽和连线创建复杂的工作流程</p>
          <Link to="/flow-editor" className="feature-button">
            进入工作流编辑器
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;