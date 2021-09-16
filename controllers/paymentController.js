const db = require('../models')
const Course = db.Course
const Student = db.Student

const schoolController = {
  getPaymentIndexPage: (req, res) => {
    return Course.findAll({ 
      raw: true,
      nest: true
    }).then(courses =>{
      return res.render('payment', { courses: courses })
    })
  },
  
  getEnrolledStudents:(req, res) => {
    return Course.findByPk(req.params.id,{
      include: [{ model: Student, as: 'EnrolledStudents' }]
    }).then(course => {
      course = course.toJSON()
      let students = course.EnrolledStudents
      return res.render('studentspayment', { course: course, students: students })
    })
  }
}
module.exports = schoolController