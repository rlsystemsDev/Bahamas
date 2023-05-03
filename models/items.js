/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('items', {
		id: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		menuId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'menu_id'
		},
		restaurantId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'restaurant_id'
		},
		cusineId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'cusine_id'
		},
		name: {
			type: DataTypes.STRING(100),
			allowNull: false,
			field: 'name'
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: false,
			field: 'description'
		},
		price: {
			type: DataTypes.FLOAT,
			allowNull: false,
			field: 'price'
		},
		stock: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'stock'
		},
		image: {
			type: DataTypes.STRING(100),
			allowNull: false,
			field: 'image'
		},
		status: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'status'
		},
		limits: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'limits'
		},
		ingredients: {
			type: DataTypes.TEXT,
			allowNull: false,
			field: 'ingredients'
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
		tableName: 'items'
	});
};
