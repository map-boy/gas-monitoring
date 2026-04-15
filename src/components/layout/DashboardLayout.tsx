import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Truck, 
  History, 
  Settings, 
  LogOut, 
  Flame, 
  Menu,
  ChevronLeft,
  ChevronRight,
  Globe,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/components/theme-provider';
import { Language } from '@/lib/translations';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Moon, Sun, Monitor } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const { profile, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();

  const navItems = [
    { icon: LayoutDashboard, label: t('dashboard'), href: '/' },
    { icon: Package, label: t('stock'), href: '/stock' },
    { icon: ShoppingCart, label: t('sales'), href: '/sales' },
    { icon: Users, label: t('customers'), href: '/customers' },
    { icon: Truck, label: t('orders'), href: '/orders' },
    { icon: History, label: t('movements'), href: '/movements' },
    { icon: Settings, label: t('rentals'), href: '/rentals' },
    { icon: ShieldCheck, label: t('admin'), href: '/admin' },
  ];

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
  };

  const getLanguageLabel = (lang: Language) => {
    switch (lang) {
      case 'en': return 'English';
      case 'rw': return 'Kinyarwanda';
      case 'ar': return 'العربية';
      default: return 'English';
    }
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return <Sun className="w-5 h-5" />;
      case 'dark': return <Moon className="w-5 h-5" />;
      case 'system': return <Monitor className="w-5 h-5" />;
      default: return <Sun className="w-5 h-5" />;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light': return t('light');
      case 'dark': return t('dark');
      case 'system': return t('system');
      default: return t('light');
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Sidebar for desktop */}
      <aside 
        className={cn(
          "hidden md:flex flex-col border-r bg-card transition-all duration-300 ease-in-out relative",
          isSidebarCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className={cn("p-6 flex items-center gap-2 overflow-hidden", isSidebarCollapsed && "justify-center px-0")}>
          <div className="bg-primary p-2 rounded-lg shrink-0">
            <Flame className="w-6 h-6 text-primary-foreground" />
          </div>
          {!isSidebarCollapsed && (
            <span className="font-bold text-xl tracking-tight whitespace-nowrap">GasFlow</span>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute top-20 h-6 w-6 rounded-full border bg-background shadow-sm z-10",
            language === 'ar' ? "-left-3" : "-right-3"
          )}
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        >
          {isSidebarCollapsed ? (language === 'ar' ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />) : (language === 'ar' ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />)}
        </Button>

        <ScrollArea className="flex-1 px-4">
          <nav className="space-y-2 py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group relative",
                  location.pathname === item.href
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "hover:bg-accent text-muted-foreground hover:text-foreground",
                  isSidebarCollapsed && "justify-center px-2"
                )}
              >
                <item.icon className={cn("w-5 h-5 shrink-0", location.pathname === item.href ? "text-primary-foreground" : "group-hover:text-primary")} />
                {!isSidebarCollapsed && <span className="font-medium whitespace-nowrap">{item.label}</span>}
                {isSidebarCollapsed && (
                  <div className={cn(
                    "absolute bg-popover text-popover-foreground px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg border whitespace-nowrap z-50",
                    language === 'ar' ? "right-14" : "left-14"
                  )}>
                    {item.label}
                  </div>
                )}
              </Link>
            ))}
          </nav>
        </ScrollArea>

        <div className="p-4 border-t space-y-2">
          <DropdownMenu>
            <DropdownMenuTrigger 
              render={
                <Button variant="ghost" className={cn("w-full justify-start gap-3", isSidebarCollapsed && "justify-center px-0")}>
                  {getThemeIcon()}
                  {!isSidebarCollapsed && <span>{getThemeLabel()}</span>}
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme('light')}>
                <Sun className="w-4 h-4 mr-2" />
                {t('light')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                <Moon className="w-4 h-4 mr-2" />
                {t('dark')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                <Monitor className="w-4 h-4 mr-2" />
                {t('system')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger 
              render={
                <Button variant="ghost" className={cn("w-full justify-start gap-3", isSidebarCollapsed && "justify-center px-0")}>
                  <Globe className="w-5 h-5" />
                  {!isSidebarCollapsed && <span>{getLanguageLabel(language)}</span>}
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage('en')}>English</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('rw')}>Kinyarwanda</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('ar')}>العربية</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className={cn(
              "w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10",
              isSidebarCollapsed && "justify-center px-0"
            )}
          >
            <LogOut className="w-5 h-5" />
            {!isSidebarCollapsed && <span>{t('logout')}</span>}
          </Button>
        </div>
      </aside>

      {/* Mobile Nav */}
      <div className={cn("md:hidden fixed top-4 z-50", language === 'ar' ? "right-4" : "left-4")}>
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger 
            render={
              <Button variant="outline" size="icon" className="shadow-md bg-background">
                <Menu className="w-6 h-6" />
              </Button>
            }
          />
          <SheetContent side={language === 'ar' ? 'right' : 'left'} className="w-64 p-0">
            <div className="p-6 flex items-center gap-2">
              <Flame className="w-6 h-6 text-primary" />
              <span className="font-bold text-xl">GasFlow</span>
            </div>
            <nav className="px-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                    location.pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t mt-auto space-y-2">
               <div className="flex gap-2">
                 <Button variant="outline" size="sm" className="flex-1" onClick={() => setLanguage('en')}>EN</Button>
                 <Button variant="outline" size="sm" className="flex-1" onClick={() => setLanguage('rw')}>RW</Button>
                 <Button variant="outline" size="sm" className="flex-1" onClick={() => setLanguage('ar')}>AR</Button>
               </div>
               <div className="flex gap-2">
                 <Button variant="outline" size="sm" className="flex-1" onClick={() => setTheme('light')}><Sun className="w-4 h-4" /></Button>
                 <Button variant="outline" size="sm" className="flex-1" onClick={() => setTheme('dark')}><Moon className="w-4 h-4" /></Button>
                 <Button variant="outline" size="sm" className="flex-1" onClick={() => setTheme('system')}><Monitor className="w-4 h-4" /></Button>
               </div>
              <Button 
                variant="ghost" 
                onClick={handleLogout}
                className="w-full justify-start gap-3 text-destructive"
              >
                <LogOut className="w-5 h-5" />
                <span>{t('logout')}</span>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-16 border-b flex items-center justify-between px-8 bg-card/50 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold tracking-tight">
              {navItems.find(item => item.href === location.pathname)?.label || t('dashboard')}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold leading-none">{profile?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground capitalize mt-1">{profile?.role || 'Worker'}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary shadow-sm">
              {profile?.name?.charAt(0) || 'U'}
            </div>
          </div>
        </header>
        <ScrollArea className="flex-1">
          <div className="p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
