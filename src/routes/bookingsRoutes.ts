import express from 'express'
import {
  getBookings,
  paymobCheckoutSession
} from '../controllers/bookingsController'

const router = express.Router()

router.route('/').post(getBookings)

router.post('/paymob-session', paymobCheckoutSession)

export default router
