import React, { useState, useEffect } from 'react';
import { Table, Card, message, Input, Space, Button, Tag, Avatar } from 'antd';
import { UserOutlined, ReloadOutlined } from '@ant-design/icons';
import { userService } from '../../services/userService';

const { Search } = Input;

const TechnicianList = () => {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  const fetchTechnicians = async () => {
    setLoading(true);
    try {
      const response = await userService.getTechnicians();
      console.log('Fetched technicians:', response.data);
      setTechnicians(response.data.data || []);
    } catch (error) {
      message.error('Lỗi khi tải danh sách kỹ thuật viên');
      console.error('Error fetching technicians:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const filteredTechnicians = technicians.filter(technician =>
    `${technician.first_name} ${technician.last_name}`.toLowerCase().includes(searchText.toLowerCase()) ||
    technician.email?.toLowerCase().includes(searchText.toLowerCase()) ||
    technician.phone?.includes(searchText) ||
    technician.position?.toLowerCase().includes(searchText.toLowerCase()) ||
    technician.specialization?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'Avatar',
      dataIndex: 'avatar_url',
      key: 'avatar_url',
      width: 80,
      render: (avatar_url, record) => (
        <Avatar 
          size={40} 
          src={avatar_url} 
          icon={<UserOutlined />}
          style={{ backgroundColor: '#1890ff' }}
        >
          {record.first_name?.charAt(0)?.toUpperCase()}
        </Avatar>
      ),
    },
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (_, record) => `${record.first_name} ${record.last_name}`,
      sorter: (a, b) => `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Chức vụ',
      dataIndex: 'position',
      key: 'position',
    },
    {
      title: 'Chuyên môn',
      dataIndex: 'specialization',
      key: 'specialization',
    },
    {
      title: 'Kinh nghiệm',
      dataIndex: 'year_of_experience',
      key: 'year_of_experience',
      render: (years) => `${years} năm`,
      sorter: (a, b) => a.year_of_experience - b.year_of_experience,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (is_active) => (
        <Tag color={is_active ? 'green' : 'red'}>
          {is_active ? 'Hoạt động' : 'Không hoạt động'}
        </Tag>
      ),
      filters: [
        { text: 'Hoạt động', value: true },
        { text: 'Không hoạt động', value: false },
      ],
      onFilter: (value, record) => record.is_active === value,
    },
    {
      title: 'Xác thực',
      dataIndex: 'is_verified',
      key: 'is_verified',
      render: (is_verified) => (
        <Tag color={is_verified ? 'blue' : 'orange'}>
          {is_verified ? 'Đã xác thực' : 'Chưa xác thực'}
        </Tag>
      ),
      filters: [
        { text: 'Đã xác thực', value: true },
        { text: 'Chưa xác thực', value: false },
      ],
      onFilter: (value, record) => record.is_verified === value,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleDateString('vi-VN'),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
  ];

  return (
    <div>
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <UserOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
            <span>Danh sách kỹ thuật viên</span>
          </div>
        }
        extra={
          <Space>
            <Search
              placeholder="Tìm kiếm theo tên, email, SĐT, chức vụ, chuyên môn..."
              allowClear
              style={{ width: 350 }}
              onSearch={handleSearch}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchTechnicians}
              loading={loading}
            >
              Làm mới
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredTechnicians}
          rowKey="id"
          loading={loading}
          pagination={{
            total: filteredTechnicians.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} kỹ thuật viên`,
          }}
          scroll={{ x: 'max-content' }}
        />
      </Card>
    </div>
  );
};

export default TechnicianList;