
import React, { useState } from 'react';
import { LogoIcon, HomeIcon, MapIcon, MusicIcon, ZapIcon, RefreshIcon, MenuIcon, XIcon, LogOutIcon } from './icons/Icons.tsx';
import { View } from '../App.tsx';

interface HeaderProps {
    onNavigate: (view: View) => void;
    activeView: View;
    onReset: () => void;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, activeView, onReset, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const linkClasses = "flex items-center gap-2 hover:text-white transition-colors py-2 px-3 rounded-md";
  const activeClasses = "bg-slate-700/50 text-white";
  const disabledClasses = "opacity-50 cursor-not-allowed";

  const handleMobileLinkClick = (view: View) => {
    onNavigate(view);
    setIsMenuOpen(false);
  };
  
  const handleMobileResetClick = () => {
    onReset();
    setIsMenuOpen(false);
  }
  
  const handleMobileLogoutClick = () => {
    onLogout();
    setIsMenuOpen(false);
  }

  const renderNavLinks = (isMobile = false) => (
    <>
      <button
          onClick={() => isMobile ? handleMobileLinkClick('dashboard') : onNavigate('dashboard')}
          className={`${linkClasses} ${isMobile ? 'w-full justify-start' : ''} ${activeView === 'dashboard' ? activeClasses : ''}`}
      >
        <HomeIcon className="h-4 w-4" />
        <span>Dashboard</span>
      </button>
      <button
          onClick={() => isMobile ? handleMobileLinkClick('treasure-map') : onNavigate('treasure-map')}
          className={`${linkClasses} ${isMobile ? 'w-full justify-start' : ''} ${activeView === 'treasure-map' ? activeClasses : ''}`}
      >
        <MapIcon className="h-4 w-4" />
        <span>Mapa do Tesouro</span>
      </button>
      <a href="#" className={`${linkClasses} ${isMobile ? 'w-full justify-start' : ''} ${disabledClasses}`}>
        <MusicIcon className="h-4 w-4" />
        <span>TuneFlow</span>
      </a>
       <button 
          onClick={isMobile ? handleMobileLogoutClick : onLogout}
          className={`${linkClasses} ${isMobile ? 'w-full justify-start' : ''}`}
      >
        <LogOutIcon className="h-4 w-4" />
        <span>Sair</span>
      </button>
      <a href="#" className={`${linkClasses} ${isMobile ? 'w-full justify-start' : ''} ${disabledClasses}`}>
        <ZapIcon className="h-4 w-4" />
        <span>Admin</span>
      </a>
       <button 
          onClick={isMobile ? handleMobileResetClick : onReset}
          title="Resetar Progresso"
          className={`flex items-center gap-2 hover:text-red-400 text-slate-400 transition-colors py-2 px-3 rounded-md ${isMobile ? 'w-full justify-start' : ''}`}
      >
        <RefreshIcon className="h-4 w-4" />
        {isMobile && <span>Resetar Progresso</span>}
      </button>
    </>
  );

  return (
    <header className="bg-[#10141f] border-b border-slate-800 p-4 flex justify-between items-center shrink-0 relative z-50">
      <div className="flex items-center gap-3">
        <LogoIcon className="h-10 w-10" />
        <div>
          <h1 className="text-lg font-bold text-blue-400">TALKFLOW</h1>
          <p className="text-xs text-slate-400">LUMNIS</p>
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-4 text-sm text-slate-300">
        {renderNavLinks()}
      </nav>

      {/* Mobile Menu Button */}
      <div className="md:hidden">
         <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-md text-slate-300 hover:bg-slate-700 hover:text-white"
            aria-label="Toggle menu"
        >
            {isMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu Panel */}
      {isMenuOpen && (
         <div className="md:hidden absolute top-full left-0 right-0 bg-[#10141f] border-b border-slate-800 animate-fade-in-down">
             <nav className="flex flex-col p-4 gap-2 text-sm text-slate-300">
                {renderNavLinks(true)}
             </nav>
         </div>
      )}
    </header>
  );
};

export default Header;