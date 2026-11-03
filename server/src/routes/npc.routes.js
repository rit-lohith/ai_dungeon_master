const express = require('express');
const router = express.Router();
const npcController = require('../controllers/npc.controller');
const validateRequest = require('../middleware/validateRequest');

router.post('/dialogue', npcController.generateDialogue);

module.exports = router;
