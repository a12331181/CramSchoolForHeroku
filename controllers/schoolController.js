const db = require('../models')
const Course = db.Course
const Teacher = db.Teacher
const Calendar = db.Calendar

const schoolController = {
  getSchoolIndexPage: (req, res) => {
    return res.render('cramschool', { isAdmin: req.user.isAdmin })
  },

  getCourses : (req, res) => {
    return Course.findAll({ 
      raw: true,
      nest: true, 
      include: [ 
        { model: Teacher }
      ]
    }).then(courses =>{
      return res.render('courses', { courses: courses, isAdmin: req.user.isAdmin })
    })
  },

  getCourse : (req, res) => {
    return Course.findByPk(req.params.id, {
      include: [Calendar]
    }).then(course =>{
      const data = course.dataValues.Calendars
      const calendars = data.map(r => ({
        ...r.dataValues
      }))
      return res.render('course', { course: course.dataValues, calendars: calendars })
    })
  },
}
module.exports = schoolController