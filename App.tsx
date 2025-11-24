import React, { useState, useEffect } from 'react';
import { User, REQUIRED_PASSWORD, ProjectData, Column, INITIAL_COLUMNS } from './types';
import { Button } from './components/Button';
import { 
  Plus, 
  Download, 
  LogOut, 
  LayoutDashboard, 
  Settings, 
  Trash2,
  Save,
  X,
  User as UserIcon,
  Cpu,
  Activity,
  FolderOpen
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// --- Components ---

const LoginScreen: React.FC<{ onLogin: (name: string) => void }> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === REQUIRED_PASSWORD) {
      onLogin(name);
    } else {
      setError('访问密码错误，请重试');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-slate-50 -z-20"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-transparent to-transparent -z-10"></div>
      
      <div className="bg-white/70 backdrop-blur-xl p-10 rounded-3xl shadow-2xl w-full max-w-md border border-white/50 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cyan-400 to-blue-600"></div>
        
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-brand-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-brand-500/30 transform -rotate-6 animate-float">
             <Cpu className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-700 to-cyan-600 mb-2">
            EngiTrack Pro
          </h1>
          <p className="text-slate-500 text-lg font-medium">工程项目智能统计系统</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-slate-700 ml-1">姓名</label>
            <input 
              type="text" 
              required
              className="w-full px-5 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all hover:bg-white text-base"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入您的姓名"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-slate-700 ml-1">密码</label>
            <input 
              type="password" 
              required
              className="w-full px-5 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all hover:bg-white text-base"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入系统访问密码"
            />
          </div>
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center animate-pulse">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
              {error}
            </div>
          )}
          <Button type="submit" variant="tech" className="w-full justify-center text-lg py-3 shadow-xl">
            进入系统
          </Button>
        </form>
      </div>
    </div>
  );
};

// --- Main App ---

function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('engi_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [projects, setProjects] = useState<ProjectData[]>(() => {
    const saved = localStorage.getItem('engi_projects');
    return saved ? JSON.parse(saved) : [];
  });

  const [columns, setColumns] = useState<Column[]>(() => {
    const saved = localStorage.getItem('engi_columns');
    return saved ? JSON.parse(saved) : INITIAL_COLUMNS;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectData | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (user) localStorage.setItem('engi_user', JSON.stringify(user));
    else localStorage.removeItem('engi_user');
  }, [user]);

  useEffect(() => {
    localStorage.setItem('engi_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('engi_columns', JSON.stringify(columns));
  }, [columns]);

  const handleLogin = (username: string) => {
    setUser({ username, isLoggedIn: true });
  };

  const handleLogout = () => {
    setUser(null);
  };

  // --- CRUD Operations ---

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这条记录吗？')) {
      setProjects(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    
    if (editingProject) {
      setProjects(prev => prev.map(p => p.id === editingProject.id ? { ...formData, id: p.id, createdBy: p.createdBy, createdAt: p.createdAt } as ProjectData : p));
    } else {
      const newProject: ProjectData = {
        id: crypto.randomUUID(),
        createdBy: user!.username,
        createdAt: now,
        ...formData
      } as ProjectData;
      setProjects(prev => [newProject, ...prev]);
    }
    closeModal();
  };

  const openModal = (project?: ProjectData) => {
    if (project) {
      setEditingProject(project);
      setFormData(project);
    } else {
      setEditingProject(null);
      setFormData({});
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
    setFormData({});
  };

  // --- Column Management ---

  const [newColumnName, setNewColumnName] = useState('');
  const handleAddColumn = () => {
    if (!newColumnName.trim()) return;
    const newKey = `custom_${Date.now()}`;
    const newCol: Column = { key: newKey, label: newColumnName, type: 'text' };
    setColumns(prev => [...prev, newCol]);
    setNewColumnName('');
  };

  // --- Export ---

  const handleExport = () => {
    const dataToExport = projects.map(p => {
      const row: Record<string, any> = {};
      row['录入人'] = p.createdBy;
      row['录入时间'] = new Date(p.createdAt).toLocaleDateString();
      columns.forEach(col => {
        row[col.label] = p[col.key];
      });
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Projects");
    XLSX.writeFile(wb, `Engineering_Projects_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // --- Stats Data Prep ---
  const stats = React.useMemo(() => {
    const methodCounts: Record<string, number> = {};
    const userCounts: Record<string, number> = {};
    let totalOutlineQty = 0;

    projects.forEach(p => {
      const method = p.method || '未分类';
      methodCounts[method] = (methodCounts[method] || 0) + 1;

      const author = p.createdBy || 'Unknown';
      userCounts[author] = (userCounts[author] || 0) + 1;

      if (p.outlineQty) totalOutlineQty += Number(p.outlineQty);
    });

    const methodData = Object.entries(methodCounts).map(([name, value]) => ({ name, value }));
    const userData = Object.entries(userCounts).map(([name, value]) => ({ name, value }));

    return { methodData, userData, totalOutlineQty, totalProjects: projects.length };
  }, [projects]);

  const COLORS = ['#3b82f6', '#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  if (!user) return <LoginScreen onLogin={handleLogin} />;

  return (
    <div className="min-h-screen flex flex-col relative">
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-white/50 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-brand-600 to-cyan-500 p-2 rounded-xl shadow-lg shadow-brand-500/20">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 hidden sm:block">EngiTrack Pro</h1>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">智能工程统计系统</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-100/50 rounded-full border border-slate-200/50 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-brand-200 to-cyan-200 flex items-center justify-center border border-white">
                <UserIcon className="w-5 h-5 text-brand-700" />
              </div>
              <span className="text-base font-semibold text-slate-700">{user.username}</span>
            </div>
            <Button variant="ghost" onClick={handleLogout} className="text-base text-slate-500 hover:text-red-500 hover:bg-red-50">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Summary Cards */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-card p-6 rounded-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
              <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <FolderOpen className="w-24 h-24 text-brand-600" />
              </div>
              <h3 className="text-base font-semibold text-slate-500 mb-1">总项目数</h3>
              <p className="text-5xl font-bold text-slate-800 tracking-tight">{stats.totalProjects}</p>
              <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-brand-500 w-full animate-pulse"></div>
              </div>
            </div>
            <div className="glass-card p-6 rounded-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
              <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <Activity className="w-24 h-24 text-emerald-600" />
              </div>
              <h3 className="text-base font-semibold text-slate-500 mb-1">物探大纲总量 (km)</h3>
              <p className="text-5xl font-bold text-emerald-600 tracking-tight">{stats.totalOutlineQty.toFixed(2)}</p>
              <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-full animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* User Contribution Chart */}
          <div className="lg:col-span-2 glass-card p-6 rounded-2xl flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-brand-500 rounded-full"></span>
              成员贡献统计
            </h3>
            <div className="flex-1 min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.userData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" fontSize={14} tick={{fill: '#64748b'}} axisLine={false} tickLine={false} dy={10} />
                  <YAxis fontSize={14} allowDecimals={false} tick={{fill: '#64748b'}} axisLine={false} tickLine={false} dx={-10} />
                  <Tooltip 
                    cursor={{fill: '#f1f5f9'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', background: 'rgba(255,255,255,0.9)' }}
                  />
                  <Bar dataKey="value" fill="url(#colorGradient)" radius={[6, 6, 0, 0]} name="录入数量" maxBarSize={60}>
                     { stats.userData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Method Distribution Chart */}
          <div className="lg:col-span-1 glass-card p-6 rounded-2xl flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-cyan-500 rounded-full"></span>
              实施方法
            </h3>
            <div className="flex-1 min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.methodData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.methodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="white" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}/>
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '12px'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Data Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 glass-card p-5 rounded-2xl">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
            <div className="bg-brand-100 p-2 rounded-lg">
              <LayoutDashboard className="w-6 h-6 text-brand-600" />
            </div>
            项目明细
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => setIsColumnModalOpen(true)}>
              <Settings className="w-5 h-5" /> 管理列
            </Button>
            <Button variant="secondary" onClick={handleExport}>
              <Download className="w-5 h-5" /> 导出 Excel
            </Button>
            <Button variant="tech" onClick={() => openModal()}>
              <Plus className="w-5 h-5" /> 新增项目
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <div className="glass-card rounded-2xl overflow-hidden shadow-lg shadow-slate-200/50">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/80 backdrop-blur-sm">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-600 uppercase tracking-wider sticky left-0 bg-slate-50 z-20 w-28 shadow-sm">
                    操作
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-600 uppercase tracking-wider">
                    录入人
                  </th>
                  {columns.map(col => (
                    <th key={col.key} className="px-6 py-4 text-left text-sm font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white/40 divide-y divide-slate-100">
                {projects.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 2} className="px-6 py-16 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-3">
                        <FolderOpen className="w-12 h-12 text-slate-300" />
                        <span className="text-lg">暂无数据，点击"新增项目"开始录入</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  projects.map(project => (
                    <tr key={project.id} className="hover:bg-blue-50/50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium sticky left-0 bg-white group-hover:bg-blue-50/50 z-10 flex gap-3 border-r border-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                        <button onClick={() => openModal(project)} className="text-brand-600 hover:text-brand-800 font-semibold transition-colors">编辑</button>
                        <button onClick={() => handleDelete(project.id)} className="text-red-500 hover:text-red-700 font-semibold transition-colors">删除</button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-base text-slate-800 font-medium">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-600 shadow-sm">
                          {project.createdBy}
                        </span>
                      </td>
                      {columns.map(col => (
                        <td key={col.key} className="px-6 py-4 whitespace-nowrap text-base text-slate-600">
                           {project[col.key]}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto backdrop-blur-sm bg-slate-900/30">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={closeModal}>
              <div className="absolute inset-0 bg-slate-900/20"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white/90 backdrop-blur-xl rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full border border-white/60">
              <div className="px-6 pt-6 pb-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <div className="p-2 bg-brand-100 rounded-lg">
                      <FolderOpen className="w-5 h-5 text-brand-600" />
                    </div>
                    {editingProject ? '编辑项目' : '新增项目'}
                  </h3>
                  <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Form Fields */}
                <form id="projectForm" onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {columns.map(col => (
                    <div key={col.key} className="group">
                      <label className="block text-sm font-semibold text-slate-600 mb-2 ml-1 group-focus-within:text-brand-600 transition-colors">
                        {col.label} {col.required && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type={col.type === 'date' ? 'date' : (col.type === 'number' ? 'number' : 'text')}
                        step={col.type === 'number' ? "any" : undefined}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-brand-100 focus:border-brand-500 outline-none text-base transition-all shadow-sm hover:border-slate-300"
                        value={formData[col.key] || ''}
                        onChange={(e) => setFormData({...formData, [col.key]: e.target.value})}
                        required={col.required}
                        placeholder={`请输入${col.label}`}
                      />
                    </div>
                  ))}
                </form>
              </div>
              <div className="bg-slate-50/80 backdrop-blur-sm px-6 py-5 sm:flex sm:flex-row-reverse border-t border-slate-100">
                <Button type="submit" form="projectForm" className="w-full sm:w-auto sm:ml-3 shadow-lg shadow-brand-500/20">
                  <Save className="w-5 h-5 mr-2" /> 保存项目
                </Button>
                <Button variant="secondary" onClick={closeModal} className="w-full sm:w-auto mt-3 sm:mt-0">
                  取消
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Column Manager Modal */}
      {isColumnModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto backdrop-blur-sm bg-slate-900/30">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setIsColumnModalOpen(false)}>
              <div className="absolute inset-0 bg-slate-900/20"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white/90 backdrop-blur-xl rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-white/60">
              <div className="px-6 py-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-800">管理表格列</h3>
                  <button onClick={() => setIsColumnModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-6 h-6 text-slate-500" /></button>
                </div>
                
                <div className="space-y-3 max-h-[60vh] overflow-y-auto mb-6 pr-2 custom-scrollbar">
                  {columns.map((col, idx) => (
                    <div key={col.key} className="flex items-center justify-between p-3 bg-white/60 rounded-xl border border-slate-100 hover:border-brand-200 transition-colors shadow-sm">
                      <span className="text-base font-medium text-slate-700">{col.label}</span>
                      {!col.required && (
                        <button 
                          onClick={() => setColumns(prev => prev.filter(c => c.key !== col.key))}
                          className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="删除列"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      {col.required && <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded-md">系统必填</span>}
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-slate-200">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">添加新列</label>
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      placeholder="输入列名 (如: 备注3)" 
                      className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-4 focus:ring-brand-100 focus:border-brand-500 outline-none text-base"
                      value={newColumnName}
                      onChange={(e) => setNewColumnName(e.target.value)}
                    />
                    <Button onClick={handleAddColumn} disabled={!newColumnName.trim()} variant="tech">
                      添加
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;