const functions = require("firebase-functions");
const nodemailer = require("nodemailer");
const admin = require("firebase-admin");
admin.initializeApp();

exports.sendEmailNotification = functions.storage.object().onFinalize(async (object) => {
  const fileBucket = object.bucket; // The Storage bucket that contains the file.
  const filePath = object.name; // File path in the bucket.
  const contentType = object.contentType; // File content type.

  // Exit if this is not an audio file.
  if (!contentType.startsWith("audio/")) {
    return functions.logger.log("This is not an audio file.");
  }

  // Nodemailer setup
  const mailTransport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "pranav.gunhal@gmail.com",
      pass: "fomw swjb bido znsl",
    },
  });

  const mailOptions = {
    from: "Firebase Function <noreply@firebase.com>",
    to: "kkalisite@gmail.com",
  };

  // Building email content
  mailOptions.subject = "New Audio Recording Uploaded";
  mailOptions.text = `A new audio recording has been uploaded to the bucket ${fileBucket} at path ${filePath}.`;

  try {
    await mailTransport.sendMail(mailOptions);
    functions.logger.log("Email sent successfully");
  } catch (error) {
    functions.logger.error("There was an error sending the email", error);
  }
});
