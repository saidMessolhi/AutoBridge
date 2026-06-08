import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DashboardShell } from '../../components/layout/DashboardShell';
import { dbSync } from '../../services/dbSync';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Mail, 
  Search,
  CheckCircle2,
  XCircle,
  Key,
  Power,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  UserCheck,
  AlertCircle,
  X,
  FileText
} from 'lucide-react';
import { cn } from '../../lib/utils';

export function UsersManagement() {
  const [activeTab, setActiveTab] = React.useState<'staff' | 'clients'>('staff');
  const [allUsers, setAllUsers] = React.useState<any[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  
  // Modals state
  const [selectedUser, setSelectedUser] = React.useState<any | null>(null);
  const [isManageModalOpen, setIsManageModalOpen] = React.useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

  // Create User state
  const [newUserName, setNewUserName] = React.useState('');
  const [newUserEmail, setNewUserEmail] = React.useState('');
  const [newUserPassword, setNewUserPassword] = React.useState('');
  const [newUserRole, setNewUserRole] = React.useState('');
  const [newUserOrderId, setNewUserOrderId] = React.useState('');

  // Password Visibility state
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);

  // Manage Account state
  const [mgmtPassword, setMgmtPassword] = React.useState('');
  const [mgmtStatus, setMgmtStatus] = React.useState('');

  // Fallback default seeded accounts to merge in case Firestore has partial or no listings
  const defaultAccounts = React.useMemo(() => [
    { id: 'u-1', username: 'admin@autobridge.dz', password: 'PASSWORD123', role: 'المدير العام', name: 'أحمد بن علي', email: 'admin@autobridge.dz', status: 'نشط', lastActive: 'الآن', joinDate: '2024-05-01' },
    { id: 'u-2', username: 'china@autobridge.dz', password: 'PASSWORD123', role: 'مسؤول الصين', name: 'Zhi Chen', email: 'china@autobridge.dz', status: 'نشط', lastActive: 'قبل دقيقتين', joinDate: '2024-05-01' },
    { id: 'u-3', username: 'logistics@autobridge.dz', password: 'PASSWORD123', role: 'مسؤول اللوجستيك', name: 'سيد علي بوزيد', email: 'logistics@autobridge.dz', status: 'نشط', lastActive: 'قبل ساعة', joinDate: '2024-05-01' },
    { id: 'u-4', username: 'customs@autobridge.dz', password: 'PASSWORD123', role: 'المخلص الجمركي', name: 'عمر قدور', email: 'customs@autobridge.dz', status: 'نشط', lastActive: 'قبل ساعتين', joinDate: '2024-05-01' },
    { id: 'u-5', username: 'finance@autobridge.dz', password: 'PASSWORD123', role: 'المحاسب', name: 'ياسين بلقاسم', email: 'finance@autobridge.dz', status: 'نشط', lastActive: 'قبل يوم', joinDate: '2024-05-01' },
    { id: 'u-6', username: 'reception@autobridge.dz', password: 'PASSWORD123', role: 'عون استقبال / مسؤول ملفات', name: 'سارة بن جابر', email: 'reception@autobridge.dz', status: 'نشط', lastActive: 'قبل 4 ساعات', joinDate: '2024-05-01' },
    { id: 'u-7', username: 'client@gmail.com', password: 'PASSWORD123', role: 'زبون استيراد', name: 'محمد فوزي', email: 'client@gmail.com', orderId: '1', status: 'نشط', lastActive: 'قبل يومين', joinDate: '2024-05-01' },
    { id: 'u-8', username: 'yassine@gmail.com', password: 'PASSWORD123', role: 'زبون استيراد', name: 'ياسين كريم', email: 'yassine@gmail.com', orderId: '2', status: 'نشط', lastActive: 'قبل 3 أيام', joinDate: '2024-05-05' }
  ], []);

  React.useEffect(() => {
    const unsubscribe = dbSync.subscribeToPortalUsers((portalUsers) => {
      // Merge Firestore dynamic users with default list to handle any setup gaps
      const merged = [...portalUsers];
      
      defaultAccounts.forEach((def) => {
        const foundIndex = merged.findIndex(
          u => (u.username || '').toLowerCase() === def.username.toLowerCase() || 
               (u.email || '').toLowerCase() === def.email.toLowerCase()
        );
        if (foundIndex === -1) {
          merged.push(def);
        } else {
          merged[foundIndex] = {
            ...def,
            ...merged[foundIndex],
            name: merged[foundIndex].name || merged[foundIndex].clientName || def.name,
            email: merged[foundIndex].email || merged[foundIndex].username || def.email,
            status: merged[foundIndex].status || def.status || 'نشط'
          };
        }
      });
      
      setAllUsers(merged);
    });

    return () => unsubscribe();
  }, [defaultAccounts]);

  // Handle Quick status toggle (Deactivate/Reactivate) directly on row click
  const handleQuickStatusToggle = async (user: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = user.status === 'نشط' ? 'موقف' : 'نشط';
    const updatedUser = {
      ...user,
      status: newStatus
    };
    await dbSync.savePortalUser(updatedUser);
  };

  // Open Manage modal
  const openManageModal = (user: any) => {
    setSelectedUser(user);
    setMgmtPassword('');
    setMgmtStatus(user.status || 'نشط');
    setIsManageModalOpen(true);
  };

  // Save changes from Management Modal
  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    const updatedUser = {
      ...selectedUser,
      password: mgmtPassword ? mgmtPassword : selectedUser.password,
      status: mgmtStatus,
    };

    await dbSync.savePortalUser(updatedUser);
    setIsManageModalOpen(false);
    setSelectedUser(null);
  };

  // Reset password to a generated secure string
  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!#@$%';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setMgmtPassword(pass);
  };

  // Create User account
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail || !newUserPassword) {
      alert('يُرجى ملء كافة الحقول الإلزامية.');
      return;
    }

    const assignedRole = activeTab === 'staff' ? (newUserRole || 'مسؤول اللوجستيك') : 'زبون استيراد';

    const newUser = {
      id: 'u-' + Date.now(),
      username: newUserEmail,
      email: newUserEmail,
      name: newUserName,
      clientName: newUserName,
      password: newUserPassword,
      role: assignedRole,
      status: 'نشط',
      joinDate: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD format
      lastActive: 'لم ينشط بعد',
      orderId: activeTab === 'clients' ? newUserOrderId || '1' : ''
    };

    await dbSync.savePortalUser(newUser);

    // Reset fields
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPassword('');
    setNewUserRole('');
    setNewUserOrderId('');
    setIsCreateModalOpen(false);
    setIsPasswordVisible(false);
  };

  // Filter and search calculations
  const searchedUsers = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const tabUsers = allUsers.filter(u => {
      const isClientRole = u.role === 'زبون استيراد' || u.role === 'CLIENT';
      return activeTab === 'clients' ? isClientRole : !isClientRole;
    });

    if (!query) return tabUsers;

    return tabUsers.filter(u => 
      (u.name || '').toLowerCase().includes(query) || 
      (u.email || '').toLowerCase().includes(query) || 
      (u.username || '').toLowerCase().includes(query) || 
      (u.role || '').toLowerCase().includes(query)
    );
  }, [allUsers, activeTab, searchQuery]);

  // Live dynamic statistics calculations
  const stats = React.useMemo(() => {
    const staffCount = allUsers.filter(u => u.role !== 'زبون استيراد' && u.status === 'نشط').length;
    const clientCount = allUsers.filter(u => u.role === 'زبون استيراد' && u.status === 'نشط').length;
    const deactivatedCount = allUsers.filter(u => u.status === 'موقف' || u.status === 'معلق' || u.status === 'غير نشط').length;

    return {
      activeStaff: staffCount,
      activeClients: clientCount,
      suspended: deactivatedCount
    };
  }, [allUsers]);

  const AVAILABLE_ROLES = [
    "المدير العام",
    "مسؤول الصين",
    "مسؤول اللوجستيك",
    "المخلص الجمركي",
    "المحاسب",
    "عون استقبال / مسؤول ملفات"
  ];

  return (
    <DashboardShell>
      <div className="space-y-6" dir="rtl">
        {/* Top Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">إدارة الحسابات بالموقع</h2>
            <p className="text-xs text-brand-muted mt-1 uppercase font-medium">التحكم الكامل في صلاحيات وموظفي منصة أوتو بريدج وتنشيط حسابات الزبائن</p>
          </div>
          <button 
            onClick={() => {
              setNewUserName('');
              setNewUserEmail('');
              setNewUserPassword('PASSWORD123');
              setNewUserRole('مسؤول اللوجستيك');
              setNewUserOrderId('');
              setIsCreateModalOpen(true);
            }}
            className="w-full sm:w-auto bg-slate-900 text-white px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" /> 
            {activeTab === 'staff' ? 'إضافة موظف للمنصة' : 'إنشاء حساب زبون جديد'}
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-2 p-1 bg-slate-100 w-fit rounded-xl border border-brand-border">
          <button 
            onClick={() => { setActiveTab('staff'); setSearchQuery(''); }}
            className={cn(
              "px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
              activeTab === 'staff' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            حسابات الموظفين والإدارة
          </button>
          <button 
            onClick={() => { setActiveTab('clients'); setSearchQuery(''); }}
            className={cn(
              "px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
              activeTab === 'clients' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            حسابات زبائن الاستيراد
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main User List Section */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-3xl border border-brand-border shadow-sm overflow-hidden">
              {/* Search Header */}
              <div className="p-4 border-b border-brand-border flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={activeTab === 'staff' ? "البحث عن موظف بالاسم أو البريد..." : "البحث عن زبون بالاسم أو البريد..."}
                    className="w-full pr-9 pl-4 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500 outline-none transition-all text-slate-800"
                  />
                </div>
              </div>

              {/* Table rendering list of filtered users */}
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead className="bg-slate-50/50 text-[10px] font-bold text-brand-muted uppercase tracking-widest border-b border-brand-border">
                    {activeTab === 'staff' ? (
                      <tr>
                        <th className="px-6 py-4">الموظف</th>
                        <th className="px-6 py-4">صلاحية الدور</th>
                        <th className="px-6 py-4">الحالة الأمنية</th>
                        <th className="px-6 py-4 text-left">أدوات التحكم</th>
                      </tr>
                    ) : (
                      <tr>
                        <th className="px-6 py-4">الزبون المستورد</th>
                        <th className="px-6 py-4 text-center">رقم الملف المستهدف</th>
                        <th className="px-6 py-4">تاريخ الانضمام</th>
                        <th className="px-6 py-4">حالة الحساب</th>
                        <th className="px-6 py-4 text-left">أدوات التحكم</th>
                      </tr>
                    )}
                  </thead>
                  <tbody className="divide-y divide-brand-border">
                    {searchedUsers.length > 0 ? (
                      searchedUsers.map((user) => {
                        const isActive = user.status === 'نشط';
                        return (
                          <tr key={user.id || user.username} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  "w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shadow-sm",
                                  activeTab === 'staff' 
                                    ? "bg-slate-100 text-slate-700" 
                                    : "bg-blue-50 text-blue-600"
                                )}>
                                  {(user.name || user.clientName || 'م')[0]}
                                </div>
                                <div className="leading-snug">
                                  <p className="text-xs font-black text-slate-900">{user.name || user.clientName}</p>
                                  <span className="text-[9px] text-brand-muted font-mono tracking-tighter block">{user.email || user.username}</span>
                                </div>
                              </div>
                            </td>
                            {activeTab === 'staff' ? (
                              <td className="px-6 py-4">
                                <span className="px-2 py-1 bg-slate-100 border border-slate-200/60 rounded text-[9px] font-black text-slate-600">
                                  {user.role}
                                </span>
                              </td>
                            ) : (
                              <td className="px-6 py-4 text-center">
                                <span className="text-[10px] font-bold font-mono text-blue-600 bg-blue-50/70 border border-blue-100/80 px-2 py-0.5 rounded-full">
                                  {user.orderId || 'لا يوجد ملف'}
                                </span>
                              </td>
                            )}
                            {activeTab === 'clients' && (
                              <td className="px-6 py-4">
                                <span className="text-[10px] font-bold text-slate-500 font-mono">{user.joinDate || '2024-05-15'}</span>
                              </td>
                            )}
                            <td className="px-6 py-4">
                              <div className={cn(
                                "flex items-center gap-1.5",
                                isActive ? "text-emerald-600" : "text-rose-500"
                              )}>
                                {isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                <span className="text-[10px] font-black">{isActive ? 'نشط' : 'موقف'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-left">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Reset Password Tooltip button */}
                                <button 
                                  onClick={(e) => { e.stopPropagation(); openManageModal(user); }}
                                  title="إعادة تعيين كلمة المرور والمؤشرات"
                                  className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition-all active:scale-90"
                                >
                                  <Key className="w-3.5 h-3.5" />
                                </button>
                                
                                {/* Dynamic Status Toggle button */}
                                <button 
                                  onClick={(e) => handleQuickStatusToggle(user, e)}
                                  title={isActive ? "تعطيل الحساب مؤقتاً" : "تفعيل وإعادة تشغيل الحساب"}
                                  className={cn(
                                    "p-2 rounded-lg transition-all active:scale-95 border",
                                    isActive 
                                      ? "bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-100 hover:text-rose-700" 
                                      : "bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700"
                                  )}
                                >
                                  <Power className="w-3.5 h-3.5" />
                                </button>

                                <button 
                                  onClick={() => openManageModal(user)}
                                  className="text-[9px] font-extrabold text-slate-700 hover:text-blue-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-lg mr-1 transition-all"
                                >
                                  تعديل وإدارة
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-12 text-center text-xs text-brand-muted font-bold">
                          لا توجد نتائج مطابقة لبحثك في الحسابات النشطة.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar Stats and Guide Column */}
          <div className="space-y-6">
            <div className="bg-slate-950 rounded-3xl p-6 text-white shadow-2xl shadow-slate-900/10 border border-slate-800">
              <Users className="w-8 h-8 mb-4 text-blue-500 stroke-[2]" />
              <h3 className="text-sm font-black uppercase tracking-wider mb-2">مؤشرات الأمان والنشاط</h3>
              <p className="text-[10px] text-white/50 mb-6 leading-relaxed font-semibold">مراقبة حية لوضع الحسابات المسجلة الآن في قاعدة البيانات المركزية لـ AutoBridge.</p>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                   <span className="text-[10px] text-white/60 font-bold">الموظفين النشطين</span>
                   <span className="text-sm font-bold font-mono text-blue-400">{stats.activeStaff.toString().padStart(2, '0')}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                   <span className="text-[10px] text-white/60 font-bold">الزبائن النشطين بالبوابة</span>
                   <span className="text-sm font-bold font-mono text-emerald-400">{stats.activeClients.toString().padStart(2, '0')}</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-[10px] text-white/60 font-bold">الحسابات المعلقة والموقوفة</span>
                   <span className={cn("text-sm font-bold font-mono", stats.suspended > 0 ? "text-amber-400" : "text-white/40")}>
                     {stats.suspended.toString().padStart(2, '0')}
                   </span>
                </div>
              </div>
            </div>

            <div className="bg-emerald-600 rounded-3xl p-6 text-white shadow-xl shadow-emerald-900/10">
              <Shield className="w-8 h-8 mb-4 text-emerald-100" />
              <h3 className="text-sm font-black uppercase tracking-wider mb-2">تأمين وصول الموظفين</h3>
              <p className="text-[10px] text-white/80 leading-relaxed font-bold">
                 بصفتك المدير العام، يتاح لك من خلال هذه الواجهة قفل الحسابات المشبوهة أو منتهية العمل، وتغيير كلمات المرور فورياً لمنع الاختراقات وبدء تفعيل حسابات الزبائن وتنسيق بيانات الولوج للوكل المعتمدين والموردين.
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Manage Account + Reset Password Modal */}
        <AnimatePresence>
          {isManageModalOpen && selectedUser && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm pr-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
              >
                {/* Header banner */}
                <div className="bg-slate-900 p-6 text-white text-right relative">
                  <h3 className="text-sm font-black tracking-tight flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-400" /> إدارة بيانات وصول ومعايير الحساب
                  </h3>
                  <p className="text-[9px] text-white/50 mt-1 uppercase tracking-widest font-black">Account Security Administration</p>
                  
                  <button 
                    onClick={() => { setIsManageModalOpen(false); setSelectedUser(null); }} 
                    className="absolute top-6 left-6 p-1 hover:bg-white/10 rounded-lg text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Body Form */}
                <form onSubmit={handleSaveChanges} className="p-6 space-y-4">
                  {/* Summary Info */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center font-bold text-sm text-slate-700">
                      {(selectedUser.name || selectedUser.clientName || 'م')[0]}
                    </div>
                    <div className="leading-tight">
                      <p className="text-xs font-black text-slate-800">{selectedUser.name || selectedUser.clientName}</p>
                      <span className="text-[10px] text-brand-muted font-mono">{selectedUser.email || selectedUser.username}</span>
                      <p className="text-[9px] text-blue-600 font-bold mt-0.5">{selectedUser.role}</p>
                    </div>
                  </div>

                  {/* Password Reset Field */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase flex justify-between">
                      <span>الرقم السري الجديد</span>
                      <span className="text-brand-muted font-normal">(أو دعه بدون تغيير للاحتفاظ بالرقم الحالي)</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input 
                          type="text" 
                          value={mgmtPassword}
                          onChange={(e) => setMgmtPassword(e.target.value)}
                          placeholder="دعه فارغاً أو اكتب كلمة مرور جديدة"
                          className="w-full pr-4 pl-4 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none transition-all text-slate-800 text-right leading-none font-mono"
                        />
                      </div>
                      <button 
                        type="button"
                        onClick={handleGeneratePassword}
                        className="px-3 bg-slate-100 hover:bg-slate-200 border border-brand-border rounded-xl text-[10px] font-bold text-slate-700 transition"
                      >
                        توليد تلقائي
                      </button>
                    </div>
                  </div>

                  {/* Status Change Selection */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase">مستوى تفعيل الحساب الحركي</label>
                    <select 
                      value={mgmtStatus}
                      onChange={(e) => setMgmtStatus(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none transition text-slate-800"
                    >
                      <option value="نشط">نشط (مسموح بالولوج للمنطقة الآمنة وقراءة وحفظ البيانات)</option>
                      <option value="موقف">موقف / معلق مؤقتاً (يقفل الوصول ويمنع إمكانية تسجيل الدخول)</option>
                    </select>
                  </div>

                  {/* Operations Buttons */}
                  <div className="pt-4 flex flex-col gap-2">
                     <button
                       type="submit"
                       className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-[11px] uppercase tracking-wider hover:bg-slate-800 transition shadow-lg flex items-center justify-center gap-2"
                     >
                       حفظ وتطبيق تغييرات الحساب
                     </button>
                     <button 
                       type="button"
                       onClick={() => { setIsManageModalOpen(false); setSelectedUser(null); }}
                       className="w-full bg-white border border-slate-200 text-slate-600 py-3 rounded-xl font-bold text-[11px] hover:bg-slate-50 transition"
                     >
                       إلغاء الأمر
                     </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Dynamic Create User / Employee / Customer Account Modal */}
        <AnimatePresence>
          {isCreateModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm pr-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
              >
                {/* Header banner */}
                <div className="bg-blue-600 p-6 text-white text-right relative">
                  <h3 className="text-sm font-black tracking-tight flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-white" />
                    {activeTab === 'staff' ? 'إضافة موظف في منظومة الإدارة' : 'إنشاء حساب زبون استيراد بملف'}
                  </h3>
                  <p className="text-[9px] text-white/70 mt-1 uppercase tracking-widest font-black">Provision New Access Account</p>
                  
                  <button 
                    onClick={() => setIsCreateModalOpen(false)}
                    className="absolute top-6 left-6 p-1 hover:bg-white/10 rounded-lg text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Form Body layout */}
                <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                  {/* Account Name input */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase">اسم المستخدم بالكامل</label>
                    <input 
                      type="text" 
                      required
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      placeholder={activeTab === 'staff' ? "مثال: عبد الحق بوقرة" : "مثال: حسام بلعيدي"}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none text-slate-800"
                    />
                  </div>

                  {/* User Email input */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase">البريد الإلكتروني (اسم مستخدم الدخول)</label>
                    <input 
                      type="email" 
                      required
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      placeholder={activeTab === 'staff' ? "staff@autobridge.dz" : "client.new@email.com"}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none text-slate-800 font-mono"
                    />
                  </div>

                  {/* Password selection form */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase">الكلمة السرية للولوج المباشر</label>
                    <div className="relative">
                      <input 
                        type={isPasswordVisible ? "text" : "password"} 
                        required
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                        placeholder="اكتب كلمة سر قوية"
                        className="w-full pr-4 pl-10 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none text-slate-800 font-mono"
                      />
                      <button 
                        type="button"
                        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {isPasswordVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Staff Select role OR Customer Order Link */}
                  {activeTab === 'staff' ? (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase">الدور الوظيفي والامتيازات</label>
                      <select 
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none text-slate-800"
                      >
                        {AVAILABLE_ROLES.map((roleOpt) => (
                          <option key={roleOpt} value={roleOpt}>{roleOpt}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase">ربط الحساب بملف استيراد (رقم المعرف)</label>
                      <input 
                        type="text" 
                        value={newUserOrderId}
                        onChange={(e) => setNewUserOrderId(e.target.value)}
                        placeholder="ID مثال: 1"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-xs focus:ring-1 focus:ring-blue-500 text-slate-800 font-mono"
                      />
                      <p className="text-[8px] text-slate-500">يستخدم لربط وصول العميل بلوحة التتبع والوثائق بشكل آلي.</p>
                    </div>
                  )}

                  {/* Submission and exit */}
                  <div className="pt-4 flex flex-col gap-2">
                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-[11px] uppercase tracking-wider hover:bg-blue-700 transition shadow-lg flex items-center justify-center gap-2 active:scale-95"
                    >
                      تأكيد الحساب وإطلاقه بالمنصة
                    </button>
                    <button 
                      type="button"
                      onClick={() => setIsCreateModalOpen(false)}
                      className="w-full bg-white border border-slate-200 text-slate-600 py-3 rounded-xl font-bold text-[11px] hover:bg-slate-50 transition"
                    >
                      إلغاء والعودة للقائمة
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardShell>
  );
}
