import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IReconciliationRecord extends Document {
  chequeId: Types.ObjectId;
  transactionId: Types.ObjectId;
  reconciledBy: string;
  reconciledAt: Date;
  matchType: 'MANUAL' | 'AUTO';
  matchedFields: string[];
}

const ReconciliationRecordSchema: Schema = new Schema(
  {
    chequeId: { type: Schema.Types.ObjectId, ref: 'Cheque', required: true },
    transactionId: { type: Schema.Types.ObjectId, ref: 'StatementTransaction', required: true },
    reconciledBy: { type: String, required: true, default: 'System' },
    reconciledAt: { type: Date, required: true, default: Date.now },
    matchType: {
      type: String,
      enum: ['MANUAL', 'AUTO'],
      required: true,
    },
    matchedFields: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model<IReconciliationRecord>('ReconciliationRecord', ReconciliationRecordSchema);
