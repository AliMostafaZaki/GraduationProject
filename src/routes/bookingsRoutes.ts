import express from 'express'
import {
  getBookings,
  paymobCheckoutSession
} from '../controllers/bookingsController'

const router = express.Router()

router.route('/').get(getBookings)

router.get('/paymob-session', paymobCheckoutSession)

export default router
