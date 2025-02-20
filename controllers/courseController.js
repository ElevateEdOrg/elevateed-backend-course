const courseRegsiterController =async (req, res) => {
    try {
      const { title, description, instructor_id, price, category_id } = req.body;
  
      // Validate required fields
      if (!title || !instructor_id || !price || !category_id) {
        return res.status(400).json({ error: "Missing required fields" });
      }
  
      // Create course
      const newCourse = await Course.create({
        title,
        description,
        instructor_id,
        price,
        category_id
      });
  
      res.status(201).json(newCourse);
    } catch (error) {
      console.error("Error creating course:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }

}

module.exports = {courseRegsiterController};