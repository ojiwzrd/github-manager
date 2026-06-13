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

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './styles/globals.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)
