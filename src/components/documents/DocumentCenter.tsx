import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  Download, 
  Eye, 
  Trash2, 
  Plus, 
  Lock, 
  CreditCard, 
  Car, 
  CheckCircle2, 
  Package, 
  Printer, 
  FolderOpen,
  ChevronDown
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { UploadDocumentModal } from './UploadDocumentModal';
import { DocumentPrinter } from './DocumentPrinter';
import { dbSync } from '../../services/dbSync';

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  date: string;
  category: 'LEGAL' | 'SHIPPING' | 'CUSTOMS' | 'VEHICLE';
  isUploaded?: boolean;
}

interface DocumentCenterProps {
  orderId?: string;
}

export function DocumentCenter({ orderId }: DocumentCenterProps) {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);
  
  // Printing states
  const [activePrintDoc, setActivePrintDoc] = useState<any | null>(null);

  useEffect(() => {
    // 1. Get logged-in user
    const savedUser = localStorage.getItem('mockUser');
    let loggedInUser = null;
    if (savedUser) {
      loggedInUser = JSON.parse(savedUser);
      setUser(loggedInUser);
    }

    // 2. Subscribe to real-time orders in Firestore
    const unsubscribe = dbSync.subscribeToOrders((allOrders) => {
      setOrders(allOrders);
      
      // Auto select appropriate order
      if (orderId) {
        setSelectedOrderId(orderId);
      } else if (loggedInUser) {
        if (loggedInUser.role === 'زبون استيراد') {
          const clientOrderId = loggedInUser.orderId;
          let foundOrder = allOrders.find((o: any) => o.id === clientOrderId);
          if (!foundOrder) {
            foundOrder = allOrders.find((o: any) => 
              o.email === loggedInUser.email || 
              o.portalUsername === loggedInUser.email ||
              o.client === loggedInUser.name
            );
          }
          if (foundOrder) {
            setSelectedOrderId(foundOrder.id);
          } else if (clientOrderId) {
            setSelectedOrderId(clientOrderId);
          } else if (allOrders.length > 0) {
            setSelectedOrderId(allOrders[0].id);
          }
        } else if (allOrders.length > 0 && !selectedOrderId) {
          // Admin triggers: select first order
          setSelectedOrderId(allOrders[0].id);
        }
      }
    });

    return () => unsubscribe();
  }, [orderId, selectedOrderId]);

  // Read active order details
  const activeOrder = useMemo(() => {
    const targetId = orderId || selectedOrderId;
    return orders.find(o => o.id === targetId) || null;
  }, [orders, orderId, selectedOrderId]);

  // Derive all compiled documents: system-managed (printable) + customer-uploaded
  const compiledDocuments = useMemo(() => {
    if (!activeOrder) return [];

    const docs: Document[] = [];
    const stage = activeOrder.stage || 'NEW_REQUEST';
    const dateStr = activeOrder.date || '01 ماي, 2026';

    // A. DYNAMIC SYSTEM DOCUMENTS (Grounded & Issued according to Stage progression)
    // 1. Contract (عقد الوكالة والتوريد) - Issued when approved by client or in initial stage
    if (['NEW_REQUEST', 'UNDER_REVIEW', 'SEARCHING_CAR', 'CLIENT_APPROVED', 'DEPOSIT_PAID', 'PURCHASED', 'INLAND_TRANSPORT', 'SHIPPED', 'IN_TRANSIT', 'ARRIVED_PORT', 'CUSTOMS_CLEARANCE', 'FINAL_PAYMENT', 'DELIVERED'].includes(stage)) {
      docs.push({
        id: `SYS-CON-${activeOrder.id?.slice(-4) || '1029'}`,
        name: 'عقد الوكالة الاستيرادية والخدمات اللوجستية المشتركة',
        type: 'DOC',
        size: '1.4 MB',
        date: dateStr,
        category: 'LEGAL',
        isUploaded: false
      });
    }

    // 2. Deposit payment voucher (وصل استلام عربون) - Issued when deposit paid
    if (['DEPOSIT_PAID', 'PURCHASED', 'INLAND_TRANSPORT', 'SHIPPED', 'IN_TRANSIT', 'ARRIVED_PORT', 'CUSTOMS_CLEARANCE', 'FINAL_PAYMENT', 'DELIVERED'].includes(stage)) {
      docs.push({
        id: `SYS-DEP-${activeOrder.id?.slice(-4) || '1030'}`,
        name: 'وصل استلام العربون الأولي ومصاريف الشواء (30%)',
        type: 'PDF',
        size: '0.8 MB',
        date: dateStr,
        category: 'LEGAL',
        isUploaded: false
      });
    }

    // 3. Shipping Invoice (فاتورة الشحن) - Available when shipped
    if (['SHIPPED', 'IN_TRANSIT', 'ARRIVED_PORT', 'CUSTOMS_CLEARANCE', 'FINAL_PAYMENT', 'DELIVERED'].includes(stage)) {
      docs.push({
        id: `SYS-SHI-${activeOrder.id?.slice(-4) || '1031'}`,
        name: 'فاتورة الشحن الدولي والتأمين البحري المنسقة',
        type: 'PDF',
        size: '1.1 MB',
        date: dateStr,
        category: 'SHIPPING',
        isUploaded: false
      });
    }

    // 4. Customs Form (البطاقة الفنية الجمركية) - Available during customs
    if (['CUSTOMS_CLEARANCE', 'FINAL_PAYMENT', 'DELIVERED'].includes(stage)) {
      docs.push({
        id: `SYS-CUS-${activeOrder.id?.slice(-4) || '1032'}`,
        name: 'البطاقة الجمركية والترخيص بالتسليم المعاين جمركياً',
        type: 'PDF',
        size: '1.6 MB',
        date: dateStr,
        category: 'CUSTOMS',
        isUploaded: false
      });
    }

    // 5. Final delivery receipt (محضر التسليم) - Issued at delivery
    if (stage === 'DELIVERED') {
      docs.push({
        id: `SYS-DEL-${activeOrder.id?.slice(-4) || '1033'}`,
        name: 'محضر وإقرار التسليم النهائي للمركبة وبراءة الذمة',
        type: 'DOC',
        size: '0.9 MB',
        date: dateStr,
        category: 'VEHICLE',
        isUploaded: false
      });
    }

    // B. CLIENT OR STAFF UPLOADED DOCUMENTS
    const uploadedDocs = (activeOrder.documents || []).map((d: any) => ({
      id: d.id,
      name: d.name,
      type: d.type?.includes('عقد') ? 'DOC' : 'PDF',
      size: d.size || '1.0 MB',
      date: d.date || dateStr,
      category: d.category || 'VEHICLE',
      isUploaded: true
    }));

    return [...docs, ...uploadedDocs];
  }, [activeOrder]);

  const openUploadModal = (type?: string) => {
    setSelectedType(type);
    setIsUploadModalOpen(true);
  };

  const handleUpload = async (fileData: any) => {
    if (!activeOrder) return;

    const newDoc = {
      id: `doc-${Date.now()}`,
      name: fileData.type + ' - ' + (fileData.name || 'مستند مرفوع.pdf'),
      type: fileData.type,
      size: '1.2 MB',
      date: new Date().toLocaleDateString('ar-DZ'),
      category: fileData.type.includes('شحن') ? 'SHIPPING' : fileData.type.includes('جمرك') ? 'CUSTOMS' : 'VEHICLE'
    };

    const updatedDocuments = [newDoc, ...(activeOrder.documents || [])];
    
    // Save to Firestore real-time!
    await dbSync.updateOrder(activeOrder.id, { documents: updatedDocuments });
    
    // Auto trigger notification
    const isClientUploader = user?.role === 'زبون استيراد';
    const targetRoles = isClientUploader ? ['المدير العام', 'عون استقبال / مسؤول ملفات'] : ['المدير العام'];
    
    await dbSync.addNotification(
      activeOrder.id,
      isClientUploader ? "الزبون قام برفع وثيقة جديدة" : "وثيقة جديدة تم إرفاقها لملفك",
      isClientUploader
        ? `قام الزبون ${user?.name || ''} برفع ملف "${newDoc.name}" في مركز الوثائق لمراجعته.`
        : `تم مراجعة وإرفاق ملف "${newDoc.name}" جديد في مركز وثائق سيارتك من قبل الإدارة.`,
      'INFO',
      {
        targetRoles: isClientUploader ? targetRoles : undefined,
        clientEmail: isClientUploader ? undefined : activeOrder.email
      }
    );

    setIsUploadModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!activeOrder) return;

    if (confirm('هل أنت متأكد من حذف هذه الوثيقة المرفوعة؟')) {
      const updatedDocuments = (activeOrder.documents || []).filter((d: any) => d.id !== id);
      await dbSync.updateOrder(activeOrder.id, { documents: updatedDocuments });
    }
  };

  const isClient = user?.role === 'زبون استيراد';
  const isAdmin = user?.role === 'المدير العام';

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden" dir="rtl">
      {/* Top selection bar for administrative users */}
      {!isClient && !orderId && (
        <div className="p-6 bg-slate-50 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center text-slate-600">
                <FolderOpen className="w-5 h-5" />
             </div>
             <div>
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">تصفية وثائق الملفات الجارية</h4>
                <p className="text-[10px] text-brand-muted mt-0.5">اختر العميل لمشاهدة وتعديل وثائقه وملفاته المشفرة</p>
             </div>
          </div>
          <div className="relative">
             <select 
               value={selectedOrderId}
               onChange={(e) => setSelectedOrderId(e.target.value)}
               className="appearance-none bg-white border border-slate-200 text-xs font-bold text-slate-700 py-3 pr-10 pl-6 rounded-xl focus:ring-1 focus:ring-blue-500 hover:border-slate-300 outline-none w-64 md:w-80"
             >
                <option value="" disabled>اختر ملف عميل...</option>
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>{o.client} ⁃ {o.car}</option>
                ))}
             </select>
             <ChevronDown className="w-4 h-4 absolute top-1/2 -translate-y-1/2 right-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      )}

      {/* Main unified doc center headers */}
      <div className="p-8 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-black text-gray-900 tracking-tight">مركز الوثائق المركزي لتدوير الفحص</h3>
          {activeOrder ? (
            <p className="text-xs text-brand-muted mt-1 uppercase font-medium">
               ملفات وسندات العميل: <span className="font-extrabold text-blue-600">{activeOrder.client}</span> ⁃ سيارة: <span className="font-extrabold text-slate-900">{activeOrder.car}</span>
            </p>
          ) : (
            <p className="text-xs text-brand-muted mt-1">برجاء إدخال أو تحديد ملف عميل لعرض وثائقه</p>
          )}
        </div>
        {activeOrder && !isClient && (
          <button 
            onClick={() => openUploadModal()}
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            رفع مستند جديد للملف
          </button>
        )}
      </div>

      {/* Document List View */}
      {activeOrder ? (
        <div className="divide-y divide-gray-100">
          {compiledDocuments.length > 0 ? (
            compiledDocuments.map((doc, i) => (
              <div key={doc.id} className="p-6 hover:bg-slate-50/50 transition-colors flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 border border-gray-100 rounded-2xl flex items-center justify-center text-slate-400 shadow-sm group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="text-right">
                    <h4 className="text-sm font-black text-slate-700 tracking-tight">{doc.name}</h4>
                    <div className="flex items-center gap-3 text-[10px] text-brand-muted mt-1 uppercase tracking-tighter font-mono">
                      <span className="font-bold">{doc.type}</span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                      <span>{doc.size}</span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                      <span>{doc.date}</span>
                      
                      {/* System Generated vs Uploaded indicator */}
                      {!doc.isUploaded ? (
                        <>
                          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                          <span className="text-[9px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full border border-blue-100">📄 صادر رسمي عن المنصة</span>
                        </>
                      ) : (
                        <>
                          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                          <span className="text-[9px] bg-teal-50 text-teal-600 font-bold px-2 py-0.5 rounded-full border border-teal-100">⬆ مستند مرفوع</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Print and view trigger */}
                  <button 
                    onClick={() => setActivePrintDoc(doc)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100/80 hover:bg-blue-600 hover:text-white border border-slate-200 hover:border-blue-600 rounded-lg text-[10px] font-bold text-slate-600 transition-all cursor-pointer shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>عرض ومعاينة للطباعة</span>
                  </button>

                  {isAdmin && doc.isUploaded && (
                    <button 
                      onClick={() => handleDelete(doc.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      title="حذف المرفق"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs">
              لا توجد مستندات جارية في هذه المرحلة من تتبع الشراء والتحضير.
            </div>
          )}

          {/* Client Specific Uploadable requirements */}
          {isClient && (
            <div className="p-8 bg-slate-50/50 border-t border-gray-100">
              <div className="flex items-center gap-3 mb-6 text-right">
                 <Lock className="w-4 h-4 text-emerald-600" />
                 <p className="text-xs font-black text-slate-600 uppercase tracking-widest">المستندات الهيكلية المطلوب رفعها لتنشيط الاستلام</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: 'نسخة ملونة واضحة من جواز السفر', type: 'بطاقة جواز سفر ملونة', icon: Package },
                  { name: 'تفويض عقد الوكالة الموثق الكاتب بالعدل', type: 'عقد وكالة موثق صك', icon: FileText },
                  { name: 'وصل الدفع الأولي (30%) الصادر من البنك', type: 'وصل عملية تحويل بنكي', icon: CreditCard }
                ].map((req, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => openUploadModal(req.type)} 
                    className="flex justify-between items-center p-4 bg-white border border-slate-200/60 rounded-2xl hover:border-blue-500 transition-all group shadow-sm text-right cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors">
                        <req.icon className="w-5 h-5" />
                      </div>
                      <div className="leading-tight">
                        <p className="text-[11px] font-black text-slate-800">{req.name}</p>
                        <p className="text-[9px] text-brand-muted mt-0.5">انقر لبدء الرفع السحابي</p>
                      </div>
                    </div>
                    <Plus className="w-4 h-4 text-blue-500 group-hover:scale-125 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Logistics Officer Upload Requirements */}
          {user?.role === 'مسؤول اللوجستيك' && (
            <div className="p-8 bg-slate-50/50 border-t border-gray-100">
              <div className="flex items-center gap-3 mb-6 text-right">
                 <Lock className="w-4 h-4 text-indigo-600" />
                 <p className="text-xs font-black text-slate-600 uppercase tracking-widest">مهام ومرفقات مسؤولي اللوجستية المباشرة</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'رفع بوليصة الحاوية (Bill of Lading)', type: 'بوليصة الشحن (BL)', icon: Package },
                  { name: 'تحديث صور الحاوية وعقد المعاينة', type: 'صور الحاوية وتقرير الفحص', icon: Car }
                ].map((req, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => openUploadModal(req.type)}
                    className="flex justify-between items-center p-4 bg-white border border-slate-200/60 rounded-2xl hover:border-blue-500 transition-all group shadow-sm text-right cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors">
                        <req.icon className="w-5 h-5" />
                      </div>
                      <div className="leading-tight">
                        <p className="text-[11px] font-black text-slate-800">{req.name}</p>
                        <p className="text-[9px] text-brand-muted mt-0.5">اضف المرفق إلى خوادم جمركة العميل</p>
                      </div>
                    </div>
                    <Plus className="w-4 h-4 text-blue-500 group-hover:scale-125 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Broker/Customs Officer Upload Requirements */}
          {user?.role === 'المخلص الجمركي' && (
            <div className="p-8 bg-slate-50/50 border-t border-gray-100">
              <div className="flex items-center gap-3 mb-6 text-right">
                 <Lock className="w-4 h-4 text-emerald-600" />
                 <p className="text-xs font-black text-slate-600 uppercase tracking-widest">مستندات الجمرك المطلوب تسويتها</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'شهادة المطابقة الفنية للسيارة الصينية', type: 'شهادة المطابقة الفنية', icon: FileText },
                  { name: 'وصل الجمركة النهائي (سند الخروج)', type: 'المستند الجمركي الموحد', icon: CheckCircle2 }
                ].map((req, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => openUploadModal(req.type)}
                    className="flex justify-between items-center p-4 bg-white border border-slate-200/60 rounded-2xl hover:border-blue-500 transition-all group shadow-sm text-right cursor-pointer"
                  >
                    <div className="flex items-center gap-3 text-right">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors">
                        <req.icon className="w-5 h-5" />
                      </div>
                      <div className="leading-tight">
                        <p className="text-[11px] font-black text-slate-800">{req.name}</p>
                        <p className="text-[9px] text-brand-muted mt-0.5">تحميل الوثائق المفسوحة</p>
                      </div>
                    </div>
                    <Plus className="w-4 h-4 text-blue-500 group-hover:scale-125 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-16 text-center text-slate-400 font-medium">
           برجاء اختيار عميل أو طلب جاري لمشاهدة السندات والتحميلات.
        </div>
      )}

      {/* Upload document Modal */}
      <UploadDocumentModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
        initialType={selectedType}
        isTypeLocked={!!selectedType}
        userRole={user?.role}
      />

      {/* Interactive printable document view */}
      <DocumentPrinter 
        isOpen={activePrintDoc !== null}
        onClose={() => setActivePrintDoc(null)}
        document={activePrintDoc}
        order={activeOrder}
      />
    </div>
  );
}
