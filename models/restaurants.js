/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
	const restaurants = sequelize.define('restaurants', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		name: {
			type: DataTypes.STRING(100),
			allowNull: false,
			field: 'name'
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: true,
			field: 'description'
		},
		email: {
			type: DataTypes.STRING(100),
			allowNull: false,
			field: 'email'
		},
		phone: {
			type: DataTypes.STRING(128),
			allowNull: true,
			field: 'phone'
		},
		password: {
			type: DataTypes.STRING(255),
			allowNull: false,
			field: 'password'
		},
		image: {
			type: DataTypes.STRING(100),
			allowNull: true,
			field: 'image'
		},
		address: {
			type: DataTypes.STRING(100),
			allowNull: true,
			field: 'address'
		},
		city: {
			type: DataTypes.STRING(100),
			allowNull: true,
			field: 'city'
		},
		province: {
			type: DataTypes.STRING(100),
			allowNull: true,
			field: 'province'
		},
		country: {
			type: DataTypes.STRING(100),
			allowNull: true,
			field: 'country'
		},
		postalCode: {
			type: DataTypes.STRING(64),
			allowNull: true,
			field: 'postal_code'
		},
		totalCredit: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue: '0',
			field: 'total_credit'
		},
		featured: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			field: 'featured'
		},
		cuisineId: {
			type: DataTypes.STRING(128),
			allowNull: true,
			field: 'cuisine_id'
		},
		latitude: {
			type: DataTypes.STRING(100),
			allowNull: true,
			field: 'latitude'
		},
		longitude: {
			type: DataTypes.STRING(100),
			allowNull: true,
			field: 'longitude'
		},
		tax: {
			type: DataTypes.STRING(100),
			allowNull: true,
			field: 'tax'
		},
		minDelivery: {
			type: DataTypes.STRING(100),
			allowNull: true,
			field: 'min_delivery'
		},
		serviceFee: {
			type: DataTypes.STRING(100),
			allowNull: true,
			field: 'service_fee'
		},
		minOrderAmount: {
			type: DataTypes.STRING(100),
			allowNull: true,
			field: 'min_order_amount'
		},
		openTime: {
			type: DataTypes.STRING(100),
			allowNull: true,
			field: 'open_time'
		},
		closeTime: {
			type: DataTypes.STRING(100),
			allowNull: true,
			field: 'close_time'
		},
		acceptCash: {
			type: DataTypes.STRING(100),
			allowNull: true,
			field: 'accept_cash'
		},
		commissionType: {
			type: DataTypes.INTEGER(4),
			allowNull: true,
			field: 'commission_type'
		},
		deliveryType: {
			type: DataTypes.INTEGER(4),
			allowNull: true,
			field: 'delivery_type'
		},
		deliveryStatus: {
			type: DataTypes.INTEGER(4),
			allowNull: true,
			field: 'deliveryStatus'
		},
		
		isPopular: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			field: 'is_popular'
		},
		isAvailable: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			field: 'is_available'
		},
		status: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			field: 'status'
		},
		paymentType: {
			type: DataTypes.STRING(20),
			allowNull: true,
			field: 'payment_type'
		},
		hideStatus: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			field: 'hide_status',
			defaultValue: 1,
			// comment: 1=>suncash,2=>paypal,4=>kanooPays
		},
		rememberToken: {
			type: DataTypes.STRING(128),
			allowNull: true,
			field: 'remember_token'
		},
		offerTitle: {
			type: DataTypes.STRING(128),
			allowNull: true,
			field: 'offer_title'
		},
		offerDescription: {
			type: DataTypes.STRING(128),
			allowNull: true,
			field: 'offer_description'
		},
		isBe: {
			type: DataTypes.STRING(128),
			allowNull: true,
			field: 'is_be'
		},
		distanceLimit: {
			type: DataTypes.STRING(128),
			allowNull: true,
			field: 'distance_limit'
		},
		createdAt: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
			field: 'created_at'
		},
		updatedAt: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
			field: 'updated_at'
		}
	}, {
		tableName: 'restaurants'
	});

	restaurants.associate = models => {
		restaurants.hasMany(models.restaurantImages, { foreingKey: 'restaurantId' });
	};

	return restaurants;
};


// /* jshint indent: 1 */

// module.exports = function(sequelize, DataTypes) {
// 	return sequelize.define('restaurants', {
// 		id: {
// 			type: DataTypes.INTEGER(11),
// 			allowNull: false,
// 			primaryKey: true,
// 			autoIncrement: true,
// 			field: 'id'
// 		},
// 		name: {
// 			type: DataTypes.STRING(100),
// 			allowNull: false,
// 			field: 'name'
// 		},
// 		description: {
// 			type: DataTypes.TEXT,
// 			allowNull: true,
// 			field: 'description'
// 		},
// 		email: {
// 			type: DataTypes.STRING(100),
// 			allowNull: false,
// 			field: 'email'
// 		},
// 		phone: {
// 			type: DataTypes.STRING(128),
// 			allowNull: true,
// 			field: 'phone'
// 		},
// 		password: {
// 			type: DataTypes.STRING(255),
// 			allowNull: false,
// 			field: 'password'
// 		},
// 		image: {
// 			type: DataTypes.STRING(100),
// 			allowNull: true,
// 			field: 'image'
// 		},
// 		address: {
// 			type: DataTypes.STRING(100),
// 			allowNull: true,
// 			field: 'address'
// 		},
// 		city: {
// 			type: DataTypes.STRING(100),
// 			allowNull: true,
// 			field: 'city'
// 		},
// 		province: {
// 			type: DataTypes.STRING(100),
// 			allowNull: true,
// 			field: 'province'
// 		},
// 		country: {
// 			type: DataTypes.STRING(100),
// 			allowNull: true,
// 			field: 'country'
// 		},
// 		postalCode: {
// 			type: DataTypes.STRING(64),
// 			allowNull: true,
// 			field: 'postal_code'
// 		},
// 		totalCredit: {
// 			type: DataTypes.STRING(255),
// 			allowNull: true,
// 			defaultValue: '0',
// 			field: 'total_credit'
// 		},
// 		featured: {
// 			type: DataTypes.INTEGER(11),
// 			allowNull: true,
// 			field: 'featured'
// 		},
// 		cuisineId: {
// 			type: DataTypes.STRING(128),
// 			allowNull: true,
// 			field: 'cuisine_id'
// 		},
// 		latitude: {
// 			type: DataTypes.STRING(100),
// 			allowNull: true,
// 			field: 'latitude'
// 		},
// 		longitude: {
// 			type: DataTypes.STRING(100),
// 			allowNull: true,
// 			field: 'longitude'
// 		},
// 		tax: {
// 			type: DataTypes.STRING(100),
// 			allowNull: true,
// 			field: 'tax'
// 		},
// 		minDelivery: {
// 			type: DataTypes.STRING(100),
// 			allowNull: true,
// 			field: 'min_delivery'
// 		},
// 		serviceFee	: {
// 			type: DataTypes.STRING(100),
// 			allowNull: true,
// 			field: 'service_fee'
// 		},
// 		minOrderAmount	: {
// 			type: DataTypes.STRING(100),
// 			allowNull: true,
// 			field: 'min_order_amount'
// 		},
// 		openTime: {
// 			type: DataTypes.STRING(100),
// 			allowNull: true,
// 			field: 'open_time'
// 		},
// 		closeTime: {
// 			type: DataTypes.STRING(100),
// 			allowNull: true,
// 			field: 'close_time'
// 		},
// 		acceptCash: {
// 			type: DataTypes.STRING(100),
// 			allowNull: true,
// 			field: 'accept_cash'
// 		},
// 		commissionType: {
// 			type: DataTypes.INTEGER(4),
// 			allowNull: true,
// 			field: 'commission_type'
// 		},
// 		deliveryType: {
// 			type: DataTypes.INTEGER(4),
// 			allowNull: true,
// 			field: 'delivery_type'
// 		},
// 		deliveryStatus: {
// 			type: DataTypes.INTEGER(4),
// 			allowNull: true,
// 			field: 'deliveryStatus'
// 		},
// 		isPopular: {
// 			type: DataTypes.INTEGER(11),
// 			allowNull: true,
// 			field: 'is_popular'
// 		},
// 		status: {
// 			type: DataTypes.INTEGER(11),
// 			allowNull: true,
// 			field: 'status'
// 		},
// 		hideStatus: {
// 			type: DataTypes.INTEGER(11),
// 			allowNull: true,
// 			field: 'hide_status'
// 		},
// 		rememberToken: {
// 			type: DataTypes.STRING(128),
// 			allowNull: true,
// 			field: 'remember_token'
// 		},
// 		createdAt: {
// 			type: DataTypes.DATE,
// 			allowNull: false,
// 			defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
// 			field: 'created_at'
// 		},
// 		updatedAt: {
// 			type: DataTypes.DATE,
// 			allowNull: false,
// 			defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
// 			field: 'updated_at'
// 		}
// 	}, {
// 		tableName: 'restaurants'
// 	});
// };
