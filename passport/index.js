const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const db = require('../models');
const User = db.users;
const Driver = db.drivers;
const opts = {};

opts.jwtFromRequest = ExtractJWT.fromAuthHeaderAsBearerToken();
opts.secretOrKey = 'secret';
module.exports = passport => {
	passport.use('user', new JWTStrategy(opts,
		async function (jwt_payload, done) {
			try {		
				const getUser = await User.findOne(
					{
						where: {
							id: jwt_payload.data.id,
							email: jwt_payload.data.email,
							status: 1
						}
					});
					console.log(getUser);

				if (getUser) {
					return done(null, getUser.dataValues);
				}
				return done(null, false);
			} catch (e) {
				console.log('not local');
				console.error(e);
			}
		}
	));
		
	passport.use('driver', new JWTStrategy(opts,
		async function (jwt_payload, done) {
			try {
				const getDriver = await Driver.findOne(
					{
					where: {
						id: jwt_payload.data.id,
						email: jwt_payload.data.email
					}
				});
				if (getDriver) {
					return done(null, getDriver.dataValues);
				}
				return done(null, false);
			} catch (e) {
				console.log('not local');
				console.error(e);
			}
		}
	));

	// passport.use(new JWTStrategy(opts, async (jwt_payload, done) => {
	// 	try {
	// 		const getuser = await User.findOne(
	// 			{
	// 				where: {
	// 					id: jwt_payload.data.id,
	// 					email: jwt_payload.data.email
	// 				}
	// 			});

	// 		if (getuser) {
	// 			return done(null, getuser.dataValues);
	// 		}

	// 		const getDriver = await Driver.findOne(
	// 			{
	// 			where: {
	// 				id: jwt_payload.data.id,
	// 				email: jwt_payload.data.email
	// 			}
	// 		});
	// 		if (getDriver) {
	// 			return done(null, getDriver.dataValues);
	// 		}

	// 		return done(null, false);
	// 	} catch (e) {
	// 		console.log('not local');
	// 		console.error(e);
	// 	}
	// }));
}