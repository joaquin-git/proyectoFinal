export type LoginCredentials = {
  email: string;
  password: string;
};

export type User = {
  id?: number;
  nombre?: string;
  rol?: string;
  [key: string]: any;
};

export type LoginResult = User;
