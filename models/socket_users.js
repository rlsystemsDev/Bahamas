/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('socket_users', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		type: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			field: 'type',
			defaultValue: 1,
			comment: '1=>user, 2=>driver',
		},
		userId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'userId'
		},
		socketId: {
			type: DataTypes.STRING(50),
			allowNull: false,
			field: 'socketId'
		},
		isOnline: {
			type: DataTypes.STRING(128),
			allowNull: false,
			field: 'isOnline'
		},
		createdAt: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
			field: 'createdAt'
		},
		updatedAt: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
			field: 'updatedAt'
		}
	}, {
		tableName: 'socket_users'
	});
};
