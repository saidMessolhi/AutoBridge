import React from 'react';
import { motion } from 'motion/react';
import { DashboardShell } from '../../components/layout/DashboardShell';
import { Search, Filter, ExternalLink, Calendar, Plus, Edit2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ImportStage } from '../../types';
import { cn, canUserSeeOrder } from '../../lib/utils';
import { NewOrderModal } from '../../components/orders/NewOrderModal';
import { CredentialsModal } from '../../components/orders/CredentialsModal';

export function OrdersPage() {
  const [userRole, setUserRole] = React.useState('المدير العام');
  const [orders, setOrders] = React.useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingOrder, setEditingOrder] = React.useState<any>(null);
  const [showCredentials, setShowCredentials] = React.useState<any>(null);

  React.useEffect(() => {
    const savedUser = localStorage.getItem('mockUser');
    let role = 'المدير العام';
    if (savedUser) {
      role = JSON.parse(savedUser).role;
      setUserRole(role);
    }

    const saved = localStorage.getItem('import_orders');
    const allOrders = saved ? JSON.parse(saved) : [
      { id: '1', client: 'محمد فوزي', car: 'Geely Monjaro 2024', stage: ImportStage.IN_TRANSIT, date: '08/05/2024', phone1: '0550123456', passportNumber: '123456789' },
      { id: '2', client: 'ياسين كريم', car: 'BYD Seal Premium', stage: ImportStage.PURCHASED, date: '07/05/2024', phone1: '0660987654', passportNumber: '987654321' },
    ];

    // Filter orders based on role
    const filtered = allOrders.filter((order: any) => canUserSeeOrder(role, order.stage));
    setOrders(filtered);
  }, []);

  React.useEffect(() => {
    if (orders.length > 0) {
      // We should be careful about overwriting all orders with filtered ones in localStorage
      // In a real app, localStorage would hold all orders, and we'd filter for display
      // Here, let's just make sure we don't accidentally delete orders from localStorage 
      // if we are a restricted user.
      const savedUser = localStorage.getItem('mockUser');
      const role = savedUser ? JSON.parse(savedUser).role : 'المدير العام';
      
      if (role === 'المدير العام') {
         localStorage.setItem('import_orders', JSON.stringify(orders));
      }
    }
  }, [orders]);

  const handleSaveOrder = (data: any) => {
    let credentials = null;

    if (editingOrder) {
      setOrders(orders.map((o: any) => o.id === editingOrder.id ? { ...o, ...data } : o));
    } else {
      const orderId = Math.random().toString(36).substr(2, 9);
      // Use email as username if provided, otherwise fallback to generated one
      const username = data.email || `u${data.phone1?.slice(-6) || Math.floor(1000 + Math.random() * 9000)}`;
      const password = Math.random().toString(36).substr(2, 8).toUpperCase();

      const newOrder = { 
        id: orderId, 
        ...data, 
        date: new Date().toLocaleDateString('ar-DZ'),
        portalUsername: username
      };
      setOrders([newOrder, ...orders]);

      // Save to portal users
      const savedAccounts = localStorage.getItem('portal_users');
      const accounts = savedAccounts ? JSON.parse(savedAccounts) : [];
      accounts.push({
        id: orderId,
        username,
        password,
        role: 'CLIENT',
        clientName: data.client,
        email: data.email,
        orderId: orderId
      });
      localStorage.setItem('portal_users', JSON.stringify(accounts));

      // Simulate sending email
      if (data.email) {
        console.log(`Sending email to ${data.email}... Credentials: ${username} / ${password}`);
        // In a real app, this would be an API call to a mail service
      }

      credentials = { client: data.client, username, password };
    }

    setIsModalOpen(false);
    setEditingOrder(null);
    
    if (credentials) {
      setTimeout(() => setShowCredentials(credentials), 300);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الملف؟')) {
      setOrders(orders.filter(o => o.id !== id));
    }
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">إدارة كافة الطلبات</h2>
            <p className="text-xs text-brand-muted mt-1 uppercase font-medium">عرض وجرد شامل لجميع ملفات الاستيراد</p>
          </div>
          <button 
            onClick={() => { setEditingOrder(null); setIsModalOpen(true); }}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2"
          >
             جديد <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white rounded-xl border border-brand-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-brand-border flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none">
                <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                <input 
                  type="text" 
                  placeholder="بحث..." 
                  className="pr-9 pl-4 py-2 bg-slate-50 border border-brand-border rounded-lg text-xs focus:ring-1 focus:ring-blue-500 w-full md:w-80 outline-none"
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
                  <th className="px-6 py-4">الحالة</th>
                  <th className="px-6 py-4">التاريخ</th>
                  <th className="px-6 py-4 text-left">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {orders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700">{order.client}</span>
                        <div className="flex flex-col gap-0.5 mt-0.5">
                          <span className="text-[9px] text-brand-muted font-mono">{order.phone1}</span>
                          {order.email && <span className="text-[9px] text-blue-500 font-mono truncate max-w-[150px]">{order.email}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-bold text-slate-900 uppercase">{order.car}</div>
                      <div className="text-[9px] text-brand-muted font-mono mt-0.5">LB3GY8...492</div>
                    </td>
                    <td className="px-6 py-4">
                       <span className={cn(
                         "px-2 py-0.5 rounded text-[9px] font-bold uppercase",
                         order.stage === ImportStage.DEPOSIT_PAID && "bg-amber-50 text-amber-600 border border-amber-100",
                         order.stage === ImportStage.IN_TRANSIT && "bg-blue-50 text-blue-600 border border-blue-100",
                         order.stage === ImportStage.SHIPPED && "bg-indigo-50 text-indigo-600 border border-indigo-100",
                         order.stage === ImportStage.ARRIVED_PORT && "bg-emerald-50 text-emerald-600 border border-emerald-100",
                         order.stage === ImportStage.DELIVERED && "bg-slate-900 text-white"
                       )}>
                          {order.stage}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[10px] text-brand-muted">{order.date}</div>
                    </td>
                    <td className="px-6 py-4 text-left">
                      <div className="flex items-center gap-2 justify-end">
                        <button 
                          onClick={() => { setEditingOrder(order); setIsModalOpen(true); }}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                          title="تعديل"
                        >
                           <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(order.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="حذف"
                        >
                           <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <Link to={`/admin/orders/${order.id}`} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
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
        onClose={() => { setIsModalOpen(false); setEditingOrder(null); }}
        onSave={handleSaveOrder}
        initialData={editingOrder}
      />

      <CredentialsModal 
        isOpen={!!showCredentials}
        onClose={() => setShowCredentials(null)}
        data={showCredentials}
      />
    </DashboardShell>
  );
}
