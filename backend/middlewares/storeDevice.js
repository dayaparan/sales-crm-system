import User from '../models/User.js';

const storeDeviceInfo = async (req, res, next) => {
    try {
        // Extract device information from request headers
        const platform = req.headers.platform;
        const brand = req.headers.brand;
        const hardware = req.headers.hardware;
        const manufacturer = req.headers.manufacturer;
        const model = req.headers.model;
        const id = req.headers.id;
        const versionSDK = req.headers.versionsdk;
        const versionRelease = req.headers.versionrelease;
        const user = req.user;

        // Check if the device already exists by comparing id
        const deviceExists = user.devices.some(device => device.id === id);

        if (!deviceExists) {
            // If device doesn't exist, create a new device object
            const newDevice = {
                platform,
                brand,
                hardware,
                manufacturer,
                model,
                id,
                versionSDK,
                versionRelease,
            };

            // Add the new device to the user's devices array
            user.devices.push(newDevice);

            // Save the updated user document
            await user.save();
        }

        next();
    
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error.' });
    }
};

export default storeDeviceInfo;
