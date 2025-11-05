import React, { useState, useEffect } from "react";
import { Modal, Steps, Button, List, Card, DatePicker, TimePicker, Form, Input, Select, message, Descriptions, Tag, Alert } from "antd";
import { ClockCircleOutlined, EnvironmentOutlined, CarOutlined, ToolOutlined, CheckCircleFilled, LoadingOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { adminService } from "../../services/adminService";
import { serviceService } from "../../services/serviceService";
import { appointmentService } from "../../services/appointmentService";

const { TextArea } = Input;
const { Option } = Select;

const BookingModal = ({ visible, onClose, onSuccess, vehicle }) => {
    const [current, setCurrent] = useState(0);
    const [form] = Form.useForm();

    // Data states
    const [serviceCenters, setServiceCenters] = useState([]);
    const [services, setServices] = useState([]);
    const [allServices, setAllServices] = useState([]); // Tất cả services để map tên
    const [selectedCenter, setSelectedCenter] = useState(null);
    const [selectedServices, setSelectedServices] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [bookedSlots, setBookedSlots] = useState([]); // Danh sách slot đã được đặt
    const [vehicleAppointments, setVehicleAppointments] = useState([]); // Lịch hẹn của xe này
    const [priority, setPriority] = useState("NORMAL");
    const [notes, setNotes] = useState("");

    // Loading states
    const [loadingCenters, setLoadingCenters] = useState(false);
    const [loadingServices, setLoadingServices] = useState(false);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [loadingVehicleAppointments, setLoadingVehicleAppointments] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Confirmation timer
    const [confirmTimer, setConfirmTimer] = useState(120); // 2 minutes

    useEffect(() => {
        if (visible && vehicle) {
            loadServiceCenters();
            loadVehicleAppointments();
            loadAllServices(); // Load tất cả services để map tên
            setCurrent(0);
            form.resetFields();
            setSelectedCenter(null);
            setSelectedServices([]);
            setSelectedDate(null);
            setSelectedTime(null);
            setPriority("NORMAL");
            setNotes("");
            setConfirmTimer(120);
        }
    }, [visible, vehicle]);

    // Countdown timer for confirmation
    useEffect(() => {
        let timer;
        if (visible && current === 3 && confirmTimer > 0) {
            timer = setInterval(() => {
                setConfirmTimer(prev => {
                    if (prev <= 1) {
                        message.warning("Hết thời gian xác nhận, vui lòng đặt lại");
                        handleClose();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [visible, current, confirmTimer]);

    const loadServiceCenters = async () => {
        setLoadingCenters(true);
        try {
            const response = await adminService.getAllServiceCenters({ skip: 0, limit: 100, active_only: true });
            const centers = response.data?.data || [];
            setServiceCenters(centers);
        } catch (error) {
            message.error("Không thể tải danh sách chi nhánh");
            console.error(error);
        } finally {
            setLoadingCenters(false);
        }
    };

    const loadAllServices = async () => {
        try {
            const response = await serviceService.getServices({ skip: 0, limit: 1000 });
            const allSvcs = response.data?.data || [];
            setAllServices(allSvcs);
        } catch (error) {
            console.error("Không thể tải danh sách dịch vụ:", error);
        }
    };

    const loadServices = async (serviceCenterId) => {
        setLoadingServices(true);
        try {
            const response = await serviceService.getServices({ skip: 0, limit: 100, active_only: true });
            const allServices = response.data?.data || [];
            // Filter services by service center
            const centerServices = allServices.filter(s => s.service_center_id === serviceCenterId);
            setServices(centerServices);
        } catch (error) {
            message.error("Không thể tải danh sách dịch vụ");
            console.error(error);
        } finally {
            setLoadingServices(false);
        }
    };

    const loadBookedSlots = async (date, serviceCenterId) => {
        if (!date || !serviceCenterId) return;

        setLoadingSlots(true);
        try {
            const startDate = dayjs(date).startOf('day').toISOString();
            const endDate = dayjs(date).endOf('day').toISOString();

            console.log("Loading slots for:", { startDate, endDate, serviceCenterId });

            const response = await appointmentService.getAppointments({
                service_center_id: serviceCenterId,
                start_date: startDate,
                end_date: endDate,
                skip: 0,
                limit: 100
            });

            const appointments = response.data?.data || [];
            console.log("All appointments:", appointments);

            // Lọc các appointment không bị cancel
            const activeAppointments = appointments.filter(
                apt => apt.status !== 'CANCELLED'
            );

            console.log("Active appointments:", activeAppointments);

            // Lấy danh sách giờ đã được đặt (convert từ UTC sang local time)
            const bookedHours = activeAppointments.map(apt => {
                const scheduledDate = dayjs(apt.scheduled_date); // dayjs tự động parse ISO string
                const localTime = scheduledDate.format('HH:mm'); // Format theo local timezone
                console.log(`Appointment ${apt.id}: ${apt.scheduled_date} -> ${localTime}`);
                return localTime;
            });

            console.log("Booked slots:", bookedHours);
            setBookedSlots(bookedHours);
        } catch (error) {
            console.error("Không thể tải lịch hẹn:", error);
            setBookedSlots([]);
        } finally {
            setLoadingSlots(false);
        }
    };

    const loadVehicleAppointments = async () => {
        if (!vehicle?.id) return;

        setLoadingVehicleAppointments(true);
        try {
            const response = await appointmentService.getAppointments({
                vehicle_id: vehicle.id,
                skip: 0,
                limit: 100
            });

            const appointments = response.data?.data || [];
            // Lọc chỉ lấy các lịch hẹn chưa hủy
            const activeAppointments = appointments.filter(
                apt => apt.status !== 'CANCELLED'
            );

            console.log("Vehicle appointments:", activeAppointments);
            setVehicleAppointments(activeAppointments);
        } catch (error) {
            console.error("Không thể tải lịch hẹn của xe:", error);
            setVehicleAppointments([]);
        } finally {
            setLoadingVehicleAppointments(false);
        }
    };

    const handleSelectCenter = (center) => {
        setSelectedCenter(center);
        loadServices(center.id);
        setCurrent(1);
    };

    const handleSelectServices = () => {
        if (selectedServices.length === 0) {
            message.warning("Vui lòng chọn ít nhất một dịch vụ");
            return;
        }
        setCurrent(2);
    };

    const handleSelectDateTime = () => {
        if (!selectedTime) {
            message.warning("Vui lòng chọn giờ");
            return;
        }

        form.validateFields(["date", "priority", "notes"]).then(values => {
            setSelectedDate(values.date);
            setPriority(values.priority || "NORMAL");
            setNotes(values.notes || "");
            setCurrent(3);
            setConfirmTimer(120); // Reset timer
        }).catch(() => {
            message.error("Vui lòng điền đầy đủ thông tin");
        });
    };

    const handleConfirmBooking = async () => {
        setSubmitting(true);
        try {
            // Reload lại booked slots để đảm bảo không bị trùng
            await loadBookedSlots(selectedDate, selectedCenter.id);

            // Kiểm tra lại xem slot có bị book không
            if (bookedSlots.includes(selectedTime)) {
                message.error("Giờ này đã có người đặt, vui lòng chọn giờ khác!");
                setSubmitting(false);
                return;
            }

            const [hour, minute] = selectedTime.split(':').map(Number);
            const scheduledDateTime = dayjs(selectedDate)
                .hour(hour)
                .minute(minute)
                .second(0)
                .toISOString();

            const serviceIds = selectedServices.map(s => s.id);
            console.log("🔍 Selected services:", selectedServices);
            console.log("🔍 Service IDs:", serviceIds);

            const appointmentData = {
                vehicle_id: vehicle.id,
                service_center_id: selectedCenter.id,
                scheduled_date: scheduledDateTime,
                priority: priority,
                notes: notes,
                service_ids: serviceIds,
            };

            console.log("📅 Creating appointment:", appointmentData);
            const result = await appointmentService.createAppointment(appointmentData);
            console.log("✅ Appointment created:", result);

            message.success("Đặt lịch thành công!");
            handleClose();

            // Gọi callback để reload dữ liệu
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error("❌ Booking error:", error);
            console.error("❌ Error response:", error.response?.data);

            const errorMsg = error.response?.data?.detail
                || error.response?.data?.message
                || "Không thể đặt lịch";
            message.error(errorMsg);
        } finally {
            setSubmitting(false);
        }
    }; const handleClose = () => {
        setCurrent(0);
        form.resetFields();
        setSelectedCenter(null);
        setSelectedServices([]);
        setSelectedDate(null);
        setSelectedTime(null);
        setPriority("NORMAL");
        setNotes("");
        setConfirmTimer(120);
        onClose();
    };

    const disabledDate = (current) => {
        // Không cho chọn ngày quá khứ
        return current && current < dayjs().startOf('day');
    };

    const getServiceName = (serviceId) => {
        const service = allServices.find(s => s.id === serviceId);
        return service?.name || 'N/A';
    };

    const disabledTime = (selectedDate) => {
        if (!selectedDate) return {};

        const now = dayjs();
        const isToday = selectedDate.isSame(now, 'day');

        if (!isToday) return {};

        return {
            disabledHours: () => {
                const hours = [];
                for (let i = 0; i < now.hour(); i++) {
                    hours.push(i);
                }
                return hours;
            },
            disabledMinutes: (selectedHour) => {
                if (selectedHour === now.hour()) {
                    const minutes = [];
                    for (let i = 0; i <= now.minute(); i++) {
                        minutes.push(i);
                    }
                    return minutes;
                }
                return [];
            },
        };
    };

    const steps = [
        { title: "Chọn chi nhánh", icon: <EnvironmentOutlined /> },
        { title: "Chọn dịch vụ", icon: <ToolOutlined /> },
        { title: "Chọn thời gian", icon: <ClockCircleOutlined /> },
        { title: "Xác nhận", icon: <CarOutlined /> },
    ];

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const totalPrice = selectedServices.reduce((sum, service) => sum + parseFloat(service.base_price || 0), 0);

    return (
        <Modal
            title={`Đặt lịch bảo dưỡng - ${vehicle?.license_plate || ""}`}
            open={visible}
            onCancel={handleClose}
            width={900}
            footer={null}
        >
            {/* Hiển thị lịch hẹn đã có của xe này */}
            {loadingVehicleAppointments ? (
                <Alert
                    type="info"
                    message="Đang kiểm tra lịch hẹn hiện có..."
                    icon={<LoadingOutlined />}
                    className="mb-4"
                />
            ) : vehicleAppointments.length > 0 ? (
                <Alert
                    type="warning"
                    message={`Xe này đã có ${vehicleAppointments.length} lịch hẹn`}
                    description={
                        <List
                            size="small"
                            dataSource={vehicleAppointments}
                            renderItem={(apt) => (
                                <List.Item className="py-2">
                                    <div className="w-full">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Tag color={
                                                apt.status === 'PENDING' ? 'orange' :
                                                    apt.status === 'CONFIRMED' ? 'blue' :
                                                        apt.status === 'COMPLETED' ? 'green' :
                                                            apt.status === 'IN_PROGRESS' ? 'cyan' : 'default'
                                            }>
                                                {apt.status}
                                            </Tag>
                                            <strong>{dayjs(apt.scheduled_date).format('DD/MM/YYYY HH:mm')}</strong>
                                        </div>
                                        {apt.appointment_services && apt.appointment_services.length > 0 && (
                                            <div className="text-sm text-gray-600">
                                                Dịch vụ: {apt.appointment_services.map(s => getServiceName(s.service_id)).join(', ')}
                                            </div>
                                        )}
                                        {apt.notes && (
                                            <div className="text-sm text-gray-500 italic mt-1">
                                                Ghi chú: {apt.notes}
                                            </div>
                                        )}
                                    </div>
                                </List.Item>
                            )}
                        />
                    }
                    className="mb-4"
                    showIcon
                />
            ) : null}

            <Steps current={current} items={steps} className="mb-6" />

            {/* Step 0: Chọn chi nhánh */}
            {current === 0 && (
                <div>
                    <h3 className="text-lg font-semibold mb-4">Chọn chi nhánh dịch vụ</h3>
                    <List
                        loading={loadingCenters}
                        grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2 }}
                        dataSource={serviceCenters}
                        renderItem={(center) => (
                            <List.Item>
                                <Card
                                    hoverable
                                    onClick={() => handleSelectCenter(center)}
                                    className="h-full"
                                >
                                    <Card.Meta
                                        title={center.name}
                                        description={
                                            <div className="space-y-2">
                                                <div><EnvironmentOutlined /> {center.address}</div>
                                                <div>📞 {center.phone}</div>
                                                <div>⭐ {center.rating}/5.0</div>
                                                <div>Sức chứa: {center.capacity} xe</div>
                                            </div>
                                        }
                                    />
                                </Card>
                            </List.Item>
                        )}
                    />
                </div>
            )}

            {/* Step 1: Chọn dịch vụ */}
            {current === 1 && (
                <div>
                    <h3 className="text-lg font-semibold mb-4">Chọn dịch vụ bảo dưỡng</h3>
                    <List
                        loading={loadingServices}
                        dataSource={services}
                        renderItem={(service) => {
                            const isSelected = selectedServices.find(s => s.id === service.id);
                            return (
                                <List.Item>
                                    <Card
                                        hoverable
                                        className={`w-full transition-all ${isSelected
                                            ? 'border-blue-500 border-2 bg-blue-50 shadow-md'
                                            : 'border-gray-200'
                                            }`}
                                        onClick={() => {
                                            if (isSelected) {
                                                setSelectedServices(prev => prev.filter(s => s.id !== service.id));
                                            } else {
                                                setSelectedServices(prev => [...prev, service]);
                                            }
                                        }}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-semibold">{service.name}</h4>
                                                    {isSelected && (
                                                        <CheckCircleFilled className="text-blue-500 text-lg" />
                                                    )}
                                                </div>
                                                <Tag color="blue">{service.category}</Tag>
                                                <p className="text-gray-600 mt-2">{service.description}</p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    ⏱️ Thời gian ước tính: {service.estimated_duration_hours}h
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-lg font-bold ${isSelected ? 'text-blue-600' : 'text-gray-700'}`}>
                                                    {formatCurrency(service.base_price)}
                                                </p>
                                            </div>
                                        </div>
                                    </Card>
                                </List.Item>
                            );
                        }}
                    />
                    <div className="mt-4 flex justify-between">
                        <Button onClick={() => setCurrent(0)}>Quay lại</Button>
                        <Button type="primary" onClick={handleSelectServices}>
                            Tiếp tục ({selectedServices.length} dịch vụ)
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 2: Chọn thời gian */}
            {current === 2 && (
                <div>
                    <h3 className="text-lg font-semibold mb-4">Chọn ngày giờ</h3>
                    <Form form={form} layout="vertical">
                        <Form.Item
                            name="date"
                            label="Ngày"
                            rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
                        >
                            <DatePicker
                                className="w-full"
                                format="DD/MM/YYYY"
                                disabledDate={disabledDate}
                                placeholder="Chọn ngày"
                                onChange={(date) => {
                                    if (date && selectedCenter) {
                                        loadBookedSlots(date, selectedCenter.id);
                                        form.setFieldValue('time', null);
                                        setSelectedTime(null);
                                    }
                                }}
                            />
                        </Form.Item>

                        {form.getFieldValue('date') && (
                            <Form.Item
                                name="time"
                                label="Chọn giờ"
                                rules={[{ required: true, message: "Vui lòng chọn giờ" }]}
                            >
                                <div className="grid grid-cols-5 gap-2">
                                    {(() => {
                                        const slots = [];
                                        const selectedDate = form.getFieldValue('date');
                                        const now = dayjs();
                                        const isToday = selectedDate && selectedDate.isSame(now, 'day');

                                        for (let hour = 8; hour <= 20; hour++) {
                                            const timeStr = `${hour.toString().padStart(2, '0')}:00`;
                                            const slotTime = dayjs(selectedDate).hour(hour).minute(0);

                                            // Check if slot is in the past
                                            const isPast = isToday && slotTime.isBefore(now);

                                            // Check if slot is booked
                                            const isBooked = bookedSlots.includes(timeStr);

                                            // Check if slot is selected
                                            const isSelected = selectedTime === timeStr;

                                            let btnClass = "h-16 text-center rounded border transition-all ";
                                            let statusText = "";
                                            let disabled = false;

                                            if (isPast || isBooked) {
                                                btnClass += "bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300";
                                                statusText = isBooked ? "Đã có lịch hẹn" : "Đã qua";
                                                disabled = true;
                                            } else if (isSelected) {
                                                btnClass += "bg-blue-500 text-white border-blue-600 shadow-lg";
                                                statusText = "Đang chọn";
                                            } else {
                                                btnClass += "bg-white hover:bg-blue-50 border-gray-300 hover:border-blue-400 cursor-pointer";
                                                statusText = "Còn trống";
                                            }

                                            slots.push(
                                                <button
                                                    key={timeStr}
                                                    type="button"
                                                    className={btnClass}
                                                    disabled={disabled}
                                                    onClick={() => {
                                                        if (!disabled) {
                                                            setSelectedTime(timeStr);
                                                            form.setFieldValue('time', dayjs().hour(hour).minute(0));
                                                        }
                                                    }}
                                                >
                                                    <div className="font-semibold text-lg">{timeStr}</div>
                                                    <div className="text-xs mt-1">{statusText}</div>
                                                </button>
                                            );
                                        }
                                        return slots;
                                    })()}
                                </div>
                                {loadingSlots && (
                                    <div className="text-center mt-2 text-gray-500">
                                        Đang tải lịch hẹn...
                                    </div>
                                )}
                            </Form.Item>
                        )}

                        <div className="flex gap-4 mt-4">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                                <span className="text-sm">Đang chọn</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded"></div>
                                <span className="text-sm">Đã có lịch hẹn</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-white border border-gray-300 rounded"></div>
                                <span className="text-sm">Còn trống</span>
                            </div>
                        </div>

                        <Form.Item
                            name="priority"
                            label="Mức độ ưu tiên"
                            initialValue="NORMAL"
                            className="mt-4"
                        >
                            <Select>
                                <Option value="NORMAL">Bình thường</Option>
                                <Option value="URGENT">Khẩn cấp</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="notes"
                            label="Ghi chú"
                        >
                            <TextArea rows={4} placeholder="Ghi chú thêm cho chi nhánh..." />
                        </Form.Item>
                    </Form>

                    <div className="mt-4 flex justify-between">
                        <Button onClick={() => setCurrent(1)}>Quay lại</Button>
                        <Button type="primary" onClick={handleSelectDateTime}>
                            Tiếp tục
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 3: Xác nhận */}
            {current === 3 && (
                <div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
                        <ClockCircleOutlined className="text-yellow-600 mr-2" />
                        <span className="text-yellow-800">
                            Thời gian xác nhận còn: <strong>{Math.floor(confirmTimer / 60)}:{(confirmTimer % 60).toString().padStart(2, '0')}</strong>
                        </span>
                    </div>

                    <h3 className="text-lg font-semibold mb-4">Xác nhận thông tin đặt lịch</h3>

                    <Descriptions bordered column={1}>
                        <Descriptions.Item label="Xe">
                            {vehicle?.license_plate} - {vehicle?.model_name}
                        </Descriptions.Item>
                        <Descriptions.Item label="Chi nhánh">
                            <div>
                                <div><strong>{selectedCenter?.name}</strong></div>
                                <div className="text-sm text-gray-600">{selectedCenter?.address}</div>
                                <div className="text-sm text-gray-600">📞 {selectedCenter?.phone}</div>
                            </div>
                        </Descriptions.Item>
                        <Descriptions.Item label="Dịch vụ">
                            <div className="space-y-2">
                                {selectedServices.map(service => (
                                    <div key={service.id} className="flex justify-between">
                                        <span>{service.name}</span>
                                        <span className="font-semibold">{formatCurrency(service.base_price)}</span>
                                    </div>
                                ))}
                                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                                    <span>Tổng cộng:</span>
                                    <span className="text-blue-600">{formatCurrency(totalPrice)}</span>
                                </div>
                            </div>
                        </Descriptions.Item>
                        <Descriptions.Item label="Thời gian">
                            {selectedDate?.format("DD/MM/YYYY")} lúc {selectedTime}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ưu tiên">
                            <Tag color={priority === 'URGENT' ? 'red' : 'blue'}>
                                {priority === 'URGENT' ? 'Khẩn cấp' : 'Bình thường'}
                            </Tag>
                        </Descriptions.Item>
                        {notes && (
                            <Descriptions.Item label="Ghi chú">
                                {notes}
                            </Descriptions.Item>
                        )}
                    </Descriptions>

                    <div className="mt-6 flex justify-between">
                        <Button onClick={() => setCurrent(2)}>Quay lại</Button>
                        <Button
                            type="primary"
                            size="large"
                            loading={submitting}
                            onClick={handleConfirmBooking}
                        >
                            Xác nhận đặt lịch
                        </Button>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default BookingModal;
