const db = require('../models')
const Teacher = db.Teacher
const User = db.User

const teacherController = {
  getTeachers: (req, res) => {
    return Teacher.findAll({
      include: [User]
    }).then(teachers => {
      const data = teachers.map(r => ({
        ...r.dataValues,
        ...r.dataValues.User.dataValues,
      }))
      return res.render('teachers',{ teachers: data, isAdmin: req.user.isAdmin })
    })
  }
}

module.exports = teacherController