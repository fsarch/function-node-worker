export interface IUser {
  getAccessToken(): string;
}

export interface IAuthService {
  signIn(username: string, password: string): Promise<{ accessToken: string; }>;
  validateRequest(request): Promise<IUser>;
}
