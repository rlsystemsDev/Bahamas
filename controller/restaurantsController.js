const sequelize = require('sequelize');
const db = require('../db/db');
const models = require('../models');
const helper = require('../config/helper');
const helperFunctions = require('../helpers/helperFunctions');
const Restaurant = models.restaurants;
const Category = models.categories;
const Cuisine = models.cuisines;
const User = models.users;
const RestaurantCategory = models.restaurantsCategories;
const RestaurantCuisine = models.restaurantsCuisines;
const RestaurantFavourite = models.restaurantsFavourite;
const RestaurantRating = models.restaurantRatings;
const Menu = models.menus;
const Item = models.items;
const ItemImage = models.itemImages;
const MenuItemAddon = models.menuItemAddons;
const AddonCategories = models.addonCategories;

RestaurantCategory.belongsTo(Restaurant, { foreignKey: 'restaurantId' });
RestaurantCategory.belongsTo(Category, { foreignKey: 'categoryId' });

RestaurantCuisine.belongsTo(Restaurant, { foreignKey: 'restaurantId' });
RestaurantCuisine.belongsTo(Cuisine, { foreignKey: 'cuisineId' });

RestaurantFavourite.belongsTo(Restaurant, { foreignKey: 'restaurantId' });
RestaurantFavourite.belongsTo(User, { foreignKey: 'userId' });

RestaurantRating.belongsTo(Restaurant, { foreignKey: 'restaurantId' });
RestaurantRating.belongsTo(User, { foreignKey: 'userId' });

Restaurant.hasMany(Menu, { foreignKey: 'restaurantId' });
// Restaurant.hasMany(RestaurantRating, { foreignKey: 'restaurantId' });
Menu.hasMany(Item, { foreignKey: 'menuId' });
Item.hasMany(ItemImage, { foreignKey: 'itemId' });
Item.hasMany(MenuItemAddon, { foreignKey: 'menuItemId' });
MenuItemAddon.belongsTo(AddonCategories, { foreignKey: 'categoryId' });

module.exports = {
  homeListing: async (req, res) => {
    try {
      const required = {
        security_key: req.headers.security_key,
      }
      const nonRequired = {
        latitude: req.body.latitude || 0,
        longitude: req.body.longitude || 0,
        cuisineId: req.body.cuisineId,
        searchKeyword: req.body.searchKeyword,
        limitAll: req.body.limitAll,
        pageAll: req.body.pageAll,
        limitPopular: req.body.limitPopular,
        pagePopular: req.body.pagePopular,
      };
      let requestData = await helper.vaildObject(required, nonRequired, res);

      if (req.headers.hasOwnProperty('devicetype') && req.headers.devicetype && req.headers.hasOwnProperty('devicetoken') && req.headers.devicetoken && req.headers.hasOwnProperty('userid') && req.headers.userid) {
        await models.users.update(
          {
            deviceType: req.headers.devicetype,
            deviceToken: req.headers.devicetoken,
          },
          {
            where: {
              id: req.headers.userid
            }
          }
        );
      };

      if (requestData.hasOwnProperty('cuisineId')) {
        requestData.cuisineId = requestData.cuisineId.split(',');

        requestData.cuisineRestaurantIds = await models.restaurantsCuisines.findAll({
          where: {
            cuisineId: {
              $in: requestData.cuisineId,
            }
          },
          raw: true,
        }).map(restaurantsCuisine => restaurantsCuisine.restaurantId);
      }
      console.log(requestData.cuisineRestaurantIds, '=====>requestData.cuisineRestaurantIds');

      let allMerchantsPromise = new Promise(async (resolve, reject) => {
        const data = await module.exports.allMerchants(req, res, requestData);
        resolve(data);
      });

      let popularMerchantsPromise = new Promise(async (resolve, reject) => {
        const data = await module.exports.popularMerchants(req, res, requestData);
        resolve(data);
      });

      let [allMerchants, popularMerchants] = await Promise.all([allMerchantsPromise, popularMerchantsPromise]);

      const allMerchantsOpen = allMerchants.filter(merchant => merchant.status == 1);
      const allMerchantsClosed = allMerchants.filter(merchant => merchant.status == 0);
      const popularMerchantsOpen = popularMerchants.filter(merchant => merchant.status == 1);
      const popularMerchantsClosed = popularMerchants.filter(merchant => merchant.status == 0);
      // const allMerchantsOpen = allMerchants.filter(merchant => merchant.status == 1).sort((a, b) => a.distance - b.distance);
      // const allMerchantsClosed = allMerchants.filter(merchant => merchant.status == 0).sort((a, b) => a.distance - b.distance);
      // const popularMerchantsOpen = popularMerchants.filter(merchant => merchant.status == 1).sort((a, b) => a.distance - b.distance);
      // const popularMerchantsClosed = popularMerchants.filter(merchant => merchant.status == 0).sort((a, b) => a.distance - b.distance);


      let allMerchantsData = [
        ...allMerchantsOpen,
        ...allMerchantsClosed,
      ];

      let popularMerchantsData = [
        ...popularMerchantsOpen,
        ...popularMerchantsClosed,
      ];

      // limitAll: req.body.limitAll,
      //   pageAll: req.body.pageAll,
      //     limitPopular: req.body.limitPopular,
      //       pagePopular: req.body.pagePopular,

      if (requestData.hasOwnProperty('limitAll') && requestData.limitAll && requestData.hasOwnProperty('pageAll') && requestData.pageAll) {
        const offset = (requestData.pageAll - 1) * requestData.limitAll;
        allMerchantsData = allMerchantsData.splice(offset, requestData.limitAll);
      }

      if (requestData.hasOwnProperty('limitPopular') && requestData.limitPopular && requestData.hasOwnProperty('pagePopular') && requestData.pagePopular) {
        const offset = (requestData.pagePopular - 1) * requestData.limitPopular;
        popularMerchantsData = popularMerchantsData.splice(offset, requestData.limitPopular);
      }

      const responseData = {
        allMerchants: allMerchantsData,
        popularMerchants: popularMerchantsData,
      };

      return helperFunctions.success(res, 'Home listing fetched successfully.', responseData);
    } catch (err) {
      console.log(err);
      helper.error(res, err);
    }
  },
  allMerchants: async (req, res, requestData) => {

    const getRestaurants = await Restaurant.findAll({
      where: {
        ...(
          requestData.hasOwnProperty('cuisineRestaurantIds') && requestData.cuisineRestaurantIds.length > 0
            ? {
              id: {
                $in: requestData.cuisineRestaurantIds,
              }
            } : {}
        ),
        ...(
          requestData.hasOwnProperty('searchKeyword') && requestData.searchKeyword
            ? {
              name: {
                $like: `%${requestData.searchKeyword}%`,
              }
            } : {}
        ),
        // isPopular: 1,
        hideStatus: 1
      },
      attributes: {
        include: [
          [sequelize.literal(`IF( (SELECT COUNT(rf.id) FROM restaurants_favourite as rf WHERE rf.user_id=${req.user.id} && rf.restaurant_id=restaurants.id) >= 1, 1, 0)`), 'isFav'],
          ...(requestData.latitude && requestData.longitude
            ? [
              [
                sequelize.literal(
                  `round( 
                      ( 3959 * acos( least(1.0,  
                        cos( radians(${requestData.latitude}) ) 
                        * cos( radians(restaurants.latitude) ) 
                        * cos( radians(restaurants.longitude) - radians(${requestData.longitude}) ) 
                        + sin( radians(${requestData.latitude}) ) 
                        * sin( radians(restaurants.latitude) 
                      ) ) ) 
                    ), 1)`
                ),
                "distance",
              ],
            ]
            : [[sequelize.literal(`0`), "distance"]]),
        ],
      },
      include: [
        {
          model: models.restaurantImages,
          required: false,
        }
      ],
      // order: [[sequelize.col('distance'), 'ASC']],
      order: [[sequelize.literal('`distance`*1'), 'ASC']],
      // ...(
      //   requestData.limitAll && requestData.pageAll
      //     ? {
      //       limit: parseInt(requestData.limitAll),
      //       offset: (parseInt(requestData.pageAll) - 1) * requestData.limitAll
      //     } : {}
      // ),
    });

    // console.log(getRestaurants); return false;

    // res.status(200).json({
    //   'status': true,
    //   'code': 200,
    //   'message': 'Restaurants Listing.',
    //   'body': getRestaurants
    // });
    // console.log(getRestaurants); return false;

    let responseData = [];
    if (getRestaurants.length > 0) {
      responseData = getRestaurants.map(async value => {
        value = value.toJSON();
        // console.log(value);
        const rating = await db.query(`SELECT AVG(rating) as avg_rating, count(id) as ratings_count  FROM restaurant_ratings as rr WHERE rr.restaurant_id=?`, {
          replacements: [value.id],
          // model: UserDetails,
          model: RestaurantRating,
          mapToModel: true,
          type: db.QueryTypes.SELECT
        });

        // console.log(rating[0].toJSON());
        let avgRating = rating[0].toJSON();
        value.avgRating = avgRating.avg_rating;
        value.ratingsCount = avgRating.ratings_count;

        const cuisines = await db.query(`SELECT c.name FROM restaurants_cuisines AS rc INNER JOIN cuisines AS c ON c.id=rc.cuisine_id WHERE rc.restaurant_id=?`, {
          replacements: [value.id],
          // model: UserDetails,
          model: RestaurantRating,
          mapToModel: true,
          type: db.QueryTypes.SELECT
        });

        value.cuisines = cuisines;
        // const is_rated = await db.query(`SELECT count(*) as is_rated FROM restaurant_ratings as rr WHERE rr.restaurant_id=? && rr.user_id`,{
        //   replacements: [value.restaurant.id, req.user.id],
        //   // model: UserDetails,
        //   model: RestaurantRating,
        //   mapToModel: true,
        //   type: db.QueryTypes.SELECT
        // });
        // let isRated = is_rated[0].toJSON();
        // value.restaurant.isRated = is_rated.is_rated;
        // console.log(value);
        // responseData.push(value);
        // console.log(responseData);
        // console.log(value);
        const latitude = value.latitude;
        const longitude = value.longitude;

        // value.distance = helper.distance(value.latitude, value.longitude, requestData.latitude, requestData.longitude, 'M');


        // if (requestData.latitude && requestData.longitude && requestData.latitude != "0.0" && requestData.longitude != "0.0") {
        //   var distance = require('google-distance');
        //   distance.apiKey = 'AIzaSyCkUXrw-xSPI5X5Maur19ttE3pXjHyQ_1U';
        //   const distanceData = await new Promise((res, rej) => {
        //     distance.get(
        //       {
        //         index: 1,
        //         origin: `${requestData.latitude},${requestData.longitude}`,
        //         destination: `${latitude},${longitude}`,
        //         units: 'imperial'
        //       },
        //       function (err, data) {
        //         if (err) {
        //           res(false)
        //           return console.log(err);
        //         };
        //         // console.log(data, '==================+>data');
        //         res(data);
        //       })
        //   });
        //   if (distanceData) {
        //     value.googleDistance = distanceData.distance;
        //     value.googleDistanceMeters = distanceData.distanceValue;
        //   } else {
        //     value.googleDistance = "0";
        //     value.googleDistanceMeters = 0;
        //   }
        // } else {
        //   value.googleDistance = "0";
        //   value.googleDistanceMeters = 0;
        // }
        return value;
        // responseData.push(value);
      });
      // console.log(responseData);

      return await Promise.all(responseData);
    }

    return responseData;
  },
  popularMerchants: async (req, res, requestData) => {
    const getRestaurants = await Restaurant.findAll({
      where: {
        isPopular: 1,
        hideStatus: 1,
        ...(
          requestData.hasOwnProperty('cuisineRestaurantIds') && requestData.cuisineRestaurantIds.length > 0
            ? {
              id: {
                $in: requestData.cuisineRestaurantIds,
              }
            } : {}
        ),
        ...(
          requestData.hasOwnProperty('searchKeyword') && requestData.searchKeyword
            ? {
              name: {
                $like: `%${requestData.searchKeyword}%`,
              }
            } : {}
        ),
      },
      attributes: {
        include: [
          [sequelize.literal(`IF( (SELECT COUNT(rf.id) FROM restaurants_favourite as rf WHERE rf.user_id=${req.user.id} && rf.restaurant_id=restaurants.id) >= 1, 1, 0)`), 'isFav'],
          ...(
            requestData.latitude && requestData.longitude
              ? [
                [
                  sequelize.literal(
                    `round( 
                      ( 3959 * acos( least(1.0,  
                        cos( radians(${requestData.latitude}) ) 
                        * cos( radians(restaurants.latitude) ) 
                        * cos( radians(restaurants.longitude) - radians(${requestData.longitude}) ) 
                        + sin( radians(${requestData.latitude}) ) 
                        * sin( radians(restaurants.latitude) 
                      ) ) ) 
                    ), 1)`
                  ),
                  "distance",
                ],
              ]
              : [[sequelize.literal(`0`), "distance"]]
          ),
        ],
      },
      include: [
        {
          model: models.restaurantImages,
          required: false,
        }
      ],
      // order: [[sequelize.col('distance'), 'ASC']],
      order: [[sequelize.literal('`distance`*1'), 'ASC']],
      // ...(
      //   requestData.limitPopular && requestData.pageAll
      //     ? {
      //       limit: parseInt(requestData.limitPopular),
      //       offset: (parseInt(requestData.pagePopular) - 1) * requestData.limitPopular
      //     } : {}
      // ),
    });

    // console.log(getRestaurants); return false;

    // res.status(200).json({
    //   'status': true,
    //   'code': 200,
    //   'message': 'Restaurants Listing.',
    //   'body': getRestaurants
    // });
    // console.log(getRestaurants); return false;

    let responseData = [];
    if (getRestaurants.length > 0) {
      responseData = getRestaurants.map(async value => {
        value = value.toJSON();
        // console.log(value);
        const rating = await db.query(`SELECT AVG(rating) as avg_rating, count(id) as ratings_count  FROM restaurant_ratings as rr WHERE rr.restaurant_id=?`, {
          replacements: [value.id],
          // model: UserDetails,
          model: RestaurantRating,
          mapToModel: true,
          type: db.QueryTypes.SELECT
        });
        // console.log(rating[0].toJSON());
        let avgRating = rating[0].toJSON();
        value.avgRating = avgRating.avg_rating;
        value.ratingsCount = avgRating.ratings_count;

        const cuisines = await db.query(`SELECT c.name FROM restaurants_cuisines AS rc INNER JOIN cuisines AS c ON c.id=rc.cuisine_id WHERE rc.restaurant_id=?`, {
          replacements: [value.id],
          // model: UserDetails,
          model: RestaurantRating,
          mapToModel: true,
          type: db.QueryTypes.SELECT
        });

        value.cuisines = cuisines;

        // const is_rated = await db.query(`SELECT count(*) as is_rated FROM restaurant_ratings as rr WHERE rr.restaurant_id=? && rr.user_id`,{
        //   replacements: [value.restaurant.id, req.user.id],
        //   // model: UserDetails,
        //   model: RestaurantRating,
        //   mapToModel: true,
        //   type: db.QueryTypes.SELECT
        // });
        // let isRated = is_rated[0].toJSON();
        // value.restaurant.isRated = is_rated.is_rated;
        // console.log(value);
        // responseData.push(value);
        // console.log(responseData);
        // console.log(value);
        const latitude = value.latitude;
        const longitude = value.longitude;

        // value.distance = helper.distance(value.latitude, value.longitude, requestData.latitude, requestData.longitude, 'M');

        // if (requestData.latitude && requestData.longitude && requestData.latitude != "0.0" && requestData.longitude != "0.0") {
        //   var distance = require('google-distance');
        //   distance.apiKey = 'AIzaSyCkUXrw-xSPI5X5Maur19ttE3pXjHyQ_1U';
        //   const distanceData = await new Promise((res, rej) => {
        //     distance.get(
        //       {
        //         index: 1,
        //         origin: `${requestData.latitude},${requestData.longitude}`,
        //         destination: `${latitude},${longitude}`,
        //         units: 'imperial'
        //       },
        //       function (err, data) {
        //         if (err) {
        //           res(false)
        //           return console.log(err);
        //         };
        //         // console.log(data, '==================+>data');
        //         res(data);
        //       })
        //   });
        //   if (distanceData) {
        //     value.googleDistance = distanceData.distance;
        //     value.googleDistanceMeters = distanceData.distanceValue;
        //   } else {
        //     value.googleDistance = "0";
        //     value.googleDistanceMeters = 0;
        //   }
        // } else {
        //   value.googleDistance = "0";
        //   value.googleDistanceMeters = 0;
        // }
        return value;
        // responseData.push(value);
      });
      // console.log(responseData);

      return await Promise.all(responseData);
    }

    return responseData;
  },
  getPopularRestaurants: async (req, res) => {
    try {
      const required = {
        security_key: req.headers.security_key,
      }
      const nonRequired = {
        latitude: req.query.latitude || 0,
        longitude: req.query.longitude || 0,
      };
      let requestData = await helper.vaildObject(required, nonRequired, res);
      // console.log(requestData);
      // return false;

      if (req.headers.hasOwnProperty('devicetype') && req.headers.devicetype && req.headers.hasOwnProperty('devicetoken') && req.headers.devicetoken && req.headers.hasOwnProperty('userid') && req.headers.userid) {
        await models.users.update(
          {
            deviceType: req.headers.devicetype,
            deviceToken: req.headers.devicetoken,
          },
          {
            where: {
              id: req.headers.userid
            }
          }
        );
      };

      const getRestaurants = await Restaurant.findAll({
        where: {
          isPopular: 1,
          hideStatus: 1
        },
      });

      // console.log(getRestaurants); return false;

      // res.status(200).json({
      //   'status': true,
      //   'code': 200,
      //   'message': 'Restaurants Listing.',
      //   'body': getRestaurants
      // });
      // console.log(getRestaurants); return false;

      let responseData = [];
      if (getRestaurants.length > 0) {
        responseData = getRestaurants.map(async value => {
          value = value.toJSON();
          // console.log(value);
          const rating = await db.query(`SELECT AVG(rating) as avg_rating, count(id) as ratings_count  FROM restaurant_ratings as rr WHERE rr.restaurant_id=?`, {
            replacements: [value.id],
            // model: UserDetails,
            model: RestaurantRating,
            mapToModel: true,
            type: db.QueryTypes.SELECT
          });
          // console.log(rating[0].toJSON());
          let avgRating = rating[0].toJSON();
          value.avgRating = avgRating.avg_rating;
          value.ratingsCount = avgRating.ratings_count;

          // const is_rated = await db.query(`SELECT count(*) as is_rated FROM restaurant_ratings as rr WHERE rr.restaurant_id=? && rr.user_id`,{
          //   replacements: [value.restaurant.id, req.user.id],
          //   // model: UserDetails,
          //   model: RestaurantRating,
          //   mapToModel: true,
          //   type: db.QueryTypes.SELECT
          // });
          // let isRated = is_rated[0].toJSON();
          // value.restaurant.isRated = is_rated.is_rated;
          // console.log(value);
          // responseData.push(value);
          // console.log(responseData);
          // console.log(value);
          const latitude = value.latitude;
          const longitude = value.longitude;
          if (requestData.latitude && requestData.longitude && requestData.latitude != "0.0" && requestData.longitude != "0.0") {
            var distance = require('google-distance');
            distance.apiKey = 'AIzaSyCkUXrw-xSPI5X5Maur19ttE3pXjHyQ_1U';
            const distanceData = await new Promise((res, rej) => {
              distance.get(
                {
                  index: 1,
                  origin: `${requestData.latitude},${requestData.longitude}`,
                  destination: `${latitude},${longitude}`,
                  units: 'imperial'
                },
                function (err, data) {
                  if (err) {
                    res(false)
                    return console.log(err);
                  };
                  // console.log(data, '==================+>data');
                  res(data);
                })
            });
            if (distanceData) {
              value.googleDistance = distanceData.distance;
              value.googleDistanceMeters = distanceData.distanceValue;
            } else {
              value.googleDistance = "0";
              value.googleDistanceMeters = 0;
            }
          } else {
            value.googleDistance = "0";
            value.googleDistanceMeters = 0;
          }
          return value;
          // responseData.push(value);
        });
        // console.log(responseData);

        await Promise.all(responseData)
          .then((results) => {
            // console.log("All done", results);
            // console.log(results);
            res.status(200).json({
              'status': true,
              'code': 200,
              'message': 'Popular Restaurants Listing.',
              'body': results
            });


          })
          .catch((e) => {
            console.log(e);
            helper.error(res, e);
            // Handle errors here
          });
      } else {
        res.status(200).json({
          'status': true,
          'code': 200,
          'message': 'Restaurants Listing.',
          'body': responseData
        });
      }



    } catch (err) {
      console.log(err);
      helper.error(res, err);
    }
  },

  getRestaurantListByCatId: async (req, res) => {
    try {
      const required = {
        security_key: req.headers.security_key,
        categoryId: req.params.categoryId,
        latitude: req.params.latitude,
        longitude: req.params.longitude,
      }
      const nonRequired = {};
      let requestData = await helper.vaildObject(required, nonRequired, res);
      // console.log(requestData);
      // return false;

      const getRestaurants = await RestaurantCategory.findAll({
        where: {
          categoryId: requestData.categoryId,
        },
        having: {
          // distance: {
          //   $lte : 30
          // }
        },
        attributes: [
          'restaurant.*',
          [
            sequelize.literal(
              "(SELECT (3959 *acos(cos( radians(" + requestData.latitude + ") ) * cos(radians( restaurant.latitude ) ) * cos(radians( restaurant.longitude ) - radians( " + requestData.longitude + " )) + sin(radians( " + requestData.latitude + " )) * sin(radians(restaurant.latitude)))) )"),
            "distance"
          ],
          [
            sequelize.literal(
              "(CAST( (SELECT (3959 *acos(cos( radians(" + requestData.latitude + ") ) * cos(radians( restaurant.latitude ) ) * cos(radians( restaurant.longitude ) - radians( " + requestData.longitude + " )) + sin(radians( " + requestData.latitude + " )) * sin(radians(restaurant.latitude)))) ) AS CHAR ) )"),
            "googleDistance"
          ],
          [
            sequelize.literal(
              "0"),
            "googleDistanceMeters"
          ],
        ],

        include: [{
          model: models.restaurants,
          // required: false,
          where: {
            // status: 1,
            hideStatus: 1
          },

          attributes: ['id', 'name', 'description', 'email', 'image', 'latitude', 'longitude', 'address', 'deliveryType', 'status', 'createdAt', 'updatedAt',
            // [sequelize.literal(' (3959 * acos ( '
            //       + 'cos( radians('+requestData.latitude+') ) '
            //       + '* cos( radians( restaurant.latitude ) ) '
            //       + '* cos( radians( restaurant.longitude ) - radians('+requestData.longitude+') )' 
            //       + '+ sin( radians('+requestData.latitude+') )' 
            //       + '* sin( radians( restaurant.latitude )))) ' ), 'distance']
          ],

        }],
        order: [[sequelize.literal('distance')]],

        group: ['restaurant.id'],
      });

      // console.log(getRestaurants); return false;

      // res.status(200).json({
      //   'status': true,
      //   'code': 200,
      //   'message': 'Restaurants Listing.',
      //   'body': getRestaurants
      // });


      let responseData = [];
      if (getRestaurants.length > 0) {
        responseData = getRestaurants.map(async value => {
          value = value.toJSON();
          // console.log(value);
          const rating = await db.query(`SELECT AVG(rating) as avg_rating, count(id) as ratings_count  FROM restaurant_ratings as rr WHERE rr.restaurant_id=?`, {
            replacements: [value.restaurant.id],
            // model: UserDetails,
            model: RestaurantRating,
            mapToModel: true,
            type: db.QueryTypes.SELECT
          });
          // console.log(rating[0].toJSON());
          let avgRating = rating[0].toJSON();
          value.restaurant.avgRating = avgRating.avg_rating;
          value.restaurant.ratingsCount = avgRating.ratings_count;

          // const is_rated = await db.query(`SELECT count(*) as is_rated FROM restaurant_ratings as rr WHERE rr.restaurant_id=? && rr.user_id`,{
          //   replacements: [value.restaurant.id, req.user.id],
          //   // model: UserDetails,
          //   model: RestaurantRating,
          //   mapToModel: true,
          //   type: db.QueryTypes.SELECT
          // });
          // let isRated = is_rated[0].toJSON();
          // value.restaurant.isRated = is_rated.is_rated;
          // console.log(value);
          // responseData.push(value);
          // console.log(responseData);


          // const latitude = value.restaurant.latitude;
          // const longitude = value.restaurant.longitude;

          // if (requestData.latitude && requestData.longitude) { 
          //   var distance = require('google-distance');
          //   distance.apiKey = 'AIzaSyCkUXrw-xSPI5X5Maur19ttE3pXjHyQ_1U';          
          //   let distanceData = await new Promise((res, rej) => {
          //     distance.get(
          //       {
          //         index: 1,
          //         origin: `${requestData.latitude},${requestData.longitude}`,
          //         destination: `${latitude},${longitude}`,
          //         units: 'imperial'
          //       },
          //       function(err, data) {
          //         if (err) {
          //           console.log(err);
          //           res(null);
          //         } 
          //         console.log(data, '==================+>data');
          //         res(data);
          //       })
          //   }); 
          //   if (!distanceData) return null;
          //   value.googleDistance = distanceData.distance;
          //   value.googleDistanceMeters = distanceData.distanceValue;
          // } else {
          //   value.googleDistance = "0";
          //   value.googleDistanceMeters = 0;
          // }
          return value;
          // responseData.push(value);
        });
        // console.log(responseData);

        await Promise.all(responseData)
          .then((results) => {
            results = results.filter(data => data != null);
            console.log(results, '=================>results');
            // console.log("All done", results);
            res.status(200).json({
              'status': true,
              'code': 200,
              'message': 'Restaurants Listing.',
              'body': results
            });


          })
          .catch((e) => {
            console.log(e);
            helper.error(res, e);
            // Handle errors here
          });
      } else {
        res.status(200).json({
          'status': true,
          'code': 200,
          'message': 'Restaurants Listing.',
          'body': responseData
        });
      }



    } catch (err) {
      console.log(err);
      helper.error(res, err);
    }
  },

  getRestaurantListByCuisineId: async (req, res) => {
    try {
      const required = {
        security_key: req.headers.security_key,
        cuisineId: req.params.cuisineId,
        latitude: req.params.latitude,
        longitude: req.params.longitude,
      }
      const nonRequired = {};
      let requestData = await helper.vaildObject(required, nonRequired, res);
      // console.log(requestData);
      // return false;

      const getRestaurants = await RestaurantCuisine.findAll({
        where: {
          cuisineId: requestData.cuisineId,
        },
        // having: {
        // distance: {
        //   $lte : 30
        // }
        // },
        attributes: [
          'restaurant.*',
          [
            sequelize.literal(
              "(SELECT (3959 *acos(cos( radians(" + requestData.latitude + ") ) * cos(radians( restaurant.latitude ) ) * cos(radians( restaurant.longitude ) - radians( " + requestData.longitude + " )) + sin(radians( " + requestData.latitude + " )) * sin(radians(restaurant.latitude)))) )"),
            "distance"
          ]
        ],

        include: [{
          model: models.restaurants,
          // required: false,
          where: {
            // status: 1,
            hideStatus: 1
          },
          attributes: ['id', 'name', 'description', 'email', 'image', 'latitude', 'longitude', 'status', 'createdAt', 'updatedAt',
            // [sequelize.literal(' (3959 * acos ( '
            //       + 'cos( radians('+requestData.latitude+') ) '
            //       + '* cos( radians( restaurant.latitude ) ) '
            //       + '* cos( radians( restaurant.longitude ) - radians('+requestData.longitude+') )' 
            //       + '+ sin( radians('+requestData.latitude+') )' 
            //       + '* sin( radians( restaurant.latitude )))) ' ), 'distance']
          ],

        }],
        order: [[sequelize.literal('distance')]],
        group: ['restaurant.id']
      });

      res.status(200).json({
        'status': true,
        'code': 200,
        'message': 'Restaurants Listing.',
        'body': getRestaurants
      });

    } catch (err) {
      console.log(err);
      helper.error(res, err);
    }
  },

  searchResturantList: async (req, res) => {

    try {
      const required = {
        security_key: req.headers.security_key,
        cuisineId: req.body.cuisineId,
      }
      const nonRequired = {
        searchString: req.body.searchString,
        latitude: req.body.latitude || 0,
        longitude: req.body.longitude || 0,
      };
      let requestData = await helper.vaildObject(required, nonRequired, res);
      // console.log(requestData); return false;

      requestData.cuisineId = JSON.parse(requestData.cuisineId);

      let getRestaurants = [];

      if (requestData.cuisineId.length > 0) {

        getRestaurants = await RestaurantCuisine.findAll({
          where: {
            cuisineId: {
              $in: requestData.cuisineId,
            }
          },
          attributes: [
            'restaurant.*',
            [
              sequelize.literal(
                "(CAST( (SELECT (3959 *acos(cos( radians(" + requestData.latitude + ") ) * cos(radians( restaurant.latitude ) ) * cos(radians( restaurant.longitude ) - radians( " + requestData.longitude + " )) + sin(radians( " + requestData.latitude + " )) * sin(radians(restaurant.latitude)))) ) AS CHAR ) )"),
              "googleDistance"
            ],
            [
              sequelize.literal(
                "0"),
              "googleDistanceMeters"
            ],
          ],
          group: ['id'],

          include: [{
            model: models.restaurants,
            // required: false,
            where: {
              // status: 1,
              hideStatus: 1,
              name: {
                $like: `%${requestData.searchString}%`
              }
            },
            //   attributes: ['id', 'name', 'description', 'email',  'image', 'latitude', 'longitude', 'createdAt', 'updatedAt',
            //   // sequelize.literal('(SELECT AVG(rating) FROM "RestaurantRating" WHERE "RestaurantRating"."restaurant_id" = "Restaurant"."id")'),
            //   // sequelize.literal(`(SELECT * FROM ${RestaurantRating})`) 
            //   // [sequelize.literal(' (3959 * acos ( '
            //   //       + 'cos( radians('+requestData.latitude+') ) '
            //   //       + '* cos( radians( restaurant.latitude ) ) '
            //   //       + '* cos( radians( restaurant.longitude ) - radians('+requestData.longitude+') )' 
            //   //       + '+ sin( radians('+requestData.latitude+') )' 
            //   //       + '* sin( radians( restaurant.latitude )))) ' ), 'distance']
            // ],

            // include: [{

            // }]

          }],
        });

        getRestaurants = getRestaurants.map(value => {
          return value.toJSON();
        });
        // console.log(getRestaurants); return false;
      } else {

        getRestaurants = await Restaurant.findAll({
          where: {
            // status: 1,
            hideStatus: 1,
            name: {
              $like: `%${requestData.searchString}%`
            }
          },
          // attributes: [
          //   'restaurant.*',
          // ],
          // group: ['id'], 

        });

        getRestaurants = getRestaurants.map(value => {
          value = value.toJSON();
          // return value['restaurant'] = value
          let restaurant = {
            restaurant: value
          };

          return restaurant;
        });
        // console.log(getRestaurants); return false;

      }


      let responseData = [];
      if (getRestaurants.length > 0) {
        responseData = getRestaurants.map(async value => {
          // value = value.toJSON();
          // console.log(value); return false;

          const rating = await db.query(`SELECT AVG(rating) as avg_rating, count(id) as ratings_count  FROM restaurant_ratings as rr WHERE rr.restaurant_id=?`, {
            replacements: [value.restaurant.id],
            // model: UserDetails,
            model: RestaurantRating,
            mapToModel: true,
            type: db.QueryTypes.SELECT
          });
          // console.log(rating[0].toJSON());
          let avgRating = rating[0].toJSON();
          value.restaurant.avgRating = avgRating.avg_rating;
          value.restaurant.ratingsCount = avgRating.ratings_count;

          // const latitude = value.restaurant.latitude;
          // const longitude = value.restaurant.longitude;

          // if (requestData.latitude && requestData.longitude && requestData.latitude != "0.0" && requestData.longitude != "0.0") {
          //   var distance = require('google-distance');
          //   distance.apiKey = 'AIzaSyCkUXrw-xSPI5X5Maur19ttE3pXjHyQ_1U';          
          //   const distanceData = await new Promise((res, rej) => {
          //     distance.get(
          //       {
          //         index: 1,
          //         origin: `${requestData.latitude},${requestData.longitude}`,
          //         destination: `${latitude},${longitude}`,
          //         units: 'imperial'
          //       },
          //       function(err, data) {
          //         if (err) {
          //           res(false);
          //           return console.log(err);
          //         }
          //         // console.log(data, '==================+>data');
          //         res(data);
          //       })
          //   }); 
          //   if (distanceData) {
          //     value.googleDistance = distanceData.distance;
          //     value.googleDistanceMeters = distanceData.distanceValue;
          //   } else {
          //     value.googleDistance = "0";
          //     value.googleDistanceMeters = 0;
          //   }
          // } else {
          //   value.googleDistance = "0";
          //   value.googleDistanceMeters = 0;
          // }
          return value
          // responseData.push(value);
        });
        // console.log(responseData);
        // console.log(responseData.length);

        await Promise.all(responseData)
          .then((results) => {
            // console.log("All done", results);

            res.status(200).json({
              'status': true,
              'code': 200,
              'message': 'Restaurants Listing.',
              'body': results
            });


          })
          .catch((e) => {
            console.log(e);
            helper.error(res, e);
            // Handle errors here
          });
      } else {
        return res.status(200).json({
          'status': true,
          'code': 200,
          'message': 'Restaurants Listing.',
          'body': responseData
        });

      }


      // res.status(200).json({
      //   'status': true,
      //   'code': 200,
      //   'message': 'Restaurants Listing.',
      //   'body': responseData
      // });

    } catch (err) {
      console.log(err);
      helper.error(res, err);
    }
  },

  getRestaurantDetails: async (req, res) => {
    try {
      const required = {
        security_key: req.headers.security_key,
        restaurantId: req.params.restaurantId,
      }
      const nonRequired = {};
      let requestData = await helper.vaildObject(required, nonRequired, res);

      let getRestaurant = await Restaurant.findOne({
        where: {
          id: requestData.restaurantId,
          // status: 1
        },
        order: [
          [models.menus, 'id', 'asc'],
          [models.menus, { model: models.items }, 'price', 'desc']
        ],
        attributes: [
          'id',
          'name',
          'description',
          'email',
          'phone',
          'image',
          'address',
          'city',
          'province',
          'country',
          'postalCode',
          'latitude',
          'longitude',
          'minDelivery',
          'open_time',
          'close_time',
          'acceptCash',
          'hideStatus',
          'offerTitle',
          'offerDescription',
          'status',
          'createdAt',
          'updatedAt',
          'isBe'
        ],
        include: [{
          model: models.menus,
          required: false,
          where: {
            status: 1
          },
          include: [{
            model: models.items,
            required: false,
            where: {
              // status: 1
            },
            // order: [
            //   [ models.items, { model: models.Image, as: 'CommunityLogoImages' }, 'price', 'asc' ]
            // ],
            // order: [
            //   ['price', 'ASC'],
            // ],
            include: [{
              model: models.itemImages,
              required: false,
              where: {
                // status: 1
              }
            },
            {
              model: models.menuItemAddons,
              required: false,
              where: {
                // status: 1
              },
              include: [{
                model: models.addonCategories,
                required: false,
                where: {
                  // status: 1
                }
              }]
            }],
          }],
        }],
      });

      // console.log(getRestaurant);
      // return false; 

      if (getRestaurant == null) {
        throw "Invalid value in the parameter restaurantId.";
      }


      let responseData = [];

      const rating = await db.query(`SELECT IFNULL(AVG(rating), 0) as avg_rating, count(id) as ratings_count  FROM restaurant_ratings as rr WHERE rr.restaurant_id=?`, {
        replacements: [getRestaurant.id],
        // model: UserDetails,
        model: RestaurantRating,
        mapToModel: true,
        type: db.QueryTypes.SELECT
      });
      // console.log(rating);
      // console.log(getRestaurant.dataValues.id);

      // console.log(`SELECT COUNT(id) as is_favourite FROM restaurants_favourite as rr WHERE user_id=? && restaurant_id=?`, [req.user.id, getRestaurant.id]);

      const is_favourite = await db.query(`SELECT COUNT(id) as is_favourite FROM restaurants_favourite WHERE user_id=? && restaurant_id=?`, {
        replacements: [req.user.id, getRestaurant.dataValues.id],
        // model: UserDetails,
        model: User,
        mapToModel: true,
        type: db.QueryTypes.SELECT
      });

      getRestaurant = getRestaurant.toJSON();

      getRestaurant.avgRating = rating[0].dataValues.avg_rating;
      getRestaurant.ratingsCount = rating[0].dataValues.ratings_count;
      getRestaurant.is_favourite = is_favourite[0].dataValues.is_favourite;

      // console.log(getRestaurant);

      if (getRestaurant.menus != null) {
        getRestaurant.menus = getRestaurant.menus.map(menus => {
          if (menus.items != null) {
            menus.items = menus.items.map(items => {
              items.categories = [];
              let categoriesObj = {};

              if (items.menuItemAddons != null) {
                items.menuItemAddons.map(addon => {
                  if (addon.addonCategory != null) {
                    if (categoriesObj.hasOwnProperty(addon.addonCategory.categoryName)) {
                      let categoryName = addon.addonCategory.categoryName;
                      delete addon.addonCategory;
                      categoriesObj[categoryName].addOnArray.push(addon);
                    } else {
                      let categoryName = addon.addonCategory.categoryName;
                      categoriesObj[categoryName] = addon.addonCategory;
                      delete addon.addonCategory;
                      categoriesObj[categoryName].addOnArray = [];
                      categoriesObj[categoryName].addOnArray.push(addon);
                    }
                  }
                });
              }
              delete items.menuItemAddons;

              items.categories = Object.values(categoriesObj);

              return items;
            });
          }
          return menus;
        });
      }


      res.status(200).json({
        'status': true,
        'code': 200,
        'message': 'Restaurant Details.',
        'body': getRestaurant == null ? {} : getRestaurant
      });

    } catch (err) {
      console.log(err);
      helper.error(res, err);
    }
  },

  getRestaurantDetailsWithoutToken: async (req, res) => {
    try {
      const required = {
        security_key: req.headers.security_key,
        restaurantId: req.params.restaurantId,
      }
      const nonRequired = {};
      let requestData = await helper.vaildObject(required, nonRequired, res);

      let getRestaurant = await Restaurant.findOne({
        where: {
          id: requestData.restaurantId,
          // status: 1
        },
        order: [
          [models.menus, 'id', 'asc'],
          [models.menus, { model: models.items }, 'price', 'desc']
        ],
        attributes: [
          'id',
          'name',
          'description',
          'email',
          'phone',
          'image',
          'address',
          'city',
          'province',
          'country',
          'postalCode',
          'latitude',
          'longitude',
          'minDelivery',
          'open_time',
          'close_time',
          'status',
          'createdAt',
          'updatedAt'
        ],
        include: [{
          model: models.menus,
          required: false,
          where: {
            status: 1
          },
          include: [{
            model: models.items,
            required: false,
            where: {
              // status: 1
            },
            // order: [
            //   [ models.items, { model: models.Image, as: 'CommunityLogoImages' }, 'price', 'asc' ]
            // ],
            // order: [
            //   ['price', 'ASC'],
            // ],
            include: [{
              model: models.itemImages,
              required: false,
              where: {
                // status: 1
              }
            }],
          }],
        }],
      });

      // console.log(getRestaurant);
      // return false; 

      if (getRestaurant == null) {
        throw "Invalid value in the parameter restaurantId.";
      }


      let responseData = [];

      const rating = await db.query(`SELECT IFNULL(AVG(rating), 0) as avg_rating, count(id) as ratings_count  FROM restaurant_ratings as rr WHERE rr.restaurant_id=?`, {
        replacements: [getRestaurant.id],
        // model: UserDetails,
        model: RestaurantRating,
        mapToModel: true,
        type: db.QueryTypes.SELECT
      });
      // console.log(rating);
      // console.log(getRestaurant.dataValues.id);

      // console.log(`SELECT COUNT(id) as is_favourite FROM restaurants_favourite as rr WHERE user_id=? && restaurant_id=?`, [req.user.id, getRestaurant.id]);

      // const is_favourite = await db.query(`SELECT COUNT(id) as is_favourite FROM restaurants_favourite WHERE user_id=? && restaurant_id=?`,{
      //   replacements: [req.user.id, getRestaurant.dataValues.id],
      //   // model: UserDetails,
      //   model: User,
      //   mapToModel: true,
      //   type: db.QueryTypes.SELECT
      // });

      getRestaurant = getRestaurant.toJSON();

      getRestaurant.avgRating = rating[0].dataValues.avg_rating;
      getRestaurant.ratingsCount = rating[0].dataValues.ratings_count;
      getRestaurant.is_favourite = 0;

      // console.log(getRestaurant);

      res.status(200).json({
        'status': true,
        'code': 200,
        'message': 'Restaurant Details.',
        'body': getRestaurant == null ? {} : getRestaurant
      });

    } catch (err) {
      console.log(err);
      helper.error(res, err);
    }
  },

  addRemoveFavouriteRestaurant: async (req, res) => {
    try {
      const required = {
        security_key: req.headers.security_key,
        restaurantId: req.body.restaurantId,
      }
      const nonRequired = {};
      let requestData = await helper.vaildObject(required, nonRequired, res);

      const restaurantExists = await Restaurant.findOne({
        where: {
          id: requestData.restaurantId,
          // status: 1
        },
      });

      if (restaurantExists == null) {
        throw "Invalid value in the parameter restaurantId.";
      }

      const addFavouriteRestaurantData = {
        userId: req.user.id,
        restaurantId: requestData.restaurantId
      }

      const favouriteRestaurantExists = await RestaurantFavourite.findOne({
        where: addFavouriteRestaurantData
      });

      let message;

      if (favouriteRestaurantExists != null) {
        message = "Restaurant removed from favourites successfully";
        await RestaurantFavourite.destroy({
          where: {
            id: favouriteRestaurantExists.dataValues.id
          }
        });
      } else {
        message = "Restaurant added to favourites successfully";;
        const addedFavouriteRestaurant = await RestaurantFavourite.create(addFavouriteRestaurantData);
      }

      return res.status(200).json({
        'status': true,
        'code': 200,
        'message': message,
        'body': {}
      });

    } catch (err) {
      console.log(err);
      helper.error(res, err);
    }
  },

  favouriteRestaurantsListing: async (req, res) => {
    try {
      const required = {
        security_key: req.headers.security_key,
      }
      const nonRequired = {};
      let requestData = await helper.vaildObject(required, nonRequired, res);

      // console.log(req.user.id); return false;

      const favouriteRestaurantsListing = await RestaurantFavourite.findAll({
        where: {
          userId: req.user.id,
        },
        include: [{
          where: {
            'id': {
              ne: null
            },
            hideStatus: 1
          },
          model: models.restaurants,
          attributes: [
            'id', 'name', 'description', 'email', 'phone', 'image', 'address', 'city', 'province', 'country', 'latitude', 'longitude', 'status', 'minDelivery'
          ]
        }]
      });
      // SELECT COUNT(id) as total_orders from orders WHERE restaurant_id=?

      // let abc = favouriteRestaurantsListing.map(favouriteRestaurantsListing => favouriteRestaurantsListing.toJSON());

      // console.log(abc); return false;

      let responseData = [];
      if (favouriteRestaurantsListing.length > 0) {
        responseData = favouriteRestaurantsListing.map(async value => {
          value = value.toJSON();
          // console.log(value); return false;
          const orders = await db.query(`SELECT COUNT(id) as total_orders from orders WHERE restaurant_id=?`, {
            replacements: [value.restaurant.id],
            // model: UserDetails,
            model: RestaurantRating,
            mapToModel: true,
            type: db.QueryTypes.SELECT
          });
          // console.log(value, '============+>value'); return false;

          const rating = await db.query(`SELECT IFNULL(AVG(rating), 0) as avg_rating, count(id) as ratings_count  FROM restaurant_ratings as rr WHERE rr.restaurant_id=?`, {
            replacements: [value.restaurant.id],
            // model: UserDetails,
            model: RestaurantRating,
            mapToModel: true,
            type: db.QueryTypes.SELECT
          });
          // console.log(rating[0].dataValues); return false;

          // console.log(rating[0].toJSON());
          let totalOrders = orders[0].toJSON();
          // console.log(totalOrders);
          // value.restaurant.avgRating = avgRating.avg_rating;
          // console.log(totalOrders);
          value.restaurant.totalOrders = totalOrders.total_orders;
          value.restaurant.avgRating = rating[0].dataValues.avg_rating;

          // const is_rated = await db.query(`SELECT count(*) as is_rated FROM restaurant_ratings as rr WHERE rr.restaurant_id=? && rr.user_id`,{
          //   replacements: [value.restaurant.id, req.user.id],
          //   // model: UserDetails,
          //   model: RestaurantRating,
          //   mapToModel: true,
          //   type: db.QueryTypes.SELECT
          // });
          // let isRated = is_rated[0].toJSON();
          // value.restaurant.isRated = is_rated.is_rated;
          // console.log(value);
          // responseData.push(value);
          // console.log(responseData);
          // console.log(value, '==========+>value');
          return value;
          // responseData.push(value);
        });
        // console.log(responseData); return false;

        await Promise.all(responseData)
          .then((results) => {
            // console.log("All done", results);
            // console.log(results);
            res.status(200).json({
              'status': true,
              'code': 200,
              'message': 'Favourite Restaurants Listing.',
              'body': results
            });


          })
          .catch((e) => {
            console.log(e);
            helper.error(res, e);
            // Handle errors here
          });
      } else {
        res.status(200).json({
          'status': true,
          'code': 200,
          'message': 'Favourite Restaurants Listing.',
          'body': responseData
        });
      }


      // return res.status(200).json({
      //   'status': true,
      //   'code': 200,
      //   'message': 'Favourite Restaurants Listing.',
      //   'body': favouriteRestaurantsListing
      // });

    } catch (err) {
      console.log(err);
      helper.error(res, err);
    }
  },

  addRestaurantRating: async (req, res) => {
    try {
      const required = {
        security_key: req.headers.security_key,
        restaurantId: req.body.restaurantId,
        rating: req.body.rating,
      }
      const nonRequired = {
        comment: req.body.comment
      };
      let requestData = await helper.vaildObject(required, nonRequired, res);

      const restaurantExists = await Restaurant.findOne({
        where: {
          id: requestData.restaurantId,
          // status: 1
        },
      });

      if (restaurantExists == null) {
        throw "Invalid value in the parameter restaurantId.";
      }

      const addRestaurantRatingData = {
        userId: req.user.id,
        restaurantId: requestData.restaurantId,
        rating: requestData.rating,
        comment: requestData.comment,
      }

      const deletePreviousRestaurantRatings = await RestaurantRating.destroy({
        where: {
          restaurantId: requestData.restaurantId,
          userId: req.user.id,
        }
      });

      const addRestaurantRating = await RestaurantRating.create(addRestaurantRatingData);

      // Uploading photo in the /public/images/users folder
      let image = "";
      // console.log(req.files.image); return false;
      if (req.files && req.files.image) {
        image = helper.fileUpload(req.files.image, 'users');
        let upOrder = await addRestaurantRating.update({ image: image },
          { returning: true, where: { id: addRestaurantRating.dataValues.id } });

        // console.log(up_user);
      }

      const addedRestaurantRating = await RestaurantRating.findOne({
        where: {
          id: addRestaurantRating.dataValues.id
        },
      });
      // console.log(addedRestaurantRating);

      addedRestaurantRating.image = req.protocol + '://' + req.get('host') + '/images/users/' + addedRestaurantRating.image;

      return res.status(200).json({
        'status': true,
        'code': 200,
        'message': 'Restaurant Rating added Successfully.',
        'body': addedRestaurantRating
      });

    } catch (err) {
      console.log(err);
      helper.error(res, err);
    }
  },

  restaurantRatingsListing: async (req, res) => {
    try {
      const required = {
        security_key: req.headers.security_key,
        restaurantId: req.params.restaurantId,
      }
      const nonRequired = {};
      let requestData = await helper.vaildObject(required, nonRequired, res);

      const restaurantExists = await Restaurant.findOne({
        where: {
          id: requestData.restaurantId,
          // status: 1
        },
      });

      if (restaurantExists == null) {
        throw "Invalid value in the parameter restaurantId.";
      }

      const restaurantRatingsListing = await RestaurantRating.findAll({
        where: {
          restaurantId: requestData.restaurantId
        },
        include: [
          {
            model: models.users,
            required: true,
            attributes: [
              'id', 'role', 'email', 'countryCode', 'phone', 'countryCodePhone', 'username', 'photo'
            ]
          }
        ]
      });
      // console.log(restaurantRatingsListing.toJSON()); return false;

      let response = [];
      if (restaurantRatingsListing.length > 0) {
        response = restaurantRatingsListing.map((value) => {
          // console.log(value.toJSON());



          value = value.toJSON();
          if (value.image != '') {
            value.image = req.protocol + '://' + req.get('host') + '/images/users/' + value.image;
          }
          if (value.user.photo != '') {
            value.user.photo = req.protocol + '://' + req.get('host') + '/images/users/' + value.user.photo;
          }
          return value;
        });
      }


      return res.status(200).json({
        'status': true,
        'code': 200,
        'message': 'Restaurant Ratings Listing.',
        'body': response
      });

    } catch (err) {
      console.log(err);
      helper.error(res, err);
    }
  },
  restaurantAcceptCashTime: async (req, res) => {
    try {
      const required = {
        security_key: req.headers.security_key,
        restaurantId: req.params.restaurantId,
      }
      const nonRequired = {};
      let requestData = await helper.vaildObject(required, nonRequired, res);

      const restaurantExists = await Restaurant.findOne({
        where: {
          id: requestData.restaurantId,
          // status: 1          
        },
        attributes: [
          'id',
          'acceptCash'
        ]
      });

      if (restaurantExists == null) {
        throw "Invalid value in the parameter restaurantId.";
      }


      return res.status(200).json({
        'status': true,
        'code': 200,
        'message': 'Restaurant Accept Cash Time.',
        'body': restaurantExists
      });

    } catch (err) {
      console.log(err);
      helper.error(res, err);
    }
  },
  getRestaurantOpenStatus: async (req, res) => {
    try {
      const required = {
        security_key: req.headers.security_key,
        restaurantId: req.body.restaurantId,
      }
      const nonRequired = {};
      let requestData = await helper.vaildObject(required, nonRequired, res);

      const restaurantExists = await Restaurant.findOne({
        where: {
          id: requestData.restaurantId,
          // status: 1          
        },
        attributes: [
          'id',
          'status'
        ]
      });

      if (restaurantExists == null) {
        throw "Invalid value in the parameter restaurantId.";
      }


      return res.status(200).json({
        'status': true,
        'code': 200,
        'message': 'Restaurant Open Status.',
        'body': restaurantExists
      });

    } catch (err) {
      console.log(err);
      helper.error(res, err);
    }
  },
}