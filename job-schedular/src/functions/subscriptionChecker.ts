import { app, InvocationContext, Timer } from "@azure/functions";
import { connectToDatabase } from "../db/connection";
import { subscriptionRenewalService } from "../services/subscriptionRenewal.service";
import { subscriptionExpiryService } from "../services/subscriptionExpiry.service";

export async function subscriptionChecker(_myTimer: Timer, context: InvocationContext): Promise<void> {
    await connectToDatabase();

    const [reminders, expired] = await Promise.all([
        subscriptionRenewalService.processRenewalReminders(),
        subscriptionExpiryService.processExpiredSubscriptions(),
    ]);

    context.log(`subscriptionChecker: sent ${reminders} renewal reminder(s), expired ${expired} subscription(s)`);

}

app.timer('subscriptionChecker', {
    schedule: '0 * * * * *',
    handler: subscriptionChecker
});
