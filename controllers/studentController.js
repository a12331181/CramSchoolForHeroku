const db = require('../models')
const Student = db.Student
const Course = db.Course

const studentController = {
  getStudents: (req, res) => {
    const whereQuery = {}
    if (req.query.CourseId) {
      whereQuery.id = Number(req.query.CourseId)
    }
    Student.findAll({
      raw: true, 
      nest: true,
      include: [{ model: Course, as: 'EnrolledCourses', where: whereQuery }]
    }).then(students => {
      Course.findAll({
        raw: true,
        nest: true
      }).then(courses => {
        return res.render('students', { students: students, courses: courses, courseId: whereQuery.id })
      })
    })
  },

  getStudent: (req, res) => {
    Student.findByPk(req.params.id,{
      raw: true,
      nest: true
    }).then(student => {
      return res.render('student', { student: student })
    })
  }
}

module.exports = studentController