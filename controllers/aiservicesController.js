const { db } = require("../dbconn");
const { getRandomQuestions } = require('../utils/utils')
const axios = require('axios')
const { Op } = require("sequelize");

const getQuizData = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;

        if (!courseId) {
            return res.status(403).json({ message: "Course not found" });
        }

        // Check if the student is enrolled in the course
        const enrollment = await db.Enrollment.findOne({
            where: { course_id: courseId, user_id: userId },
        });

        if (!enrollment) {
            return res.status(403).json({ message: "Access denied. Enrollment required." });
        }

        // Fetch all assessments for the given course
        const assessments = await db.Assessment.findAll({
            where: { course_id: courseId },
            attributes: ["assessment_data"],
        });

        if (!assessments.length) {
            return res.status(403).json({ message: "No quiz found for this course." });
        }

        // Combine all quiz questions from assessment_data
        let allQuestions = [];
        assessments.forEach((assessment) => {
            const assessmentData = assessment.assessment_data;
            if (assessmentData && Array.isArray(assessmentData)) {
                allQuestions = allQuestions.concat(assessmentData);
            }
        });

        if (allQuestions.length === 0) {
            return res.status(403).json({ message: "No quiz questions available." });
        }

        // Select 10 random quiz questions (or return all if less than 10)
        const selectedQuestions = getRandomQuestions(allQuestions, Math.min(10, allQuestions.length));

        res.status(200).json({ data: selectedQuestions });
    } catch (error) {
        console.log("Error fetching quiz:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const updateScore = async (req, res) => {
    try {

        const { courseId } = req.params;
        const { correctAnswers } = req.body;
        const userId = req.user.id;

        // Input Validation
        if (!courseId || !correctAnswers) {
            return res.status(403).json({ message: "Missing courseId or correctAnswers" });
        }

        if (correctAnswers < 0 || correctAnswers > 10) {
            return res.status(403).json({ message: "correctAnswers must be between 0 and 10" });
        }

        // Calculate Score (5 marks per correct question)
        const score = correctAnswers * 5; // Max score: 10 * 5 = 50

        // Check if student is enrolled in the course
        const enrollment = await db.Enrollment.findOne({
            where: { course_id: courseId, user_id: userId },
        });

        if (!enrollment) {
            return res.status(403).json({ message: "Access denied. Enrollment required." });
        }

        // Update the student's score in the database
        await db.Enrollment.update(
            { student_score: score }, // Update score field
            { where: { course_id: courseId, user_id: userId } }
        );

        res.status(200).json({ message: "Score updated successfully", data: score });
    } catch (error) {
        console.error("Error updating score:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


const getCourseRecommendations = async (req, res) => {
    // Function to provide fallback recommendations
    const getFallbackRecommendations = async () => {
        return await db.Course.findAll({
            order: [["created_at", "DESC"]], // Latest courses as fallback
            limit: 5, // Fetch top 5 latest courses
            attributes: ["id"],
        }).then((courses) => courses.map(course => course.id));
    };

    try {
        const aiServiceUrl = `${process.env.AI_SERVICE_BASEURL}/recommendation/recommendations?user_id=${req.user.id}`;

        let recommendations = []; // Store AI recommendations

        // Function to fetch AI recommendations with a timeout
        const fetchAIRecommendations = async () => {
            try {
                const aiResponse = await axios.get(aiServiceUrl, { timeout: 3000 }); // 3s timeout
                if (aiResponse.status === 200 && aiResponse.data.recommendations?.length > 0) {
                    return aiResponse.data.recommendations;
                }
            } catch (error) {
                console.warn("AI Service failed or timed out, falling back to default recommendations.");
            }
            return [];
        };

        // Try AI recommendations with timeout, otherwise fallback
        recommendations = await fetchAIRecommendations();
        if (recommendations.length === 0) {
            recommendations = await getFallbackRecommendations();
        }

        // Fetch courses based on recommendations
        const courses = await db.Course.findAll({
            where: { id: recommendations },
            include: [
                {
                    model: db.Category,
                    as: "Category",
                    attributes: ["id", "name"],
                },
                {
                    model: db.User,
                    as: "Instructor",
                    attributes: ["id", "full_name", "email"],
                }
            ],
            attributes: ["id", "title", "price", "banner_image"],
        });

        return res.status(200).json({ data: courses });

    } catch (error) {
        console.error("Error getting recommendations:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};



module.exports = { getQuizData, updateScore, getCourseRecommendations };
