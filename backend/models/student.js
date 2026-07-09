const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    age: {
        type: Number,
        required: true
    },

    city: {
        type: String,
        required: true
    },

    course: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true
    },

    phone: {
        type: String,
        required: true
    },

    attendance: {
        type: Number,
        default: 0
    },

    fees: {
        total: {
            type: Number,
            default: 0
        },
        paid: {
            type: Number,
            default: 0
        }
    },

    marks: {
        html: {
            type: Number,
            default: 0
        },
        css: {
            type: Number,
            default: 0
        },
        javascript: {
            type: Number,
            default: 0
        },
        node: {
            type: Number,
            default: 0
        }
    },

    remarks: {
        type: String,
        default: ""
    }

}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);