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
  // 级联选择框配置
  const [cascadeConfig, setCascadeConfig] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

  // 加载所有结点
  useEffect(() => {
    const loadNodes = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/node/list');
        if (response.ok) {
          const data = await response.json();
          setNodes(data.nodes);
        }
      } catch (error) {
        console.error('加载结点失败:', error);
      }
    };
    loadNodes();
  }, []);

  // 添加元素到结点
  const addElement = useCallback(() => {
    setNodeElements([...nodeElements, { ...newElement }]);
    setNewElement({ type: 'banner', title: '', value: '' });
  }, [nodeElements, newElement]);

  // 删除元素
  const removeElement = useCallback((index) => {
    setNodeElements(nodeElements.filter((_, i) => i !== index));
  }, [nodeElements]);

  // 选择结点
  const selectNode = useCallback((node) => {
    setSelectedNode(node);
    setNodeId(node.id);
    setNodeTitle(node.title);
    setNodeType(node.type);
    setNodeElements(node.elements || []);
    // 加载级联配置
    const elements = node.elements || [];
    const cascadeEl = elements.find(el => el.type === 'cascade');
    setCascadeConfig(cascadeEl?.categories || []);
  }, []);

  // 清除表单
  const clearForm = useCallback(() => {
    setSelectedNode(null);
    setNodeId('');
    setNodeTitle('');
    setNodeType('default');
    setNodeElements([]);
    setCascadeConfig([]);
    setNewElement({ type: 'banner', title: '', value: '' });
  }, []);

  // 删除结点
  const deleteNode = useCallback(async (delNodeId) => {
    try {
      setLoading(true);
      setMessage('');
      
      const response = await fetch(`http://localhost:8000/api/node/delete/${delNodeId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('删除失败');
      }
      
      const nodesResponse = await fetch('http://localhost:8000/api/node/list');
      if (nodesResponse.ok) {
        const data = await nodesResponse.json();
        setNodes(data.nodes);
      }
      
      if (selectedNode && selectedNode.id === delNodeId) {
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
      const newId = `node-${Date.now()}`;
      setNodeId(newId);
      setNodeTitle('');
      setNodeType('default');
      setNodeElements([]);
      setCascadeConfig([]);
      setNewElement({ type: 'banner', title: '', value: '' });
    }
    setShowEditor(true);
  }, [selectNode]);

  // ========== 级联选择框配置功能 ==========

  // 新增一级分类
  const addCategory = useCallback(() => {
    setCascadeConfig([
      ...cascadeConfig,
      {
        id: `cat-${Date.now()}`,
        name: '',
        purpose: '',
        functions: [],
      },
    ]);
  }, [cascadeConfig]);

  // 更新一级分类
  const updateCategory = useCallback((catIndex, field, value) => {
    const updated = [...cascadeConfig];
    updated[catIndex] = { ...updated[catIndex], [field]: value };
    setCascadeConfig(updated);
  }, [cascadeConfig]);

  // 删除一级分类
  const removeCategory = useCallback((catIndex) => {
    setCascadeConfig(cascadeConfig.filter((_, i) => i !== catIndex));
  }, [cascadeConfig]);

  // 新增二级功能（子选项）
  const addFunction = useCallback((catIndex) => {
    const updated = [...cascadeConfig];
    updated[catIndex].functions.push({
      id: `func-${Date.now()}`,
      name: '',
      params: [],
    });
    setCascadeConfig(updated);
  }, [cascadeConfig]);

  // 更新二级功能名称
  const updateFunction = useCallback((catIndex, funcIndex, value) => {
    const updated = [...cascadeConfig];
    updated[catIndex].functions[funcIndex].name = value;
    setCascadeConfig(updated);
  }, [cascadeConfig]);

  // 删除二级功能
  const removeFunction = useCallback((catIndex, funcIndex) => {
    const updated = [...cascadeConfig];
    updated[catIndex].functions.splice(funcIndex, 1);
    setCascadeConfig(updated);
  }, [cascadeConfig]);

  // 新增参数
  const addParam = useCallback((catIndex, funcIndex) => {
    const updated = [...cascadeConfig];
    updated[catIndex].functions[funcIndex].params.push('');
    setCascadeConfig(updated);
  }, [cascadeConfig]);

  // 更新参数
  const updateParam = useCallback((catIndex, funcIndex, paramIndex, value) => {
    const updated = [...cascadeConfig];
    updated[catIndex].functions[funcIndex].params[paramIndex] = value;
    setCascadeConfig(updated);
  }, [cascadeConfig]);

  // 删除参数
  const removeParam = useCallback((catIndex, funcIndex, paramIndex) => {
    const updated = [...cascadeConfig];
    updated[catIndex].functions[funcIndex].params.splice(paramIndex, 1);
    setCascadeConfig(updated);
  }, [cascadeConfig]);

  // 保存时将级联配置合并到 elements 中
  const getElementsWithCascade = useCallback(() => {
    if (cascadeConfig.length === 0) return nodeElements;
    // 移除旧的 cascade 元素，加入新的
    const filtered = nodeElements.filter(el => el.type !== 'cascade');
    return [
      ...filtered,
      { type: 'cascade', title: '级联选择配置', categories: cascadeConfig },
    ];
  }, [nodeElements, cascadeConfig]);

  // 保存结点
  const handleSave = useCallback(async () => {
    const mergedElements = getElementsWithCascade();
    const nodeData = {
      id: nodeId || `node-${Date.now()}`,
      title: nodeTitle,
      type: nodeType,
      elements: mergedElements,
    };

    try {
      setLoading(true);
      setMessage('');
      
      const response = await fetch('http://localhost:8000/api/node/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nodeData),
      });
      
      if (!response.ok) throw new Error('保存失败');
      
      const listResp = await fetch('http://localhost:8000/api/node/list');
      if (listResp.ok) {
        const data = await listResp.json();
        setNodes(data.nodes);
      }
      
      setMessage('保存成功');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`保存失败: ${error.message}`);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  }, [nodeId, nodeTitle, nodeType, getElementsWithCascade]);

  // 发布结点（保存 + 标记为已发布）
  const handlePublish = useCallback(async () => {
    const mergedElements = getElementsWithCascade();
    const nodeData = {
      id: nodeId || `node-${Date.now()}`,
      title: nodeTitle,
      type: nodeType,
      elements: mergedElements,
    };

    try {
      setLoading(true);
      setMessage('');
      
      await fetch('http://localhost:8000/api/node/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nodeData),
      });
      
      const response = await fetch(`http://localhost:8000/api/node/publish/${nodeData.id}`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('发布失败');
      
      const listResp = await fetch('http://localhost:8000/api/node/list');
      if (listResp.ok) {
        const data = await listResp.json();
        setNodes(data.nodes);
      }
      
      setMessage('发布成功');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`发布失败: ${error.message}`);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  }, [nodeId, nodeTitle, nodeType, getElementsWithCascade]);

  // 上线结点
  const onlineNode = useCallback(async (nId) => {
    try {
      setLoading(true);
      setMessage('');
      
      const response = await fetch(`http://localhost:8000/api/node/online/${nId}`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('上线失败');
      
      const listResp = await fetch('http://localhost:8000/api/node/list');
      if (listResp.ok) {
        const data = await listResp.json();
        setNodes(data.nodes);
      }
      
      setMessage('上线成功');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`上线失败: ${error.message}`);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  }, []);

  // 下线结点
  const offlineNode = useCallback(async (nId) => {
    try {
      setLoading(true);
      setMessage('');
      
      const response = await fetch(`http://localhost:8000/api/node/offline/${nId}`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('下线失败');
      
      const listResp = await fetch('http://localhost:8000/api/node/list');
      if (listResp.ok) {
        const data = await listResp.json();
        setNodes(data.nodes);
      }
      
      setMessage('下线成功');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`下线失败: ${error.message}`);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取结点状态标签
  const getStatusBadge = (node) => {
    if (node.online) {
      return <span className="status-badge online">已上线</span>;
    } else if (node.published) {
      return <span className="status-badge published">已发布</span>;
    }
    return <span className="status-badge draft">草稿</span>;
  };

  return (
    <div className="admin-page">
      {message && (
        <div className={`message ${message.includes('成功') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
      
      <div className="admin-container">
        {/* 结点列表 */}
        <div className="node-list">
          <div className="node-list-header">
            <h3>结点列表</h3>
            <button 
              className="add-node-button"
              onClick={() => openEditor()}
              disabled={loading}
            >
              新增结点
            </button>
          </div>
          {loading ? (
            <div className="loading">加载中...</div>
          ) : nodes.length === 0 ? (
            <div className="empty">暂无结点</div>
          ) : (
            <table className="node-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>名称</th>
                  <th>类型</th>
                  <th>状态</th>
                  <th>创建时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {nodes.map((node) => (
                  <tr key={node.id}>
                    <td>{node.id || '-'}</td>
                    <td>{node.title || '-'}</td>
                    <td>
                      {node.type === 'cascadeNode' ? (
                        <span className="type-badge cascade">级联配置</span>
                      ) : (
                        <span className="type-badge default">{node.type}</span>
                      )}
                    </td>
                    <td>{getStatusBadge(node)}</td>
                    <td>{node.created_at ? new Date(node.created_at).toLocaleString() : new Date().toLocaleString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          onClick={() => openEditor(node)}
                          disabled={loading}
                        >
                          编辑
                        </button>
                        {node.published && !node.online && (
                          <button 
                            className="online-btn"
                            onClick={() => onlineNode(node.id)}
                            disabled={loading}
                          >
                            上线
                          </button>
                        )}
                        {node.online && (
                          <button 
                            className="offline-btn"
                            onClick={() => offlineNode(node.id)}
                            disabled={loading}
                          >
                            下线
                          </button>
                        )}
                        <button 
                          className="delete-btn"
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
      
      {/* 结点编辑器弹窗 */}
      {showEditor && (
        <div className="editor-modal">
          <div className="modal-content modal-content-wide">
            <div className="modal-header">
              <h3>结点编辑器</h3>
              <button 
                className="close-button"
                onClick={() => setShowEditor(false)}
                disabled={loading}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              {/* 基本信息 */}
              <div className="editor-section">
                <h4 className="section-title">基本信息</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>结点ID:</label>
                    <input 
                      type="text" 
                      value={nodeId} 
                      onChange={(e) => setNodeId(e.target.value)} 
                      placeholder="输入结点ID"
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>结点标题:</label>
                    <input 
                      type="text" 
                      value={nodeTitle} 
                      onChange={(e) => setNodeTitle(e.target.value)} 
                      placeholder="输入结点标题"
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>结点类型:</label>
                    <select 
                      value={nodeType} 
                      onChange={(e) => setNodeType(e.target.value)}
                      disabled={loading}
                    >
                      <option value="default">默认结点</option>
                      <option value="start">起始结点</option>
                      <option value="end">结束结点</option>
                      <option value="cascadeNode">级联配置结点</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 基础组件管理 */}
              <div className="editor-section">
                <h4 className="section-title">基础组件</h4>
                
                <div className="current-elements">
                  {nodeElements.filter(el => el.type !== 'cascade').map((element, index) => (
                    <div key={index} className="element-item">
                      <span className="element-type-badge">{element.type}</span>
                      <span className="element-info">
                        {element.type === 'banner' && element.title}
                        {element.type === 'label' && `${element.title} = ${element.value}`}
                        {element.type === 'text' && (element.title ? `文本输入框: ${element.title}` : '文本输入框')}
                      </span>
                      <button className="remove-btn" onClick={() => removeElement(index)}>×</button>
                    </div>
                  ))}
                  {nodeElements.filter(el => el.type !== 'cascade').length === 0 && (
                    <div className="empty-hint">暂无组件</div>
                  )}
                </div>
                
                <div className="add-element-row">
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
                  
                  {newElement.type === 'text' && (
                    <input
                      type="text"
                      placeholder="输入框名称"
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
                  
                  <button className="add-btn" onClick={addElement} disabled={loading}>
                    添加组件
                  </button>
                </div>
              </div>

              {/* 级联选择框配置 */}
              <div className="editor-section cascade-section">
                <div className="section-header">
                  <h4 className="section-title">级联选择框配置</h4>
                  <span className="section-hint">配置类似数据处理结点的多级选择功能</span>
                </div>
                
                <button className="add-category-btn" onClick={addCategory} disabled={loading}>
                  + 新增一级分类
                </button>

                <div className="cascade-list">
                  {cascadeConfig.map((category, catIndex) => (
                    <div key={category.id} className="cascade-category">
                      <div className="category-header">
                        <span className="category-index">分类 {catIndex + 1}</span>
                        <button 
                          className="remove-btn"
                          onClick={() => removeCategory(catIndex)}
                        >
                          删除分类
                        </button>
                      </div>
                      
                      <div className="category-fields">
                        <div className="field-row">
                          <label>分类名称:</label>
                          <input
                            type="text"
                            value={category.name}
                            onChange={(e) => updateCategory(catIndex, 'name', e.target.value)}
                            placeholder="如：数据获取、缺失值处理..."
                            disabled={loading}
                          />
                        </div>
                        <div className="field-row">
                          <label>分类目的:</label>
                          <input
                            type="text"
                            value={category.purpose}
                            onChange={(e) => updateCategory(catIndex, 'purpose', e.target.value)}
                            placeholder="描述该分类的用途"
                            disabled={loading}
                          />
                        </div>
                      </div>

                      {/* 二级功能列表 */}
                      <div className="functions-area">
                        <div className="functions-header">
                          <span className="functions-label">二级功能（子选项）</span>
                          <button 
                            className="add-func-btn"
                            onClick={() => addFunction(catIndex)}
                            disabled={loading}
                          >
                            + 新增子选项
                          </button>
                        </div>

                        {category.functions.map((func, funcIndex) => (
                          <div key={func.id} className="function-item">
                            <div className="function-header">
                              <input
                                type="text"
                                className="func-name-input"
                                value={func.name}
                                onChange={(e) => updateFunction(catIndex, funcIndex, e.target.value)}
                                placeholder="功能名称"
                                disabled={loading}
                              />
                              <button 
                                className="remove-btn small"
                                onClick={() => removeFunction(catIndex, funcIndex)}
                              >
                                ×
                              </button>
                            </div>

                            {/* 参数配置 */}
                            <div className="params-area">
                              <div className="params-header">
                                <span className="params-label">参数 (string)</span>
                                <button 
                                  className="add-param-btn"
                                  onClick={() => addParam(catIndex, funcIndex)}
                                  disabled={loading}
                                >
                                  + 参数
                                </button>
                              </div>
                              <div className="params-list">
                                {func.params.map((param, paramIndex) => (
                                  <div key={paramIndex} className="param-item">
                                    <input
                                      type="text"
                                      value={param}
                                      onChange={(e) => updateParam(catIndex, funcIndex, paramIndex, e.target.value)}
                                      placeholder={`参数${paramIndex + 1}名称`}
                                      disabled={loading}
                                    />
                                    <button 
                                      className="remove-param-btn"
                                      onClick={() => removeParam(catIndex, funcIndex, paramIndex)}
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}
                                {func.params.length === 0 && (
                                  <span className="no-params">暂无参数</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}

                        {category.functions.length === 0 && (
                          <div className="empty-hint">暂无子选项，点击上方按钮添加</div>
                        )}
                      </div>
                    </div>
                  ))}

                  {cascadeConfig.length === 0 && (
                    <div className="empty-hint cascade-empty">
                      暂无级联配置。点击"新增一级分类"开始配置类似数据处理结点的多级选择功能。
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="save-btn" onClick={handleSave} disabled={loading}>
                {loading ? '保存中...' : '保存'}
              </button>
              <button className="publish-btn" onClick={handlePublish} disabled={loading}>
                {loading ? '发布中...' : '发布'}
              </button>
              <button className="cancel-btn" onClick={() => setShowEditor(false)} disabled={loading}>
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
