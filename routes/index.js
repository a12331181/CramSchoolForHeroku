const schoolController = require('../controllers/schoolController.js')

module.exports = app => {
  app.get('/', (req, res) => res.redirect('/cramschool'))
  app.get('/cramschool', schoolController.getSchoolIndexPage)
}