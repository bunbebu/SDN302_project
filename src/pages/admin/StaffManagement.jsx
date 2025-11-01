import React from 'react';
import { Table, Button, Input, Space, Tag, Avatar, Modal, Form } from 'antd';
import { PlusOutlined, UserOutlined } from '@ant-design/icons';

const { Search } = Input;

// Dữ liệu giả cho nhân viên
const staffData = [
  {
    key: '1',
    name: 'Hoàng Minh Tuấn',
    email: 'tuan.hoang@evcare.com',
    position: 'Quản lý',
    status: 'active',
    joinDate: '2023-01-15',
    avatar: 'https://i.pravatar.cc/150?img=5',
  },
  {
    key: '2',
    name: 'Lê Thu Hà',
    email: 'ha.le@evcare.com',
    position: 'Kỹ thuật viên trưởng',
    status: 'active',
    joinDate: '2023-05-20',
    avatar: 'https://i.pravatar.cc/150?img=6',
  },
  {
    key: '3',
    name: 'Phan Văn Đức',
    email: 'duc.phan@evcare.com',
    position: 'Cố vấn dịch vụ',
    status: 'inactive',
    joinDate: '2024-02-10',
    avatar: 'https://i.pravatar.cc/150?img=7',
  },
];

const columns = [
  {
    title: 'Tên nhân viên',
    dataIndex: 'name',
    key: 'name',
    render: (text, record) => (
      <Space>
        <Avatar src={record.avatar} icon={<UserOutlined />} />
        <span>{text}</span>
      </Space>
    ),
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: 'Chức vụ',
    dataIndex: 'position',
    key: 'position',
    render: (position) => <Tag color="cyan">{position}</Tag>,
  },
  {
    title: 'Ngày tham gia',
    dataIndex: 'joinDate',
    key: 'joinDate',
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    key: 'status',
    render: (status) => (
      <Tag color={status === 'active' ? 'green' : 'volcano'}>
        {status === 'active' ? 'ĐANG LÀM VIỆC' : 'ĐÃ NGHỈ'}
      </Tag>
    ),
  },
  {
    title: 'Hành động',
    key: 'action',
    render: () => (
      <Space size="middle">
        <a>Sửa</a>
        <a>Xem chi tiết</a>
      </Space>
    ),
  },
];

const StaffManagement = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý nhân viên</h1>
        <Button type="primary" icon={<PlusOutlined />}>
          Thêm nhân viên
        </Button>
      </div>
      <div className="mb-4">
        <Search
          placeholder="Tìm kiếm nhân viên..."
          style={{ width: 300 }}
        />
      </div>
      <Table columns={columns} dataSource={staffData} />
    </div>
  );
};

export default StaffManagement;
