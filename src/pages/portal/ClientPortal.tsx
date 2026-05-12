import React from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Car, 
  MapPin, 
  FileText, 
  CreditCard, 
  Bell, 
  ExternalLink,
  Clock,
  CheckCircle2,
  Package,
  Navigation,
  LogOut
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { OrderLifecycle } from '../../components/orders/OrderLifecycle';
import { ImportStage } from '../../types';
import { DocumentCenter } from '../../components/documents/DocumentCenter';

export function ClientPortal() {
  const navigate = useNavigate();
  const [user, setUser] = React.useState<any>(null);
  const [order, setOrder] = React.useState<any>(null);

  React.useEffect(() => {
    const savedUser = localStorage.getItem('mockUser');
    if (!savedUser) {
      navigate('/login');
      return;
    }

    const userData = JSON.parse(savedUser);
    setUser(userData);

    const savedOrders = localStorage.getItem('import_orders');
    if (savedOrders && userData.orderId) {
      const orders = JSON.parse(savedOrders);
      const userOrder = orders.find((o: any) => o.id === userData.orderId);
      if (userOrder) {
        setOrder(userOrder);
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('mockUser');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-brand-bg font-sans" dir="rtl">
      {/* Client Header */}
      <header className="bg-brand-dark text-white p-6 shadow-2xl">
         <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg">A</div>
               <div>
                  <h1 className="text-lg font-black tracking-tight">AutoBridge Client</h1>
                  <p className="text-[9px] text-white/40 uppercase tracking-widest font-mono">Customer Portal v1.0</p>
               </div>
            </div>
            <div className="flex items-center gap-6">
               <button className="relative p-2 text-white/60 hover:text-white">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
               </button>
               <div className="flex items-center gap-3 border-r pr-6 border-white/10">
                  <div className="text-left leading-none">
                     <p className="text-sm font-bold">{user.name}</p>
                     <p className="text-[9px] text-white/40 uppercase tracking-tighter">{user.role}</p>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-white/10 overflow-hidden border border-white/10">
                     <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="User" />
                  </div>
               </div>
               <button 
                onClick={handleLogout}
                className="p-2 text-white/40 hover:text-red-400 transition-colors"
                title="تسجيل الخروج"
               >
                 <LogOut className="w-5 h-5" />
               </button>
            </div>
         </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 space-y-10">
         {/* Active Order Summary */}
         <section className="space-y-6">
            <div className="flex justify-between items-end">
               <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">طلبك الحالي</h2>
                  <p className="text-xs text-brand-muted mt-1 uppercase font-medium">متابعة دقيقة لرحلة سيارتك من {order?.source || 'الصين'}</p>
               </div>
               <Link to="/portal/orders" className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline flex items-center gap-2">
                  عرض جميع الطلبات <ExternalLink className="w-3 h-3" />
               </Link>
            </div>

            {order ? (
              <div className="bg-white rounded-xl border border-brand-border shadow-sm overflow-hidden p-8">
                 <div className="flex flex-col lg:flex-row gap-10">
                    <div className="flex-1 space-y-6 text-right">
                       <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-600 border border-brand-border">
                             <Car className="w-8 h-8" />
                          </div>
                          <div>
                             <h3 className="text-lg font-black text-slate-900 uppercase">{order.car}</h3>
                             <p className="text-[10px] text-brand-muted font-bold font-mono tracking-widest mt-1 uppercase">VIN: {order.vin || 'L-B3G-Y8-X-492'}</p>
                          </div>
                       </div>
  
                       <div className="grid grid-cols-2 md:grid-cols-3 gap-6 py-6 border-y border-brand-border">
                          {[
                             { label: 'تاريخ الافتتاح', value: order.date },
                             { label: 'المصدر', value: order.source },
                             { label: 'رقم الفاتورة', value: `AB-${order.id.slice(0,6).toUpperCase()}` },
                          ].map((item, j) => (
                             <div key={j}>
                                <p className="text-[9px] text-brand-muted font-bold uppercase tracking-wider mb-1">{item.label}</p>
                                <p className="text-xs font-bold text-slate-800">{item.value}</p>
                             </div>
                          ))}
                       </div>
  
                       <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                             <div 
                              className="h-full bg-blue-600 transition-all duration-500" 
                              style={{ width: `${order.stage === ImportStage.DELIVERED ? 100 : 65}%` }} 
                             />
                          </div>
                          <span className="text-[10px] font-black text-blue-600">{order.stage === ImportStage.DELIVERED ? '100%' : '65%'}</span>
                       </div>
                    </div>
  
                    <div className="lg:w-80 bg-slate-900 rounded-xl p-6 text-white relative overflow-hidden">
                       <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
                       <div className="relative z-10 space-y-6">
                          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">بيانات التكلفة</h4>
                          <div className="space-y-1">
                             <p className="text-xs text-white/60">إجمالي الطلب</p>
                             <p className="text-2xl font-black text-white tracking-tighter">${order.price || '0.00'}</p>
                          </div>
                          <div className="space-y-3">
                             <div className="flex justify-between text-[10px]">
                                <span>حالة الملف</span>
                                <span className="text-emerald-400 font-bold uppercase">{order.stage}</span>
                             </div>
                             <div className="flex justify-between text-[10px] text-white/40">
                                <span>المصدر</span>
                                <span>{order.source}</span>
                             </div>
                          </div>
                          <button className="w-full py-3 bg-blue-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/50">
                             عرض التفاصيل
                          </button>
                       </div>
                    </div>
                 </div>
  
                 <div className="mt-10 pt-8 border-t border-brand-border">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 text-center">الجدول الزمني للطلب</h4>
                    <OrderLifecycle currentStage={order.stage} />
                 </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-dashed border-brand-border p-12 text-center">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">لا يوجد طلبات نشطة حالياً</p>
              </div>
            )}
         </section>

         {/* Document Center Section */}
         <section className="space-y-6">
            <DocumentCenter />
         </section>
  
         {/* Quick Actions Grid */}
         <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
               { icon: Navigation, title: 'تتبع الموقع', desc: 'موقع السفينة على الخريطة', color: 'bg-blue-50 text-blue-600' },
               { icon: FileText, title: 'الوثائق والأوراق', desc: 'تحميل العقود المشفرة', color: 'bg-emerald-50 text-emerald-600' },
               { icon: CreditCard, title: 'سجل المدفوعات', desc: 'تحميل فواتيرك السابقة', color: 'bg-amber-50 text-amber-600' },
               { icon: Package, title: 'بيانات السيارة', desc: 'التقرير التقني والفحص', color: 'bg-purple-50 text-purple-600' },
            ].map((action, k) => (
               <div key={k} className="bg-white p-6 rounded-xl border border-brand-border shadow-sm hover:shadow-md transition-all cursor-pointer group">
                  <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform", action.color)}>
                     <action.icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{action.title}</h4>
                  <p className="text-[10px] text-brand-muted mt-1 font-medium">{action.desc}</p>
               </div>
            ))}
         </section>
      </main>
    </div>
  );
}

