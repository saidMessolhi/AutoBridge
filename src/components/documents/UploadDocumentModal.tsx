import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, Upload, CheckCircle2, AlertCircle, Lock } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: any) => void;
  initialType?: string;
  isTypeLocked?: boolean;
  userRole?: string;
}

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  // General staff documents
  'عقد شراء': 'عقد الشراء والتوريد الأولي',
  'فاتورة تجارية': 'الفاتورة التجارية الرسمية (Commercial Invoice)',
  'بطاقة رمادية': 'البطاقة الرمادية للمركبة (Carte Grise)',
  'وصل شحن': 'وصل شحن وتصدير المركبة عبر الميناء',
  'شهادة المطابقة': 'شهادة المطابقة والمواصفات المعتمدة',
  'التخليص الجمركي': 'سند وبطاقة التخليص الجمركي والرسوم',
  'صور الحاوية': 'صور شحن وتأمين الحاوية في الميناء',
  'تقرير المعاينة': 'تقرير المعاينة وفحص المطابقة التقنية',
  
  // Client Structural documents
  'بطاقة جواز سفر ملونة': 'نسخة ملونة واضحة من جواز السفر',
  'عقد وكالة موثق صك': 'تفويض عقد الوكالة الموثق الكاتب بالعدل',
  'وصل عملية تحويل بنكي': 'وصل الدفع الأولي (30%) الصادر من البنك',

  // Logistics specific
  'بوليصة الشحن (BL)': 'بوليصة الحاوية (Bill of Lading - BL)',
  'صور الحاوية وتقرير الفحص': 'تحديث صور الحاوية وعقد المعاينة',

  // Customs specific
  'شهادة المطابقة الفنية': 'شهادة المطابقة الفنية للسيارة الصينية',
  'المستند الجمركي الموحد': 'وصل الجمركة النهائي (سند الخروج جمركياً)',
};

const ROLE_DOC_MAPPING: Record<string, string[]> = {
  'المدير العام': [
    'عقد شراء', 'فاتورة تجارية', 'بطاقة رمادية', 'وصل شحن', 'شهادة المطابقة', 'التخليص الجمركي', 'صور الحاوية', 'تقرير المعاينة',
    'بطاقة جواز سفر ملونة', 'عقد وكالة موثق صك', 'وصل عملية تحويل بنكي', 'بوليصة الشحن (BL)', 'صور الحاوية وتقرير الفحص', 'شهادة المطابقة الفنية', 'المستند الجمركي الموحد'
  ],
  'عون استقبال / مسؤول ملفات': [
    'عقد شراء', 'فاتورة تجارية', 'بطاقة رمادية', 'تقرير المعاينة',
    'بطاقة جواز سفر ملونة', 'عقد وكالة موثق صك', 'وصل عملية تحويل بنكي'
  ],
  'مسؤول اللوجستيك': [
    'وصل شحن', 'صور الحاوية', 'بوليصة الشحن (BL)', 'صور الحاوية وتقرير الفحص'
  ],
  'المخلص الجمركي': [
    'التخليص الجمركي', 'شهادة المطابقة', 'شهادة المطابقة الفنية', 'المستند الجمركي الموحد'
  ],
  'المحاسب': [
    'وصل عملية تحويل بنكي', 'فاتورة تجارية'
  ],
  'مسؤول الصين': [
    'عقد شراء', 'تقرير المعاينة'
  ],
  'زبون استيراد': [
    'بطاقة جواز سفر ملونة', 'عقد وكالة موثق صك', 'وصل عملية تحويل بنكي'
  ]
};

const CATEGORIES = [
  {
    title: 'المستندات الإدارية والعقود العامة',
    items: ['عقد شراء', 'فاتورة تجارية', 'بطاقة رمادية', 'تقرير المعاينة']
  },
  {
    title: 'اللوجستيك والشحن الدولي',
    items: ['وصل شحن', 'صور الحاوية', 'بوليصة الشحن (BL)', 'صور الحاوية وتقرير الفحص']
  },
  {
    title: 'التفتيش والتخليص الجمركي',
    items: ['التخليص الجمركي', 'شهادة المطابقة', 'شهادة المطابقة الفنية', 'المستند الجمركي الموحد']
  },
  {
    title: 'وثائق الثبوتية والدفع للزبون الدورية',
    items: ['بطاقة جواز سفر ملونة', 'عقد وكالة موثق صك', 'وصل عملية تحويل بنكي']
  }
];

export function UploadDocumentModal({ 
  isOpen, 
  onClose, 
  onUpload, 
  initialType, 
  isTypeLocked = false, 
  userRole 
}: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fallback to General Manager permissions if role isn't recognized or defined
  const roleName = userRole || 'المدير العام';
  const allowedTypes = ROLE_DOC_MAPPING[roleName] || ROLE_DOC_MAPPING['المدير العام'];
  const defaultType = initialType || allowedTypes[0] || 'عقد شراء';

  const [docType, setDocType] = useState(defaultType);

  // Update docType and reset file if modal changes or opens
  useEffect(() => {
    if (isOpen) {
      setFile(null);
      if (initialType) {
        setDocType(initialType);
      } else {
        const currentAllowed = ROLE_DOC_MAPPING[roleName] || ROLE_DOC_MAPPING['المدير العام'];
        if (currentAllowed && currentAllowed.length > 0) {
          setDocType(currentAllowed[0]);
        }
      }
    }
  }, [isOpen, initialType, roleName]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm" dir="rtl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden font-sans max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-55 select-none hover:bg-slate-50/50 transition-colors">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                {isTypeLocked ? `صفحة رفع وثيقة مخصصة` : `مركز رفع وثائق المعاملة الموحد`}
              </h3>
              <p className="text-[10px] text-brand-muted mt-0.5">
                {isTypeLocked ? `بصفتك مستخدم للمنصة تفضل برفق طلبك مباشرة` : `يمكنك إثراء الملف بوثاق مصنفة وفق صلاحيات دورك الجاري`}
              </p>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body content with scroll limits for safety */}
          <div className="p-6 md:p-8 space-y-6 flex-1 overflow-y-auto">
            {/* Click & Drag Drop Container */}
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={triggerFileSelect}
              className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-white transition-all cursor-pointer group text-center"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                className="hidden" 
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-3 shadow-sm border border-slate-100 group-hover:scale-110 group-hover:shadow-md transition-all">
                <Upload className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-xs font-black text-slate-800">اسحب وثيقتك إلى هنا أو انقر للتصفح اليدوي للمستكشف</p>
              <p className="text-[10px] text-brand-muted mt-1 font-mono uppercase">يدعم صيغ الـ PDF, JPG, PNG بحجم أقصى 10 ميجا بكسل</p>
              
              {file && (
                <div className="mt-4 flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl text-xs font-bold shadow-sm">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500 animate-bounce" /> 
                  <span className="truncate max-w-xs">{file.name}</span>
                </div>
              )}
            </div>

            {/* Type Indicator or Grid list depends on isTypeLocked */}
            {isTypeLocked ? (
              /* Dedicated mode: Lock category entirely and show informative details only */
              <div className="space-y-2">
                <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest block text-right">عنوان الوثيقة المراد رفعها حالياً</label>
                <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 gap-3.5 flex items-center text-right shadow-sm">
                  <div className="w-11 h-11 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-blue-600 shrink-0 shadow-sm">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] bg-blue-50 text-blue-600 border border-blue-100 font-extrabold px-2 py-0.5 rounded-full">نموذج المستند المقيد بنجاح</span>
                    <h4 className="text-xs font-extrabold text-slate-800 mt-1">{DOCUMENT_TYPE_LABELS[docType] || docType}</h4>
                  </div>
                </div>
              </div>
            ) : (
              /* Allowed document types grid section organized by Category */
              <div className="space-y-5">
                <div className="flex justify-between items-center border-b border-dashed border-slate-150 pb-2">
                  <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest block text-right">اختر نوع الوثيقة التي ترفعها للملف</label>
                  <span className="text-[9px] bg-indigo-50 border border-indigo-100 text-indigo-600 px-2.5 py-0.5 rounded-full font-black">دورك الجاري: {roleName}</span>
                </div>

                <div className="space-y-5">
                  {CATEGORIES.map((cat, idx) => {
                    // Filter categorised items so we only render types we have labels for
                    return (
                      <div key={idx} className="space-y-2">
                        <span className="text-[10px] font-black text-blue-600 bg-blue-50/70 border border-blue-100/50 px-2.5 py-0.5 rounded-lg inline-block">
                          {cat.title}
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {cat.items.map((type) => {
                            const isAllowed = allowedTypes.includes(type);
                            const label = DOCUMENT_TYPE_LABELS[type] || type;
                            return (
                              <button
                                type="button"
                                key={type}
                                disabled={!isAllowed}
                                onClick={() => setDocType(type)}
                                className={`py-3 px-4 rounded-xl border text-[11px] font-black transition-all flex items-center justify-between gap-2.5 text-right cursor-pointer ${
                                  !isAllowed
                                    ? 'bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed opacity-[0.55]'
                                    : docType === type
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100'
                                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                <span className="truncate">{label}</span>
                                {!isAllowed ? (
                                  <div className="flex items-center gap-1 shrink-0 scale-90">
                                    <span className="text-[8px] bg-slate-200 px-1 py-0.5 rounded text-slate-500 font-bold">مقيد</span>
                                    <Lock className="w-3 h-3 text-slate-400" />
                                  </div>
                                ) : (
                                  docType === type && <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0 scale-110" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-between items-center sm:gap-4 select-none">
             <div className="text-right">
                <p className="text-[10px] text-slate-500 font-bold">نوع الملف الحاسم:</p>
                <p className="text-[11px] font-extrabold text-blue-600 truncate max-w-[180px] sm:max-w-xs">{DOCUMENT_TYPE_LABELS[docType] || docType}</p>
             </div>
             
             <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={onClose}
                  className="bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  إلغاء العملية
                </button>
                <button 
                  type="button"
                  disabled={!file}
                  onClick={() => onUpload({ name: file?.name, type: docType })}
                  className="flex items-center gap-2 bg-slate-900 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-6 sm:px-8 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer shadow-sm"
                >
                  تأكيد الرفع الفوري
                </button>
             </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
