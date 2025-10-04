import mongoose, { Schema, Types } from "mongoose";

interface INotification {
  from: Types.ObjectId;
  to: Types.ObjectId;
  type: "comment" | "follow" | "like";
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    from: { type: Schema.Types.ObjectId, ref: "User", required: true },
    to: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["comment", "follow", "like"], required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification = mongoose.model<INotification>("Notification", notificationSchema);

export default Notification;