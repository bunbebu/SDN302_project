import React, { useState } from 'react';
import { Form, Input, Button, Typography, Checkbox, Tabs } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import background from '../../assets/images/background.png';
import logo from '../../assets/images/logo.png';
import { userService } from '../../services/userService';
import { keysLocalStorage, localStorageUtil } from '../../utils/localStorage';
import { setInfoUserAction } from '../../stores/user/userSlice';

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const { Title, Text, Link } = Typography;
  const dispatch = useDispatch();
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();

  const onFinishLogin = async (values) => {
    setLoading(true);
    try {
      const loginData = {
        identifier: values.email,
        password: values.password,
      };

      const result = await userService.login(loginData);
      const dataToStore = result.data;

      localStorageUtil.set(keysLocalStorage.INFO_USER, dataToStore);
      dispatch(setInfoUserAction(dataToStore));
      toast.success('Đăng nhập thành công!');

      const userRole = dataToStore?.user?.role;

      setTimeout(() => {
        if (userRole === 'ADMIN') {
          window.location.href = '/admin/dashboard';
        } else if (userRole === 'STAFF') {
          window.location.href = '/staff/dashboard';
        } else if (userRole === 'MEMBER' || userRole === 'STUDENT' || userRole === 'CUSTOMER') {
          window.location.href = '/member';
        } else {
          window.location.href = '/';
        }
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
    React.createElement(Form, {
      form: loginForm,
      name: 'login_form',
      initialValues: { remember: true },
      onFinish: onFinishLogin,
      size: 'large',
      layout: 'vertical'
    },
      React.createElement(Form.Item, {
        label: React.createElement('span', { className: 'font-semibold' }, 'Email'),
        name: 'email',
        rules: [
          { required: true, message: 'Vui lòng nhập email!' },
          { type: 'email', message: 'Email không hợp lệ!' }
        ]
      },
        React.createElement(Input, {
          prefix: React.createElement(UserOutlined, { className: 'text-gray-400' }),
          placeholder: 'admin@example.com'
        })
      ),
      React.createElement(Form.Item, {
        label: React.createElement('span', { className: 'font-semibold' }, 'Mật khẩu'),
        name: 'password',
        rules: [{ required: true, message: 'Vui lòng nhập mật khẩu!' }]
      },
        React.createElement(Input.Password, {
          prefix: React.createElement(LockOutlined, { className: 'text-gray-400' }),
          placeholder: ''
        })
      ),
      React.createElement('div', { className: 'flex justify-between items-center w-full mb-6' },
        React.createElement(Form.Item, { name: 'remember', valuePropName: 'checked', noStyle: true },
          React.createElement(Checkbox, null, 'Ghi nhớ tôi')
        ),
        React.createElement(Link, { href: '#', className: 'font-semibold text-brand-teal hover:text-brand-teal-dark' }, 'Quên mật khẩu?')
      ),
      React.createElement(Form.Item, null,
        React.createElement(Button, {
          type: 'primary',
          htmlType: 'submit',
          className: 'w-full h-12 font-bold text-lg bg-gradient-to-r from-brand-teal to-brand-teal-light hover:from-brand-teal-dark hover:to-brand-teal transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-brand-teal/40',
          loading: loading
        }, loading ? 'ĐANG ĐĂNG NHẬP' : 'ĐĂNG NHẬP')
      )
    )
  );

  const registerTabContent = (
    React.createElement(Form, {
      form: registerForm,
      name: 'register_form',
      onFinish: onFinishRegister,
      size: 'large',
      layout: 'vertical'
    },
      React.createElement('div', { className: 'grid grid-cols-2 gap-4' },
        React.createElement(Form.Item, {
          label: React.createElement('span', { className: 'font-semibold' }, 'Họ'),
          name: 'first_name',
          rules: [
            { required: true, message: 'Vui lòng nhập họ!' },
            { max: 50, message: 'Họ không được quá 50 ký tự!' }
          ]
        },
          React.createElement(Input, {
            prefix: React.createElement(UserOutlined, { className: 'text-gray-400' }),
            placeholder: 'Nguyễn'
          })
        ),
        React.createElement(Form.Item, {
          label: React.createElement('span', { className: 'font-semibold' }, 'Tên'),
          name: 'last_name',
          rules: [
            { required: true, message: 'Vui lòng nhập tên!' },
            { max: 50, message: 'Tên không được quá 50 ký tự!' }
          ]
        },
          React.createElement(Input, {
            prefix: React.createElement(UserOutlined, { className: 'text-gray-400' }),
            placeholder: 'Văn A'
          })
        )
      ),
      React.createElement(Form.Item, {
        label: React.createElement('span', { className: 'font-semibold' }, 'Email'),
        name: 'email',
        rules: [
          { required: true, message: 'Vui lòng nhập email!' },
          { type: 'email', message: 'Email không hợp lệ!' }
        ]
      },
        React.createElement(Input, {
          prefix: React.createElement(MailOutlined, { className: 'text-gray-400' }),
          placeholder: 'example@gmail.com'
        })
      ),
      React.createElement(Form.Item, {
        label: React.createElement('span', { className: 'font-semibold' }, 'Số điện thoại'),
        name: 'phone',
        rules: [
          { required: true, message: 'Vui lòng nhập số điện thoại!' },
          { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' }
        ]
      },
        React.createElement(Input, {
          prefix: React.createElement(PhoneOutlined, { className: 'text-gray-400' }),
          placeholder: '0912345678'
        })
      ),
      React.createElement(Form.Item, {
        label: React.createElement('span', { className: 'font-semibold' }, 'Ảnh đại diện (URL)'),
        name: 'avatar_url',
        rules: [
          { type: 'url', message: 'URL không hợp lệ!' }
        ]
      },
        React.createElement(Input, {
          prefix: React.createElement(UserOutlined, { className: 'text-gray-400' }),
          placeholder: 'https://example.com/avatar.jpg'
        })
      ),
      React.createElement(Form.Item, {
        label: React.createElement('span', { className: 'font-semibold' }, 'Mật khẩu'),
        name: 'password',
        rules: [
          { required: true, message: 'Vui lòng nhập mật khẩu!' },
          { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
        ]
      },
        React.createElement(Input.Password, {
          prefix: React.createElement(LockOutlined, { className: 'text-gray-400' }),
          placeholder: ''
        })
      ),
      React.createElement(Form.Item, {
        label: React.createElement('span', { className: 'font-semibold' }, 'Xác nhận mật khẩu'),
        name: 'confirm_password',
        dependencies: ['password'],
        rules: [
          { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('Mật khẩu không khớp!'));
            }
          })
        ]
      },
        React.createElement(Input.Password, {
          prefix: React.createElement(LockOutlined, { className: 'text-gray-400' }),
          placeholder: ''
        })
      ),
      React.createElement(Form.Item, null,
        React.createElement(Button, {
          type: 'primary',
          htmlType: 'submit',
          className: 'w-full h-12 font-bold text-lg bg-gradient-to-r from-brand-teal to-brand-teal-light hover:from-brand-teal-dark hover:to-brand-teal transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-brand-teal/40',
          loading: loading
        }, loading ? 'ĐANG ĐĂNG KÝ' : 'ĐĂNG KÝ')
      )
    )
  );

  const tabItems = [
    {
      key: 'login',
      label: 'Đăng nhập',
      children: loginTabContent
    },
    {
      key: 'register',
      label: 'Đăng ký',
      children: registerTabContent
    }
  ];

  return React.createElement('div', { className: 'flex items-center justify-center min-h-screen bg-slate-200' },
    React.createElement('div', { className: 'relative flex flex-col w-full max-w-4xl m-6 bg-white shadow-2xl rounded-2xl md:flex-row' },
      React.createElement('div', { className: 'flex flex-col justify-center w-full p-8 md:w-1/2 md:p-12' },
        React.createElement('div', { className: 'flex flex-col items-center text-center mb-8' },
          React.createElement('div', { className: 'p-2 bg-teal-100 rounded-full mb-4' },
            React.createElement('img', { src: logo, alt: 'EV-Care Logo', className: 'w-20 h-20' })
          ),
          React.createElement(Title, { level: 2, className: '!mb-1 font-bold text-brand-teal' }, 'EV-Care'),
          React.createElement(Text, { className: 'text-gray-500' }, 'Hệ thống Quản lý Chuyên nghiệp')
        ),
        React.createElement(Tabs, {
          activeKey: activeTab,
          onChange: setActiveTab,
          items: tabItems,
          centered: true,
          className: 'login-tabs'
        })
      ),
      React.createElement('div', { className: 'relative hidden w-1/2 md:block' },
        React.createElement('img', { src: background, alt: 'Electric vehicle charging', className: 'w-full h-full rounded-r-2xl object-cover' }),
        React.createElement('div', { className: 'absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-r-2xl' })
      )
    )
  );
};

export default LoginPage;
