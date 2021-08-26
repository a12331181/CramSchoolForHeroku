const schoolController = require('../controllers/schoolController.js')
const adminController = require('../controllers/adminController.js')
const userController = require('../controllers/userController.js')
const multer = require('multer')
const upload = multer({ dest: 'temp/' })

module.exports = (app, passport) => {
  const authenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next()
    }
    res.redirect('/signin')
  }
  const authenticatedAdmin = (req, res, next) => {
    if (req.isAuthenticated()) {
      if (req.user.isAdmin) { return next() }
      return res.redirect('/')
    }
    res.redirect('/signin')
  }
  //前台相關路由
  app.get('/', authenticated, (req, res) => res.redirect('/cramschool'))
  app.get('/cramschool', authenticated, schoolController.getSchoolIndexPage)
  app.get('/cramschool/courses', authenticated, schoolController.getCourses)
  //後台相關路由
  app.get('/admin', authenticatedAdmin, (req, res) => res.redirect('/admin/cramschool'))
  app.get('/admin/cramschool', authenticatedAdmin, adminController.getSchoolIndexPage)
  //管理員相關路由
  app.get('/admin/users', authenticatedAdmin, adminController.getUsers)
  app.put('/admin/users/:id/toggleAdmin', authenticatedAdmin, adminController.toggleAdmin )
  //admin course 相關路由
  app.get('/admin/courses', authenticatedAdmin, adminController.getCourses)
  app.get('/admin/courses/create', authenticatedAdmin, adminController.getCreateCoursePage)
  app.post('/admin/courses', authenticatedAdmin, adminController.postCourse)
  app.get('/admin/courses/:id', authenticatedAdmin, adminController.getCourse)
  app.get('/admin/courses/:id/edit', authenticatedAdmin, adminController.editCourse)
  app.put('/admin/courses/:id', authenticatedAdmin, adminController.putCourse)
  app.delete('/admin/courses/:id', authenticatedAdmin, adminController.deleteCourse)
  //admin teacher 相關路由
  app.get('/admin/teachers', authenticatedAdmin, adminController.getTeachers)
  app.get('/admin/teachers/:id', authenticatedAdmin, adminController.getTeacher)
  app.get('/admin/teachers/:id/edit', authenticatedAdmin, adminController.editTeacher)
  app.put('/admin/teachers/:id', authenticatedAdmin, adminController.putTeacher)
  app.delete('/admin/teachers/:id', authenticatedAdmin, adminController.deleteTeacher)
  //admin student 相關路由
  app.get('/admin/students', authenticatedAdmin, adminController.getStudents)
  app.get('/admin/students/create', authenticatedAdmin, adminController.getCreateStudentPage)
  app.post('/admin/students', authenticatedAdmin, upload.single('image'), adminController.postStudent)
  app.get('/admin/students/:id', authenticatedAdmin, adminController.getStudent)
  app.get('/admin/students/:id/edit', authenticatedAdmin, adminController.editStudent)
  app.put('/admin/students/:id', authenticatedAdmin, upload.single('image'), adminController.putStudent)
  app.delete('/admin/students/:id', authenticatedAdmin, adminController.deleteStudent)
  app.get('/admin/students/enrolls/:id', authenticatedAdmin, adminController.enrollCoursePage)
  app.post('/admin/students/:studentId/enrolls/:courseId', authenticatedAdmin, adminController.addEnrollment)
  app.delete('/admin/students/:studentId/enrolls/:courseId', authenticatedAdmin, adminController.removeEnrollment)
  //user profile 相關路由
  app.get('/users/:id', authenticated, userController.getUser)
  app.get('/users/:id/edit', authenticated, userController.getEditUserPage)
  app.post('/users', authenticated, upload.single('image'), userController.postUser)
  app.put('/users/:id', authenticated, upload.single('image'), userController.putUser)
  //註冊.登錄與登出路由
  app.get('/signup', userController.signUpPage)
  app.post('/signup', userController.signUp)
  app.get('/signin', userController.signInPage)
  app.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)
  app.get('/logout', userController.logout)
}