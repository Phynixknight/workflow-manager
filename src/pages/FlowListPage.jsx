import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './FlowListPage.css';

const FlowListPage = () => {
  const [flows, setFlows] = useState([]);
  const [selectedFlow, setSelectedFlow] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const navigate = useNavigate();

  // 加载所有工作流
  useEffect(() => {
    const loadFlows = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/api/flow/list');
        if (response.ok) {
          const data = await response.json();
          setFlows(data.flows);
        }
      } catch (error) {
        console.error('加载工作流失败:', error);
        setMessage(`加载失败: ${error.message}`);
        setTimeout(() => setMessage(''), 3000);
      } finally {
        setLoading(false);
      }
    };
    loadFlows();
  }, []);

  // 删除工作流
  const deleteFlow = useCallback(async (flowId) => {
    try {
      setLoading(true);
      setMessage('');
      
      const response = await fetch(`http://localhost:8000/api/flow/delete/${flowId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('删除失败');
      }
      
      const flowsResponse = await fetch('http://localhost:8000/api/flow/list');
      if (flowsResponse.ok) {
        const data = await flowsResponse.json();
        setFlows(data.flows);
      }
      
      if (selectedFlow && selectedFlow.id === flowId) {
        setShowDetails(false);
        setSelectedFlow(null);
      }
      
      setMessage('删除成功');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`删除失败: ${error.message}`);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  }, [selectedFlow]);

  // 编辑工作流
  const editFlow = useCallback((flowId) => {
    navigate(`/flow-editor?flowId=${flowId}`);
  }, [navigate]);

  // 查看工作流详情
  const viewDetails = useCallback((flow) => {
    setSelectedFlow(flow);
    setShowDetails(true);
  }, []);

  return (
    <div className="flow-list-page">
      {message && (
        <div className={`message ${message.includes('成功') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
      
      <div className="flow-list-container">
        <div className="flow-list">
          <div className="flow-list-header">
            <h3>工作流列表</h3>
            <Link to="/flow-editor">
              <button className="create-button">创建新工作流</button>
            </Link>
          </div>
          {loading ? (
            <div className="loading">加载中...</div>
          ) : flows.length === 0 ? (
            <div className="empty">暂无工作流</div>
          ) : (
            <table className="flow-table">
              <thead>
                <tr>
                  <th>工作流名称</th>
                  <th>工作流ID</th>
                  <th>创建时间</th>
                  <th>结点数量</th>
                  <th>边数量</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {flows.map((flow) => (
                  <tr key={flow.id}>
                    <td onClick={() => viewDetails(flow)} style={{ cursor: 'pointer', fontWeight: 500 }}>
                      {flow.name || <span style={{ color: '#98a2b3' }}>未命名</span>}
                    </td>
                    <td style={{ fontSize: '12px', color: '#5a6577' }}>{flow.id}</td>
                    <td style={{ fontSize: '12px', color: '#5a6577' }}>
                      {flow.created_at ? new Date(flow.created_at).toLocaleString('zh-CN') : '-'}
                    </td>
                    <td>{flow.nodes ? flow.nodes.length : 0}</td>
                    <td>{flow.edges ? flow.edges.length : 0}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          onClick={() => editFlow(flow.id)}
                          disabled={loading}
                        >
                          编辑
                        </button>
                        <button 
                          onClick={() => deleteFlow(flow.id)}
                          disabled={loading}
                          className="delete-button"
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      {/* 工作流详情弹窗 */}
      {showDetails && selectedFlow && (
        <div className="details-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>工作流详情</h3>
              <button 
                className="close-button"
                onClick={() => setShowDetails(false)}
                disabled={loading}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="detail-item">
                <label>工作流ID:</label>
                <span>{selectedFlow.id}</span>
              </div>
              <div className="detail-item">
                <label>结点数量:</label>
                <span>{selectedFlow.nodes ? selectedFlow.nodes.length : 0}</span>
              </div>
              <div className="detail-item">
                <label>边数量:</label>
                <span>{selectedFlow.edges ? selectedFlow.edges.length : 0}</span>
              </div>
              {selectedFlow.nodes && (
                <div className="detail-section">
                  <h4>结点列表:</h4>
                  <ul>
                    {selectedFlow.nodes.map((node) => (
                      <li key={node.id}>
                        {node.title} (ID: {node.id}, 类型: {node.type})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {selectedFlow.edges && (
                <div className="detail-section">
                  <h4>边列表:</h4>
                  <ul>
                    {selectedFlow.edges.map((edge) => (
                      <li key={edge.id}>
                        从 {edge.start} 到 {edge.end}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button 
                onClick={() => editFlow(selectedFlow.id)}
                disabled={loading}
              >
                编辑
              </button>
              <button 
                onClick={() => setShowDetails(false)}
                disabled={loading}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlowListPage;
