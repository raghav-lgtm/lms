const mongoose = require("mongoose");

const curriculamSchema = new mongoose.Schema({
  title: String,
  videoUrl: String,
  freePreview: Boolean,
  public_id: String,
});

const courseSchema = new mongoose.Schema({
  instructor_id: String,
  instructor_name: String,
  date: Date,
  title: String,
  category: String,
  level: String,
  primaryLanguage: String,
  subtitle: String,
  description: String,
  pricing: Number,
  objectives: String,
  welcomeMessage: String,
  image: String,

  students: [
    {
      studentId: String,
      studentName: String,
      studentEmail: String,
    },
  ],

  curriculam: [curriculamSchema],

  isPublished: Boolean,
});

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
