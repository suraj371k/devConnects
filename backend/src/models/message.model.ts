import { Schema, model } from "mongoose";

interface IMessage {
  sender: Schema.Types.ObjectId;
  receiver: Schema.Types.ObjectId;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

const Message = model<IMessage>("Message", messageSchema);

export default Message;