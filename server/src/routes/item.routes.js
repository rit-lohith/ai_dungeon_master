const express = require('express');
const router = express.Router();
const itemController = require('../controllers/item.controller');
const validateRequest = require('../middleware/validateRequest');

router.post('/describe', validateRequest(['itemName', 'rarity']), itemController.describeItem);

module.exports = router;
