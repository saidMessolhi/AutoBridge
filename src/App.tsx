/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { Landing } from './pages/Landing';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { OrderDetails } from './pages/admin/OrderDetails';
import { Accounting } from './pages/admin/Accounting';
import { Login } from './pages/Login';
import { Settings } from './pages/admin/Settings';
import { ClientPortal } from './pages/portal/ClientPortal';
import { OrdersPage } from './pages/admin/OrdersPage';
import { DocumentsPage } from './pages/admin/DocumentsPage';
import { UsersManagement } from './pages/admin/UsersManagement';
 
export default function App() {
  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          
          {/* Client Portal */}
          <Route path="/portal" element={<Navigate to="/portal/dashboard" replace />} />
          <Route path="/portal/dashboard" element={<ClientPortal />} />
          <Route path="/portal/orders" element={<ClientPortal />} />
          
          {/* Admin/Staff Portal */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/orders" element={<OrdersPage />} />
          <Route path="/admin/orders/:id" element={<OrderDetails />} />
          <Route path="/admin/finance" element={<Accounting />} />
          <Route path="/admin/settings" element={<Settings />} />
          <Route path="/admin/documents" element={<DocumentsPage />} />
          <Route path="/admin/reports" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UsersManagement />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
}
