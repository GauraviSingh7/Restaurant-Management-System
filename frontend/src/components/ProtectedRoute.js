import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
    const role = localStorage.getItem("role");
    if (!role) {
        return <Navigate to="/login" />;
    }
    return children;
};

export default ProtectedRoute;
