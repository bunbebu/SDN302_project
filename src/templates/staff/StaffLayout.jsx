import React, { useState } from "react";
import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import AppSidebar from "./components/AppSidebar";
import AppHeader from "./components/AppHeader";
import AppFooter from "./components/AppFooter";

const { Content } = Layout;

const StaffLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Thanh Sidebar bên trái */}
      <AppSidebar collapsed={collapsed} />

      <Layout>
        {/* Header của trang */}
        <AppHeader collapsed={collapsed} setCollapsed={setCollapsed} />

        {/* Nội dung chính của trang */}
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: "#fff", // Màu nền cho khu vực nội dung
            borderRadius: "8px",
          }}
        >
          {/* Outlet sẽ render các component con dựa trên route */}
          <Outlet />
        </Content>

        {/* Footer của trang */}
        <AppFooter />
      </Layout>
    </Layout>
  );
};

export default StaffLayout;
