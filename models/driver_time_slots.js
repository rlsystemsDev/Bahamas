/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('driverTimeSlots', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true, 
			autoIncrement: true,
			field: 'id'
		},
		day: {
			type: DataTypes.STRING(128),
			allowNull: false,
			field: 'day'
		},
		status: {
			type: DataTypes.STRING(128),
			allowNull: false,
			field: 'status'
		},
		openTime: {
			type: DataTypes.STRING(128),
			allowNull: false,
			field: 'open_time'
		},
		closeTime: {
			type: DataTypes.STRING(128),
			allowNull: false,
			field: 'close_time'
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
		tableName: 'driver_time_slots'
	});
};
