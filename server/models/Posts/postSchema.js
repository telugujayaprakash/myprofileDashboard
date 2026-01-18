const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    userid: {
        type: String,
        required: true,
        ref: 'User'
    },
    username: {
        type: String,
        required: true
    },
    comment: {
        type: String,
        required: true,
        maxlength: 500 // Limit comment length
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const postSchema = new mongoose.Schema({
    userid: {
        type: String,
        required: true,
        ref: 'User'
    },
    username: {
        type: String,
        required: true
    },
    textmsg: {
        type: String,
        required: true,
        maxlength: 1000 // Limit post text length
    },
    // Comments on the post
    comments: [commentSchema],
    // Likes functionality
    likes: {
        count: {
            type: Number,
            default: 0
        },
        users: [{
            type: String, // userid of users who liked
            ref: 'User'
        }]
    },
    // Shares functionality
    shares: {
        count: {
            type: Number,
            default: 0
        },
        users: [{
            type: String, // userid of users who shared
            ref: 'User'
        }]
    },
    // Post metadata
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Index for better query performance
postSchema.index({ userid: 1, createdAt: -1 }); // User's posts by creation date
postSchema.index({ createdAt: -1 }); // All posts by creation date
postSchema.index({ 'likes.count': -1 }); // Posts by likes count
postSchema.index({ 'shares.count': -1 }); // Posts by shares count

const Post = mongoose.model('Post', postSchema);

module.exports = Post;