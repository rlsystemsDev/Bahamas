/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('menuItemAddons', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		categoryId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'category_id'
		},
		menuItemId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'menu_item_id'
		},
		addon: {
			type: DataTypes.STRING(128),
			allowNull: false,
			field: 'addon'
		},
		price: {
			type: DataTypes.STRING(128),
			allowNull: false,
			field: 'price'
		},
		status: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'status'
		},
		isAddonRequired: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'is_addon_required'
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
		tableName: 'menu_item_addons'
	});
};
