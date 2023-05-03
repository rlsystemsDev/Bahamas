/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('contents', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		name: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue: ' ',
			field: 'name'
		},
		slug: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue: ' ',
			field: 'slug'
		},
		title: {
			type: DataTypes.STRING(255),
			allowNull: false,
			field: 'title'
		},
		content: {
			type: DataTypes.TEXT,
			allowNull: false,
			field: 'content'
		},
		type: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			field: 'type'
		},
		image: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue: ' ',
			field: 'image'
		},
		status: {
			type: DataTypes.INTEGER(4),
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
		tableName: 'contents'
	});
};
