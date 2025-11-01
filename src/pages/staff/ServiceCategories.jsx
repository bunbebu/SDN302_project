import React, { useState, useEffect } from "react";
import { Table, Button, Input, Space, Tooltip, message, Card, Statistic } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from "@ant-design/icons";
import { serviceService } from "../../services/serviceService";

const { Search } = Input;

const ServiceCategories = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryStats, setCategoryStats] = useState({});
  const [searchText, setSearchText] = useState('');

  // Fetch services and calculate category statistics
  const fetchServicesAndStats = async () => {
    setLoading(true);
    try {
      const response = await serviceService.getServices({
        active_only: true
      });

      if (response.data && response.data.success) {
        const servicesData = response.data.data;
        setServices(servicesData);

        // Calculate category statistics
        const stats = servicesData.reduce((acc, service) => {
          const category = service.category;
          if (!acc[category]) {
            acc[category] = {
              count: 0,
              services: []
            };
          }
          acc[category].count++;
          acc[category].services.push(service);
          return acc;
        }, {});

        setCategoryStats(stats);
      } else {
        message.error('Không thể tải danh sách dịch vụ');
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      message.error('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServicesAndStats();
  }, []);

  // Handle refresh
  const handleRefresh = () => {
    fetchServicesAndStats();
    setSearchText('');
    message.success('Đã làm mới dữ liệu');
  };

  // Get category name in Vietnamese
  const getCategoryName = (category) => {
    const names = {
      'MAINTENANCE': 'Bảo dưỡng định kỳ',
      'REPAIR': 'Sửa chữa',
      'INSPECTION': 'Kiểm tra & Chẩn đoán',
      'BATTERY': 'Dịch vụ Pin',
    };
    return names[category] || category;
  };

  // Get category description
  const getCategoryDescription = (category) => {
    const descriptions = {
      'MAINTENANCE': 'Các dịch vụ kiểm tra và bảo dưỡng theo khuyến nghị của nhà sản xuất',
      'REPAIR': 'Các dịch vụ sửa chữa và thay thế linh kiện hư hỏng',
      'INSPECTION': 'Các dịch vụ kiểm tra, chẩn đoán lỗi hệ thống',
      'BATTERY': 'Các dịch vụ liên quan đến hệ thống pin cao áp',
    };
    return descriptions[category] || 'Mô tả loại dịch vụ';
  };

  // Convert category stats to table data
  const categoryData = Object.keys(categoryStats).map((category, index) => ({
    key: index + 1,
    category: category,
    name: getCategoryName(category),
    serviceCount: categoryStats[category].count,
    description: getCategoryDescription(category),
    services: categoryStats[category].services,
  }));

  // Filter data based on search
  const filteredData = categoryData.filter(item =>
    item.name.toLowerCase().includes(searchText.toLowerCase()) ||
    item.description.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "Tên loại dịch vụ",
      dataIndex: "name",
      key: "name",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Số lượng dịch vụ",
      dataIndex: "serviceCount",
      key: "serviceCount",
      align: "center",
      render: (count) => (
        <Statistic 
          value={count} 
          valueStyle={{ fontSize: '16px' }}
        />
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Hành động",
      key: "action",
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button shape="circle" icon={<EditOutlined />} />
          </Tooltip>
          <Tooltip title="Quản lý dịch vụ">
            <Button type="primary" shape="circle" icon={<DeleteOutlined />} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const totalServices = Object.values(categoryStats).reduce((sum, stat) => sum + stat.count, 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý loại dịch vụ</h1>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
            Làm mới
          </Button>
          <Button type="primary" icon={<PlusOutlined />}>
            Thêm loại dịch vụ
          </Button>
        </Space>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <Statistic
            title="Tổng số loại dịch vụ"
            value={Object.keys(categoryStats).length}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
        <Card>
          <Statistic
            title="Tổng số dịch vụ"
            value={totalServices}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
        <Card>
          <Statistic
            title="Dịch vụ bảo dưỡng"
            value={categoryStats['MAINTENANCE']?.count || 0}
            valueStyle={{ color: '#722ed1' }}
          />
        </Card>
        <Card>
          <Statistic
            title="Dịch vụ sửa chữa"
            value={categoryStats['REPAIR']?.count || 0}
            valueStyle={{ color: '#fa8c16' }}
          />
        </Card>
      </div>

      <div className="mb-4">
        <Search 
          placeholder="Tìm kiếm loại dịch vụ..." 
          style={{ width: 300 }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <Table 
        columns={columns} 
        dataSource={filteredData}
        loading={loading}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} loại dịch vụ`,
        }}
      />
    </div>
  );
};

export default ServiceCategories;
