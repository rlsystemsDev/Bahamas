/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('menuCategories', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			field: 'id'
		},
		restaurantId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'restaurant_id'
		},
		name: {
			type: DataTypes.STRING(100),
			allowNull: false,
			field: 'name'
		},
		image: {
			type: DataTypes.STRING(100),
			allowNull: false,
			field: 'image'
		},
		parentId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'parent_id'
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
			defaultValue: '0000-00-00 00:00:00',
			field: 'updated_at'
		}
	}, {
		tableName: 'menu_categories'
	});
};
