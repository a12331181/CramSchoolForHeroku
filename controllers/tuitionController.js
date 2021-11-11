const db = require('../models')
const Tuition = db.Tuition
const Course = db.Course
const Student = db.Student
const FeeList = db.FeeList
const Calendar = db.Calendar
const ExtraFee = db.ExtraFee
const Payment = db.Payment
const moment = require('moment')

const tuitionController = {
  getCourseTuitionList: (req, res) => {
    Promise.all([
      Tuition.findAll({
        raw: true,
        nest: true,
        include: [Payment],
        where: { StudentId: req.params.studentId, CourseId: req.params.courseId },
      }),
      Course.findOne({
        where: { id: req.params.courseId, isActive: true }
      }),
      Student.findOne({
        where: { id: req.params.studentId, status: 1 }
      })
    ]).then(([tuitions, course, student]) => {
      if (course === null || student === null) {
        console.log('Not found!')
        res.redirect('/cramschool/payment')
      } else {
        let tuitionNotExist = false
        if (tuitions.length === 0) {
          tuitionNotExist = true
        }
        return res.render('tuition', {
          tuitions: tuitions,
          course: course.toJSON(),
          student: student.toJSON(),
          tuitionNotExist: tuitionNotExist
        })
      }
    })
  },
  
  createTuition: (req, res) => {
    Promise.all([
      Calendar.max('period', {
        where: {
          CourseId: req.params.courseId
        }
      }),
      Course.findByPk(req.params.courseId, {
        raw: true,
        nest: true
      })
    ]).then(([calendarPeriod, course]) => {
      Tuition.max('period', {
        where: {
          CourseId: course.id,
          StudentId: req.params.studentId
        }
      }).then(currentPeriod => {
        let url = '/cramschool/tuition/courses/'+ String(course.id) + '/students/' + String(req.params.studentId)
        currentPeriod = isNaN(currentPeriod) ? 0 : currentPeriod
        if (currentPeriod < calendarPeriod) {
          Tuition.create({
            amounts: course.price,
            CourseId: course.id,
            StudentId: req.params.studentId,
            period: calendarPeriod
          }).then(() => {
            req.flash('success_messages', '已成功建立收費表')
            return res.redirect(url)
          })
        } else {
          req.flash('error_messages', '無法重複建立收費表')
          return res.redirect(url)
        }
      })
    })
  },

  createTuitions: (req, res) => {
    Promise.all([
      Calendar.max('period', {
        where: {
          CourseId: req.params.id
        }
      }),
      Course.findByPk(req.params.id, {
        include: [{ model: Student, as: 'EnrolledStudents', where: { status: 1 }}]
      })
    ]).then(([calendarPeriod, course]) => {
      let nums = 0
      let url = '/cramschool/payment/courses/'+ String(course.id)
      enrolledStudents = course.dataValues.EnrolledStudents
      course = course.toJSON()
      async function tuitionLoopCreate (course, enrolledStudents) {
        for (let i = 0; i < enrolledStudents.length; i++ ) {
          await Tuition.max('period', {
            where: {
              CourseId: course.id,
              StudentId: enrolledStudents[i].dataValues.id
            }
          }).then(period => {
            period = isNaN(period) ? 0 : period
            if (period < calendarPeriod) {
              Tuition.create({
                amounts: course.price,
                CourseId: course.id,
                StudentId: enrolledStudents[i].dataValues.id,
                period: calendarPeriod
              })
              nums += 1
            }
          })
        }
      }
      return tuitionLoopCreate (course, enrolledStudents).then(()=> {
        if (nums > 0) {
          req.flash('success_messages', '已成功建立收費表')
          res.redirect(url)
        } else {
          req.flash('error_messages', '目前皆是最新收費表，故新增失敗')
          res.redirect(url)
        }
      })
    })
  },

  editTuition: (req, res) => {
    Promise.all([
      ExtraFee.findAll({
        raw: true,
        nest: true
      }),
      Tuition.findOne({
        where: { id :req.params.id },
        include: [Course]
      }),
      Tuition.findByPk(req.params.id, {
        include: [{ model: ExtraFee, as: 'RequiredFee' }],
      }),
      Tuition.findByPk(req.params.id, {
        raw: true,
        nest: true,
        include: [Student]
      }),
    ]).then(([extrafees, tuition, tuitionFees, tuitionStudent]) => {
      if (tuition === null) {
        console.log('Not found!')
        res.redirect('/cramschool/payment')
      } else {
        const data = extrafees.map(r => ({
          ...r,
          isExisted: !tuitionFees.RequiredFee.map(d => d.id).includes(r.id)
        }))
        let total = tuition.Course.price
        let fees = tuitionFees.RequiredFee.map(r => r.dataValues)
        for (let i = 0; i < data.length; i++) {
          if (data[i].isExisted === false) {
            total += data[i].price
          }
        }
        Tuition.findByPk(req.params.id).then(editamounts => {
          editamounts.update({
            amounts: total
          })
        }).then(() => {
          return res.render('edittuition', { 
            extrafees: data,
            tuition: tuition.toJSON(),
            tuitionFees: fees,
            total: total,
            tuitionStudent: tuitionStudent
          })
        }) 
      }
    })
  },

  addFeeList: (req, res) => {
    FeeList.create({
      ExtraFeeId: req.params.extrafeeId,
      TuitionId: req.params.tuitionId
    }).then((feelist) => {
      req.flash('success_messages', '成功新增額外費用')
      return res.redirect('back')
    })
  },

  removeFeeList: (req, res) => {
    FeeList.destroy({
      where: {
        ExtraFeeId: req.params.extrafeeId,
        TuitionId: req.params.tuitionId
      }
    }).then(() => {
      req.flash('success_messages', '成功刪除額外費用')
      return res.redirect('back')
    })
  },

  confirmTuitionAndCreatePayment: (req, res) => {
    FeeList.findAll({
      where: { 
        TuitionId: req.params.id
      }
    }).then(feelists => {
      for (let i = 0; i < feelists.length; i++ ) {
        ExtraFee.findByPk(feelists[i].dataValues.ExtraFeeId, {
          raw: true,
          nest: true
        }).then(extrafee => {
          feelists[i].update({
            price: extrafee.price
          })
        })
      }
    }).then(() => {
      Tuition.findByPk(req.params.id, {include: [Course]}).then(tuition => {
        Promise.all([
          tuition.update({
            course_price: tuition.dataValues.Course.dataValues.price
          }),
          Payment.create({
            time: moment().format('YYYY-MM-DD'),
            amount: tuition.dataValues.amounts, 
            isPaid: false,
            TuitionId: tuition.id,
            currentPeriod: tuition.dataValues.period
          })
        ]).then(()=> {
          let url = '/cramschool/tuition/courses/'+ String(tuition.dataValues.CourseId) + '/students/' + String(tuition.dataValues.StudentId)
          req.flash('success_messages', '成功新增學費表與費用紀錄')
          return res.redirect(url)
        })
      })
    })
  },
  
  getTuition: (req, res) => {
    Promise.all([
      Tuition.findByPk(req.params.id, {
        include: [{ model: ExtraFee, as: 'RequiredFee'}]
      }),
      Tuition.findByPk(req.params.id, {
        raw: true,
        nest: true,
        include: [Course]
      }),
      Tuition.findByPk(req.params.id, {
        raw: true,
        nest: true,
        include: [Student]
      }),
      Tuition.findByPk(req.params.id, {
        raw: true,
        nest: true,
        include: [Payment]
      })
    ]).then(([tuition, tuitionCourse, tuitionStudent, tuitionPayment]) => {
      if (tuition === null) {
        return res.redirect('/cramschool/payment')
      } else if (tuitionPayment.Payment.id === null ) {
        return res.redirect('/cramschool/payment')
      } else {
        return res.render('tuitiondetail', {
          tuition: tuition,
          tuitionCourse: tuitionCourse,
          tuitionStudent: tuitionStudent
        })
      }
    })
  },

  deleteTuition: (req, res) => {
    Tuition.findByPk(req.params.id).then(tuition => {
      Promise.all([
        FeeList.destroy({ 
          where: { TuitionId: tuition.dataValues.id }
        }),
        tuition.destroy()
      ]).then(() => {
        req.flash('success_messages', '成功刪除費用表')
        return res.redirect('back')
      })
    })
  },
}

module.exports = tuitionController