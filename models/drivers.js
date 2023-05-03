/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    "drivers",
    {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: "id"
      },
      firstName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: "first_name",
        defaultValue: ""
      },
      lastName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: "last_name",
        defaultValue: ""
      },
      fullName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: "full_name",
        defaultValue: ""
      },
      loginType: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        field: "login_type",
        defaultValue: 0
      },
      countryCode: {
        type: DataTypes.CHAR(40),
        allowNull: false,
        field: "country_code",
        defaultValue: ""
      },
      contactNo: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: "contact_no",
        defaultValue: ""
      },
      countryCodePhone: {
        type: DataTypes.CHAR(40),
        allowNull: false,
        field: "country_code_phone",
        defaultValue: ""
      },
      username: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: "username",
        defaultValue: ""
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: "email",
        defaultValue: ""
      },
      address: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: "address",
        defaultValue: ""
      },
      status: {
        type: DataTypes.INTEGER(4),
        allowNull: false,
        field: "status",
        defaultValue: "0"
      },
      password: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: "0",
        field: "password"
      },
      driverIdentity: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: "driver_identity",
        defaultValue: ""
      },
      isDocumentVerified: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        field: "is_document_verified",
        defaultValue: 0
      },
      image: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: "image",
        defaultValue: ""
      },
      carInsurance: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: "carInsurance",
        defaultValue: ""
      },
      policeRecord: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: "policeRecord",
        defaultValue: ""
      },
      isDriverLicenseApproved: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        field: "isDriverLicenseApproved",
        defaultValue: 0,
        comment: '0=>pending, 1=>approved, 2=>disapproved',
      },
      isCarInsuranceApproved: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        field: "isCarInsuranceApproved",
        defaultValue: 0,
        comment: '0=>pending, 1=>approved, 2=>disapproved',
      },
      isPoliceReportApproved: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        field: "isPoliceReportApproved",
        defaultValue: 0,
        comment: '0=>pending, 1=>approved, 2=>disapproved',
      },
      isDriverIdApproved: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        field: "isDriverIdApproved",
        defaultValue: 0,
        comment: '0=>pending, 1=>approved, 2=>disapproved',
      },
      latitude: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "0",
        field: "latitude",
        defaultValue: ""
      },
      longitude: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "0",
        field: "longitude",
        defaultValue: ""
      },
      availability: {
        type: DataTypes.INTEGER(4),
        allowNull: false,
        defaultValue: "0",
        field: "availability"
      },
      isApproved: {
        type: DataTypes.INTEGER(4),
        allowNull: false,
        defaultValue: "0",
        field: "is_approved"
      },
      isNotification: {
        type: DataTypes.INTEGER(4),
        allowNull: false,
        defaultValue: "0",
        field: "is_notification"
      },
      socialId: {
        type: DataTypes.STRING(128),
        allowNull: false,
        field: "social_id",
        defaultValue: ""
      },
      socialType: {
        type: DataTypes.INTEGER(4),
        allowNull: false,
        field: "social_type",
        defaultValue: 0
      },
      deviceType: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        field: "device_type",
        defaultValue: 0
      },
      deviceToken: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: "device_token",
        defaultValue: ""
      },
      city: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: "",
        field: "city"
      },
      province: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: "",
        field: "province"
      },
      country: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: "",
        field: "country"
      },
      postalCode: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: "0",
        field: "postal_code"
      },
      paymentStatus: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        field: "payment_status",
        defaultValue: "0"
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
      takeOrderStatus: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        field: "take_order_status",
        defaultValue: "0"
      },
      otp: {
        type: DataTypes.INTEGER(4),
        allowNull: true,
        field: "otp",
        defaultValue: "0"
      },
      otpVerified: {
        type: DataTypes.INTEGER(1),
        allowNull: true,
        field: "otp_verified",
        defaultValue: "0"
      },
      forgotPasswordHash: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: "",
        field: "forgot_password_hash"
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
        field: "created_at"
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
        field: "updated_at"
      }
      // updatedAt: {
      // 	type: DataTypes.DATE,
      // 	allowNull: false,
      // 	defaultValue: '0000-00-00 00:00:00',
      // 	field: 'updated_at'
      // }
    },
    {
      tableName: "drivers",
      timestamps: false
    }
  );
};
