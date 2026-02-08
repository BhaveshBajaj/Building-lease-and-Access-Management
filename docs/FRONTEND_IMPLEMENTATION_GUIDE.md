# Frontend Implementation Guide for Building Access Control System

> **For: Frontend Development Agent**  
> **Version: 1.0**  
> **Date: February 2026**

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Setup](#3-project-setup)
4. [Project Structure](#4-project-structure)
5. [Core Configuration](#5-core-configuration)
6. [Authentication](#6-authentication)
7. [API Integration](#7-api-integration)
8. [State Management](#8-state-management)
9. [Routing](#9-routing)
10. [Core Components](#10-core-components)
11. [Feature Implementation](#11-feature-implementation)
12. [Real-time Features](#12-real-time-features)
13. [Forms & Validation](#13-forms--validation)
14. [Error Handling](#14-error-handling)
15. [Testing](#15-testing)
16. [Deployment](#16-deployment)

---

## 1. Project Overview

### 1.1 What We're Building

A **Building Access Control Dashboard** for managing:
- Multi-building infrastructure (buildings, floors, office spaces)
- Tenant organizations with leases
- Employees and their RFID access cards
- Doors with role-based access permissions
- Real-time access monitoring and logging

### 1.2 Backend API Reference

**Base URL:** `http://localhost:3000/api/v1`

**Public Endpoints (No Auth):**
- `POST /access/verify` - Verify card access (used by card readers)

**Protected Endpoints (Require Firebase Auth Token):**
- Buildings: `/buildings/*`
- Organizations: `/organizations/*`
- Employees: `/employees/*`
- Cards: `/employees/:id/card/*`
- Doors: `/doors/*`
- Roles: `/roles/*`
- Access Logs: `/access/logs`, `/access/stats`, `/access/denied`

### 1.3 User Personas

1. **Building Admin** - Full access to everything
2. **Organization Admin** - Access to their organization's data
3. **Security Personnel** - View-only for monitoring

---

## 2. Tech Stack

### 2.1 Required Technologies

```
Framework:       React 18+ with TypeScript
Build Tool:      Vite
Styling:         Tailwind CSS + shadcn/ui components
State:           Zustand (global) + TanStack Query (server)
Routing:         React Router v6
Forms:           React Hook Form + Zod validation
Auth:            Firebase Auth (client SDK)
HTTP Client:     Axios with interceptors
Real-time:       Supabase Realtime (for live updates)
Charts:          Recharts or Chart.js
Tables:          TanStack Table
Date/Time:       date-fns or dayjs
Icons:           Lucide React
```

### 2.2 Package.json Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "typescript": "^5.3.0",
    "@tanstack/react-query": "^5.0.0",
    "@tanstack/react-table": "^8.10.0",
    "zustand": "^4.4.0",
    "axios": "^1.6.0",
    "firebase": "^10.7.0",
    "@supabase/supabase-js": "^2.39.0",
    "react-hook-form": "^7.48.0",
    "@hookform/resolvers": "^3.3.0",
    "zod": "^3.22.0",
    "tailwindcss": "^3.3.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "lucide-react": "^0.294.0",
    "recharts": "^2.10.0",
    "date-fns": "^2.30.0",
    "sonner": "^1.2.0"
  }
}
```

---

## 3. Project Setup

### 3.1 Initialize Project

```bash
# Create Vite project with React + TypeScript
npm create vite@latest accesshub-frontend -- --template react-ts
cd accesshub-frontend

# Install dependencies
npm install

# Install all required packages
npm install react-router-dom @tanstack/react-query @tanstack/react-table zustand axios firebase @supabase/supabase-js react-hook-form @hookform/resolvers zod date-fns recharts lucide-react sonner

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install shadcn/ui (follow their CLI)
npx shadcn-ui@latest init
```

### 3.2 Environment Variables

Create `.env` file:

```env
# API
VITE_API_BASE_URL=http://localhost:3000/api/v1

# Firebase (Client)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id

# Supabase (for real-time only)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# App
VITE_APP_NAME=AccessHub
```

---

## 4. Project Structure

```
src/
├── assets/                 # Static assets (images, fonts)
├── components/
│   ├── ui/                 # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── table.tsx
│   │   └── ...
│   ├── layout/             # Layout components
│   │   ├── AppShell.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── Breadcrumbs.tsx
│   │   └── MobileNav.tsx
│   ├── common/             # Shared components
│   │   ├── DataTable.tsx
│   │   ├── SearchInput.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── ConfirmDialog.tsx
│   │   └── PageHeader.tsx
│   └── features/           # Feature-specific components
│       ├── auth/
│       ├── dashboard/
│       ├── buildings/
│       ├── organizations/
│       ├── employees/
│       ├── cards/
│       ├── doors/
│       ├── roles/
│       └── access-logs/
├── hooks/                  # Custom hooks
│   ├── useAuth.ts
│   ├── useDebounce.ts
│   ├── useMediaQuery.ts
│   └── useLocalStorage.ts
├── lib/                    # Utilities and configurations
│   ├── api.ts              # Axios instance
│   ├── firebase.ts         # Firebase config
│   ├── supabase.ts         # Supabase config
│   ├── utils.ts            # Helper functions
│   └── validations.ts      # Zod schemas
├── pages/                  # Page components (route targets)
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── ForgotPasswordPage.tsx
│   ├── dashboard/
│   │   ├── DashboardPage.tsx
│   │   └── LiveMonitorPage.tsx
│   ├── buildings/
│   │   ├── BuildingsListPage.tsx
│   │   ├── BuildingDetailsPage.tsx
│   │   └── OfficeSpacesPage.tsx
│   ├── organizations/
│   │   ├── OrganizationsListPage.tsx
│   │   ├── OrganizationDetailsPage.tsx
│   │   └── LeasesPage.tsx
│   ├── employees/
│   │   ├── EmployeesListPage.tsx
│   │   ├── EmployeeDetailsPage.tsx
│   │   └── CreateEmployeePage.tsx
│   ├── cards/
│   │   └── CardsListPage.tsx
│   ├── doors/
│   │   ├── DoorsListPage.tsx
│   │   ├── DoorDetailsPage.tsx
│   │   └── DoorGroupsPage.tsx
│   ├── roles/
│   │   ├── RolesListPage.tsx
│   │   ├── RoleDetailsPage.tsx
│   │   └── PermissionMatrixPage.tsx
│   ├── reports/
│   │   ├── AccessLogsPage.tsx
│   │   ├── DeniedAccessPage.tsx
│   │   └── AnalyticsPage.tsx
│   └── settings/
│       ├── SettingsPage.tsx
│       └── ProfilePage.tsx
├── services/               # API service functions
│   ├── auth.service.ts
│   ├── building.service.ts
│   ├── organization.service.ts
│   ├── employee.service.ts
│   ├── card.service.ts
│   ├── door.service.ts
│   ├── role.service.ts
│   └── access-log.service.ts
├── store/                  # Zustand stores
│   ├── authStore.ts
│   ├── uiStore.ts
│   └── filterStore.ts
├── types/                  # TypeScript types
│   ├── api.types.ts
│   ├── building.types.ts
│   ├── organization.types.ts
│   ├── employee.types.ts
│   ├── card.types.ts
│   ├── door.types.ts
│   ├── role.types.ts
│   └── access-log.types.ts
├── App.tsx                 # Main app component
├── main.tsx                # Entry point
└── index.css               # Global styles
```

---

## 5. Core Configuration

### 5.1 Tailwind Configuration

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand colors
        primary: {
          DEFAULT: '#1E40AF',
          foreground: '#FFFFFF',
        },
        // Status colors
        granted: '#22C55E',
        denied: '#EF4444',
        warning: '#F59E0B',
        // Door group colors
        'door-public': '#3B82F6',
        'door-private': '#8B5CF6',
        'door-restricted': '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
```

### 5.2 Axios Instance

```typescript
// src/lib/api.ts
import axios from 'axios'
import { auth } from './firebase'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - add auth token
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser
  if (user) {
    const token = await user.getIdToken()
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
```

### 5.3 Firebase Configuration

```typescript
// src/lib/firebase.ts
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
```

### 5.4 Supabase Configuration (Real-time)

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

---

## 6. Authentication

### 6.1 Auth Store

```typescript
// src/store/authStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from 'firebase/auth'

interface AuthState {
  user: User | null
  isLoading: boolean
  isAdmin: boolean
  setUser: (user: User | null) => void
  setIsAdmin: (isAdmin: boolean) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      isAdmin: false,
      setUser: (user) => set({ user }),
      setIsAdmin: (isAdmin) => set({ isAdmin }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null, isAdmin: false }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ isAdmin: state.isAdmin }),
    }
  )
)
```

### 6.2 Auth Hook

```typescript
// src/hooks/useAuth.ts
import { useEffect } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useAuthStore } from '@/store/authStore'

export function useAuth() {
  const { user, isLoading, isAdmin, setUser, setLoading, logout } = useAuthStore()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password)
    return result.user
  }

  const signOutUser = async () => {
    await signOut(auth)
    logout()
  }

  return {
    user,
    isLoading,
    isAdmin,
    isAuthenticated: !!user,
    login,
    logout: signOutUser,
  }
}
```

### 6.3 Protected Route Component

```typescript
// src/components/auth/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, isAdmin } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <LoadingSpinner fullScreen />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
```

### 6.4 Login Page Implementation

```typescript
// src/pages/auth/LoginPage.tsx
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginForm = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const from = location.state?.from?.pathname || '/dashboard'

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    try {
      await login(data.email, data.password)
      toast.success('Welcome back!')
      navigate(from, { replace: true })
    } catch (error: any) {
      toast.error(error.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary flex items-center justify-center">
            <span className="text-white text-xl font-bold">A</span>
          </div>
          <CardTitle className="text-2xl">Welcome to AccessHub</CardTitle>
          <p className="text-gray-500">Sign in to your account</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                {...form.register('email')}
                className={form.formState.errors.email ? 'border-red-500' : ''}
              />
              {form.formState.errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                {...form.register('password')}
                className={form.formState.errors.password ? 'border-red-500' : ''}
              />
              {form.formState.errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## 7. API Integration

### 7.1 TypeScript Types

```typescript
// src/types/api.types.ts
export interface ApiResponse<T> {
  status: 'success' | 'fail' | 'error'
  data?: T
  message?: string
  error?: {
    statusCode: number
    isOperational: boolean
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// src/types/employee.types.ts
export interface Employee {
  id: string
  organization_id: string
  role_id: string
  name: string
  email: string
  status: 'ACTIVE' | 'INACTIVE'
  created_at: string
  updated_at: string
  organization?: Organization
  access_role?: AccessRole
  access_card?: AccessCard
}

export interface CreateEmployeeDto {
  organization_id: string
  role_id: string
  name: string
  email: string
}

export interface UpdateEmployeeDto {
  name?: string
  email?: string
  role_id?: string
  status?: 'ACTIVE' | 'INACTIVE'
}

// Similar types for other entities...
```

### 7.2 API Service Functions

```typescript
// src/services/employee.service.ts
import api from '@/lib/api'
import { Employee, CreateEmployeeDto, UpdateEmployeeDto } from '@/types/employee.types'
import { ApiResponse, PaginatedResponse } from '@/types/api.types'

export const employeeService = {
  getAll: async (params?: {
    page?: number
    limit?: number
    organization_id?: string
    status?: string
    search?: string
  }) => {
    const response = await api.get<PaginatedResponse<Employee>>('/employees', { params })
    return response.data
  },

  getById: async (id: string) => {
    const response = await api.get<ApiResponse<Employee>>(`/employees/${id}`)
    return response.data.data
  },

  create: async (data: CreateEmployeeDto) => {
    const response = await api.post<ApiResponse<Employee>>('/employees', data)
    return response.data.data
  },

  update: async (id: string, data: UpdateEmployeeDto) => {
    const response = await api.patch<ApiResponse<Employee>>(`/employees/${id}`, data)
    return response.data.data
  },

  delete: async (id: string) => {
    await api.delete(`/employees/${id}`)
  },

  // Card operations
  issueCard: async (employeeId: string, cardUid: string) => {
    const response = await api.post<ApiResponse<any>>(`/employees/${employeeId}/card`, {
      card_uid: cardUid,
    })
    return response.data.data
  },

  blockCard: async (employeeId: string) => {
    const response = await api.patch<ApiResponse<any>>(`/employees/${employeeId}/card/block`)
    return response.data.data
  },

  getAccessHistory: async (employeeId: string, params?: { page?: number; limit?: number }) => {
    const response = await api.get(`/employees/${employeeId}/access-history`, { params })
    return response.data
  },
}
```

### 7.3 TanStack Query Hooks

```typescript
// src/hooks/queries/useEmployees.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { employeeService } from '@/services/employee.service'
import { CreateEmployeeDto, UpdateEmployeeDto } from '@/types/employee.types'
import { toast } from 'sonner'

// Query keys
export const employeeKeys = {
  all: ['employees'] as const,
  lists: () => [...employeeKeys.all, 'list'] as const,
  list: (filters: any) => [...employeeKeys.lists(), filters] as const,
  details: () => [...employeeKeys.all, 'detail'] as const,
  detail: (id: string) => [...employeeKeys.details(), id] as const,
}

// Get all employees
export function useEmployees(params?: {
  page?: number
  limit?: number
  organization_id?: string
  status?: string
  search?: string
}) {
  return useQuery({
    queryKey: employeeKeys.list(params),
    queryFn: () => employeeService.getAll(params),
  })
}

// Get single employee
export function useEmployee(id: string) {
  return useQuery({
    queryKey: employeeKeys.detail(id),
    queryFn: () => employeeService.getById(id),
    enabled: !!id,
  })
}

// Create employee
export function useCreateEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateEmployeeDto) => employeeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() })
      toast.success('Employee created successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create employee')
    },
  })
}

// Update employee
export function useUpdateEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmployeeDto }) =>
      employeeService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() })
      toast.success('Employee updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update employee')
    },
  })
}

// Delete employee
export function useDeleteEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => employeeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() })
      toast.success('Employee deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete employee')
    },
  })
}

// Issue card
export function useIssueCard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ employeeId, cardUid }: { employeeId: string; cardUid: string }) =>
      employeeService.issueCard(employeeId, cardUid),
    onSuccess: (_, { employeeId }) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(employeeId) })
      toast.success('Card issued successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to issue card')
    },
  })
}
```

---

## 8. State Management

### 8.1 UI Store (Sidebar, Theme)

```typescript
// src/store/uiStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UiState {
  sidebarCollapsed: boolean
  theme: 'light' | 'dark' | 'system'
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      theme: 'light',
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'ui-storage',
    }
  )
)
```

### 8.2 Filter Store (Global Filters)

```typescript
// src/store/filterStore.ts
import { create } from 'zustand'

interface FilterState {
  selectedOrganization: string | null
  selectedBuilding: string | null
  dateRange: { from: Date | null; to: Date | null }
  setSelectedOrganization: (id: string | null) => void
  setSelectedBuilding: (id: string | null) => void
  setDateRange: (range: { from: Date | null; to: Date | null }) => void
  clearFilters: () => void
}

export const useFilterStore = create<FilterState>((set) => ({
  selectedOrganization: null,
  selectedBuilding: null,
  dateRange: { from: null, to: null },
  setSelectedOrganization: (id) => set({ selectedOrganization: id }),
  setSelectedBuilding: (id) => set({ selectedBuilding: id }),
  setDateRange: (range) => set({ dateRange: range }),
  clearFilters: () =>
    set({
      selectedOrganization: null,
      selectedBuilding: null,
      dateRange: { from: null, to: null },
    }),
}))
```

---

## 9. Routing

### 9.1 Route Configuration

```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'

import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

// Auth pages
import { LoginPage } from '@/pages/auth/LoginPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'

// Dashboard
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { LiveMonitorPage } from '@/pages/dashboard/LiveMonitorPage'

// Buildings
import { BuildingsListPage } from '@/pages/buildings/BuildingsListPage'
import { BuildingDetailsPage } from '@/pages/buildings/BuildingDetailsPage'
import { OfficeSpacesPage } from '@/pages/buildings/OfficeSpacesPage'

// Organizations
import { OrganizationsListPage } from '@/pages/organizations/OrganizationsListPage'
import { OrganizationDetailsPage } from '@/pages/organizations/OrganizationDetailsPage'
import { LeasesPage } from '@/pages/organizations/LeasesPage'

// Employees
import { EmployeesListPage } from '@/pages/employees/EmployeesListPage'
import { EmployeeDetailsPage } from '@/pages/employees/EmployeeDetailsPage'
import { CreateEmployeePage } from '@/pages/employees/CreateEmployeePage'

// Cards
import { CardsListPage } from '@/pages/cards/CardsListPage'

// Doors
import { DoorsListPage } from '@/pages/doors/DoorsListPage'
import { DoorDetailsPage } from '@/pages/doors/DoorDetailsPage'
import { DoorGroupsPage } from '@/pages/doors/DoorGroupsPage'

// Roles
import { RolesListPage } from '@/pages/roles/RolesListPage'
import { RoleDetailsPage } from '@/pages/roles/RoleDetailsPage'
import { PermissionMatrixPage } from '@/pages/roles/PermissionMatrixPage'

// Reports
import { AccessLogsPage } from '@/pages/reports/AccessLogsPage'
import { DeniedAccessPage } from '@/pages/reports/DeniedAccessPage'
import { AnalyticsPage } from '@/pages/reports/AnalyticsPage'

// Settings
import { SettingsPage } from '@/pages/settings/SettingsPage'
import { ProfilePage } from '@/pages/settings/ProfilePage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected routes with layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            
            {/* Dashboard */}
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="live-monitor" element={<LiveMonitorPage />} />

            {/* Buildings */}
            <Route path="buildings" element={<BuildingsListPage />} />
            <Route path="buildings/:id" element={<BuildingDetailsPage />} />
            <Route path="office-spaces" element={<OfficeSpacesPage />} />

            {/* Organizations */}
            <Route path="organizations" element={<OrganizationsListPage />} />
            <Route path="organizations/:id" element={<OrganizationDetailsPage />} />
            <Route path="leases" element={<LeasesPage />} />

            {/* Employees */}
            <Route path="employees" element={<EmployeesListPage />} />
            <Route path="employees/new" element={<CreateEmployeePage />} />
            <Route path="employees/:id" element={<EmployeeDetailsPage />} />

            {/* Cards */}
            <Route path="cards" element={<CardsListPage />} />

            {/* Doors */}
            <Route path="doors" element={<DoorsListPage />} />
            <Route path="doors/:id" element={<DoorDetailsPage />} />
            <Route path="door-groups" element={<DoorGroupsPage />} />

            {/* Roles */}
            <Route path="roles" element={<RolesListPage />} />
            <Route path="roles/:id" element={<RoleDetailsPage />} />
            <Route path="permissions" element={<PermissionMatrixPage />} />

            {/* Reports */}
            <Route path="access-logs" element={<AccessLogsPage />} />
            <Route path="denied-access" element={<DeniedAccessPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />

            {/* Settings */}
            <Route path="settings" element={<SettingsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  )
}
```

---

## 10. Core Components

### 10.1 App Shell (Layout)

```typescript
// src/components/layout/AppShell.tsx
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { useUiStore } from '@/store/uiStore'
import { cn } from '@/lib/utils'

export function AppShell() {
  const { sidebarCollapsed } = useUiStore()

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <div
        className={cn(
          'transition-all duration-300',
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        )}
      >
        <Header />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
```

### 10.2 Sidebar Navigation

```typescript
// src/components/layout/Sidebar.tsx
import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, Building2, Users, CreditCard, DoorOpen, 
  Shield, FileText, Settings, ChevronLeft, Radio
} from 'lucide-react'
import { useUiStore } from '@/store/uiStore'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Live Monitor', href: '/live-monitor', icon: Radio },
  { name: 'Buildings', href: '/buildings', icon: Building2 },
  { name: 'Organizations', href: '/organizations', icon: Building2 },
  { name: 'Employees', href: '/employees', icon: Users },
  { name: 'Access Cards', href: '/cards', icon: CreditCard },
  { name: 'Doors', href: '/doors', icon: DoorOpen },
  { name: 'Roles', href: '/roles', icon: Shield },
  { name: 'Access Logs', href: '/access-logs', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const location = useLocation()
  const { sidebarCollapsed, toggleSidebar } = useUiStore()

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 z-50',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b">
        {!sidebarCollapsed && (
          <span className="text-xl font-bold text-primary">AccessHub</span>
        )}
        <button
          onClick={toggleSidebar}
          className="ml-auto p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronLeft
            className={cn('h-5 w-5 transition-transform', sidebarCollapsed && 'rotate-180')}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-2 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname.startsWith(item.href)
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                isActive
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!sidebarCollapsed && <span>{item.name}</span>}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
```

### 10.3 Data Table Component

```typescript
// src/components/common/DataTable.tsx
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table'
import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ChevronUp, ChevronDown } from 'lucide-react'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  pagination?: {
    page: number
    limit: number
    total: number
    onPageChange: (page: number) => void
  }
  isLoading?: boolean
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pagination,
  isLoading,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  })

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={header.column.getCanSort() ? 'cursor-pointer select-none' : ''}
                  >
                    <div className="flex items-center gap-2">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === 'asc' && <ChevronUp className="h-4 w-4" />}
                      {header.column.getIsSorted() === 'desc' && <ChevronDown className="h-4 w-4" />}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} results
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page * pagination.limit >= pagination.total}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
```

### 10.4 Status Badge Component

```typescript
// src/components/common/StatusBadge.tsx
import { cn } from '@/lib/utils'

type StatusType = 'active' | 'inactive' | 'granted' | 'denied' | 'lost' | 'blocked' | 'public' | 'private' | 'restricted'

const statusConfig: Record<StatusType, { bg: string; text: string; label: string }> = {
  active: { bg: 'bg-green-100', text: 'text-green-700', label: 'Active' },
  inactive: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Inactive' },
  granted: { bg: 'bg-green-100', text: 'text-green-700', label: 'Granted' },
  denied: { bg: 'bg-red-100', text: 'text-red-700', label: 'Denied' },
  lost: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Lost' },
  blocked: { bg: 'bg-red-100', text: 'text-red-700', label: 'Blocked' },
  public: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Public' },
  private: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Private' },
  restricted: { bg: 'bg-red-100', text: 'text-red-700', label: 'Restricted' },
}

interface StatusBadgeProps {
  status: StatusType | string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status.toLowerCase() as StatusType] || {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    label: status,
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        config.bg,
        config.text,
        className
      )}
    >
      {config.label}
    </span>
  )
}
```

---

## 11. Feature Implementation

### 11.1 Employees List Page Example

```typescript
// src/pages/employees/EmployeesListPage.tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ColumnDef } from '@tanstack/react-table'
import { Plus, MoreHorizontal } from 'lucide-react'
import { useEmployees } from '@/hooks/queries/useEmployees'
import { Employee } from '@/types/employee.types'
import { DataTable } from '@/components/common/DataTable'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useDebounce } from '@/hooks/useDebounce'

export function EmployeesListPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)

  const { data, isLoading } = useEmployees({
    page,
    limit: 20,
    search: debouncedSearch,
  })

  const columns: ColumnDef<Employee>[] = [
    {
      accessorKey: 'name',
      header: 'Employee',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-medium">
              {row.original.name.charAt(0)}
            </span>
          </div>
          <div>
            <Link
              to={`/employees/${row.original.id}`}
              className="font-medium hover:text-primary"
            >
              {row.original.name}
            </Link>
            <p className="text-sm text-gray-500">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'organization.name',
      header: 'Organization',
    },
    {
      accessorKey: 'access_role.name',
      header: 'Role',
      cell: ({ row }) => (
        <StatusBadge status={row.original.access_role?.name || 'Unknown'} />
      ),
    },
    {
      accessorKey: 'access_card.status',
      header: 'Card Status',
      cell: ({ row }) => (
        row.original.access_card ? (
          <StatusBadge status={row.original.access_card.status.toLowerCase()} />
        ) : (
          <span className="text-gray-400">No card</span>
        )
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <StatusBadge status={row.original.status.toLowerCase()} />
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={`/employees/${row.original.id}`}>View Details</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={`/employees/${row.original.id}/edit`}>Edit</Link>
            </DropdownMenuItem>
            {!row.original.access_card && (
              <DropdownMenuItem>Issue Card</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Employees</h1>
          <p className="text-gray-500">Manage all employees and their access cards</p>
        </div>
        <Button asChild>
          <Link to="/employees/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        {/* Add more filters: Organization, Role, Status dropdowns */}
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        pagination={
          data?.pagination
            ? {
                page: data.pagination.page,
                limit: data.pagination.limit,
                total: data.pagination.total,
                onPageChange: setPage,
              }
            : undefined
        }
      />
    </div>
  )
}
```

### 11.2 Dashboard Page Example

```typescript
// src/pages/dashboard/DashboardPage.tsx
import { useQuery } from '@tanstack/react-query'
import { Building2, Users, CreditCard, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { accessLogService } from '@/services/access-log.service'
import { AccessLogFeed } from '@/components/features/dashboard/AccessLogFeed'
import { AccessChart } from '@/components/features/dashboard/AccessChart'

export function DashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => accessLogService.getStats(),
  })

  const { data: recentLogs } = useQuery({
    queryKey: ['recent-access-logs'],
    queryFn: () => accessLogService.getRecent(10),
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Employees
            </CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalEmployees || 0}</div>
            <p className="text-xs text-gray-500">
              {stats?.activeEmployees || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Cards
            </CardTitle>
            <CreditCard className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeCards || 0}</div>
            <p className="text-xs text-gray-500">
              {stats?.blockedCards || 0} blocked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Access Today
            </CardTitle>
            <Building2 className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.accessToday || 0}</div>
            <p className="text-xs text-green-600">
              {stats?.grantedToday || 0} granted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Denied Today
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats?.deniedToday || 0}
            </div>
            <p className="text-xs text-gray-500">
              {((stats?.deniedToday / stats?.accessToday) * 100 || 0).toFixed(1)}% denial rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Access Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <AccessLogFeed logs={recentLogs || []} />
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <CreditCard className="h-4 w-4 mr-2" />
              Issue New Card
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Users className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <AlertTriangle className="h-4 w-4 mr-2" />
              View Denied Access
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Access Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Access by Hour (Last 24h)</CardTitle>
        </CardHeader>
        <CardContent>
          <AccessChart data={stats?.hourlyData || []} />
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## 12. Real-time Features

### 12.1 Live Access Feed with Supabase

```typescript
// src/hooks/useLiveAccessFeed.ts
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { AccessLog } from '@/types/access-log.types'

export function useLiveAccessFeed() {
  const [logs, setLogs] = useState<AccessLog[]>([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Subscribe to new access logs
    const channel = supabase
      .channel('access_log_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'access_log',
        },
        (payload) => {
          const newLog = payload.new as AccessLog
          setLogs((prev) => [newLog, ...prev.slice(0, 49)]) // Keep last 50
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED')
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return { logs, isConnected }
}
```

### 12.2 Live Monitor Page

```typescript
// src/pages/dashboard/LiveMonitorPage.tsx
import { useLiveAccessFeed } from '@/hooks/useLiveAccessFeed'
import { StatusBadge } from '@/components/common/StatusBadge'
import { formatDistanceToNow } from 'date-fns'
import { Wifi, WifiOff, Volume2, VolumeX } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

export function LiveMonitorPage() {
  const { logs, isConnected } = useLiveAccessFeed()
  const [soundEnabled, setSoundEnabled] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Play sound on denied access
  useEffect(() => {
    if (soundEnabled && logs[0]?.status === 'DENIED') {
      audioRef.current?.play()
    }
  }, [logs[0]?.id, soundEnabled])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Live Access Monitor</h1>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-600">Disconnected</span>
              </>
            )}
          </div>
        </div>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100"
        >
          {soundEnabled ? (
            <Volume2 className="h-5 w-5" />
          ) : (
            <VolumeX className="h-5 w-5 text-gray-400" />
          )}
          <span className="text-sm">Sound {soundEnabled ? 'On' : 'Off'}</span>
        </button>
      </div>

      {/* Live Feed */}
      <div className="space-y-3">
        {logs.map((log, index) => (
          <div
            key={log.id}
            className={cn(
              'flex items-center gap-4 p-4 bg-white rounded-lg border transition-all',
              log.status === 'DENIED' && index === 0 && 'border-red-500 bg-red-50 animate-pulse',
              log.status === 'GRANTED' && index === 0 && 'border-green-500'
            )}
          >
            {/* Status Icon */}
            <div
              className={cn(
                'h-12 w-12 rounded-full flex items-center justify-center',
                log.status === 'GRANTED' ? 'bg-green-100' : 'bg-red-100'
              )}
            >
              <span className={cn(
                'text-2xl',
                log.status === 'GRANTED' ? 'text-green-600' : 'text-red-600'
              )}>
                {log.status === 'GRANTED' ? '✓' : '✗'}
              </span>
            </div>

            {/* Details */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{log.employee_name || 'Unknown'}</span>
                <StatusBadge status={log.status.toLowerCase()} />
              </div>
              <p className="text-sm text-gray-500">
                {log.door_name} • {log.organization_name}
              </p>
              {log.status === 'DENIED' && log.denial_reason && (
                <p className="text-sm text-red-600 mt-1">
                  Reason: {log.denial_reason}
                </p>
              )}
            </div>

            {/* Time */}
            <div className="text-right">
              <p className="text-sm font-medium">
                {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
              </p>
              <p className="text-xs text-gray-400">
                {new Date(log.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {logs.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>Waiting for access attempts...</p>
          </div>
        )}
      </div>

      {/* Hidden audio element */}
      <audio ref={audioRef} src="/alert.mp3" />
    </div>
  )
}
```

---

## 13. Forms & Validation

### 13.1 Zod Schemas

```typescript
// src/lib/validations.ts
import { z } from 'zod'

export const createEmployeeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  organization_id: z.string().uuid('Please select an organization'),
  role_id: z.string().uuid('Please select a role'),
})

export const createOrganizationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
})

export const createDoorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  location: z.string().min(2, 'Location is required'),
  floor_id: z.string().uuid('Please select a floor'),
  office_space_id: z.string().uuid().optional(),
  door_group_ids: z.array(z.string().uuid()).min(1, 'Select at least one door group'),
})

export const issueCardSchema = z.object({
  card_uid: z.string().min(4, 'Card UID must be at least 4 characters'),
})

// Type inference
export type CreateEmployeeForm = z.infer<typeof createEmployeeSchema>
export type CreateOrganizationForm = z.infer<typeof createOrganizationSchema>
export type CreateDoorForm = z.infer<typeof createDoorSchema>
export type IssueCardForm = z.infer<typeof issueCardSchema>
```

### 13.2 Multi-Step Form Example

```typescript
// src/pages/employees/CreateEmployeePage.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createEmployeeSchema, CreateEmployeeForm } from '@/lib/validations'
import { useCreateEmployee, useIssueCard } from '@/hooks/queries/useEmployees'
import { useOrganizations } from '@/hooks/queries/useOrganizations'
import { useRoles } from '@/hooks/queries/useRoles'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'

const steps = ['Basic Info', 'Organization & Role', 'Access Card', 'Review']

export function CreateEmployeePage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [issueCard, setIssueCard] = useState(true)
  const [cardUid, setCardUid] = useState('')
  const [createdEmployee, setCreatedEmployee] = useState<any>(null)

  const { data: organizations } = useOrganizations()
  const { data: roles } = useRoles()
  const createEmployee = useCreateEmployee()
  const issueCardMutation = useIssueCard()

  const form = useForm<CreateEmployeeForm>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: {
      name: '',
      email: '',
      organization_id: '',
      role_id: '',
    },
  })

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0))

  const onSubmit = async (data: CreateEmployeeForm) => {
    if (currentStep < steps.length - 1) {
      nextStep()
      return
    }

    try {
      const employee = await createEmployee.mutateAsync(data)
      setCreatedEmployee(employee)

      if (issueCard && cardUid) {
        await issueCardMutation.mutateAsync({
          employeeId: employee.id,
          cardUid,
        })
      }

      nextStep() // Go to success state
    } catch (error) {
      // Error handled by mutation
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center">
            <div
              className={cn(
                'h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium',
                index < currentStep
                  ? 'bg-green-500 text-white'
                  : index === currentStep
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-600'
              )}
            >
              {index < currentStep ? <CheckCircle className="h-5 w-5" /> : index + 1}
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'w-24 h-1 mx-2',
                  index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                )}
              />
            )}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep]}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {currentStep === 0 && (
              <>
                <div>
                  <label className="text-sm font-medium">Full Name</label>
                  <Input {...form.register('name')} placeholder="John Doe" />
                  {form.formState.errors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input {...form.register('email')} placeholder="john@example.com" />
                  {form.formState.errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>
              </>
            )}

            {currentStep === 1 && (
              <>
                <div>
                  <label className="text-sm font-medium">Organization</label>
                  <Select
                    value={form.watch('organization_id')}
                    onValueChange={(value) => form.setValue('organization_id', value)}
                  >
                    {organizations?.data?.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Role</label>
                  <Select
                    value={form.watch('role_id')}
                    onValueChange={(value) => form.setValue('role_id', value)}
                  >
                    {roles?.data?.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </>
            )}

            {currentStep === 2 && (
              <>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={issueCard}
                    onChange={(e) => setIssueCard(e.target.checked)}
                  />
                  <label>Issue access card now</label>
                </div>
                {issueCard && (
                  <div>
                    <label className="text-sm font-medium">Card UID</label>
                    <Input
                      value={cardUid}
                      onChange={(e) => setCardUid(e.target.value)}
                      placeholder="CARD-XXXX-XXXX"
                    />
                  </div>
                )}
              </>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="font-medium">Review Details</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p><strong>Name:</strong> {form.watch('name')}</p>
                  <p><strong>Email:</strong> {form.watch('email')}</p>
                  <p>
                    <strong>Organization:</strong>{' '}
                    {organizations?.data?.find((o) => o.id === form.watch('organization_id'))?.name}
                  </p>
                  <p>
                    <strong>Role:</strong>{' '}
                    {roles?.data?.find((r) => r.id === form.watch('role_id'))?.name}
                  </p>
                  {issueCard && <p><strong>Card UID:</strong> {cardUid}</p>}
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 0}>
                Back
              </Button>
              <Button type="submit" disabled={createEmployee.isPending}>
                {currentStep === steps.length - 1 ? 'Create Employee' : 'Next'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## 14. Error Handling

### 14.1 Error Boundary

```typescript
// src/components/common/ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
            <p className="text-gray-500 mb-4">{this.state.error?.message}</p>
            <Button onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
```

### 14.2 API Error Handling

```typescript
// src/lib/api-error.ts
import { AxiosError } from 'axios'
import { toast } from 'sonner'

export function handleApiError(error: AxiosError<any>) {
  const message = error.response?.data?.message || error.message || 'An error occurred'
  const statusCode = error.response?.status

  switch (statusCode) {
    case 400:
      toast.error(`Validation Error: ${message}`)
      break
    case 401:
      toast.error('Session expired. Please login again.')
      // Redirect to login handled by interceptor
      break
    case 403:
      toast.error('You do not have permission to perform this action.')
      break
    case 404:
      toast.error('Resource not found.')
      break
    case 500:
      toast.error('Server error. Please try again later.')
      break
    default:
      toast.error(message)
  }

  return Promise.reject(error)
}
```

---

## 15. Testing

### 15.1 Testing Setup

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event msw
```

### 15.2 Component Test Example

```typescript
// src/components/common/StatusBadge.test.tsx
import { render, screen } from '@testing-library/react'
import { StatusBadge } from './StatusBadge'

describe('StatusBadge', () => {
  it('renders active status correctly', () => {
    render(<StatusBadge status="active" />)
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('Active')).toHaveClass('text-green-700')
  })

  it('renders denied status correctly', () => {
    render(<StatusBadge status="denied" />)
    expect(screen.getByText('Denied')).toBeInTheDocument()
    expect(screen.getByText('Denied')).toHaveClass('text-red-700')
  })
})
```

---

## 16. Deployment

### 16.1 Build Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
```

### 16.2 Deployment Commands

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to Vercel
vercel --prod

# Deploy to Netlify
netlify deploy --prod --dir=dist
```

### 16.3 Environment Variables for Production

```env
# Production .env
VITE_API_BASE_URL=https://your-api.com/api/v1
VITE_FIREBASE_API_KEY=your-production-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Implementation Checklist

### Phase 1: Foundation (Week 1)
- [ ] Project setup with Vite + TypeScript
- [ ] Tailwind CSS + shadcn/ui configuration
- [ ] Firebase Auth integration
- [ ] Axios instance with interceptors
- [ ] Protected routes setup
- [ ] App shell layout (Sidebar, Header)
- [ ] Login page

### Phase 2: Core Features (Week 2)
- [ ] Dashboard page with stats
- [ ] Employees list with DataTable
- [ ] Employee details page
- [ ] Create employee form
- [ ] Card issuance flow
- [ ] Organizations list and details
- [ ] Buildings list and details

### Phase 3: Access Control (Week 3)
- [ ] Doors list and management
- [ ] Door groups management
- [ ] Roles list and details
- [ ] Permission matrix
- [ ] Role assignment to door groups

### Phase 4: Monitoring & Reports (Week 4)
- [ ] Access logs page with filters
- [ ] Live monitor with real-time updates
- [ ] Denied access report
- [ ] Analytics dashboard with charts
- [ ] Export functionality

### Phase 5: Polish (Week 5)
- [ ] Settings pages
- [ ] User profile
- [ ] Mobile responsiveness
- [ ] Error boundaries
- [ ] Loading states
- [ ] Empty states
- [ ] Testing
- [ ] Documentation

---

## Resources

- [React Documentation](https://react.dev)
- [TanStack Query](https://tanstack.com/query)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Firebase Auth](https://firebase.google.com/docs/auth)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Recharts](https://recharts.org)
- [React Hook Form](https://react-hook-form.com)
- [Zod](https://zod.dev)

---

## API Endpoints Quick Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/access/verify` | POST | Verify card access (public) |
| `/access/logs` | GET | Get access logs |
| `/access/stats` | GET | Get access statistics |
| `/buildings` | GET/POST | List/Create buildings |
| `/buildings/:id` | GET/PATCH/DELETE | Building CRUD |
| `/buildings/:id/floors` | GET/POST | Floor management |
| `/organizations` | GET/POST | List/Create organizations |
| `/organizations/:id` | GET/PATCH/DELETE | Organization CRUD |
| `/organizations/:id/leases` | GET/POST | Lease management |
| `/employees` | GET/POST | List/Create employees |
| `/employees/:id` | GET/PATCH/DELETE | Employee CRUD |
| `/employees/:id/card` | POST/PATCH | Card operations |
| `/doors` | GET/POST | List/Create doors |
| `/doors/:id` | GET/PATCH/DELETE | Door CRUD |
| `/doors/groups` | GET/POST | Door group management |
| `/roles` | GET/POST | List/Create roles |
| `/roles/:id` | GET/PATCH/DELETE | Role CRUD |
| `/roles/:id/permissions` | PUT | Set role permissions |

---

**End of Frontend Implementation Guide**
