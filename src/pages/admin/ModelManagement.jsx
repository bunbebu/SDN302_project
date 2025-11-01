import React, { useState, useEffect } from "react";
import {
  Table,
  Input,
  Space,
  Card,
  Flex,
  Typography,
  Modal,
  App, // (Cần App)
  Tag,
  Button,
  Avatar,
  Descriptions,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  CarOutlined, // Icon cho Mẫu xe
} from "@ant-design/icons";
import { adminService } from "../../services/adminService"; // Sửa đường dẫn nếu cần
import { toast } from "react-toastify";

const { Search } = Input;
const { Title, Text } = Typography;

// Hàm tạo map (object) từ mảng để tra cứu nhanh
const createDataMap = (data, keyField, valueField) => {
  const map = {};
  data.forEach((item) => {
    map[item[keyField]] = item[valueField];
  });
  return map;
};

// Hàm định dạng ngày
const formatDateTime = (isoString) => {
  if (!isoString) return "N/A";
  return new Date(isoString).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Hàm định dạng trạng thái
const formatStatus = (status) => {
  if (status === "ACTIVE") {
    return <Tag color="green">ACTIVE</Tag>;
  }
  return <Tag color="volcano">INACTIVE</Tag>;
};

const ModelManagement = () => {
  // State cho dữ liệu
  const [allModels, setAllModels] = useState([]); // Dữ liệu gốc
  const [filteredModels, setFilteredModels] = useState([]); // Dữ liệu hiển thị
  const [loading, setLoading] = useState(false);

  // (MỚI) State cho map Thương hiệu
  const [brandsMap, setBrandsMap] = useState({});

  // State cho Modal "Xem"
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingModel, setViewingModel] = useState(null);

  // --- Fetch Dữ Liệu ---
  const fetchModels = async () => {
    setLoading(true);
    try {
      // Gọi 1 lần để lấy tất cả (tối đa 1000)
      const params = {
        skip: 0,
        limit: 1000,
        active_only: false,
      };

      const res = await adminService.getAllModels(params);

      if (res.data.success) {
        setAllModels(res.data.data); // Set dữ liệu gốc
        setFilteredModels(res.data.data); // Set dữ liệu hiển thị
      } else {
        toast.error("Không thể tải danh sách mẫu xe.");
      }
    } catch (error) {
      console.log(error)
      toast.error("Lỗi khi tải mẫu xe.");
    } finally {
      setLoading(false);
    }
  };

  // (MỚI) Fetch dữ liệu phụ (Thương hiệu)
  const fetchSupportData = async () => {
    try {
      const brandsRes = await adminService.getAllBrands({ limit: 1000 });
      if (brandsRes.data.success) {
        setBrandsMap(createDataMap(brandsRes.data.data, "id", "name"));
      }
    } catch (error) {
      console.log(error)
      toast.warn("Không thể tải danh sách thương hiệu.");
    }
  };

  // useEffect để gọi API
  useEffect(() => {
    fetchModels();
    fetchSupportData();
  }, []);

  // --- Xử lý Search (Client-side) ---
  const handleSearchChange = (e) => {
    const value = e.target.value.toLowerCase();

    const filtered = allModels.filter(
      (model) =>
        (model.name || "").toLowerCase().includes(value) ||
        // Tìm theo tên thương hiệu
        (brandsMap[model.brand_id] || "").toLowerCase().includes(value) ||
        // Tìm theo năm
        (model.year?.toString() || "").toLowerCase().includes(value)
    );

    setFilteredModels(filtered);
  };

  // --- Xử lý Modal "Xem" ---
  const handleViewClick = (record) => {
    setViewingModel(record);
    setIsViewModalOpen(true);
  };
  const handleViewCancel = () => {
    setIsViewModalOpen(false);
    setViewingModel(null);
  };

  // --- Cấu hình Cột ---
  const columns = [
    {
      title: "Tên Mẫu xe",
      dataIndex: "name",
      key: "name",
      render: (name, record) => (
        <Space>
          {/* Giả định model có image_url, nếu không dùng icon */}
          <Avatar src={record.image_url} icon={<CarOutlined />} alt={name} />
          <strong>{name}</strong>
        </Space>
      ),
    },
    {
      title: "Thương hiệu",
      dataIndex: "brand_id",
      key: "brand_id",
      render: (brandId) => brandsMap[brandId] || "N/A",
    },
    {
      title: "Năm",
      dataIndex: "year",
      key: "year",
    },
    {
      title: "Trạng thái",
      dataIndex: "is_active",
      key: "is_active",
      render: (isActive) => formatStatus(isActive ? "ACTIVE" : "INACTIVE"),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EyeOutlined style={{ color: "#1890ff" }} />}
            style={{ padding: 0 }}
            onClick={() => handleViewClick(record)}
          >
            Xem
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card bordered={false} style={{ borderRadius: "8px" }}>
        <Flex
          justify="space-between"
          align="center"
          style={{ marginBottom: 24 }}
        >
          <Title level={3} style={{ margin: 0 }}>
            Quản lý Mẫu xe
          </Title>
        </Flex>

        <div style={{ marginBottom: 24 }}>
          <Search
            placeholder="Tìm theo tên mẫu, thương hiệu, năm..."
            prefix={<SearchOutlined />}
            style={{ width: 400 }}
            allowClear
            onChange={handleSearchChange} // Dùng onChange
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredModels} // Dùng 'filteredModels'
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* --- Modal Xem Chi Tiết --- */}
      {viewingModel && (
        <Modal
          title={`Chi tiết Mẫu xe: ${viewingModel.name}`}
          open={isViewModalOpen}
          onCancel={handleViewCancel}
          destroyOnClose
          footer={[
            <Button key="close" onClick={handleViewCancel}>
              Đóng
            </Button>,
          ]}
          width={700}
        >
          <Flex justify="center" style={{ marginBottom: 24 }}>
            <Avatar
              src={viewingModel.image_url}
              icon={<CarOutlined />}
              alt={viewingModel.name}
              size={128}
            />
          </Flex>
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Tên Mẫu xe">
              {viewingModel.name}
            </Descriptions.Item>
            <Descriptions.Item label="Thương hiệu">
              {brandsMap[viewingModel.brand_id] || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Năm">
              {viewingModel.year}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {formatStatus(viewingModel.is_active ? "ACTIVE" : "INACTIVE")}
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả">
              {viewingModel.description || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {formatDateTime(viewingModel.created_at)}
            </Descriptions.Item>
          </Descriptions>
        </Modal>
      )}
    </>
  );
};

// Bọc component bằng <App>
const ModelManagementPage = () => (
  <App>
    <ModelManagement />
  </App>
);

export default ModelManagementPage;
