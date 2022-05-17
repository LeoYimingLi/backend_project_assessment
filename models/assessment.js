// Load required packages
var mongoose = require('mongoose');

// Define our assessment schema
var AssessmentSchema = new mongoose.Schema({
    title: String,
    description: { type: String, default: "" },
    mentor: String,
    dateCreated: { type: Date, default: Date.now },
    deadline: Date,
});

// Export the Mongoose model
module.exports = mongoose.model('Assessment', AssessmentSchema);
