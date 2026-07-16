import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes/AppRoutes";
import { checkAuth } from "./features/auth/authSlice";

function App() {
  const dispatch = useDispatch();

  // App pehli baar load hote hi ek dafa check karo - agar valid cookie already hai (jaise page refresh hua), to seedha login page dikhane ke bajaye user ko
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return (
    <>
      <Toaster position="top-right" />
      <AppRoutes />
    </>
  );
}

export default App;
