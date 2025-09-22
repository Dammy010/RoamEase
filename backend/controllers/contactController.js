const nodemailer = require("nodemailer");

// Create contact form submission
const submitContactForm = async (req, res) => {
  try {
    console.log("Contact form submission received:", req.body);
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        message: "All fields are required",
        errors: {
          name: !name ? "Name is required" : "",
          email: !email ? "Email is required" : "",
          subject: !subject ? "Subject is required" : "",
          message: !message ? "Message is required" : "",
        },
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Please enter a valid email address",
        errors: { email: "Please enter a valid email address" },
      });
    }

    // Check if email configuration is available
    if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASS
    ) {
      console.log("Email configuration not found. Contact form data:", {
        name,
        email,
        subject,
        message,
        timestamp: new Date().toISOString(),
        ip: req.ip || req.connection.remoteAddress,
      });

      // Return success even without email sending for development
      return res.status(200).json({
        message: "Contact form submitted successfully (email not configured)",
        success: true,
        note: "Email configuration not set up. Contact details logged to console.",
      });
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Email content
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.CONTACT_EMAIL || process.env.SMTP_USER, // Send to admin email
      subject: `Contact Form: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">New Contact Form Submission</h1>
            <p style="color: #e0e7ff; margin: 10px 0 0 0;">RoamEase Contact Form</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0;">
            <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 20px;">Contact Details</h2>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #374151;">Name:</strong>
                <span style="color: #6b7280; margin-left: 10px;">${name}</span>
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #374151;">Email:</strong>
                <span style="color: #6b7280; margin-left: 10px;">${email}</span>
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #374151;">Subject:</strong>
                <span style="color: #6b7280; margin-left: 10px;">${subject}</span>
              </div>
              
              <div style="margin-bottom: 20px;">
                <strong style="color: #374151;">Message:</strong>
                <div style="background: #f1f5f9; padding: 15px; border-radius: 6px; margin-top: 8px; color: #475569; line-height: 1.6;">
                  ${message.replace(/\n/g, "<br>")}
                </div>
              </div>
              
              <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 20px;">
                <p style="color: #6b7280; font-size: 14px; margin: 0;">
                  <strong>Submitted:</strong> ${new Date().toLocaleString()}
                </p>
                <p style="color: #6b7280; font-size: 14px; margin: 5px 0 0 0;">
                  <strong>IP Address:</strong> ${
                    req.ip || req.connection.remoteAddress
                  }
                </p>
              </div>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px;">
            <p>This email was sent from the RoamEase contact form.</p>
          </div>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Send auto-reply to user
    const autoReplyOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: "Thank you for contacting RoamEase",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Thank You!</h1>
            <p style="color: #e0e7ff; margin: 10px 0 0 0;">We've received your message</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0;">
            <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 20px;">Hello ${name}!</h2>
              
              <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
                Thank you for reaching out to us. We've received your message regarding "<strong>${subject}</strong>" and our team will review it shortly.
              </p>
              
              <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 16px;">What happens next?</h3>
                <ul style="color: #475569; margin: 0; padding-left: 20px;">
                  <li style="margin-bottom: 8px;">Our team will review your message within 24 hours</li>
                  <li style="margin-bottom: 8px;">We'll respond directly to your email address</li>
                  <li style="margin-bottom: 8px;">For urgent matters, you can call us at +2347042168616</li>
                </ul>
              </div>
              
              <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
                In the meantime, feel free to explore our platform and discover how RoamEase can streamline your logistics needs.
              </p>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="${
                  process.env.FRONTEND_URL || "https://roam-ease.vercel.app"
                }" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                  Visit RoamEase
                </a>
              </div>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px;">
            <p>This is an automated response. Please do not reply to this email.</p>
            <p>© 2024 RoamEase. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    // Send auto-reply
    await transporter.sendMail(autoReplyOptions);

    res.status(200).json({
      message: "Contact form submitted successfully",
      success: true,
    });
  } catch (error) {
    console.error("Contact form submission error:", error);

    // Log the contact form data for debugging
    console.log("Contact form data that failed:", {
      name: req.body.name,
      email: req.body.email,
      subject: req.body.subject,
      message: req.body.message,
      timestamp: new Date().toISOString(),
    });

    res.status(500).json({
      message: "Failed to submit contact form",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

module.exports = {
  submitContactForm,
};
