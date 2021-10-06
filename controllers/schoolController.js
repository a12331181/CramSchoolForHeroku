const db = require('../models')
const Course = db.Course
const Teacher = db.Teacher
const Calendar = db.Calendar
const Meeting = db.Meeting

const schoolController = {
  getSchoolIndexPage: (req, res) => {
    Meeting.findAll({ 
      raw: true,
      nest: true,
      limit: 2,
      order: [['createdAt', 'DESC']]
    }).then(meetings => {
      return res.render('cramschool', { isAdmin: req.user.isAdmin, meetings: meetings })
    })
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
    Calendar.max('period', {
      where: {
        CourseId: req.params.id
      }
    }).then(currentPeriod => {
      Course.findByPk(req.params.id, {
        include: {
          model: Calendar,
          where: { period: currentPeriod }
        },
        order: [[Calendar, 'date', 'ASC']]
      }).then(course =>{
        const data = course.dataValues.Calendars
        const calendars = data.map(r => ({
          ...r.dataValues
        }))
        const firstCalendarDate = calendars[0].date
        const lastCalendarDate = calendars[calendars.length -1].date
        return res.render('course', { course: course.dataValues, calendars: calendars, currentPeriod: currentPeriod, firstCalendarDate: firstCalendarDate, lastCalendarDate: lastCalendarDate })
      })
    })
  },
  
  getMeetings: (req, res) => {
    Meeting.findAll({
      raw: true,
      nest: true
    }).then(meetings => {
      return res.render('meetings',{ meetings: meetings, isAdmin: req.user.isAdmin })
    })
  },
  
  getMeeting: (req, res) => {
    Meeting.findByPk(req.params.id,{
      raw: true,
      nest: true,
      include: [Teacher]
    }).then(meeting => {
      return res.render('meeting',{ meeting: meeting })
    })
  },

  getCreateMeetingPage: (req, res) => {
    Teacher.findOne({
      raw: true,
      nest: true,
      where: {
        UserId: req.user.id
      }
    }).then(teacher => {
      return res.render('createmeeting',{ teacher: teacher })
    })
  },

  createMeeting: (req, res) => {
    Teacher.findOne({
      raw: true,
      nest: true,
      where: {
        UserId: req.user.id
      }
    }).then(teacher => {
      return Meeting.create({
        date: req.body.date,
        subject: req.body.subject,
        content: req.body.content,
        TeacherId: teacher.id,
      })
    }).then((meeting) => {
      req.flash('success_messages', '已成功建立會議紀錄')
      return res.redirect('/cramschool')
    })
  },

  deleteMeeting: (req, res) => {
    return Meeting.findByPk(req.params.id)
      .then((meeting) => {
        meeting.destroy()
          .then((meeting) => {
            req.flash('success_messages', '已成功刪除會議記錄')
            res.redirect('/cramschool/meetings')
          })
      })
  },
}
module.exports = schoolController