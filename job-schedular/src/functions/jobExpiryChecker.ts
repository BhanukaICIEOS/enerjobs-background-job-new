import { app, InvocationContext, Timer } from "@azure/functions";
import { connectToDatabase } from "../db/connection";
import { jobExpiryService } from "../services/jobExpiry.service";

export async function jobExpiryChecker(_myTimer: Timer, context: InvocationContext): Promise<void> {
    await connectToDatabase();

    const [reminders, expired] = await Promise.all([
        jobExpiryService.processExpiringJobReminders(),
        jobExpiryService.processExpiredJobs(),
    ]);

    context.log(`jobExpiryChecker: sent ${reminders} expiry reminder(s), marked ${expired} job(s) as expired`);
}

app.timer('jobExpiryChecker', {
    schedule: '0 * * * * *', // TEMP: every minute for testing — revert to '0 0 0 * * *'
    handler: jobExpiryChecker
});
