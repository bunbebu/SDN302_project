import React, { useState } from 'react';
import { Form, Input, Button, Typography, Checkbox, Tabs } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import logo from '../../assets/images/logo.png';
import { userService } from '../../services/userService';
import { keysLocalStorage, localStorageUtil } from '../../utils/localStorage';
import { setInfoUserAction } from '../../stores/user/userSlice';
import './login.css';

const { Title, Text } = Typography;

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const dispatch = useDispatch();
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();

  const onFinishLogin = async (values) => {
    setLoading(true);
    try {
      const loginData = { identifier: values.email, password: values.password };
      const result = await userService.login(loginData);
      const dataToStore = result.data;
      localStorageUtil.set(keysLocalStorage.INFO_USER, dataToStore);
      dispatch(setInfoUserAction(dataToStore));
      toast.success('Đăng nhập thành công!');
      const userRole = dataToStore?.user?.role;
      setTimeout(() => {
        if (userRole === 'ADMIN') window.location.href = '/admin/dashboard';
        else if (userRole === 'STAFF') window.location.href = '/staff/dashboard';
        else if (['MEMBER', 'STUDENT', 'CUSTOMER'].includes(userRole)) window.location.href = '/member';
        else window.location.href = '/';
      }, 100);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Đã có lỗi xảy ra!';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onFinishRegister = async (values) => {
    setLoading(true);
    try {
      const registerData = {
        email: values.email,
        password: values.password,
        first_name: values.first_name,
        last_name: values.last_name,
        phone: values.phone,
        avatar_url: values.avatar_url,
      };
      const result = await userService.register(registerData);
      toast.success(result.data?.message || 'Đăng ký thành công! Vui lòng đăng nhập.');
      registerForm.resetFields();
      setActiveTab('login');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Đăng ký thất bại!';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loginTabContent = (
    <Form form={loginForm} name="login_form" initialValues={{ remember: true }} onFinish={onFinishLogin} size="large" layout="vertical">
      <Form.Item label={<span className="font-semibold">Email</span>} name="email" rules={[{ required: true, message: 'Vui lòng nhập email!' }, { type: 'email', message: 'Email không hợp lệ!' }]}>
        <Input prefix={<UserOutlined className="text-gray-400" />} placeholder="admin@example.com" />
      </Form.Item>
      <Form.Item label={<span className="font-semibold">Mật khẩu</span>} name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
        <Input.Password prefix={<LockOutlined className="text-gray-400" />} />
      </Form.Item>
      <div className="flex justify-between items-center w-full mb-6">
        <Form.Item name="remember" valuePropName="checked" noStyle>
          <Checkbox>Ghi nhớ tôi</Checkbox>
        </Form.Item>
        <a href="#" className="font-semibold text-orange-600 hover:text-orange-700">Quên mật khẩu?</a>
      </div>
      <Form.Item>
        <Button type="primary" htmlType="submit" className="w-full h-12 font-bold text-lg btn-orange" loading={loading}>
          {loading ? 'ĐANG ĐĂNG NHẬP' : 'ĐĂNG NHẬP'}
        </Button>
      </Form.Item>
    </Form>
  );

  const registerTabContent = (
    <Form form={registerForm} name="register_form" onFinish={onFinishRegister} size="large" layout="vertical">
      <div className="grid grid-cols-2 gap-4">
        <Form.Item label={<span className="font-semibold">Họ</span>} name="first_name" rules={[{ required: true, message: 'Vui lòng nhập họ!' }, { max: 50, message: 'Họ không được quá 50 ký tự!' }]}>
          <Input prefix={<UserOutlined className="text-gray-400" />} placeholder="Nguyễn" />
        </Form.Item>
        <Form.Item label={<span className="font-semibold">Tên</span>} name="last_name" rules={[{ required: true, message: 'Vui lòng nhập tên!' }, { max: 50, message: 'Tên không được quá 50 ký tự!' }]}>
          <Input prefix={<UserOutlined className="text-gray-400" />} placeholder="Văn A" />
        </Form.Item>
      </div>
      <Form.Item label={<span className="font-semibold">Email</span>} name="email" rules={[{ required: true, message: 'Vui lòng nhập email!' }, { type: 'email', message: 'Email không hợp lệ!' }]}>
        <Input prefix={<MailOutlined className="text-gray-400" />} placeholder="example@gmail.com" />
      </Form.Item>
      <Form.Item label={<span className="font-semibold">Số điện thoại</span>} name="phone" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }, { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' }]}>
        <Input prefix={<PhoneOutlined className="text-gray-400" />} placeholder="0912345678" />
      </Form.Item>
      <Form.Item label={<span className="font-semibold">Ảnh đại diện (URL)</span>} name="avatar_url" rules={[{ type: 'url', message: 'URL không hợp lệ!' }]}>
        <Input prefix={<UserOutlined className="text-gray-400" />} placeholder="https://example.com/avatar.jpg" />
      </Form.Item>
      <Form.Item label={<span className="font-semibold">Mật khẩu</span>} name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }, { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }]}>
        <Input.Password prefix={<LockOutlined className="text-gray-400" />} />
      </Form.Item>
      <Form.Item label={<span className="font-semibold">Xác nhận mật khẩu</span>} name="confirm_password" dependencies={["password"]} rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu!' }, ({ getFieldValue }) => ({ validator(_, value) { if (!value || getFieldValue('password') === value) return Promise.resolve(); return Promise.reject(new Error('Mật khẩu không khớp!')); } })]}>
        <Input.Password prefix={<LockOutlined className="text-gray-400" />} />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" className="w-full h-12 font-bold text-lg btn-orange" loading={loading}>
          {loading ? 'ĐANG ĐĂNG KÝ' : 'ĐĂNG KÝ'}
        </Button>
      </Form.Item>
    </Form>
  );

  const tabItems = [
    { key: 'login', label: 'Đăng nhập', children: loginTabContent },
    { key: 'register', label: 'Đăng ký', children: registerTabContent },
  ];

  return (
    <div className="login-orange min-h-screen flex items-center justify-center" style={{ background: '#fff7ed' }}>
      <div className="w-full max-w-5xl mx-4 grid md:grid-cols-2 rounded-2xl overflow-hidden shadow-2xl bg-white">
        {/* Left brand panel (orange) */}
        <div className="hidden md:flex flex-col justify-between p-10 text-white" style={{ background: 'linear-gradient(135deg,#ff7a00 0%,#ffa94d 100%)' }}>
          <div>
            <img src={logo} alt="Logo" style={{ width: 64, height: 64 }} />
          </div>
          <div>
            <Title level={2} style={{ color: '#fff', marginBottom: 8 }}>Chào mừng bạn trở lại</Title>
            <Text style={{ color: 'rgba(255,255,255,0.9)' }}>Quản lý dịch vụ và lịch hẹn xe một cách nhanh chóng.</Text>
          </div>
          <div style={{ opacity: 0.85, fontSize: 12 }}>© {new Date().getFullYear()} EV Service</div>
        </div>

        {/* Right form area */}
        <div className="p-8 md:p-12">
          <div className="mb-8">
            <Title level={3} style={{ marginBottom: 4, color: '#0f172a' }}>Đăng nhập / Đăng ký</Title>
            <Text type="secondary">Sử dụng tài khoản của bạn để tiếp tục</Text>
          </div>
          <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} centered className="login-tabs" />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

