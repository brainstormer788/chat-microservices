import Login from "./login/Login.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Route, Routes } from "react-router-dom";
import Register from "./register/Register.jsx";
import Home from "./home/Home.jsx";
import { VerifyUser } from "./utils/VerifyUser.jsx";

function App() {
  return (
    <div className="app-shell min-h-screen w-screen p-3 md:p-6">
      <div className="pointer-events-none fixed -left-20 top-12 h-56 w-56 rounded-full bg-cyan-300/30 blur-3xl" />
      <div className="pointer-events-none fixed bottom-10 right-0 h-72 w-72 rounded-full bg-orange-300/20 blur-3xl" />

      <div className="relative z-10 flex min-h-[calc(100vh-1.5rem)] items-center justify-center md:min-h-[calc(100vh-3rem)]">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<VerifyUser />}>
            <Route path="/" element={<Home />} />
          </Route>
        </Routes>
      </div>

      <ToastContainer position="top-right" autoClose={2500} theme="colored" />
    </div>
  );
}

export default App;
