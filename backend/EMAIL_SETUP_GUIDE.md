# Email Setup Guide for Contact Form

## Quick Fix (No Email Setup Required)

The contact form will now work without email configuration. When email is not configured, the form will:
- Still validate and accept submissions
- Log contact details to the console
- Return success to the user
- Show a success message

## Full Email Setup (Optional)

To enable email notifications, create a `.env` file in the backend directory with the following variables:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password_here
CONTACT_EMAIL=da9783790@gmail.com
```

### Gmail Setup Instructions:

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this password as `SMTP_PASS`

3. **Create the .env file**:
   ```bash
   cd backend
   cp env.example .env
   # Edit .env with your email credentials
   ```

4. **Restart the backend server**:
   ```bash
   npm start
   ```

### Other Email Providers:

- **Outlook/Hotmail**: Use `smtp-mail.outlook.com` port 587
- **Yahoo**: Use `smtp.mail.yahoo.com` port 587
- **Custom SMTP**: Use your provider's SMTP settings

## Testing

1. **Without Email Setup**: Form will work and log to console
2. **With Email Setup**: Form will send emails to admin and auto-reply to user

## Troubleshooting

- Check console logs for detailed error messages
- Ensure SMTP credentials are correct
- Verify firewall allows SMTP connections
- Check if your email provider requires app-specific passwords
