import mongoose from 'mongoose';
import { jobRepository } from '../repositories/job.repository';
import { queueService } from './queue.service';

class RefreshCheckerService {
    async processRefreshableJobs(): Promise<number> {
        const jobs = await jobRepository.findJobsWithCooldownCleared();
        if (jobs.length === 0) return 0;

        for (const job of jobs) {
            await queueService.sendJobRefreshMessage({
                type: 'refresh_available',
                jobId:     (job._id as mongoose.Types.ObjectId).toString(),
                companyId: (job.companyId as mongoose.Types.ObjectId).toString(),
                jobTitle:  job.title,
            });
            await jobRepository.markRefreshNotificationSent(job._id as mongoose.Types.ObjectId);
        }

        return jobs.length;
    }
}

export const refreshCheckerService = new RefreshCheckerService();
