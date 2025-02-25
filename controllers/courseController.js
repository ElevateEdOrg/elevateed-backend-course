const { db } = require('../dbconn');
// const { uploadFile, getContentType } = require('../config/cloudinary/fileUploader')
// const {uploadFileToDrive}= require('../config/googledrive/driveConfig')

const {uploadFileToS3}= require('../config/awss3/s3Config')



// This function will upload course intro video and banner image to cloudinary and return their file path 
const UploadCourseFiles = async (req, res) => {
  try {
    const files = req.files;
    if (!files || !files.banner_image || !files.intro_video) return res.status(403).json({ message: "Please Upload banner image and Intro Video " });
    // Step 1: Upload Banner Image (if provided)
    let banner_image = null;
    if (files.banner_image.length > 0) {
      banner_image = await uploadFileToS3(files.banner_image[0]);
    }
    // Step 2: Upload Intro Video (if provided)
    let intro_video = null;
    if (files.intro_video.length > 0) {
      intro_video =await uploadFileToS3(files.intro_video[0]);
    }
    return res.status(201).json({ message: "file uploaded successfully", data: { banner_image, intro_video } });
  } catch (error) {
    console.log("error", error)
    res.status(500).json({ message: "server failed" })
  }
}

const courseCreationController = async (req, res) => {
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
const getAllCourses = async (req, res) => {
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

const getAllUsersCourses = async (req, res) => {
  try {
    if (req.user.role === "instructor") {
      // Fetch instructor details along with courses they created
      const instructordata = await db.User.findOne({
        where: { id: req.user.id },
        attributes: ["id", "full_name"],
        include: [
          {
            model: db.Course,
            as: "courses",
            attributes: { exclude: ["instructor_id"] } // Remove duplicate instructor_id from response
          }
        ]
      });
      if (!instructordata) return res.status(403).json({ message: "Instructor has no record" })
      res.status(200).json({ data: instructordata })
    } else {
      //  Fetch student details along with enrolled courses
      const studentdata = await db.User.findOne({
        where: { id: req.user.id },
        attributes: ["id", "full_name"],
        include: [
          {
            model: db.Course,
            as: "EnrolledCourses",
            attributes: { exclude: ["instructor_id"] }, // Remove instructor_id from response
            through: { attributes: [] } // Remove Enrollment pivot table details
          }
        ]
      });
      if (!studentdata) return res.status(403).json({ message: "Student has no record" })
      res.status(200).json({ data: studentdata })
    }


  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};




module.exports = { courseCreationController, getAllCourses, getAllUsersCourses ,UploadCourseFiles};