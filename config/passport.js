const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./database');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const [users] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
        if (!users || users.length === 0) {
            return done(null, false);
        }
        done(null, users[0]);
    } catch (error) {
        done(error, null);
    }
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            console.log('Google Profile:', profile.id, profile.emails[0].value);

            // 1. Check if user exists by google_id
            const [users] = await db.query(
                'SELECT * FROM users WHERE google_id = ?',
                [profile.id]
            );

            if (users.length > 0) {
                console.log('User found by Google ID');
                return done(null, users[0]);
            }

            // 2. Check if user exists by email (to link account)
            const [existingEmail] = await db.query(
                'SELECT * FROM users WHERE email = ?',
                [profile.emails[0].value]
            );

            if (existingEmail.length > 0) {
                console.log('User found by email, linking Google ID...');
                // Update user with google_id
                await db.query(
                    'UPDATE users SET google_id = ?, avatar = ?, provider = ? WHERE email = ?',
                    [profile.id, profile.photos[0]?.value, 'google', profile.emails[0].value]
                );
                // Return updated user
                const [updatedUser] = await db.query('SELECT * FROM users WHERE email = ?', [profile.emails[0].value]);
                return done(null, updatedUser[0]);
            }

            // 3. Create new user if not exists
            console.log('Creating new user...');
            const [result] = await db.query(
                'INSERT INTO users (google_id, email, name, avatar, provider) VALUES (?, ?, ?, ?, ?)',
                [
                    profile.id,
                    profile.emails[0].value,
                    profile.displayName,
                    profile.photos[0]?.value,
                    'google'
                ]
            );

            const newUser = {
                id: result.insertId,
                google_id: profile.id,
                email: profile.emails[0].value,
                name: profile.displayName,
                avatar: profile.photos[0]?.value,
                provider: 'google'
            };

            done(null, newUser);
        } catch (error) {
            console.error('Passport Error:', error);
            done(error, null);
        }
    }
));

module.exports = passport;
