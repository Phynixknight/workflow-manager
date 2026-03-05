import React, { useState, useCallback, useEffect } from 'react';
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

// 节点类型
const nodeTypes = {
  default: ({ data, id }) => (
    <div className="node-default">
      {/* 顶部锚点 */}
      <Handle
        type="source"
        position="top"
        id={`${id}-anchor-0`}
        style={{ background: '#4caf50' }}
      />
      
      {/* 右侧锚点 */}
      <Handle
        type="source"
        position="right"
        id={`${id}-anchor-2`}
        style={{ background: '#4caf50' }}
      />
      
      {/* 底部锚点 */}
      <Handle
        type="target"
        position="bottom"
        id={`${id}-anchor-1`}
        style={{ background: '#f44336' }}
      />
      
      {/* 左侧锚点 */}
      <Handle
        type="target"
        position="left"
        id={`${id}-anchor-3`}
        style={{ background: '#f44336' }}
      />
      
      <div className="node-content-wrapper">
        <div className="node-header">{data.label}</div>
        <div className="node-content">
          {data.elements && data.elements.map((element, index) => (
            <div key={index} className="node-element">
              {element.type === 'banner' && <h3>{element.title}</h3>}
              {element.type === 'label' && (
                <div>
                  <span>{element.title}: </span>
                  <span>{element.value}</span>
                </div>
              )}
              {element.type === 'text' && <input type="text" placeholder="输入文本" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
  start: ({ data, id }) => (
    <div className="node-start">
      {/* 顶部锚点 */}
      <Handle
        type="source"
        position="top"
        id={`${id}-anchor-0`}
        style={{ background: '#4caf50' }}
      />
      
      {/* 右侧锚点 */}
      <Handle
        type="source"
        position="right"
        id={`${id}-anchor-2`}
        style={{ background: '#4caf50' }}
      />
      
      {/* 底部锚点 */}
      <Handle
        type="target"
        position="bottom"
        id={`${id}-anchor-1`}
        style={{ background: '#f44336' }}
      />
      
      {/* 左侧锚点 */}
      <Handle
        type="target"
        position="left"
        id={`${id}-anchor-3`}
        style={{ background: '#f44336' }}
      />
      
      <div className="node-content-wrapper">
        <div className="node-header">{data.label}</div>
      </div>
    </div>
  ),
  end: ({ data, id }) => (
    <div className="node-end">
      {/* 顶部锚点 */}
      <Handle
        type="source"
        position="top"
        id={`${id}-anchor-0`}
        style={{ background: '#4caf50' }}
      />
      
      {/* 右侧锚点 */}
      <Handle
        type="source"
        position="right"
        id={`${id}-anchor-2`}
        style={{ background: '#4caf50' }}
      />
      
      {/* 底部锚点 */}
      <Handle
        type="target"
        position="bottom"
        id={`${id}-anchor-1`}
        style={{ background: '#f44336' }}
      />
      
      {/* 左侧锚点 */}
      <Handle
        type="target"
        position="left"
        id={`${id}-anchor-3`}
        style={{ background: '#f44336' }}
      />
      
      <div className="node-content-wrapper">
        <div className="node-header">{data.label}</div>
      </div>
    </div>
  ),
};

const FlowEditorPage = () => {
  // 状态管理
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [publishedNodes, setPublishedNodes] = useState([]);
  const [flowId, setFlowId] = useState('flow-1');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // 加载已发布节点
  useEffect(() => {
    const loadPublishedNodes = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/node/published');
        if (response.ok) {
          const data = await response.json();
          setPublishedNodes(data.nodes);
        }
      } catch (error) {
        console.error('加载已发布节点失败:', error);
      }
    };
    loadPublishedNodes();
  }, []);

  // 处理连线
  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge(params, eds));
  }, [setEdges]);

  // 添加节点
  const addNode = useCallback((nodeType, label, x, y, elements = []) => {
    const nodeId = `node-${Date.now()}`;
    const newNode = {
      id: nodeId,
      type: nodeType,
      position: { x, y },
      data: {
        label,
        elements,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  // 生成JSON
  const generateJSON = useCallback(() => {
    // 转换为后端需要的格式
    const graphData = {
      id: flowId,
      nodes: nodes.map((node) => ({
        id: node.id,
        title: node.data.label,
        type: node.type,
        hash: node.id, // 简化处理
        anchors: [
          { id: `${node.id}-anchor-0`, title: '' },
          { id: `${node.id}-anchor-1`, title: '' },
          { id: `${node.id}-anchor-2`, title: '' },
          { id: `${node.id}-anchor-3`, title: '' },
        ],
        elements: node.data.elements || [],
      })),
      edges: edges.map((edge) => ({
        id: edge.id,
        start: edge.sourceHandle || `${edge.source}-anchor-2`, // 默认使用东边锚点
        end: edge.targetHandle || `${edge.target}-anchor-3`,   // 默认使用西边锚点
      })),
    };
    
    const jsonString = JSON.stringify(graphData, null, 2);
    console.log('Generated JSON:', jsonString);
    // 可以在这里将JSON发送到后端
    alert('JSON已生成，查看控制台');
    return graphData;
  }, [nodes, edges, flowId]);

  // 保存流程图
  const saveFlow = useCallback(async () => {
    try {
      setLoading(true);
      setMessage('');
      const graphData = generateJSON();
      
      const response = await fetch('http://localhost:8000/api/flow/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(graphData),
      });
      
      if (!response.ok) {
        throw new Error('保存失败');
      }
      
      const data = await response.json();
      setMessage('保存成功');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`保存失败: ${error.message}`);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  }, [generateJSON]);

  // 加载流程图
  const loadFlow = useCallback(async () => {
    try {
      setLoading(true);
      setMessage('');
      
      const response = await fetch(`http://localhost:8000/api/flow/load/${flowId}`);
      
      if (!response.ok) {
        throw new Error('加载失败');
      }
      
      const data = await response.json();
      
      // 转换为React Flow需要的格式
      const reactFlowNodes = data.nodes.map((node) => ({
        id: node.id,
        type: node.type,
        position: { x: 100, y: 100 }, // 默认位置
        data: {
          label: node.title,
          elements: node.elements || [],
        },
      }));
      
      const reactFlowEdges = data.edges.map((edge) => ({
        id: edge.id,
        source: edge.start.split('-anchor-')[0],
        target: edge.end.split('-anchor-')[0],
        sourceHandle: edge.start,
        targetHandle: edge.end,
      }));
      
      setNodes(reactFlowNodes);
      setEdges(reactFlowEdges);
      setMessage('加载成功');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`加载失败: ${error.message}`);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  }, [flowId, setNodes, setEdges]);

  // 发布流程图
  const publishFlow = useCallback(async () => {
    try {
      setLoading(true);
      setMessage('');
      
      // 先保存
      const graphData = generateJSON();
      const saveResponse = await fetch('http://localhost:8000/api/flow/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(graphData),
      });
      
      if (!saveResponse.ok) {
        throw new Error('保存失败');
      }
      
      // 再发布
      const publishResponse = await fetch(`http://localhost:8000/api/flow/publish/${flowId}`, {
        method: 'POST',
      });
      
      if (!publishResponse.ok) {
        throw new Error('发布失败');
      }
      
      const data = await publishResponse.json();
      setMessage('发布成功');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`发布失败: ${error.message}`);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  }, [flowId, generateJSON]);

  return (
    <div className="flow-editor-page">
      {message && (
        <div className={`message ${message.includes('成功') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
      
      <div className="flow-editor-container">
        {/* 工具栏 */}
        <div className="toolbar">
          <div className="flow-id-input">
            <label>流程图ID: </label>
            <input 
              type="text" 
              value={flowId} 
              onChange={(e) => setFlowId(e.target.value)} 
              placeholder="输入流程图ID"
            />
          </div>
          
          <div className="node-library">
            <h3>节点库</h3>
            <div className="node-items">
              <button onClick={() => addNode('start', '起始节点', 100, 100)}>
                起始节点
              </button>
              <button onClick={() => addNode('end', '结束节点', 100, 200)}>
                结束节点
              </button>
              {publishedNodes.map((node) => (
                <button 
                  key={node.id} 
                  onClick={() => addNode(node.type, node.title, 100, 100 + publishedNodes.indexOf(node) * 100, node.elements)}
                >
                  {node.title}
                </button>
              ))}
            </div>
          </div>
          
          <div className="action-buttons">
            <button onClick={saveFlow} disabled={loading}>
              {loading ? '保存中...' : '保存'}
            </button>
            <button onClick={publishFlow} disabled={loading}>
              {loading ? '发布中...' : '发布'}
            </button>
          </div>
        </div>
        
        {/* 流程图编辑区域 */}
        <div className="flow-container">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
          >
            <Controls />
            <Background variant="dots" gap={16} size={1} />
            <MiniMap />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
};

export default FlowEditorPage;