const db = require('../models')
const Course = db.Course
const Teacher = db.Teacher

const schoolController = {
  getSchoolIndexPage: (req, res) => {
    return res.render('cramschool')
  },

  getCourses : (req, res) => {
    return Course.findAll({ 
      raw: true,
      nest: true, 
      include: [ 
        { model: Teacher }
      ]
    }).then(courses =>{
      return res.render('courses', { courses: courses })
    })
  }
}
module.exports = schoolController