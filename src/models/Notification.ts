import mongoose, { type Document, type Model, Schema } from "mongoose";

export type NotificationType =
  | "PAYMENT_CONFIRMATION"
  | "PAYMENT_REMINDER"
  | "ACCOUNT_NOTIFICATION";

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  type: NotificationType;
  message: string;
  sent: boolean;
  sentAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: [
        "PAYMENT_CONFIRMATION",
        "PAYMENT_REMINDER",
        "ACCOUNT_NOTIFICATION",
      ],
      required: true,
    },
    message: { type: String, required: true },
    sent: { type: Boolean, default: false },
    sentAt: { type: Date, default: null },
  },
  { timestamps: true },
);

NotificationSchema.index({ recipient: 1, sent: 1 });
NotificationSchema.index({ type: 1, sent: 1 });

export const Notification: Model<INotification> =
  mongoose.models.Notification ??
  mongoose.model<INotification>("Notification", NotificationSchema);
