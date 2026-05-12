import { motion } from 'motion/react';
import { DashboardShell } from '../../components/layout/DashboardShell';
import { 
  User, 
  Shield, 
  Bell, 
  Globe, 
  Database,
  Cloud,
  ChevronRight,
  Save
} from 'lucide-react';

export function Settings() {
  return (
    <DashboardShell>
      <div className="max-w-4xl space-y-8">
        <div className="bg-white rounded-xl border border-brand-border shadow-sm overflow-hidden">
           <div className="p-6 border-b border-brand-border bg-slate-50/50">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-[0.2em]">إعدادات الحساب</h3>
           </div>
           
           <div className="p-8 space-y-8">
              <div className="flex items-center gap-8 pb-8 border-b border-brand-border">
                 <div className="w-24 h-24 rounded-2xl bg-slate-200 overflow-hidden relative group">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed" alt="User" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                       <p className="text-[8px] text-white font-bold uppercase">Change</p>
                    </div>
                 </div>
                 <div className="space-y-4 flex-1">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[9px] font-bold text-brand-muted uppercase tracking-widest">الاسم الكامل</label>
                          <input type="text" defaultValue="أحمد بن علي" className="w-full px-4 py-2 bg-slate-50 border border-brand-border rounded-lg text-xs" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-bold text-brand-muted uppercase tracking-widest">البريد الإلكتروني</label>
                          <input type="email" defaultValue="ahmed@autobridge.dz" className="w-full px-4 py-2 bg-slate-50 border border-brand-border rounded-lg text-xs" />
                       </div>
                    </div>
                 </div>
              </div>

              <div className="space-y-6">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">تفضيلات المنصة</h4>
                 
                 {[
                   { icon: Bell, title: 'الإشعارات التلقائية', desc: 'استلام تنبيهات عند تغير حالة الطلب أو وصول سيارة للميناء', enabled: true },
                   { icon: Shield, title: 'التحقق بخطوتين (2FA)', desc: 'تأمين حسابك عبر رمز يصل لهاتفك عند الدخول', enabled: false },
                   { icon: Globe, title: 'لغة الواجهة', desc: 'اختر اللغة المفضلة للوحة التحكم (العربية/الانجليزية)', extra: 'العربية' },
                 ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-brand-border group hover:bg-white hover:shadow-md transition-all">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-400 border border-brand-border">
                             <item.icon className="w-5 h-5" />
                          </div>
                          <div>
                             <p className="text-xs font-bold text-slate-800">{item.title}</p>
                             <p className="text-[10px] text-brand-muted mt-0.5">{item.desc}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-3">
                          {item.extra && <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">{item.extra}</span>}
                          {item.enabled !== undefined && (
                             <div className={`w-10 h-5 rounded-full p-1 relative transition-colors ${item.enabled ? 'bg-blue-600' : 'bg-slate-300'}`}>
                                <div className={`w-3 h-3 bg-white rounded-full transition-all ${item.enabled ? 'translate-x-0' : '-translate-x-5'}`}></div>
                             </div>
                          )}
                          <ChevronRight className="w-4 h-4 text-slate-300" />
                       </div>
                    </div>
                 ))}
              </div>

              <div className="flex justify-end pt-4">
                 <button className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                    <Save className="w-4 h-4" /> حفظ التغييرات
                 </button>
              </div>
           </div>
        </div>

        <div className="bg-red-50/30 rounded-xl border border-red-100 p-6 flex justify-between items-center">
           <div>
              <h4 className="text-xs font-bold text-red-600 uppercase tracking-widest">منطقة الخطر</h4>
              <p className="text-[10px] text-red-400 mt-1 uppercase font-medium">حذف الحساب سيؤدي لمسح جميع البيانات والطلبات المرتبطة بك</p>
           </div>
           <button className="px-4 py-2 bg-red-100 text-red-600 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-red-200 transition-colors">
              حذف الحساب
           </button>
        </div>
      </div>
    </DashboardShell>
  );
}
