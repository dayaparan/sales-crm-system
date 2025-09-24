import { PrismaClient } from '@prisma/client';
import BaseController from '../BaseController.js';
import { startOfDay, endOfDay } from 'date-fns';

const prisma = new PrismaClient();

class AttendanceController extends BaseController {
    constructor() {
        super();
        this.model = prisma.attendance;
        this.insert = this.insert.bind(this);
        this.get = this.get.bind(this);
    }

    // Haversine formula to calculate distance between two points in meters
    calculateDistance(lat1, lon1, lat2, lon2) {
        const toRad = (value) => (value * Math.PI) / 180;
        const R = 6371000; // Earth's radius in meters

        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c; // Distance in meters
        return distance;
    }

    async insert(req, res, next) {
        try {
            const { longitude, latitude } = req.body;
            const { id: userId } = req.user || {};

            // Validate required fields
            if (!longitude || !latitude) {
                return this.handleError(next, 'Longitude and Latitude are required', 400);
            }

            // Validate coordinate format
            const lon = parseFloat(longitude);
            const lat = parseFloat(latitude);
            if (isNaN(lon) || isNaN(lat) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
                return this.handleError(next, 'Invalid longitude or latitude values', 400);
            }

            // Get base coordinates from environment variables
            const baseLongitude = parseFloat(process.env.BASE_LONGITUDE);
            const baseLatitude = parseFloat(process.env.BASE_LATITUDE);
            if (!baseLongitude || !baseLatitude) {
                return this.handleError(next, 'Base coordinates not configured', 500);
            }

            // Calculate distance
            const distance = this.calculateDistance(lat, lon, baseLatitude, baseLongitude);

            // Check if user is within 500 meters
            if (distance > 500) {
                return this.handleError(next, 'You are not within 500 meters of the base location', 403);
            }

            // Get current date in PKT (Pakistan Standard Time)
            const now = new Date();
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

            // Check if attendance is already marked for today
            const existingAttendance = await this.model.findFirst({
                where: {
                    userId,
                    markedAt: {
                        gte: startOfDay,
                        lt: endOfDay,
                    },
                },
            });

            if (existingAttendance) {
                return this.handleError(next, 'Attendance already marked for today', 409);
            }

            // Mark attendance
            const attendance = await this.model.create({
                data: {
                    userId,
                    longitude: lon,
                    latitude: lat,
                    markedAt: now,
                },
            });

            return res.status(201).json({
                success: true,
                message: 'Attendance marked successfully',
                attendance: {
                    id: attendance.id,
                    userId: attendance.userId,
                    longitude: attendance.longitude,
                    latitude: attendance.latitude,
                    markedAt: attendance.markedAt,
                },
            });
        } catch (error) {
            return this.handleError(next, error.message || 'An unexpected error occurred', 500);
        }
    }

    async get(req, res, next) {
        try {
            let { isDeleted, page = 1, limit = 10, startDate, endDate } = req.query;
            const { id: userId } = req.user || {};
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const skipNum = (pageNum - 1) * limitNum;

            // Validate pagination
            if (isNaN(pageNum) || pageNum < 1) {
                return this.handleError(next, 'Invalid page number', 400);
            }
            if (isNaN(limitNum) || limitNum < 1) {
                return this.handleError(next, 'Invalid limit value', 400);
            }

            // Date filter defaults to today
            let dateFilter = {};
            if (startDate && endDate) {
                dateFilter.markedAt = {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                };
            } else {
                dateFilter.markedAt = {
                    gte: startOfDay(new Date()),
                    lte: endOfDay(new Date())
                };
            }

            // Build filter
            const filters = { userId, ...dateFilter };

            // Count total items
            const totalItems = await this.model.count({
                where: filters
            });

            // Fetch attendances
            const attendances = await this.model.findMany({
                where: filters,
                select: {
                    id: true,
                    longitude: true,
                    latitude: true,
                    markedAt: true,
                    createdAt: true,
                    updatedAt: true,
                    user: {
                        select: { id: true, name: true, email: true, profile: true }
                    }
                },
                orderBy: { markedAt: 'desc' },
                skip: skipNum,
                take: limitNum,
            });

            return res.status(200).json({
                success: true,
                attendances: attendances.map((attendance) => ({
                    ...attendance,
                    _id: attendance.id
                })),
                pagination: {
                    currentPage: pageNum,
                    pageSize: limitNum,
                    totalItems,
                    totalPages: Math.ceil(totalItems / limitNum),
                },
            });

        } catch (error) {
            return this.handleError(next, error.message || 'An unexpected error occurred', 500);
        }
    }
}

export default new AttendanceController();