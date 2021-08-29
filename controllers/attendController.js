const db = require('../models')
const Course = db.Course
const Teacher = db.Teacher
const Student = db.Student
const User = db.User
const Calendar = db.Calendar

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
  },

  getCourseCalendar: (req, res) => {
    Course.findByPk(req.params.id,{
      include: [Calendar]
    }).then(course =>{
      const data = course.dataValues.Calendars
      const calendars = data.map(r => ({
        ...r.dataValues
      }))
      return res.render('coursecalendar', { course: course.dataValues, calendars: calendars })
    })
  },

  getAttend:(req, res) => {
    return Promise.all([
      Calendar.findByPk(req.params.calendarId,{
        raw: true,
        nest: true
      }),
      Course.findByPk(req.params.courseId,{
        include: [{ model: Student, as: 'EnrolledStudents' }]
      })
    ]).then(([calendar,course]) => {
      const data = course.EnrolledStudents
      const students = data.map(r => ({
        ...r.dataValues
      }))
      return res.render('attend', { calendar: calendar, students: students })
    })
  }
}
module.exports = attendController