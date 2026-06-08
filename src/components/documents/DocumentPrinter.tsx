import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Printer, Shield, CheckCircle2, ChevronLeft, Award, Download, Loader2 } from 'lucide-react';
import { dbSync } from '../../services/dbSync';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface DocumentPrinterProps {
  isOpen: boolean;
  onClose: () => void;
  document: {
    id: string;
    isSystem?: boolean;
    name: string;
    category: string;
    date: string;
    size?: string;
  } | null;
  order: any;
}

export function DocumentPrinter({ isOpen, onClose, document, order }: DocumentPrinterProps) {
  if (!isOpen || !document || !order) return null;

  const printableRef = React.useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = React.useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!printableRef.current) return;
    setIsDownloading(true);
    try {
      const element = printableRef.current;
      
      // Select higher quality scale for a razor-sharp print representation
      // We set useCORS to false to prevent cross-origin resources (like google webfonts)
      // from tainting the canvas and causing SecurityError on toDataURL()
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: false,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      
      // A4 dimensions: 210mm x 297mm
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add remaining pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Generate a clean ASCII-only filename to avoid encoding/saving errors in secure contexts and older browsers
      let englishFilename = 'document';
      const docName = document.name || '';
      if (docName.includes('عقد')) {
        englishFilename = 'contract';
      } else if (docName.includes('عربون') || docName.includes('وصل')) {
        englishFilename = 'receipt';
      } else if (docName.includes('فاتورة')) {
        englishFilename = 'invoice';
      } else if (docName.includes('جمرك') || docName.includes('بطاقة')) {
        englishFilename = 'customs';
      } else if (docName.includes('تسليم') || docName.includes('محضر')) {
        englishFilename = 'delivery';
      }

      pdf.save(`${englishFilename}_${order.id || 'doc'}.pdf`);
    } catch (err: any) {
      console.error('Error generating PDF:', err);
      alert(`فشل توليد وثيقة الـ PDF: ${err?.message || err}. يرجى استخدام زر الطباعة "طباعة المستند" لطباعة أو حفظ الملف مباشرة بصيغة PDF.`);
    } finally {
      setIsDownloading(false);
    }
  };

  const invoiceNumber = `AB-INV-${order.id?.slice(-5).toUpperCase() || '73829'}`;
  const contractNumber = `AB-CON-${order.id?.slice(-5).toUpperCase() || '10291'}`;
  const customsNumber = `AB-CUST-${order.id?.slice(-5).toUpperCase() || '44810'}`;

  const [exchangeRate, setExchangeRate] = React.useState<number>(220);

  React.useEffect(() => {
    const unsubscribe = dbSync.subscribeToExchangeRate((rate) => {
      setExchangeRate(rate);
    });
    return () => unsubscribe();
  }, [isOpen]);

  // Derive prices
  const priceUSD = Number(order.price) || 24500;
  const effectiveRate = Number(order.exchangeRate) || exchangeRate;
  const priceDZD = Math.round(priceUSD * effectiveRate); // Parallel market exchange rate
  const depositDZD = Math.round(priceDZD * 0.3);
  const remainingDZD = Math.round(priceDZD * 0.7);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden font-sans my-8 max-h-[85vh] sm:max-h-[90vh] flex flex-col print:max-h-none print:h-auto print:block print:my-0 print:rounded-none print:shadow-none"
        >
          {/* Header Controls (Hidden during print) */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center print:hidden">
            <div className="hidden sm:flex items-center gap-3">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">نظام معاينة وطباعة الوثائق المعتمد</span>
            </div>
            <div className="flex sm:hidden items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[9px] font-bold text-slate-500">معاينة المستند</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={isDownloading}
                onClick={handleDownloadPDF}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white px-3 sm:px-5 py-2 rounded-xl text-xs font-black transition-all shadow-md shadow-emerald-100 disabled:shadow-none cursor-pointer disabled:cursor-not-allowed"
              >
                {isDownloading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>{isDownloading ? 'جاري التحميل...' : 'تحميل PDF'}</span>
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-5 py-2 rounded-xl text-xs font-black transition-all shadow-md shadow-blue-200"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* PRINTABLE AREA */}
          <div ref={printableRef} className="p-12 md:p-16 bg-white min-h-[297mm] text-right text-slate-800 print:p-0 select-text font-sans relative flex-1 overflow-y-auto print:overflow-visible">
            {/* Background Seal Watermark for Print Authenticity */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
              <Shield className="w-96 h-96" />
            </div>

            {/* Official Station Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-8">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center font-bold text-white text-xl">A</div>
                  <div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight">AutoBridge Algeria</h1>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono">Official Logistics & Import Service</p>
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 mt-4 leading-relaxed font-mono">
                  <p>الشركة الوطنية لاستيراد وتسهيل اقتناء السيارات الفاخرة</p>
                  <p>الجزائر العاصمة ⁃ البرج ⁃ وهران ⁃ الصين</p>
                  <p>الهاتف: 0550123456 | البريد: support@autobridge.dz</p>
                </div>
              </div>
              <div className="text-left">
                <div className="font-mono text-slate-400 text-sm">ORIGINAL DOCUMENT</div>
                <div className="font-mono text-[10px] text-slate-500 mt-2">
                  <p>التاريخ: {document.date || new Date().toLocaleDateString('ar-DZ')}</p>
                  <p>الرقم المرجعي: <span className="font-bold text-slate-900">#{document.id}</span></p>
                  <p>المشغل: {order.portalUsername || 'النظام التفاعلي'}</p>
                </div>
                <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded text-[9px] font-bold">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>وثيقة معتمدة وموقعة إلكترونياً</span>
                </div>
              </div>
            </div>

            {/* Document Title Cover */}
            <div className="text-center my-6">
              <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight border-double border-b-4 border-slate-900 pb-3 inline-block px-12">
                {document.name}
              </h2>
            </div>

            {/* Parties Info Section */}
            <div className="grid grid-cols-2 gap-8 my-8 bg-slate-50 p-6 rounded-2xl border border-slate-100 font-mono text-[11px]">
              <div>
                <h4 className="font-black text-slate-900 border-b border-slate-200 pb-2 mb-3 text-xs">١. بيانات الجهة المصدرة (الوكيل)</h4>
                <p className="mb-1"><span className="text-slate-400">الوكيل المفوّض:</span> شركة أوتو بريدج للاستيراد اللوجستي</p>
                <p className="mb-1"><span className="text-slate-400">السجل التجاري:</span> Alg/16/00/A-449-3023</p>
                <p className="mb-1"><span className="text-slate-400">قناة التوريد المباشرة:</span> مصانع الصين والمقاطعات الحرة</p>
                <p className="mb-1"><span className="text-slate-400">مسؤول الملف:</span> إدارة الشؤون الجمركية والتوريد</p>
              </div>
              <div>
                <h4 className="font-black text-slate-900 border-b border-slate-100 pb-2 mb-3 text-xs">٢. بيانات الطرف الثاني (العميل المستورد)</h4>
                <p className="mb-1"><span className="text-slate-400">اسم العميل بالكامل:</span> <span className="font-bold text-slate-900 text-xs">{order.client}</span></p>
                <p className="mb-1"><span className="text-slate-400">رقم الهاتف:</span> {order.phone1 || 'غير متوفر'}</p>
                <p className="mb-1"><span className="text-slate-400">جواز السفر:</span> {order.passportNumber || 'N/A'}</p>
                <p className="mb-1"><span className="text-slate-400">اسم المستخدم للولوج:</span> {order.portalUsername || 'غير معلّم'}</p>
              </div>
            </div>

            {/* DOCUMENT BODY CONTENT SWITCH */}
            <div className="text-xs leading-relaxed space-y-6 text-slate-700 min-h-[350px]">
              {/* Type 1: العقد الرسمي للوكالة والتوريد */}
              {document.name.includes('عقد الوكالة') && (
                <>
                  <p><strong>تم الاتفاق والتعاقد بمقتضى هذه الوثيقة بين كل من شركة أوتو بريدج للسيارات والعميل المذكور أعلاه وفق البنود التالية:</strong></p>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">المادة الأولى: موضوع التعاقد</h4>
                      <p>يلتزم الوكيل (أوتو بريدج) بتسخير قنواته الاستيرادية واللوجستية لشراء وتحضير السيارة المحددة أدناه وشحنها من الصين وتوصيلها إلى ميناء الجزائر لتسليمها للطرف الثاني:</p>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-2 font-mono grid grid-cols-2 gap-4">
                        <p><strong>العلامة والطراز:</strong> {order.car}</p>
                        <p><strong>رقم الشاسيه VIN:</strong> {order.vin || 'L-B3G-Y8-X-492'}</p>
                        <p><strong>دولة التصدير:</strong> الصين (مقاطعة نينغبو حرة)</p>
                        <p><strong>قيمة تمويل المركبة:</strong> ${priceUSD.toLocaleString()} USD</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">المادة الثانية: الالتزامات المالية وطريقة الدفع</h4>
                      <p>يلتزم الطرف الثاني بدفع مبلغ عربون جدي نسبته (30%) من إجمالي القيمة التقديرية للسيارة بالدج والمقدرة بـ <strong>({depositDZD.toLocaleString('ar-DZ')} دج)</strong> فور توقيع العقد، ويتم تحويل بقية التكاليف شاملة الشحن والتخليص الجمركي عند وصول المركبة للموانئ الجزائرية بحد أقصى 7 أيام من تاريخ الإخطار.</p>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">المادة الثالثة: مدة ومراحل التوريد</h4>
                      <p>تقدر فترة الشحن البحري والتوريد الإجمالية بين 45 إلى 60 يوماً من تاريخ دفع العربون. في حال حدوث أي تأخير لوجستي ناتج عن القوة القاهرة أو اضطرابات خطوط الشحن العالمي، يلتزم الوكيل بإخطار المستورد فوراً وتعديل الجدول الزمني دون أدنى مسؤولية مالية إضافية.</p>
                    </div>
                  </div>
                </>
              )}

              {/* Type 2: وصل استلام العربون */}
              {document.name.includes('وصل استلام العربون') && (
                <>
                  <p><strong>وثيقة تحصيل مالي وتأكيد حجز السيارة الجارية:</strong></p>
                  <p>نشهد نحن شركة أوتو بريدج لاستيراد السيارات بأننا قد استلمنا وقيدنا في الرصيد المالي للعميل السيد <strong>{order.client}</strong> الدفعة المبيّنة تفاصيلها أدناه بصفة عربون حجز رسمي للسيارة الاستيرادية الجارية:</p>
                  
                  <div className="border border-slate-200 rounded-xl overflow-hidden mt-4">
                     <table className="w-full text-right font-mono">
                        <thead>
                           <tr className="bg-slate-100 text-[10px] font-black border-b border-slate-200">
                             <th className="px-4 py-3">البند المالي</th>
                             <th className="px-4 py-3">قيمة العملة الصعبة</th>
                             <th className="px-4 py-3">قيمة المعادل الموازي دج</th>
                             <th className="px-4 py-3">الحالة وجدول التطهير</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-xs">
                           <tr>
                             <td className="px-4 py-4 font-bold text-slate-900">عربون جدية الشراء (30%)</td>
                             <td className="px-4 py-4">${(priceUSD * 0.3).toLocaleString()} USD</td>
                             <td className="px-4 py-4 font-bold text-blue-600">{depositDZD.toLocaleString('ar-DZ')} دج</td>
                             <td className="px-4 py-4 text-emerald-600 font-bold">✓ تم الدفع والتحقق</td>
                           </tr>
                           <tr className="bg-slate-50">
                             <td className="px-4 py-4 text-slate-500">المبلغ الإجمالي المتبقي التقديري للسيارة (70%)</td>
                             <td className="px-4 py-4 text-slate-500">${(priceUSD * 0.7).toLocaleString()} USD</td>
                             <td className="px-4 py-4 text-slate-500">{remainingDZD.toLocaleString('ar-DZ')} دج</td>
                             <td className="px-4 py-4 text-amber-500">مطلوب عند الوصول للميناء</td>
                           </tr>
                        </tbody>
                     </table>
                  </div>

                  <div className="mt-8 bg-slate-50 p-4 rounded-xl border border-dotted border-slate-300">
                     <p className="font-bold text-slate-950 mb-1">تفاصيل المواصفات الملتزم بها للسيارة:</p>
                     <p className="text-slate-600 text-[11px] leading-relaxed">
                       - طراز المركبة المقيد للشحن: <strong className="text-slate-900">{order.car}</strong> | رقم الشاسيه المرجعي: <strong className="text-slate-900">{order.vin || 'L-B3G-Y8-X-492'}</strong><br />
                       - المرفقات المبرمجة: الشواحن الأصلية، شهادة الضمان القياسية من بلد المصنع، بطاقات المراقبة الفنية التصديرية.
                     </p>
                  </div>
                </>
              )}

              {/* Type 3: فاتورة الشحن الدولي */}
              {document.name.includes('فاتورة الشحن') && (
                <>
                  <p><strong>كشف أعباء ومستحقات الشحن والتنقل البحري الدولي الخاص بالمركبة:</strong></p>
                  <div className="border border-slate-200 rounded-xl overflow-hidden font-mono mt-4">
                     <table className="w-full text-right">
                        <thead>
                           <tr className="bg-slate-100 text-[10px] font-black border-b border-slate-200">
                             <th className="px-4 py-3">أعمدة التكلفة اللوجستية</th>
                             <th className="px-4 py-3">الميناء والخط البحري</th>
                             <th className="px-4 py-3">المبلغ التقديري بالدج</th>
                             <th className="px-4 py-3">الحالة والملف السحابي</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-xs">
                           <tr>
                             <td className="px-4 py-4 font-bold text-slate-900">رسوم حجز المساحة بالحاوية (Ocean Freight)</td>
                             <td className="px-4 py-4 font-normal">نينغبو (الصين) ▸ الجزائر العاصمة</td>
                             <td className="px-4 py-4">120,000 دج</td>
                             <td className="px-4 py-4 font-bold text-green-600">✓ مسبقة الدفع</td>
                           </tr>
                           <tr>
                             <td className="px-4 py-4 font-bold text-slate-900">التأمين والضمان اللوجستي البحري الشامل</td>
                             <td className="px-3" colSpan={1}>مغطى بالكامل ضياع وهياكل</td>
                             <td className="px-4 py-4">45,000 دج</td>
                             <td className="px-4 py-4 font-bold text-green-600">✓ مسبقة الدفع</td>
                           </tr>
                           <tr>
                             <td className="px-4 py-4 font-bold text-slate-900">رسوم التداول والمناولة بموانئ الوصول</td>
                             <td className="px-4 py-4">محطة تفريغ الحاويات</td>
                             <td className="px-4 py-4">85,000 دج</td>
                             <td className="px-4 py-4 text-emerald-600 font-bold">✓ مدفوع ومغطى</td>
                           </tr>
                           <tr className="bg-slate-50 font-black text-slate-950 border-t-2 border-slate-900">
                             <td className="px-4 py-4 uppercase">المجموع المدفوع للشحن والتأمين الموحد</td>
                             <td className="px-4 py-4">⎯⎯⎯⎯⎯</td>
                             <td className="px-4 py-4 text-sm font-bold">250,000 دج</td>
                             <td className="px-4 py-4 text-green-600">✓ خالص كلياً</td>
                           </tr>
                        </tbody>
                     </table>
                  </div>

                  <p className="mt-6 text-[10px] italic text-slate-500 text-center">
                    ملاحظة: هذا الكشف يغطي تكاليف النقل الإداري واللجلوجي البحري للسيارة ولا علاقة له برسوم الجمركة الرسمية بالجزائر.
                  </p>
                </>
              )}

              {/* Type 4: جمركة وترخيص */}
              {document.name.includes('البطاقة الجمركية') && (
                <>
                  <p><strong>شهادة تصريح بالترتيبات الجمركية وسند الفحص التقني للمركبات المستوردة:</strong></p>
                  <p>تشهد مصالح التخليص وإعداد الملفات اللوجستية بأوتو بريدج بالتنسيق مع المخلص الجمركي المعتمد بأن السيارة المستوردة تم إخضاعها للفحص والتدقيق القانوني وفق البيانات التالية:</p>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 font-mono space-y-4 text-xs">
                     <div className="grid grid-cols-2 gap-4">
                        <p><span className="text-slate-400">اسم المودع القانوني:</span> {order.client}</p>
                        <p><span className="text-slate-400">رقم رخصة الاستيراد الجمركية:</span> DZD-C7382-721</p>
                        <p><span className="text-slate-400">طراز المركبة وخصائصها الفنية:</span> {order.car}</p>
                        <p><span className="text-slate-400">رقم هيكل السيارة VIN:</span> {order.vin || 'L-B3G-Y8-X-492'}</p>
                        <p><span className="text-slate-400">ميناء الخروج والجمارك:</span> جمارك ميناء مستغانم الوطني</p>
                        <p><span className="text-slate-400">رقم المعاينة الفنية للمطابقة:</span> AB/M-93010-DZ</p>
                     </div>
                     <div className="border-t border-slate-200 pt-4 text-[11px] leading-relaxed text-slate-600">
                        <p className="font-bold text-slate-900 mb-1">وضعية الإيداع الجمركي والرخص:</p>
                        <p>✓ تم تسوية ملف الضريبة الإجمالية وتجاوز المعاينة الوقائية بنجاح، السيارة مصرح بها قانونياً ومستوفية للشروط الفنية للتداول في الجزائر.</p>
                     </div>
                  </div>
                </>
              )}

              {/* Type 5: محضر تسليم مركبة */}
              {document.name.includes('محضر التسليم') && (
                <>
                  <p><strong>محضر استلام المركبة النهائي وإبراء الذمة التام:</strong></p>
                  <p>بموجب هذا المحضر الرسمي الواقع في الجزائر وبحضور ممثلين من شركة أوتو بريدج والعميل المستلم، تم تسليم واستلام السيارة المذكورة مواصفاتها بالملف بحالة ممتازة وخالية تماماً من العيوب:</p>

                  <div className="border border-slate-200 rounded-xl p-6 space-y-4">
                     <p>✓ يقر العميل المستورد بأنه قام بفحص ومعاينة السيارة <strong>({order.car})</strong> فحصاً دقيقاً ووجد مواصفاتها الهندسية والتقنية مطابقة تماماً للمواصفات المذكورة في العقد الأولي.</p>
                     <p>✓ تم تفريغ وتجريب كافة الأنظمة الرقمية والشاحن المنزلي والتأكد من سلامتها.</p>
                     <p>✓ يستلم العميل بهذه اللحظة الملف الإداري والجمركي الكامل لغرض إصدار البطاقة الرمادية بالدائرة الإقليمية له.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-8 text-center mt-12 pt-8 border-t border-slate-100">
                     <div>
                       <p className="font-bold text-slate-900 text-xs mb-8">إبراء وتوقيع العميل المستلم</p>
                       <p className="text-[10px] text-slate-400 font-mono italic">الاسم: .......................................</p>
                       <p className="text-[10px] text-slate-400 font-mono italic">التوقيع والبصمة:</p>
                     </div>
                     <div>
                       <p className="font-bold text-slate-900 text-xs mb-8">ختم وتوقيع ممثل شركة أوتو بريدج</p>
                       <div className="w-24 h-24 bg-blue-50/50 border border-dashed border-blue-200 rounded-full mx-auto flex items-center justify-center text-blue-600 text-[10px] uppercase font-serif tracking-widest leading-none rotate-12 shadow-sm">
                         Approved<br />AutoBridge
                       </div>
                     </div>
                  </div>
                </>
              )}
            </div>

            {/* Official Stamps and Signatures (Visual proof) */}
            {!document.name.includes('محضر التسليم') && (
              <div className="grid grid-cols-2 gap-10 border-t border-slate-200 pt-8 mt-12 text-[10px] text-slate-500 font-mono">
                <div>
                  <p className="font-bold text-slate-800 mb-2">إمضاء الطرف المستورد (العميل):</p>
                  <p className="italic text-slate-400">تم تسجيل الموافقة الرقمية للمستورد في تاريخ {document.date}</p>
                  <p className="font-bold text-slate-700 mt-2">{order.client}</p>
                </div>
                <div className="text-left flex flex-col items-end">
                  <p className="font-bold text-slate-800 mb-2 text-right">الختم وتوقيع المدير العام اللوجستي:</p>
                  <div className="w-24 h-24 border border-blue-100 rounded-full flex flex-col items-center justify-center text-blue-600 text-[9px] font-bold tracking-tight rotate-12 bg-white shadow-inner select-none pointer-events-none mt-2">
                    <Award className="w-5 h-5 mb-1 text-blue-500" />
                    <span>AUTOBRIDGE</span>
                    <span>ALGERIA</span>
                  </div>
                </div>
              </div>
            )}

            {/* Footer notice for printing */}
            <div className="text-center text-[9px] text-slate-400 border-t border-slate-100 pt-6 mt-8 font-mono print:block leading-relaxed">
              <p>هذا المستند معتمد وصادر إلكترونياً عن نظام التتبع المركزي الموحد لشركة AutoBridge الاستيرادية ولا يتطلب توقيعاً يدوياً رطباً.</p>
              <p className="mt-1">رواق التشفير وسيرفرات التحقق: BlockHash: {order.id?.slice(0, 10) || '0xFA839210B'} ⁃ Node: {order.portalUsername || 'Alg-Host'}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
