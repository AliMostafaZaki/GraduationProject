import nodemailer from 'nodemailer'
import sendgridTransport from 'nodemailer-sendgrid-transport'
import pug from 'pug'
import { htmlToText } from 'html-to-text'

class Email {
  constructor(book) {
    this.firstName = book.name ? book.name.split(' ')[0] : ''
    this.email = book.email
    this.day = book.day
    this.timeslot = book.timeslot
    this.price = book.price
    this.to = book.email
    this.from = `Mentor Team <${process.env.EMAIL_FROM}>`
    this.url = book.url
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport(
        sendgridTransport({
          auth: {
            api_key: process.env.SENDGRID_PASSWORD
          }
        })
      )
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: true,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    })
  }

  async send(template, subject) {
    const html = pug.renderFile(`${__dirname}/emailPug/${template}.pug`, {
      firstName: this.firstName,
      name: this.firstName,
      email: this.email,
      day: this.day,
      timeslot: this.timeslot,
      price: this.price,
      subject
    })

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html)
    }

    await this.newTransport().sendMail(mailOptions)
  }

  async sendBookConfirm() {
    await this.send('bookConfirm', 'Session Booked Successfully!')
  }

  async sendSessionReminder() {
    const html = pug.renderFile(`${__dirname}/emailPug/sessionReminder.pug`, {
      url: this.url,
      subject: 'Your Session Will Start in 1 Hour! See Link Below!'
    })

    console.log(this)

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: 'Your Session Will Start in 1 Hour! See Link Below!',
      html,
      text: htmlToText(html)
    }

    await this.newTransport().sendMail(mailOptions)
  }
}

export default Email
