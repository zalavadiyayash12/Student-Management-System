const Student = require('../models/Student');

// GET ALL STUDENTS
const getStudents = async (req, res) => {
    try {
        const students = await Student.find({});
        res.send(students);
    } catch (error) {
        console.log(error);
        res.status(500).send("Error fetching students");
    }
};

// ADD STUDENT
const addStudent = async (req, res) => {
    try {
        console.log(req.body);

        const newStudent = new Student(req.body);
        await newStudent.save();

        res.send("Student Added Successfully");
    } catch (error) {
        console.log(error);
        res.status(500).send("Error adding student");
    }
};

// UPDATE STUDENT
const updateStudent = async (req, res) => {
    try {
        const updatedStudent = await Student.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.send(updatedStudent);
    } catch (error) {
        console.log(error);
        res.status(500).send("Error updating student");
    }
};

// DELETE STUDENT
const deleteStudent = async (req, res) => {
    try {
        await Student.findByIdAndDelete(req.params.id);
        res.send("Student Deleted Successfully");
    } catch (error) {
        console.log(error);
        res.status(500).send("Error deleting student");
    }
};

module.exports = {
    getStudents,
    addStudent,
    updateStudent,
    deleteStudent
};