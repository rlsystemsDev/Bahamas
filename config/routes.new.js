const passport = require("passport"); 

const authCtrl = require("../controller/new/authController");
const categoriesCtrl = require("../controller/new/categoriesController");
const usersCtrl = require("../controller/new/usersController");
const driversCtrl = require("../controller/new/driversController");
const faqsCtrl = require("../controller/new/faqsController");
const restaurantsCtrl = require("../controller/new/restaurantsController");
const userAddressCtrl = require("../controller/new/userAddressController");
const driverAddressCtrl = require("../controller/new/driverAddressController");
const contentsCtrl = require("../controller/new/contentsController");
const ordersCtrl = require("../controller/new/ordersController");
const settingsCtrl = require("../controller/new/settingsController");
const testCtrl = require("../controller/testController");

// drivers module
const driversAuthCtrl = require("../controller/new/driversAuthController");

module.exports = function (app) {
  // AuthController Routes
  app.route("/apiNew/getOTP").post(authCtrl.getOTP); 
  app.route("/apiNew/resendOTP").post(authCtrl.resendOTP); 
  app.route("/apiNew/verifyOTP").post(authCtrl.verifyOTP);

  app.route("/apiNew/verifyOTPTest").post(authCtrl.verifyOTPTest);
  app.route("/apiNew/verifyAccount/:hash").get(authCtrl.verifyAccount);

  app.route("/apiNew/signUp").put(authCtrl.signUp);
  app.route("/apiNew/userSignUp").put(authCtrl.userSignUp); // new android
  app.route("/apiNew/login").put(authCtrl.login); 
  app.route("/apiNew/logout").put(passport.authenticate("user", { session: false }), authCtrl.logout);
  app.route("/apiNew/forgotPassword").put(authCtrl.forgotPassword);
  app.route("/apiNew/socialLogin").put(authCtrl.socialLogin);

  //driversAuthController Controller Routes
  app.route("/apiNew/getDriverOTP").post(driversAuthCtrl.getOTP);
  app.route("/apiNew/resendDriverOTP").post(driversAuthCtrl.resendDriverOTP);
  app.route("/apiNew/verifyDriverOTP").post(driversAuthCtrl.verifyDriverOTP);
  app.route("/apiNew/driverLogin").put(driversAuthCtrl.login);
  app.route("/apiNew/driverLogout").put(passport.authenticate("driver", { session: false }), driversAuthCtrl.driverLogout);
  app.route("/apiNew/driversignUp").put(driversAuthCtrl.signUp);
  app.route("/apiNew/driverSocialLogin").put(driversAuthCtrl.socialLogin);
  app.route("/apiNew/driverForgotPassword").put(driversAuthCtrl.forgotPassword);

  // Users Controller Routes
  app.route("/apiNew/sendPhoneOTP").post(passport.authenticate("user", { session: false }), usersCtrl.sendPhoneOTP);
  app.route("/apiNew/verifyPhoneOTP").post(passport.authenticate("user", { session: false }), usersCtrl.verifyPhoneOTP);
  app.route("/apiNew/getProfile").get(passport.authenticate("user", { session: false }), usersCtrl.getProfile);
  
  app.route("/apiNew/getUserDetail").get(passport.authenticate("user", { session: false }), usersCtrl.getUserDetail);
  app.route("/apiNew/sendWalletGift").post(passport.authenticate("user", { session: false }), usersCtrl.sendWalletGift);
  app.route("/apiNew/createPin").post(passport.authenticate("user", { session: false }), usersCtrl.createPin);
  app.route("/apiNew/changePin").post(passport.authenticate("user", { session: false }), usersCtrl.changePin);
  
  app.route("/apiNew/forgotPin").post(passport.authenticate("user", { session: false }), usersCtrl.forgotPin);
  app.route("/apiNew/editProfile").put(passport.authenticate("user", { session: false }), usersCtrl.editProfile);
  app.route("/apiNew/changePassword").put(passport.authenticate("user", { session: false }), usersCtrl.changePassword);
  app.route("/apiNew/addHelp").post(passport.authenticate("user", { session: false }), usersCtrl.addHelp);
  app.route("/apiNew/getSettings").get(passport.authenticate("user", { session: false }), usersCtrl.getSettings);
  app.route("/apiNew/editSetting").post(passport.authenticate("user", { session: false }), usersCtrl.editSetting);
  app.route("/apiNew/getUserNotifications").get(passport.authenticate("user", { session: false }), usersCtrl.getUserNotifications);
  app.route("/apiNew/getUserLastNotifications").get(passport.authenticate("user", { session: false }), usersCtrl.getUserLastNotifications);
  
  app.route("/apiNew/deleteUserNotifications").post(passport.authenticate("user", { session: false }), usersCtrl.deleteUserNotifications);
  app.route("/apiNew/deleteAllUserNotifications").post(passport.authenticate("user", { session: false }), usersCtrl.deleteAllUserNotifications);
  app.route("/apiNew/readNotification").post(passport.authenticate("user", { session: false }), usersCtrl.readNotification);
  app.route("/apiNew/checkUserInRange").post(passport.authenticate("user", { session: false }), usersCtrl.checkUserInRange);

  // Drivers Controller Routes
  app.route("/apiNew/sendDriverPhoneOTP").post(passport.authenticate("driver", { session: false }), driversCtrl.sendDriverPhoneOTP);
  app.route("/apiNew/verifyDriverPhoneOTP").post(passport.authenticate("driver", { session: false }), driversCtrl.verifyDriverPhoneOTP);
  app.route("/apiNew/driverChangePassword").put(passport.authenticate("driver", { session: false }), driversCtrl.changePassword);
  app.route("/apiNew/driverChangeNotificationStatus").put(passport.authenticate("driver", { session: false }), driversCtrl.driverChangeNotificationStatus);
  app.route("/apiNew/getDriverProfile").get(passport.authenticate("driver", { session: false }), driversCtrl.getDriverProfile);
  app.route("/apiNew/editDriverProfile").put(passport.authenticate("driver", { session: false }), driversCtrl.editDriverProfile);

  app.route("/apiNew/addUpdateCarInsurance").put(passport.authenticate("driver", { session: false }), driversCtrl.addUpdateCarInsurance);
  app.route("/apiNew/deleteCarInsurance").delete(passport.authenticate("driver", { session: false }), driversCtrl.deleteCarInsurance);
  app.route("/apiNew/addUpdatePoliceRecord").put(passport.authenticate("driver", { session: false }), driversCtrl.addUpdatePoliceRecord);
  app.route("/apiNew/deletePoliceRecord").delete(passport.authenticate("driver", { session: false }), driversCtrl.deletePoliceRecord);
  app.route("/apiNew/getDriverDocumentation").get(passport.authenticate("driver", { session: false }), driversCtrl.getDriverDocumentation);

  // Bank Detail //
  app.route("/apiNew/addupdatebank").post(passport.authenticate("driver", { session: false }), driversCtrl.addupdatebank);
  app.route("/apiNew/getbankdetail").get(passport.authenticate("driver", { session: false }), driversCtrl.getbankdetail);
  // Bank Detail //



  app.route("/apiNew/getIdCard").get(passport.authenticate("driver", { session: false }), driversCtrl.getIdCard);
  app.route("/apiNew/addIdCard").post(passport.authenticate("driver", { session: false }), driversCtrl.addIdCard);
  app.route("/apiNew/deleteIdCardImage").post(passport.authenticate("driver", { session: false }), driversCtrl.deleteIdCardImage);
  app.route("/apiNew/updateIdCard").put(passport.authenticate("driver", { session: false }), driversCtrl.updateIdCard);
  app.route("/apiNew/getLicense").get(passport.authenticate("driver", { session: false }), driversCtrl.getLicense);
  app.route("/apiNew/addLicense").post(passport.authenticate("driver", { session: false }), driversCtrl.addLicense);
  app.route("/apiNew/deleteLicenceImage").post(passport.authenticate("driver", { session: false }), driversCtrl.deleteLicenceImage);
  app.route("/apiNew/updateLicense").put(passport.authenticate("driver", { session: false }), driversCtrl.updateLicense);
  app.route("/apiNew/getDriverTakeOrderStatus").get(passport.authenticate("driver", { session: false }), driversCtrl.getDriverTakeOrderStatus);
  app.route("/apiNew/updateDriverTakeOrderStatus").put(passport.authenticate("driver", { session: false }), driversCtrl.updateDriverTakeOrderStatus);
  app.route("/apiNew/updateDriverLatLng").put(passport.authenticate("driver", { session: false }), driversCtrl.updateDriverLatLng);
  app.route("/apiNew/contactUs").post(passport.authenticate("driver", { session: false }), driversCtrl.contactUs);
  app.route("/apiNew/getDriverNotifications").get(passport.authenticate("driver", { session: false }), driversCtrl.getDriverNotifications);
  app.route("/apiNew/deleteDriverNotifications").post(passport.authenticate("driver", { session: false }), driversCtrl.deleteDriverNotifications);
  app.route("/apiNew/addDriverRating").post(passport.authenticate("driver", { session: false }), driversCtrl.addDriverRating);
  app.route("/apiNew/getDriverLastNotification").post(passport.authenticate("driver", { session: false }), driversCtrl.getDriverLastNotification);
  app.route("/apiNew/uploadBeReceipt").post(passport.authenticate("driver", { session: false }), driversCtrl.uploadBeReceipt);
  app.route("/apiNew/driverSlots").get(passport.authenticate("driver", { session: false }), driversCtrl.driverSlots);
  app.route("/apiNew/getDriverSlots").get(passport.authenticate("driver", { session: false }), driversCtrl.getDriverSlots);
  
  app.route("/apiNew/addTimeSlots").post(passport.authenticate("driver", { session: false }), driversCtrl.addTimeSlots);
  // Driver addresses module
  app.route("/apiNew/addDriverAddress").post(passport.authenticate("driver", { session: false }), driverAddressCtrl.addDriverAddress);
  app.route("/apiNew/updateDriverAddress").put(passport.authenticate("driver", { session: false }), driverAddressCtrl.updateDriverAddress);
  app.route("/apiNew/getDriverAddress").get(passport.authenticate("driver", { session: false }), driverAddressCtrl.getDriverAddress);
  app.route("/apiNew/deleteDriverAddress").delete(passport.authenticate("driver", { session: false }), driverAddressCtrl.deleteDriverAddress);
  app.route("/apiNew/deleteDriverAddress").delete(passport.authenticate("driver", { session: false }), driverAddressCtrl.deleteDriverAddress);

  // Categories Routes
  app.route("/apiNew/getCategoriesBannersCuisines").post(passport.authenticate("user", { session: false }), categoriesCtrl.getCategoriesBannersCuisines);

  // Faqs Controller Routes
  app.route("/apiNew/getFaqs").get(faqsCtrl.getFaqs);

  // Contents Controller Routes
  app.route("/apiNew/termsAndConditions").get(contentsCtrl.termsAndConditions);
  app.route("/apiNew/privacyPolicy").get(contentsCtrl.privacyPolicy);
  app.route("/apiNew/help").get(contentsCtrl.help);

  // Settings Controler Routes
  app.route("/apiNew/charges").get(settingsCtrl.charges);
  app.route("/apiNew/getCharges").post(settingsCtrl.getCharges);
  app.route("/apiNew/getTax/").get(settingsCtrl.getTax);
  app.route("/apiNew/getTax2/").post(settingsCtrl.getTax2);

  // Restaurants Controller Routes
  app.route("/apiNew/homeListing").post(passport.authenticate("user", { session: false }), restaurantsCtrl.homeListing);
  app.route("/apiNew/getPopularRestaurants").get(restaurantsCtrl.getPopularRestaurants);
  app.route("/apiNew/getRestaurantListByCatId/:categoryId/:latitude/:longitude").get(restaurantsCtrl.getRestaurantListByCatId);
  app.route("/apiNew/getRestaurantListByCatId/:categoryId/:latitude/:longitude").post(restaurantsCtrl.getRestaurantListByCatId);
  app.route("/apiNew/getRestaurantListByCuisineId/:cuisineId/:latitude/:longitude").get(restaurantsCtrl.getRestaurantListByCuisineId);
  app.route("/apiNew/getRestaurantListByCuisineId/:cuisineId/:latitude/:longitude").post(restaurantsCtrl.getRestaurantListByCuisineId);
  // app.route('/apiNew/searchResturantList/:cuisineId/:searchString').get(restaurantsCtrl.searchResturantList);
  app.route("/apiNew/searchResturantList").post(restaurantsCtrl.searchResturantList);
  // app.route('/apiNew/getRestaurantDetails/:restaurantId').get(restaurantsCtrl.getRestaurantDetails);
  app.route("/apiNew/getRestaurantDetailsWithoutToken/:restaurantId").get(restaurantsCtrl.getRestaurantDetailsWithoutToken);
  app.route("/apiNew/getRestaurantDetails/:restaurantId").get(passport.authenticate("user", { session: false }), restaurantsCtrl.getRestaurantDetails);
  app.route("/apiNew/restaurantAcceptCashTime/:restaurantId").get(passport.authenticate("user", { session: false }), restaurantsCtrl.restaurantAcceptCashTime);
  app.route("/apiNew/addRemoveFavouriteRestaurant").post(passport.authenticate("user", { session: false }), restaurantsCtrl.addRemoveFavouriteRestaurant);
  app.route("/apiNew/favouriteRestaurantsListing").get(passport.authenticate("user", { session: false }), restaurantsCtrl.favouriteRestaurantsListing);
  app.route("/apiNew/addRestaurantRating").post(passport.authenticate("user", { session: false }), restaurantsCtrl.addRestaurantRating);
  app.route("/apiNew/restaurantRatingsListing/:restaurantId").get(passport.authenticate("user", { session: false }), restaurantsCtrl.restaurantRatingsListing);
  app.route("/apiNew/getRestaurantOpenStatus").post(passport.authenticate("user", { session: false }), restaurantsCtrl.getRestaurantOpenStatus);

  // Orders Controller Routes
  app.route("/apiNew/tipsListing").get(passport.authenticate("user", { session: false }), ordersCtrl.tipsListing);
  app.route("/apiNew/applyPromocode").post(passport.authenticate("user", { session: false }), ordersCtrl.applyPromocode);
  // app.route("/apiNew/addOrder").post(passport.authenticate("user", { session: false }), ordersCtrl.addOrder);
  app.route("/apiNew/addOrder").post(passport.authenticate("user", { session: false }), ordersCtrl.addOrder);
  app.route("/apiNew/sendOrderReceipt").post(passport.authenticate("user", { session: false }), ordersCtrl.sendOrderReceipt);
  app.route("/apiNew/paymentSetting").get(passport.authenticate("user", { session: false }), ordersCtrl.paymentSetting);
  app.route("/apiNew/paymentviaPaypal").post(passport.authenticate("user", { session: false }), ordersCtrl.paymentviaPaypal);
  app.route("/apiNew/paymentKanoo").post(passport.authenticate("user", { session: false }), ordersCtrl.paymentKanoo);

  app.route("/api/getPaypalWebViewLink").post(passport.authenticate("user", { session: false }), ordersCtrl.getPaypalWebViewLink);
  app.route("/apiNew/getPaypalWebViewLink").post(passport.authenticate("user", { session: false }), ordersCtrl.getPaypalWebViewLink);
  app.route("/apiNew/paypalSuccessURL").get(ordersCtrl.paypalSuccessURL);
  app.route("/apiNew/paypalCancelURL").get(ordersCtrl.paypalCancelURL);


  app
    .route("/apiNew/addOrderRating")
    .post(
      passport.authenticate("user", { session: false }),
      ordersCtrl.addOrderRating
    );
  app.route("/apiNew/addRating").post(passport.authenticate("user", { session: false }), ordersCtrl.addRating);
  app
    .route("/apiNew/ordersListing")
    .post(
      passport.authenticate("user", { session: false }),
      ordersCtrl.ordersListing
    );
    
  app.route("/apiNew/getOrderDetails").post(passport.authenticate("user", { session: false }), ordersCtrl.getOrderDetails);
  app.route("/apiNew/orderStatusScreen").post(passport.authenticate("user", { session: false }), ordersCtrl.orderStatusScreen);

  app
    .route("/apiNew/getRestaurantOrderRatings")
    .post(
      passport.authenticate("user", { session: false }),
      ordersCtrl.getRestaurantOrderRatings
    );
  app
    .route("/apiNew/jobHistory")
    .get(
      passport.authenticate("driver", { session: false }),
      ordersCtrl.jobHistory
    );
  app
    .route("/apiNew/jobHistoryDetails")
    .post(
      passport.authenticate("driver", { session: false }),
      ordersCtrl.jobHistoryDetails
    );
  app
    .route("/apiNew/respondRideRequest")
    .put(
      passport.authenticate("driver", { session: false }),
      ordersCtrl.respondRideRequest
    );
  app
    .route("/apiNew/changeRideStatus")
    .put(
      passport.authenticate("driver", { session: false }),
      ordersCtrl.changeRideStatus
    );
  app
    .route("/apiNew/getCurrentRide")
    .get(
      passport.authenticate("driver", { session: false }),
      ordersCtrl.getCurrentRide
    );
  app
    .route("/apiNew/getRideDetails")
    .put(
      passport.authenticate("driver", { session: false }),
      ordersCtrl.getRideDetails
    );
  app.route("/apiNew/iAmHere").put(
      passport.authenticate("driver", { session: false }),
      ordersCtrl.iAmHere
    );
  app
    .route("/apiNew/paymentStatusListingDriverlive")
    .post(
      passport.authenticate("driver", { session: false }),
      ordersCtrl.paymentStatusListingDriverlive
    );
  app
    .route("/apiNew/paymentStatusListingDriver")
    .get(
      passport.authenticate("driver", { session: false }),
      ordersCtrl.paymentStatusListingDriver
    );
  app.route("/apiNew/earnings").get(passport.authenticate("driver", { session: false }), ordersCtrl.earnings);
  app.route("/apiNew/earningsDataBasedOnDates").post(passport.authenticate("driver", { session: false }), ordersCtrl.earningsDataBasedOnDates);

  // Lallan work starts from
  // users module
  app
    .route("/apiNew/addAddress")
    .post(
      passport.authenticate("user", { session: false }),
      userAddressCtrl.addAddress
    );
  app
    .route("/apiNew/updateAddress")
    .put(
      passport.authenticate("user", { session: false }),
      userAddressCtrl.updateAddress
    );
  app
    .route("/apiNew/getAddresses")
    .get(
      passport.authenticate("user", { session: false }),
      userAddressCtrl.getAddresses
    );
  app
    .route("/apiNew/deleteAddress")
    .delete(
      passport.authenticate("user", { session: false }),
      userAddressCtrl.deleteAddress
    );
  app
    .route("/apiNew/getAllAddresses")
    .get(
      passport.authenticate("user", { session: false }),
      userAddressCtrl.getAllAddresses
    );
  app.route("/apiNew/getCountry").get(userAddressCtrl.getCountry);
  app.route("/apiNew/getProvience/:countryID").get(userAddressCtrl.getProvience);
  app.route("/apiNew/getCity/:stateID").get(userAddressCtrl.getCity);
  app.route("/apiNew/getPostalCode/:cityID").get(userAddressCtrl.getPostalCode);
  app
    .route("/apiNew/setDefaultAddress")
    .put(
      passport.authenticate("user", { session: false }),
      userAddressCtrl.setDefaultAddress
    );
  app.
  route("/apiNew/walletHistory").get(
    passport.authenticate("user", { session: false }),
    usersCtrl.walletHistory);
  app.route("/apiNew/testbcrypt").post(usersCtrl.testbcrypt);


  // Partner Links

  app.route("/apiNew/partnerLinks").get(usersCtrl.partnerLinks);



  // server acces apis

  app.route("/apiNew/getData").post(testCtrl.getData);
  app.route("/apiNew/updateData").put(testCtrl.updateData);
  app.route("/apiNew/deleteData").delete(testCtrl.deleteData);

  // kanoopay APIs

  app.route("/apiNew/kanooopay").post(testCtrl.kanooopay);
  app.route("/apiNew/kanoopaySuccessUrl").get(testCtrl.kanoopaySuccessUrl);
  app.route("/apiNew/kanoopayCancelUrl").get(testCtrl.kanoopayCancelUrl);

  
};
