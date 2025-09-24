import ApiLogs from '../models/ApiLogs.js';

const ApiLogsMiddleware = async (req, res, next) => {
    try {
        // Extract User-Agent header from the request
        const userAgent = req.get('User-Agent');

        // Check for Dart-based applications (e.g., Flutter)
        const isDartApp = /Dart/i.test(userAgent);

        // If it's a Dart application, handle separately, otherwise continue with regular checks
        let deviceType = 'Unknown';

        if (isDartApp) {
            // Dart-based requests (such as from a Flutter app) are detected
            // You can add additional checks, such as custom headers or query params to differentiate between Android and iOS
            deviceType = 'Dart/Flutter App';
        } else {
            // Regular check for Android/iOS based on User-Agent
            deviceType = /Android/i.test(userAgent) ? 'Android' : /iPhone|iPad|iPod/i.test(userAgent) ? 'iOS' : 'Unknown';
        }

        let ip = req.ip;

        // Check if the IP address is in IPv6-mapped IPv4 format (::ffff:xxx.xxx.xxx.xxx)
        if (ip.startsWith('::ffff:')) {
            // Extract the actual IPv4 address (remove the ::ffff: part)
            ip = ip.substring(7);
        }

        // Capture request details
        const logData = {
            ip,
            userAgent: userAgent,
            deviceType: deviceType,  // Store detected device type (Dart, Android, iOS, or Unknown)
            method: req.method,
            headers: req.headers,
            body: req.body,
            cookies: req.cookies,
            endpoint: req.originalUrl,
            statusCode: res.statusCode,
            timestamp: new Date(),
        };

        // Create a new log entry and save it to the database
        const newLog = new ApiLogs(logData);
        await newLog.save();

        // Call the next middleware or route handler
        next();
    } catch (error) {
        console.error('Error logging request:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

export default ApiLogsMiddleware;
