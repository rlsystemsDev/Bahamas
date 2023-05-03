/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('driverSlots', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		dayId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'day_id'
		},
		slotId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'slot_id'
		},
		driverId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'driver_id'
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
		tableName: 'driver_slots'
	});
};
