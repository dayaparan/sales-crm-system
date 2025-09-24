import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const isUser = async (req, res, next) => {
  try {
    // Extract email from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: 'No email provided in header, authorization denied' });
    }

    const email = authHeader.trim().toLowerCase();

    // Validate email format (basic check)
    if (!email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Invalid email format in header' });
    }

    // Fetch user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        profile: true,
        role: true,
        status: true,
        branchId: true,
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
            country: true,
            city: true,
            address: true,
            phone: true,
            email: true,
            status: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(403).json({ success: false, message: 'Access denied. User not found.' });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication',
      error: error.message,
    });
  } finally {
    await prisma.$disconnect();
  }
};

export default isUser;
