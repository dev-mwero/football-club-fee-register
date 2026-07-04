export const PAYMENT_STATUSES = ["PENDING", "SUCCESS", "FAILED"] as const;
export const FEE_RECORD_STATUSES = ["PAID", "PARTIAL", "UNPAID"] as const;
export const CHARGE_TYPES = ["FEE", "EXPENSE"] as const;
export const FREQUENCIES = ["ONE_TIME", "MONTHLY", "TERMLY", "YEARLY"] as const;
export const ROLES = ["ADMIN", "PARENT", "COACH"] as const;
export const PLAYER_STATUSES = ["ACTIVE", "INACTIVE", "GRADUATED"] as const;
export const BILLING_TYPES = ["MANUAL", "AUTO"] as const;
export const NOTIFICATION_TYPES = [
  "PAYMENT_CONFIRMATION",
  "PAYMENT_REMINDER",
  "ACCOUNT_NOTIFICATION",
] as const;

export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE_SIZE = 20;

export const CURRENCY = "KES";
