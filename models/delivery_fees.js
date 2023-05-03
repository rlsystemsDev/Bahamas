/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('deliveryFees', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		resturantId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'restaurant_id'
		},
		distanceFrom: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'distance_from'
		},
		distanceTo: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'distance_to'
		},
		price: {
			type: DataTypes.STRING(64),
			allowNull: false,
			field: 'price'
		},
		extra_charges: {
			type: DataTypes.DOUBLE,
			allowNull: true,
			field: 'extra_charges'
		},
		createdAt: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
			field: 'created_at'
		},
		updatedAt: {
			type: DataTypes.DATE,
			allowNull: true,
			field: 'updated_at'
		}
	}, {
		tableName: 'delivery_fees'
	});
};
