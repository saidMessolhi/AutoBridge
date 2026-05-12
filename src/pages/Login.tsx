import { motion } from 'motion/react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Lock, Mail, ArrowLeft } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

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
    
    // Check hardcoded accounts first
    const account = mockAccounts.find(a => a.email === email);
    if (account) {
      localStorage.setItem('mockUser', JSON.stringify(account));
      navigate(account.path);
      return;
    }

    // Check dynamic portal users (clients)
    const savedAccounts = localStorage.getItem('portal_users');
    if (savedAccounts) {
      const accounts = JSON.parse(savedAccounts);
      // Allowing login with username OR email in the input field
      const userAccount = accounts.find((a: any) => a.username === email || a.email === email);
      if (userAccount) {
        localStorage.setItem('mockUser', JSON.stringify({
          email: userAccount.username,
          role: 'زبون استيراد',
          name: userAccount.clientName,
          path: '/portal/dashboard',
          orderId: userAccount.orderId
        }));
        navigate('/portal/dashboard');
        return;
      }
    }

    // Default fallback
    if (email.includes('admin')) navigate('/admin/dashboard');
    else navigate('/portal/dashboard');
  };

  const quickLogin = (account: typeof mockAccounts[0]) => {
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
