import { Types } from 'mongoose';
import { CompanyRole } from '../enums/company-role.enum';
import { EmployerProfile } from '../models/employerProfile.model';
import { User } from '../models/user.model';

class EmployerProfileRepository {
    /**
     * Returns email addresses for all approved PRIMARY and SECONDARY employers
     * linked to the given company. Used to determine notification recipients.
     */
    async findApprovedEmailsForCompany(companyId: Types.ObjectId): Promise<string[]> {
        const employers = await EmployerProfile.find({
            companyId,
            isApproved: true,
            companyRole: { $in: [CompanyRole.PRIMARY, CompanyRole.SECONDARY] },
        }).lean();

        if (employers.length === 0) return [];

        const userIds = employers.map(e => e.userId);
        const users = await User.find(
            { _id: { $in: userIds }, isActive: true },
            { email: 1 }
        ).lean();

        return users.map(u => u.email);
    }
}

export const employerProfileRepository = new EmployerProfileRepository();
