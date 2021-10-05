const schoolController = require('../controllers/schoolController.js')
const adminController = require('../controllers/adminController.js')
const userController = require('../controllers/userController.js')
const attendController = require('../controllers/attendController.js')
const paymentController = require('../controllers/paymentController.js')
const teacherController = require('../controllers/teacherController.js')
const studentController = require('../controllers/studentController.js')
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
  app.get('/cramschool/meetings', authenticated, schoolController.getMeetings)
  app.get('/cramschool/meetings/create', authenticatedAdmin, schoolController.getCreateMeetingPage)
  app.get('/cramschool/meetings/:id', authenticated, schoolController.getMeeting)
  app.post('/cramschool/meetings', authenticatedAdmin, schoolController.createMeeting)
  app.delete('/cramschool/meetings/:id', authenticatedAdmin, schoolController.deleteMeeting)
  //課程相關路由
  app.get('/cramschool/courses', authenticated, schoolController.getCourses)
  app.get('/cramschool/courses/:id/calendar', authenticated, schoolController.getCourse)
  app.get('/cramschool/courses/attend', authenticated, attendController.getCourseAttendIndexpage)
  app.get('/cramschool/courses/:id/attend', authenticated, attendController.getCourseCalendar)
  app.put('/cramschool/courses/calendar/:id/attend/close', authenticatedAdmin, attendController.closeCalendar)
  app.put('/cramschool/courses/calendar/:id/attend/open', authenticatedAdmin, attendController.openCalendar)
  app.get('/cramschool/courses/:courseId/calendar/:calendarId/attend', authenticated, attendController.getAttend)
  app.post('/cramschool/courses/calendar/:calendarId/attend/:studentId', authenticated, attendController.postAttend)
  app.delete('/cramschool/courses/calendar/:calendarId/attend/:studentId', authenticated, attendController.deleteAttend)
  //老師資料相關路由
  app.get('/cramschool/teachers', authenticated, teacherController.getTeachers)
  //學生資料相關路由
  app.get('/cramschool/students', authenticated, studentController.getStudents)
  app.get('/cramschool/students/:id', authenticated, studentController.getStudent)
  app.get('/cramschool/students/:studentId/courses/:courseId/attend', authenticated, studentController.getStudentAttend)
  //繳費紀錄相關路由
  app.get('/cramschool/payment', authenticatedAdmin, paymentController.getPaymentIndexPage)
  app.get('/cramschool/payment/courses/:id', authenticatedAdmin, paymentController.getEnrolledStudents)
  app.get('/cramschool/payment/courses/:courseId/enrollment/:enrollmentId', authenticatedAdmin, paymentController.getPayments)
  app.get('/cramschool/payment/courses/:courseId/enrollment/:enrollmentId/create', authenticatedAdmin, paymentController.getCreatePaymentPage)
  app.post('/cramschool/payment/courses/:id/bulkcreate', authenticatedAdmin, paymentController.createPayments)
  app.post('/cramschool/payment/courses/:id/create', authenticatedAdmin, paymentController.createPayment)
  app.put('/cramschool/payment/:id/paid', authenticatedAdmin, paymentController.paymentPaid)
  app.delete('/cramschool/payment/:id', authenticatedAdmin, paymentController.deletePayment)
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
  //admin calendar 相關路由
  app.get('/admin/courses/:id/calendar', authenticatedAdmin, adminController.getCalendar)
  app.post('/admin/courses/:id/calendar/create', authenticatedAdmin, adminController.postNextPeriodCalendar)
  app.get('/admin/courses/:id/calendar/edit', authenticatedAdmin, adminController.editCalendar)
  app.put('/admin/courses/:id/calendar', authenticatedAdmin, adminController.putCalendar)
  app.delete('/admin/courses/:id/calendar', authenticatedAdmin, adminController.deleteCalendars)
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