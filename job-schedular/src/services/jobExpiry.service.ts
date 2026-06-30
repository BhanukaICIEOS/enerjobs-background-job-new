import mongoose from 'mongoose';
import { jobRepository } from '../repositories/job.repository';
import { queueService } from './queue.service';

class JobExpiryService {
    async processExpiringJobReminders(): Promise<number> {
        const jobs = await jobRepository.findActiveExpiringIn7Days();
        if (jobs.length === 0) return 0;

        for (const job of jobs) {
            await queueService.sendJobExpiryMessage({
                type: 'job_expiry_reminder',
                jobId:     (job._id as mongoose.Types.ObjectId).toString(),
                companyId: (job.companyId as mongoose.Types.ObjectId).toString(),
                jobTitle:  job.title,
                expiresAt: job.expirationDate!.toISOString(),
            });
            await jobRepository.markReminderSent(job._id as mongoose.Types.ObjectId);
        }

        return jobs.length;
    }

    async processExpiredJobs(): Promise<number> {
        const expiredJobs = await jobRepository.findActiveExpired();
        if (expiredJobs.length === 0) return 0;

        const ids = expiredJobs.map(job => job._id as mongoose.Types.ObjectId);
        const updatedCount = await jobRepository.bulkMarkExpired(ids);

        for (const job of expiredJobs) {
            await queueService.sendJobExpiryMessage({
                type: 'job_expired',
                jobId:     (job._id as mongoose.Types.ObjectId).toString(),
                companyId: (job.companyId as mongoose.Types.ObjectId).toString(),
                jobTitle:  job.title,
            });
        }

        return updatedCount;
    }
}

export const jobExpiryService = new JobExpiryService();
