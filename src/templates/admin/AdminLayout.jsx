import React, { useState } from "react";
import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import AppSidebar from "./components/AppSidebar";
import AppHeader from "./components/AppHeader";
import AppFooter from "./components/AppFooter";

const { Content } = Layout;

const AdminLayout = () => {
  // Bắt đầu với trạng thái đóng (true)
  const [collapsed, setCollapsed] = useState(true);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar giờ đây sẽ nhận state và hàm set */}
      <AppSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Layout chính (Header + Content + Footer) cần phải có lề
          để không bị Sidebar (fixed) che mất */}
      <Layout
        style={{
          // 80px là độ rộng mặc định khi thu gọn của Ant Sider
          // 250px là độ rộng khi mở rộng ta set ở AppSidebar
          marginLeft: collapsed ? 80 : 250,
          transition: "margin-left 0.2s", // Đồng bộ với animation của sidebar
        }}
      >
        {/* Header của trang */}
        <AppHeader collapsed={collapsed} />

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

export default AdminLayout;
