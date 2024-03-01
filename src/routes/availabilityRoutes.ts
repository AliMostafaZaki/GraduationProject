import express from 'express'

import {
  setAvailability,
  getAvailability,
  checkAvailability
} from '../controllers/availabilityController'

const router = express.Router()

router.route('/').post(setAvailability)

router.route('/').get(getAvailability)

router.route('/check').get(checkAvailability)

export default router
