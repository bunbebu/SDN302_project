import React from "react";
import { Modal, Form } from "antd";
import PartForm from "./PartForm";

const PartModal = ({
  open,
  onCancel,
  onFinish,
  form,
  isSubmitting,
  isEditing,
}) => {
  const title = isEditing
    ? "Chỉnh sửa thông tin phụ tùng"
    : "Thêm phụ tùng mới";
  const okText = isEditing ? "Cập nhật" : "Thêm mới";

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      onOk={form.submit}
      confirmLoading={isSubmitting}
      okText={okText}
      cancelText="Hủy"
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <PartForm isEditing={isEditing} />
      </Form>
    </Modal>
  );
};

export default PartModal;
