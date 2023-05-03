/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('banners', {
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
		path: {
			type: DataTypes.STRING(128),
			allowNull: false,
			field: 'path'
		},
		image: {
			type: DataTypes.STRING(128),
			allowNull: false,
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
		tableName: 'banners'
	});
};
