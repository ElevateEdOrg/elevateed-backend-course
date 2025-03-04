const { db } = require('../dbconn');
const { uploadFileToS3 } = require('../config/awss3/s3Config')
require('dotenv').config();


// This function will upload course intro video and banner image to cloudinary and return their file path 
const UploadLectureFiles = async (req, res) => {
  try {
    const files = req.files;
    if (!files || !files.video_path) return res.status(403).json({ message: "Please Upload Lecture Video" });
    // Step 1: Upload lecture video 
    let video_path = null;
    if (files.video_path.length > 0) {
      video_path = await uploadFileToS3(files.video_path[0]);
    }
    // Step 2: Upload Intro Video (if provided)
    let pdf_path = null;
    if (files.pdf_path && files.pdf_path.length > 0) {
      pdf_path = await uploadFileToS3(files.pdf_path[0]);
    }
    return res.status(201).json({ message: "file uploaded successfully", data: { video_path, pdf_path } });
  } catch (error) {
    console.log("error", error)
    res.status(500).json({ message: "server failed" })
  }
}

const createLecture = async (req, res) => {
  try {
    const { course_id, title, description, video_path } = req.body;

    // Validate input
    if (!course_id || !title || !description || !video_path) {
      return res.status(403).json({ message: "missing fields" });
    }

    // Check if the course exists
    const course = await db.Course.findByPk(course_id);
    if (!course) {
      return res.status(403).json({ message: "Course not found." });
    }

    // Create the lecture
    const newLecture = await db.Lecture.create({
      course_id,
      title,
      description,
      video_path,
      pdf_path: req.pdf_path ? req.pdf_path : null,
    });

    // Step 2: Call the AI service to generate a quiz
    // const aiServiceUrl = `${process.env.AI_SERVICE_BASEURL}​/quiz​/generate_quiz_for_course=course_id=${course_id}​`; // Replace with actual AI service URL

  

    // const aiResponse = await axios.post(aiServiceUrl);
    // console.log("ai response",aiResponse)

    // if (!aiResponse.data.success) {
    //   throw new Error('ai service failed')
    //   // return res.status(500).json({ message: "Quiz generation failed" });
    // }

    res.status(201).json({ message: "Lecture created successfully.", data: newLecture });
  } catch (error) {
    console.error("Error creating lecture:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};



// Get all courses details
const getAllLectures = async (req, res) => {
  try {
    const coursedata = await db.Course.findAll({
      include: [
        {
          model: db.User,
          as: "Instructor",
          attributes: ["id", "full_name", "email"], // Only return needed fields
        },
      ],
    });
    res.status(200).json({ data: coursedata });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const { course_id, title, description, video_path, pdf_path } = req.body;
    const instructorId = req.user.id;

    if (!course_id || !title || !description || !video_path || !lectureId) return res.status(403).json({ message: "missing fields" })

    //  Step 1: Check if the lecture exists and is linked to the instructor's course
    const lecture = await db.Lecture.findOne({
      where: { id: lectureId, course_id },
      include: { model: db.Course, as: "course", attributes: ["id", "instructor_id"] },
    });

    if (!lecture || lecture.course.instructor_id !== instructorId) {
      return res.status(403).json({ message: "Unauthorized or lecture not found" });
    }

    // Step 2: Update lecture details
    await lecture.update({ title, description, video_path, pdf_path, updated_at: new Date() });


    res.status(200).json({
      message: "Lecture updated successfully", data: {
        id: lecture.id,
        course_id: lecture.course_id,
        title: lecture.title,
        description: lecture.description,
        video_path: lecture.video_path,
        pdf_path: lecture.pdf_path,
      }
    });
  } catch (error) {
    console.log("Error updating lecture:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


const deleteLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const instructorId = req.user.id;

    if (!lectureId) return res.status(403).json({ message: "missing fields" });

    //  Step 1: Check if the lecture exists and belongs to an instructor's course
    const lecture = await db.Lecture.findOne({
      where: { id: lectureId },
      include: { model: db.Course, as: "course", attributes: ["id", "instructor_id"] },
    });

    if (!lecture || lecture.course.instructor_id !== instructorId) {
      return res.status(403).json({ message: "Unauthorized or lecture not found" });
    }

    //  Step 2: Delete lecture
    await lecture.destroy();
    res.status(200).json({ message: "Lecture deleted successfully" });
  } catch (error) {
    console.error("Error deleting lecture:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updatelectureStatus = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const user_id = req.user.id;

    if (!lectureId) {
      return res.status(403).json({ message: "missing fields" });
    }

    //  Step 1: Fetch Lecture (Only id and course_id)
    const lecture = await db.Lecture.findOne({
      where: { id: lectureId },
      attributes: ["id", "course_id"], //  Directly fetching course_id
    });

    if (!lecture) {
      return res.status(404).json({ error: "Lecture not found." });
    }

    const course_id = lecture.course_id; //  No need to include Course model

    //  Step 2: Check if user is enrolled
    const enrollment = await db.Enrollment.findOne({ where: { user_id, course_id } });

    if (!enrollment) {
      return res.status(403).json({ error: "You are not enrolled in this course." });
    }

    //  Step 3: Update Lecture Status
    await db.LectureStatus.upsert({ user_id, lecture_id: lectureId, status: "completed" });

    //  Step 4: Calculate Progress
    const totalLectures = await db.Lecture.count({ where: { course_id } });
    const completedLectures = await db.LectureStatus.count({ where: { user_id, status: "completed" } });

    const progress = totalLectures > 0 ? (completedLectures / totalLectures) * 100 : 0;

    //  Step 5: Update Enrollment Progress
    await db.Enrollment.update(
      { progress: progress.toFixed(2) },
      { where: { user_id, course_id } }
    );

    return res.json({
      success: true,
      message: "Lecture status updated & progress recalculated.",
      progress: progress.toFixed(2),
    });
  } catch (error) {
    console.error("Error updating lecture status & progress:", error);
    res.status(500).json({ error: "Internal server error." });
  }
}

module.exports = { UploadLectureFiles, createLecture, updateLecture, deleteLecture, updatelectureStatus };