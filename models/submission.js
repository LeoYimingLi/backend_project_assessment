// Load required packages
var mongoose = require('mongoose');

// Define our submission schema
var SubmissionSchema = new mongoose.Schema({
    student: String,
    assessment: String,
    content: { type: String, default: "" },  // Link
    dateCreated: { type: Date, default: Date.now },
    
    mark: { type: String, default: "" },  // grade1
    remark: { type: String, default: "" },  // grade2
});

// Export the Mongoose model
module.exports = mongoose.model('Submission', SubmissionSchema);
