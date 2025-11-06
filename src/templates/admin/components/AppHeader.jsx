import React from "react";
import { Layout, Avatar, Dropdown, Menu, Space } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

import { setLogoutAction } from "../../../stores/user/userSlice";
import { userService } from "../../../services/userService";

const { Header } = Layout;

const AppHeader = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await userService.logout();
      dispatch(setLogoutAction());
      toast.success("Đăng xuất thành công!");
      navigate("/");
    } catch (error) {
      dispatch(setLogoutAction());
      navigate("/");
    }
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="logout" icon={<LogoutOutlined />} danger onClick={handleLogout}>
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

  return (
    <Header
      style={{
        padding: "0 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 9,
      }}
    >
      <span style={{ color: "#fff", fontWeight: 700 }}>EV Service Admin</span>
      <Space size="middle">
        <Dropdown overlay={userMenu} placement="bottomRight">
          <Space style={{ cursor: "pointer", color: "#fff" }}>
            <Avatar icon={<UserOutlined />} />
            <span>Admin</span>
          </Space>
        </Dropdown>
      </Space>
    </Header>
  );
};

export default AppHeader;

