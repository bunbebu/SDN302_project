import React from "react";
import { Layout, Avatar, Dropdown, Menu, Badge, Space } from "antd";
import {
  // MenuFoldOutlined, // Không cần nữa
  // MenuUnfoldOutlined, // Không cần nữa
  UserOutlined,
  BellOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

// Import các hàm và service cần thiết
import { setLogoutAction } from "../../../stores/user/userSlice";
import { userService } from "../../../services/userService";

const { Header } = Layout;

// Gỡ bỏ props setCollapsed
const AppHeader = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Hàm xử lý việc đăng xuất, sẽ được gọi trực tiếp
  const handleLogout = async () => {
    try {
      // 1. Gọi API đăng xuất từ server
      await userService.logout();

      // 2. Dispatch action logout từ Redux
      dispatch(setLogoutAction());

      toast.success("Đăng xuất thành công!");

      // 3. Điều hướng về trang chủ
      navigate("/");
    } catch (error) {
      console.error("Đăng xuất thất bại:", error);
      toast.error("Có lỗi xảy ra, vui lòng thử lại.");
      // Dù API có lỗi, vẫn đăng xuất ở client để đảm bảo an toàn
      dispatch(setLogoutAction());
      navigate("/adin");
    }
  };

  // Menu cho dropdown của user
  const userMenu = (
    <Menu>
      {/* Gắn trực tiếp sự kiện handleLogout vào onClick */}
      <Menu.Item
        key="logout"
        icon={<LogoutOutlined />}
        danger
        onClick={handleLogout}
      >
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

  return (
    <Header
      style={{
        padding: "0 24px",
        background: "#fff",
        display: "flex",
        // Thay đổi thành flex-end để đẩy các icon về bên phải
        justifyContent: "flex-end",
        alignItems: "center",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        // Thêm position sticky để header luôn ở trên cùng khi cuộn
        position: "sticky",
        top: 0,
        zIndex: 9, // Thấp hơn zIndex của sidebar (10)
      }}
    >
      {/* Nút thu gọn/mở rộng sidebar ĐÃ BỊ XÓA */}

      {/* Các mục bên phải header */}
      <Space size="middle">
        <Dropdown overlay={userMenu} placement="bottomRight">
          <Space style={{ cursor: "pointer" }}>
            <Avatar icon={<UserOutlined />} />
            <span>Admin</span>
          </Space>
        </Dropdown>
      </Space>
    </Header>
  );
};

export default AppHeader;
