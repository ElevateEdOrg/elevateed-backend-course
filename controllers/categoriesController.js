const {db}= require('../dbconn')


// Get all categories
const getAllCategories = async (req, res) => {
    try {
        const categories = await db.Category.findAll({ order: [["id", "ASC"]] });
        res.status(200).json({data:categories});
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = {
    getAllCategories,
};