const cron = require("node-cron");
const { subDays, startOfDay, endOfDay } = require("date-fns");
const userConnectionRequest = require("../models/connectionRequest");
const sendEmail = require("../utils/sendEmail");

// This job will run at 8 AM in the morning everyday
cron.schedule("8 18 * * *", async () => {
  // Send emails to all people who got requests the previous day
  try {
    const yesterday = subDays(new Date(), 0);
    const yesterdayStart = startOfDay(yesterday);
    const yesterdayEnd = endOfDay(yesterday);

    const pendingRequestsForYesterday = await userConnectionRequest
      .find({
        status: "interested",
        createdAt: {
          $gte: yesterdayStart,
          $lte: yesterdayEnd,
        },
      })
      .populate("fromUserId toUserId");

    const listOfEmails = [
      ...new Set(pendingRequestsForYesterday.map((req) => req.toUserId.email)),
    ];

    for (const email of listOfEmails) {
      // Send Emails
      try {
        const res = await sendEmail.run(
          "A new friend request pending from " + email,
          "A new friend request is pending, please login to devTinder app and accept or reject the request. Thankyou!",
        );
        console.log(res);
      } catch (error) {
        console.error(error);
      }
    }
  } catch (error) {
    console.error(error);
  }
});
