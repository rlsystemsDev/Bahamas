/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('orderDetails', {
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
			defaultValue: '0',
			field: 'order_id'
		},
		itemId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '0',
			field: 'item_id'
		},
		itemMenuId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '0',
			field: 'item_menu_id'
		},
		itemName: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue: '',
			field: 'item_name'
		},
		itemDescription: {
			type: DataTypes.TEXT,
			allowNull: false,
			field: 'item_description'
		},
		itemImage: {
			type: DataTypes.STRING(128),
			allowNull: false,
			field: 'item_image'
		},
		
		itemImagePath: {
			type: DataTypes.STRING(128),
			allowNull: false,
			field: 'item_image_path'
		},
		itemSpecialRequest: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue: '',
			field: 'itemSpecialRequest'
		},
		restaurantId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '0',
			field: 'restaurant_id'
		},
		quantity: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '0',
			field: 'quantity'
		},
		addons: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue: '',
			field: 'addons'
		},
		price: {
			type: DataTypes.STRING(100),
			allowNull: false,
			defaultValue: '',
			field: 'price'
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
		tableName: 'order_details'
	});
};
