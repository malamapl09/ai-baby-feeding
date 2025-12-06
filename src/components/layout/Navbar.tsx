'use client';

import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { APP_NAME } from '@/config/constants';
import {
  Home,
  CalendarDays,
  Apple,
  ShoppingCart,
  Settings,
  LogOut,
  User,
  Crown,
  Menu,
  X,
  Shield,
  Search,
} from 'lucide-react';
import { useState } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface NavbarProps {
  user: SupabaseUser | null;
  isPro?: boolean;
}

const navItems = [
  { href: '/dashboard', labelKey: 'dashboard', icon: Home },
  { href: '/meal-plans', labelKey: 'mealPlans', icon: CalendarDays },
  { href: '/food-tracker', labelKey: 'foodTracker', icon: Apple },
  { href: '/allergen-schedule', labelKey: 'allergens', icon: Shield },
  { href: '/quick-search', labelKey: 'quickSearch', icon: Search },
  { href: '/grocery-list', labelKey: 'groceryList', icon: ShoppingCart },
] as const;

export function Navbar({ user, isPro = false }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('nav');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  // Check if current path matches nav item (accounting for locale prefix)
  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <span className="text-2xl">🍼</span>
              <span className="text-xl font-bold text-rose-600">{APP_NAME}</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? 'bg-rose-100 text-rose-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{t(item.labelKey)}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-2">
            <LanguageSwitcher />
            {!isPro && (
              <Link href="/pricing">
                <Button variant="outline" size="sm" className="text-amber-600 border-amber-300 hover:bg-amber-50">
                  <Crown className="w-4 h-4 mr-2" />
                  {t('upgrade')}
                </Button>
              </Link>
            )}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-rose-600" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center">
                      <Settings className="w-4 h-4 mr-2" />
                      {t('settings')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    {t('signOut')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <LanguageSwitcher />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium ${
                    active
                      ? 'bg-rose-100 text-rose-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{t(item.labelKey)}</span>
                </Link>
              );
            })}
            <div className="border-t border-gray-200 pt-2 mt-2">
              {!isPro && (
                <Link
                  href="/pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-3 py-2 text-amber-600"
                >
                  <Crown className="w-5 h-5" />
                  <span>{t('upgradeToPro')}</span>
                </Link>
              )}
              <Link
                href="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-3 py-2 text-gray-600"
              >
                <Settings className="w-5 h-5" />
                <span>{t('settings')}</span>
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleSignOut();
                }}
                className="flex items-center space-x-3 px-3 py-2 text-red-600 w-full"
              >
                <LogOut className="w-5 h-5" />
                <span>{t('signOut')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
