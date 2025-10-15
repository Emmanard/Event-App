const express = require('express');
const cors = require("cors");
const bodyParser = require('body-parser');

if (process.env.NODE_ENV !== 'production') {
    require("dotenv").config({ path: "./config/.env" });
}

const cloudinaryRoutes = require('./routes/cloudinary');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorHandlrer');
const CheckEventStatus = require('./crobJob/Event');
const authRoutes = require('./routes/user');
const eventRoutes = require('./routes/eventRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const port = process.env.PORT || 5000;
connectDB();



const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));
app.use(express.static("public"));


app.get('/api/health', (req, res) => {
  res.send('✅ EventWave backend is live on Vercel!');
});

// ✅ API key middleware
app.use(async (req, res, next) => {
    const apikey =
        req.headers.apikey ||
        req.headers['api-key'] ||
        req.headers['x-api-key'] ||
        req.headers.authorization?.replace('Bearer ', '');

    const expectedApiKey = process.env.apikey;

    if (!apikey) {
        return res.status(401).json({ success: false, message: 'API key is required' });
    }

    if (String(apikey).trim() === String(expectedApiKey).trim()) {
        return next();
    }

    return res.status(401).json({ success: false, message: 'Invalid API key' });
});

// ✅ Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/event', eventRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/cloudinary', cloudinaryRoutes);

// ✅ Manual trigger for event status check (for Vercel)
app.get('/api/v1/check-events', async (req, res) => {
    console.log("🔄 Manual event status check triggered");
    await CheckEventStatus(req, res);
});

// ✅ Root
app.use('/', (req, res) => {
    res.status(200).json({ msg: "Hello from Event API!" });
});

app.use(errorHandler);

// 🚀 For Vercel, export app instead of listening
if (process.env.VERCEL) {
    module.exports = app;
} else {
    app.listen(port, () => console.log(`Server running on port ${port}`));
}
