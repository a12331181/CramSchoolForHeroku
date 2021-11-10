const db = require('../models')
const Tuition = db.Tuition
const Course = db.Course
const Student = db.Student

const tuitionController = {
  getCourseTuitionList: (req, res) => {
    Promise.all([
      Tuition.findAll({
        raw: true,
        nest: true,
        where: { StudentId: req.params.studentId, CourseId: req.params.courseId },
      }),
      Course.findByPk(req.params.courseId, {
        raw: true,
        nest: true
      }),
      Student.findByPk(req.params.studentId, {
        raw: true,
        nest: true
      })
    ]).then(([tuitions, course, student]) => {
      let tuitionNotExist = false
      if (tuitions.length === 0) {
        tuitionNotExist = true
      }
      return res.render('tuition', {
        tuitions: tuitions,
        course: course,
        student: student,
        tuitionNotExist: tuitionNotExist
      })
    })
  }
}

module.exports = tuitionController