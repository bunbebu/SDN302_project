import React, { useState } from "react";
import { Layout, ConfigProvider } from "antd";
import { Outlet } from "react-router-dom";
import AppSidebar from "./components/AppSidebar";
import AppHeader from "./components/AppHeader";
import AppFooter from "./components/AppFooter";
import "./admin.css";

const { Content } = Layout;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div className="admin-orange">
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#f97316",
            colorInfo: "#f97316",
            colorBgBase: "#fff7ed",
            colorText: "#0f172a",
            borderRadius: 10,
          },
          components: {
            Menu: { itemSelectedBg: "#fff7ed", itemSelectedColor: "#f97316" },
          },
        }}
      >
        <Layout style={{ minHeight: "100vh", background: "var(--layout-bg)" }}>
          <AppSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

          <Layout
            style={{
              marginLeft: collapsed ? 80 : 250,
              transition: "margin-left 0.2s",
              background: "var(--layout-bg)",
            }}
          >
            <AppHeader collapsed={collapsed} />

            <Content
              style={{ margin: "24px 16px", padding: 24, minHeight: 280 }}
              className="admin-content-card"
            >
              <Outlet />
            </Content>

            <AppFooter />
          </Layout>
        </Layout>
      </ConfigProvider>
    </div>
  );
};

export default AdminLayout;

