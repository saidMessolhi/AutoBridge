import React from 'react';
import { motion } from 'motion/react';
import { DashboardShell } from '../../components/layout/DashboardShell';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Mail, 
  MoreVertical, 
  Search,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';

export function UsersManagement() {
  const [activeTab, setActiveTab] = React.useState<'staff' | 'clients'>('staff');
  const [users] = React.useState([
    { id: '1', name: 'أحمد بن علي', email: 'admin@autobridge.dz', role: 'المدير العام', status: 'نشط', lastActive: 'الآن' },
    { id: '2', name: 'Zhi Chen', email: 'china@autobridge.dz', role: 'مسؤول الصين', status: 'نشط', lastActive: 'قبل دقيقتين' },
    { id: '3', name: 'ياسين بلقاسم', email: 'finance@autobridge.dz', role: 'المحاسب', status: 'نشط', lastActive: 'قبل ساعة' },
    { id: '4', name: 'سارة بن جابر', email: 'reception@autobridge.dz', role: 'عون استقبال / مسؤول ملفات', status: 'نشط', lastActive: 'قبل 4 ساعات' },
  ]);

  const [clients] = React.useState([
    { id: 'c1', name: 'محمد فوزي', email: 'client@gmail.com', ordersCount: 2, status: 'نشط', joinDate: '2024-05-01' },
    { id: 'c2', name: 'ياسين كريم', email: 'yassine@gmail.com', ordersCount: 1, status: 'نشط', joinDate: '2024-05-05' },
    { id: 'c3', name: 'عبد الله بن موسى', email: 'abdullah@outlook.dz', ordersCount: 0, status: 'بانتظار التفعيل', joinDate: '2024-05-12' },
    { id: 'c4', name: 'عمر الصادق', email: 'omar.s@gmail.com', ordersCount: 5, status: 'معلق', joinDate: '2024-04-20' },
  ]);

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">إدارة الحسابات المنصة</h2>
            <p className="text-xs text-brand-muted mt-1 uppercase font-medium">التحكم في صلاحيات الموظفين وحسابات الزبائن</p>
          </div>
          <button className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 flex items-center gap-2">
            <UserPlus className="w-4 h-4" /> 
            {activeTab === 'staff' ? 'إضافة موظف' : 'إنشاء حساب زبون'}
          </button>
        </div>

        <div className="flex gap-2 p-1 bg-slate-100 w-fit rounded-xl border border-brand-border">
          <button 
            onClick={() => setActiveTab('staff')}
            className={cn(
              "px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
              activeTab === 'staff' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            الموظفين والإدارة
          </button>
          <button 
            onClick={() => setActiveTab('clients')}
            className={cn(
              "px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
              activeTab === 'clients' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            حسابات الزبائن
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-4">
             <div className="bg-white rounded-xl border border-brand-border shadow-sm overflow-hidden">
                <div className="p-4 border-b border-brand-border flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                    <input 
                      type="text" 
                      placeholder={activeTab === 'staff' ? "البحث عن موظف..." : "البحث عن زبون حسب الايميل أو الاسم..."}
                      className="w-full pr-9 pl-4 py-2 bg-slate-50 border border-brand-border rounded-lg text-xs outline-none"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right">
                    <thead className="bg-slate-50/50 text-[10px] font-bold text-brand-muted uppercase tracking-widest border-b border-brand-border">
                      {activeTab === 'staff' ? (
                        <tr>
                          <th className="px-6 py-4">المستخدم</th>
                          <th className="px-6 py-4">الدور</th>
                          <th className="px-6 py-4">الحالة</th>
                          <th className="px-6 py-4 text-left">الإجراء</th>
                        </tr>
                      ) : (
                        <tr>
                          <th className="px-6 py-4">الزبون</th>
                          <th className="px-6 py-4 text-center">الطلبات</th>
                          <th className="px-6 py-4">تاريخ الانضمام</th>
                          <th className="px-6 py-4">الحالة</th>
                          <th className="px-6 py-4 text-left">الإجراء</th>
                        </tr>
                      )}
                    </thead>
                    <tbody className="divide-y divide-brand-border">
                      {activeTab === 'staff' ? users.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-600">
                                {user.name[0]}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-900">{user.name}</p>
                                <p className="text-[10px] text-brand-muted font-mono">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-slate-100 rounded text-[9px] font-bold text-slate-600 uppercase">
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-emerald-600">
                              <CheckCircle2 className="w-3 h-3" />
                              <span className="text-[10px] font-bold">{user.status}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-left">
                            <button className="p-1 hover:bg-slate-100 rounded">
                              <MoreVertical className="w-4 h-4 text-slate-400" />
                            </button>
                          </td>
                        </tr>
                      )) : clients.map((client) => (
                        <tr key={client.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center font-bold text-[10px] text-blue-600">
                                {client.name[0]}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-900">{client.name}</p>
                                <p className="text-[10px] text-brand-muted font-mono">{client.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-xs font-bold font-mono text-slate-700">{client.ordersCount}</span>
                          </td>
                          <td className="px-6 py-4">
                             <span className="text-[10px] font-bold text-slate-500 font-mono italic">{client.joinDate}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className={cn(
                              "flex items-center gap-1.5",
                              client.status === 'نشط' ? "text-emerald-600" : 
                              client.status === 'معلق' ? "text-red-500" : "text-amber-500"
                            )}>
                              {client.status === 'نشط' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                              <span className="text-[10px] font-bold">{client.status}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-left">
                             <div className="flex items-center gap-2">
                                <button className="text-[9px] font-bold text-blue-600 hover:underline uppercase">عرض الطلبات</button>
                                <button className="p-1 hover:bg-slate-100 rounded">
                                  <MoreVertical className="w-4 h-4 text-slate-400" />
                                </button>
                             </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
             </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-slate-900/20">
              <Users className="w-8 h-8 mb-4 opacity-50" />
              <h3 className="text-sm font-black uppercase tracking-widest mb-2">إحصائيات الحسابات</h3>
              <div className="space-y-4 mt-6">
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                   <span className="text-[10px] text-white/60">إجمالي الموظفين</span>
                   <span className="text-sm font-bold font-mono">04</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                   <span className="text-[10px] text-white/60">الزبائن النشطين</span>
                   <span className="text-sm font-bold font-mono tracking-tighter">182</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-[10px] text-white/60">طلبات انتظار التفعيل</span>
                   <span className="text-sm font-bold font-mono text-amber-400">12</span>
                </div>
              </div>
            </div>

            <div className="bg-emerald-600 rounded-2xl p-6 text-white shadow-xl shadow-emerald-900/10">
              <Shield className="w-8 h-8 mb-4 opacity-50 text-white" />
              <h3 className="text-sm font-black uppercase tracking-widest mb-2">النظام الموحد</h3>
              <p className="text-[10px] text-white/80 leading-relaxed font-medium">
                بصفتك المدير العام، لديك تحكم كامل في تنشيط حسابات العملاء الجدد ومراجعة بياناتهم قبل السماح لهم بتقديم الطلبات.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
