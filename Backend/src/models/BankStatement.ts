import mongoose, { Schema, Document } from 'mongoose';

export interface IBankStatement extends Document {
  name: string;
  bankName: string;
  accountNo: string;
  dateFrom: Date;
  dateTo: Date;
  uploadedBy: string;
  recordCount: number;
}

const BankStatementSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    bankName: { type: String, required: true },
    accountNo: { type: String, required: true },
    dateFrom: { type: Date, required: true },
    dateTo: { type: Date, required: true },
    uploadedBy: { type: String, required: true },
    recordCount: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IBankStatement>('BankStatement', BankStatementSchema);
