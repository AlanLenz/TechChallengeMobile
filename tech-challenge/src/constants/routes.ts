export const ROUTES = {
  AUTH: {
    LOGIN: '/(auth)/login',
    REGISTER: '/(auth)/register',
    FORGOT_PASSWORD: '/(auth)/forgot-password',
  },
  TABS: {
    HOME: '/(tabs)',
    ACCOUNTS: '/(tabs)/accounts',
    TRANSFERS: '/(tabs)/transfers',
    PROFILE: '/(tabs)/profile',
  },
  MODALS: {
    NEW_TRANSFER: '/(modals)/new-transfer',
    EDIT_AVATAR: '/(modals)/edit-avatar',
  },
} as const;
