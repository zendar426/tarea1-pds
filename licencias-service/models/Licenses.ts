import mongoose, { Schema, Document } from 'mongoose';

export interface ILicense extends Document {
  folio: string;
  patientId: string;
  doctorId: string;
  diagnosis: string;
  startDate: Date;
  days: number;
  status: 'issued' | 'expired' | 'cancelled';
  createdAt: Date;
}

const LicenseSchema = new Schema<ILicense>({
  folio: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  patientId: {
    type: String,
    required: true,
    index: true
  },
  doctorId: {
    type: String,
    required: true
  },
  diagnosis: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  days: {
    type: Number,
    required: true,
    min: [1, 'Days must be greater than 0']
  },
  status: {
    type: String,
    enum: ['issued', 'expired', 'cancelled'],
    default: 'issued'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

LicenseSchema.index({ folio: 1 });
LicenseSchema.index({ patientId: 1, createdAt: -1 });

export const License = mongoose.model<ILicense>('License', LicenseSchema);