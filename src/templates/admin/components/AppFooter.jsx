import React from "react";
import { Layout } from "antd";

const { Footer } = Layout;

const AppFooter = () => {
  return (
    <Footer style={{ textAlign: "center" }}>
      EV-Care Admin Dashboard ©{new Date().getFullYear()}
    </Footer>
  );
};

export default AppFooter;
