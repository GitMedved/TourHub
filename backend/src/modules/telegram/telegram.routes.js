const express = require('express');
const { telegramWebhook } = require('./telegram.controller');

const router = express.Router();

router.post('/webhook', telegramWebhook);

module.exports = router;
