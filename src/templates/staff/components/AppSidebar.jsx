import React from "react";
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  CarOutlined,
  ToolOutlined,
  CalendarOutlined,
  SettingOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import logo from "../../../assets/images/logo.png";

const { Sider } = Layout;

// Hàm để tạo item cho menu
function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label,
  };
}

// Danh sách các mục menu
const menuItems = [
  getItem(
    <Link to="/staff/dashboard">Tổng quan</Link>,
    "/staff/dashboard",
    <DashboardOutlined />
  ),
  getItem("Quản lý dịch vụ", "sub1", <ToolOutlined />, [
    getItem(
      <Link to="/staff/services/service-lists">Danh sách dịch vụ</Link>,
      "/staff/services/service-lists"
    ),
    getItem(
      <Link to="/staff/services/service-categories">Loại dịch vụ</Link>,
      "/staff/services/service-categories"
    ),
  ]),
  getItem(
    <Link to="/staff/bookings">Quản lý đặt lịch</Link>,
    "/staff/bookings",
    <CalendarOutlined />
  ),
  getItem(
    <Link to="/staff/inventory">Kho linh kiện</Link>,
    "/staff/inventory",
    <ToolOutlined />
  ),
  getItem(
    <Link to="/staff/parts">Phụ tùng</Link>,
    "/staff/parts",
    <ToolOutlined />
  ),
  getItem(
    <Link to="/staff/service-records">Phiếu dịch vụ</Link>,
    "/staff/service-records",
    <FileTextOutlined />
  ),
  getItem(
    <Link to="/staff/technicians">Danh sách kỹ thuật viên</Link>,
    "/staff/technicians",
    <UserOutlined />
  ),
  getItem(
    <Link to="/staff/customers">Danh sách khách hàng</Link>,
    "/staff/customers",
    <UserOutlined />
  ),
  getItem(
    <Link to="/staff/vehicles">Quản lý xe</Link>,
    "/staff/vehicles",
    <CarOutlined />
  ),
  getItem(
    <Link to="/staff/settings">Cài đặt</Link>,
    "/staff/settings",
    <SettingOutlined />
  ),
];

const AppSidebar = ({ collapsed }) => {
  const location = useLocation();

  return (
    <Sider trigger={null} collapsible collapsed={collapsed} width={250}>
      <div
        style={{
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          paddingLeft: collapsed ? 0 : 16,
          gap: 12,
        }}
      >
        <img
          src={logo}
          alt="Logo"
          style={{
            height: 40,
            width: "auto",
            transition: "all 0.3s",
          }}
        />
        {!collapsed && (
          <span
            style={{
              color: "white",
              fontSize: "20px",
              fontWeight: "bold",
            }}
          >
            EV-Care Staff
          </span>
        )}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        defaultOpenKeys={["sub1"]}
        items={menuItems}
      />
    </Sider>
  );
};

export default AppSidebar;
