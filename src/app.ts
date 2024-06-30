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
import * as dotenv from 'dotenv'
dotenv.config()

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
const corsOptions = {
  origin: [
    `${process.env.HOST_URL}`,
    'http://localhost:5500',
    'https://mentor.my.to'
  ],
  methods: ['GET', 'POST', 'DELETE', 'PATCH', 'PUT'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}

app.use(cors(corsOptions))

app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin)
  res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE,PATCH,PUT')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.header('Access-Control-Allow-Credentials', 'true')
  res.sendStatus(200)
})

// app.options('*', cors(corsOptions))

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
// app.use(express.json({ limit: '1000kb' }))
// app.use(express.urlencoded({ extended: true, limit: '1000kb' }))
app.use(cookieParser())

// Data sanitization against NoSQL query injection
app.use(mongoSanitize())

// Prevent parameter pollution
app.use(hpp())

// compress all responses
app.use(compression())

// 3) ROUTES
mainRouter(app)

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404))
})

app.use(globalErrorHandler)

export default app
