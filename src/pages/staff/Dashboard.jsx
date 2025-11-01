import React, { useState, useEffect } from 'react';
import { Card, Statistic, Row, Col, message, Spin } from 'antd';
import { 
  ToolOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  ClockCircleOutlined 
} from '@ant-design/icons';
import { serviceService } from '../../services/serviceService';

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [serviceStats, setServiceStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    categories: {}
  });

  const fetchServiceStats = async () => {
    setLoading(true);
    try {
      // Fetch all services
      const response = await serviceService.getServices({
        limit: 1000 // Get all services for statistics
      });

      if (response.data && response.data.success) {
        const services = response.data.data;
        
        const stats = {
          total: services.length,
          active: services.filter(s => s.is_active).length,
          inactive: services.filter(s => !s.is_active).length,
          categories: {}
        };

        // Calculate category statistics
        services.forEach(service => {
          const category = service.category;
          if (!stats.categories[category]) {
            stats.categories[category] = {
              total: 0,
              active: 0
            };
          }
          stats.categories[category].total++;
          if (service.is_active) {
            stats.categories[category].active++;
          }
        });

        setServiceStats(stats);
      } else {
        message.error('Không thể tải thống kê dịch vụ');
      }
    } catch (error) {
      console.error('Error fetching service stats:', error);
      message.error('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceStats();
  }, []);

  const getCategoryName = (category) => {
    const names = {
      'MAINTENANCE': 'Bảo dưỡng',
      'REPAIR': 'Sửa chữa',
      'INSPECTION': 'Kiểm tra',
      'BATTERY': 'Pin',
    };
    return names[category] || category;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Tổng quan quản lý dịch vụ</h1>
      
      {/* Main Statistics */}
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng số dịch vụ"
              value={serviceStats.total}
              prefix={<ToolOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Dịch vụ đang hoạt động"
              value={serviceStats.active}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Dịch vụ ngừng hoạt động"
              value={serviceStats.inactive}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#fa541c' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Loại dịch vụ"
              value={Object.keys(serviceStats.categories).length}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Category Statistics */}
      <Card title="Thống kê theo loại dịch vụ" className="mb-6">
        <Row gutter={16}>
          {Object.entries(serviceStats.categories).map(([category, stats]) => (
            <Col span={6} key={category} className="mb-4">
              <Card size="small">
                <Statistic
                  title={getCategoryName(category)}
                  value={stats.active}
                  suffix={`/ ${stats.total}`}
                  valueStyle={{ color: '#1890ff' }}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {stats.active} hoạt động / {stats.total} tổng
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Recent Activity */}
      <Card title="Hướng dẫn sử dụng">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <ToolOutlined className="text-blue-500" />
            <span>Sử dụng <strong>Danh sách dịch vụ</strong> để xem và quản lý các dịch vụ</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircleOutlined className="text-green-500" />
            <span>Sử dụng <strong>Loại dịch vụ</strong> để xem thống kê theo danh mục</span>
          </div>
          <div className="flex items-center gap-3">
            <ExclamationCircleOutlined className="text-orange-500" />
            <span>Bạn có thể lọc dịch vụ theo trạng thái và danh mục</span>
          </div>
          <div className="flex items-center gap-3">
            <ClockCircleOutlined className="text-purple-500" />
            <span>Sử dụng chức năng tìm kiếm để nhanh chóng tìm dịch vụ cần thiết</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;