const db = require('../models')
const Course = db.Course
const Teacher = db.Teacher
const Calendar = db.Calendar
const Meeting = db.Meeting
const Student = db.Student
const Diary = db.Diary
const User = db.User

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
    Promise.all([
      Course.findAll({ 
        raw: true,
        nest: true, 
        include: [ 
          { model: Teacher }
        ]
      }),
      User.findByPk(req.user.id, {
        raw: true,
        nest: true,
        include: [Teacher]
      })
    ]).then(([courses, user]) => {
      return res.render('courses', { courses: courses, isAdmin: req.user.isAdmin, user: user })
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
  
  getCourseEnrolledStudents: (req, res) => {
    Course.findByPk(req.params.id, {
      include: [{ model: Student, as: 'EnrolledStudents' }]
    }).then(course => {
      const students = course.EnrolledStudents.map(r => ({
        ...r.dataValues
      }))
      return res.render('enrolledstudents', { course: course.toJSON(), students: students })
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

  getDiaries: (req, res) => {
    Promise.all([
      Course.findByPk(req.params.id, {
        include: [Diary]
      }),
      Course.findByPk(req.params.id, {
        raw: true,
        nest: true,
        include: [Teacher]
      }),
      User.findByPk(req.user.id, {
        raw: true,
        nest: true,
        include: [Teacher]
      })
    ]).then(([course, teacher, user]) => {
      if (course === null || teacher === null) {
        console.log('Not found!')
        return res.redirect('/cramschool/courses')
      } else {
        if (teacher.Teacher.id === user.Teacher.id) {
          let diaries = course.Diaries.map(r => ({
            ...r.dataValues
          }))
          return res.render('diaries', { course: course.toJSON(), diaries: diaries, teacher: teacher, user: user })
        } else {
          return res.redirect('/cramschool/courses')
        }
      }
    })
  },

  getDiary: (req, res) => {
    Diary.findOne({
      raw: true,
      nest: true,
      where: {
        id: req.params.diaryId
      },
      include: [Teacher]
    }).then(diary => {
      if (diary === null) {
        console.log('Not found!')
        return res.redirect('/cramschool/courses')
      }
      return res.render('diary', { diary: diary })
    })
  },

  getCreateDiaryPage: (req, res) => {
    Promise.all([
      Course.findByPk(req.params.id, {
        raw: true,
        nest: true,
        include: [Teacher]
      }),
      User.findByPk(req.user.id, {
        raw: true,
        nest: true,
        include: [Teacher]
      })
    ]).then(([course, user]) => {
      if (course === null || user.Teacher.id === null) {
        console.log('Not found!')
        return res.redirect('/cramschool/courses')
      } else {
        res.render('creatediary', { course: course, user: user })
      }
    })
  },

  createDiary: (req, res) => {
    Teacher.findOne({
      raw: true,
      nest: true,
      where: {
        UserId: req.user.id
      }
    }).then(teacher => {
      return Diary.create({
        date: req.body.date,
        subject: req.body.subject,
        content: req.body.content,
        TeacherId: teacher.id,
        CourseId: req.params.id,
      })
    }).then((diary) => {
      let url = '/cramschool/courses/'+ String(req.params.id) + '/diaries'
      req.flash('success_messages', '已成功建立教師日誌')
      return res.redirect(url)
    })
  },

  deleteDiary: (req, res) => {
    return Diary.findByPk(req.params.diaryId)
      .then((diary) => {
        diary.destroy()
          .then((diary) => {
            let url = '/cramschool/courses/'+ String(req.params.courseId) + '/diaries'
            req.flash('success_messages', '已成功刪除教師日誌')
            res.redirect(url)
          })
      })
  },
}
module.exports = schoolController