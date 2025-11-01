import React, { useState, useEffect } from "react";
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  CarOutlined,
  ToolOutlined,
  CalendarOutlined,
  SettingOutlined,
  DatabaseOutlined,
  FileDoneOutlined,
  ApartmentOutlined, // (Vẫn giữ import icon, dù không dùng ở đây)
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import logo from "../../../assets/images/logo.png";

const { Sider } = Layout;

function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label,
  };
}

const menuItems = [
  getItem(
    <Link to="/admin/dashboard">Tổng quan</Link>,
    "/admin/dashboard",
    <DashboardOutlined />
  ),
  getItem(
    <Link to="/admin/users">Quản lý người dùng</Link>,
    "/admin/users",
    <UserOutlined />
  ),
  // (CẬP NHẬT) Thêm "Hồ sơ Dịch vụ" vào đây
  getItem("Quản lý dịch vụ", "sub2", <ToolOutlined />, [
    getItem(
      <Link to="/admin/services/service-lists">Danh sách dịch vụ</Link>,
      "/admin/services/service-lists"
    ),
    // (MỚI) Đã di chuyển "Hồ sơ Dịch vụ" vào đây
    getItem(
      <Link to="/admin/service-records">Hồ sơ Dịch vụ</Link>,
      "/admin/service-records"
      // Bỏ icon để đồng bộ với menu con
    ),
  ]),
  getItem(
    <Link to="/admin/bookings">Lịch hẹn</Link>,
    "/admin/bookings",
    <CalendarOutlined />
  ),

  // (ĐÃ XÓA) "Hồ sơ Dịch vụ" đã được chuyển từ đây
  // getItem(
  //   <Link to="/admin/service-records">Hồ sơ Dịch vụ</Link>,
  //   "/admin/service-records",
  //   <FileDoneOutlined />
  // ),

  getItem(
    <Link to="/admin/vehicles">Quản lý xe</Link>,
    "/admin/vehicles",
    <CarOutlined />
  ),
  getItem(
    <Link to="/admin/brands">Thương hiệu xe</Link>,
    "/admin/brands",
    <ApartmentOutlined />
  ),
  getItem(
    <Link to="/admin/models">Mẫu xe</Link>,
    "/admin/models",
    <CarOutlined /> 
  ),
  getItem(
    <Link to="/admin/parts">Quản lý Phụ tùng</Link>,
    "/admin/parts",
    <SettingOutlined />
  ),
  getItem(
    <Link to="/admin/inventory">Quản lý Kho</Link>,
    "/admin/inventory",
    <DatabaseOutlined />
  ),
];

const AppSidebar = ({ collapsed, setCollapsed }) => {
  const location = useLocation();
  const [openKeys, setOpenKeys] = useState(["sub2"]);

  useEffect(() => {
    if (collapsed) {
      setOpenKeys([]);
    } else {
      const currentSub = menuItems.find((item) => {
        if (item.children) {
          // Logic này vẫn đúng và sẽ tự động tìm thấy
          // /admin/service-records trong "sub2"
          return item.children.some((child) => child.key === location.pathname);
        }
        return false;
      });
      setOpenKeys(currentSub ? [currentSub.key] : ["sub2"]);
    }
  }, [collapsed, location.pathname]);

  const onOpenChange = (keys) => {
    setOpenKeys(keys);
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={250}
      style={{
        overflow: "auto",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 1000,
      }}
      onMouseEnter={() => setCollapsed(false)}
      onMouseLeave={() => setCollapsed(true)}
    >
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
            EV-Care Admin
          </span>
        )}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        openKeys={openKeys}
        onOpenChange={onOpenChange}
        items={menuItems}
      />
    </Sider>
  );
};

export default AppSidebar;
