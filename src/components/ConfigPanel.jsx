import React, { useState } from 'react';
import { DATA_PROCESSING_FUNCTIONS } from './DataProcessingNode';
import './ConfigPanel.css';

const ConfigPanel = ({ node, onConfigChange, onElementsChange, onClose, onSave }) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedFunction, setSelectedFunction] = useState('');

  if (!node) {
    return (
      <div className="config-panel">
        <div className="config-panel-empty">
          <p>点击结点进行配置</p>
        </div>
      </div>
    );
  }

  // 数据处理结点配置
  if (node.type === 'dataProcessing') {
    return <DataProcessingConfigPanel 
      node={node} 
      onConfigChange={onConfigChange} 
      onClose={onClose} 
      onSave={onSave}
      selectedCategory={selectedCategory}
      setSelectedCategory={setSelectedCategory}
      selectedFunction={selectedFunction}
      setSelectedFunction={setSelectedFunction}
    />;
  }

  // 默认结点（基础组件）配置
  return <DefaultNodeConfigPanel 
    node={node} 
    onElementsChange={onElementsChange} 
    onClose={onClose} 
    onSave={onSave} 
  />;
};

// ===== 数据处理结点配置面板 =====
const DataProcessingConfigPanel = ({ node, onConfigChange, onClose, onSave, selectedCategory, setSelectedCategory, selectedFunction, setSelectedFunction }) => {
  const currentCategory = DATA_PROCESSING_FUNCTIONS.find(c => c.id === selectedCategory);
  const currentFunction = currentCategory?.functions.find(f => f.name === selectedFunction);
  const selectedFunctions = node.data.config?.selectedFunctions || [];

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setSelectedFunction('');
  };

  const handleFunctionChange = (e) => {
    setSelectedFunction(e.target.value);
  };

  const addFunction = () => {
    if (!selectedCategory || !selectedFunction) return;
    const exists = selectedFunctions.some(
      f => f.categoryId === selectedCategory && f.functionName === selectedFunction
    );
    if (exists) return;

    const funcDef = currentCategory?.functions.find(f => f.name === selectedFunction);
    const newEntry = {
      categoryId: selectedCategory,
      categoryName: currentCategory?.step || '',
      functionName: selectedFunction,
      params: funcDef?.params.reduce((acc, p) => ({ ...acc, [p]: '' }), {}) || {},
    };

    onConfigChange(node.id, {
      ...node.data.config,
      selectedFunctions: [...selectedFunctions, newEntry],
    });
  };

  const removeFunction = (index) => {
    const updated = [...selectedFunctions];
    updated.splice(index, 1);
    onConfigChange(node.id, {
      ...node.data.config,
      selectedFunctions: updated,
    });
  };

  const updateParam = (funcIndex, paramName, value) => {
    const updated = [...selectedFunctions];
    updated[funcIndex] = {
      ...updated[funcIndex],
      params: { ...updated[funcIndex].params, [paramName]: value },
    };
    onConfigChange(node.id, {
      ...node.data.config,
      selectedFunctions: updated,
    });
  };

  return (
    <div className="config-panel">
      <div className="config-panel-header">
        <h3>结点配置: {node.data.label}</h3>
        <button className="config-panel-close" onClick={onClose}>✕</button>
      </div>

      <div className="config-panel-body">
        <div className="config-section">
          <div className="config-section-title">添加数据处理功能</div>
          <div className="config-select-row">
            <div className="config-select-group">
              <label>一级功能（步骤）</label>
              <select value={selectedCategory} onChange={handleCategoryChange}>
                <option value="">-- 请选择一级功能 --</option>
                {DATA_PROCESSING_FUNCTIONS.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.step}</option>
                ))}
              </select>
              {currentCategory && (
                <span className="config-purpose">目的：{currentCategory.purpose}</span>
              )}
            </div>
            <div className="config-select-group">
              <label>二级功能（细分）</label>
              <select value={selectedFunction} onChange={handleFunctionChange} disabled={!selectedCategory}>
                <option value="">-- 请选择二级功能 --</option>
                {currentCategory?.functions.map(func => (
                  <option key={func.name} value={func.name}>{func.name}</option>
                ))}
              </select>
            </div>
          </div>

          {currentFunction && (
            <div className="config-param-preview">
              <span className="config-param-title">所需参数：</span>
              <div className="config-param-tags">
                {currentFunction.params.map(p => (
                  <span key={p} className="config-param-tag">{p}</span>
                ))}
              </div>
            </div>
          )}

          <button className="config-add-btn" onClick={addFunction} disabled={!selectedFunction}>
            + 添加此功能
          </button>
        </div>

        <div className="config-section">
          <div className="config-section-title">已配置功能 ({selectedFunctions.length})</div>
          {selectedFunctions.length === 0 ? (
            <div className="config-empty-hint">暂无已配置功能，请从上方选择添加</div>
          ) : (
            <div className="config-func-list">
              {selectedFunctions.map((func, idx) => (
                <div key={idx} className="config-func-item">
                  <div className="config-func-item-header">
                    <div className="config-func-item-info">
                      <span className="config-func-cat">{func.categoryName}</span>
                      <span className="config-func-name">{func.functionName}</span>
                    </div>
                    <button className="config-func-remove" onClick={() => removeFunction(idx)}>删除</button>
                  </div>
                  <div className="config-func-params">
                    {Object.entries(func.params).map(([paramName, paramValue]) => (
                      <div key={paramName} className="config-param-row">
                        <label>{paramName}</label>
                        <input
                          type="text"
                          value={paramValue}
                          placeholder={`请输入${paramName}`}
                          onChange={(e) => updateParam(idx, paramName, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="config-panel-footer">
          <button className="config-save-btn" onClick={onSave}>💾 保存配置</button>
        </div>
      </div>
    </div>
  );
};

// ===== 默认结点（基础组件）配置面板 =====
const DefaultNodeConfigPanel = ({ node, onElementsChange, onClose, onSave }) => {
  const elements = node.data.elements || [];

  const updateElement = (index, field, value) => {
    const updated = [...elements];
    updated[index] = { ...updated[index], [field]: value };
    onElementsChange(node.id, updated);
  };

  return (
    <div className="config-panel">
      <div className="config-panel-header">
        <h3>结点配置: {node.data.label}</h3>
        <button className="config-panel-close" onClick={onClose}>✕</button>
      </div>

      <div className="config-panel-body">
        <div className="config-section">
          <div className="config-section-title">组件配置 ({elements.length} 个元素)</div>
          {elements.length === 0 ? (
            <div className="config-empty-hint">该结点暂无可配置的元素</div>
          ) : (
            <div className="config-func-list">
              {elements.map((el, idx) => (
                <div key={idx} className="config-func-item">
                  <div className="config-func-item-header">
                    <div className="config-func-item-info">
                      <span className="config-func-cat">
                        {el.type === 'text' ? '文本输入' : el.type === 'label' ? '标签' : '标题'}
                      </span>
                      <span className="config-func-name">{el.title || '未命名'}</span>
                    </div>
                  </div>
                  <div className="config-func-params">
                    {/* 文本输入：直接配置值 */}
                    {el.type === 'text' && (
                      <div className="config-param-row">
                        <label>值</label>
                        <input
                          type="text"
                          value={el.value || ''}
                          placeholder="请输入内容"
                          onChange={(e) => updateElement(idx, 'value', e.target.value)}
                        />
                      </div>
                    )}
                    {/* 标签：直接配置显示值 */}
                    {el.type === 'label' && (
                      <div className="config-param-row">
                        <label>显示值</label>
                        <input
                          type="text"
                          value={el.value || ''}
                          placeholder="请输入显示值"
                          onChange={(e) => updateElement(idx, 'value', e.target.value)}
                        />
                      </div>
                    )}
                    {/* banner：无需配置 */}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="config-panel-footer">
          <button className="config-save-btn" onClick={onSave}>💾 保存配置</button>
        </div>
      </div>
    </div>
  );
};

export default ConfigPanel;
