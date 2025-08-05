const express = require('express');
const cors = require("cors");
const bodyParser = require('body-parser');
require("dotenv").config({ path: "./config/.env" });
const cloudinaryRoutes = require('./routes/cloudinary');
// database
const connectDB = require('./config/db');
// middleware
const errorHandler = require('./middlewares/errorHandlrer');
// cron jobs
var cron = require('node-cron');
const CheckEventStatus = require('./crobJob/Event');
// routes
const authRoutes = require('./routes/user');
const eventRoutes = require('./routes/eventRoutes');

// port
const port = process.env.PORT || 5000;


connectDB();
const app = express();
app.use(cors());
// app.use(express.json());
app.use(express.json({ limit: '5mb' }));
// app.use(express.urlencoded({ extended: false }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));
app.use(express.static("public"));


app.use(async (req, res, next) => {
    // More flexible header reading - checks multiple common formats
    const apikey = req.headers.apikey || 
                   req.headers['api-key'] || 
                   req.headers['x-api-key'] ||
                   req.headers.authorization?.replace('Bearer ', '');
    
    const expectedApiKey = process.env.apikey;
         
    console.log('=== API Key Debug ===');
    console.log('Request URL:', req.url);
    console.log('Request Method:', req.method);
    console.log('Received API key:', apikey);
    console.log('Expected API key:', expectedApiKey);
    console.log('API key types:', typeof apikey, typeof expectedApiKey);
    console.log('API keys match (strict):', apikey === expectedApiKey);
    console.log('API keys match (loose):', apikey == expectedApiKey);
    console.log('==================');
         
    // Check if API key is provided
    if (!apikey) {
        console.log('❌ No API key provided');
        return res.status(401).json({ success: false, message: 'API key is required' });
    }
         
    // Convert both to strings and trim whitespace for comparison
    const normalizedApiKey = String(apikey).trim();
    const normalizedExpectedKey = String(expectedApiKey).trim();
         
    if (normalizedApiKey === normalizedExpectedKey) {
        console.log('✅ API key validation passed');
        return next();
    }
         
    console.log('❌ API key validation failed');
    console.log('Normalized received:', normalizedApiKey);
    console.log('Normalized expected:', normalizedExpectedKey);
         
    // Return 401 instead of 404 for unauthorized access
    return res.status(401).json({ success: false, message: 'Invalid API key' });
});


// node cron
cron.schedule('* * * * *', CheckEventStatus);


app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/event', eventRoutes);
app.use('/api/cloudinary', cloudinaryRoutes);
app.use('/', (req, res) => {
    res.status(200).json({ msg: "helloo" })
});

app.use(errorHandler);



app.listen(port, () => console.log(`server is listening on port ${port}`))
