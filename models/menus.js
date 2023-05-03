/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('menus', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		restaurantId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'restaurant_id'
		},
		cuisineId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'cuisine_id'
		},
		name: {
			type: DataTypes.STRING(128),
			allowNull: false,
			field: 'name'
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: false,
			field: 'description'
		},
		image: {
			type: DataTypes.STRING(128),
			allowNull: true,
			field: 'image'
		},
		status: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'status'
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
		tableName: 'menus'
	});
};
