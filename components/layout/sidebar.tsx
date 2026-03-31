'use client';

import { LayoutDashboard, ReceiptText, PieChart, Settings, Wallet, LogOut, Menu, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { logout, getStoredAccessToken, clearStoredTokens } from "@/lib/auth/client"
import { useState } from "react"

const navigation = [
  { name: "Resumen", href: "/", icon: LayoutDashboard },
  { name: "Transacciones", href: "/transactions", icon: ReceiptText },
  { name: "Estadísticas", href: "/analytics", icon: PieChart },
  { name: "Cuentas", href: "/accounts", icon: Wallet },
  { name: "Ajustes", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    const accessToken = getStoredAccessToken()
    
    if (accessToken) {
      await logout(accessToken)
    }
    
    clearStoredTokens()
    router.push('/login')
  }

  const closeSidebar = () => setIsOpen(false)

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg border border-border bg-surface hover:bg-surface-hover transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-40
        flex h-full w-64 flex-col border-r border-border bg-surface px-4 py-8
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex items-center gap-2 px-2 mb-8 md:mb-12">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground font-display font-bold text-xl">W</span>
          </div>
          <span className="font-display font-bold text-lg md:text-xl tracking-tight">Finanzas</span>
        </div>

        <nav className="flex-1 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={closeSidebar}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-surface-hover transition-colors group"
            >
              <item.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
              <span className="truncate">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-6 md:pt-8 border-t border-border space-y-4">
          <div className="flex items-center gap-3 px-3">
            <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
              <span className="text-accent font-medium text-sm">US</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium truncate">Mi Cuenta</span>
              <span className="text-xs text-muted-foreground truncate">Plan Gratuito</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-surface-hover transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
            <span className="truncate">{isLoggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}</span>
          </button>
        </div>
      </div>
    </>
  )
}
