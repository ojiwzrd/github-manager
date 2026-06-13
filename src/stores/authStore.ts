/**
 * GitHub Manager
 *
 * Dikembangkan oleh ojiwzrd.
 *
 * Hak Cipta (c) 2026 ojiwzrd.
 *
 * Proyek ini dapat digunakan, dipelajari, dimodifikasi, dan
 * didistribusikan kembali sesuai dengan ketentuan lisensi yang berlaku.
 *
 * Setiap salinan, modifikasi, distribusi ulang, fork, atau turunan
 * dari proyek ini wajib menyertakan informasi hak cipta dan atribusi
 * kepada ojiwzrd.
 *
 * Informasi hak cipta, nama pengembang, atribusi, serta pemberitahuan
 * lisensi yang terdapat dalam proyek ini tidak boleh dihapus,
 * disembunyikan, atau diubah tanpa izin dari pemilik hak cipta.
 *
 * GitHub Manager © 2026 ojiwzrd.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  token: string | null
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setLoading: (loading: boolean) => void
  login: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      token: null,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      setLoading: (isLoading) => set({ isLoading }),
      login: (user, token) => set({ user, token, isAuthenticated: true, isLoading: false }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'github-manager-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
