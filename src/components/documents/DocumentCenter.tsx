import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  Download, 
  Eye, 
  Trash2, 
  Plus, 
  ExternalLink,
  Lock,
  CreditCard,
  Car,
  CheckCircle2,
  Package
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { UploadDocumentModal } from './UploadDocumentModal';

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  date: string;
  category: 'LEGAL' | 'SHIPPING' | 'CUSTOMS' | 'VEHICLE';
}

export function DocumentCenter() {
  const [user, setUser] = useState<any>(null);
  const [documents, setDocuments] = useState<Document[]>([
    { id: '1', name: 'Contract - BJ8293', type: 'PDF', size: '1.2 MB', date: '2024-05-10', category: 'LEGAL' },
    { id: '2', name: 'Bill #928374', type: 'PDF', size: '2.5 MB', date: '2024-05-12', category: 'SHIPPING' },
    { id: '3', name: 'Customs Form', type: 'PDF', size: '800 KB', date: '2024-05-14', category: 'CUSTOMS' },
  ]);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);

  const openUploadModal = (type?: string) => {
    // Map task names to actual document types in the modal if they differ
    let mappedType = type;
    if (type?.includes('بوليصة الشحن')) mappedType = 'وصل شحن';
    if (type?.includes('شهادة المطابقة')) mappedType = 'شهادة المطابقة';
    if (type?.includes('التخليص الجمركي')) mappedType = 'التخليص الجمركي';
    if (type?.includes('صور الحاوية')) mappedType = 'صور الحاوية';

    setSelectedType(mappedType);
    setIsUploadModalOpen(true);
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('mockUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleUpload = (fileData: any) => {
    const newDoc: Document = {
      id: Math.random().toString(36).substr(2, 9),
      name: fileData.name || 'New Document',
      type: fileData.type.includes('عقد') ? 'DOC' : 'PDF',
      size: '0.5 MB',
      date: new Date().toISOString().split('T')[0],
      category: fileData.type.includes('شحن') ? 'SHIPPING' : 'LEGAL'
    };
    setDocuments([newDoc, ...documents]);
    setIsUploadModalOpen(false);
    alert('تم رفع الوثيقة بنجاح!');
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الوثيقة؟')) {
      setDocuments(documents.filter(d => d.id !== id));
    }
  };

  const isClient = user?.role === 'زبون استيراد';
  const isAdmin = user?.role === 'المدير العام';

  return (
    <div className="bg-white rounded-xl border border-brand-border shadow-sm">
      <div className="p-6 border-b border-brand-border flex justify-between items-center bg-slate-50/50">
        <div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-[0.2em]">مركز الوثائق الموحد</h3>
          <p className="text-[10px] text-brand-muted mt-1 uppercase font-medium">
            {isClient ? 'ملفاتك ووثائق طلبك الرسمية' : 'إدارة وثائق العمليات والزبائن والموردين'}
          </p>
        </div>
        {!isClient && (
          <button 
            onClick={() => openUploadModal()}
            className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            رفع وثيقة إدارية
          </button>
        )}
      </div>

      <div className="divide-y divide-brand-border">
        {documents.map((doc, i) => (
          <div key={doc.id} className="p-4 hover:bg-slate-50/50 transition-colors flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white border border-brand-border rounded flex items-center justify-center text-slate-400 shadow-sm">
                <FileText className="w-5 h-5" />
              </div>
              <div className="text-right">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-tight">{doc.name}</h4>
                <div className="flex items-center gap-3 text-[9px] text-brand-muted mt-1 uppercase tracking-tighter font-mono">
                  <span>{doc.type}</span>
                  <span className="w-0.5 h-0.5 bg-slate-300 rounded-full"></span>
                  <span>{doc.size}</span>
                  <span className="w-0.5 h-0.5 bg-slate-300 rounded-full"></span>
                  <span>{doc.date}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                <Eye className="w-4 h-4" />
              </button>
              <button className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded">
                <Download className="w-4 h-4" />
              </button>
              {isAdmin && (
                <button 
                  onClick={() => handleDelete(doc.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-2 px-2 py-0.5 bg-slate-100/50 border border-brand-border text-slate-500 rounded text-[9px] font-bold uppercase tracking-tighter group-hover:hidden">
              <Lock className="w-2.5 h-2.5 opacity-50" />
              {doc.category === 'LEGAL' ? 'Legal' : doc.category === 'SHIPPING' ? 'Logistics' : 'Customs'}
            </div>
          </div>
        ))}

        {isClient && (
          <div className="p-6 bg-slate-50/50 border-t border-brand-border">
            <div className="flex items-center gap-3 mb-4 text-right">
               <Lock className="w-4 h-4 text-emerald-600" />
               <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">المستندات المطلوب رفعها من قبلك</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { name: 'نسخة ملونة من جواز السفر', icon: Package },
                { name: 'توقيع عقد الوكالة الموثق', icon: FileText },
                { name: 'وصل عملية التحويل الأولية', icon: CreditCard }
              ].map((req, idx) => (
                <button key={idx} onClick={() => openUploadModal(req.name)} className="flex justify-between items-center p-3 bg-white border border-brand-border rounded-lg hover:border-blue-400 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
                      <req.icon className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-700">{req.name}</span>
                  </div>
                  <Plus className="w-3.5 h-3.5 text-blue-500 group-hover:scale-125 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        )}

        {user?.role === 'مسؤول اللوجستيك' && (
          <div className="p-6 bg-slate-50/50 border-t border-brand-border">
            <div className="flex items-center gap-3 mb-4 text-right">
               <Lock className="w-4 h-4 text-blue-600" />
               <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">مهام اللوجستيك المعلقة</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { name: 'رفع بوليصة الشحن (Bill of Lading)', icon: Package },
                { name: 'تحديث صور الحاوية قبل الشحن', icon: Car }
              ].map((req, idx) => (
                <button 
                  key={idx} 
                  onClick={() => openUploadModal(req.name)}
                  className="flex justify-between items-center p-3 bg-white border border-brand-border rounded-lg hover:border-blue-400 transition-all group"
                >
                  <div className="flex items-center gap-3 text-right">
                    <div className="w-8 h-8 rounded bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
                      <req.icon className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-700">{req.name}</span>
                  </div>
                  <Plus className="w-3.5 h-3.5 text-blue-500 group-hover:scale-125 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        )}

        {user?.role === 'المخلص الجمركي' && (
          <div className="p-6 bg-slate-50/50 border-t border-brand-border">
            <div className="flex items-center gap-3 mb-4 text-right">
               <Lock className="w-4 h-4 text-emerald-600" />
               <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">المستندات الجمركية المطلوبة</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { name: 'رفع شهادة المطابقة', icon: FileText },
                { name: 'رفع التخليص الجمركي النهائي', icon: CheckCircle2 }
              ].map((req, idx) => (
                <button 
                  key={idx} 
                  onClick={() => openUploadModal(req.name)}
                  className="flex justify-between items-center p-3 bg-white border border-brand-border rounded-lg hover:border-blue-400 transition-all group"
                >
                  <div className="flex items-center gap-3 text-right">
                    <div className="w-8 h-8 rounded bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
                      <req.icon className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-700">{req.name}</span>
                  </div>
                  <Plus className="w-3.5 h-3.5 text-blue-500 group-hover:scale-125 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <UploadDocumentModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
        initialType={selectedType}
      />
    </div>
  );
}
