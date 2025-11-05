import React, { useState, useEffect } from "react";
import { Modal, Card, List, Spin, message, Button } from "antd";
import {
    EnvironmentOutlined,
    PhoneOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
} from "@ant-design/icons";
import { serviceCenterService } from "../../services/serviceCenterService";

const ServiceCenterModal = ({ visible, onClose, onSelectCenter, vehicle }) => {
    const [centers, setCenters] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedCenter, setSelectedCenter] = useState(null);

    useEffect(() => {
        if (visible) {
            loadServiceCenters();
        }
    }, [visible]);

    const loadServiceCenters = async () => {
        setLoading(true);
        try {
            const data = await serviceCenterService.getServiceCenters();
            setCenters(data || []);
        } catch (error) {
            message.error("Không thể tải danh sách chi nhánh");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectCenter = (center) => {
        setSelectedCenter(center);
    };

    const handleConfirm = () => {
        if (selectedCenter) {
            onSelectCenter(selectedCenter, vehicle);
            onClose();
        } else {
            message.warning("Vui lòng chọn chi nhánh");
        }
    };

    return (
        <Modal
            title="Chọn chi nhánh dịch vụ"
            open={visible}
            onCancel={onClose}
            width={800}
            footer={[
                <Button key="cancel" onClick={onClose}>
                    Hủy
                </Button>,
                <Button key="confirm" type="primary" onClick={handleConfirm}>
                    Xác nhận
                </Button>,
            ]}
        >
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Spin size="large" />
                </div>
            ) : (
                <List
                    grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 2 }}
                    dataSource={centers}
                    renderItem={(center) => (
                        <List.Item>
                            <Card
                                hoverable
                                className={`cursor-pointer transition-all ${selectedCenter?.id === center.id
                                        ? "border-blue-500 border-2 shadow-lg"
                                        : ""
                                    }`}
                                onClick={() => handleSelectCenter(center)}
                            >
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between">
                                        <h3 className="font-bold text-lg text-blue-600">
                                            {center.name}
                                        </h3>
                                        {selectedCenter?.id === center.id && (
                                            <CheckCircleOutlined className="text-blue-500 text-xl" />
                                        )}
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-start">
                                            <EnvironmentOutlined className="mr-2 mt-1 text-gray-500" />
                                            <span>{center.address || "Chưa có địa chỉ"}</span>
                                        </div>

                                        <div className="flex items-center">
                                            <PhoneOutlined className="mr-2 text-gray-500" />
                                            <span>{center.phone || "Chưa có số điện thoại"}</span>
                                        </div>

                                        {center.operating_hours && (
                                            <div className="flex items-center">
                                                <ClockCircleOutlined className="mr-2 text-gray-500" />
                                                <span>{center.operating_hours}</span>
                                            </div>
                                        )}
                                    </div>

                                    {center.description && (
                                        <p className="text-gray-600 text-sm mt-2">
                                            {center.description}
                                        </p>
                                    )}
                                </div>
                            </Card>
                        </List.Item>
                    )}
                />
            )}
        </Modal>
    );
};

export default ServiceCenterModal;
