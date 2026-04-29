import React, { useState, useEffect, useCallback } from 'react';
import './AdminPage.css';

const AdminPage = () => {
  // 状态管理
  const [nodes, setNodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodeId, setNodeId] = useState('');
  const [nodeTitle, setNodeTitle] = useState('');
  const [nodeType, setNodeType] = useState('default');
  const [nodeElements, setNodeElements] = useState([]);
  const [newElement, setNewElement] = useState({ type: 'banner', title: '', value: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

  // 加载所有节点
  useEffect(() => {
    const loadNodes = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/node/list');
        if (response.ok) {
          const data = await response.json();
          setNodes(data.nodes);
        }
      } catch (error) {
        console.error('加载节点失败:', error);
      }
    };
    loadNodes();
  }, []);

  // 保存节点
  const saveNode = useCallback(async () => {
    try {
      setLoading(true);
      setMessage('');
      
      const nodeData = {
        id: nodeId || `node-${Date.now()}`,
        title: nodeTitle,
        type: nodeType,
        elements: nodeElements
      };
      
      const response = await fetch('http://localhost:8000/api/node/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nodeData),
      });
      
      if (!response.ok) {
        throw new Error('保存失败');
      }
      
      // 重新加载节点列表
      const loadNodes = async () => {
        try {
          const response = await fetch('http://localhost:8000/api/node/list');
          if (response.ok) {
            const data = await response.json();
            setNodes(data.nodes);
          }
        } catch (error) {
          console.error('加载节点失败:', error);
        }
      };
      loadNodes();
      
      setMessage('保存成功');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`保存失败: ${error.message}`);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  }, [nodeId, nodeTitle, nodeType, nodeElements]);

  // 发布节点
  const publishNode = useCallback(async () => {
    try {
      setLoading(true);
      setMessage('');
      
      const targetNodeId = nodeId || `node-${Date.now()}`;
      
      const response = await fetch(`http://localhost:8000/api/node/publish/${targetNodeId}`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('发布失败');
      }
      
      // 重新加载节点列表
      const loadNodes = async () => {
        try {
          const response = await fetch('http://localhost:8000/api/node/list');
          if (response.ok) {
            const data = await response.json();
            setNodes(data.nodes);
          }
        } catch (error) {
          console.error('加载节点失败:', error);
        }
      };
      loadNodes();
      
      setMessage('发布成功');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`发布失败: ${error.message}`);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  }, [nodeId]);

  // 添加元素到节点
  const addElement = useCallback(() => {
    setNodeElements([...nodeElements, { ...newElement }]);
    setNewElement({ type: 'banner', title: '', value: '' });
  }, [nodeElements, newElement]);

  // 选择节点
  const selectNode = useCallback((node) => {
    setSelectedNode(node);
    setNodeId(node.id);
    setNodeTitle(node.title);
    setNodeType(node.type);
    setNodeElements(node.elements || []);
  }, []);

  // 清除表单
  const clearForm = useCallback(() => {
    setSelectedNode(null);
    setNodeId('');
    setNodeTitle('');
    setNodeType('default');
    setNodeElements([]);
    setNewElement({ type: 'banner', title: '', value: '' });
  }, []);

  // 删除节点
  const deleteNode = useCallback(async (nodeId) => {
    try {
      setLoading(true);
      setMessage('');
      
      const response = await fetch(`http://localhost:8000/api/node/delete/${nodeId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('删除失败');
      }
      
      // 重新加载节点列表
      const nodesResponse = await fetch('http://localhost:8000/api/node/list');
      if (nodesResponse.ok) {
        const data = await nodesResponse.json();
        setNodes(data.nodes);
      }
      
      // 如果删除的是当前选中的节点，清除表单
      if (selectedNode && selectedNode.id === nodeId) {
        clearForm();
      }
      
      setMessage('删除成功');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`删除失败: ${error.message}`);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  }, [selectedNode, clearForm]);

  // 打开编辑器弹窗
  const openEditor = useCallback((node = null) => {
    if (node) {
      selectNode(node);
    } else {
      // 新增节点，自动分配ID
      const newId = `node-${Date.now()}`;
      setNodeId(newId);
      setNodeTitle('');
      setNodeType('default');
      setNodeElements([]);
      setNewElement({ type: 'banner', title: '', value: '' });
    }
    setShowEditor(true);
  }, [selectNode]);

  return (
    <div className="admin-page">
      {message && (
        <div className={`message ${message.includes('成功') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
      
      <div className="admin-container">
        {/* 节点列表 */}
        <div className="node-list">
          <div className="node-list-header">
            <h3>已发布节点</h3>
            <button 
              className="add-node-button"
              onClick={() => openEditor()}
              disabled={loading}
            >
              新增节点
            </button>
          </div>
          {loading ? (
            <div className="loading">加载中...</div>
          ) : nodes.length === 0 ? (
            <div className="empty">暂无节点</div>
          ) : (
            <table className="node-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>名称</th>
                  <th>创建时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {nodes.map((node) => (
                  <tr key={node.id}>
                    <td>{node.id || '-'}</td>
                    <td>{node.title || '-'}</td>
                    <td>{node.created_at ? new Date(node.created_at).toLocaleString() : new Date().toLocaleString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          onClick={() => openEditor(node)}
                          disabled={loading}
                        >
                          编辑
                        </button>
                        <button 
                          onClick={() => deleteNode(node.id)}
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
      
      {/* 节点编辑器弹窗 */}
      {showEditor && (
        <div className="editor-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>节点编辑器</h3>
              <button 
                className="close-button"
                onClick={() => setShowEditor(false)}
                disabled={loading}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>节点ID:</label>
                <input 
                  type="text" 
                  value={nodeId} 
                  onChange={(e) => setNodeId(e.target.value)} 
                  placeholder="输入节点ID"
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label>节点标题:</label>
                <input 
                  type="text" 
                  value={nodeTitle} 
                  onChange={(e) => setNodeTitle(e.target.value)} 
                  placeholder="输入节点标题"
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label>节点类型:</label>
                <select 
                  value={nodeType} 
                  onChange={(e) => setNodeType(e.target.value)}
                  disabled={loading}
                >
                  <option value="default">默认节点</option>
                  <option value="start">起始节点</option>
                  <option value="end">结束节点</option>
                </select>
              </div>
              
              {/* 元素编辑 */}
              <div className="elements-section">
                <h4>组件管理</h4>
                
                <div className="current-elements">
                  <h5>已添加组件:</h5>
                  <ul>
                    {nodeElements.map((element, index) => (
                      <li key={index}>
                        {element.type === 'banner' && `横幅: ${element.title}`}
                        {element.type === 'label' && `标签: ${element.title} = ${element.value}`}
                        {element.type === 'text' && '文本输入框'}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="add-element">
                  <h5>添加组件:</h5>
                  <div className="element-form">
                    <select 
                      value={newElement.type} 
                      onChange={(e) => setNewElement({ ...newElement, type: e.target.value })}
                      disabled={loading}
                    >
                      <option value="banner">横幅</option>
                      <option value="label">标签</option>
                      <option value="text">文本输入框</option>
                    </select>
                    
                    {newElement.type === 'banner' && (
                      <input
                        type="text"
                        placeholder="横幅标题"
                        value={newElement.title}
                        onChange={(e) => setNewElement({ ...newElement, title: e.target.value })}
                        disabled={loading}
                      />
                    )}
                    
                    {newElement.type === 'label' && (
                      <>
                        <input
                          type="text"
                          placeholder="标签标题"
                          value={newElement.title}
                          onChange={(e) => setNewElement({ ...newElement, title: e.target.value })}
                          disabled={loading}
                        />
                        <input
                          type="text"
                          placeholder="标签值"
                          value={newElement.value}
                          onChange={(e) => setNewElement({ ...newElement, value: e.target.value })}
                          disabled={loading}
                        />
                      </>
                    )}
                    
                    <button onClick={addElement} disabled={loading}>
                      添加
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button onClick={saveNode} disabled={loading}>
                {loading ? '保存中...' : '保存'}
              </button>
              <button onClick={publishNode} disabled={loading}>
                {loading ? '发布中...' : '发布'}
              </button>
              <button onClick={() => setShowEditor(false)} disabled={loading}>
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;