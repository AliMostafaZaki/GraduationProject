import express from 'express'

import {
  setAvailability,
  getAvailability,
  checkAvailability
} from '../controllers/availabilityController'

const router = express.Router()

router.route('/set').post(setAvailability)

router.route('/get').post(getAvailability)

router.route('/check').post(checkAvailability)

export default router
