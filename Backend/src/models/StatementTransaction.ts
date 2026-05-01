import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IStatementTransaction extends Document {
  statementId?: Types.ObjectId;
  accountNo: string;
  bankName: string;
  transactionDate: Date;
  valueDate: Date;
  refNo: string;
  description: string;
  debit: number | null;
  credit: number | null;
  balance: number;
  status: 'RECONCILED' | 'UNRECONCILED';
  uploadedBy: string;
}

const StatementTransactionSchema: Schema = new Schema(
  {
    statementId: { type: Schema.Types.ObjectId, ref: 'BankStatement' },
    accountNo: { type: String, required: true },
    bankName: { type: String, required: true },
    transactionDate: { type: Date, required: true },
    valueDate: { type: Date, required: true },
    refNo: { type: String, default: '' },
    description: { type: String, default: '' },
    debit: { type: Number, default: null },
    credit: { type: Number, default: null },
    balance: { type: Number, required: true },
    status: {
      type: String,
      enum: ['RECONCILED', 'UNRECONCILED'],
      default: 'UNRECONCILED',
    },
    uploadedBy: { type: String, default: 'System User' },
  },
  { timestamps: true }
);

export default mongoose.model<IStatementTransaction>('StatementTransaction', StatementTransactionSchema);
