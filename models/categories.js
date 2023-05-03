/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('categories', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		name: {
			type: DataTypes.STRING(100),
			allowNull: false,
			defaultValue: '',
			field: 'name'
		},
		description: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue: '',
			field: 'description'
		},
		image: {
			type: DataTypes.STRING(128),
			allowNull: false,
			defaultValue: '',
			field: 'image'
		},
		banner: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue: '',
			field: 'banner'
		},
		status: {
			type: DataTypes.STRING(100),
			allowNull: false,
			defaultValue: '',
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
		tableName: 'categories'
	});
};
