const db = require('../models');
const User = db.users;
const LocalStrategy = require('passport-local').Strategy;

const strategy = new LocalStrategy(
	{
		usernameField: 'email' // not necessary, DEFAULT
	},
	async function(email, password, done) {
		try {
			const getuser = await User.findOne(
				{ where: {
						email: email
					} 
				});

				console.log('local 1');
				if (!getuser) {
					return done(null, false, { message: 'Incorrect username' });
				}

				
				return done(null, getuser.dataValues);
		} catch (e) {
			console.log('local');
			return done(e);
		}
	}
)

module.exports = strategy
