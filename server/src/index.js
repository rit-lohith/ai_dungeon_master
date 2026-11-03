require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimiter = require('./services/rateLimiter');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');

const npcRoutes = require('./routes/npc.routes');
const questRoutes = require('./routes/quest.routes');
const itemRoutes = require('./routes/item.routes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(rateLimiter);

// Routes
app.use('/npc', npcRoutes);
app.use('/api/npc', npcRoutes);
app.use('/api/quest', questRoutes);
app.use('/api/item', itemRoutes);

// Error Handling
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`AI Dungeon Master Server running on port ${PORT}`);
});
