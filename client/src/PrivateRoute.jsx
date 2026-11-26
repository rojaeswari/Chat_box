// import { Navigate } from "react-router-dom";

// const PrivateRoute = ({ children }) => {
//   const user = localStorage.getItem("user");

//   if (!user) {
//     return <Navigate to="/" replace />;
//   }

//   return children;
// };

// export default PrivateRoute;


import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  try {
    JSON.parse(user);
  } catch {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
