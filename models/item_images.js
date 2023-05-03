/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('itemImages', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		itemId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'item_id'
		},
		image: {
			type: DataTypes.STRING(128),
			allowNull: false,
			field: 'image'
		},
		path: {
			type: DataTypes.STRING(128),
			allowNull: false,
			field: 'path'
		},
		status: {
			type: DataTypes.STRING(16),
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
		tableName: 'item_images'
	});
};
