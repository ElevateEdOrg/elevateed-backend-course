const { db, sequelize } = require('../dbconn');
const { Op } = require("sequelize");
// const { uploadFile, getContentType } = require('../config/cloudinary/fileUploader')
// const {uploadFileToDrive}= require('../config/googledrive/driveConfig')

const { uploadFileToS3, deleteFilesFromS3 } = require('../config/awss3/s3Config')



// This function will upload course intro video and banner image to cloudinary and return their file path 
const uploadCourseFiles = async (req, res) => {
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
      intro_video = await uploadFileToS3(files.intro_video[0]);
    }
    return res.status(201).json({ message: "file uploaded successfully", data: { banner_image, intro_video } });
  } catch (error) {
    console.log("error", error)
    res.status(500).json({ message: "server failed" })
  }
}

const createCourse = async (req, res) => {
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
    console.log("Error creating course:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//update course 

const updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, price, category_id, banner_image, welcome_msg, intro_video } = req.body;

    const course = await db.Course.findByPk(courseId);
    if (!course) {
      return res.status(403).json({ message: "Course not found" });
    }

    await course.update({
      title,
      description,
      price,
      category_id,
      banner_image,
      welcome_msg,
      intro_video,
    });

    res.status(201).json({ message: "Course updated successfully", data: course });
  } catch (error) {
    console.log("Error updating course:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


// delete courses 

const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await db.Course.findByPk(courseId);
    if (!course) {
      return res.status(403).json({ message: "Course not found" });
    }

    await course.destroy();
    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



// Get all courses details
const getAllCourses = async (req, res) => {
  try {
    const courses = await db.Course.findAll({
      include: [
        {
          model: db.Category,
          as: "Category",
          attributes: ["id", "name"], // Fetch category details
        },
        {
          model: db.User,
          as: "Instructor",
          attributes: ["id", "full_name", "email"], // Fetch instructor details
        }
      ],
      attributes: {
        include: [
          // Count total enrolled students
          [
            sequelize.literal(`(
              SELECT COUNT(*) 
              FROM "enrollments" AS "Enrollment"
              WHERE "Enrollment"."course_id" = "Course"."id"
            )`),
            "total_students",
          ],
          // Calculate average course rating
          [
            sequelize.literal(`(
              SELECT COALESCE(AVG("Enrollment"."course_rating"), 0) 
              FROM "enrollments" AS "Enrollment"
              WHERE "Enrollment"."course_id" = "Course"."id"
            )`),
            "avg_rating",
          ],
        ],
        exclude: ["category_id", "instructor_id"]
      },
      order: [["updated_at", "DESC"]], // Order by latest updated courses
    });
    res.status(200).json({ data: courses });
  } catch (error) {
    console.log("Error fetching courses:", error);
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
            attributes: { exclude: ["instructor_id", "category_id"] }, // Remove duplicate instructor_id from response
            include: [
              {
                model: db.Category,
                as: "Category",
                attributes: ["id", "name"], // Fetch category details
              },
            ],
            order: [["updated_at", "DESC"]],
          }
        ],
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
            through: { attributes: ["progress"] }, // Fetch progress from Enrollment table
            include: [
              {
                model: db.Category,
                as: "Category",
                attributes: ["id", "name"], // Fetch category details
              },
              {
                model: db.User,
                as: "Instructor",
                attributes: ["id", "full_name", "email"], // Fetch instructor details
              },
            ],
          },
        ],
        order: [
          [
            sequelize.literal(`(
              SELECT progress 
              FROM "enrollments" 
              WHERE "enrollments"."user_id" = '${req.user.id}' 
              AND "enrollments"."course_id" = "EnrolledCourses"."id"
            )`),
            "DESC"
          ]
        ],
      });
      if (!studentdata) return res.status(403).json({ message: "Student has no record" })
      res.status(200).json({ data: studentdata })
    }


  } catch (error) {
    console.log("Error fetching courses:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// /api/courses?search=keyword  search courses

const searchCourses = async (req, res) => {
  try {
    let searchQuery = req.query.search || "";
    searchQuery = searchQuery.trim(); // Remove extra spaces
    if (!searchQuery) {
      return res.status(403).json({ success: false, message: "Search query is empty" });
    }
    // Split query into individual words
    const words = searchQuery.split(" ").filter(word => word.length > 0);
    // Generate conditions to match **each word** anywhere in title/description
    const conditions = words.map(word => ({
      [Op.or]: [
        { title: { [Op.iLike]: `%${word}%` } },
        { description: { [Op.iLike]: `%${word}%` } },
      ],
    }));
    // Search courses where all words appear **somewhere** in title/description
    const courses = await db.Course.findAll({
      where: {
        [Op.and]: conditions, // Ensures all words appear, even if separately
      },
      include: [
        { model: db.Category, as: "Category", attributes: ["id", "name"] },
        { model: db.User, as: "Instructor", attributes: ["id", "full_name"] },
      ],
      attributes: {
        include: [
          // Count total enrolled students
          [
            sequelize.literal(`(
              SELECT COUNT(*) 
              FROM "enrollments" AS "Enrollment"
              WHERE "Enrollment"."course_id" = "Course"."id"
            )`),
            "total_students",
          ],
          // Calculate average course rating
          [
            sequelize.literal(`(
              SELECT COALESCE(AVG("Enrollment"."course_rating"), 0) 
              FROM "enrollments" AS "Enrollment"
              WHERE "Enrollment"."course_id" = "Course"."id"
            )`),
            "avg_rating",
          ],
        ],
        exclude: ["category_id", "instructor_id"]
      },
      order: [["updated_at", "DESC"]], // Sort by latest
    });
    res.json({ success: true, data: courses });
  } catch (error) {
    console.error("Error searching courses:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}


const getTopInstuctors = async (req, res) => {

  try {
    const topInstructors = await db.User.findAll({
      attributes: [
        "id",
        "full_name",
        "email",
        "avatar",
        [
          sequelize.literal(
            `(SELECT COUNT(*) FROM "enrollments" 
              JOIN "courses"  ON "enrollments"."course_id" ="courses"."id" 
              WHERE "courses"."instructor_id" = "User"."id")`
          ),
          "total_enrollments",
        ],
        [
          sequelize.literal(
            `(SELECT COUNT(*) FROM "courses" WHERE "courses"."instructor_id" = "User"."id")`
          ),
          "total_courses",
        ],
      ],
      where: { role: "instructor" }, // Optional: Filter only instructors
      order: [[sequelize.literal("total_enrollments"), "DESC"]],
      limit: 4, // Get top  instructors
    });

    res.status(200).json({ data: topInstructors })

  } catch (error) {
    console.log("error", error)
    res.status(500).json({ message: "Internal Server Error" });
  }


}



const getCourseBYId = async (req, res) => {

  try {
    const courseId = req.params.courseId;
    console.log("id", courseId);
    if (!courseId) {
      return res.status(403).json({ message: "empty query params" });
    }
    const course = await db.Course.findByPk(courseId, {
      include: [
        {
          model: db.Category,
          as: "Category",
          attributes: ["id", "name"], // Fetch category details
        },
        {
          model: db.User,
          as: "Instructor",
          attributes: ["id", "full_name", "email"], // Fetch instructor details
        },
      ],
      attributes: {
        include: [
          // Count total enrolled students
          [
            sequelize.literal(`(
              SELECT COUNT(*) 
              FROM "enrollments" AS "Enrollment"
              WHERE "Enrollment"."course_id" = "Course"."id"
            )`),
            "total_students",
          ],
          // Calculate average course rating
          [
            sequelize.literal(`(
              SELECT COALESCE(AVG("Enrollment"."course_rating"), 0) 
              FROM "enrollments" AS "Enrollment"
              WHERE "Enrollment"."course_id" = "Course"."id"
            )`),
            "avg_rating",
          ],
        ],
        exclude: ["category_id", "instructor_id"],
      },
    });
    if (!course) {
      return res.status(403).json({ message: "Course not found" });
    }
    res.status(200).json({ data: course });
  } catch (error) {
    console.log("Error fetching course:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }

}

module.exports = {
  createCourse, getAllCourses, getAllUsersCourses, uploadCourseFiles, updateCourse, searchCourses, getTopInstuctors,
  getCourseBYId
};