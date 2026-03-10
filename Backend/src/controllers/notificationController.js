const Notification = require('../models/Notification');

// @desc    Get all notifications for logged-in user
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
    try {
        const userId = req.userId || req.user?._id || req.user?.id;
        const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
        
        const unreadCount = await Notification.countDocuments({ userId, isRead: false });

        res.json({
            success: true,
            notifications,
            unreadCount
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Mark a single notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
    try {
        const userId = req.userId || req.user?._id || req.user?.id;
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        res.json({ success: true, notification });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Mark all notifications as read for logged-in user
// @route   PATCH /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
    try {
        const userId = req.userId || req.user?._id || req.user?.id;
        await Notification.updateMany(
            { userId, isRead: false },
            { isRead: true }
        );

        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead
};
