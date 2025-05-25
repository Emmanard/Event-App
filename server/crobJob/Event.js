const moment = require('moment');
const Event = require('../models/Event');


const CheckEventStatus = async () => {
    try {
        
        const currentDate = moment();
        
        let events = await Event.find({
            status: "Published", isDeleted: false
        })
        for (const event of events) {
            const eventDate = moment(event.date);
            
            if (eventDate.isBefore(currentDate)) { // this condition will check that weather arrival time passed or not. if passed then journey_completed=true
                event.status = "Closed";
                event.save();
            }

        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}
module.exports = CheckEventStatus;
