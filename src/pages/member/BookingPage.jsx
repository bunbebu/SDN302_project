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
} from "antd";
import {
    CalendarOutlined,
    EyeOutlined,
    CloseCircleOutlined,
    CheckCircleOutlined,
} from "@ant-design/icons";
import { appointmentService } from "../../services/appointmentService";
import { adminService } from "../../services/adminService";

const BookingPage = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [serviceCenters, setServiceCenters] = useState([]);

    useEffect(() => {
        loadAppointments();
        loadServiceCenters();
    }, []);

    const loadServiceCenters = async () => {
        try {
            const response = await adminService.getAllServiceCenters({ skip: 0, limit: 1000 });
            const centers = response.data?.data || [];
            setServiceCenters(centers);
        } catch (error) {
            console.error("Không thể tải danh sách chi nhánh:", error);
        }
    };

    const loadAppointments = async () => {
        setLoading(true);
        try {
            const response = await appointmentService.getMyAppointments();
            console.log("Appointments response:", response);
            console.log("Appointments response.data:", response.data);

            // Axios trả về response.data, không phải response trực tiếp
            let appointmentList = [];

            if (response.data) {
                if (Array.isArray(response.data)) {
                    appointmentList = response.data;
                } else if (Array.isArray(response.data.data)) {
                    appointmentList = response.data.data;
                } else if (Array.isArray(response.data.items)) {
                    appointmentList = response.data.items;
                }
            }

            console.log("Final appointment list:", appointmentList);
            setAppointments(appointmentList);
        } catch (error) {
            message.error("Không thể tải danh sách lịch hẹn");
            console.error("Load appointments error:", error);
            setAppointments([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const statusColors = {
            PENDING: "orange",
            CONFIRMED: "blue",
            IN_PROGRESS: "cyan",
            COMPLETED: "green",
            CANCELLED: "red",
        };
        return statusColors[status] || "default";
    };

    const getServiceCenterName = (serviceCenterId) => {
        const center = serviceCenters.find(c => c.id === serviceCenterId);
        return center ? center.name : 'N/A';
    };

    const getStatusText = (status) => {
        const statusText = {
            PENDING: "Chờ xác nhận",
            CONFIRMED: "Đã xác nhận",
            IN_PROGRESS: "Đang thực hiện",
            COMPLETED: "Hoàn thành",
            CANCELLED: "Đã hủy",
        };
        return statusText[status] || status;
    };

    const getPriorityColor = (priority) => {
        const priorityColors = {
            NORMAL: "default",
            URGENT: "red",
            HIGH: "orange",
        };
        return priorityColors[priority] || "default";
    };

    const getPriorityText = (priority) => {
        const priorityText = {
            NORMAL: "Bình thường",
            URGENT: "Khẩn cấp",
            HIGH: "Cao",
        };
        return priorityText[priority] || priority;
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

    const handleViewDetail = (appointment) => {
        setSelectedAppointment(appointment);
        setDetailModalVisible(true);
    };

    const handleCancelAppointment = async (appointmentId) => {
        console.log("handleCancelAppointment called with ID:", appointmentId);

        // Test trực tiếp không dùng confirm
        if (!window.confirm("Bạn có chắc chắn muốn hủy lịch hẹn này?")) {
            console.log("User cancelled");
            return;
        }

        console.log("User confirmed cancel");

        try {
            console.log("Calling API to cancel appointment:", appointmentId);
            const response = await appointmentService.cancelAppointment(appointmentId, "Khách hàng hủy");
            console.log("Cancel response:", response);
            message.success("Đã hủy lịch hẹn thành công");
            setDetailModalVisible(false);
            setSelectedAppointment(null);
            loadAppointments();
        } catch (error) {
            console.error("Cancel error:", error);
            console.error("Cancel error response:", error.response);
            message.error(error.response?.data?.detail || error.response?.data?.message || "Không thể hủy lịch hẹn");
        }
    };

    const columns = [
        {
            title: "Mã đặt lịch",
            dataIndex: "booking_code",
            key: "booking_code",
            width: 45,
            render: (text) => <code className="text-blue-600 font-semibold">{text}</code>,
        },
        {
            title: "Ngày hẹn",
            dataIndex: "scheduled_date",
            key: "scheduled_date",
            width: 40,
            render: (date) => formatDate(date),
            sorter: (a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 30,
            render: (status) => (
                <Tag color={getStatusColor(status)} className="font-medium">
                    {getStatusText(status)}
                </Tag>
            ),
            filters: [
                { text: "Chờ xác nhận", value: "PENDING" },
                { text: "Đã xác nhận", value: "CONFIRMED" },
                { text: "Đang thực hiện", value: "IN_PROGRESS" },
                { text: "Hoàn thành", value: "COMPLETED" },
                { text: "Đã hủy", value: "CANCELLED" },
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: "Độ ưu tiên",
            dataIndex: "priority",
            key: "priority",
            width: 30,
            render: (priority) => (
                <Tag color={getPriorityColor(priority)}>
                    {getPriorityText(priority)}
                </Tag>
            ),
        },
        {
            title: "Dịch vụ",
            dataIndex: "appointment_services",
            key: "services",
            width: 30,
            render: (services) => (
                <span className="text-gray-600">
                    {services?.length || 0} dịch vụ
                </span>
            ),
        },
        {
            title: "Ghi chú",
            dataIndex: "notes",
            key: "notes",
            width: 50,
            ellipsis: true,
            render: (notes) => notes || <span className="text-gray-400">Không có</span>,
        },
        {
            title: "Thao tác",
            key: "action",
            width: 30,
            fixed: "right",
            align: "center",
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewDetail(record)}
                        title="Xem chi tiết"
                    />
                </Space>
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
                                <CalendarOutlined className="mr-3" />
                                Lịch hẹn của tôi
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Quản lý các lịch hẹn bảo dưỡng xe
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">
                                {appointments.length}
                            </div>
                            <div className="text-gray-500 text-sm">Tổng lịch hẹn</div>
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
                ) : appointments.length === 0 ? (
                    <Card>
                        <Empty
                            description="Bạn chưa có lịch hẹn nào"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                    </Card>
                ) : (
                    <Card>
                        <Table
                            columns={columns}
                            dataSource={appointments}
                            rowKey="id"
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showTotal: (total) => `Tổng ${total} lịch hẹn`,
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
                        <CalendarOutlined className="mr-2 text-blue-500" />
                        <span>Chi tiết lịch hẹn</span>
                    </div>
                }
                open={detailModalVisible}
                onCancel={() => {
                    setDetailModalVisible(false);
                    setSelectedAppointment(null);
                }}
                footer={
                    selectedAppointment ? [
                        <Button key="close" onClick={() => setDetailModalVisible(false)}>
                            Đóng
                        </Button>,
                        selectedAppointment.status === "PENDING" ? (
                            <Button
                                key="cancel"
                                danger
                                icon={<CloseCircleOutlined />}
                                onClick={() => {
                                    console.log("Cancel button clicked, ID:", selectedAppointment.id);
                                    handleCancelAppointment(selectedAppointment.id);
                                }}
                            >
                                Hủy lịch hẹn
                            </Button>
                        ) : null,
                    ] : [
                        <Button key="close" onClick={() => setDetailModalVisible(false)}>
                            Đóng
                        </Button>
                    ]
                }
                width={800}
            >
                {selectedAppointment && (
                    <div className="space-y-6">
                        <Descriptions bordered column={2}>
                            <Descriptions.Item label="Mã đặt lịch" span={2}>
                                <code className="bg-blue-50 px-3 py-1 rounded text-blue-600 font-semibold">
                                    {selectedAppointment.booking_code}
                                </code>
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái" span={1}>
                                <Tag color={getStatusColor(selectedAppointment.status)} className="text-sm">
                                    {getStatusText(selectedAppointment.status)}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Độ ưu tiên" span={1}>
                                <Tag color={getPriorityColor(selectedAppointment.priority)}>
                                    {getPriorityText(selectedAppointment.priority)}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Chi nhánh" span={2}>
                                <div className="font-medium text-gray-800">
                                    {getServiceCenterName(selectedAppointment.service_center_id)}
                                </div>
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày hẹn" span={2}>
                                {formatDate(selectedAppointment.scheduled_date)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày tạo" span={1}>
                                {formatDate(selectedAppointment.created_at)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Cập nhật" span={1}>
                                {formatDate(selectedAppointment.updated_at)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ghi chú" span={2}>
                                {selectedAppointment.notes || <span className="text-gray-400">Không có ghi chú</span>}
                            </Descriptions.Item>
                        </Descriptions>

                        {/* Services List */}
                        {selectedAppointment.appointment_services &&
                            selectedAppointment.appointment_services.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                                        <CheckCircleOutlined className="mr-2 text-green-500" />
                                        Dịch vụ đã đặt
                                    </h3>
                                    <div className="space-y-2">
                                        {selectedAppointment.appointment_services.map((service, index) => (
                                            <Card key={service.id} size="small" className="bg-gray-50">
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <span className="font-medium">Dịch vụ #{index + 1}</span>
                                                        <div className="text-sm text-gray-500 mt-1">
                                                            ID: {service.service_id}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-lg font-bold text-blue-600">
                                                            {formatPrice(service.estimated_price)} đ
                                                        </div>
                                                        <div className="text-xs text-gray-500">Giá ước tính</div>
                                                    </div>
                                                </div>
                                                {service.notes && (
                                                    <div className="mt-2 text-sm text-gray-600">
                                                        Ghi chú: {service.notes}
                                                    </div>
                                                )}
                                            </Card>
                                        ))}
                                        <div className="bg-blue-50 p-3 rounded-lg mt-3">
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold text-gray-700">Tổng chi phí ước tính:</span>
                                                <span className="text-xl font-bold text-blue-600">
                                                    {formatPrice(
                                                        selectedAppointment.appointment_services.reduce(
                                                            (sum, s) => sum + parseFloat(s.estimated_price || 0),
                                                            0
                                                        )
                                                    )}{" "}
                                                    đ
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default BookingPage;
