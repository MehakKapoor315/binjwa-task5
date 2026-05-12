const cron = require('node-cron');
const Attendance = require('../models/Attendance');

const initCronJobs = () => {
  // Run every hour to check for auto clock-out
  // Schedule: At minute 0 of every hour
  cron.schedule('0 * * * *', async () => {
    console.log('Running auto clock-out cron job...');
    try {
      const eightHoursAgo = new Date();
      eightHoursAgo.setHours(eightHoursAgo.getHours() - 8);

      // Find all records that have clockIn but no clockOut, and clockIn was more than 8 hours ago
      const pendingAttendance = await Attendance.find({
        clockOut: { $exists: false },
        clockIn: { $lte: eightHoursAgo }
      });

      if (pendingAttendance.length > 0) {
        console.log(`Auto clocking out ${pendingAttendance.length} users...`);
        
        for (const record of pendingAttendance) {
          // Set clockOut to 8 hours after clockIn (standard shift)
          const autoClockOutTime = new Date(record.clockIn);
          autoClockOutTime.setHours(autoClockOutTime.getHours() + 8);
          
          record.clockOut = autoClockOutTime;
          record.totalHours = 8.00;
          record.autoClockedOut = true; // Flag for tracking
          await record.save();
        }
      }
    } catch (err) {
      console.error('Error in auto clock-out cron job:', err);
    }
  });
};

module.exports = initCronJobs;
