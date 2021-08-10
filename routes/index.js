const schoolController = require('../controllers/schoolController.js')
const adminController = require('../controllers/adminController.js')
const userController = require('../controllers/userController.js')

module.exports = (app, passport) => {
  app.get('/', (req, res) => res.redirect('/cramschool'))
  app.get('/cramschool', schoolController.getSchoolIndexPage)

  app.get('/admin', (req, res) => res.redirect('/admin/cramschool'))
  app.get('/admin/cramschool', adminController.getSchoolIndexPage)

  app.get('/signup', userController.signUpPage)
  app.post('/signup', userController.signUp)

  app.get('/signin', userController.signInPage)
  app.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)
  app.get('/logout', userController.logout)
}