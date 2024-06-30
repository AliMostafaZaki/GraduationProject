// import cron from 'node-cron'
import Bookings from '../models/bookingModel'
import Availability from '../models/availabilityModel'
import { NextFunction, Request, Response } from 'express' // Import types for request and response objects
import catchAsync from '../utils/catchAsync.js' // Import catchAsync function
import AppError from '../utils/appError'
import Email from '../utils/email'
import Schedule from '../utils/schedule'

export const getBookings = catchAsync(async (req: Request, res: Response) => {
  // Get ID Of Registered Mentor
  const { userID } = (req as any).body

  await Bookings.find(
    {
      $or: [{ mentorID: userID }, { menteeID: userID }]
    },
    { day: 1, timeslot: 1, menteeID: 1, mentorID: 1, _id: 0 }
  )
    .lean()
    .exec()
    .then((bookings) =>
      bookings
        ? res.status(200).json({ status: 'success', data: bookings })
        : res.status(404).json({
            code: 404,
            message: "User doesn't have bookings yet!"
          })
    )
})

export const paymobCheckoutSession = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Get Session Details
    const { mentorID, menteeID, day, timeslot, mentorEmail, menteeEmail } = (
      req as any
    ).body

    if (
      !mentorID ||
      !menteeID ||
      !day ||
      !timeslot ||
      !mentorEmail ||
      !menteeEmail
    )
      return next(
        new AppError(
          `mentorID, menteeID, day, timeslot, mentorEmail and menteeEmail Must be Included!`,
          404
        )
      )

    console.log(mentorID, menteeID, day, timeslot, mentorEmail, menteeEmail)

    // 1) Get Session Price depend on mentorID
    const { sessionPrice } = await Availability.findOne({ mentorID: mentorID })

    // 2) Create paymob checkout session
    // ## 1) Authentication Request
    const apiKeyObj = { api_key: process.env.PAYMOB_API_KEY }

    const tokenRequest = await fetch(process.env.PAYMOB_TOKENS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apiKeyObj)
    })

    const { token } = await tokenRequest.json()
    if (!token) return next(new AppError(`Authentication Request Failed!`, 404))

    // ## 2) Order Registration API
    const orderObj = {
      auth_token: token,
      delivery_needed: 'false',
      amount_cents: sessionPrice * 100,
      currency: 'EGP',
      items: [
        {
          name: `${mentorID}#${menteeID}#${day}#${timeslot}#${mentorEmail}#${menteeEmail}`,
          amount_cents: sessionPrice * 100,
          description: 'Mentorship Session',
          quantity: 1
        }
      ]
    }

    const orderRequest = await fetch(process.env.PAYMOB_ORDERS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderObj)
    })

    const { id } = await orderRequest.json()
    if (!id) return next(new AppError(`Order Registration Failed!`, 404))

    // ## 3) Payment Key Request
    const paymentKeyObj = {
      auth_token: token,
      amount_cents: sessionPrice * 100,
      expiration: 3600,
      order_id: id,
      billing_data: {
        email: 'ali.mostafa.zaki@gmail.com',
        first_name: 'Ali',
        last_name: 'Zaki',
        phone_number: '+201030044323',
        street: 'NA',
        postal_code: 'NA',
        city: 'NA',
        country: 'EG',
        state: 'NA',
        shipping_method: 'NA',
        apartment: 'NA',
        floor: 'NA',
        building: 'NA'
      },
      currency: 'EGP',
      integration_id: process.env.INTEGRATION_ID
    }

    const paymentKeyRequest = await fetch(process.env.PAYMOB_KEYS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentKeyObj)
    })

    const response = await paymentKeyRequest.json()

    const paymentKeyToken = response.token
    if (!paymentKeyToken)
      return next(new AppError(`Create Payment Key Failed!`, 404))

    // Card Payment
    res.status(200).json({
      status: 'success',
      payURL: `https://accept.paymob.com/api/acceptance/iframes/803305?payment_token=${paymentKeyToken}`
    })
  }
)

export const paymobWebhookCheckout = catchAsync(
  async (req: Request, res: Response) => {
    // Object From Returned POST Request From Paymob Server
    const bufferData = req.body // Paymob return body that contain obj as buffer
    const stringData = bufferData.toString('utf-8') // Convert Buffer to string using appropriate encoding (utf-8 in this case)
    const parsedData = JSON.parse(stringData) // Parse the JSON string back to a JavaScript object
    const object = parsedData.obj // Parse the string as JSON

    if (object.success) {
      // Session Data from Paymob Req
      const details = object.order.items[0].name.split('#')

      const tempDate = new Date(`${details[2]} ${details[3]}`)
      tempDate.setHours(tempDate.getHours() - 1)

      // Create Booking
      await Bookings.create({
        mentorID: details[0],
        menteeID: details[1],
        day: details[2],
        timeslot: details[3],
        meetingTime: tempDate,
        price: object.amount_cents / 100,
        mentorEmail: details[4],
        menteeEmail: details[5]
      })

      // Send Email To Mentor
      const mentorMail = {
        name: details[0],
        email: details[4],
        day: details[2],
        timeslot: details[3],
        price: object.amount_cents / 100
      }
      await new Email(mentorMail).sendBookConfirm()

      // Send Email To Mentee
      const menteeMail = {
        name: details[1],
        email: details[5],
        day: details[2],
        timeslot: details[3],
        price: object.amount_cents / 100
      }
      await new Email(menteeMail).sendBookConfirm()

      // Call Confirm Notification Endpoint FOR Mentor
      await fetch(`${process.env.RADWAN_URL}/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverID: details[0],
          message: `Session Booked Successfully!`
        })
      })

      // Call Confirm Notification Endpoint FOR Mentee
      await fetch(`${process.env.RADWAN_URL}/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverID: details[1],
          message: `Session Booked Successfully!`
        })
      })

      // Stand at Queue
      Schedule()

      // Chat
      await fetch(`${process.env.RADWAN_URL}/createChat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentorID: details[0],
          menteeID: details[1]
        })
      })

      res.status(200).json({ received: true })
    } else {
      res.status(404).json({ received: false })
    }
  }
)
