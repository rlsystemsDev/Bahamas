const FCM = require('fcm-node');
const serverKey = 'AAAAuO0TP7Q:APA91bF2uCrLpj_njkDDmkPXDWb98aRza6_SBVOYJrIMsGBMlTO4sojSTwEJvWyQU-1IJnN7PCVpVWvdWcrqcNGrVAYdX1dXvRxyxZoaWnjxPGDWwPGh3VcJRwyjtO83fMQGvdGvNtsh'; //put your server key here
const fcm = new FCM(serverKey);

module.exports = {
    fcm
}