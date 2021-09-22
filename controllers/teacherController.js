const db = require('../models')
const Teacher = db.Teacher
const Course = db.Course

const teacherController = {
  getTeachers: (req, res) => {
    return Teacher.findAll({
      include: [Course]
    }).then(teachers =>{
      const data = teachers.map(r => ({
        ...r.dataValues
      }))
      return res.render('teachers',{ teachers: data, isAdmin: req.user.isAdmin })
    })
  }
}

module.exports = teacherController