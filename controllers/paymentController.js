const db = require('../models')
const Course = db.Course
const Student = db.Student
const Enrollment = db.Enrollment
const Payment = db.Payment


const schoolController = {
  getPaymentIndexPage: (req, res) => {
    return Course.findAll({ 
      raw: true,
      nest: true
    }).then(courses =>{
      return res.render('payment', { courses: courses })
    })
  },
  
  getEnrolledStudents: (req, res) => {
    return Course.findByPk(req.params.id,{
      include: [{ model: Student, as: 'EnrolledStudents' }]
    }).then(course => {
      course = course.toJSON()
      let students = course.EnrolledStudents
      return res.render('studentspayment', { course: course, students: students })
    })
  },

  getPayments: (req, res) => {
    return Promise.all([
      Enrollment.findByPk(req.params.enrollmentId,{
        include: [Payment]
      }),
      Course.findByPk(req.params.courseId,{
        raw: true,
        nest: true
      })
    ]).then(([enrollment, course]) => {
      Student.findByPk(enrollment.StudentId,{
        raw: true,
        nest: true
      }).then(student => {
        return res.render('paymentlist', { enrollment: enrollment.toJSON(), course: course, student: student })
      })
    })
  },

  getCreatePaymentPage: (req, res) => {
    return Promise.all([
      Enrollment.findByPk(req.params.enrollmentId,{
        raw: true,
        nest: true,
        include: [Payment]
      }),
      Course.findByPk(req.params.courseId,{
        raw: true,
        nest: true
      })
    ]).then(([enrollment, course]) => {
      return res.render('createpayment', { enrollment: enrollment, course: course })
    })
  },

  createPayment: (req, res) => {
    return Payment.create({
      time: req.body.time,
      amount: req.body.amount,
      isPaid: req.body.isPaid,
      EnrollmentId: req.body.EnrollmentId,
    }).then((payment) => {
      req.flash('success_messages', '已成功建立收費紀錄')
      return res.redirect('/cramschool/payment')
    })
  },

  deletePayment: (req, res) => {
    return Payment.findByPk(req.params.id)
      .then((payment) => {
        payment.destroy()
          .then((payment) => {
            req.flash('success_messages', '已成功刪除收費紀錄')
            res.redirect('/cramschool/payment')
          })
      })
  },
}
module.exports = schoolController