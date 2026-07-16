import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import {
  AuthContainer,
  AuthCard,
  AuthTitle,
  AuthSubtitle,
  AuthFormGroup,
  AuthLabel,
  AuthInput,
  AuthButton,
  PasswordInputWrapper,
  PasswordToggleButton,
  AuthDivider,
  GoogleButton,
} from "./Auth.styled";
import { api } from "../utils/api";
import type { LoginRequest, LoginResponse } from "../types";
import { useGlobalContext } from "../context/GlobalContext";
import { showToast } from "../utils/toast";
import { apiPath } from "../utils/api-path";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const Login = () => {
  const { setState } = useGlobalContext();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginRequest>({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.post<LoginResponse>(
        apiPath.LOGIN_USER_BY_EMAIL,
        formData,
      );
      setState({ user: response.user });
      showToast.success(response.message || "Logged in successfully!");
      navigate("/"); // Redirect to dashboard
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to login";
      showToast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContainer>
      <AuthCard>
        <AuthTitle>Welcome Back</AuthTitle>
        <AuthSubtitle>Log in to track your portfolio</AuthSubtitle>

        <form onSubmit={handleSubmit}>
          <AuthFormGroup>
            <AuthLabel htmlFor="email">Email</AuthLabel>
            <AuthInput
              id="email"
              type="email"
              name="email"
              required
              placeholder="you@example.com"
              onChange={handleChange}
            />
          </AuthFormGroup>
          <AuthFormGroup>
            <AuthLabel htmlFor="password">Password</AuthLabel>
            <PasswordInputWrapper>
              <AuthInput
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                required
                placeholder="••••••••"
                onChange={handleChange}
              />
              <PasswordToggleButton
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </PasswordToggleButton>
            </PasswordInputWrapper>
          </AuthFormGroup>
          <AuthButton type="submit" disabled={isLoading}>
            {isLoading ? "Signing In..." : "Sign In"}
          </AuthButton>
        </form>
        <AuthDivider>
          <span>or</span>
        </AuthDivider>
        <GoogleButton
          type="button"
          onClick={() => {
            window.location.href = `${BASE_URL}${apiPath.GOOGLE_LOGIN}`;
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
              fill="#4285F4"
            />
            <path
              d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
              fill="#34A853"
            />
            <path
              d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
              fill="#FBBC05"
            />
            <path
              d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58Z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </GoogleButton>
        <p
          className="mt-6 text-center text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          Don't have an account?{" "}
          <Link
            to="/register"
            style={{ color: "var(--accent-primary)" }}
            className="hover:underline"
          >
            Sign up
          </Link>
        </p>
      </AuthCard>
    </AuthContainer>
  );
};

export default Login;
