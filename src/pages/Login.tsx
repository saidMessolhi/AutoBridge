import { motion } from 'motion/react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Lock, Mail, ArrowLeft } from 'lucide-react';
import { dbSync } from '../services/dbSync';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [portalUsers, setPortalUsers] = useState<any[]>([]);
  const navigate = useNavigate();

  React.useEffect(() => {
    // Subscribe to portal users from Firestore/localStorage in real-time
    const unsubscribe = dbSync.subscribeToPortalUsers((users) => {
      setPortalUsers(users);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const mockAccounts = [
    { email: 'admin@autobridge.dz', role: 'المدير العام', name: 'أحمد بن علي', path: '/admin/dashboard' },
    { email: 'china@autobridge.dz', role: 'مسؤول الصين', name: 'Zhi Chen', path: '/admin/dashboard' },
    { email: 'logistics@autobridge.dz', role: 'مسؤول اللوجستيك', name: 'سيد علي بوزيد', path: '/admin/dashboard' },
    { email: 'customs@autobridge.dz', role: 'المخلص الجمركي', name: 'عمر قدور', path: '/admin/dashboard' },
    { email: 'finance@autobridge.dz', role: 'المحاسب', name: 'ياسين بلقاسم', path: '/admin/finance' },
    { email: 'reception@autobridge.dz', role: 'عون استقبال / مسؤول ملفات', name: 'سارة بن جابر', path: '/admin/dashboard' },
    { email: 'client@gmail.com', role: 'زبون استيراد', name: 'محمد فوزي', path: '/portal/dashboard' },
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email) {
      setErrorMsg('فضلاً أدخل البريد الإلكتروني أو اسم المستخدم.');
      return;
    }

    // 1. Check dynamic portal users (including staff) loaded in real-time from Firestore
    const userAccount = portalUsers.find(
      (a: any) => (a.username || '').toLowerCase() === email.trim().toLowerCase() || 
                  (a.email || '').toLowerCase() === email.trim().toLowerCase()
    );

    if (userAccount) {
      // Check status
      if (userAccount.status === 'موقف' || userAccount.status === 'معلق' || userAccount.status === 'غير نشط') {
        setErrorMsg('عذراً، لقد تم إيقاف هذا الحساب أو تعليقه مؤقتاً من قبل الإدارة.');
        return;
      }

      // Check password
      if (password && userAccount.password && userAccount.password !== password) {
        setErrorMsg('كلمة المرور التي أدخلتها غير صحيحة.');
        return;
      }

      // Successful login of account
      const mappedRole = userAccount.role;
      const mappedPath = mappedRole === 'زبون استيراد' ? '/portal/dashboard' : (mappedRole === 'المحاسب' ? '/admin/finance' : '/admin/dashboard');

      localStorage.setItem('mockUser', JSON.stringify({
        email: userAccount.email || userAccount.username,
        role: mappedRole,
        name: userAccount.name || userAccount.clientName || 'مستخدم',
        path: mappedPath,
        orderId: userAccount.orderId
      }));

      navigate(mappedPath);
      return;
    }

    // 2. Fallbacks
    const fallbackMock = mockAccounts.find(a => a.email.toLowerCase() === email.trim().toLowerCase());
    if (fallbackMock) {
      localStorage.setItem('mockUser', JSON.stringify(fallbackMock));
      navigate(fallbackMock.path);
      return;
    }

    setErrorMsg('المستخدم غير مسجل بالمنصة.');
  };

  const quickLogin = (account: typeof mockAccounts[0]) => {
    setErrorMsg('');
    
    // Look up in portalUsers to verify status first!
    const userAccount = portalUsers.find(
      (a: any) => (a.username || '').toLowerCase() === account.email.toLowerCase() ||
                  (a.email || '').toLowerCase() === account.email.toLowerCase()
    );

    if (userAccount && (userAccount.status === 'موقف' || userAccount.status === 'معلق' || userAccount.status === 'غير نشط')) {
      setErrorMsg(`عذراً، حساب (${account.name}) معطل حالياً من طرف المدير العام.`);
      return;
    }

    localStorage.setItem('mockUser', JSON.stringify(account));
    navigate(account.path);
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6 font-sans overflow-y-auto" dir="rtl">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
        {/* Login Form */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl border border-brand-border shadow-2xl p-8"
        >
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-100">
              <Car className="text-white w-10 h-10" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">AutoBridge SaaS</h1>
            <p className="text-[10px] text-brand-muted mt-2 font-black uppercase tracking-[0.2em]">تسجيل الدخول للمنصة</p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-[11px] font-bold text-center leading-relaxed">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest pr-1">البريد الإلكتروني أو اسم المستخدم</label>
              <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pr-12 pl-4 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest pr-1">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pr-12 pl-4 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-lg mt-4 flex items-center justify-center gap-2"
            >
              دخول <ArrowLeft className="w-4 h-4" />
            </button>
          </form>
        </motion.div>

        {/* Quick Access Grid (Mock Accounts) */}
        <motion.div 
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 0.1 }}
           className="space-y-6"
        >
           <div className="bg-blue-600 p-6 rounded-2xl text-white shadow-xl shadow-blue-100">
              <h3 className="text-sm font-black uppercase tracking-widest mb-2">حسابات التجربة السريعة</h3>
              <p className="text-[10px] text-white/60 mb-6 uppercase font-medium">اختر دوراً للدخول الفوري ومشاهدة المنصة</p>
              
              <div className="grid grid-cols-1 gap-3">
                 {mockAccounts.map((account) => (
                    <button 
                       key={account.email}
                       onClick={() => quickLogin(account)}
                       className="bg-white/10 hover:bg-white/20 border border-white/10 p-3 rounded-xl flex items-center justify-between text-right transition-all group"
                    >
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-bold text-[10px] group-hover:bg-white group-hover:text-blue-600 transition-colors">
                             {account.email[0].toUpperCase()}
                          </div>
                          <div>
                             <p className="text-xs font-bold leading-none mb-1">{account.name}</p>
                             <p className="text-[9px] text-white/50 uppercase tracking-tighter">{account.role}</p>
                          </div>
                       </div>
                       <ArrowLeft className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                    </button>
                 ))}
              </div>
           </div>

           <div className="bg-white p-6 rounded-2xl border border-brand-border text-center">
              <p className="text-[10px] text-brand-muted font-bold uppercase tracking-wider">نظام Multi-Tenant SaaS</p>
              <p className="text-[9px] text-slate-400 mt-1">يتم عزل بيانات كل شركة استيراد بشكل كامل لضمان الخصوصية</p>
           </div>
        </motion.div>
      </div>
    </div>
  );
}
