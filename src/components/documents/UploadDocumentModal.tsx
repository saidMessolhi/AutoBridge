import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, Upload, CheckCircle2, AlertCircle } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: any) => void;
  initialType?: string;
}

export function UploadDocumentModal({ isOpen, onClose, onUpload, initialType }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState(initialType || 'عقد شراء');

  // Update docType if initialType changes when modal opens
  React.useEffect(() => {
    if (isOpen && initialType) {
      setDocType(initialType);
    }
  }, [isOpen, initialType]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm" dir="rtl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden font-sans"
        >
          <div className="p-6 border-b border-brand-border flex justify-between items-center">
            <h3 className="text-sm font-black text-slate-900 uppercase">رفع وثيقة جديدة</h3>
            <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          <div className="p-8 space-y-6">
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center bg-slate-50 hover:bg-white hover:border-blue-300 transition-all cursor-pointer group"
            >
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-xs font-bold text-slate-800">اسحب الملف هنا أو انقر للإختيار</p>
              <p className="text-[10px] text-brand-muted mt-1">PDF, JPG, PNG (Max 10MB)</p>
              {file && (
                 <div className="mt-4 flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full text-[10px] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {file.name}
                 </div>
              )}
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest block">نوع الوثيقة</label>
              <div className="grid grid-cols-2 gap-2">
                 {['عقد شراء', 'فاتورة تجارية', 'بطاقة رمادية', 'وصل شحن', 'شهادة المطابقة', 'التخليص الجمركي', 'صور الحاوية', 'تقرير المعاينة'].map(type => (
                    <button 
                      key={type}
                      onClick={() => setDocType(type)}
                      className={`py-2 px-4 rounded-lg border text-[10px] font-bold transition-all ${
                        docType === type 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                       {type}
                    </button>
                 ))}
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-50 flex justify-end gap-3">
             <button 
               disabled={!file}
               onClick={() => onUpload({ name: file?.name, type: docType })}
               className="flex items-center gap-2 bg-slate-900 disabled:bg-slate-300 text-white px-8 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all"
             >
                تأكيد الرفع
             </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
