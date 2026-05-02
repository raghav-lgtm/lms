const mongoose = require("mongoose");

const curriculamSchema = new mongoose.Schema({
  title: String,
  type: {
    type: String,
    enum: ["video", "quiz"],
    default: "video"
  },
  videoUrl: String,
  freePreview: Boolean,
  public_id: String,
  questions: [
    {
      question: String,
      options: [String],
      correctAnswerIndex: Number
    }
  ]
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
      paidAmount: Number,
    },
  ],

  curriculam: [curriculamSchema],

  isPublished: Boolean,
});

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
