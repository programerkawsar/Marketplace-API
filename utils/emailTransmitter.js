const nodemailer = require('nodemailer')
const htmlToText = require('html-to-text')

// Email templates
const passwordResetEmailTemplate = require('../email-templates/passwordReset')
const welcomeEmailTemplate = require('../email-templates/welcomeEmail')
const publicationEmailTemplate = require('../email-templates/publicationEmail')
const rejectedProductTemplate = require('../email-templates/rejectedProductEmail')
const payoutEmailTemplate = require('../email-templates/payoutEmail')
const notificationEmailTemplate = require('../email-templates/notificationEmail')

class EmailTransmitter {
    constructor(user, url) {
        this.to = user.email
        this.name = user.firstName
        this.url = url
        this.from = `${process.env.APP_NAME} <${process.env.EMAIL_FROM}>`
    }

    // Create nodemailer email transport
    transporter() {
        // Production mode
        if (process.env.NODE_ENV === 'production') {
            return nodemailer.createTransport({
                service: process.env.EMAIL_TRANSPORT_SERVICE,
                auth: {
                    user: process.env.EMAIL_TRANSPORT_USER,
                    pass: process.env.EMAIL_TRANSPORT_PASSWORD,
                },
            })
        }

        // Development mode
        return nodemailer.createTransport({
            host: process.env.EMAIL_TRANSPORT_HOST,
            port: process.env.EMAIL_TRANSPORT_PORT,
            auth: {
                user: process.env.EMAIL_TRANSPORT_USER,
                pass: process.env.EMAIL_TRANSPORT_PASSWORD,
            },
        })
    }

    // Email sending transporter
    async sendEmail(template, subject) {
        // Email options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html: template,
            text: htmlToText.fromString(template),
        }

        // Send email
        await this.transporter().sendMail(mailOptions)
    }

    // Send welcome email
    async sendWelcomeEmail() {
        // Email template module
        const template = welcomeEmailTemplate(this.name)

        // Sending email
        await this.sendEmail(
            template,
            `Welcome to the ${process.env.APP_NAME} Family!`
        )
    }

    // Send password reset email
    async sendPasswordResetEmail() {
        // Email template module
        const template = passwordResetEmailTemplate(this.url)

        // Sending email
        await this.sendEmail(
            template,
            'Your password reset token (valid for only 10 minutes)'
        )
    }

    async sendPublicationEmail(productName, productURL) {
        // Email template module
        const template = publicationEmailTemplate(
            this.name,
            productName,
            productURL
        )

        // Sending email
        await this.sendEmail(template, 'Your submission has been approved!')
    }

    async sendRejectedProductEmail(productName, emailText) {
        // Email template module
        const template = rejectedProductTemplate(
            this.name,
            productName,
            emailText
        )

        // Sending email
        await this.sendEmail(
            template,
            `Your item, ${productName}, has been rejected!`
        )
    }

    async sendPayoutEmail(emailSub, emailText) {
        // Email template module
        const template = payoutEmailTemplate(emailText)
        // Sending email
        await this.sendEmail(template, emailSub)
    }

    async sendNotificationEmail(emailSub, emailText) {
        // Email template module
        const template = notificationEmailTemplate(emailText)
        // Sending email
        await this.sendEmail(template, emailSub)
    }
}

module.exports = EmailTransmitter
