const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['success', 'warning', 'info', 'error'],
        default: 'info'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    metadata: {
        contractId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract' },
        link: { type: String }
    }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
