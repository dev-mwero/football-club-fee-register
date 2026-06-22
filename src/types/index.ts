import type {
  FeeRecordChargeType,
  FeeRecordStatus,
  IFeeRecord,
} from "@/models/FeeRecord";
import type { IFeeStructure } from "@/models/FeeStructure";
import type { INotification, NotificationType } from "@/models/Notification";
import type { IPayment, PaymentStatus } from "@/models/Payment";
import type { IPlayer } from "@/models/Player";
import type { IUser, UserRole } from "@/models/User";

export type {
  IUser,
  UserRole,
  IPlayer,
  IFeeStructure,
  IPayment,
  PaymentStatus,
  IFeeRecord,
  FeeRecordStatus,
  FeeRecordChargeType,
  INotification,
  NotificationType,
};

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total?: number;
  page?: number;
  limit?: number;
}
