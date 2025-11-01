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
  List,
  Descriptions,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  // (Đã xóa EditOutlined)
} from "@ant-design/icons";
import { adminService } from "../../services/adminService";
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

// Hàm định dạng trạng thái
const formatStatus = (status) => {
  switch (status) {
    case "PENDING":
      return <Tag color="warning">Chờ xử lý</Tag>;
    case "IN_PROGRESS":
      return <Tag color="processing">Đang tiến hành</Tag>;
    case "COMPLETED":
      return <Tag color="success">Hoàn thành</Tag>;
    case "CANCELLED":
      return <Tag color="error">Đã hủy</Tag>;
    default:
      return <Tag>{status}</Tag>;
  }
};

// Hàm định dạng ngày
const formatDateTime = (isoString) => {
  if (!isoString) return "N/A";
  return new Date(isoString).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const AdminServiceRecordManagement = () => {
  // State cho dữ liệu
  const [allRecords, setAllRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  // State cho dữ liệu phụ (để map ID sang tên)
  const [vehiclesMap, setVehiclesMap] = useState({});

  // State cho Modal "Xem"
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingRecord, setViewingRecord] = useState(null);

  // (ĐÃ XÓA) State cho Modal "Cập nhật Trạng thái"

  // --- Fetch Dữ Liệu ---
  const fetchServiceRecords = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllServiceRecords();
      if (res.data && res.data.success) {
        setAllRecords(res.data.data);
        setFilteredRecords(res.data.data);
      } else {
        toast.error("Không thể tải danh sách hồ sơ.");
      }
    } catch (error) {
      console.log(error)
      toast.error("Lỗi khi tải hồ sơ dịch vụ.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch dữ liệu phụ
  const fetchSupportData = async () => {
    try {
      const vehiclesRes = await adminService.getAllVehicles();
      if (vehiclesRes.data.success) {
        setVehiclesMap(
          createDataMap(vehiclesRes.data.data, "id", "license_plate")
        );
      }
    } catch (error) {
      console.log(error)
      toast.warn("Lỗi khi tải dữ liệu xe.");
    }
  };

  useEffect(() => {
    fetchServiceRecords();
    fetchSupportData();
  }, []);

  // --- Xử lý Tìm kiếm ---
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    const filtered = allRecords.filter((record) => {
      const vehiclePlate = (vehiclesMap[record.vehicle_id] || "").toLowerCase();
      return (
        (record.id.toString() || "").toLowerCase().includes(value) ||
        (record.appointment_id.toString() || "")
          .toLowerCase()
          .includes(value) ||
        (record.technician_name || "").toLowerCase().includes(value) ||
        (record.service_center?.name || "").toLowerCase().includes(value) ||
        (record.status || "").toLowerCase().includes(value) ||
        vehiclePlate.includes(value)
      );
    });
    setFilteredRecords(filtered);
  };

  // --- Xử lý Modal "Xem" ---
  const handleViewClick = (record) => {
    // Vì không có user_id, chúng ta không thể gọi API
    // chỉ hiển thị dữ liệu record hiện có
    setViewingRecord(record);
    setIsViewModalOpen(true);
  };
  const handleViewCancel = () => {
    setIsViewModalOpen(false);
    setViewingRecord(null);
  };

  // (ĐÃ XÓA) Các hàm xử lý "Cập nhật Trạng thái"

  // --- (CẬP NHẬT) Cấu hình Cột ---
  const columns = [
    {
      title: "Mã Hẹn",
      dataIndex: "appointment_id",
      key: "appointment_id",
      render: (id) => <strong>{id}</strong>,
    },
    {
      title: "Biển số xe",
      dataIndex: "vehicle_id",
      key: "vehicle_id",
      render: (vehicleId) => vehiclesMap[vehicleId] || `ID: ${vehicleId}`,
    },
    {
      title: "Kỹ thuật viên",
      dataIndex: "technician_name",
      key: "technician_name",
    },
    {
      title: "Trung tâm",
      dataIndex: "service_center",
      key: "service_center",
      render: (center) => center?.name || "N/A",
      ellipsis: true,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => formatStatus(status),
    },
    {
      title: "Ngày dịch vụ",
      dataIndex: "service_date",
      key: "service_date",
      render: (date) => formatDateTime(date),
    },
    {
      title: "Hành động",
      key: "action",
      // (CẬP NHẬT) Chỉ còn nút "Xem"
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
            Quản lý Hồ sơ Dịch vụ
          </Title>
        </Flex>

        <div style={{ marginBottom: 24 }}>
          <Search
            placeholder="Tìm theo mã hẹn, biển số, kỹ thuật viên..."
            prefix={<SearchOutlined />}
            style={{ width: 400 }}
            allowClear
            onChange={handleSearch}
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredRecords}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* --- Modal Xem Chi Tiết --- */}
      {viewingRecord && (
        <Modal
          title={`Chi tiết Hồ sơ (Mã Hẹn: ${viewingRecord.appointment_id})`}
          open={isViewModalOpen}
          onCancel={handleViewCancel}
          destroyOnClose
          footer={[
            <Button key="close" onClick={handleViewCancel}>
              Đóng
            </Button>,
          ]}
          width={800}
        >
          <Descriptions bordered column={2}>
            {/* (CẬP NHẬT) Xóa Khách hàng vì không có dữ liệu */}
            <Descriptions.Item label="Trạng thái">
              {formatStatus(viewingRecord.status)}
            </Descriptions.Item>
            <Descriptions.Item label="Tổng chi phí">
              <Text strong style={{ color: "#1890ff" }}>
                {`${parseFloat(viewingRecord.total_cost || 0).toLocaleString(
                  "vi-VN"
                )} VND`}
              </Text>
            </Descriptions.Item>

            <Descriptions.Item label="Biển số xe">
              {vehiclesMap[viewingRecord.vehicle_id] || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày dịch vụ">
              {formatDateTime(viewingRecord.service_date)}
            </Descriptions.Item>

            <Descriptions.Item label="Kỹ thuật viên">
              {viewingRecord.technician_name}
            </Descriptions.Item>
            <Descriptions.Item label="Trung tâm dịch vụ">
              {viewingRecord.service_center?.name}
            </Descriptions.Item>

            <Descriptions.Item label="Ghi chú" span={2}>
              {viewingRecord.notes || "Không có ghi chú."}
            </Descriptions.Item>
            <Descriptions.Item label="Lý do hủy" span={2}>
              {viewingRecord.cancel_reason || "N/A"}
            </Descriptions.Item>
          </Descriptions>

          <Title level={5} style={{ marginTop: 24 }}>
            Phụ tùng đã sử dụng
          </Title>
          <List
            bordered
            dataSource={viewingRecord.used_parts}
            locale={{ emptyText: "Không sử dụng phụ tùng nào" }}
            renderItem={(part) => (
              <List.Item>
                <List.Item.Meta
                  title={part.part_name || `ID: ${part.part_id}`}
                  description={`Số lượng: ${part.quantity_used || 0}`}
                />
              </List.Item>
            )}
          />
        </Modal>
      )}

      {/* (ĐÃ XÓA) Modal Cập nhật Trạng thái */}
    </>
  );
};

// Bọc component bằng <App> để hook modal hoạt động
const AdminServiceRecordPage = () => (
  <App>
    <AdminServiceRecordManagement />
  </App>
);

export default AdminServiceRecordPage;
