import mongoose, { Schema, Document } from 'mongoose';

export interface ICheque extends Document {
  issueDate: Date;
  chequeNo: string;
  description: string;
  amount: number;
  status: 'CASHED' | 'UNCASHED' | 'UNRECONCILED';
}

const ChequeSchema: Schema = new Schema(
  {
    issueDate: { type: Date, required: true },
    chequeNo: { type: String, required: true, index: true },
    description: { type: String, default: '' },
    amount: { type: Number, required: true },
    status: { 
      type: String, 
      enum: ['CASHED', 'UNCASHED', 'UNRECONCILED'], 
      default: 'UNCASHED' 
    },
  },
  { timestamps: true }
);

export default mongoose.model<ICheque>('Cheque', ChequeSchema);
