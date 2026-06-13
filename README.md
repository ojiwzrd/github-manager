# GitHub Manager

Dashboard modern untuk mengelola akun GitHub langsung dari browser. Kelola repository, branch, file, issue, pull request, workflow, dan berbagai fitur GitHub lainnya dalam satu tempat.

## Fitur

- Login menggunakan GitHub Personal Access Token
- Manajemen Repository
- File Manager & Code Editor
- Issue Management
- GitHub Actions Workflow
- Repository Secrets Management
- Dark Mode & Light Mode
- Tampilan modern dan responsif

## Instalasi

Pastikan Node.js dan npm sudah terpasang.

### Clone Repository

```bash
git clone https://github.com/ojiwzrd/github-manager.git
cd github-manager
```

### Install Dependencies

```bash
npm i
```

### Jalankan Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di:

```text
http://localhost:5173
```

## Build Production

```bash
npm run build
```

## Preview Build

```bash
npm run preview
```

## Teknologi yang Digunakan

- React
- TypeScript
- Vite
- Tailwind CSS
- Zustand
- TanStack Query
- React Router
- CodeMirror
- Lucide Icons

## Autentikasi

GitHub Manager menggunakan GitHub Personal Access Token (PAT) untuk mengakses API GitHub.

Scope yang direkomendasikan:

```text
repo
read:user
read:org
workflow
admin:repo_hook
```

## Lisensi

MIT License
