const moment = require('moment');
const Event = require('../models/Event');

// ✅ Works for both internal calls and HTTP triggers
const CheckEventStatus = async (req, res) => {
  try {
    const currentDate = moment();
    const events = await Event.find({ status: "Published", isDeleted: false });

    for (const event of events) {
      const eventDate = moment(event.date);

      // If the event date has passed, mark it as "Closed"
      if (eventDate.isBefore(currentDate)) {
        event.status = "Closed";
        await event.save();
      }
    }

    console.log("✅ Event status check completed at:", currentDate.format());

    // If triggered as HTTP route, send a JSON response
    if (res) {
      return res.status(200).json({
        success: true,
        message: "Event statuses checked and updated successfully.",
      });
    }

    return true; // if run internally (not as HTTP)
  } catch (error) {
    console.error("❌ Error in CheckEventStatus:", error);

    if (res) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    return false;
  }
};

module.exports = CheckEventStatus;
