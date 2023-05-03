/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('assignedRestaurants', {
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
		restaurantId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'restaurant_id',
			defaultValue: '0',
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
		tableName: 'assigned_restaurants'
	});
};
