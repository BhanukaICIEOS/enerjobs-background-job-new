import { app, InvocationContext, Timer } from "@azure/functions";
import { connectToDatabase } from "../db/connection";
import { promotionExpiryService } from "../services/promotionExpiry.service";

export async function promotionChecker(_myTimer: Timer, context: InvocationContext): Promise<void> {
    await connectToDatabase();

    const [reminders, expired] = await Promise.all([
        promotionExpiryService.processExpiringPromotionReminders(),
        promotionExpiryService.processExpiredPromotions(),
    ]);

    context.log(`promotionChecker: sent ${reminders} expiry reminder(s), marked ${expired} promotion(s) as expired`);
}

app.timer('promotionChecker', {
    schedule: '0 * * * * *', // TEMP: revert to '0 0 0 * * *'
    handler: promotionChecker
});
