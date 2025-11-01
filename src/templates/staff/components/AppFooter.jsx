import React from "react";
import { Layout } from "antd";

const { Footer } = Layout;

const AppFooter = () => {
  return (
    <Footer style={{ textAlign: "center" }}>
      EV-Care Admin Dashboard ©{new Date().getFullYear()} Created by Your Name
    </Footer>
  );
};

export default AppFooter;
