/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('orderDetailAddons', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		orderDetailId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'order_detail_id'
		},
		addonId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'addon_id'
		},
		itemId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'item_id'
		},
		quantity: {
			type: DataTypes.INTEGER(9),
			allowNull: false,
			field: 'quantity'
		},
		addon: {
			type: DataTypes.STRING(255),
			allowNull: false,
			field: 'addon'
		},
		addonCategory: {
			type: DataTypes.STRING(255),
			allowNull: false,
			field: 'addon_category'
		},
		price: {
			type: DataTypes.CHAR(40),
			allowNull: false,
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
		tableName: 'order_detail_addons'
	});
};
