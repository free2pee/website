// lib/passport.ts
import passport from 'passport';
import { Strategy as OpenStreetMapStrategy } from 'passport-openstreetmap';
import axios from 'axios';

// load this from environment variables or config files (don't hard-code them)
const openStreetMapConsumerKey = "YOUR_CONSUMER_KEY";
const openStreetMapConsumerSecret = "YOUR_CONSUMER_SECRET";

passport.use(
    new OpenStreetMapStrategy(
        {
            consumerKey: openStreetMapConsumerKey,
            consumerSecret: openStreetMapConsumerSecret,
            callbackURL: "http://localhost:3000/auth/callback",
        },
        async (token, tokenSecret, profile, done) => {
            let user;

            // Here, you could use token and tokenSecret to make calls to the OpenStreetMap API
            // or add the profile data and tokens to your application DB.

            // Instead, we'll make a request for some user details to demonstrate API access
            const response = await axios.get('https://api.openstreetmap.org/api/0.6/user/details', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            user = { ...profile, additionalData: response.data };

            done(null, user);
        }
    )
);
passport.serializeUser((user, done) => {
    done(null, user);
});
passport.deserializeUser((user, done) => {
    done(null, user);
});

export default passport;