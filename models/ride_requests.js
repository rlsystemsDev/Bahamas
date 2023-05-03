/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('rideRequests', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		orderId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'order_id'
		},
		userId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'user_id'
		},
		restaurantId: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			field: 'restaurant_id'
		},
		driverId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'driver_id'
		},
		addressId: {
			type: DataTypes.STRING(255),
			allowNull: false,
			field: 'address_id'
		},
		response: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'response'
		},
		rideStatus: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'ride_status'
		},
		fromLat: {
			type: DataTypes.STRING(100),
			allowNull: false,
			field: 'from_lat'
		},
		fromLong: {
			type: DataTypes.STRING(100),
			allowNull: false,
			field: 'from_long'
		},
		toLat: {
			type: DataTypes.STRING(100),
			allowNull: true,
			field: 'to_lat'
		},
		toLong: {
			type: DataTypes.STRING(100),
			allowNull: true,
			field: 'to_long'
		},
		currentLat: {
			type: DataTypes.STRING(255),
			allowNull: true,
			field: 'current_lat'
		},
		currentLong: {
			type: DataTypes.STRING(255),
			allowNull: true,
			field: 'current_long'
		},
		createdAt: {
			type: DataTypes.STRING(255),
			allowNull: true,
			// defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
			field: 'created_at'
		},
		updatedAt: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
			field: 'updated_at'
		},
		completedAt: {
			type: DataTypes.STRING(255),
			allowNull: true,
			//defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
			field: 'completedAt'
		}
	}, {
		// timestamps:false,
		tableName: 'ride_requests'
	});
};
