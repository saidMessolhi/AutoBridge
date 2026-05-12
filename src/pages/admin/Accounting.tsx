import { motion } from 'motion/react';
import { DashboardShell } from '../../components/layout/DashboardShell';
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft, 
  PieChart, 
  Download,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';

export function Accounting() {
  return (
    <DashboardShell>
      <div className="space-y-8">
        {/* Financial Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
             <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                   <ArrowUpRight className="w-6 h-6" />
                </div>
                <PieChart className="w-5 h-5 text-gray-300" />
             </div>
             <p className="text-gray-500 text-sm font-medium mb-1">إجمالي المداخيل (هذا الشهر)</p>
             <h3 className="text-3xl font-black text-gray-900 tracking-tight">1,250,500 دج</h3>
             <p className="text-[10px] text-green-600 font-bold mt-2">+12.5% مقارنة بالشهر السابق</p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
             <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
                   <ArrowDownLeft className="w-6 h-6" />
                </div>
                <PieChart className="w-5 h-5 text-gray-300" />
             </div>
             <p className="text-gray-500 text-sm font-medium mb-1">إجمالي المصاريف</p>
             <h3 className="text-3xl font-black text-gray-900 tracking-tight">450,200 دج</h3>
             <p className="text-[10px] text-red-600 font-bold mt-2">-5.2% رسوم جمارك وشحن</p>
          </div>

          <div className="bg-blue-600 p-8 rounded-3xl text-white shadow-xl shadow-blue-100">
             <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                   <DollarSign className="w-6 h-6" />
                </div>
             </div>
             <p className="text-white/60 text-sm font-medium mb-1">صافي الأرباح</p>
             <h3 className="text-3xl font-black tracking-tight">800,300 دج</h3>
             <button className="mt-4 text-xs font-bold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors">تحميل التقرير الكامل</button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
           <div className="p-8 border-b border-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">سجل المعاملات المالية</h3>
              <div className="flex gap-2">
                 <button className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-500">
                    <Filter className="w-5 h-5" />
                 </button>
                 <button className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-500">
                    <Download className="w-5 h-5" />
                 </button>
              </div>
           </div>

           <div className="overflow-x-auto text-right">
              <table className="w-full">
                 <thead>
                    <tr className="bg-gray-50 text-[10px] uppercase font-black tracking-[0.2em] text-gray-400">
                       <th className="px-8 py-4">المعرف</th>
                       <th className="px-8 py-4">العميل</th>
                       <th className="px-8 py-4">النوع</th>
                       <th className="px-8 py-4">المبلغ</th>
                       <th className="px-8 py-4">الحالة</th>
                       <th className="px-8 py-4">التاريخ</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {[
                      { id: 'TRX-1029', user: 'محمد فوزي', type: 'عربون (30%)', amount: '1,500,000 دج', status: 'PAID', date: '08 ماي, 2024' },
                      { id: 'TRX-1030', user: 'ياسين كريم', type: 'رسوم الشحن', amount: '250,000 دج', status: 'PENDING', date: '10 ماي, 2024' },
                      { id: 'TRX-1031', user: 'سارة لعموري', type: 'المستحقات النهائية', amount: '2,800,000 دج', status: 'OVERDUE', date: '01 ماي, 2024' },
                    ].map((trx, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                         <td className="px-8 py-6 font-mono text-xs text-gray-400">#{trx.id}</td>
                         <td className="px-8 py-6 font-bold text-gray-900 text-sm">{trx.user}</td>
                         <td className="px-8 py-6 text-sm text-gray-500">{trx.type}</td>
                         <td className="px-8 py-6 font-black text-gray-900 text-sm tracking-tight">{trx.amount}</td>
                         <td className="px-8 py-6">
                            <div className={cn(
                              "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold",
                              trx.status === 'PAID' ? "bg-green-50 text-green-600" : 
                              trx.status === 'PENDING' ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-600"
                            )}>
                               {trx.status === 'PAID' ? <CheckCircle2 className="w-3 h-3" /> : 
                                trx.status === 'PENDING' ? <Clock className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                               {trx.status === 'PAID' ? 'تم الدفع' : trx.status === 'PENDING' ? 'قيد الانتظار' : 'متأخر'}
                            </div>
                         </td>
                         <td className="px-8 py-6 text-xs text-gray-400 italic">{trx.date}</td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      </div>
    </DashboardShell>
  );
}
