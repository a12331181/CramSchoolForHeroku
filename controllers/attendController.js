const db = require('../models')
const Course = db.Course
const Teacher = db.Teacher
const User = db.User

const attendController = {
  getCourseAttendIndexpage: (req, res) => {
    User.findByPk(req.user.id,{
      raw: true,
      nest: true,
      include: [Teacher]
    }).then(user =>{
      if (user.isAdmin) {
        Course.findAll({
          raw: true,
          nest: true, 
          include: [Teacher]
        }).then(courses => {
          return res.render('courseattend', {
            courses: courses
          })
        })
      } else {
        Course.findAll({
          raw: true,
          nest: true, 
          include: {
            model: Teacher,
            where: { id: user.Teacher.id }
          }
        }).then(courses => {
          return res.render('courseattend', {
            courses: courses
          })
        })
      }
    })
  }
}
module.exports = attendController