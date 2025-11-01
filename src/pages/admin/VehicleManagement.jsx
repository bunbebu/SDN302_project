import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Input,
  Space,
  App,
  Card,
  Flex,
  Typography,
  Modal,
  Image,
} from "antd";
import { SearchOutlined, CarOutlined, EyeOutlined } from "@ant-design/icons";
// Sửa lại đường dẫn import (đi lên 2 cấp)
import { adminService } from "../../services/adminService.js";
import { toast } from "react-toastify";

const { Search } = Input;
const { Title, Text } = Typography;

const VehicleManagement = () => {
  const [vehicles, setVehicles] = useState([]); // Danh sách gốc
  const [filteredVehicles, setFilteredVehicles] = useState([]); // Danh sách lọc
  const [loading, setLoading] = useState(false);
  const [usersMap, setUsersMap] = useState({});
  const [modelsMap, setModelsMap] = useState({});

  // --- State cho Modal Xem Chi Tiết ---
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingVehicle, setViewingVehicle] = useState(null);

  // --- Các hàm Helper ---
  const createDataMap = (data, keyField, valueField) => {
    const map = {};
    data.forEach((item) => {
      map[item[keyField]] = item[valueField];
    });
    return map;
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return "N/A";
    try {
      return new Date(isoString).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      console.log(e)
      return "Ngày không hợp lệ";
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return "N/A";
    try {
      return new Date(isoString).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (e) {
      console.log(e)
      return "Ngày không hợp lệ";
    }
  };

  const DetailItem = ({ title, content }) => (
    <div style={{ marginBottom: 12 }}>
      <Text style={{ color: "rgba(0, 0, 0, 0.45)", display: "block" }}>
        {title}
      </Text>
      <Text strong>{content || "N/A"}</Text>
    </div>
  );

  // --- Logic chính ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const [vehiclesRes, usersRes, modelsRes] = await Promise.all([
        adminService.getAllVehicles(),
        adminService.getAllUsers(),
        adminService.getAllModels(),
      ]);

      if (vehiclesRes.data.success) {
        setVehicles(vehiclesRes.data.data);
        setFilteredVehicles(vehiclesRes.data.data); // Gán vào danh sách lọc
      } else {
        toast.error("Không thể tải danh sách phương tiện!");
      }

      if (usersRes.data.success) {
        const userFullNameMap = {};
        usersRes.data.data.forEach((user) => {
          userFullNameMap[user.id] = `${user.last_name} ${user.first_name}`;
        });
        setUsersMap(userFullNameMap);
      } else {
        toast.warn("Không thể tải danh sách người dùng.");
      }

      if (modelsRes.data.success) {
        setModelsMap(createDataMap(modelsRes.data.data, "id", "name"));
      } else {
        toast.warn("Không thể tải danh sách model xe.");
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu trang:", error);
      toast.error("Đã xảy ra lỗi, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Xử lý Tìm kiếm (Client-side) ---
  const handleSearch = (value) => {
    if (!value) {
      setFilteredVehicles(vehicles); // Reset
      return;
    }
    const lowerCaseValue = value.toLowerCase();
    const filtered = vehicles.filter((vehicle) => {
      const ownerName = (usersMap[vehicle.user_id] || "").toLowerCase();
      const modelName = (modelsMap[vehicle.model_id] || "").toLowerCase();

      return (
        (vehicle.license_plate &&
          vehicle.license_plate.toLowerCase().includes(lowerCaseValue)) ||
        (vehicle.vin && vehicle.vin.toLowerCase().includes(lowerCaseValue)) ||
        ownerName.includes(lowerCaseValue) ||
        modelName.includes(lowerCaseValue)
      );
    });
    setFilteredVehicles(filtered);
  };

  // --- Các hàm xử lý Modal Xem Chi Tiết ---
  const handleViewClick = (record) => {
    setViewingVehicle(record);
    setIsViewModalOpen(true);
  };

  const handleViewCancel = () => {
    setIsViewModalOpen(false);
    setViewingVehicle(null);
  };

  // Cấu hình cột
  const columns = [
    {
      title: "Biển số xe",
      dataIndex: "license_plate",
      key: "license_plate",
      render: (text) => (
        <Space>
          <CarOutlined />
          <strong>{text || "N/A"}</strong>
        </Space>
      ),
    },
    {
      title: "Số VIN",
      dataIndex: "vin",
      key: "vin",
    },
    {
      title: "Dòng xe (Model)",
      dataIndex: "model_id",
      key: "model_id",
      render: (modelId) => modelsMap[modelId] || `ID: ${modelId}`,
    },
    {
      title: "Chủ sở hữu",
      dataIndex: "user_id",
      key: "user_id",
      render: (userId) => usersMap[userId] || `ID: ${userId}`,
    },
    {
      title: "Số Km hiện tại",
      dataIndex: "current_mileage",
      key: "current_mileage",
      render: (mileage) => `${mileage ? mileage.toLocaleString() : 0} km`,
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
    <Card bordered={false} style={{ borderRadius: "8px" }}>
      <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          Quản lý phương tiện
        </Title>
        {/* Nút "Thêm phương tiện" đã bị xóa */}
      </Flex>

      <div style={{ marginBottom: 24 }}>
        <Search
          placeholder="Tìm kiếm theo biển số, VIN, chủ sở hữu, model..."
          enterButton={<SearchOutlined />}
          style={{ width: 400 }}
          onSearch={handleSearch}
          onChange={(e) => handleSearch(e.target.value)}
          allowClear
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredVehicles} // Dùng danh sách đã lọc
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      {/* --- Modal Xem Chi Tiết Phương Tiện --- */}
      {viewingVehicle && (
        <Modal
          title={`Chi tiết phương tiện: ${viewingVehicle.license_plate || ""}`}
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
          <Flex gap={24}>
            {/* Cột trái */}
            <Flex vertical style={{ flex: 1 }}>
              <DetailItem title="Vehicle ID" content={viewingVehicle.id} />
              <DetailItem
                title="Biển số xe"
                content={viewingVehicle.license_plate}
              />
              <DetailItem title="Số VIN" content={viewingVehicle.vin} />
              <DetailItem
                title="Chủ sở hữu"
                content={
                  usersMap[viewingVehicle.user_id] ||
                  `ID: ${viewingVehicle.user_id}`
                }
              />
              <div style={{ marginTop: 8 }}>
                <Text
                  style={{ color: "rgba(0, 0, 0, 0.45)", display: "block" }}
                >
                  Hình ảnh
                </Text>
                {viewingVehicle.images ? (
                  <Image
                    width={200}
                    src={viewingVehicle.images}
                    alt="Vehicle"
                    style={{
                      marginTop: 4,
                      borderRadius: 8,
                      border: "1px solid #f0f0f0",
                    }}
                    fallback="https://placehold.co/200x150/f0f0f0/AAAAAA?text=No+Image"
                  />
                ) : (
                  <Text strong>Không có hình ảnh</Text>
                )}
              </div>
            </Flex>

            {/* Cột phải */}
            <Flex vertical style={{ flex: 1 }}>
              <DetailItem
                title="Dòng xe (Model)"
                content={
                  modelsMap[viewingVehicle.model_id] ||
                  `ID: ${viewingVehicle.model_id}`
                }
              />
              <DetailItem
                title="Số Km hiện tại"
                content={`${
                  viewingVehicle.current_mileage
                    ? viewingVehicle.current_mileage.toLocaleString()
                    : 0
                } km`}
              />
              <DetailItem
                title="Ngày hết hạn bảo hành"
                content={formatDate(viewingVehicle.warranty_end_date)}
              />
              <DetailItem
                title="Ngày tạo"
                content={formatDateTime(viewingVehicle.created_at)}
              />
              <DetailItem
                title="Cập nhật lần cuối"
                content={formatDateTime(viewingVehicle.updated_at)}
              />
            </Flex>
          </Flex>
        </Modal>
      )}
    </Card>
  );
};

export default VehicleManagement;
