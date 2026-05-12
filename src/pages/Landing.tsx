import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Globe, 
  BarChart3, 
  FileCheck, 
  ArrowLeft,
  Navigation,
  CheckCircle,
  Car
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function Landing() {
  return (
    <div className="min-h-screen bg-white font-sans" dir="rtl">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Car className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-gray-900">AutoBridge</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">المميزات</a>
            <a href="#workflow" className="hover:text-blue-600 transition-colors">خطوات الاستيراد</a>
            <a href="#pricing" className="hover:text-blue-600 transition-colors">الأسعار</a>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-semibold text-gray-700 hover:text-blue-600">
              تسجيل الدخول
            </Link>
            <Link 
              to="/admin/dashboard" 
              className="bg-blue-600 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2"
            >
              ابدأ تجربتك <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-32 px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 text-right">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm font-bold mb-6"
            >
              أول منصة SaaS لاستيراد السيارات في الجزائر
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl font-black text-gray-900 leading-[1.15] mb-8"
            >
              استورد سيارتك من <span className="text-blue-600">الصين</span> <br />
              بكل شفافية وأمان
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-500 leading-relaxed max-w-xl mb-12"
            >
              منصة AutoBridge تربطك مباشرة بمصادر السيارات في الصين مع نظام تتبع حي، 
              إدارة وثائق، وتقسيم مراحل الدفع لضمان رحلة استيراد موثوقة.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-6"
            >
              <Link 
                to="/admin/dashboard"
                className="bg-gray-900 text-white px-10 py-5 rounded-2xl text-lg font-bold hover:bg-gray-800 transition-all shadow-xl shadow-gray-200"
              >
                اطلب سيارتك الآن
              </Link>
              <div className="flex -space-x-3 space-x-reverse">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-gray-100 flex items-center justify-center overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 123}`} alt="User" />
                  </div>
                ))}
                <div className="pr-6">
                  <p className="text-sm font-bold text-gray-900">+500 عميل راضٍ</p>
                  <p className="text-xs text-gray-500 italic">ثقة وأمان في كل خطوة</p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="flex-1 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="relative w-full aspect-square rounded-[3rem] bg-blue-600 overflow-hidden shadow-2xl"
            >
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay opacity-50"></div>
              <div className="absolute inset-0 flex items-center justify-center p-12">
                 <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl w-full">
                    <div className="flex justify-between items-center mb-8">
                       <h3 className="text-white font-bold">تتبع حي للشحنة</h3>
                       <div className="px-3 py-1 bg-green-500 text-white text-[10px] font-bold rounded-full animate-pulse">مباشر</div>
                    </div>
                    <div className="space-y-6">
                       {[1, 2, 3].map(i => (
                         <div key={i} className={`h-2 rounded-full ${i === 1 ? 'bg-white w-full' : i === 2 ? 'bg-white/40 w-3/4' : 'bg-white/20 w-1/2'}`}></div>
                       ))}
                    </div>
                 </div>
              </div>
            </motion.div>
            
            {/* Floating Card */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-10 -right-10 bg-white p-6 rounded-3xl shadow-2xl border border-gray-100 flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                <ShieldCheck className="text-green-600 w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">عملية مؤمنة 100%</p>
                <p className="text-xs text-gray-500">من المصنع إلى الميناء</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-black text-gray-900 mb-4">نظام متكامل لتسيير الاستيراد</h2>
          <p className="text-gray-500 mb-20 max-w-2xl mx-auto">نحن لسنا مجرد وسيط، بل نوفر لك تكنولوجيا متقدمة لمراقبة كل دولار وكل ثانية في رحلة سيارتك.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'تتبع حي بموقع GPS',
                desc: 'راقب موقع سفينتك وحاوية الشحن مباشرة عبر الخريطة التفاعلية في حسابك.',
                icon: Navigation,
                color: 'blue'
              },
              {
                title: 'إدارة وثائق سحابية',
                desc: 'جميع عقودك، فواتيرك، وشهادات الجمركة محفوظة بأمان وسهلة التحميل في أي وقت.',
                icon: FileCheck,
                color: 'green'
              },
              {
                title: 'نظام دفع مرحلي',
                desc: 'قسم دفعاتك حسب تطور المراحل لضمان أمان مالك وشفافية المصاريف.',
                icon: BarChart3,
                color: 'purple'
              }
            ].map((f, i) => (
              <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-gray-100 hover:shadow-xl transition-all text-right group">
                <div className={`w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-8 h-8 text-gray-900" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{f.title}</h3>
                <p className="text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
               <Car className="text-white w-4 h-4" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">AutoBridge</span>
          </div>
          
          <p className="text-sm text-gray-400">© 2026 AutoBridge SaaS. جميع الحقوق محفوظة. صُمم باحترافية لسوق الاستيراد.</p>
          
          <div className="flex gap-6">
             <Globe className="w-5 h-5 text-gray-400 cursor-pointer hover:text-blue-600" />
             <div className="text-sm font-bold text-gray-900">الجزائر | الصين</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
