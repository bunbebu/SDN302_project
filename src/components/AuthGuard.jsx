import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { roleUser } from "../constants/roles";

const AuthGuard = ({ children }) => {
  const { infoUser } = useSelector((state) => state.userSlice);
  const location = useLocation();
  const { pathname } = location;
  const userRole = infoUser?.user?.role;

  // Debug: Log để kiểm tra role
  console.log("AuthGuard - User Info:", infoUser);
  console.log("AuthGuard - User Role:", userRole);
  console.log("AuthGuard - Current Path:", pathname);

  // Xác định các trang công khai mà ai cũng có thể vào (kể cả khi chưa đăng nhập)
  const isPublicPage = pathname === "/" || pathname === "/unauthorized";

  // --- 1. Xử lý khi USER CHƯA ĐĂNG NHẬP ---
  if (!infoUser) {
    // Nếu người dùng đang ở một trang công khai (như trang login), cho phép họ ở lại.
    if (isPublicPage) {
      return children;
    }

    // Ngược lại, nếu họ cố vào bất kỳ trang được bảo vệ nào khác -> Về trang đăng nhập.
    return <Navigate to="/" replace />;
  }

  // --- 2. Xử lý khi USER ĐÃ ĐĂNG NHẬP ---

  // Nếu đã đăng nhập mà quay lại trang login, đưa họ về dashboard tương ứng.
  if (pathname === "/") {
    if (userRole === roleUser.ADMIN) return <Navigate to="/admin" replace />;
    if (userRole === roleUser.STAFF) return <Navigate to="/staff" replace />;
    if (userRole === roleUser.MEMBER || userRole === roleUser.STUDENT || userRole === roleUser.CUSTOMER) {
      return <Navigate to="/member" replace />;
    }
  }

  // Kiểm tra quyền truy cập dựa trên vai trò (role)
  // Nếu Staff hoặc Member cố vào trang Admin -> Lỗi 403
  if (pathname.startsWith("/admin") && userRole !== roleUser.ADMIN) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Nếu Admin hoặc Member cố vào trang Staff -> Lỗi 403
  if (pathname.startsWith("/staff") && userRole !== roleUser.STAFF) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Nếu Admin hoặc Staff cố vào trang Member -> Lỗi 403
  // Cho phép cả MEMBER, STUDENT và CUSTOMER vào trang /member
  if (
    pathname.startsWith("/member") &&
    userRole !== roleUser.MEMBER &&
    userRole !== roleUser.STUDENT &&
    userRole !== roleUser.CUSTOMER
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Nếu tất cả điều kiện đều hợp lệ, cho phép render trang.
  return children;
};

export default AuthGuard;
