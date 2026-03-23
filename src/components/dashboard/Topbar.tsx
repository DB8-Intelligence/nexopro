'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, Bell, LogOut, Settings, User, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getInitials } from '@/lib/utils'
import type { Tenant, Profile } from '@/types/database'

interface TopbarProps {
  tenant: Tenant
  profile: Profile
  onMenuClick: () => void
}

export function Topbar({ tenant, profile, onMenuClick }: TopbarProps) {
  const router = useRouter()
  const supabase = createClient()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 md:px-6">
      <div className="flex items-center justify-between h-14">
        {/* Left */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Tenant name (mobile) */}
        <div className="lg:hidden">
          <span className="font-semibold text-sm text-gray-900 truncate max-w-[150px]">
            {tenant.name}
          </span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Notifications */}
          <Link
            href="/notificacoes"
            className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-all"
          >
            <Bell className="w-5 h-5" />
            {/* unread badge */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </Link>

          {/* User dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-all"
            >
              <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center text-xs font-bold text-indigo-700">
                {profile.avatar_url
                  ? <img src={profile.avatar_url} alt="" className="w-7 h-7 rounded-lg object-cover" />
                  : getInitials(profile.full_name)
                }
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-gray-900 leading-tight">{profile.full_name}</div>
                <div className="text-xs text-gray-400 leading-tight capitalize">{profile.role}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden md:block" />
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-200 py-1.5 z-20">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <div className="text-sm font-medium text-gray-900 truncate">{profile.full_name}</div>
                    <div className="text-xs text-gray-400 truncate">{profile.email}</div>
                  </div>
                  <Link
                    href="/configuracoes/perfil"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    <User className="w-4 h-4 text-gray-400" />
                    Meu perfil
                  </Link>
                  <Link
                    href="/configuracoes"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    <Settings className="w-4 h-4 text-gray-400" />
                    Configurações
                  </Link>
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
