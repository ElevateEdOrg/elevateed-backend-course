const fs = require("fs");
const { faker } = require("@faker-js/faker");
const { writeToStream } = require("fast-csv");

// Number of records
const NUM_USERS = 4;
const NUM_COURSES = 20;
const NUM_ENROLLMENTS = 20;
const NUM_CONTENT = 40;
const NUM_PAYMENTS = 35;

// Store associations
const users = [];
const courses = [];
const payments = [];

// ✅ Generate Users Data
const generateUsers = () => {
  for (let i = 0; i < NUM_USERS; i++) {
    users.push({
      id: faker.string.uuid(),
      full_name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: faker.helpers.arrayElement(["student", "instructor"]),
      created_at: faker.date.past().toISOString(),
    });
  }
  writeCSV("./users.csv", users);
};

// ✅ Generate Categories Data
const generateCategories = () => {
  const categories = [
    { id: faker.string.uuid(), name: "Programming" },
    { id: faker.string.uuid(), name: "Data Science" },
    { id: faker.string.uuid(), name: "Design" },
    { id: faker.string.uuid(), name: "Marketing" },
  ];
  writeCSV("./categories.csv", categories);
  return categories;
};

// ✅ Generate Courses Data & Associate with Instructors & Categories
const generateCourses = (categories) => {
  for (let i = 0; i < NUM_COURSES; i++) {
    const instructor = users.find((user) => user.role === "instructor");
    const category = faker.helpers.arrayElement(categories);

    courses.push({
      id: faker.string.uuid(),
      title: faker.lorem.words(3),
      description: faker.lorem.sentence(),
      instructor_id: instructor.id,
      category_id: category.id,
      price: faker.number.float({ min: 10, max: 200, precision: 0.01 }),
      created_at: faker.date.past().toISOString(),
      updated_at: faker.date.past().toISOString(),
    });
  }
  writeCSV("./courses.csv", courses);
};

// ✅ Generate Course Content & Associate with Courses
const generateCourseContent = () => {
  const contents = [];
  for (let i = 0; i < NUM_CONTENT; i++) {
    const course = faker.helpers.arrayElement(courses);

    contents.push({
      id: faker.string.uuid(),
      course_id: course.id,
      file_path: faker.system.filePath(),
      file_transcript: faker.system.filePath(),
      content_type: faker.helpers.arrayElement([".mp4", ".pdf", ".docx"]),
    });
  }
  writeCSV("./course_content.csv", contents);
};

// ✅ Generate Enrollments & Associate Users with Courses
const generateEnrollments = () => {
  const enrollments = [];
  for (let i = 0; i < NUM_ENROLLMENTS; i++) {
    const student = users.find((user) => user.role === "student");
    const course = faker.helpers.arrayElement(courses);

    enrollments.push({
      id: faker.string.uuid(),
      user_id: student.id,
      course_id: course.id,
      enrolled_at: faker.date.past().toISOString(),
      progress: faker.number.int({ min: 0, max: 100 }),
    });
  }
  writeCSV("./enrollments.csv", enrollments);
};

// ✅ Generate Payments & Maintain Course & User Associations
const generatePayments = () => {
  for (let i = 0; i < NUM_PAYMENTS; i++) {
    const student = users.find((user) => user.role === "student");
    const course = faker.helpers.arrayElement(courses);

    payments.push({
      id: faker.string.uuid(),
      user_id: student.id,
      course_id: course.id,
      amount: course.price,
      payment_date: faker.date.past().toISOString(),
      status: faker.helpers.arrayElement(["pending", "completed", "failed"]),
      method: faker.helpers.arrayElement(["credit_card", "debit_card", "paypal", "upi", "net_banking"]),
      transaction_id: faker.string.uuid(),
      created_at: faker.date.past().toISOString(),
    });
  }
  writeCSV("./payments.csv", payments);
};



const writeCSV = (fileName, data) => {
    const ws = fs.createWriteStream(fileName);
    writeToStream(ws, data, { headers: true })
      .on("finish", () => console.log(`${fileName} written successfully!`));
  };

// ✅ Generate All Data & Maintain Associations
const categories = generateCategories();
generateUsers();
generateCourses(categories);
generateCourseContent();
generateEnrollments();
generatePayments();


