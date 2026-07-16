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
} from "./Auth.styled";
import { api } from "../utils/api";
import type { RegisterRequest, RegisterResponse } from "../types";
import { showToast } from "../utils/toast";
import { apiPath } from "../utils/api-path";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterRequest>({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post<RegisterResponse>(
        apiPath.REGISTER_USER_BY_EMAIL,
        formData,
      );
      showToast.success("Account created successfully! Please log in.");
      navigate("/login");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to register";
      showToast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContainer>
      <AuthCard>
        <AuthTitle>Create an Account</AuthTitle>
        <AuthSubtitle>Start tracking your investments today</AuthSubtitle>

        <form onSubmit={handleSubmit}>
          <AuthFormGroup>
            <AuthLabel htmlFor="name">Full Name</AuthLabel>
            <AuthInput
              id="name"
              type="text"
              name="name"
              required
              placeholder="John Doe"
              onChange={handleChange}
            />
          </AuthFormGroup>
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
            {isLoading ? "Signing Up..." : "Sign Up"}
          </AuthButton>
        </form>
        <p
          className="mt-6 text-center text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          Already have an account?{" "}
          <Link
            to="/login"
            style={{ color: "var(--accent-primary)" }}
            className="hover:underline"
          >
            Log in
          </Link>
        </p>
      </AuthCard>
    </AuthContainer>
  );
};

export default Register;
