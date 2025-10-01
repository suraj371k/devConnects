import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.model";
import dotenv from 'dotenv'

dotenv.config({path: '.env'});

const callbackURL =
  process.env.GOOGLE_CALLBACK_URL ||
  "http://localhost:7000/api/auth/google/callback";

passport.use( 
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      callbackURL,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const primaryEmail = profile.emails?.[0]?.value;

        if (!primaryEmail) {
          return done(new Error("No email provided by Google"), undefined);
        }

        let user = await User.findOne({ email: primaryEmail });

        if (!user) {
          // Check if an account exists to link
          const existingUser = await User.findOne({ email: primaryEmail });
          if (existingUser) {
            existingUser.googleId = profile.id;
            await existingUser.save();
            return done(null, existingUser);
          }

          user = await new User({
            googleId: profile.id,
            name: profile.displayName,
            email: primaryEmail,
            dob: new Date(),
          }).save();
        }

        return done(null, user);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);

export default passport;
