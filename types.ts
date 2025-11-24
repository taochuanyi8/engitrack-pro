export interface User {
  username: string;
  isLoggedIn: boolean;
}

export interface Column {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date';
  required?: boolean;
}

export interface ProjectData {
  id: string;
  createdBy: string;
  createdAt: string;
  [key: string]: any; // Allows for dynamic fields
}

export const REQUIRED_PASSWORD = "crdcwutan";

export const INITIAL_COLUMNS: Column[] = [
  { key: 'projectName', label: '项目名称', type: 'text', required: true },
  { key: 'projectCode', label: '项目编码', type: 'text' },
  { key: 'stageName', label: '阶段名称', type: 'text' },
  { key: 'outlineQty', label: '物探大纲量(km)', type: 'number' },
  { key: 'siteName', label: '工点名称', type: 'text' },
  { key: 'difficultyCoef', label: '特殊困难系数', type: 'number' },
  { key: 'method', label: '实施方法', type: 'text' },
  { key: 'length', label: '测线长度(m)', type: 'number' },
  { key: 'area', label: '面积(m^2)', type: 'number' },
  { key: 'standardPoints', label: '标准点(点)', type: 'number' },
  { key: 'completionTime', label: '完成时间', type: 'date' },
  { key: 'convertedMethod', label: '折算后物探方法', type: 'text' },
  { key: 'convertedLength', label: '折算测线长度(km)', type: 'number' },
  { key: 'remark1', label: '备注1', type: 'text' },
  { key: 'remark2', label: '备注2', type: 'text' },
];