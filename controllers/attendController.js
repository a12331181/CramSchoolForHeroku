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
      Course.findAll({
        where: { isActive: true },
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
    })
  },

  getAttendCourse: (req, res) => {
    Promise.all([
      Teacher.findOne({
        raw: true,
        nest: true,
        where: {
          UserId: req.user.id
        },
      }),
      Course.findOne({
        where: { id: req.params.id, isActive: true },
        include: [Teacher]
      })
    ]).then(([teacher, course]) => {
      if (teacher === null || course === null) {
        console.log('Not found!')
        res.redirect('/cramschool/attend')
      } else {
        if (teacher.id !== course.toJSON().Teacher.id ) {
          console.log('Not match!')
          res.redirect('/cramschool/attend')
        } else {
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
            }).then(data => {
              const calendars = data.dataValues.Calendars.map(r => ({
                ...r.dataValues
              }))
              return res.render('coursecalendar', { 
                course: data.toJSON(), 
                calendars: calendars, 
                maxPeriod: maxPeriod,
              })
            })
          })
        }
      }
    })
  },

  getAttend:(req, res) => {
    Promise.all([
      Calendar.findOne({
        where: { id: req.params.calendarId, isActive: true },
        include: [Attend]
      }),
      Course.findOne({
        where: { id: req.params.courseId, isActive: true },
        include: [{ model: Student, as: 'EnrolledStudents' }]
      })
    ]).then(([calendar, course]) => {
      let url = '/cramschool/attend/courses/'+ String(req.params.courseId)
      if (calendar === null || course === null) {
        console.log('Not found!')
        res.redirect(url)
      } else {
        const data = course.EnrolledStudents
        const students = data.map(r => ({
          ...r.dataValues,
          isChecked: calendar.Attends.map(d => d.StudentId).includes(r.id)
        }))
        return res.render('attend', { 
          calendar: calendar.toJSON(),
          students: students,
          course: course.toJSON() 
        })
      }
    })
  },

  postAttend: (req, res) => {
    const status = req.body.status
    let isAttend = ''
    let reason = ''
    let statusArray = status.split("/")
    if (status.includes('??????')) {
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
      req.flash('success_messages', '???????????????????????????')
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
      attend.destroy().then((attend) => {
        req.flash('success_messages', '???????????????????????????')
        return res.redirect('back')
      })
    })
  }
}
module.exports = attendController