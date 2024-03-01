// Run In Terminal Directly
// cd Main\Projects\GraduationProject
// node server.js

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import app from './app'

mongoose.set('strictQuery', false)

process.on('uncaughtException', (err: Error) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...')
  console.log(err.name, err.message)
  process.exit(1)
})

dotenv.config({ path: './config.env' })

const DB: string = process.env.DATABASE!.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD!
)

mongoose.connect(DB).then(() => console.log('connected to database'))

const port: number = parseInt(process.env.PORT!) || 3000
const server = app.listen(port, () => {
  console.log(`listening on port ${port}...`)
})

process.on('unhandledRejection', (err: Error) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...')
  console.log(err.name, err.message)
  server.close(() => {
    process.exit(1)
  })
})
