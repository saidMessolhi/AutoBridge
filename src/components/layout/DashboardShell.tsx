import React from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Car, 
  FileText, 
  CreditCard, 
  TrendingUp, 
  Users,
  Settings,
  LogOut,
  Bell,
  Menu,
  ChevronRight,
  User
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

interface SidebarItem {
  icon: any;
  label: string;
  path: string;
  roles?: string[];
}

const sidebarItems: SidebarItem[] = [
  { icon: LayoutDashboard, label: 'لوحة التحكم', path: '/admin/dashboard' },
  { icon: Car, label: 'إدارة الطلبات', path: '/admin/orders' },
  { icon: FileText, label: 'الوثائق', path: '/admin/documents' },
  { icon: CreditCard, label: 'المحاسبة', path: '/admin/finance' },
  { icon: TrendingUp, label: 'التقارير', path: '/admin/reports' },
  { icon: Users, label: 'تسيير المستخدمين', path: '/admin/users', roles: ['المدير العام'] },
  { icon: Settings, label: 'الإعدادات', path: '/admin/settings' },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = React.useState({ name: 'أحمد بن علي', role: 'المدير العام', email: '' });

  React.useEffect(() => {
    const savedUser = localStorage.getItem('mockUser');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser({ name: parsed.name, role: parsed.role, email: parsed.email });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('mockUser');
    navigate('/login');
  };

  const filteredSidebarItems = sidebarItems.filter(item => {
    // If item has specific roles defined, check if user has one of them
    if (item.roles && !item.roles.includes(user.role)) {
      return false;
    }
    
    // Legacy hardcoded role checks for specific paths
    if (user.role === 'المدير العام') return true;
    if (user.role === 'المحاسب') return ['/admin/dashboard', '/admin/finance', '/admin/reports', '/admin/settings'].includes(item.path);
    if (user.role === 'مسؤول الصين') return ['/admin/dashboard', '/admin/orders', '/admin/settings'].includes(item.path);
    if (user.role === 'عون استقبال / مسؤول ملفات') return ['/admin/dashboard', '/admin/orders', '/admin/documents', '/admin/settings'].includes(item.path);
    
    return false;
  });

  return (
    <div className="flex min-h-screen bg-brand-bg font-sans" dir="rtl">
      {/* Sidebar */}
      <aside className="w-64 bg-brand-dark text-slate-300 hidden md:flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-900/20">A</div>
          <span className="text-xl font-bold text-white tracking-tight">AutoBridge</span>
        </div>
        
        <nav className="flex-1 px-3 py-4 space-y-1">
          {filteredSidebarItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link 
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm",
                  isActive 
                    ? "bg-slate-800 text-white border-l-4 border-blue-500 shadow-sm" 
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-blue-500" : "text-slate-500")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
           <button 
             onClick={handleLogout}
             className="flex items-center gap-3 px-4 py-2 w-full text-xs font-bold text-slate-500 hover:text-red-400 transition-colors uppercase tracking-widest"
           >
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج</span>
           </button>
        </div>

        <div className="p-6 border-t border-slate-800 text-[10px] text-slate-600 font-mono tracking-widest uppercase">
          v2.4.0-Enterprise
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white border-b border-brand-border flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <button className="md:hidden">
              <Menu className="w-6 h-6 text-slate-500" />
            </button>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              {sidebarItems.find(i => location.pathname.startsWith(i.path))?.label || 'Dashboard'}
            </h3>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="p-2 text-slate-400 hover:text-slate-600 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 border-r pr-6 border-slate-200">
              <div className="text-left leading-none">
                <p className="text-sm font-bold text-slate-900">{user.name}</p>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">{user.role}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden border border-slate-200">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="User" />
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
