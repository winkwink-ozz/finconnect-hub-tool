import React from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Menu, LogOut } from 'lucide-react';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/profiles', label: 'Profiles', icon: Users },
    { path: '/admin/applications', label: 'Application Factory', icon: FileText }, // Renamed
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    sessionStorage.removeItem('finconnect_admin_auth');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-obsidian-900 text-gray-100 font-sans flex flex-col md:flex-row">
      
      {/* 🖥️ DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-obsidian-900 border-r border-gray-800 h-screen sticky top-0 shadow-2xl z-20">
        <div className="p-8 flex items-center gap-4 border-b border-gray-800/50">
          <div className="relative w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-lg border border-gold-500/50">
            <img src="/finconnect-hub-tool/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
          </div>
          <div>
            <h1 className="font-bold text-white tracking-tight text-lg">FinConnect</h1>
            <p className="text-[10px] text-gold-400 uppercase tracking-widest font-semibold">Admin Portal</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-3 mt-4">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <div className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${isActive(item.path) ? 'bg-gold-gradient text-black font-bold shadow-lg shadow-gold-500/20 translate-x-1' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                <item.icon size={20} className={isActive(item.path) ? "text-black" : "group-hover:text-gold-400 transition-colors"} />
                <span>{item.label}</span>
              </div>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800/50">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl w-full transition-colors font-medium"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* 📱 MOBILE HEADER */}
      <header className="md:hidden bg-obsidian-900 border-b border-gray-800 p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gold-500">
            <img src="/finconnect-hub-tool/logo.png" alt="Logo" className="w-5 h-5 object-contain" />
          </div>
          <span className="font-bold text-white">Admin Portal</span>
        </div>
        <button onClick={handleLogout} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"><LogOut size={20} /></button>
      </header>

      {/* 🚀 MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* 📱 MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-obsidian-900/90 backdrop-blur-md border-t border-gray-800 p-2 flex justify-around z-50 pb-safe">
        {navItems.map((item) => (
          <Link key={item.path} to={item.path} className="flex-1">
            <div className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isActive(item.path) ? 'text-gold-400' : 'text-gray-500'}`}>
              <item.icon size={24} strokeWidth={isActive(item.path) ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </div>
          </Link>
        ))}
      </nav>

    </div>
  );
};

export default AdminLayout;
