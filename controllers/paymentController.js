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
      if (course === null) {
        console.log('Not found!')
        res.redirect('/cramschool/payment')
      } else {
        course = course.toJSON()
        let students = course.EnrolledStudents
        return res.render('studentspayment', { 
          course: course, 
          students: students 
        })
      }
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
      if (enrollment === null || course === null) {
        console.log('Not found')
        res.redirect('/cramschool/payment')
      } else {
        Student.findByPk(enrollment.StudentId,{
          raw: true,
          nest: true
        }).then(student => {
          let isPaymentNotExist = true
          if (enrollment.dataValues.Payments.length > 0){
            isPaymentNotExist = false
          }
          return res.render('paymentlist', { 
            enrollment: enrollment.toJSON(), 
            course: course, 
            student: student,
            isPaymentNotExist : isPaymentNotExist
          })
        })
      }
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
      if (enrollment === null || course === null) {
        console.log('Not found')
        res.redirect('/cramschool/payment')
      } else {
        return res.render('createpayment', { 
          enrollment: enrollment, 
          course: course 
        })        
      }
    })
  },

  createPayment: (req, res) => {
    Promise.all([
      Calendar.max('period', {
        where: {
          CourseId: req.params.id
        }
      }),
      Payment.max('currentPeriod', {
        where: {
          EnrollmentId: req.body.EnrollmentId
        }
      })
    ]).then(([calendarPeriod, currentPeriod]) => {
      let url = '/cramschool/payment/courses/'+ String(req.params.id) + '/enrollment/' + String(req.body.EnrollmentId)
      currentPeriod = isNaN(currentPeriod) ? 0 : currentPeriod
      if (currentPeriod < calendarPeriod) {
        Payment.create({
          time: req.body.time,
          amount: req.body.amount,
          isPaid: false,
          EnrollmentId: req.body.EnrollmentId,
          currentPeriod: calendarPeriod
        }).then(() => {
          req.flash('success_messages', '已成功建立收費紀錄')
          return res.redirect(url)
        })
      } else {
        req.flash('error_messages', '無法重複建立收費紀錄')
        return res.redirect(url)
      }
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
      let nums = 0
      let url = '/cramschool/payment/courses/'+ String(course.id)
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
              nums += 1
            }
          })
        }
      }
      return paymentLoopCreate (course, data).then(()=> {
        if (nums > 0) {
          req.flash('success_messages', '已成功建立收費紀錄')
          res.redirect(url)
        } else {
          req.flash('error_messages', '目前皆是最新收費紀錄，故新增失敗')
          res.redirect(url)
        }
      })
    })
  },

  deletePayment: (req, res) => {
    return Payment.findByPk(req.params.id,{
      include: [Enrollment]
    }).then((payment) => {
        payment.destroy()
          .then((payment) => {
            payment = payment.toJSON()
            let enrollmentId = payment.Enrollment.id
            let courseId = payment.Enrollment.CourseId
            let url = '/cramschool/payment/courses/'+ String(courseId) + '/enrollment/'+ String(enrollmentId)
            req.flash('success_messages', '已成功刪除收費紀錄')
            res.redirect(url)
          })
      })
  },

  paymentPaid: (req, res) => {
    return Payment.findByPk(req.params.id,{
      include: [Enrollment]
    }).then((payment) => {
        payment.update({
          isPaid: true
        })
        .then((payment) => {
          payment = payment.toJSON()
          let enrollmentId = payment.Enrollment.id
          let courseId = payment.Enrollment.CourseId
          let url = '/cramschool/payment/courses/'+ String(courseId) + '/enrollment/'+ String(enrollmentId)
          req.flash('success_messages', '確認收到款項，已更改為已繳費狀態')
          res.redirect(url)
        })
      })
  },
}
module.exports = schoolController