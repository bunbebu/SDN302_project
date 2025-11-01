import React from "react";
import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  // Tạo một hàm để xử lý việc điều hướng
  const handleBackHome = () => {
    navigate("/");
  };

  return (
    <Result
      status="403"
      title="403"
      subTitle="Sorry, you are not authorized to access this page."
      extra={
        <Button type="primary" onClick={handleBackHome}>
          Back
        </Button>
      }
    />
  );
};

export default UnauthorizedPage;
