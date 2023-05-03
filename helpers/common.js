var twilio = require('twilio');
const config = require('config');
const requiredMessage = 'security key is required';
const notMatchMessage = 'security key not matched';

const checkSecurityKey = (req) => {
    req
        .checkHeaders(config.securityKeyFieldName)
        .notEmpty()
        .withMessage(requiredMessage)
        .equals(config.securityKey)
        .withMessage(notMatchMessage);
}

const mergeFields = (required, non_required, res) => {
    const merge_object = Object.assign(required, non_required);
    return merge_object;
}

const generateRandomString = (length = 10) => {
    return Math.random().toString(36).substr(0, length);
}

const generateOpt = () => {
    return Math.floor(1000 + Math.random() * 9000);
}

const sendTextMessage = async (number, otp) => {
    var accountSid = config.twillioAcountId;
    var authToken = config.twillioAccountToken;

    var client = new twilio(accountSid, authToken);
    try {
        const message = await client.messages.create({
            body: otp,
            to: number,  // Text this number
            from: config.twillioPhoneNumber
        });

        return message.sid;
    } catch (e) {
        console.log('Error', e);
    }
}
module.exports = {
    checkSecurityKey,
    mergeFields,
    generateRandomString,
    generateOpt,
    sendTextMessage
}