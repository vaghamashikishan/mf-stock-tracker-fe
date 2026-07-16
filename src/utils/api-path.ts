export const apiPath = {
  // Auth
  LOGIN_USER_BY_EMAIL: "/auth/email/login",
  REGISTER_USER_BY_EMAIL: "/auth/email/register",
  GOOGLE_LOGIN: "/auth/google/login",
  GOOGLE_CALLBACK: "/auth/google/callback",
  LOGOUT: "/auth/logout",
  VERIFY_USER: "/auth/verify",
  DELETE_USER: "/auth",

  // Assets
  CREATE_ASSET: "/assets",
  GET_ALL_ASSETS: "/assets",
  GET_ASSET_BY_ID: (assetId: number) => `/assets/${assetId}`,
  UPDATE_ASSET: (assetId: number) => `/assets/${assetId}`,
  DELETE_ASSET: (assetId: number) => `/assets/${assetId}`,

  // User Assets
  CREATE_USER_ASSET: "/user-assets",
  GET_USER_ASSETS: "/user-assets",
  DELETE_USER_ASSET: (userAssetId: number) => `/user-assets/${userAssetId}`,

  // Transactions
  CREATE_TRANSACTION: "/transactions",
  GET_ALL_TRANSACTIONS: "/transactions",
  UPDATE_TRANSACTION: (txnId: number) => `/transactions/${txnId}`,
  DELETE_TRANSACTION: (txnId: number) => `/transactions/${txnId}`,

  // Holdings
  GET_HOLDINGS: "/holdings",

  // Dashboard
  GET_DASHBOARD: "/dashboard",

  // CAS Statement
  PROCESS_CAS_STATEMENT: "/cas-statement",
};
