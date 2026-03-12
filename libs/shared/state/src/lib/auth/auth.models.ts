// =============================================================================
// MindEase — Auth Models
// =============================================================================
// Types and interfaces for authentication state management

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface DecodedToken {
  sub: string; // user id
  email: string;
  exp: number; // expiration timestamp (Unix time in seconds)
  iat: number; // issued at (Unix time in seconds)
}
