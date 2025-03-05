require("dotenv").config();
const jwt = require("jsonwebtoken");


function authenticate(allowedRoles = []) {
  return (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
      return res.status(403).json({ message: "No token passed in headers" });
    }

    const token = authorization.slice(7); // Remove 'Bearer ' prefix
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid token" });
      }

      req.user = decoded;

      // If no specific role is required, just authenticate user
      if (allowedRoles.length === 0) {
        return next();
      }

      // Check if the user has a permitted role
      if (allowedRoles.includes(req.user.role)) {
        return next();
      }

      return res.status(403).json({ message: "Access denied. Insufficient permissions." });
    });
  };
}


// Utility function to get random questions
const getRandomQuestions = (questions, count) => {
  return questions.sort(() => 0.5 - Math.random()).slice(0, count);
};
const quizData = [
  {
    question: "What is React?",
    options: [
      "A JavaScript framework",
      "A JavaScript library for building user interfaces",
      "A database management system",
      "A CSS framework"
    ],
    answer: "A JavaScript library for building user interfaces",
  },
  {
    question: "Which company developed React?",
    options: ["Google", "Microsoft", "Facebook (Meta)", "Apple"],
    answer: "Facebook (Meta)",
  },
  {
    question: "What is JSX in React?",
    options: [
      "A new programming language",
      "A syntax extension for JavaScript",
      "A type of JavaScript function",
      "A built-in React component"
    ],
    answer: "A syntax extension for JavaScript",
  },
  {
    question: "What is the purpose of useState in React?",
    options: [
      "To create a new component",
      "To declare state variables in functional components",
      "To handle API requests",
      "To apply styles dynamically"
    ],
    answer: "To declare state variables in functional components",
  },
  {
    question: "Which hook is used for side effects in functional components?",
    options: ["useState", "useEffect", "useContext", "useReducer"],
    answer: "useEffect",
  },
  {
    question: "What is a prop in React?",
    options: [
      "A type of function",
      "A built-in React method",
      "A way to pass data from parent to child components",
      "A state management library"
    ],
    answer: "A way to pass data from parent to child components",
  },
  {
    question: "Which React hook is used for managing global state?",
    options: ["useState", "useEffect", "useReducer", "useContext"],
    answer: "useContext",
  },
  {
    question: "What is the virtual DOM in React?",
    options: [
      "A lightweight copy of the real DOM used for performance optimization",
      "A new type of database",
      "A server-side rendering technique",
      "A built-in component in React"
    ],
    answer: "A lightweight copy of the real DOM used for performance optimization",
  },
  {
    question: "Which method is used to handle events in React?",
    options: ["onClick", "handleEvent", "eventListener", "bindEvent"],
    answer: "onClick",
  },
  {
    question: "What is the default data flow in React?",
    options: [
      "Bidirectional",
      "Unidirectional",
      "Circular",
      "Hierarchical"
    ],
    answer: "Unidirectional",
  },
];


module.exports = { authenticate, getRandomQuestions,quizData };
