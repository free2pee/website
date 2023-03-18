 // server.ts
 import express from 'express';
 import next from 'next';
 import passport from './lib/passport';
 import session from 'express-session';
 
 const CONNECTION_PORT = 3000;
 const dev = process.env.NODE_ENV !== 'production';
 const app = next({ dev });
 const handle = app.getRequestHandler();
 
 app.prepare().then(() => {
   const server = express();
 
   server.use(
     session({
       secret: 'your_session_secret', // Replace this with a properly generated secret
       resave: false,
       saveUninitialized: false,
     })
   );
   server.use(passport.initialize());
   server.use(passport.session());
 
   server.get('/auth/openstreetmap', passport.authenticate('openstreetmap'));
   server.get(
     '/auth/callback',
     passport.authenticate('openstreetmap', { failureRedirect: '/login' }),
     (req, res) => {
       res.redirect('/');
     }
   );
   server.get('/logout', (req, res) => {
     req.logout();
     res.redirect('/');
   });
 
   server.all('*', (req, res) => {
     return handle(req, res);
   });
 
   server.listen(CONNECTION_PORT, (err) => {
     if (err) throw err;
     console.log(`> Ready on http://localhost:${CONNECTION_PORT}`);
   });
 });
 