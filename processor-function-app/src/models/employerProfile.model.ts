import mongoose, { Schema, Types } from 'mongoose';
import { CompanyRole } from '../enums/company-role.enum';

export interface IEmployerProfile {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    companyId?: Types.ObjectId;
    companyRole?: CompanyRole;
    isApproved: boolean;
}

const employerProfileSchema = new Schema<IEmployerProfile>(
    {
        userId:      { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        companyId:   { type: Schema.Types.ObjectId, ref: 'CompanyProfile', default: null, index: true },
        companyRole: { type: String, enum: Object.values(CompanyRole), default: null },
        isApproved:  { type: Boolean, required: true, default: false },
    },
    { collection: 'employer_profiles', timestamps: true }
);

export const EmployerProfile = mongoose.model<IEmployerProfile>('EmployerProfile', employerProfileSchema);
