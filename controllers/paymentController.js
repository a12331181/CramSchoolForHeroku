const db = require('../models')
const Course = db.Course
const Student = db.Student
const Enrollment = db.Enrollment
const Payment = db.Payment
const Tuition = db.Tuition

const schoolController = {
  getPaymentIndexPage: (req, res) => {
    Course.findAll({ 
      where: { isActive: true }
    }).then(courses =>{
      return res.render('payment', { courses: courses })
    })
  },

  getEnrolledStudents: (req, res) => {
    Course.findOne({
      where: { id: req.params.id, isActive: true },
      include: [{ model: Student, as: 'EnrolledStudents' }]
    }).then(course => {
      if (course === null) {
        console.log('Not found!')
        res.redirect('/cramschool/payment')
      } else {
        course = course.toJSON()
        let students = course.EnrolledStudents
        let isStudentNotExist = true
        if (students.length > 0) {
          isStudentNotExist = false
        }
        return res.render('studentspayment', { 
          course: course, 
          students: students,
          isStudentNotExist: isStudentNotExist
        })
      }
    })
  },

  getPayments: (req, res) => {
    Promise.all([
      Tuition.findAll({
        raw: true,
        nest: true,
        where: { 
          StudentId: req.params.studentId, 
          CourseId: req.params.courseId 
        },
        include: { model: Payment }
      }),
      Course.findOne({
        where: { id: req.params.courseId, isActive: true },
      })
    ]).then(([tuition, course]) => {
      if (course === null) {
        console.log('Not found!')
        res.redirect('/cramschool/payment')
      } else {
        Student.findOne({
          where: { 
            id: req.params.studentId, 
            status: 1 
          },
        }).then(student => {
          if (student === null) {
            console.log('Not found!')
            res.redirect('/cramschool/payment')
          } else {
            return res.render('paymentlist', { 
              tuition: tuition, 
              course: course.toJSON(), 
              student: student.toJSON()
            })
          }
        })
      }
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