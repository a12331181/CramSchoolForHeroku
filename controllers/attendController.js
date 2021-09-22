const db = require('../models')
const Course = db.Course
const Teacher = db.Teacher
const Student = db.Student
const User = db.User
const Calendar = db.Calendar
const Attend = db.Attend

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
            courses: courses,
            isAdmin: req.user.isAdmin
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
            courses: courses,
            isAdmin: req.user.isAdmin
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
        include: [Attend]
      }),
      Course.findByPk(req.params.courseId,{
        include: [{ model: Student, as: 'EnrolledStudents' }]
      })
    ]).then(([calendar,course]) => {
      const data = course.EnrolledStudents
      const students = data.map(r => ({
        ...r.dataValues,
        isChecked: calendar.Attends.map(d => d.StudentId).includes(r.id)
      }))
      return res.render('attend', { calendar: calendar.toJSON(), students: students })
    })
  },

  postAttend: (req, res) => {
    const status = req.body.status
    let isAttend = ''
    let reason = ''
    let statusArray = status.split("/")
    if (status.includes('出席')) {
      isAttend = true
      reason = ''
    } else {
      isAttend = false
      reason = statusArray[1]
    }
    return Attend.create({
      CalendarId: req.params.calendarId,
      StudentId: req.params.studentId,
      isAttend: isAttend,
      reason: reason
    }).then((attend) => {
        return res.redirect('back')
      })
  },

  deleteAttend: (req, res) => {
    return Attend.findOne({
      where: {
        CalendarId: req.params.calendarId,
        StudentId: req.params.studentId
      }
    }).then((attend) => {
        attend.destroy()
          .then((attend) => {
            return res.redirect('back')
          })
      })
  }
}
module.exports = attendController