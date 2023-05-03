/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('users', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		isAccountVerified: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			defaultValue: 0,
			field: 'isAccountVerified'
		},
		role: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '2',
			field: 'role'
		},
		firstName: {
			type: DataTypes.STRING(100),
			allowNull: false,
			defaultValue: '',
			field: 'first_name'
		},
		lastName: {
			type: DataTypes.STRING(100),
			allowNull: false,
			defaultValue: '',
			field: 'last_name'
		},
		fullName: {
			type: DataTypes.STRING(100),
			allowNull: false,
			defaultValue: '',
			field: 'full_name'
		},
		loginType: {
			type: DataTypes.INTEGER(1),
			allowNull: false,
			defaultValue: 0,
			field: 'login_type'
		},
		email: {
			type: DataTypes.STRING(100),
			allowNull: false,
			defaultValue: '',
			field: 'email'
		},
		countryCode: {
			type: DataTypes.STRING(40),
			allowNull: false,
			defaultValue: '',
			field: 'country_code'
		},
		phone: {
			type: DataTypes.STRING(100),
			allowNull: false,
			defaultValue: '',
			field: 'phone'
		},
		countryCodePhone: {
			type: DataTypes.STRING(40),
			allowNull: false,
			defaultValue: '',
			field: 'country_code_phone'
		},
		username: {
			type: DataTypes.STRING(100),
			allowNull: false,
			defaultValue: '',
			field: 'username'
		},
		postalCode: {
			type: DataTypes.STRING(100),
			allowNull: false,
			defaultValue: '',
			field: 'postal_code'
		},
		password: {
			type: DataTypes.STRING(100),
			allowNull: false,
			defaultValue: '',
			field: 'password'
		},
		address: {
			type: DataTypes.STRING(256),
			allowNull: true,
			defaultValue: '',
			field: 'address'
		},
		city: {
			type: DataTypes.STRING(100),
			allowNull: false,
			defaultValue: '',
			field: 'city'
		},
		province: {
			type: DataTypes.STRING(100),
			allowNull: false,
			defaultValue: '',
			field: 'province'
		},
		country: {
			type: DataTypes.STRING(100),
			allowNull: false,
			defaultValue: '',
			field: 'country'
		},
		latitude: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue: '',
			field: 'latitude'
		},
		longitude: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue: '',
			field: 'longitude'
		},
		totalCredit: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue: '0',
			field: 'total_credit'
		},
		adminShare: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue: '0',
			field: 'admin_share'
		},
		ipAddress: {
			type: DataTypes.STRING(50),
			allowNull: false,
			defaultValue: '',
			field: 'ip_address'
		},
		photo: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue: '',
			field: 'photo'
		},
		status: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: 1,
			field: 'status'
		},
		phoneVerified: {
			type: DataTypes.STRING(50),
			allowNull: false,
			defaultValue: '',
			field: 'phone_verified'
		},
		forgotPasswordHash: {
			type: DataTypes.STRING(100),
			allowNull: false,
			defaultValue: '',
			field: 'forgot_password_hash'
		},
		rememberToken: {
			type: DataTypes.STRING(100),
			allowNull: false,
			defaultValue: '',
			field: 'remember_token'
		},
		deviceType: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: 0,
			field: 'device_type'
		},
		deviceToken: {
			type: DataTypes.TEXT,
			allowNull: false,
			defaultValue: '',
			field: 'device_token'
		},
		facebookId: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue: '',
			field: 'facebookId'
		},
		googleId: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue: '',
			field: 'googleId'
		},
		socialId: {
			type: DataTypes.STRING(40),
			allowNull: false,
			defaultValue: '',
			field: 'social_id'
		},
		socialType: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			defaultValue: 0,
			field: 'social_type'
		},
		isNotification: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			defaultValue: 0,
			field: 'is_notification'
		},
		paymentMethod: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			defaultValue: 0,
			field: 'payment_method'
		},
		wrongAttemptBlock: {
			type: DataTypes.STRING(10),
			allowNull: false,
			defaultValue: 0,
			field: 'wrong_attempt_block'
		},
		wrongAttemptCount: {
			type: DataTypes.STRING(10),
			allowNull: false,
			defaultValue: 0,
			field: 'wrong_attempt_count'
		},
		otp: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			defaultValue: 0,
			field: 'otp'
		},
		otpVerified: {
			type: DataTypes.INTEGER(1),
			allowNull: false,
			defaultValue: 0,
			field: 'otp_verified'
		},
		registerDate: {
			type: DataTypes.DATEONLY,
			allowNull: true,
			// defaultValue: ,
			field: 'register_date'
		},
		socketId: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue: 0,
			field: 'socket_id'
		},
		isOnline: {
			type: DataTypes.STRING(10),
			allowNull: true,
			defaultValue: 0,
			field: 'is_online'
		},
		walletAmount: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue: 0,
			field: 'wallet_amount'
		},
		walletPin: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue: 0,
			field: 'wallet_pin'
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
		tableName: 'users'
	});
};
