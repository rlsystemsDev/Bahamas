/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('driverRatings', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		userId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'user_id',
			defaultValue: '0',
		},
		driverId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'driver_id',
			defaultValue: '0',
		},
		orderId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'order_id',
			defaultValue: '0',
		},
		rating: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'rating',
			defaultValue: '0',
		},
		comment: {
			type: DataTypes.TEXT,
			allowNull: false,
			field: 'comment',
			defaultValue: '',
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
		tableName: 'driver_ratings'
	});
};
