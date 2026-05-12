import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Car, User, Globe, ChevronLeft, Save } from 'lucide-react';
import { ImportStage } from '../../types';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (order: any) => void;
  initialData?: any;
}

export function NewOrderModal({ isOpen, onClose, onSave, initialData }: NewOrderModalProps) {
  const [formData, setFormData] = useState({
    client: initialData?.client || '',
    email: initialData?.email || '',
    phone1: initialData?.phone1 || '',
    phone2: initialData?.phone2 || '',
    address: initialData?.address || '',
    city: initialData?.city || '',
    passportNumber: initialData?.passportNumber || '',
    car: initialData?.car || '',
    vin: initialData?.vin || '',
    stage: initialData?.stage || ImportStage.DEPOSIT_PAID,
    source: initialData?.source || 'China',
    price: initialData?.price || ''
  });

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        client: initialData.client || '',
        email: initialData.email || '',
        phone1: initialData.phone1 || '',
        phone2: initialData.phone2 || '',
        address: initialData.address || '',
        city: initialData.city || '',
        passportNumber: initialData.passportNumber || '',
        car: initialData.car || '',
        vin: initialData.vin || '',
        stage: initialData.stage || ImportStage.DEPOSIT_PAID,
        source: initialData.source || 'China',
        price: initialData.price || ''
      });
    }
  }, [initialData]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm" dir="rtl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden font-sans max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="bg-slate-900 p-6 flex justify-between items-center text-white sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg text-white">
                <Car className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight uppercase">فتح ملف استيراد وفاتورة</h3>
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Customer Billing & Import Record</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Form Content */}
          <div className="p-8 space-y-10">
            {/* Section 1: Customer Data */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-2 border-b border-brand-border">
                <User className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">بيانات الزبون (للفاتورة)</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">اسم الزبون الكامل / الشركة</label>
                  <input 
                    type="text" 
                    value={formData.client}
                    onChange={(e) => setFormData({...formData, client: e.target.value})}
                    placeholder="الاسم الثلاثي أو اسم السجل التجاري"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">البريد الإلكتروني للزبون (للدخول والمتابعة)</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="email@example.com"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none transition-all font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">رقم الهاتف 1 (أساسي)</label>
                  <input 
                    type="tel" 
                    value={formData.phone1}
                    onChange={(e) => setFormData({...formData, phone1: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">رقم الهاتف 2 (اختياري)</label>
                  <input 
                    type="tel" 
                    value={formData.phone2}
                    onChange={(e) => setFormData({...formData, phone2: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-xs font-mono"
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">العنوان الكامل</label>
                  <input 
                    type="text" 
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="النهج، رقم الباب، الحي..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">المدينة / الولاية</label>
                  <input 
                    type="text" 
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">رقم جواز السفر</label>
                  <input 
                    type="text" 
                    value={formData.passportNumber}
                    onChange={(e) => setFormData({...formData, passportNumber: e.target.value})}
                    placeholder="رقم جواز السفر للزبون"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Vehicle Data */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-2 border-b border-brand-border">
                <Car className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">بيانات المركبة والطلب</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">نوع الموديل</label>
                  <input 
                    type="text" 
                    value={formData.car}
                    onChange={(e) => setFormData({...formData, car: e.target.value})}
                    placeholder="مثلاً: Geely Monjaro"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-xs uppercase"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">رقم الهيكل (VIN)</label>
                  <input 
                    type="text" 
                    value={formData.vin}
                    onChange={(e) => setFormData({...formData, vin: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">المصدر</label>
                  <select 
                    value={formData.source}
                    onChange={(e) => setFormData({...formData, source: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-xs font-bold"
                  >
                    <option value="China">الصين (China)</option>
                    <option value="UAE">الإمارات (UAE)</option>
                    <option value="Europe">أوروبا (Europe)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">سعر الطلب ($)</label>
                  <input 
                    type="number" 
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-xs font-bold"
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">حالة الطلب الحالية</label>
                  <select 
                    value={formData.stage}
                    onChange={(e) => setFormData({...formData, stage: e.target.value as ImportStage})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-xs font-bold text-blue-600"
                  >
                    {Object.values(ImportStage).map((stage) => (
                      <option key={stage} value={stage}>{stage}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-slate-50 border-t border-brand-border flex justify-end gap-3">
             <button 
               onClick={onClose}
               className="px-6 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest hover:text-slate-900"
             >
                إلغاء
             </button>
             <button 
               onClick={() => onSave(formData)}
               className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
             >
                <Save className="w-4 h-4" /> حفظ وفتح الملف
             </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
