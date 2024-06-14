import path from 'path'
import express from 'express'
import morgan from 'morgan'
// import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import mongoSanitize from 'express-mongo-sanitize'
import hpp from 'hpp'
import cookieParser from 'cookie-parser'
import compression from 'compression'
import cors from 'cors'

import AppError from './utils/appError'
import globalErrorHandler from './controllers/errorController'
import mainRouter from './routes/index'
import { paymobWebhookCheckout } from './controllers/bookingsController'

// Start express app
const app = express()

app.enable('trust proxy')

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

// 1) GLOBAL MIDDLEWARES
// Implement CORS
app.use(
  cors({
    origin: `${process.env.HOST_URL}`,
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH']
  })
)
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', `${process.env.HOST_URL}`)

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.send()
})

// Serving static files
app.use(express.static(path.join(__dirname, 'public')))

// Set security HTTP headers
app.use(helmet())

// Development Console Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Limit requests from same API
// const limiter = rateLimit({
//   max: 100,
//   windowMs: 60 * 60 * 1000,
//   message: 'Too many requests from this IP, please try again in an hour!'
// })
// app.use('/api', limiter)

// PAYMOB Checkout webhook
app.post(
  '/paymob-webhook',
  express.raw({ type: 'application/json' }),
  paymobWebhookCheckout
)

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))
app.use(cookieParser())

// Data sanitization against NoSQL query injection
app.use(mongoSanitize())

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
)

// compress all responses
app.use(compression())

// 3) ROUTES
mainRouter(app)

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404))
})

app.use(globalErrorHandler)

export default app
