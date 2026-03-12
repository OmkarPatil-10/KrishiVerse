const express = require('express');
const router = express.Router();
const { sendSupportQuery } = require('../controllers/supportController');

// POST /api/support - Send a support query email
router.post('/', sendSupportQuery);

module.exports = router;
