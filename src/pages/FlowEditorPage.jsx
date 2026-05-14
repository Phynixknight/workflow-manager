import React, { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ReactFlow, { 
  Controls, 
  Background, 
  MiniMap, 
  useNodesState, 
  useEdgesState,
  addEdge,
  Handle
} from 'reactflow';
import 'reactflow/dist/style.css';
import './FlowEditorPage.css';
import DataProcessingNode from '../components/DataProcessingNode';
import ConfigPanel from '../components/ConfigPanel';

// 默认结点（基础组件结点）- 画布展示
const DefaultNode = ({ data, id }) => {
  const elements = data.elements || [];

  return (
    <div className="node-default">
      <Handle type="source" position="top" id={`${id}-anchor-0`} />
      <Handle type="source" position="right" id={`${id}-anchor-2`} />
      <Handle type="target" position="bottom" id={`${id}-anchor-1`} />
      <Handle type="target" position="left" id={`${id}-anchor-3`} />
      <div className="node-header">{data.label}</div>
      <div className="node-elements">
        {elements.map((el, i) => {
          if (el.type === 'banner') {
            return (
              <div key={i} className="node-el-banner">
                {el.title}
              </div>
            );
          }
          if (el.type === 'text') {
            return (
              <div key={i} className="node-el-text">
                <label className="node-el-text-label">{el.title || '输入'}</label>
                <input
                  type="text"
                  className="node-el-text-input"
                  placeholder="请输入..."
                  readOnly
                />
              </div>
            );
          }
          if (el.type === 'label') {
            return (
              <div key={i} className="node-el-label">
                <span className="node-el-label-title">{el.title}:</span>
                <span className="node-el-label-value">{el.value}</span>
              </div>
            );
          }
          return null;
        })}
        {elements.length === 0 && (
          <div className="node-el-empty">点击配置 →</div>
        )}
      </div>
    </div>
  );
};

// 结点类型
const nodeTypes = {
  dataProcessing: DataProcessingNode,
  default: DefaultNode,
  start: ({ data, id }) => (
    <div className="node-start">
      <Handle type="source" position="top" id={`${id}-anchor-0`} />
      <Handle type="source" position="right" id={`${id}-anchor-2`} />
      <Handle type="target" position="bottom" id={`${id}-anchor-1`} />
      <Handle type="target" position="left" id={`${id}-anchor-3`} />
      <div className="node-label">{data.label}</div>
    </div>
  ),
  end: ({ data, id }) => (
    <div className="node-end">
      <Handle type="source" position="top" id={`${id}-anchor-0`} />
      <Handle type="source" position="right" id={`${id}-anchor-2`} />
      <Handle type="target" position="bottom" id={`${id}-anchor-1`} />
      <Handle type="target" position="left" id={`${id}-anchor-3`} />
      <div className="node-label">{data.label}</div>
    </div>
  ),
};

const FlowEditorPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // 状态管理
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [publishedNodes, setPublishedNodes] = useState([]);
  const [flowId, setFlowId] = useState('');
  const [flowName, setFlowName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);

  // 初始化：自动生成ID或从URL加载
  useEffect(() => {
    const urlFlowId = searchParams.get('flowId');
    if (urlFlowId) {
      setFlowId(urlFlowId);
      const doLoad = async () => {
        try {
          setLoading(true);
          const response = await fetch(`http://localhost:8000/api/flow/load/${urlFlowId}`);
          if (!response.ok) {
            if (response.status === 404) return;
            throw new Error('加载失败');
          }
          const data = await response.json();
          const reactFlowNodes = data.nodes.map((node, index) => ({
            id: node.id,
            type: node.type,
            position: node.position || { x: 100 + index * 200, y: 150 },
            data: {
              label: node.title,
              elements: node.elements || [],
              ...(node.type === 'dataProcessing' ? { config: node.config || {} } : {}),
            },
          }));
          const reactFlowEdges = data.edges.map((edge) => ({
            id: edge.id,
            source: edge.start.split('-anchor-')[0],
            target: edge.end.split('-anchor-')[0],
            sourceHandle: edge.start,
            targetHandle: edge.end,
            type: 'smoothstep',
            animated: true,
          }));
          setNodes(reactFlowNodes);
          setEdges(reactFlowEdges);
          if (data.name) setFlowName(data.name);
        } catch (error) {
          console.error('加载工作流失败:', error);
        } finally {
          setLoading(false);
        }
      };
      doLoad();
    } else {
      const newId = `flow-${Date.now()}`;
      setFlowId(newId);
    }
  }, [searchParams]);

  // 加载已发布结点
  useEffect(() => {
    const loadPublishedNodes = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/node/published');
        if (response.ok) {
          const data = await response.json();
          setPublishedNodes(data.nodes);
        }
      } catch (error) {
        console.error('加载已发布结点失败:', error);
      }
    };
    loadPublishedNodes();
  }, []);

  // 处理连线
  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge({ ...params, type: 'smoothstep', animated: true }, eds));
  }, [setEdges]);

  // 数据处理结点配置变更回调
  const handleDataProcessingConfigChange = useCallback((nodeId, newConfig) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: { ...node.data, config: newConfig },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  // 默认结点元素配置变更回调
  const handleDefaultNodeConfigChange = useCallback((nodeId, newElements) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: { ...node.data, elements: newElements },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  // 添加结点 - 自动定位并自动连线
  const addNode = useCallback((nodeType, label, x, y, elements = []) => {
    const nodeId = `node-${Date.now()}`;

    let posX = 100;
    let posY = 150;
    let lastNode = null;

    if (nodes.length > 0) {
      const maxX = Math.max(...nodes.map(n => n.position.x));
      lastNode = nodes.find(n => n.position.x === maxX);
      posX = maxX + 200;
      posY = lastNode ? lastNode.position.y : 150;
    }

    const newNode = {
      id: nodeId,
      type: nodeType,
      position: { x: posX, y: posY },
      data: {
        label,
        elements,
        ...(nodeType === 'dataProcessing' ? { config: {} } : {}),
      },
    };

    setNodes((nds) => [...nds, newNode]);

    // 自动连线：上一个结点的右侧锚点 → 新结点的左侧锚点
    if (lastNode) {
      const newEdge = {
        id: `edge-${Date.now()}`,
        source: lastNode.id,
        target: nodeId,
        sourceHandle: `${lastNode.id}-anchor-2`,
        targetHandle: `${nodeId}-anchor-3`,
        type: 'smoothstep',
        animated: true,
      };
      setEdges((eds) => [...eds, newEdge]);
    }
  }, [setNodes, setEdges, nodes]);

  // 构建保存数据
  const buildSaveData = useCallback(() => {
    return {
      id: flowId,
      name: flowName,
      nodes: nodes.map((node) => ({
        id: node.id,
        title: node.data.label,
        type: node.type,
        hash: node.id,
        position: node.position,
        anchors: [
          { id: `${node.id}-anchor-0`, title: '' },
          { id: `${node.id}-anchor-1`, title: '' },
          { id: `${node.id}-anchor-2`, title: '' },
          { id: `${node.id}-anchor-3`, title: '' },
        ],
        elements: node.data.elements || [],
        ...(node.type === 'dataProcessing' ? { config: node.data.config || {} } : {}),
      })),
      edges: edges.map((edge) => ({
        id: edge.id,
        start: edge.sourceHandle || `${edge.source}-anchor-2`,
        end: edge.targetHandle || `${edge.target}-anchor-3`,
      })),
    };
  }, [nodes, edges, flowId, flowName]);

  // 保存工作流
  const saveFlow = useCallback(async () => {
    try {
      setLoading(true);
      setMessage('');
      const graphData = buildSaveData();
      const response = await fetch('http://localhost:8000/api/flow/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(graphData),
      });
      if (!response.ok) throw new Error('保存失败');
      setMessage('保存成功');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`保存失败: ${error.message}`);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  }, [buildSaveData]);

  // 点击结点时打开右侧配置面板（所有类型都可配置）
  const onNodeClick = useCallback((event, node) => {
    if (node.type === 'start' || node.type === 'end') {
      setSelectedNode(null);
    } else {
      setSelectedNode(node);
    }
  }, []);

  // 点击画布空白处关闭面板
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // 保持 selectedNode 与 nodes 同步
  const currentSelectedNode = selectedNode
    ? nodes.find(n => n.id === selectedNode.id) || null
    : null;

  return (
    <div className="flow-editor-page">
      {/* 顶部工具栏 */}
      <div className="flow-editor-topbar">
        <div className="topbar-left">
          <button className="back-btn" onClick={() => navigate('/flow-list')}>
            ← 返回
          </button>
          <div className="flow-info-inline">
            <span className="flow-id-tag">{flowId}</span>
            <input 
              type="text" 
              className="flow-name-inline"
              value={flowName} 
              onChange={(e) => setFlowName(e.target.value)} 
              placeholder="输入工作流名称"
            />
          </div>
        </div>
        <div className="topbar-center">
          <div className="node-library-inline">
            <span className="node-lib-label">添加结点:</span>
            <button className="node-btn node-btn-start" onClick={() => addNode('start', '开始', 100, 150)}>
              开始
            </button>
            <button className="node-btn node-btn-end" onClick={() => addNode('end', '结束', 100, 150)}>
              结束
            </button>
            <button className="node-btn node-btn-dp" onClick={() => addNode('dataProcessing', '数据处理', 200, 150)}>
              数据处理
            </button>
            {publishedNodes.map((node) => (
              <button 
                key={node.id}
                className="node-btn"
                onClick={() => addNode('default', node.title, 100, 150, node.elements)}
              >
                {node.title}
              </button>
            ))}
          </div>
        </div>
        <div className="topbar-right">
          <button className="action-btn save-btn" onClick={saveFlow} disabled={loading}>
            {loading ? '...' : '保存'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`message ${message.includes('成功') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
      
      {/* 工作流编辑区域 */}
      <div className="flow-editor-body">
        <div className="flow-container">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            defaultEdgeOptions={{ type: 'smoothstep', animated: true }}
          >
            <Controls />
            <Background variant="dots" gap={20} size={1} />
            <MiniMap 
              nodeStrokeWidth={2}
              style={{ height: 80, width: 120 }}
            />
          </ReactFlow>
        </div>

        {/* 右侧配置面板 */}
        {currentSelectedNode && (
          <ConfigPanel
            node={currentSelectedNode}
            onConfigChange={handleDataProcessingConfigChange}
            onElementsChange={handleDefaultNodeConfigChange}
            onClose={() => setSelectedNode(null)}
            onSave={saveFlow}
          />
        )}
      </div>
    </div>
  );
};

export default FlowEditorPage;
