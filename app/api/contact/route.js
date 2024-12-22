import axios from 'axios';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Nodemailer Transporter Configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use STARTTLS
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.GMAIL_PASSKEY,
  },
});

// Generate HTML Email Template
const generateEmailTemplate = (name, email, userMessage) => `
  <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; background-color: #f9f9f9;">
    <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); padding: 20px;">
      <h2 style="color: #007BFF; text-align: center;">New Message Received</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <blockquote style="border-left: 4px solid #007BFF; padding-left: 10px; margin: 10px 0; font-style: italic; color: #555;">
        ${userMessage}
      </blockquote>
      <p style="font-size: 12px; color: #888; text-align: center;">This is an automated message. Please reply to respond.</p>
    </div>
  </div>
`;

// Helper Function: Send Email
async function sendEmail({ name, email, message }) {
  const mailOptions = {
    from: `Portfolio <${process.env.EMAIL_ADDRESS}>`,
    to: process.env.EMAIL_ADDRESS,
    subject: `New Message From ${name}`,
    text: message,
    html: generateEmailTemplate(name, email, message),
    replyTo: email,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending email:', error.message);
    return false;
  }
}

// Helper Function: Send Telegram Message
async function sendTelegramMessage(token, chat_id, message) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    const res = await axios.post(url, { text: message, chat_id });
    return res.data.ok;
  } catch (error) {
    console.error('Error sending Telegram message:', error.response?.data || error.message);
    return false;
  }
}

// API Endpoint
export async function POST(request) {
  try {
    // Parse Request Body
    const { name, email, message: userMessage } = await request.json();

    if (!name || !email || !userMessage) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and message are required.' },
        { status: 400 }
      );
    }

    // Validate Environment Variables
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chat_id = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chat_id || !process.env.EMAIL_ADDRESS || !process.env.GMAIL_PASSKEY) {
      return NextResponse.json(
        { success: false, message: 'Missing required environment variables.' },
        { status: 500 }
      );
    }

    // Prepare Message
    const formattedMessage = `
      New message from ${name}\n\n
      Email: ${email}\n\n
      Message:\n${userMessage}
    `;

    // Send Email and Telegram Message
    const emailSuccess = await sendEmail({ name, email, message: userMessage });
    const telegramSuccess = await sendTelegramMessage(token, chat_id, formattedMessage);

    if (emailSuccess && telegramSuccess) {
      return NextResponse.json(
        { success: true, message: 'Message sent successfully via email and Telegram!' },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to send message via email or Telegram.' },
      { status: 500 }
    );
  } catch (error) {
    console.error('API Error:', error.message);
    return NextResponse.json(
      { success: false, message: 'Internal server error occurred.' },
      { status: 500 }
    );
  }
}
