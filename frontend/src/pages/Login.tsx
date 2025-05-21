import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css"; // Reuse or create this file

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate(); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://127.0.0.1:5000/login", form);
      alert(res.data.message);
      localStorage.setItem("user_id", res.data.user);
      setForm({ email: "", password: "" });
      navigate("/dashboard");
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 500);
    } catch (error) {
      alert("Login failed! Please check your credentials.");
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Login to Your Account</h2>
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
