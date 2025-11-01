import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Input,
  Space,
  Tag,
  Tooltip,
  message,
  Select,
  Switch,
  Modal,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { serviceService } from "../../services/serviceService";
import ServiceFormModal from "../../components/ServiceFormModal";

const { Search } = Input;
const { Option } = Select;

const ServiceList = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [modalMode, setModalMode] = useState("create");

  // Fetch services from API
  const fetchServices = async (params = {}) => {
    setLoading(true);
    try {
      const response = await serviceService.getServices({
        skip:
          ((params.current || pagination.current) - 1) *
          (params.pageSize || pagination.pageSize),
        limit: params.pageSize || pagination.pageSize,
        category: categoryFilter || undefined,
        active_only: activeFilter,
        ...params,
      });

      if (response.data && response.data.success) {
        setServices(response.data.data);
        setPagination((prev) => ({
          ...prev,
          total: response.data.data.length,
          current: params.current || prev.current,
          pageSize: params.pageSize || prev.pageSize,
        }));
      } else {
        message.error("Không thể tải danh sách dịch vụ");
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      message.error("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchServices();
  }, [categoryFilter, activeFilter]);

  // Handle table pagination change
  const handleTableChange = (pagination) => {
    fetchServices({
      current: pagination.current,
      pageSize: pagination.pageSize,
    });
  };

  // Handle search
  const handleSearch = (value) => {
    setSearchText(value);
    fetchServices({ current: 1 }); // Reset to first page when searching
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchServices();
    setSearchText("");
    setCategoryFilter("");
    setActiveFilter(true);
    message.success("Đã làm mới dữ liệu");
  };

  // Handle create service
  const handleCreateService = () => {
    setModalMode("create");
    setEditingService(null);
    setModalVisible(true);
  };

  // Handle edit service
  const handleEditService = (service) => {
    setModalMode("edit");
    setEditingService(service);
    setModalVisible(true);
  };

  // Handle delete service
  const handleDeleteService = async (service) => {
    console.log("Delete service called:", service); // Debug log

    // Check if user is authenticated
    const userLogin = JSON.parse(localStorage.getItem('INFO_USER'));
    console.log('Current user login info:', userLogin);
    
    if (!userLogin || !userLogin.access_token) {
      message.error('Bạn cần đăng nhập để thực hiện thao tác này');
      return;
    }

    // Use confirm alert instead of Modal
    const isConfirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa dịch vụ "${service.name}" (${service.code}) không?\n\nHành động này không thể hoàn tác!`
    );

    if (isConfirmed) {
      try {
        const response = await serviceService.deleteService(service.id);
        if (response.data && response.data.success) {
          message.success("Xóa dịch vụ thành công!");
          fetchServices(); // Refresh list
        } else {
          message.error("Không thể xóa dịch vụ");
        }
      } catch (error) {
        console.error("Error deleting service:", error);
        
        // Handle specific authentication errors
        if (error.response && error.response.status === 401) {
          message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } else if (error.response && error.response.data && error.response.data.detail) {
          message.error(`Lỗi: ${error.response.data.detail}`);
        } else {
          message.error("Có lỗi xảy ra khi xóa dịch vụ");
        }
      }
    }
  };

  // Handle modal success
  const handleModalSuccess = () => {
    setModalVisible(false);
    setEditingService(null);
    fetchServices(); // Refresh the list
  };

  // Handle modal cancel
  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingService(null);
  };

  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      MAINTENANCE: "blue",
      REPAIR: "orange",
      INSPECTION: "green",
      BATTERY: "red",
    };
    return colors[category] || "default";
  };

  // Get category name in Vietnamese
  const getCategoryName = (category) => {
    const names = {
      MAINTENANCE: "Bảo dưỡng",
      REPAIR: "Sửa chữa",
      INSPECTION: "Kiểm tra",
      BATTERY: "Pin",
    };
    return names[category] || category;
  };

  const columns = [
    {
      title: "Mã dịch vụ",
      dataIndex: "code",
      key: "code",
      width: 120,
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Tên dịch vụ",
      dataIndex: "name",
      key: "name",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Loại dịch vụ",
      dataIndex: "category",
      key: "category",
      render: (category) => (
        <Tag color={getCategoryColor(category)}>
          {getCategoryName(category)}
        </Tag>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Trạng thái",
      dataIndex: "is_active",
      key: "is_active",
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Hoạt động" : "Ngừng hoạt động"}
        </Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Hành động",
      key: "action",
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Sửa">
            <Button
              type="primary"
              shape="circle"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEditService(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="primary"
              danger
              shape="circle"
              icon={<DeleteOutlined />}
              size="small"
              onClick={() => handleDeleteService(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Danh sách dịch vụ</h1>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
            Làm mới
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateService}
          >
            Thêm dịch vụ mới
          </Button>
        </Space>
      </div>

      <div className="mb-4 flex gap-4 items-center">
        <Search
          placeholder="Tìm kiếm dịch vụ..."
          style={{ width: 300 }}
          onSearch={handleSearch}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />

        <Select
          placeholder="Lọc theo loại dịch vụ"
          style={{ width: 200 }}
          value={categoryFilter}
          onChange={setCategoryFilter}
          allowClear
        >
          <Option value="MAINTENANCE">Bảo dưỡng</Option>
          <Option value="REPAIR">Sửa chữa</Option>
          <Option value="INSPECTION">Kiểm tra</Option>
          <Option value="BATTERY">Pin</Option>
        </Select>

        <div className="flex items-center gap-2">
          <span>Chỉ hiển thị dịch vụ đang hoạt động:</span>
          <Switch checked={activeFilter} onChange={setActiveFilter} />
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={services}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} dịch vụ`,
        }}
        onChange={handleTableChange}
      />

      <ServiceFormModal
        visible={modalVisible}
        mode={modalMode}
        editingService={editingService}
        onCancel={handleModalCancel}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default ServiceList;
