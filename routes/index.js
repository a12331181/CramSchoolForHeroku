const schoolController = require('../controllers/schoolController.js')
const adminController = require('../controllers/adminController.js')

module.exports = app => {
  app.get('/', (req, res) => res.redirect('/cramschool'))
  app.get('/cramschool', schoolController.getSchoolIndexPage)

  app.get('/admin', (req, res) => res.redirect('/admin/cramschool'))
  app.get('/admin/cramschool', adminController.getSchoolIndexPage)
}