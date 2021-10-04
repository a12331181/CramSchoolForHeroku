const db = require('../models')
const Course = db.Course
const Student = db.Student
const Enrollment = db.Enrollment
const Payment = db.Payment
const Calendar = db.Calendar
const moment = require('moment')

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
  
  createPayments: (req, res) => {
    Promise.all([
      Calendar.max('period', {
        where: {
          CourseId: req.params.id
        }
      }),
      Course.findByPk(req.params.id, {
        include: [{ model: Student, as: 'EnrolledStudents' }]
      })
    ]).then(([calendarPeriod, course]) => {
      enrolledStudents = course.dataValues.EnrolledStudents
      course = course.toJSON()
      const data = enrolledStudents.map(r => ({
        ...r.dataValues.Enrollment.dataValues
      }))
      async function paymentLoopCreate (course, data) {
        for (let i = 0; i < data.length; i++ ) {
          await Payment.max('currentPeriod', {
            where: {
              EnrollmentId: data[i].id
            }
          }).then(currentPeriod => {
            currentPeriod = isNaN(currentPeriod) ? 0 : currentPeriod
            if (currentPeriod < calendarPeriod) {
              Payment.create({
                time: moment().format('YYYY-MM-DD'),
                amount: course.price,
                isPaid: false,
                EnrollmentId: data[i].id,
                currentPeriod: calendarPeriod
              })
            }
          })
        }
      }
      return paymentLoopCreate (course, data).then(()=> {
        req.flash('success_messages', '已成功建立收費紀錄')
        res.redirect('/cramschool/payment')
      })
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