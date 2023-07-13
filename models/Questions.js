const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const QuestionSchema = new Schema({
    questionName: {
        type: String,
        required: true
    },
    testCases: [{
        type: Object,
        contains: {
            input: String,
            output: String,
        }
    }],
    createdAt: {
        type: Date,
        default: new Date()
    },
    deleted: {
        type: Boolean,
        default: false
    },
})

module.exports = Questions = mongoose.model('Questions', QuestionSchema);