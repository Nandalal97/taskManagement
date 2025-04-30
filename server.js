require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const routes = require('./routes/authRoute');
const taskRoute = require('./routes/taskRoutes');
const connectDB = require('./config/config');

const app = express();
app.use(express.json());
connectDB();

// Trust proxy (useful for Heroku/NGINX)
app.set('trust proxy', 1);

// Helmet for HTTP headers
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));

// CORS config
app.use(cors({
  origin: ['http://localhost:8000','http://localhost:5173', 'http://localhost:5174'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: {
    status: 429,
    message: 'Too many requests. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const loginLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 5,
  message: {
    status: 429,
    message: 'Too many login attempts. Please try again after 24 hours.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply limiters
app.use((req, res, next) => {
  if (req.path === '/api/login') return next();
  generalLimiter(req, res, next);
});
app.use('/api/login', loginLimiter, (req,res)=>{
  res.send('login attemt')
});

// Body parsers with size limits
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Sanitize inputs
// app.use(mongoSanitize());
// app.use(xss());


// Disable x-powered-by
app.disable('x-powered-by');

// Routes
app.get('/', (req,res)=>{
  res.send('this Is Home Page')
});
app.use('/api/v1/auth', routes);
app.use('/api/v1/web', taskRoute);


// Global error handler (after all)
app.use((err, req, res, next) => {
  console.error(' Server Error:', err.stack);
  res.status(500).json({
    status: 500,
    message: 'Internal Server Error. Please try again later.'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(` Server running on ${PORT}`);
});
