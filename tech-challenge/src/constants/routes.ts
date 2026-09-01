export const ROUTES = {
  AUTH: {
    LOGIN: '/(auth)/login',
    REGISTER: '/(auth)/register',
    FORGOT_PASSWORD: '/(auth)/forgot-password',
  },
  TABS: {
    HOME: '/(tabs)',
    TRANSACTIONS: '/(tabs)/transactions',
    PROFILE: '/(tabs)/profile',
  },
  MODALS: {
    NEW_TRANSACTION: '/(modals)/new-transaction',
    EDIT_TRANSACTION: '/(modals)/edit-transaction',
    EDIT_AVATAR: '/(modals)/edit-avatar',
  },
} as const;
