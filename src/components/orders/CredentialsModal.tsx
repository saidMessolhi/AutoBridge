import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Copy, X, Key, User, ExternalLink, Mail } from 'lucide-react';

interface CredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    client: string;
    username: string;
    password: string;
  } | null;
}

export function CredentialsModal({ isOpen, onClose, data }: CredentialsModalProps) {
  if (!isOpen || !data) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('تم النسخ إلى الحافظة');
  };

  const shareText = `مرحباً ${data.client}، يمكنك الآن متابعة طلب استيراد سيارتك عبر منصة AutoBridge.\n\nرابط المنصة: ${window.location.origin}\nاسم المستخدم: ${data.username}\nكلمة المرور: ${data.password}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden font-sans border border-blue-100"
        >
          <div className="bg-emerald-600 p-6 text-white text-center relative">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30 shadow-inner">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-black tracking-tight">تم فتح الملف بنجاح!</h3>
            <p className="text-xs text-white/70 mt-1 uppercase tracking-widest font-medium">Customer Account Generated</p>
            <div className="mt-4 bg-white/10 px-3 py-1.5 rounded-lg border border-white/20 inline-flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold">تم إرسال بيانات الدخول لبريد الزبون تلقائياً</span>
            </div>
            <button onClick={onClose} className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-8 space-y-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200/60 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>بيانات دخول الزبون</span>
                <User className="w-3 h-3 text-blue-600" />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">اسم المستخدم</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm font-mono font-bold text-slate-900 select-all">{data.username}</code>
                  <button onClick={() => copyToClipboard(data.username)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">كلمة المرور</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm font-mono font-bold text-slate-900 select-all">{data.password}</code>
                  <button onClick={() => copyToClipboard(data.password)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
               <button 
                onClick={() => copyToClipboard(shareText)}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
               >
                 <Copy className="w-4 h-4" /> نسخ رسالة الترحيب للزبون
               </button>
               <button 
                onClick={onClose}
                className="w-full bg-white border border-slate-200 text-slate-600 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
               >
                 إغلاق النافذة
               </button>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2 opacity-30 grayscale hover:grayscale-0 transition-all">
                <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-900">AutoBridge Secure Portal v2.0</p>
                <Key className="w-3 h-3 text-blue-600" />
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
