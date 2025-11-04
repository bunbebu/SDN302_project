import React, { useState, useEffect } from 'react';
import { Table, Card, message, Input, Space, Button, Tag, Avatar } from 'antd';
import { SearchOutlined, UserOutlined, ReloadOutlined } from '@ant-design/icons';
import { adminService } from '../../services/adminService';

const { Search } = Input;

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchCustomers = async (page = 1, limit = 10, search = '') => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        role: 'CUSTOMER', // Chỉ lấy khách hàng
        ...(search && { search }),
      };
      
      const response = await adminService.getAllUsers(params);
      console.log('Fetched customers:', response.data);
      
      // Lọc chỉ những user có role là CUSTOMER
      const allUsers = response.data.data || response.data || [];
      const customerUsers = allUsers.filter(user => user.role === 'CUSTOMER');
      
      setCustomers(customerUsers);
      setPagination({
        current: page,
        pageSize: limit,
        total: customerUsers.length,
      });
    } catch (error) {
      message.error('Lỗi khi tải danh sách khách hàng');
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearch = (value) => {
    setSearchText(value);
    const filteredCustomers = customers.filter(customer =>
      `${customer.first_name} ${customer.last_name}`.toLowerCase().includes(value.toLowerCase()) ||
      customer.email?.toLowerCase().includes(value.toLowerCase()) ||
      customer.phone?.includes(value)
    );
    // Không cần gọi API lại, chỉ filter trên client
  };

  const handleTableChange = (paginationConfig) => {
    const { current, pageSize } = paginationConfig;
    setPagination(prev => ({ ...prev, current, pageSize }));
    // Không cần gọi API lại vì đã có tất cả data
  };

  const handleRefresh = () => {
    setSearchText('');
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchCustomers(1, pagination.pageSize, '');
  };

  // Filter customers based on search text
  const filteredCustomers = customers.filter(customer =>
    `${customer.first_name} ${customer.last_name}`.toLowerCase().includes(searchText.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchText.toLowerCase()) ||
    customer.phone?.includes(searchText)
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
          style={{ backgroundColor: '#52c41a' }}
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
      title: 'Ngày đăng ký',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleDateString('vi-VN'),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <UserOutlined style={{ fontSize: '20px', color: '#52c41a' }} />
            <span>Danh sách khách hàng</span>
          </div>
        }
        extra={
          <Space>
            <Search
              placeholder="Tìm kiếm theo tên, email, SĐT..."
              allowClear
              style={{ width: 300 }}
              value={searchText}
              onSearch={handleSearch}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <Button 
              icon={<ReloadOutlined />} 
              onClick={handleRefresh}
              loading={loading}
            >
              Làm mới
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredCustomers}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: filteredCustomers.length,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} khách hàng`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 'max-content' }}
        />
      </Card>
    </div>
  );
};

export default CustomerList;