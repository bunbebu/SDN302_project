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
  CarOutlined, // Icon cho thương hiệu
} from "@ant-design/icons";
import { adminService } from "../../services/adminService"; // Sửa đường dẫn nếu cần
import { toast } from "react-toastify";

const { Search } = Input;
const { Title, Text } = Typography;

// Hàm định dạng ngày
const formatDateTime = (isoString) => {
  if (!isoString) return "N/A";
  return new Date(isoString).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// (FIX 1) Thêm lại hàm formatStatus đã bị thiếu
const formatStatus = (status) => {
  if (status === "ACTIVE") {
    return <Tag color="green">ACTIVE</Tag>;
  }
  return <Tag color="volcano">INACTIVE</Tag>;
};

const BrandManagement = () => {
  // (FIX 2) Cập nhật state cho client-side search
  const [allBrands, setAllBrands] = useState([]); // Dữ liệu gốc
  const [filteredBrands, setFilteredBrands] = useState([]); // Dữ liệu hiển thị
  const [loading, setLoading] = useState(false);

  // State cho Modal "Xem"
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingBrand, setViewingBrand] = useState(null);

  // --- (CẬP NHẬT) Fetch Dữ Liệu ---
  const fetchBrands = async () => {
    setLoading(true);
    try {
      // Gọi 1 lần để lấy tất cả (tối đa 1000)
      const params = {
        skip: 0,
        limit: 1000,
        active_only: false,
      };

      const res = await adminService.getAllBrands(params);

      if (res.data.success) {
        setAllBrands(res.data.data); // Set dữ liệu gốc
        setFilteredBrands(res.data.data); // Set dữ liệu hiển thị
      } else {
        toast.error("Không thể tải danh sách thương hiệu.");
      }
    } catch (error) {
      console.log(error)
      toast.error("Lỗi khi tải thương hiệu.");
    } finally {
      setLoading(false);
    }
  };

  // (CẬP NHẬT) useEffect chỉ chạy 1 lần
  useEffect(() => {
    fetchBrands();
  }, []); // Bỏ dependency

  // --- (CẬP NHẬT) Xử lý Search (Client-side) ---
  const handleSearchChange = (e) => {
    const value = e.target.value.toLowerCase();

    // Lọc từ 'allBrands'
    const filtered = allBrands.filter(
      (brand) =>
        (brand.name || "").toLowerCase().includes(value) ||
        (brand.description || "").toLowerCase().includes(value)
    );

    // Cập nhật 'filteredBrands' để Table render lại
    setFilteredBrands(filtered);
  };

  // --- Xử lý Modal "Xem" ---
  // Chức năng "Xem" này đã đơn giản, không gọi API,
  // giống như cách bạn muốn.
  const handleViewClick = (record) => {
    setViewingBrand(record);
    setIsViewModalOpen(true);
  };
  const handleViewCancel = () => {
    setIsViewModalOpen(false);
    setViewingBrand(null);
  };

  // --- Cấu hình Cột ---
  const columns = [
    {
      title: "Thương hiệu",
      dataIndex: "name",
      key: "name",
      render: (name, record) => (
        <Space>
          <Avatar src={record.logo_url} icon={<CarOutlined />} alt={name} />
          <strong>{name}</strong>
        </Space>
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
            Quản lý Thương hiệu xe
          </Title>
        </Flex>

        {/* (CẬP NHẬT) Search Component */}
        <div style={{ marginBottom: 24 }}>
          <Search
            placeholder="Tìm theo tên thương hiệu, mô tả..."
            prefix={<SearchOutlined />}
            style={{ width: 400 }}
            allowClear
            onChange={handleSearchChange} // Dùng onChange
            // Bỏ 'onSearch' và 'enterButton'
          />
        </div>

        {/* (CẬP NHẬT) Table Component */}
        <Table
          columns={columns}
          dataSource={filteredBrands} // Dùng 'filteredBrands'
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }} // Pagination client-side đơn giản
          // Bỏ 'onChange' và 'pagination={pagination}'
        />
      </Card>

      {/* --- Modal Xem Chi Tiết --- */}
      {viewingBrand && (
        <Modal
          title={`Chi tiết Thương hiệu: ${viewingBrand.name}`}
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
              src={viewingBrand.logo_url}
              icon={<CarOutlined />}
              alt={viewingBrand.name}
              size={128}
            />
          </Flex>
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Tên Thương hiệu">
              {viewingBrand.name}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {/* Dòng này đã được sửa lỗi */}
              {formatStatus(viewingBrand.is_active ? "ACTIVE" : "INACTIVE")}
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả">
              {viewingBrand.description || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {formatDateTime(viewingBrand.created_at)}
            </Descriptions.Item>
          </Descriptions>
        </Modal>
      )}
    </>
  );
};

// Bọc component bằng <App>
const BrandManagementPage = () => (
  <App>
    <BrandManagement />
  </App>
);

export default BrandManagementPage;
