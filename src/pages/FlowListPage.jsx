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

  // 加载所有流程图
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
        console.error('加载流程图失败:', error);
        setMessage(`加载失败: ${error.message}`);
        setTimeout(() => setMessage(''), 3000);
      } finally {
        setLoading(false);
      }
    };
    loadFlows();
  }, []);

  // 删除流程图
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
      
      // 重新加载流程图列表
      const flowsResponse = await fetch('http://localhost:8000/api/flow/list');
      if (flowsResponse.ok) {
        const data = await flowsResponse.json();
        setFlows(data.flows);
      }
      
      // 如果删除的是当前选中的流程图，关闭详情弹窗
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

  // 编辑流程图
  const editFlow = useCallback((flowId) => {
    navigate(`/flow-editor?flowId=${flowId}`);
  }, [navigate]);

  // 查看流程图详情
  const viewDetails = useCallback((flow) => {
    setSelectedFlow(flow);
    setShowDetails(true);
  }, []);

  // 上线流程图
  const publishFlow = useCallback(async (flowId) => {
    try {
      setLoading(true);
      setMessage('');
      
      const response = await fetch(`http://localhost:8000/api/flow/publish/${flowId}`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('上线失败');
      }
      
      // 重新加载流程图列表
      const flowsResponse = await fetch('http://localhost:8000/api/flow/list');
      if (flowsResponse.ok) {
        const data = await flowsResponse.json();
        setFlows(data.flows);
      }
      
      // 更新选中的流程图状态
      if (selectedFlow && selectedFlow.id === flowId) {
        setSelectedFlow({ ...selectedFlow, published: true });
      }
      
      setMessage('上线成功');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`上线失败: ${error.message}`);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  }, [selectedFlow]);

  // 下线流程图
  const unpublishFlow = useCallback(async (flowId) => {
    try {
      setLoading(true);
      setMessage('');
      
      const response = await fetch(`http://localhost:8000/api/flow/unpublish/${flowId}`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('下线失败');
      }
      
      // 重新加载流程图列表
      const flowsResponse = await fetch('http://localhost:8000/api/flow/list');
      if (flowsResponse.ok) {
        const data = await flowsResponse.json();
        setFlows(data.flows);
      }
      
      // 更新选中的流程图状态
      if (selectedFlow && selectedFlow.id === flowId) {
        setSelectedFlow({ ...selectedFlow, published: false });
      }
      
      setMessage('下线成功');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`下线失败: ${error.message}`);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  }, [selectedFlow]);

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
            <h3>流程图列表</h3>
            <Link to="/flow-editor">
              <button className="create-button">创建新流程图</button>
            </Link>
          </div>
          {loading ? (
            <div className="loading">加载中...</div>
          ) : flows.length === 0 ? (
            <div className="empty">暂无流程图</div>
          ) : (
            <table className="flow-table">
              <thead>
                <tr>
                  <th>流程图ID</th>
                  <th>节点数量</th>
                  <th>边数量</th>
                  <th>发布状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {flows.map((flow) => (
                  <tr key={flow.id}>
                    <td onClick={() => viewDetails(flow)} style={{ cursor: 'pointer' }}>{flow.id}</td>
                    <td>{flow.nodes ? flow.nodes.length : 0}</td>
                    <td>{flow.edges ? flow.edges.length : 0}</td>
                    <td>
                      <span className={`status-badge ${flow.published ? 'published' : 'unpublished'}`}>
                        {flow.published ? '已发布' : '未发布'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          onClick={() => editFlow(flow.id)}
                          disabled={loading}
                        >
                          编辑
                        </button>
                        {flow.published ? (
                          <button 
                            onClick={() => unpublishFlow(flow.id)}
                            disabled={loading}
                            className="unpublish-button"
                          >
                            下线
                          </button>
                        ) : (
                          <button 
                            onClick={() => publishFlow(flow.id)}
                            disabled={loading}
                            className="publish-button"
                          >
                            上线
                          </button>
                        )}
                        <button 
                          onClick={() => deleteFlow(flow.id)}
                          disabled={loading}
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
      
      {/* 流程图详情弹窗 */}
      {showDetails && selectedFlow && (
        <div className="details-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>流程图详情</h3>
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
                <label>流程图ID:</label>
                <span>{selectedFlow.id}</span>
              </div>
              <div className="detail-item">
                <label>节点数量:</label>
                <span>{selectedFlow.nodes ? selectedFlow.nodes.length : 0}</span>
              </div>
              <div className="detail-item">
                <label>边数量:</label>
                <span>{selectedFlow.edges ? selectedFlow.edges.length : 0}</span>
              </div>
              <div className="detail-item">
                <label>发布状态:</label>
                <span className={`status-badge ${selectedFlow.published ? 'published' : 'unpublished'}`}>
                  {selectedFlow.published ? '已发布' : '未发布'}
                </span>
              </div>
              {selectedFlow.nodes && (
                <div className="detail-section">
                  <h4>节点列表:</h4>
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