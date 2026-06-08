import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { DashboardShell } from '../../components/layout/DashboardShell';
import { NewOrderModal } from '../../components/orders/NewOrderModal';
import { CredentialsModal } from '../../components/orders/CredentialsModal';
import { OrderLifecycle } from '../../components/orders/OrderLifecycle';
import { ImportStage } from '../../types';
import { cn, canUserSeeOrder } from '../../lib/utils';
import { dbSync } from '../../services/dbSync';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  MapPin, 
  DollarSign, 
  Calendar,
  ExternalLink
} from 'lucide-react';

export function AdminDashboard() {
  const [userRole, setUserRole] = React.useState('المدير العام');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [showCredentials, setShowCredentials] = React.useState<any>(null);
  const [orders, setOrders] = React.useState<any[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [exchangeRate, setExchangeRate] = React.useState<number>(220);
  
  React.useEffect(() => {
    const savedUser = localStorage.getItem('mockUser');
    let role = 'المدير العام';
    if (savedUser) {
      role = JSON.parse(savedUser).role;
      setUserRole(role);
    }

    // Subscribe to real-time orders in Firestore with safe local fallback
    const unsubscribeOrders = dbSync.subscribeToOrders((allOrders) => {
      const filtered = allOrders.filter((order: any) => canUserSeeOrder(role, order.stage));
      setOrders(filtered);
    });

    const unsubscribeRate = dbSync.subscribeToExchangeRate((currentRate) => {
      setExchangeRate(currentRate);
    });

    return () => {
      unsubscribeOrders();
      unsubscribeRate();
    };
  }, []);

  const handleSaveOrder = async (data: any) => {
    const orderId = Math.random().toString(36).substr(2, 9);
    // Use email as username if provided
    const username = data.email || `u${data.phone1?.slice(-6) || Math.floor(1000 + Math.random() * 9000)}`;
    const password = Math.random().toString(36).substr(2, 8).toUpperCase();

    const newOrder = { 
      id: orderId, 
      ...data, 
      date: new Date().toLocaleDateString('ar-DZ'),
      portalUsername: username
    };
    
    // Save to Firestore real-time (will automatically propagate to the lists)
    await dbSync.saveOrder(newOrder);

    // Save to portal users (authenticated clients)
    const clientUser = {
      id: orderId,
      username,
      password,
      role: 'CLIENT',
      clientName: data.client,
      email: data.email,
      orderId: orderId
    };
    await dbSync.savePortalUser(clientUser);

    // Simulate sending email
    if (data.email) {
      console.log(`Sending email to ${data.email}... Credentials: ${username} / ${password}`);
    }

    setIsModalOpen(false);
    setTimeout(() => {
      setShowCredentials({ client: data.client, username, password });
    }, 300);
  };

  const totalOrders = orders.length;
  const inTransit = orders.filter(o => o.stage === 'IN_TRANSIT' || o.stage === 'SHIPPED' || o.stage === 'IN_TRANSIT' || o.stage === 'SHIPPED').length;
  
  const totalIncomeUSD = orders.reduce((sum, o) => sum + (Number(o.price) || 0), 0);
  const totalIncomeDZD = orders.reduce((sum, o) => {
    const priceUSD = Number(o.price) || 0;
    const rate = Number(o.exchangeRate) || exchangeRate;
    return sum + (priceUSD * rate);
  }, 0);
  const formattedIncome = totalIncomeDZD > 0 
    ? totalIncomeDZD.toLocaleString('ar-DZ') + ' دج' 
    : '850,000 دج';

  const newRequests = orders.filter(o => o.stage === 'NEW_REQUEST' || o.stage === 'UNDER_REVIEW' || o.stage === 'SEARCHING_CAR').length;

  const allStats = [
    { label: 'إجمالي الطلبات', value: totalOrders.toString(), trend: '+12% هذا الشهر', icon: Search, roles: ['المدير العام', 'عون استقبال / مسؤول ملفات', 'مسؤول الصين'] },
    { label: 'سيارات في الطريق', value: inTransit.toString(), trend: `${inTransit} في الشحن حالياً`, icon: MapPin, roles: ['المدير العام', 'مسؤول الصين'] },
    { label: 'مداخيل الشهر', value: formattedIncome, trend: totalIncomeUSD > 0 ? `مجموع قيم السيارات: $${totalIncomeUSD.toLocaleString()}` : '+5.4%', icon: DollarSign, roles: ['المدير العام', 'المحاسب'] },
    { label: 'طلبات جديدة', value: newRequests.toString(), trend: newRequests > 0 ? 'تحتاج فحص وتعميد' : 'لا توجد طلبات معلقة', icon: Plus, roles: ['المدير العام', 'عون استقبال / مسؤول ملفات'] },
  ];

  const filteredStats = allStats.filter(stat => stat.roles.includes(userRole));

  const filteredOrders = orders.filter(order => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return (
      (order.client || '').toLowerCase().includes(q) ||
      (order.car || '').toLowerCase().includes(q) ||
      (order.vin || '').toLowerCase().includes(q) ||
      (order.phone1 || '').toLowerCase().includes(q)
    );
  });

  return (
    <DashboardShell>
      <div className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">نظرة عامة على العمليات</h2>
            <p className="text-xs text-brand-muted mt-1 uppercase font-medium">متابعة وإدارة ملفات الاستيراد الجارية</p>
          </div>
          {(userRole === 'المدير العام' || userRole === 'عون استقبال / مسؤول ملفات') && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> فتح ملف استيراد جديد
            </button>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredStats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-xl border border-brand-border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <stat.icon className="w-5 h-5 text-slate-600" />
                </div>
                <button className="text-slate-300 hover:text-slate-500">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              <h4 className="text-brand-muted text-[11px] font-bold uppercase tracking-wider mb-1">{stat.label}</h4>
              <p className="text-2xl font-bold text-slate-900 mb-2">{stat.value}</p>
              <span className="text-[10px] text-green-600 font-bold bg-green-50 px-2.5 py-1 rounded-full uppercase tracking-tighter">{stat.trend}</span>
            </motion.div>
          ))}
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl border border-brand-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-brand-border flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">آخر طلبات الاستيراد</h3>
              <p className="text-xs text-brand-muted mt-1">جرد كامل لجميع العمليات الجارية حالياً</p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث برقم VIN او العميل..." 
                  className="pr-9 pl-4 py-2 bg-slate-50 border border-brand-border rounded-lg text-xs focus:ring-1 focus:ring-blue-500 w-64 outline-none"
                />
              </div>
              <button className="p-2 bg-slate-50 border border-brand-border text-slate-600 rounded-lg hover:bg-slate-100">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
 
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-slate-50/50 text-brand-muted text-[10px] font-bold uppercase tracking-[0.2em] border-b border-brand-border">
                  <th className="px-6 py-4">العميل</th>
                  <th className="px-6 py-4">السيارة</th>
                  <th className="px-6 py-4">المرحلة الحالية</th>
                  <th className="px-6 py-4">آخر تحديث</th>
                  <th className="px-6 py-4 text-left">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {filteredOrders.slice(0, 5).map((order, i) => (
                  <tr key={order.id || i} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-600 text-[10px] font-bold border border-brand-border uppercase">
                          {order.client?.split(' ').map((n: string) => n[0]).join('') || '??'}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-700">{order.client}</span>
                          {order.email && <span className="text-[9px] text-blue-500 font-mono italic truncate max-w-[120px]">{order.email}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-bold text-slate-900 uppercase tracking-tight">{order.car}</div>
                      <div className="text-[9px] text-brand-muted font-mono uppercase tracking-tighter mt-0.5">VIN: {order.vin || 'LB3GY8...492'}</div>
                    </td>
                    <td className="px-6 py-4 max-w-[200px]">
                       <div className="flex items-center gap-2">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[9px] font-bold uppercase",
                            order.stage === ImportStage.IN_TRANSIT && "bg-blue-50 text-blue-600",
                            order.stage === ImportStage.DEPOSIT_PAID && "bg-amber-50 text-amber-600",
                            order.stage === ImportStage.PURCHASED && "bg-indigo-50 text-indigo-600",
                            order.stage === ImportStage.ARRIVED_PORT && "bg-emerald-50 text-emerald-600",
                            !order.stage && "bg-slate-100 text-slate-600"
                          )}>
                             {order.stage}
                          </span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-[10px] text-brand-muted font-medium italic">
                        <Calendar className="w-3 h-3" />
                        {order.date || 'منذ ساعتين'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-left">
                      <Link 
                        to={`/admin/orders/${order.id}`}
                        className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors inline-block"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <NewOrderModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveOrder}
      />

      <CredentialsModal 
        isOpen={!!showCredentials}
        onClose={() => setShowCredentials(null)}
        data={showCredentials}
      />
    </DashboardShell>
  );
}
