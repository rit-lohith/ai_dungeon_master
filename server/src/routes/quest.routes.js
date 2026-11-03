const express = require('express');
const router = express.Router();
const questController = require('../controllers/quest.controller');
const validateRequest = require('../middleware/validateRequest');

router.post('/generate', validateRequest(['level']), questController.generateQuest);

module.exports = router;
