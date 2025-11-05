import React, { useState } from "react";
import { Layout, Menu, Avatar, Dropdown, message } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { HomeOutlined, CarOutlined, CalendarOutlined, HistoryOutlined, UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { setLogoutAction } from "../../stores/user/userSlice";
import { userService } from "../../services/userService";

const { Header, Content, Sider } = Layout;

const MemberLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { infoUser } = useSelector((state) => state.userSlice);

    // Lấy thông tin user
    const user = infoUser?.user;
    const userName = user?.first_name && user?.last_name
        ? `${user.first_name} ${user.last_name}`
        : user?.email || "Member";
    const avatarUrl = user?.avatar_url;

    const menuItems = [
        { key: "/member", icon: React.createElement(HomeOutlined), label: "Trang chủ" },
        // { key: "/member/vehicles", icon: React.createElement(CarOutlined), label: "Xe của tôi" },
        { key: "/member/bookings", icon: React.createElement(CalendarOutlined), label: "Lịch hẹn" },
        { key: "/member/history", icon: React.createElement(HistoryOutlined), label: "Lịch sử bảo dưỡng" },
        { key: "/member/profile", icon: React.createElement(UserOutlined), label: "Thông tin cá nhân" },
    ];

    const handleMenuClick = ({ key }) => {
        if (key === "logout") {
            handleLogout();
        } else {
            navigate(key);
        }
    };

    const handleLogout = async () => {
        try {
            await userService.logout();
            message.success("Đăng xuất thành công");
            dispatch(setLogoutAction());
            navigate("/");
        } catch (error) {
            console.error("Logout error:", error);
            // Vẫn logout ở client side ngay cả khi API lỗi
            dispatch(setLogoutAction());
            navigate("/");
        }
    };

    const userMenuItems = [
        {
            key: "profile",
            icon: React.createElement(UserOutlined),
            label: "Thông tin cá nhân",
            onClick: () => navigate("/member/profile"),
        },
        {
            type: "divider",
        },
        {
            key: "logout",
            icon: React.createElement(LogoutOutlined),
            label: "Đăng xuất",
            danger: true,
            onClick: handleLogout,
        },
    ];

    const getSelectedKey = () => {
        const path = location.pathname;
        if (menuItems.find((item) => item.key === path)) return path;
        return menuItems.find((item) => path.startsWith(item.key))?.key || "/member";
    };

    return React.createElement(Layout, { style: { minHeight: "100vh" } },
        React.createElement(Sider, { collapsible: true, collapsed: collapsed, onCollapse: setCollapsed, theme: "dark", width: 250 },
            React.createElement("div", { className: "flex items-center justify-center h-16 bg-blue-600" },
                React.createElement(CarOutlined, { className: "text-3xl text-white" }),
                !collapsed && React.createElement("span", { className: "ml-3 text-white font-bold text-lg" }, "EV Service")
            ),
            React.createElement(Menu, { theme: "dark", selectedKeys: [getSelectedKey()], mode: "inline", items: menuItems, onClick: handleMenuClick }),
            React.createElement("div", { className: "absolute bottom-0 w-full border-t border-gray-300" },
                React.createElement(Menu, { theme: "dark", mode: "inline", items: [{ key: "logout", icon: React.createElement(LogoutOutlined), label: "Đăng xuất", danger: true }], onClick: handleMenuClick })
            )
        ),
        React.createElement(Layout, null,
            React.createElement(Header, { className: "bg-white shadow-sm px-6 flex items-center justify-between" },
                React.createElement("div", { className: "text-xl font-semibold text-gray-300" }, "EV Service Center - Member Portal"),
                React.createElement(Dropdown, {
                    menu: { items: userMenuItems },
                    placement: "bottomRight",
                    arrow: true
                },
                    React.createElement("div", { className: "flex items-center space-x-3 cursor-pointer  px-3 py-2 rounded-lg transition-colors" },
                        avatarUrl
                            ? React.createElement(Avatar, { src: avatarUrl, size: 40 })
                            : React.createElement(Avatar, { icon: React.createElement(UserOutlined), size: 40, style: { backgroundColor: '#1890ff' } }),
                        React.createElement("span", { className: "text-gray-300 font-medium" }, `Welcome, ${userName}`)
                    )
                )
            ),
            React.createElement(Content, { className: "m-0" }, React.createElement(Outlet))
        )
    );
};

export default MemberLayout;
