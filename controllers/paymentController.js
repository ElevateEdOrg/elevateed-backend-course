require("dotenv").config();
const { db, sequelize } = require("../dbconn");
const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SK);

const createPaymentSession = async (req, res) => {
    try {
        const { courseIds } = req.body;

        if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
            return res.status(403).json({ success: false, message: "Cart is empty" });
        }

        // Fetch course details from the database
        const courses = await db.Course.findAll({
            where: { id: courseIds },
            attributes: ["id", "title", "price", "banner_image"],
        });

        const foundCourseIds = courses.map(course => course.id);
        const invalidCourseIds = courseIds.filter(id => !foundCourseIds.includes(id));

        if (invalidCourseIds.length > 0) {
            return res.status(403).json({ success: false, message: "Invalid course found" });
        }

        // Prepare line items for Stripe checkout
        const lineItems = courses.map(course => ({
            price_data: {
                currency: "inr",
                product_data: {
                    name: course.title,
                    images: course.banner_image ? [course.banner_image] : [],
                },
                unit_amount: course.price * 100, // Convert INR to paisa
            },
            quantity: 1,
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            client_reference_id: req.user.id,
            metadata: { course_ids: JSON.stringify(courseIds), user_id: req.user.id },
            line_items: lineItems,
            mode: "payment",
            success_url: `${process.env.CLIENT_URL}/success`, // Not used, webhook handles success
            cancel_url: `${process.env.CLIENT_URL}/cancel`, // Not used, webhook handles failure
        });

        res.status(200).json({ success: true, data: session.url });

    } catch (error) {
        console.log("Error creating checkout session:", error);
        res.status(500).json({ success: false, message: "Error creating checkout session" });
    }
};

const handleStripeWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    console.log('signature', sig, "secret", process.env.STRIPE_WEBHOOK_SECRET, "raw body", req.body);
    if (!sig) {
        console.log("invalid stripe signature");
        return res.status(400);
    }

    // let event;
    // try {
    //     event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    // } catch (err) {
    //     console.log(" Webhook signature verification failed:", err.message);
    //     return res.status(400);
    // }

    let event;
    // Only verify the event if you have an endpoint secret defined.
    // Otherwise use the basic event deserialized with JSON.parse
    if (process.env.STRIPE_WEBHOOK_SECRET) {
        // Get the signature sent by Stripe

        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                sig,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        } catch (err) {
            console.log(` Webhook signature verification failed.`, err.message);
            return res.status(400);
        }
    }
    console.log("event", event);
    try {
        if (event.type === "checkout.session.completed") {
            const session = event.data.object;
            const userId = session.metadata.user_id;
            let courseIds = [];

            console.log("transaction_id", session.payment_intent)


            try {
                courseIds = JSON.parse(session.metadata.course_ids);
                if (!Array.isArray(courseIds) || courseIds.length === 0) {
                    throw new Error("Invalid course IDs");
                }
            } catch (err) {
                console.log("Invalid course ID data:", err.message);
                return res.status(403).json({ message: "Invalid course data" });
            }

            // Fetch actual course prices from DB
            const courses = await db.Course.findAll({
                where: { id: courseIds },
                attributes: ["id", "price"],
            });

            if (!courses.length) {
                console.log("No courses found for payment processing.");
                return res.status(403).json({ message: "Courses not found" });
            }

            // Start DB Transaction
            const transaction = await sequelize.transaction();
            try {
                for (const course of courses) {
                    await db.Payment.create(
                        {
                            user_id: userId,
                            course_id: course.id,
                            amount: course.price,
                            method: session.payment_method_types[0],
                            status: "completed",
                            payment_date: new Date(),
                            transaction_id: session.payment_intent
                        },
                        { transaction }
                    );

                    await db.Enrollment.create(
                        {
                            user_id: userId,
                            course_id: course.id,
                            progress: 0.00,
                            course_rating: 0.00,
                            enrolled_at: new Date(),
                        },
                        { transaction }
                    );
                }
                await transaction.commit();
                console.log(`Payment success & enrollment completed for user ${userId}`);
            } catch (err) {
                await transaction.rollback();
                console.error("Transaction failed:", err);
                return res.status(500).json({ message: "Payment processing error" });
            }
        } else if (event.type === "checkout.session.expired") {
            const session = event.data.object;
            const userId = session.metadata.user_id;
            let courseIds = [];

            console.log("transactionid", session.payment_intent)

            try {
                courseIds = JSON.parse(session.metadata.course_ids);
                if (!Array.isArray(courseIds) || courseIds.length === 0) {
                    throw new Error("Invalid course IDs");
                }


            } catch (err) {
                console.error("Invalid course ID data:", err.message);
                return res.status(400).json({ message: "Invalid course data" });
            }

            for (const courseId of courseIds) {
                await db.Payment.create({
                    user_id: userId,
                    course_id: courseId,
                    amount: 0, // No amount for failed payments
                    method: session.payment_method_types[0],
                    status: "failed",
                    payment_date: new Date(),
                    transaction_id: session.payment_intent
                });
            }
            console.log(` Payment failed for user ${userId}`);
        }

        res.status(200).json({ success: true });

    } catch (error) {
        console.error("Error processing webhook event:", error);
        res.status(500).json({ success: false, message: "Error processing webhook" });
    }
};


module.exports = { createPaymentSession, handleStripeWebhook };
