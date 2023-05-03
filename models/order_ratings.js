/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('orderRatings', {
		id: {
			type: DataTypes.INTEGER(11),
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
		orderId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '0',
			field: 'order_id'
		},
		restaurantId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '0',
			field: 'restaurant_id'
		},
		rating: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '0',
			field: 'rating'
		},
		deliveryExperience: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue: '',
			field: 'deliveryExperience'
		},
		comment: {
			type: DataTypes.TEXT,
			allowNull: false,
			defaultValue: '',
			field: 'comment'
		},
		image: {
			type: DataTypes.STRING(100),
			allowNull: false,
			defaultValue: '',
			field: 'image'
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
		tableName: 'order_ratings'
	});
};
