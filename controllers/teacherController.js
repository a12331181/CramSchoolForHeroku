const db = require('../models')
const Teacher = db.Teacher
const User = db.User

const teacherController = {
  getTeachers: (req, res) => {
    Teacher.findAll({
      include: [User],
      where: { status: 1 }
    }).then(teachers => {
      const data = teachers.map(r => ({
        ...r.dataValues
      }))
      return res.render('teachers',{ teachers: data, isAdmin: req.user.isAdmin })
    })
  }
}

module.exports = teacherController