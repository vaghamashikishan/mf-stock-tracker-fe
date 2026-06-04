import styled from "styled-components";

export const AuthContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: var(--bg-page);
  transition: background-color 0.2s ease;
`;

export const AuthCard = styled.div`
  background: var(--bg-surface);
  border-radius: 1rem;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-default);
  padding: 2.5rem;
  width: 100%;
  max-width: 28rem;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
`;

export const AuthTitle = styled.h2`
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--text-default);
  margin-bottom: 0.5rem;
  text-align: center;
`;

export const AuthSubtitle = styled.p`
  color: var(--text-muted);
  text-align: center;
  margin-bottom: 2rem;
`;

export const AuthFormGroup = styled.div`
  margin-bottom: 1rem;
`;

export const AuthLabel = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-subtle);
  margin-bottom: 0.25rem;
`;

export const AuthInput = styled.input`
  width: 100%;
  box-sizing: border-box;
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-default);
  border-radius: 0.5rem;
  outline: none;
  background: var(--bg-subtle);
  color: var(--text-default);
  transition: all 0.2s;

  &::placeholder {
    color: var(--text-muted);
  }

  &:focus {
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 2px
      color-mix(in srgb, var(--accent-primary) 20%, transparent);
    background: var(--bg-surface);
  }
`;

export const PasswordInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  input {
    padding-right: 2.5rem;
  }
`;

export const PasswordToggleButton = styled.button`
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;

  &:hover {
    color: var(--text-subtle);
  }
`;

export const AuthDivider = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 1.25rem 0;

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: var(--border-default);
  }

  span {
    font-size: 0.75rem;
    color: var(--text-muted);
    white-space: nowrap;
  }
`;

export const GoogleButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-default);
  border-radius: 0.5rem;
  background: var(--bg-subtle);
  color: var(--text-default);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--bg-surface);
    border-color: var(--accent-primary);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const AuthButton = styled.button`
  width: 100%;
  background-color: var(--accent-primary);
  color: var(--accent-text);
  font-weight: 600;
  padding: 0.625rem 0;
  border-radius: 0.5rem;
  transition: background-color 0.2s;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: var(--accent-hover);
  }

  &:disabled {
    background-color: var(--accent-disabled);
    cursor: not-allowed;
  }
`;
