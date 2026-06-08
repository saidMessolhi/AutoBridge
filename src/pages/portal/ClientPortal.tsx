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
import { dbSync } from '../../services/dbSync';
import { OrderLifecycle } from '../../components/orders/OrderLifecycle';
import { ImportStage } from '../../types';
import { DocumentCenter } from '../../components/documents/DocumentCenter';

export function ClientPortal() {
  const navigate = useNavigate();
  const [user, setUser] = React.useState<any>(null);
  const [order, setOrder] = React.useState<any>(null);
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);

  React.useEffect(() => {
    const savedUser = localStorage.getItem('mockUser');
    if (!savedUser) {
      navigate('/login');
      return;
    }

    const userData = JSON.parse(savedUser);
    setUser(userData);

    // Subscribe to real-time sync for client order updates from anywhere
    const unsubscribe = dbSync.subscribeToOrders((allOrders) => {
      let userOrder = null;
      if (userData.orderId) {
        userOrder = allOrders.find((o: any) => o.id === userData.orderId);
      }
      
      // Fallback matching by email, username, or client name
      if (!userOrder) {
        userOrder = allOrders.find((o: any) => 
          o.email === userData.email || 
          o.portalUsername === userData.email ||
          o.client === userData.name
        );
      }

      if (userOrder) {
        setOrder(userOrder);
        
        // If orderId was missing, persist it to localStorage mockUser
        if (!userData.orderId) {
          const updatedUser = { ...userData, orderId: userOrder.id };
          localStorage.setItem('mockUser', JSON.stringify(updatedUser));
          setUser(updatedUser);
        }
      }
    });

    // Notify updates if orderId is resolved
    let unsubscribeNotifs = () => {};
    const targetOrderId = userData.orderId || '';
    if (targetOrderId) {
      unsubscribeNotifs = dbSync.subscribeToNotifications(userData, (allNotifs) => {
        setNotifications(allNotifs);
      });
    } else {
      // Dynamic fallback for notifications once order is resolved/set
      const checkAndUnsub = setInterval(() => {
        const saved = localStorage.getItem('mockUser');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.orderId) {
            clearInterval(checkAndUnsub);
            unsubscribeNotifs = dbSync.subscribeToNotifications(parsed, (allNotifs) => {
              setNotifications(allNotifs);
            });
          }
        }
      }, 1000);
      
      const originalUnsub = unsubscribeNotifs;
      unsubscribeNotifs = () => {
        clearInterval(checkAndUnsub);
        originalUnsub();
      };
    }

    return () => {
      unsubscribe();
      unsubscribeNotifs();
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('mockUser');
    navigate('/login');
  };

  const unreadCount = React.useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const handleMarkAllRead = async () => {
    if (user) {
      await dbSync.markAllNotificationsAsRead(user);
    }
  };

  const handleMarkRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await dbSync.markNotificationAsRead(id);
  };

  const getStageProgress = (stage: string) => {
    switch (stage) {
      case 'NEW_REQUEST': return 5;
      case 'UNDER_REVIEW': return 15;
      case 'SEARCHING_CAR': return 25;
      case 'CLIENT_APPROVED': return 35;
      case 'DEPOSIT_PAID': return 45;
      case 'PURCHASED': return 55;
      case 'INLAND_TRANSPORT': return 65;
      case 'SHIPPED': return 75;
      case 'IN_TRANSIT': return 82;
      case 'ARRIVED_PORT': return 88;
      case 'CUSTOMS_CLEARANCE': return 92;
      case 'FINAL_PAYMENT': return 96;
      case 'DELIVERED': return 100;
      default: return 40;
    }
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
               <div className="relative">
                  <button 
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className="relative p-2 text-white/60 hover:text-white transition-transform active:scale-95"
                  >
                     <Bell className="w-5 h-5" />
                     {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-black text-white flex items-center justify-center border border-brand-dark">
                          {unreadCount}
                        </span>
                     )}
                  </button>

                  {isNotificationsOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsNotificationsOpen(false)}
                      />
                      <div className="absolute left-0 mt-3 w-80 sm:w-96 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden leading-snug">
                        <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs">إشعارات التتبع الخاص بك</span>
                            {unreadCount > 0 && (
                              <span className="bg-red-50 text-red-600 text-[9px] font-black px-1.5 py-0.5 rounded-full border border-red-100">
                                {unreadCount} جديد
                              </span>
                            )}
                          </div>
                          {unreadCount > 0 && (
                            <button 
                              onClick={handleMarkAllRead}
                              className="text-[10px] font-bold text-blue-600 hover:underline"
                            >
                              تعيين الكل كمقروء
                            </button>
                          )}
                        </div>

                        <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 text-slate-800">
                          {notifications.length > 0 ? (
                            notifications.map((notif) => (
                              <div 
                                key={notif.id} 
                                className={cn(
                                  "p-4 hover:bg-slate-50/50 transition-colors flex gap-3 text-right leading-relaxed",
                                  !notif.read ? "bg-slate-50/40" : ""
                                )}
                              >
                                <div className="flex-1">
                                  <div className="flex justify-between items-start gap-2">
                                    <h5 className={cn("text-xs font-black", !notif.read ? "text-slate-900" : "text-slate-700")}>{notif.title}</h5>
                                    <span className="text-[8px] text-slate-400 font-mono tracking-tighter whitespace-nowrap">{notif.date}</span>
                                  </div>
                                  <p className="text-[10px] text-slate-500 mt-1">{notif.message}</p>
                                  
                                  {!notif.read && (
                                    <button 
                                      onClick={(e) => handleMarkRead(notif.id, e)}
                                      className="text-[9px] font-bold text-blue-600 mt-1.5 hover:underline block"
                                    >
                                      ✓ تعليم كقروء
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-8 text-center text-xs text-slate-400 font-medium">
                              لا توجد إشعارات حالياً
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
               </div>
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
                              style={{ width: `${getStageProgress(order.stage)}%` }} 
                             />
                          </div>
                          <span className="text-[10px] font-black text-blue-600">{getStageProgress(order.stage)}%</span>
                       </div>
                    </div>
  
                    <div className="lg:w-80 bg-slate-900 rounded-xl p-6 text-white relative overflow-hidden">
                       <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
                       <div className="relative z-10 space-y-4">
                          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 border-b border-white/5 pb-2">بيانات التكلفة المعتمدة للفاتورة</h4>
                          <div className="space-y-1">
                             <p className="text-xs text-white/60">إجمالي الطلب بالدولار</p>
                             <p className="text-xl font-black text-white tracking-tighter">${order.price || '0.00'}</p>
                          </div>
                          <div className="space-y-1 border-t border-white/5 pt-2">
                             <p className="text-xs text-white/60">القيمة الإجمالية بالدينار الجزائري</p>
                             <p className="text-lg font-extrabold text-blue-400 tracking-tight">{((Number(order.price) || 0) * (Number(order.exchangeRate) || 220)).toLocaleString('ar-DZ')} دج</p>
                             <p className="text-[9px] text-white/40">سعر الصرف المحجوز للطلب: 1$ = {order.exchangeRate || 220} دج</p>
                          </div>
                          <div className="space-y-1 border-t border-white/5 pt-2 text-[10px] space-y-1 text-white/60">
                             <div className="flex justify-between">
                                <span>العربون (30%):</span>
                                <span className="font-bold text-emerald-400">{Math.round((Number(order.price) || 0) * (Number(order.exchangeRate) || 220) * 0.3).toLocaleString('ar-DZ')} دج</span>
                             </div>
                             <div className="flex justify-between">
                                <span>المتبقي (70%):</span>
                                <span className="font-bold text-amber-400">{Math.round((Number(order.price) || 0) * (Number(order.exchangeRate) || 220) * 0.7).toLocaleString('ar-DZ')} دج</span>
                             </div>
                          </div>
                          <div className="space-y-3 pt-2 text-[10px] border-t border-white/5">
                             <div className="flex justify-between">
                                <span>حالة الملف</span>
                                <span className="text-emerald-400 font-bold uppercase">{order.stage}</span>
                             </div>
                             <div className="flex justify-between">
                                <span>المصدر</span>
                                <span>{order.source}</span>
                             </div>
                          </div>
                          <button className="w-full py-3 bg-blue-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/50">
                             عرض التفاصيل والالتزام
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
            <DocumentCenter orderId={order?.id} />
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

