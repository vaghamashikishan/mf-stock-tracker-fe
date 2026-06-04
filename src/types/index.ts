export interface User {
  id: number | string;
  name: string;
  email: string;
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

export interface LoginResponse {
  message: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
}

export interface Asset {
  id: number;
  symbol: string;
  name: string;
  instrument_type: string;
  isin: string;
  exchange: string;
  currency: string;
  external_platform_id: string;
  created_at: string;
}

export interface CreateAssetRequest {
  symbol: string;
  name: string;
  instrument_type: string;
  isin: string;
  exchange: string;
  currency: string;
  external_platform_id: string;
}

export type UpdateAssetRequest = Partial<CreateAssetRequest>;

export interface AssetResponse {
  asset: Asset;
}

export interface Transaction {
  id: number;
  user_asset_id: number;
  asset_name: string;
  asset_instrument_type: string;
  txn_type: string;
  quantity: number;
  price: number;
  txn_date: string;
  created_at: string;
}

export interface CreateTransactionRequest {
  asset_id: number;
  txn_type: string;
  quantity: number;
  price: number;
  txn_date: string;
}

export interface UpdateTransactionRequest {
  id: number;
  txn_type?: string;
  quantity?: number;
  price?: number;
  txn_date?: string;
}

export interface Holding {
  id: number;
  asset_name: string;
  asset_instrument_type: string;
  quantity: number;
  average_price: number;
  current_price: number;
  invested_capital: number;
  current_capital: number;
  return_percentage: number;
}
