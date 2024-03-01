import availabilityRouter from './availabilityRoutes'
import bookingsRouter from './bookingsRoutes'

const mainRouter = (app: any) => {
  app.use('/api/v1/availability', availabilityRouter)
  app.use('/api/v1/bookings', bookingsRouter)
}

export default mainRouter
