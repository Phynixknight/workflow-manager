import React from 'react';
import { Handle } from 'reactflow';
import './DataProcessingNode.css';

// 数据处理功能配置数据 - 15个一级功能，65个二级功能及其参数
const DATA_PROCESSING_FUNCTIONS = [
  {
    id: 'data-acquisition',
    step: '1.数据获取',
    purpose: '从多系统拉取原始数据',
    functions: [
      { name: '文件系统获取数据:csv，txt，excel等', params: ['文件路径', '文件类型', '编码格式', '分隔符'] },
      { name: '数据库/数据系统', params: ['数据库类型', '连接地址', 'SQL查询语句', '表名'] },
      { name: '多系统表融合', params: ['融合方式(join/union)', '关联键', '数据源列表'] },
    ],
  },
  {
    id: 'data-dictionary',
    step: '2.数据字典/元数据检查',
    purpose: '字段含义统一',
    functions: [
      { name: '检查字段格式/长度/类型等', params: ['目标字段', '期望类型', '最大长度'] },
      { name: '统一字段格式', params: ['目标字段', '目标格式', '转换规则'] },
      { name: '建立指标映射表', params: ['源字段名', '目标字段名', '映射规则'] },
      { name: '检查字段结构变更', params: ['基准版本', '对比版本'] },
    ],
  },
  {
    id: 'primary-key',
    step: '3.主键设计',
    purpose: '解决"同一时间多条记录"问题',
    functions: [
      { name: '排序', params: ['排序字段', '排序方式(升序/降序)'] },
      { name: '去重', params: ['去重字段', '保留策略(first/last)'] },
    ],
  },
  {
    id: 'data-quality',
    step: '4.数据质量检查',
    purpose: '检查数据质量',
    functions: [
      { name: '统计缺失比例', params: ['目标字段', '缺失阈值(%)'] },
      { name: '数值变量分布', params: ['目标字段', '分布类型'] },
      { name: '分类变量频数', params: ['目标字段', '最小频数'] },
      { name: '极端值与分位数', params: ['目标字段', '分位数范围'] },
    ],
  },
  {
    id: 'missing-value',
    step: '5.缺失值处理',
    purpose: '对缺失值进行指定操作',
    functions: [
      { name: '均值填补', params: ['目标字段'] },
      { name: '中位数填补', params: ['目标字段'] },
      { name: '固定值填补', params: ['目标字段', '填补值'] },
      { name: '分组内填补', params: ['目标字段', '分组字段', '填补方法'] },
      { name: '多重插补', params: ['目标字段', '插补次数', '模型类型'] },
      { name: '时间序列差值', params: ['目标字段', '时间字段', '插值方法'] },
      { name: '前向填充', params: ['目标字段', '最大填充步数'] },
      { name: '保留缺失标识', params: ['目标字段', '标识列名'] },
    ],
  },
  {
    id: 'outlier',
    step: '6.异常值处理',
    purpose: '对异常数据进行处理',
    functions: [
      { name: '物理范围校验', params: ['目标字段', '最小值', '最大值'] },
      { name: '监管限制校验', params: ['目标字段', '限制规则'] },
      { name: '分位数截尾', params: ['目标字段', '下分位数', '上分位数'] },
      { name: 'Winsor分箱/截尾', params: ['目标字段', '截尾比例(%)'] },
      { name: '识别平线值/跳变值', params: ['目标字段', '平线阈值', '跳变阈值'] },
      { name: '保留/标记异常值', params: ['目标字段', '标记列名', '处理方式'] },
    ],
  },
  {
    id: 'timestamp',
    step: '7.时间戳标准化',
    purpose: '多数据来源的数据易产生时间单位错乱问题',
    functions: [
      { name: '时间日期拆分', params: ['时间字段', '拆分粒度(年/月/日/时/分/秒)'] },
      { name: '时间间隔', params: ['起始时间字段', '结束时间字段', '单位'] },
      { name: '计算时间差', params: ['时间字段A', '时间字段B', '输出单位'] },
      { name: '统一格式', params: ['时间字段', '目标格式', '时区'] },
    ],
  },
  {
    id: 'time-alignment',
    step: '8.时间粒度对齐',
    purpose: '统一多来源的时间',
    functions: [
      { name: '按分/时/天/自定义方式聚合：取均值', params: ['时间字段', '聚合粒度', '目标字段'] },
      { name: '按分/时/天/自定义方式聚合：取累计', params: ['时间字段', '聚合粒度', '目标字段'] },
      { name: '按分/时/天/自定义方式聚合：取极值', params: ['时间字段', '聚合粒度', '目标字段', '极值类型(max/min)'] },
      { name: '生成时间序列', params: ['起始时间', '结束时间', '频率'] },
      { name: '缺失时间点补齐', params: ['时间字段', '频率', '填充方法'] },
    ],
  },
  {
    id: 'transpose',
    step: '9.数据表转置',
    purpose: '长表转宽表/宽表转长表',
    functions: [
      { name: '形状转置', params: ['转置方向(长转宽/宽转长)', '索引列', '值列'] },
      { name: '变量统一前缀', params: ['前缀名', '目标字段列表'] },
    ],
  },
  {
    id: 'lag-feature',
    step: '10.滞后特征处理',
    purpose: '对数据的滞后列处理',
    functions: [
      { name: '滞后值复原', params: ['目标字段', '滞后步数'] },
      { name: '防跨组串值', params: ['目标字段', '分组字段'] },
      { name: '分组滞后', params: ['目标字段', '分组字段', '滞后步数'] },
    ],
  },
  {
    id: 'rolling-window',
    step: '11.滚动窗口特征',
    purpose: '对数据的过去窗口期统计分析',
    functions: [
      { name: '过去6小时均值', params: ['目标字段', '时间字段'] },
      { name: '过去24小时累计值', params: ['目标字段', '时间字段'] },
      { name: '过去12小时波动', params: ['目标字段', '时间字段'] },
      { name: '移动最大/最小', params: ['目标字段', '窗口大小', '类型(max/min)'] },
      { name: '自定义复杂窗口', params: ['目标字段', '窗口大小', '窗口函数', '时间字段'] },
    ],
  },
  {
    id: 'correlation',
    step: '12.相关性分析',
    purpose: '指标间相关性检验',
    functions: [
      { name: '单-单：Pearson线性相关', params: ['变量X', '变量Y', '显著性水平'] },
      { name: '单-单：Spearman秩相关', params: ['变量X', '变量Y', '显著性水平'] },
      { name: '单-单：Kendall相关', params: ['变量X', '变量Y', '显著性水平'] },
      { name: '多-多：典型相关性分析', params: ['变量组X', '变量组Y', '维度数'] },
    ],
  },
  {
    id: 'multicollinearity',
    step: '13.多重共线性检查',
    purpose: '分析目标间共线性',
    functions: [
      { name: 'VIF方差膨胀因子', params: ['目标变量列表', 'VIF阈值'] },
      { name: '容忍度', params: ['目标变量列表', '容忍度阈值'] },
      { name: '条件指数', params: ['目标变量列表', '条件指数阈值'] },
      { name: '变量聚类', params: ['目标变量列表', '聚类数', '相似度阈值'] },
      { name: '高相关性变量删除', params: ['目标变量列表', '相关系数阈值'] },
    ],
  },
  {
    id: 'data-cleaning',
    step: '14.数据整理',
    purpose: '标准化，归一化，分箱等',
    functions: [
      { name: 'Z-score标准化', params: ['目标字段'] },
      { name: '极差归一化', params: ['目标字段', '目标范围(min)', '目标范围(max)'] },
      { name: 'IQR稳健标准化', params: ['目标字段'] },
      { name: 'log变换', params: ['目标字段', '底数', '偏移量'] },
      { name: '分位数分箱', params: ['目标字段', '分箱数'] },
      { name: '高性能分箱', params: ['目标字段', '分箱方法', '最大分箱数'] },
    ],
  },
  {
    id: 'data-split',
    step: '15.数据切分',
    purpose: '切割数据为训练/验证/测试集',
    functions: [
      { name: '时间序列切分', params: ['时间字段', '训练集截止时间', '验证集截止时间'] },
      { name: '随机抽样切分', params: ['训练集比例(%)', '验证集比例(%)', '随机种子'] },
      { name: '分层抽样', params: ['分层字段', '训练集比例(%)', '随机种子'] },
    ],
  },
];

// 结点在画布上的紧凑展示
const DataProcessingNode = ({ data, id }) => {
  const selectedFunctions = data.config?.selectedFunctions || [];

  return (
    <div className="node-data-processing">
      <Handle type="source" position="top" id={`${id}-anchor-0`} style={{ background: '#4caf50' }} />
      <Handle type="source" position="right" id={`${id}-anchor-2`} style={{ background: '#4caf50' }} />
      <Handle type="target" position="bottom" id={`${id}-anchor-1`} style={{ background: '#f44336' }} />
      <Handle type="target" position="left" id={`${id}-anchor-3`} style={{ background: '#f44336' }} />

      <div className="dp-node-inner">
        <div className="dp-header">
          <span className="dp-title">{data.label}</span>
        </div>
        <div className="dp-badge-bar">
          <span className="dp-badge">{selectedFunctions.length} 个功能已配置</span>
          <span className="dp-hint">点击配置 →</span>
        </div>
        {selectedFunctions.length > 0 && (
          <div className="dp-mini-list">
            {selectedFunctions.slice(0, 4).map((f, i) => (
              <div key={i} className="dp-mini-item">
                <span className="dp-mini-cat">{f.categoryName}</span>
                <span className="dp-mini-func">{f.functionName}</span>
              </div>
            ))}
            {selectedFunctions.length > 4 && (
              <div className="dp-mini-more">+{selectedFunctions.length - 4} 更多...</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export { DATA_PROCESSING_FUNCTIONS };
export default DataProcessingNode;
