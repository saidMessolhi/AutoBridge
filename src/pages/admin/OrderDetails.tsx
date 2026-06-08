import React from 'react';
import { motion } from 'motion/react';
import { DashboardShell } from '../../components/layout/DashboardShell';
import { OrderLifecycle } from '../../components/orders/OrderLifecycle';
import { DocumentCenter } from '../../components/documents/DocumentCenter';
import { ImportStage } from '../../types';
import { STAGE_LABELS } from '../../constants';
import { cn, canUserSeeOrder, canUserUpdateStage } from '../../lib/utils';
import { dbSync } from '../../services/dbSync';
import { 
  ArrowRight, 
  MapPin, 
  Truck, 
  CheckCircle,
  Clock,
  AlertCircle,
  Edit2,
  Share2,
  Save,
  Lock
} from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { NewOrderModal } from '../../components/orders/NewOrderModal';

export function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = React.useState<any>(null);
  const [systemRate, setSystemRate] = React.useState<number>(220);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = React.useState(false);
  const [userRole, setUserRole] = React.useState<string>(() => {
    const savedUser = localStorage.getItem('mockUser');
    return savedUser ? JSON.parse(savedUser).role : 'المدير العام';
  });

  React.useEffect(() => {
    const savedUser = localStorage.getItem('mockUser');
    const role = savedUser ? JSON.parse(savedUser).role : 'المدير العام';
    setUserRole(role);

    // Subscribe to real-time orders in Firestore
    const unsubscribe = dbSync.subscribeToOrders((allOrders) => {
      const found = allOrders.find((o: any) => o.id === id);
      if (found) {
        if (!canUserSeeOrder(role, found.stage)) {
          alert('ليس لديك صلاحية للوصول لهذا الطلب');
          navigate('/admin/dashboard');
          return;
        }
        setOrder(found);
      }
    });

    const unsubscribeRate = dbSync.subscribeToExchangeRate((rate) => {
      setSystemRate(rate);
    });

    return () => {
      unsubscribe();
      unsubscribeRate();
    };
  }, [id, navigate]);

  const updateOrderInStorage = async (updatedOrder: any) => {
    await dbSync.saveOrder(updatedOrder);
    setOrder(updatedOrder);
  };

  const handleStatusUpdate = async (newStage: ImportStage) => {
    if (!canUserUpdateStage(userRole, newStage)) {
      alert(`عذراً، لا تمتلك الصلاحيات الكافية لتعديل الحالة إلى "${STAGE_LABELS[newStage]}" بصفتك ${userRole}.`);
      return;
    }
    const updated = { ...order, stage: newStage };
    await updateOrderInStorage(updated);
    setIsStatusMenuOpen(false);
    alert('تم تحديث حالة الطلب بنجاح');
  };

  const handleSaveEdit = async (data: any) => {
    const updated = { ...order, ...data };
    await updateOrderInStorage(updated);
    setIsEditModalOpen(false);
  };

  if (!order) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-500">جاري تحميل بيانات الطلب...</p>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-8 pb-20">
        {/* Header Action Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <Link to="/admin/orders" className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors border border-brand-border bg-white shadow-sm">
              <ArrowRight className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">طلب استيراد #{order.id}</h2>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-bold rounded-full border border-blue-100 uppercase">نشط</span>
              </div>
              <p className="text-[10px] text-brand-muted uppercase tracking-wider font-medium mt-1">تم الإنشاء في {order.date} • {order.client}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto relative">
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-brand-border text-slate-700 rounded-lg font-bold hover:bg-slate-50 transition-all text-xs uppercase tracking-tight"
            >
              <Edit2 className="w-3.5 h-3.5" /> تعديل الطلب
            </button>
            <div className="relative flex-1 md:flex-none">
              <button 
                onClick={() => setIsStatusMenuOpen(!isStatusMenuOpen)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-all shadow-sm text-xs uppercase tracking-tight"
              >
                تحديث الحالة <Share2 className="w-3.5 h-3.5" />
              </button>
              
              {isStatusMenuOpen && (
                <div className="absolute left-0 top-full mt-2 w-64 bg-white border border-brand-border rounded-xl shadow-xl z-50 overflow-hidden py-2 max-h-64 overflow-y-auto" dir="rtl">
                  <p className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase border-b border-slate-50 mb-1 text-right">الخيارات المتاحة لدورك الجاري ({userRole})</p>
                  {Object.values(ImportStage).map((stage) => {
                    const isAllowed = canUserUpdateStage(userRole, stage);
                    return (
                      <button
                        key={stage}
                        disabled={!isAllowed}
                        onClick={() => handleStatusUpdate(stage)}
                        className={`w-full text-right px-4 py-2.5 text-xs font-bold flex justify-between items-center transition-colors ${
                          order.stage === stage 
                            ? 'text-blue-600 bg-blue-50/50 hover:bg-blue-100/50' 
                            : isAllowed 
                              ? 'text-slate-700 hover:bg-slate-50' 
                              : 'text-slate-300 opacity-50 cursor-not-allowed bg-slate-50/40'
                        }`}
                      >
                        <span>{STAGE_LABELS[stage]}</span>
                        {!isAllowed && (
                          <Lock className="w-3 h-3 text-slate-300" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-brand-border shadow-sm overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-[0.2em]">مراحل التنفيذ الحالية</h3>
            <div className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 uppercase">
              {STAGE_LABELS[order.stage as ImportStage] || order.stage}
            </div>
          </div>
          <OrderLifecycle currentStage={order.stage} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-xl border border-brand-border shadow-sm text-right">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-[0.2em] mb-6 border-b border-brand-border pb-3 flex justify-between items-center">
                <span>تفاصيل السيارة</span>
                <span className="text-[9px] bg-slate-50 px-2 py-0.5 border border-brand-border font-mono uppercase">VIN: {order.vin || 'N/A'}</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                 {[
                   { label: 'النوع والمديل', value: order.car },
                   { label: 'سعر الطلب بالدولار', value: `${(Number(order.price) || 0).toLocaleString()} $` },
                   { label: 'سعر صرف الطلب', value: `${order.exchangeRate || systemRate} دج` },
                   { label: 'القيمة بالدينار', value: `${((Number(order.price) || 0) * (Number(order.exchangeRate) || systemRate)).toLocaleString('ar-DZ')} دج` },
                   { label: 'المصدر', value: order.source },
                   { label: 'الزبون', value: order.client },
                   { label: 'الهاتف', value: order.phone1 },
                   { label: 'جواز السفر', value: order.passportNumber || 'N/A' },
                 ].map((item, i) => (
                   <div key={i}>
                     <p className="text-[10px] text-brand-muted font-bold uppercase tracking-wider mb-1">{item.label}</p>
                     <p className="text-sm font-semibold text-slate-900">{item.value}</p>
                   </div>
                 ))}
              </div>
            </div>


            <div className="bg-white p-6 rounded-xl border border-brand-border shadow-sm text-right">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-[0.2em] mb-6 border-b border-brand-border pb-3">معلومات الشحن واللوجستيك</h3>
              <div className="space-y-6">
                 <div className="flex items-center justify-between p-4 bg-slate-50 border border-brand-border rounded-lg">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-white rounded border border-brand-border flex items-center justify-center text-slate-600 shadow-sm">
                          <Truck className="w-5 h-5" />
                       </div>
                       <div className="text-left leading-none">
                         <p className="text-xs font-bold text-slate-900 mb-1">CMA CGM BENJAMIN FRANKLIN</p>
                         <p className="text-[9px] text-brand-muted uppercase font-mono tracking-tighter">Vessel ID: 928374 / SHANGHAI TERMINAL</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[9px] text-brand-muted font-bold mb-1 uppercase text-left tracking-tighter">ETA OCTOBER 14</p>
                       <p className="text-xs font-bold text-slate-900 tracking-tight">12 جوان 2024</p>
                    </div>
                 </div>

                 {/* Granular Timeline */}
                 <div className="mr-4 space-y-8 relative before:absolute before:right-0 before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
                    {[
                      { stage: 'تم الشحن البحري', date: '10 ماي, 14:30', desc: 'غادرت الحاوية ميناء شنغهاي متجهة إلى ميناء رادس.', icon: CheckCircle, color: 'text-green-500' },
                      { stage: 'النقل الداخلي', date: '08 ماي, 09:00', desc: 'تم إيصال السيارة من المصنع إلى مستودعات الميناء.', icon: CheckCircle, color: 'text-green-500' },
                      { stage: 'تم الشراء', date: '05 ماي, 11:20', desc: 'تم تسوية المبلغ مع المورد واستلام الفواتير الأصلية.', icon: CheckCircle, color: 'text-green-500' },
                    ].map((step, i) => (
                      <div key={i} className="pr-8 relative">
                        <div className="absolute top-1 -right-[9px] w-4 h-4 rounded-full bg-white border-4 border-blue-600"></div>
                        <div className="flex justify-between mb-2">
                           <h4 className="text-sm font-bold text-gray-900">{step.stage}</h4>
                           <span className="text-[10px] text-gray-400 font-mono italic">{step.date}</span>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-brand-dark p-6 rounded-xl text-slate-300 shadow-xl shadow-slate-900/10">
              <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em] mb-6 border-b border-white/10 pb-3">الحالة المالية</h3>
              <div className="space-y-4">
                 <div className="flex justify-between text-xs">
                   <span className="text-slate-500 font-medium">إجمالي المشروع</span>
                   <span className="font-bold text-white tracking-wider">${(Number(order.price) || 0).toLocaleString()} ({( (Number(order.price) || 0) * (Number(order.exchangeRate) || systemRate) ).toLocaleString('ar-DZ')} دج)</span>
                 </div>
                 <div className="flex justify-between text-xs">
                   <span className="text-slate-500 font-medium">المدفوع (العربون 30%)</span>
                   <span className="text-emerald-400 font-bold uppercase tracking-tighter">PAID {Math.round((Number(order.price) || 0) * (Number(order.exchangeRate) || systemRate) * 0.3).toLocaleString('ar-DZ')} دج (عربون)</span>
                 </div>
                 <div className="h-[1px] bg-white/5 my-2"></div>
                 <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">المتبقي للدفع</p>
                      <p className="text-2xl font-black text-red-500 tracking-tighter">{Math.round((Number(order.price) || 0) * (Number(order.exchangeRate) || systemRate) * 0.7).toLocaleString('ar-DZ')} دج</p>
                      <p className="text-[9px] text-slate-400 mt-1 font-bold">سعر الصرف المحجوز للطلب: {order.exchangeRate || systemRate} دج</p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-white/5" />
                 </div>
                 <button className="w-full mt-6 py-2.5 bg-white text-brand-dark rounded font-bold text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-colors shadow-sm">
                    Generate Payment Link
                 </button>
              </div>
            </div>

            {/* Document Side Center */}
            <DocumentCenter orderId={order.id} />
          </div>
        </div>
      </div>

      <NewOrderModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEdit}
        initialData={order}
      />
    </DashboardShell>
  );
}
