import React, { useState, useEffect } from "react";
import {
    Table,
    Tag,
    Button,
    Space,
    message,
    Modal,
    Descriptions,
    Card,
    Spin,
    Empty,
    Avatar,
} from "antd";
import {
    HistoryOutlined,
    EyeOutlined,
    UserOutlined,
    EnvironmentOutlined,
    DollarOutlined,
} from "@ant-design/icons";
import { serviceRecordService } from "../../services/serviceRecordService";

const HistoryPage = () => {
    const [serviceRecords, setServiceRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);

    useEffect(() => {
        loadServiceRecords();
    }, []);

    const loadServiceRecords = async () => {
        setLoading(true);
        try {
            const response = await serviceRecordService.getMyServiceRecords();
            console.log("Service records response:", response);

            let recordList = [];
            if (response.data) {
                if (Array.isArray(response.data)) {
                    recordList = response.data;
                } else if (Array.isArray(response.data.data)) {
                    recordList = response.data.data;
                }
            }

            setServiceRecords(recordList);
        } catch (error) {
            message.error("Không thể tải lịch sử bảo dưỡng");
            console.error("Load service records error:", error);
            setServiceRecords([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const statusColors = {
            IN_PROGRESS: "processing",
            COMPLETED: "success",
            CANCELLED: "error",
        };
        return statusColors[status] || "default";
    };

    const getStatusText = (status) => {
        const statusText = {
            IN_PROGRESS: "Đang thực hiện",
            COMPLETED: "Hoàn thành",
            CANCELLED: "Đã hủy",
        };
        return statusText[status] || status;
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleString("vi-VN");
    };

    const formatPrice = (price) => {
        if (!price) return "0";
        return parseFloat(price).toLocaleString("vi-VN");
    };

    const handleViewDetail = (record) => {
        setSelectedRecord(record);
        setDetailModalVisible(true);
    };

    const columns = [
        {
            title: "Ngày bảo dưỡng",
            dataIndex: "service_date",
            key: "service_date",
            width: 180,
            render: (date) => formatDate(date),
            sorter: (a, b) => new Date(b.service_date) - new Date(a.service_date),
        },
        {
            title: "Chi nhánh",
            dataIndex: "service_center",
            key: "service_center",
            width: 200,
            render: (center) => (
                <div>
                    <div className="font-medium">{center?.name || "N/A"}</div>
                    <div className="text-xs text-gray-500">{center?.code || ""}</div>
                </div>
            ),
        },
        {
            title: "Kỹ thuật viên",
            dataIndex: "technician_name",
            key: "technician_name",
            width: 180,
            render: (name, record) => (
                <div className="flex items-center gap-2">
                    <Avatar
                        src={record.technician_avatar_url}
                        icon={<UserOutlined />}
                        size={32}
                    />
                    <span>{name || "N/A"}</span>
                </div>
            ),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 140,
            render: (status) => (
                <Tag color={getStatusColor(status)} className="font-medium">
                    {getStatusText(status)}
                </Tag>
            ),
            filters: [
                { text: "Đang thực hiện", value: "IN_PROGRESS" },
                { text: "Hoàn thành", value: "COMPLETED" },
                { text: "Đã hủy", value: "CANCELLED" },
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: "Tổng chi phí",
            dataIndex: "total_cost",
            key: "total_cost",
            width: 140,
            align: "right",
            render: (cost) => (
                <span className="font-semibold text-blue-600">
                    {formatPrice(cost)} đ
                </span>
            ),
            sorter: (a, b) => parseFloat(a.total_cost) - parseFloat(b.total_cost),
        },
        {
            title: "Linh kiện",
            dataIndex: "used_parts",
            key: "used_parts",
            width: 100,
            align: "center",
            render: (parts) => (
                <span className="text-gray-600">
                    {parts?.length || 0} phụ tùng
                </span>
            ),
        },
        {
            title: "Thao tác",
            key: "action",
            width: 100,
            fixed: "right",
            align: "center",
            render: (_, record) => (
                <Button
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={() => handleViewDetail(record)}
                    title="Xem chi tiết"
                />
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                                <HistoryOutlined className="mr-3" />
                                Lịch sử bảo dưỡng
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Xem lại các lần bảo dưỡng xe của bạn
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">
                                {serviceRecords.length}
                            </div>
                            <div className="text-gray-500 text-sm">Lần bảo dưỡng</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Spin size="large" />
                    </div>
                ) : serviceRecords.length === 0 ? (
                    <Card>
                        <Empty
                            description="Chưa có lịch sử bảo dưỡng"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                    </Card>
                ) : (
                    <Card>
                        <Table
                            columns={columns}
                            dataSource={serviceRecords}
                            rowKey="id"
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showTotal: (total) => `Tổng ${total} bản ghi`,
                            }}
                            scroll={{ x: 1200 }}
                            bordered={false}
                        />
                    </Card>
                )}
            </div>

            {/* Detail Modal */}
            <Modal
                title={
                    <div className="flex items-center">
                        <HistoryOutlined className="mr-2 text-blue-500" />
                        <span>Chi tiết bảo dưỡng</span>
                    </div>
                }
                open={detailModalVisible}
                onCancel={() => {
                    setDetailModalVisible(false);
                    setSelectedRecord(null);
                }}
                footer={[
                    <Button key="close" onClick={() => setDetailModalVisible(false)}>
                        Đóng
                    </Button>
                ]}
                width={900}
            >
                {selectedRecord && (
                    <div className="space-y-6">
                        {/* Thông tin cơ bản */}
                        <Descriptions bordered column={2}>
                            <Descriptions.Item label="Ngày bảo dưỡng" span={2}>
                                {formatDate(selectedRecord.service_date)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái" span={1}>
                                <Tag color={getStatusColor(selectedRecord.status)}>
                                    {getStatusText(selectedRecord.status)}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Tổng chi phí" span={1}>
                                <span className="text-xl font-bold text-blue-600">
                                    {formatPrice(selectedRecord.total_cost)} đ
                                </span>
                            </Descriptions.Item>
                        </Descriptions>

                        {/* Chi nhánh */}
                        {selectedRecord.service_center && (
                            <Card size="small" title={<><EnvironmentOutlined className="mr-2" />Chi nhánh dịch vụ</>}>
                                <Descriptions column={1} size="small">
                                    <Descriptions.Item label="Tên">
                                        {selectedRecord.service_center.name}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Mã">
                                        {selectedRecord.service_center.code}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Địa chỉ">
                                        {selectedRecord.service_center.address}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Điện thoại">
                                        {selectedRecord.service_center.phone}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Đánh giá">
                                        <Tag color="gold">⭐ {selectedRecord.service_center.rating}</Tag>
                                    </Descriptions.Item>
                                </Descriptions>
                            </Card>
                        )}

                        {/* Kỹ thuật viên */}
                        <Card size="small" title={<><UserOutlined className="mr-2" />Kỹ thuật viên</>}>
                            <div className="flex items-center gap-4">
                                <Avatar
                                    src={selectedRecord.technician_avatar_url}
                                    icon={<UserOutlined />}
                                    size={64}
                                />
                                <div>
                                    <div className="text-lg font-semibold">{selectedRecord.technician_name}</div>
                                    <div className="text-gray-500">ID: {selectedRecord.technician_id}</div>
                                </div>
                            </div>
                        </Card>

                        {/* Phụ tùng đã sử dụng */}
                        {selectedRecord.used_parts && selectedRecord.used_parts.length > 0 && (
                            <Card size="small" title={<><DollarOutlined className="mr-2" />Phụ tùng đã sử dụng</>}>
                                <div className="space-y-2">
                                    {selectedRecord.used_parts.map((part) => (
                                        <div key={part.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                            <div>
                                                <div className="font-medium">{part.part_name}</div>
                                                <div className="text-sm text-gray-500">
                                                    Số lượng: {part.quantity} | ID: {part.part_id}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-blue-600">
                                                    {formatPrice(part.total_price)} đ
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {formatPrice(parseFloat(part.total_price) / part.quantity)} đ/cái
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {/* Ghi chú */}
                        <Descriptions bordered column={1}>
                            <Descriptions.Item label="Ghi chú">
                                {selectedRecord.notes || <span className="text-gray-400">Không có ghi chú</span>}
                            </Descriptions.Item>
                            {selectedRecord.cancel_reason && (
                                <Descriptions.Item label="Lý do hủy">
                                    <span className="text-red-600">{selectedRecord.cancel_reason}</span>
                                </Descriptions.Item>
                            )}
                            <Descriptions.Item label="Ngày tạo">
                                {formatDate(selectedRecord.created_at)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Cập nhật lần cuối">
                                {formatDate(selectedRecord.updated_at)}
                            </Descriptions.Item>
                        </Descriptions>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default HistoryPage;
