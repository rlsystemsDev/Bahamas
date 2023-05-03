const model = require('../../models');
const helper = require('../../config/helper');
const Category = model.categories;
const Banner = model.banners;
const Cuisine = model.cuisines;
const Restaurant = model.restaurants;
var jwt = require('jsonwebtoken');
const db = require('../../models');
let secretKey = 'Bahamaeats';

module.exports = {
  getCategoriesBannersCuisines: async (req, res) => {
    try {
      const required = {
        security_key: req.headers.security_key,
      }
      const nonRequired = {};
      let requestData = await helper.vaildObject(required, nonRequired, res);

      const getCategories = await Category.findAll({
        where: {
          status: 1
        }
      });

      const getRestaurants = await Restaurant.findAll({
        where: {
          // status: 1
        }
      });
      // console.log(getRestaurants); return false;

      let restaurantIds = [];

      if (getRestaurants.length > 0) {
        restaurantIds = await getRestaurants.map(restaurant => {
          restaurant = restaurant.toJSON();
          return restaurant.id;
        });
      }
      // console.log(restaurantIds);return false;


      // console.log(getCategories);
      const getBanners = await Banner.findAll({
        where: {
          status: 1,
          restaurantId: {
            $in: restaurantIds,
          }
        }
      });
      const getCuisines = await Cuisine.findAll({
        where: {
          status: 1
        }
      });
      const offers = await db.offers.findAll({
        where: {
          // status: 1
        }
      });


      const userAddress = await db.addresses.findOne({
        where: {
          userId: req.user.id,
          isDefault: 1
        },
        raw: true
      });

      let address = {
        "id": 0,
        "isDefault": 0,
        "userId": 0,
        "countryCode": "",
        "alternateMobileNumber": "",
        "countryCodeAlternateMobileNumber": "",
        "country": "",
        "countryId": 0,
        "address": "",
        "completeAddress": "",
        "firstName": "",
        "lastName": "",
        "provience": "",
        "provienceId": 0,
        "city": "",
        "cityId": 0,
        "postalCode": 0,
        "latitude": "",
        "longitude": "",
        "deliveryInstructions": "",
        "createdAt": "",
        "updatedAt": "",
      };

      if (userAddress) {
        address = userAddress;
      }

      let getCategoriesBannersCuisines = {
        categories: getCategories,
        banners: getBanners,
        cuisines: getCuisines,
        offers,
        address
      }


      res.status(200).json({
        'status': true,
        'code': 200,
        'message': 'Categories Listing.',
        'body': getCategoriesBannersCuisines
      });

    } catch (err) {
      console.log(err);
      helper.error(res, err);
    }
  }

}