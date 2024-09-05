// index.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();
app.use(express.json()); // Built-in middleware to parse JSON bodies

// Connect to MongoDB using environment variable
mongoose.connect(process.env.MONGODB_URI);

// Define Mentor and Student schemas
const Mentor = mongoose.model('Mentor', { name: String, email: String });
const Student = mongoose.model('Student', { name: String, email: String, mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor' } });

// API endpoints

// Create Mentor
app.post('/mentors', async (req, res) => {
    try {
        const { name, email } = req.body;
        const mentor = new Mentor({ name, email });
        await mentor.save();
        res.status(201).send(mentor);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Create Student
app.post('/students', async (req, res) => {
    try {
        const { name, email } = req.body;
        const student = new Student({ name, email });
        await student.save();
        res.status(201).send(student);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Assign a student to Mentor
app.put('/assign-student/:mentorId/:studentId', async (req, res) => {
    try {
        const { mentorId, studentId } = req.params;
        const student = await Student.findByIdAndUpdate(studentId, { mentor: mentorId }, { new: true });
        res.send(student);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Select one mentor and Add multiple Students
app.put('/add-students/:mentorId', async (req, res) => {
    try {
        const { mentorId } = req.params;
        const { students } = req.body; // Assuming students is an array of student ids
        const updatedStudents = await Student.updateMany({ _id: { $in: students } }, { mentor: mentorId });
        res.send(updatedStudents);
    } catch (error) {
        res.status(400).send(error);
    }
});

// A student who has a mentor should not be shown in List
app.get('/students', async (req, res) => {
    try {
        const students = await Student.find({ mentor: { $exists: false } });
        res.send(students);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Assign or Change Mentor for particular Student
app.put('/change-mentor/:studentId/:newMentorId', async (req, res) => {
    try {
        const { studentId, newMentorId } = req.params;
        const student = await Student.findByIdAndUpdate(studentId, { mentor: newMentorId }, { new: true });
        res.send(student);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Select One Student and Assign one Mentor
app.put('/assign-mentor/:studentId/:mentorId', async (req, res) => {
    try {
        const { studentId, mentorId } = req.params;
        const student = await Student.findByIdAndUpdate(studentId, { mentor: mentorId }, { new: true });
        res.send(student);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Show all students for a particular mentor
app.get('/mentor-students/:mentorId', async (req, res) => {
    try {
        const { mentorId } = req.params;
        const students = await Student.find({ mentor: mentorId });
        res.send(students);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Show the previously assigned mentor for a particular student
app.get('/previous-mentor/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        const student = await Student.findById(studentId).populate('mentor');
        res.send(student.mentor);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Start the server using environment variable
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});