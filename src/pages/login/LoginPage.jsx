// src/pages/LoginPage.jsx

import React, { useState } from "react";
import { Form, Input, Button, Typography, Checkbox } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import background from "../../assets/images/background.png";

// Import các thành phần cần thiết
import logo from "../../assets/images/logo.png"; // Đảm bảo đường dẫn này đúng
import { userService } from "../../services/userService"; // Import service API

import { keysLocalStorage, localStorageUtil } from "../../utils/localStorage";
import { setInfoUserAction } from "../../stores/user/userSlice";

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const { Title, Text, Link } = Typography;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Chuẩn bị dữ liệu gửi đi đúng format API yêu cầu
      const loginData = {
        identifier: values.email, // Form dùng `email`, API dùng `identifier`
        password: values.password,
      };

      const result = await userService.login(loginData);
      const dataToStore = result.data; // Dữ liệu trả về từ API

      // 1. Lưu thông tin vào localStorage
      localStorageUtil.set(keysLocalStorage.INFO_USER, dataToStore);

      // 2. Gửi thông tin user lên Redux store
      dispatch(setInfoUserAction(dataToStore));

      // 3. Hiển thị thông báo thành công

      // 4. Chuyển hướng đến trang dashboard sau 1.5 giây
      navigate("/admin/dashboard"); // Thay đổi đường dẫn đến trang quản trị của bạn
      toast.success("Đăng nhập thành công!");
    } catch (error) {
      // Hiển thị lỗi từ server
      const errorMessage = error.response?.data?.message || "Đã có lỗi xảy ra!";
      toast.error(`${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Nền được làm dịu hơn với màu slate */}
      <div className="flex items-center justify-center min-h-screen bg-slate-200">
        <div className="relative flex flex-col w-full max-w-4xl m-6 bg-white shadow-2xl rounded-2xl md:flex-row">
          {/* Cột bên trái - Form đăng nhập */}
          <div className="flex flex-col justify-center w-full p-8 md:w-1/2 md:p-12">
            {/* Khu vực logo được thiết kế lại, đặt ở trung tâm */}
            <div className="flex flex-col items-center text-center mb-8">
              <div className="p-2 bg-teal-100 rounded-full mb-4">
                <img src={logo} alt="EV-Care Logo" className="w-20 h-20" />
              </div>
              <Title level={2} className="!mb-1 font-bold text-brand-teal">
                EV-Care
              </Title>
              <Text className="text-gray-500">
                Hệ thống Quản lý Chuyên nghiệp
              </Text>
            </div>

            <Form
              name="login_form"
              initialValues={{ remember: true }}
              onFinish={onFinish}
              size="large"
              layout="vertical"
            >
              <Form.Item
                label={<span className="font-semibold">Email</span>}
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập email!" },
                  { type: "email", message: "Email không hợp lệ!" },
                ]}
              >
                <Input
                  prefix={
                    <UserOutlined className="site-form-item-icon text-gray-400" />
                  }
                  placeholder="admin@example.com"
                />
              </Form.Item>

              <Form.Item
                label={<span className="font-semibold">Mật khẩu</span>}
                name="password"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
              >
                <Input.Password
                  prefix={
                    <LockOutlined className="site-form-item-icon text-gray-400" />
                  }
                  placeholder="••••••••"
                />
              </Form.Item>

              <div className="flex justify-between items-center w-full mb-6">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>Ghi nhớ tôi</Checkbox>
                </Form.Item>
                <Link
                  href="#"
                  className="font-semibold text-brand-teal hover:text-brand-teal-dark"
                >
                  Quên mật khẩu?
                </Link>
              </div>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="w-full h-12 font-bold text-lg bg-gradient-to-r from-brand-teal to-brand-teal-light hover:from-brand-teal-dark hover:to-brand-teal transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-brand-teal/40"
                  loading={loading}
                >
                  {loading ? "ĐANG ĐĂNG NHẬP" : "ĐĂNG NHẬP"}
                </Button>
              </Form.Item>
            </Form>
          </div>

          {/* Cột bên phải - Hình ảnh */}
          <div className="relative hidden w-1/2 md:block">
            <img
              src={background}
              alt="Electric vehicle charging"
              className="w-full h-full rounded-r-2xl object-cover"
            />
            {/* Thêm gradient overlay thay vì màu đen đơn thuần */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-r-2xl"></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
