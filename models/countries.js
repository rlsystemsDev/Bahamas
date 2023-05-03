/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('countries', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		sortname: {
			type: DataTypes.STRING(3),
			allowNull: false,
			field: 'sortname'
		},
		name: {
			type: DataTypes.STRING(150),
			allowNull: false,
			field: 'name'
		},
		phonecode: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'phonecode'
		}
	}, {
		tableName: 'countries'
	});
};
