import React, { useState, useEffect } from "react";
import { Card, Form, Input, Button, Avatar, message, Spin, Tag, Descriptions } from "antd";
import { UserOutlined, MailOutlined, PhoneOutlined, SaveOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { userService } from "../../services/userService";
import { useDispatch } from "react-redux";
import { setInfoUserAction } from "../../stores/user/userSlice";
import { keysLocalStorage, localStorageUtil } from "../../utils/localStorage";

const ProfilePage = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const dispatch = useDispatch();

    const loadProfile = async () => {
        try {
            setLoading(true);
            const response = await userService.getMyProfile();
            const userData = response.data;
            setProfile(userData);
            form.setFieldsValue({
                first_name: userData.first_name,
                last_name: userData.last_name,
                phone: userData.phone,
                email: userData.email,
                avatar_url: userData.avatar_url,
            });
        } catch (error) {
            console.error("Failed to load profile:", error);
            message.error("Không thể tải thông tin cá nhân");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSubmit = async (values) => {
        try {
            setSaving(true);
            const updateData = {
                first_name: values.first_name,
                last_name: values.last_name,
                phone: values.phone,
                email: values.email,
                avatar_url: values.avatar_url,
            };

            const response = await userService.updateMyProfile(updateData);
            const updatedUser = response.data;

            setProfile(updatedUser);
            setIsEditing(false);
            message.success("Cập nhật thông tin thành công");

            // Lấy token hiện tại từ localStorage
            const currentData = localStorageUtil.get(keysLocalStorage.INFO_USER);
            const newData = {
                ...currentData,
                user: updatedUser,
            };

            // Cập nhật localStorage
            localStorageUtil.set(keysLocalStorage.INFO_USER, newData);

            // Cập nhật Redux store
            dispatch(setInfoUserAction(newData));
        } catch (error) {
            console.error("Failed to update profile:", error);
            message.error(error.response?.data?.message || "Không thể cập nhật thông tin");
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        form.setFieldsValue({
            first_name: profile.first_name,
            last_name: profile.last_name,
            phone: profile.phone,
            email: profile.email,
            avatar_url: profile.avatar_url,
        });
        setIsEditing(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spin size="large" tip="Đang tải thông tin..." />
            </div>
        );
    }

    const getRoleColor = (role) => {
        const roleColors = {
            CUSTOMER: "blue",
            MEMBER: "green",
            STUDENT: "purple",
            STAFF: "orange",
            ADMIN: "red",
        };
        return roleColors[role] || "default";
    };

    const getRoleLabel = (role) => {
        const roleLabels = {
            CUSTOMER: "Khách hàng",
            MEMBER: "Thành viên",
            STUDENT: "Sinh viên",
            STAFF: "Nhân viên",
            ADMIN: "Quản trị viên",
        };
        return roleLabels[role] || role;
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Thông tin cá nhân</h1>

                {/* Profile Header Card */}
                <Card className="mb-6 shadow-sm">
                    <div className="flex items-center space-x-6">
                        <Avatar
                            size={100}
                            src={profile?.avatar_url}
                            icon={!profile?.avatar_url && <UserOutlined />}
                            className="border-4 border-blue-100"
                        />
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                {profile?.first_name} {profile?.last_name}
                            </h2>
                            <div className="flex items-center space-x-4">
                                <Tag color={getRoleColor(profile?.role)} className="text-sm">
                                    {getRoleLabel(profile?.role)}
                                </Tag>
                                {profile?.is_active ? (
                                    <Tag icon={<CheckCircleOutlined />} color="success">
                                        Đang hoạt động
                                    </Tag>
                                ) : (
                                    <Tag icon={<CloseCircleOutlined />} color="error">
                                        Không hoạt động
                                    </Tag>
                                )}
                                {/* {profile?.is_verified ? (
                                    <Tag icon={<CheckCircleOutlined />} color="blue">
                                        Đã xác thực
                                    </Tag>
                                ) : (
                                    <Tag color="warning">Chưa xác thực</Tag>
                                )} */}
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Account Information */}
                <Card title="Thông tin tài khoản" className="mb-6 shadow-sm">
                    <Descriptions column={1} bordered>
                        {/* <Descriptions.Item label="ID tài khoản">
                            #{profile?.id}
                        </Descriptions.Item> */}
                        <Descriptions.Item label="Email">
                            <span className="flex items-center">
                                <MailOutlined className="mr-2 text-gray-400" />
                                {profile?.email}
                            </span>
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày tạo">
                            {new Date(profile?.created_at).toLocaleDateString("vi-VN", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </Descriptions.Item>
                        <Descriptions.Item label="Cập nhật lần cuối">
                            {new Date(profile?.updated_at).toLocaleDateString("vi-VN", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </Descriptions.Item>
                    </Descriptions>
                </Card>

                {/* Editable Profile Information */}
                <Card
                    title="Thông tin cá nhân"
                    extra={
                        !isEditing && (
                            <Button type="primary" onClick={() => setIsEditing(true)}>
                                Chỉnh sửa
                            </Button>
                        )
                    }
                    className="shadow-sm"
                >
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        disabled={!isEditing}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Form.Item
                                label="Họ"
                                name="first_name"
                                rules={[
                                    { required: true, message: "Vui lòng nhập họ" },
                                    { max: 50, message: "Họ không được quá 50 ký tự" },
                                ]}
                            >
                                <Input
                                    prefix={<UserOutlined className="text-gray-400" />}
                                    placeholder="Nhập họ"
                                    size="large"
                                />
                            </Form.Item>

                            <Form.Item
                                label="Tên"
                                name="last_name"
                                rules={[
                                    { required: true, message: "Vui lòng nhập tên" },
                                    { max: 50, message: "Tên không được quá 50 ký tự" },
                                ]}
                            >
                                <Input
                                    prefix={<UserOutlined className="text-gray-400" />}
                                    placeholder="Nhập tên"
                                    size="large"
                                />
                            </Form.Item>
                        </div>

                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[
                                { required: true, message: "Vui lòng nhập email" },
                                { type: "email", message: "Email không hợp lệ" },
                            ]}
                        >
                            <Input
                                prefix={<MailOutlined className="text-gray-400" />}
                                placeholder="Nhập email"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item
                            label="Số điện thoại"
                            name="phone"
                            rules={[
                                { required: true, message: "Vui lòng nhập số điện thoại" },
                                { pattern: /^[0-9]{10,11}$/, message: "Số điện thoại không hợp lệ" },
                            ]}
                        >
                            <Input
                                prefix={<PhoneOutlined className="text-gray-400" />}
                                placeholder="Nhập số điện thoại"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item
                            label="Avatar URL"
                            name="avatar_url"
                            rules={[
                                { type: "url", message: "URL không hợp lệ" },
                            ]}
                        >
                            <Input
                                prefix={<UserOutlined className="text-gray-400" />}
                                placeholder="Nhập URL ảnh đại diện"
                                size="large"
                            />
                        </Form.Item>

                        {isEditing && (
                            <Form.Item className="mb-0">
                                <div className="flex justify-end space-x-3">
                                    <Button onClick={handleCancel} size="large">
                                        Hủy
                                    </Button>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        icon={<SaveOutlined />}
                                        loading={saving}
                                        size="large"
                                    >
                                        Lưu thay đổi
                                    </Button>
                                </div>
                            </Form.Item>
                        )}
                    </Form>
                </Card>
            </div>
        </div>
    );
};

export default ProfilePage;
