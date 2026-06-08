import React, { useState } from 'react';
import { motion } from 'motion/react';
import { DashboardShell } from '../../components/layout/DashboardShell';
import { db } from '../../services/firebase';
import { dbSync } from '../../services/dbSync';
import { 
  User, 
  Shield, 
  Bell, 
  Globe, 
  Database,
  Cloud,
  ChevronRight,
  Save,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

export function Settings() {
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState<boolean | null>(null);

  const handleManualSeed = async () => {
    setSeeding(true);
    setSeedSuccess(null);
    try {
      const result = await dbSync.seedDatabase();
      setSeedSuccess(result);
      if (result) {
        alert('تم ملء قاعدة البيانات بالبيانات البدئية بنجاح! ستظهر الجداول الكودية (Collections) الآن في لوحة تحكم Firebase.');
      } else {
        alert('حدث خطأ أثناء ملء قاعدة البيانات. الرجاء التأكد من اتصال الإنترنت وقواعد الحماية.');
      }
    } catch (e) {
      console.error(e);
      setSeedSuccess(false);
    } finally {
      setSeeding(false);
    }
  };

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
                   { icon: Bell, title: 'الإشعارات التلقائية', desc: 'استلاف تنبيهات عند تغير حالة الطلب أو وصول سيارة للميناء', enabled: true },
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

        {/* Firebase & Firestore Monitor */}
        <div className="bg-white rounded-xl border border-brand-border shadow-sm overflow-hidden">
           <div className="p-6 border-b border-brand-border bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-[0.2em] flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-600" />
                إعدادات قاعدة بيانات Cloud Firestore
              </h3>
              <span className={`self-start sm:self-auto px-3 py-1 text-[10px] font-bold rounded-full flex items-center gap-1.5 ${db ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                {db ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> متصل بقاعدة البيانات السحابية
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> وضع التجربة بدون سحابة
                  </>
                )}
              </span>
           </div>
           
           <div className="p-8 space-y-6">
              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100/70 space-y-3">
                <p className="text-xs text-blue-800 font-bold leading-relaxed flex items-center gap-1.5">
                  💡 هامة لمعاينة البيانات (Collections):
                </p>
                <div className="text-[11px] text-blue-700/90 space-y-2 leading-relaxed">
                  <p>
                    تستخدم هذه النسخة آلية تعدد قواعد البيانات في Firebase لضمان العزل وسرعة الاستجابة. عند فتح لوحة تحكم Firebase Firestore، لن تجد الجداول في قاعدة البيانات الافتراضية <strong>(default)</strong>.
                  </p>
                  <p>
                    يرجى النقر على القائمة المنسدلة لقواعد البيانات في أعلى شاشة Firestore في Firebase، واختيار معرف قاعدة بيانات التطبيق المخصص التالي لتشاهد الجداول:
                  </p>
                  <div className="bg-slate-900 text-slate-100 p-2.5 rounded-lg font-mono text-[11px] text-center select-all flex items-center justify-between gap-2 border border-slate-800 shadow-inner">
                    <span className="flex-1 text-center font-bold tracking-wider select-all">ai-studio-93307131-a6d8-468b-948f-24951bce9fba</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-brand-border">
                  <span className="text-[9px] font-bold text-brand-muted uppercase">معرف المشروع (Project ID)</span>
                  <p className="font-mono font-bold text-slate-800 mt-1">crucial-incentive-th7sp</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-brand-border">
                  <span className="text-[9px] font-bold text-brand-muted uppercase">معرف قاعدة البيانات (Database ID)</span>
                  <p className="font-mono font-bold text-slate-800 mt-1">ai-studio-93307131-a6d8-468b-948f-24951bce9fba</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 pt-4 border-t border-brand-border">
                <button
                  type="button"
                  onClick={handleManualSeed}
                  disabled={seeding || !db}
                  className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md flex-1 ${
                    !db 
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : seeding
                        ? 'bg-blue-100 text-blue-500'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100'
                  }`}
                >
                  <RefreshCw className={`w-4 h-4 ${seeding ? 'animate-spin' : ''}`} />
                  {seeding ? 'جاري تهيئة وحقن الجداول...' : 'حقن البيانات الافتراضية (Seed Database)'}
                </button>

                <a
                  href="https://console.firebase.google.com/project/crucial-incentive-th7sp/firestore/databases/ai-studio-93307131-a6d8-468b-948f-24951bce9fba/data"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 flex-1"
                >
                  <ExternalLink className="w-4 h-4" />
                  رابط معاينة قاعدة البيانات في Firebase
                </a>
              </div>

              {seedSuccess === true && (
                <p className="text-xs text-emerald-600 font-bold text-center flex items-center justify-center gap-1.5 mt-2 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100">
                  <CheckCircle className="w-4 h-4" />
                  تمت تهيئة الجداول وحقن البيانات بنجاح! ستظهر لك الجداول فوراً في لوحة التحكم عند تحديث صفحة الـ Firebase Console.
                </p>
              )}
              {seedSuccess === false && (
                <p className="text-xs text-red-600 font-bold text-center flex items-center justify-center gap-1.5 mt-2 bg-red-50/50 p-2.5 rounded-lg border border-red-100">
                  <XCircle className="w-4 h-4" />
                  تعذر حقن البيانات. تأكد من اتصال الإنترنيت وقواعد الحماية.
                </p>
              )}
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
