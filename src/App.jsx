// Code đầy đủ cho App.js (Đã sửa)
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";

import { App as AntApp } from "antd";

import AdminLayout from "./templates/admin/AdminLayout";
import StaffLayout from "./templates/staff/StaffLayout";
import AuthGuard from "./components/AuthGuard";

import LoginPage from "./pages/login/LoginPage";
import Dashboard from "./pages/admin/Dashboard";
import UserManagement from "./pages/admin/UserManagement";
import VehicleManagement from "./pages/admin/VehicleManagement";
import ServiceList from "./pages/admin/ServiceList";
import BookingManagement from "./pages/admin/BookingManagement";
import PartManagement from "./pages/admin/PartManagement";
import InventoryManagement from "./pages/admin/InventoryManagement";
import AdminServiceRecordManagement from "./pages/admin/AdminServiceRecordManagement";

import StaffDashboard from "./pages/staff/Dashboard";
import StaffServiceList from "./pages/staff/ServiceList";
import StaffServiceCategories from "./pages/staff/ServiceCategories";
import StaffBookingManagement from "./pages/staff/BookingManagement";
import ServiceRecordManagement from "./pages/staff/ServiceRecordManagement";

import UnauthorizedPage from "./pages/common/UnauthorizedPage";
import NotFoundPage from "./pages/common/NotFoundPage";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// Import component BrandManagement (Tên này đã đúng với export)
import BrandManagementPage from "./pages/admin/BrandManagement";
import ModelManagementPage from "./pages/admin/ModelManagement";

function App() {
  return (
    <AntApp>
      <BrowserRouter>
        <AuthGuard>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="bookings" element={<BookingManagement />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="vehicles" element={<VehicleManagement />} />
              <Route path="brands" element={<BrandManagementPage />} />
              <Route path="models" element={<ModelManagementPage />} />
              <Route path="services/service-lists" element={<ServiceList />} />
              <Route path="parts" element={<PartManagement />} />
              <Route path="inventory" element={<InventoryManagement />} />
              <Route
                path="service-records"
                element={<AdminServiceRecordManagement />}
              />
            </Route>

            <Route path="/staff" element={<StaffLayout />}>
              <Route index element={<StaffDashboard />} />
              <Route path="dashboard" element={<StaffDashboard />} />
              <Route
                path="services/service-lists"
                element={<StaffServiceList />}
              />
              <Route
                path="services/service-categories"
                element={<StaffServiceCategories />}
              />
              <Route path="bookings" element={<StaffBookingManagement />} />
              <Route
                path="service-records"
                element={<ServiceRecordManagement />}
              />
              <Route path="inventory" element={<InventoryManagement />} />
              <Route path="parts" element={<PartManagement />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthGuard>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </BrowserRouter>
    </AntApp>
  );
}

export default App;
