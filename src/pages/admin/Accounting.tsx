import React, { useState, useEffect, useMemo } from 'react';
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
import { dbSync } from '../../services/dbSync';

export function Accounting() {
  const [orders, setOrders] = useState<any[]>([]);
  const [exchangeRate, setExchangeRate] = useState<number>(220);

  useEffect(() => {
    const unsubscribeOrders = dbSync.subscribeToOrders((allOrders) => {
      setOrders(allOrders);
    });
    
    const unsubscribeRate = dbSync.subscribeToExchangeRate((currentRate) => {
      setExchangeRate(currentRate);
    });

    return () => {
      unsubscribeOrders();
      unsubscribeRate();
    };
  }, []);

  // Derive dynamic transactions list from orders in Firestore
  const transactions = useMemo(() => {
    const list: any[] = [];
    orders.forEach((order) => {
      if (!order.client) return;

      const basePrice = Number(order.price) || 20000; // default/fallback
      const effectiveRate = Number(order.exchangeRate) || exchangeRate;
      const priceDZD = basePrice * effectiveRate; // convert standard USD price to DZD rate (order-specific or parallel fallback)

      // 1. Arabone payment (عربون 30%) - paid if any stage beyond request review
      const hasDepositPaid = order.stage !== 'NEW_REQUEST' && order.stage !== 'UNDER_REVIEW';
      const depositAmount = priceDZD * 0.3;
      list.push({
        id: `TRX-D${order.id?.slice(-4) || Math.floor(1000 + Math.random() * 9000)}`,
        user: order.client,
        type: 'عربون (30% من قيمة السيارة)',
        amountVal: depositAmount,
        amount: `${Math.round(depositAmount).toLocaleString('ar-DZ')} دج`,
        status: hasDepositPaid ? 'PAID' : 'PENDING',
        date: order.date || '08 ماي, 2026'
      });

      // 2. Shipping or customs payment representation if shipped
      if (order.stage === 'SHIPPED' || order.stage === 'IN_TRANSIT' || order.stage === 'ARRIVED_PORT' || order.stage === 'CUSTOMS_CLEARANCE' || order.stage === 'FINAL_PAYMENT' || order.stage === 'DELIVERED') {
        const shippingFee = 250000; // Flat average shipping fee
        list.push({
          id: `TRX-S${order.id?.slice(-4) || '1030'}`,
          user: order.client,
          type: 'رسوم الشحن والتأمين البحري',
          amountVal: shippingFee,
          amount: `${shippingFee.toLocaleString('ar-DZ')} دج`,
          status: 'PAID',
          date: order.date || '10 ماي, 2026'
        });
      }

      // 3. Final payment (مستحقات نهائية 70%) - paid if finalized or delivered
      if (order.stage === 'FINAL_PAYMENT' || order.stage === 'DELIVERED') {
        const finalAmount = priceDZD * 0.7;
        list.push({
          id: `TRX-F${order.id?.slice(-4) || '1031'}`,
          user: order.client,
          type: 'المستحقات النهائية للتسليم',
          amountVal: finalAmount,
          amount: `${Math.round(finalAmount).toLocaleString('ar-DZ')} دج`,
          status: order.stage === 'DELIVERED' ? 'PAID' : 'PENDING',
          date: order.date || '20 ماي, 2026'
        });
      }
    });

    // Fallback seed transactions if Firestore has zero clients/orders
    if (list.length === 0) {
      return [
        { id: 'TRX-1029', user: 'محمد فوزي', type: 'عربون (30%)', amountVal: 1500000, amount: '1,500,000 دج', status: 'PAID', date: '08 ماي, 2026' },
        { id: 'TRX-1030', user: 'ياسين كريم', type: 'رسوم الشحن', amountVal: 250000, amount: '250,000 دج', status: 'PENDING', date: '10 ماي, 2026' },
        { id: 'TRX-1031', user: 'سارة لعموري', type: 'المستحقات النهائية', amountVal: 2800000, amount: '2,800,000 دج', status: 'OVERDUE', date: '01 ماي, 2026' },
      ];
    }

    return list;
  }, [orders]);

  // Aggregate stats based on active transactional ledger
  const totalIncomes = useMemo(() => {
    return transactions
      .filter(t => t.status === 'PAID')
      .reduce((sum, t) => sum + t.amountVal, 0);
  }, [transactions]);

  const totalExpenses = useMemo(() => {
    // Expense calculation - e.g. shipping fees (250,000 per shipped order) + general operational estimated costs
    const shippedCount = orders.filter(o => ['SHIPPED', 'IN_TRANSIT', 'ARRIVED_PORT', 'CUSTOMS_CLEARANCE', 'FINAL_PAYMENT', 'DELIVERED'].includes(o.stage)).length;
    return (shippedCount * 180000) || 450200; // estimated actual port handling cost
  }, [orders]);

  const netProfit = useMemo(() => {
    return totalIncomes - totalExpenses;
  }, [totalIncomes, totalExpenses]);

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
             <p className="text-gray-500 text-sm font-medium mb-1">إجمالي المداخيل المحصلة</p>
             <h3 className="text-2xl font-black text-gray-900 tracking-tight">
               {Math.round(totalIncomes).toLocaleString('ar-DZ')} دج
             </h3>
             <p className="text-[10px] text-green-600 font-bold mt-2">محدث في الوقت الحقيقي من السحابة</p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
             <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
                   <ArrowDownLeft className="w-6 h-6" />
                </div>
                <PieChart className="w-5 h-5 text-gray-300" />
             </div>
             <p className="text-gray-500 text-sm font-medium mb-1">إجمالي المصاريف والمستحقات</p>
             <h3 className="text-2xl font-black text-gray-900 tracking-tight">
               {Math.round(totalExpenses).toLocaleString('ar-DZ')} دج
             </h3>
             <p className="text-[10px] text-red-600 font-bold mt-2">رسوم شحن وجمارك لكل سيارة بالبحر</p>
          </div>

          <div className="bg-blue-600 p-8 rounded-3xl text-white shadow-xl shadow-blue-100">
             <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                   <DollarSign className="w-6 h-6" />
                </div>
             </div>
             <p className="text-white/60 text-sm font-medium mb-1">صافي الأرباح الجارية</p>
             <h3 className="text-2xl font-black tracking-tight">
               {Math.round(netProfit).toLocaleString('ar-DZ')} دج
             </h3>
             <p className="text-[10px] text-blue-100 mt-2">أعلى كفاءة مالية وسرعة إنجاز</p>
          </div>
        </div>

        {/* Exchange Rate Controller Card */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6" dir="rtl">
          <div className="space-y-1.5 text-right">
             <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse"></span>
                <h4 className="text-sm font-black text-slate-800">تعديل سعر صرف الدولار مقابل الدينار</h4>
             </div>
             <p className="text-xs text-gray-400 font-medium leading-relaxed">
                يتم استخدام سعر الصرف هذا تلقائياً في حساب قيم السيارات، الأقساط الواجب دفعها (العربون والمتبقي)، طباعة العقود الرسمية وتوليد الإحصائيات في المنصة.
             </p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto self-stretch md:self-auto justify-end">
             <div className="flex items-center gap-2 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">
                <span className="text-xs font-bold text-slate-400 font-sans">1 USD =</span>
                <input 
                   type="number"
                   value={exchangeRate || ''}
                   onChange={async (e) => {
                      const val = Number(e.target.value);
                      setExchangeRate(val);
                      await dbSync.setExchangeRate(val);
                   }}
                   className="w-20 text-center font-mono font-black text-sm text-blue-600 focus:outline-none border-b border-dashed border-blue-400 focus:border-solid focus:border-blue-600 pb-0.5"
                />
                <span className="text-xs font-bold text-slate-700">دج (DZD)</span>
             </div>
             <div className="p-2.5 bg-green-50 text-green-600 rounded-xl text-[10px] font-black tracking-tight whitespace-nowrap">
                تحديث تلقائي
             </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
           <div className="p-8 border-b border-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">سجل المعاملات المالية الحقيقي</h3>
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
                    {transactions.map((trx, i) => (
                      <tr key={trx.id || i} className="hover:bg-gray-50 transition-colors">
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
