const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    userid: {
        type: String,
        required: true,
        unique: true,
        ref: 'User' // Reference to User model
    },
    username: {
        type: String,
        required: true
    },
    // Profile Information
    displayPicture: {
        type: String, // Image URL/link
        default: null
    },
    name: {
        type: String,
        default: null
    },
    profession: {
        type: String,
        default: null
    },
    dateOfBirth: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        default: null,
        maxlength: 200 // Limit status to 200 characters
    },
    relationshipStatus: {
        type: String,
        enum: ['Single', 'Married', 'Committed'],
        default: 'Single'
    },
    // Social Media Links (Array of objects)
    socialMediaLinks: [{
        platform: {
            type: String,
            required: true,
            enum: ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'github', 'website', 'other']
        },
        url: {
            type: String,
            required: true
        }
    }],
    // Following and Followers (Arrays of userids)
    following: [{
        type: String, // userid of followed user
        ref: 'User'
    }],
    followers: [{
        type: String, // userid of follower
        ref: 'User'
    }],
    // Profile completion status
    isProfileComplete: {
        type: Boolean,
        default: false
    },
    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now,
        set: function () { return new Date(); } // Always update to current time
    }
});

// Index for better query performance (userid is already unique, so no need for additional index)
profileSchema.index({ username: 1 });

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;