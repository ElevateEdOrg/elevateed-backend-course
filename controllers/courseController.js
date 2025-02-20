const { Course, CourseContent } = require('../dbconn');
const cloudinary = require('../config/cloudinary/cloudinaryConfig');

const courseCreationController = async (req, res) => {
  try {
    const { title, description, price, category_id, content_type } = req.body;
    const instructor_id = req.user.id;
    const file = req.file;
    // Validate required fields

    if (!title || !instructor_id || !price || !category_id || !description || !content_type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!file) {
      return res.status(400).json({ error: "File is required (Video/PDF)" });
    }

    let folder = "course_content/other"; // Default folder
    if (content_type === "video") folder = "course_content/videos";
    else if (content_type === "image") folder = "course_content/images";
    else if (content_type === "pdf") folder = "course_content/pdfs";


    //  Step 1: Upload File to Cloudinary
    const uploadResponse = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "auto", folder },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(file.buffer);
    })

    // Create course
    const newCourse = await Course.create({
      title,
      description,
      instructor_id,
      price,
      category_id
    });

    await CourseContent.create({
      course_id: newCourse.id,
      file_path: uploadResponse.secure_url, // Cloudinary file URL
      content_type,
    });

    res.status(201).json(newCourse);
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }

}

module.exports = { courseCreationController };