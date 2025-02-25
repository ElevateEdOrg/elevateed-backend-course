const { db } = require('../dbconn');
const {uploadFileToS3}= require('../config/awss3/s3Config')



// This function will upload course intro video and banner image to cloudinary and return their file path 
const UploadLectureFiles = async (req, res) => {
  try {
    const files = req.files;
    if (!files || !files.video_path) return res.status(403).json({ message: "Please Upload Lecture Video" });
    // Step 1: Upload Banner Image (if provided)
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

const LectureCreationController = async (req, res) => {
  try {
    const { title, description, price, category_id, welcome_msg, banner_image, intro_video } = req.body;
    const instructor_id = req.user.id;
    // Validate required fields
    if (!title || !price || !category_id || !description || !welcome_msg || !banner_image || !intro_video) {
      return res.status(403).json({ message: "Missing required fields" });
    }
    // Step 3: Create Course in Database
    const newCourse = await db.Course.create({
      title,
      description,
      instructor_id,
      category_id,
      price,
      banner_image,
      welcome_msg,
      intro_video
    });
    return res.status(201).json({ message: "Course created successfully", data: newCourse });
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ message: "Internal Server Error" });
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





module.exports = {UploadLectureFiles};