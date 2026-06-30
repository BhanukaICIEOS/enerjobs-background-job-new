import mongoose, { Schema, Types } from 'mongoose';

export interface IUser {
    _id: Types.ObjectId;
    email: string;
    name: string;
    isActive: boolean;
}

const userSchema = new Schema<IUser>(
    {
        email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
        name:     { type: String, required: true, trim: true },
        isActive: { type: Boolean, required: true, default: true },
    },
    { collection: 'users', timestamps: true }
);

export const User = mongoose.model<IUser>('User', userSchema);
