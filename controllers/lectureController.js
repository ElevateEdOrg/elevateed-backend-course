const { db } = require('../dbconn');
const {uploadFileToS3}= require('../config/awss3/s3Config')



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
      pdf_path:req.pdf_path?req.pdf_path:null,
    });

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





module.exports = {UploadLectureFiles,createLecture};