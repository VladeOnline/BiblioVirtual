import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { BookOpen, Menu, X, LogOut, User, Shield } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-slate-900 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <BookOpen className="h-7 w-7 text-amber-400" />
            <span className="text-xl font-bold tracking-wide">BiblioVerse</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/books" className="hover:text-amber-400 transition-colors text-sm font-medium">Libros</Link>
            <Link to="/mangas" className="hover:text-amber-400 transition-colors text-sm font-medium">Mangas</Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className="hover:text-amber-400 transition-colors text-sm font-medium flex items-center gap-1">
                <Shield className="h-4 w-4" />
                Admin
              </Link>
            )}
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-300 flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {user.name}
                </span>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-300 hover:text-white hover:bg-slate-800">
                  <LogOut className="h-4 w-4 mr-1" />
                  Salir
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-800">Iniciar Sesion</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold">Registrarse</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-800 border-t border-slate-700 px-4 py-4 space-y-3">
          <Link to="/books" className="block py-2 hover:text-amber-400" onClick={() => setMobileMenuOpen(false)}>Libros</Link>
          <Link to="/mangas" className="block py-2 hover:text-amber-400" onClick={() => setMobileMenuOpen(false)}>Mangas</Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className="block py-2 hover:text-amber-400 flex items-center gap-1" onClick={() => setMobileMenuOpen(false)}>
              <Shield className="h-4 w-4" /> Admin
            </Link>
          )}
          {user ? (
            <>
              <span className="block py-2 text-slate-300">{user.name}</span>
              <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="block py-2 text-red-400">Cerrar Sesion</button>
            </>
          ) : (
            <>
              <Link to="/login" className="block py-2" onClick={() => setMobileMenuOpen(false)}>Iniciar Sesion</Link>
              <Link to="/register" className="block py-2 text-amber-400" onClick={() => setMobileMenuOpen(false)}>Registrarse</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
