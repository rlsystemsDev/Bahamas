/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('contactuses', {
		id: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		userId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '0',
			field: 'user_id'
		},
		name: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue: '',
			field: 'name'
		},
		email: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue: '',
			field: 'email'
		},
		phone: {
			type: DataTypes.CHAR(40),
			allowNull: false,
			defaultValue: '',
			field: 'phone'
		},
		subject: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue: '',
			field: 'subject'
		},
		message: {
			type: DataTypes.TEXT,
			allowNull: false,
			defaultValue: '',
			field: 'message'
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
		tableName: 'contactuses'
	});
};
