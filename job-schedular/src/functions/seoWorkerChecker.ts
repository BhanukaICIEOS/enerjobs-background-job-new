import { app, InvocationContext, Timer } from "@azure/functions";
import { connectToDatabase } from "../db/connection";

export async function seoWorkerChecker(_myTimer: Timer, context: InvocationContext): Promise<void> {
    await connectToDatabase();

    // const [reminders, expired] = await Promise.all([
    //     subscriptionRenewalService.processRenewalReminders(),
    //     subscriptionExpiryService.processExpiredSubscriptions(),
    // ]);

    // context.log(`subscriptionChecker: sent ${reminders} renewal reminder(s), expired ${expired} subscription(s)`);

}

app.timer('subscriptionChecker', {
    schedule: '0 * * * * *',
    handler: seoWorkerChecker
});
