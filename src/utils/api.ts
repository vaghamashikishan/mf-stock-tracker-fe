const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

interface ValidationError {
  field: string;
  message: string;
}

const handleResponse = async <T>(response: Response): Promise<T> => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
      throw new Error("Unauthorized");
    }

    let errorMessage = "An error occurred";
    if (data.error) {
      if (typeof data.error === "string") {
        errorMessage = data.error;
      } else if (data.error.errors && Array.isArray(data.error.errors)) {
        errorMessage = data.error.errors
          .map((err: ValidationError) => `${err.field} - ${err.message}`)
          .join(" | ");
      } else {
        try {
          errorMessage = JSON.stringify(data.error);
        } catch {
          errorMessage = "Unknown error";
        }
      }
    } else if (data.message) {
      errorMessage = data.message;
    }

    throw new Error(errorMessage);
  }
  return data as T;
};

export const api = {
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    return handleResponse<T>(response);
  },

  async post<T>(endpoint: string, body: unknown): Promise<T> {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
  },

  async put<T>(endpoint: string, body: unknown): Promise<T> {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
  },

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return handleResponse<T>(response);
  },
};
