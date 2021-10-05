const db = require('../models')
const Course = db.Course
const Teacher = db.Teacher
const Student = db.Student
const User = db.User
const Calendar = db.Calendar
const Attend = db.Attend

const attendController = {
  getAttendIndexpage: (req, res) => {
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

  getAttendCourse: (req, res) => {
    Calendar.max('period', {
      where: {
        CourseId: req.params.id
      }
    }).then(maxPeriod => {
      Course.findByPk(req.params.id, {
        include: {
          model: Calendar,
          where: { period: maxPeriod }
        },
        order: [[Calendar, 'isActive', 'desc']]
      }).then(course =>{
        const data = course.dataValues.Calendars
        const calendars = data.map(r => ({
          ...r.dataValues
        }))
        return res.render('coursecalendar', { course: course.dataValues, calendars: calendars, maxPeriod: maxPeriod, isAdmin: req.user.isAdmin })
      })
    })
  },

  closeCalendar: (req, res) => {
    Calendar.findByPk(req.params.id)
      .then(calendar => {
        calendar.update({
          isActive: false
        }).then(() => {
          req.flash('success_messages', '已成功關閉行事曆')
          return res.redirect('back')
        })
    })
  },

  openCalendar: (req, res) => {
    Calendar.findByPk(req.params.id)
      .then(calendar => {
        calendar.update({
          isActive: true
        }).then(() => {
          req.flash('success_messages', '已成功開啟行事曆')
          return res.redirect('back')
        })
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
      calendar = calendar.toJSON()
      if (calendar.isActive) {
        return res.render('attend', { calendar: calendar, students: students, course: course.toJSON() })
      } else {
        return res.redirect('back')
      }
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