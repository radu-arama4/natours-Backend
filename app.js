const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();

// 1) MIDDLEWARES

app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 3,
  windowMs: 60*60*1000,
  message: 'Too many request from this ip'
})

app.use('/api', limiter);

app.use(express.json({limit: '10kb'}));

app.use(mongoSanitize());

app.use(xss());

app.use(hpp());

app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRoutes);

app.all('*', (req, res, next) => {  
  next(new AppError(`Can't find ${req.originalUrl} on the server!`,404));  
})

app.use(globalErrorHandler);

module.exports = app;
