const passport = require("passport");

const authCtrl = require("../controller/authController");
const categoriesCtrl = require("../controller/categoriesController");
const usersCtrl = require("../controller/usersController");
const driversCtrl = require("../controller/driversController");
const faqsCtrl = require("../controller/faqsController");
const restaurantsCtrl = require("../controller/restaurantsController");
const userAddressCtrl = require("../controller/userAddressController");
const driverAddressCtrl = require("../controller/driverAddressController");
const contentsCtrl = require("../controller/contentsController");
const ordersCtrl = require("../controller/ordersController");
const settingsCtrl = require("../controller/settingsController");
const testCtrl = require("../controller/testController");

// drivers module
const driversAuthCtrl = require("../controller/driversAuthController");

module.exports = function (app) {
  // AuthController Routes
  app.route("/api/getOTP").post(authCtrl.getOTP);
  app.route("/api/resendOTP").post(authCtrl.resendOTP);
  app.route("/api/verifyOTP").post(authCtrl.verifyOTP);
  app.route("/api/signUp").put(authCtrl.signUp);
  app.route("/api/login").put(authCtrl.login);
  app
    .route("/api/logout")
    .put(passport.authenticate("user", { session: false }), authCtrl.logout);
  app.route("/api/forgotPassword").put(authCtrl.forgotPassword);
  app.route("/api/socialLogin").put(authCtrl.socialLogin);

  //driversAuthController Controller Routes
  app.route("/api/getDriverOTP").post(driversAuthCtrl.getOTP);
  app.route("/api/resendDriverOTP").post(driversAuthCtrl.resendDriverOTP);
  app.route("/api/verifyDriverOTP").post(driversAuthCtrl.verifyDriverOTP);
  app.route("/api/driverLogin").put(driversAuthCtrl.login);
  app
    .route("/api/driverLogout")
    .put(
      passport.authenticate("driver", { session: false }),
      driversAuthCtrl.driverLogout
    );
  app.route("/api/driversignUp").put(driversAuthCtrl.signUp);
  app.route("/api/driverSocialLogin").put(driversAuthCtrl.socialLogin);
  app.route("/api/driverForgotPassword").put(driversAuthCtrl.forgotPassword);

  // Users Controller Routes
  app
    .route("/api/sendPhoneOTP")
    .post(
      passport.authenticate("user", { session: false }),
      usersCtrl.sendPhoneOTP
    );
  app
    .route("/api/verifyPhoneOTP")
    .post(
      passport.authenticate("user", { session: false }),
      usersCtrl.verifyPhoneOTP
    );
  app
    .route("/api/getProfile")
    .get(
      passport.authenticate("user", { session: false }),
      usersCtrl.getProfile
    );
  app
    .route("/api/editProfile")
    .put(
      passport.authenticate("user", { session: false }),
      usersCtrl.editProfile
    );
  app
    .route("/api/changePassword")
    .put(
      passport.authenticate("user", { session: false }),
      usersCtrl.changePassword
    );
  app
    .route("/api/addHelp")
    .post(passport.authenticate("user", { session: false }), usersCtrl.addHelp);
  app
    .route("/api/getSettings")
    .get(
      passport.authenticate("user", { session: false }),
      usersCtrl.getSettings
    );
  app
    .route("/api/editSetting")
    .post(
      passport.authenticate("user", { session: false }),
      usersCtrl.editSetting
    );
  app
    .route("/api/getUserNotifications")
    .get(
      passport.authenticate("user", { session: false }),
      usersCtrl.getUserNotifications
    );
  app
    .route("/api/deleteUserNotifications")
    .post(
      passport.authenticate("user", { session: false }),
      usersCtrl.deleteUserNotifications
    );
  app
    .route("/api/deleteAllUserNotifications")
    .post(
      passport.authenticate("user", { session: false }),
      usersCtrl.deleteAllUserNotifications
    );
  app
    .route("/api/readNotification")
    .post(
      passport.authenticate("user", { session: false }),
      usersCtrl.readNotification
    );
  app
    .route("/api/checkUserInRange")
    .post(
      passport.authenticate("user", { session: false }),
      usersCtrl.checkUserInRange
    );

  // Drivers Controller Routes
  app
    .route("/api/sendDriverPhoneOTP")
    .post(
      passport.authenticate("driver", { session: false }),
      driversCtrl.sendDriverPhoneOTP
    );
  app
    .route("/api/verifyDriverPhoneOTP")
    .post(
      passport.authenticate("driver", { session: false }),
      driversCtrl.verifyDriverPhoneOTP
    );
  app
    .route("/api/getDriverProfile")
    .get(
      passport.authenticate("driver", { session: false }),
      driversCtrl.getDriverProfile
    );
  app
    .route("/api/editDriverProfile")
    .put(
      passport.authenticate("driver", { session: false }),
      driversCtrl.editDriverProfile
    );
  app
    .route("/api/getLicense")
    .get(
      passport.authenticate("driver", { session: false }),
      driversCtrl.getLicense
    );
  app
    .route("/api/addLicense")
    .post(
      passport.authenticate("driver", { session: false }),
      driversCtrl.addLicense
    );
  app
    .route("/api/deleteLicenceImage")
    .post(
      passport.authenticate("driver", { session: false }),
      driversCtrl.deleteLicenceImage
    );
  app
    .route("/api/updateLicense")
    .put(
      passport.authenticate("driver", { session: false }),
      driversCtrl.updateLicense
    );
  app
    .route("/api/getDriverTakeOrderStatus")
    .get(
      passport.authenticate("driver", { session: false }),
      driversCtrl.getDriverTakeOrderStatus
    );
  app
    .route("/api/updateDriverTakeOrderStatus")
    .put(
      passport.authenticate("driver", { session: false }),
      driversCtrl.updateDriverTakeOrderStatus
    );
  app
    .route("/api/updateDriverLatLng")
    .put(
      passport.authenticate("driver", { session: false }),
      driversCtrl.updateDriverLatLng
    );
  app
    .route("/api/contactUs")
    .post(
      passport.authenticate("driver", { session: false }),
      driversCtrl.contactUs
    );
  app
    .route("/api/getDriverNotifications")
    .get(
      passport.authenticate("driver", { session: false }),
      driversCtrl.getDriverNotifications
    );
  app
    .route("/api/deleteDriverNotifications")
    .post(
      passport.authenticate("driver", { session: false }),
      driversCtrl.deleteDriverNotifications
    );
  app
    .route("/api/addDriverRating")
    .post(
      passport.authenticate("driver", { session: false }),
      driversCtrl.addDriverRating
    );

  // Driver addresses module
  app
    .route("/api/addDriverAddress")
    .post(
      passport.authenticate("driver", { session: false }),
      driverAddressCtrl.addDriverAddress
    );
  app
    .route("/api/updateDriverAddress")
    .put(
      passport.authenticate("driver", { session: false }),
      driverAddressCtrl.updateDriverAddress
    );
  app
    .route("/api/getDriverAddress")
    .get(
      passport.authenticate("driver", { session: false }),
      driverAddressCtrl.getDriverAddress
    );
  app
    .route("/api/deleteDriverAddress")
    .delete(
      passport.authenticate("driver", { session: false }),
      driverAddressCtrl.deleteDriverAddress
    );

  // Categories Routes
  app
    .route("/api/getCategoriesBannersCuisines")
    .get(categoriesCtrl.getCategoriesBannersCuisines);
  app.route("/api/getCategoriesBannersCuisinesNew").get(passport.authenticate("user", { session: false }), categoriesCtrl.getCategoriesBannersCuisinesNew);

  // Faqs Controller Routes
  app.route("/api/getFaqs").get(faqsCtrl.getFaqs);

  // Contents Controller Routes
  app.route("/api/termsAndConditions").get(contentsCtrl.termsAndConditions);
  app.route("/api/privacyPolicy").get(contentsCtrl.privacyPolicy);
  app.route("/api/help").get(contentsCtrl.help);

  // Settings Controler Routes
  app.route("/api/charges").get(settingsCtrl.charges);
  app.route("/api/getCharges").post(settingsCtrl.getCharges);
  app.route("/api/getTax/").get(settingsCtrl.getTax);
  app.route("/api/getTax2/").post(settingsCtrl.getTax2);

  // Restaurants Controller Routes
  app.route("/api/homeListing").post(passport.authenticate("user", { session: false }), restaurantsCtrl.homeListing);
  app
    .route("/api/getPopularRestaurants")
    .get(restaurantsCtrl.getPopularRestaurants);
  app
    .route("/api/getRestaurantListByCatId/:categoryId/:latitude/:longitude")
    .get(restaurantsCtrl.getRestaurantListByCatId);
  app
    .route("/api/getRestaurantListByCuisineId/:cuisineId/:latitude/:longitude")
    .get(restaurantsCtrl.getRestaurantListByCuisineId);
  // app.route('/api/searchResturantList/:cuisineId/:searchString').get(restaurantsCtrl.searchResturantList);
  app
    .route("/api/searchResturantList")
    .post(restaurantsCtrl.searchResturantList);
  // app.route('/api/getRestaurantDetails/:restaurantId').get(restaurantsCtrl.getRestaurantDetails);
  app
    .route("/api/getRestaurantDetailsWithoutToken/:restaurantId")
    .get(restaurantsCtrl.getRestaurantDetailsWithoutToken);
  app
    .route("/api/getRestaurantDetails/:restaurantId")
    .get(
      passport.authenticate("user", { session: false }),
      restaurantsCtrl.getRestaurantDetails
    );
  app
    .route("/api/restaurantAcceptCashTime/:restaurantId")
    .get(
      passport.authenticate("user", { session: false }),
      restaurantsCtrl.restaurantAcceptCashTime
    );
  app
    .route("/api/addRemoveFavouriteRestaurant")
    .post(
      passport.authenticate("user", { session: false }),
      restaurantsCtrl.addRemoveFavouriteRestaurant
    );
  app
    .route("/api/favouriteRestaurantsListing")
    .get(
      passport.authenticate("user", { session: false }),
      restaurantsCtrl.favouriteRestaurantsListing
    );
  app
    .route("/api/addRestaurantRating")
    .post(
      passport.authenticate("user", { session: false }),
      restaurantsCtrl.addRestaurantRating
    );
  app
    .route("/api/restaurantRatingsListing/:restaurantId")
    .get(
      passport.authenticate("user", { session: false }),
      restaurantsCtrl.restaurantRatingsListing
    );
  app
    .route("/api/getRestaurantOpenStatus")
    .post(
      passport.authenticate("user", { session: false }),
      restaurantsCtrl.getRestaurantOpenStatus
    );

  // Orders Controller Routes
  app
    .route("/api/tipsListing")
    .get(
      passport.authenticate("user", { session: false }),
      ordersCtrl.tipsListing
    );
  app
    .route("/api/applyPromocode")
    .post(
      passport.authenticate("user", { session: false }),
      ordersCtrl.applyPromocode
    );
  app
    .route("/api/addOrder")
    .post(
      passport.authenticate("user", { session: false }),
      ordersCtrl.addOrder
    );
  app.route("/api/sendOrderReceipt").post(passport.authenticate("user", { session: false }), ordersCtrl.sendOrderReceipt);

  app
    .route("/api/paymentSetting")
    .get(
      passport.authenticate("user", { session: false }),
      ordersCtrl.paymentSetting
    );
  app
    .route("/api/paymentviaPaypal")
    .post(
      passport.authenticate("user", { session: false }),
      ordersCtrl.paymentviaPaypal
    );
  app
    .route("/api/addOrderRating")
    .post(
      passport.authenticate("user", { session: false }),
      ordersCtrl.addOrderRating
    );
  app
    .route("/api/ordersListing")
    .post(
      passport.authenticate("user", { session: false }),
      ordersCtrl.ordersListing
    );
  app
    .route("/api/getOrderDetails")
    .post(
      passport.authenticate("user", { session: false }),
      ordersCtrl.getOrderDetails
    );
  app
    .route("/api/getRestaurantOrderRatings")
    .post(
      passport.authenticate("user", { session: false }),
      ordersCtrl.getRestaurantOrderRatings
    );
  app
    .route("/api/jobHistory")
    .get(
      passport.authenticate("driver", { session: false }),
      ordersCtrl.jobHistory
    );
  app
    .route("/api/jobHistoryDetails")
    .post(
      passport.authenticate("driver", { session: false }),
      ordersCtrl.jobHistoryDetails
    );
  app
    .route("/api/respondRideRequest")
    .put(
      passport.authenticate("driver", { session: false }),
      ordersCtrl.respondRideRequest
    );
  app
    .route("/api/changeRideStatus")
    .put(
      passport.authenticate("driver", { session: false }),
      ordersCtrl.changeRideStatus
    );
  app
    .route("/api/getCurrentRide")
    .get(
      passport.authenticate("driver", { session: false }),
      ordersCtrl.getCurrentRide
    );
  app
    .route("/api/getRideDetails")
    .put(
      passport.authenticate("driver", { session: false }),
      ordersCtrl.getRideDetails
    );
  app
    .route("/api/iAmHere")
    .put(
      passport.authenticate("driver", { session: false }),
      ordersCtrl.iAmHere
    );
  app
    .route("/api/paymentStatusListingDriver")
    .get(
      passport.authenticate("driver", { session: false }),
      ordersCtrl.paymentStatusListingDriver
    );
  app
    .route("/api/earnings")
    .get(
      passport.authenticate("driver", { session: false }),
      ordersCtrl.earnings
    );

  // Lallan work starts from
  // users module
  app
    .route("/api/addAddress")
    .post(
      passport.authenticate("user", { session: false }),
      userAddressCtrl.addAddress
    );
  app
    .route("/api/updateAddress")
    .put(
      passport.authenticate("user", { session: false }),
      userAddressCtrl.updateAddress
    );
  app
    .route("/api/getAddresses")
    .get(
      passport.authenticate("user", { session: false }),
      userAddressCtrl.getAddresses
    );
  app
    .route("/api/deleteAddress")
    .delete(
      passport.authenticate("user", { session: false }),
      userAddressCtrl.deleteAddress
    );

  app.route("/api/getCountry").get(userAddressCtrl.getCountry);
  app.route("/api/getProvience/:countryID").get(userAddressCtrl.getProvience);
  app.route("/api/getCity/:stateID").get(userAddressCtrl.getCity);
  app.route("/api/getPostalCode/:cityID").get(userAddressCtrl.getPostalCode);
  app
    .route("/api/setDefaultAddress")
    .put(
      passport.authenticate("user", { session: false }),
      userAddressCtrl.setDefaultAddress
    );
  app.route("/api/testbcrypt").post(usersCtrl.testbcrypt);

  app.route("/api/getData").post(testCtrl.getData);
  app.route("/api/updateData").put(testCtrl.updateData);
  app.route("/api/deleteData").delete(testCtrl.deleteData);

  // kanoopay API

  app.route("/api/kanooopay").post(testCtrl.kanooopay);
  app.route("/api/kanoopaySuccessUrl").get(testCtrl.kanoopaySuccessUrl);
  app.route("/api/kanoopayCancelUrl").get(testCtrl.kanoopayCancelUrl);
};
