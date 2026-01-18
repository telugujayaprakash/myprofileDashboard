const express = require('express')
const cors = require('cors')
const connect = require('./db/connection')
const usersAuth = require('./routes/users/user.routes')
const { getProfile, updateProfileData } = require('./controllers/Users/Auth/userprofile.controller');
const { followUser, unfollowUser, checkFollowing } = require('./controllers/Users/Auth/follow.controller');
const { verifyuser } = require('./controllers/verifyjwt.controller');
const {
    createPost,
    getUserPosts,
    getFeedPosts,
    likePost,
    sharePost,
    addComment,
    getPostDetails,
    deletePost,
    searchUsers,
    searchPosts
} = require('./controllers/Users/components/userposts.controller');


// Initializing Express App & cors
require('dotenv').config()
const app = express()
app.use(express.json())
const PORT = process.env.PORT || 3001
app.use(cors({
    origin: '*'
}))

//db connect
connect()


// Importing Routes
app.get("/", (req, res) => {
    res.send("App is running...");
});

app.use('/api/users', usersAuth)

// Profile routes
app.get('/:username', getProfile);
app.get('/:username/profile', getProfile); // Profile section route
app.put('/api/users/profile-data', verifyuser, updateProfileData); // Update profile data

// Follow/Unfollow routes
app.put('/api/users/:username/follow', verifyuser, followUser); // Follow user
app.put('/api/users/:username/unfollow', verifyuser, unfollowUser); // Unfollow user
app.get('/api/users/:username/following', verifyuser, checkFollowing); // Check if following

// Post routes
app.post('/api/posts', verifyuser, createPost); // Create post
app.get('/api/posts/feed', verifyuser, getFeedPosts); // Get feed posts
app.get('/:username/posts', getUserPosts); // Get user's posts (public)
app.get('/api/posts/:postId', getPostDetails); // Get post details
app.put('/api/posts/:postId/like', verifyuser, likePost); // Like/unlike post
app.put('/api/posts/:postId/share', verifyuser, sharePost); // Share post
app.post('/api/posts/:postId/comment', verifyuser, addComment); // Add comment
app.delete('/api/posts/:postId', verifyuser, deletePost); // Delete post

// Search routes
app.get('/api/search/users', searchUsers); // Search users
app.get('/api/search/posts', searchPosts); // Search posts




app.listen(PORT, (
    console.log(`Server Started at port ${PORT}`)
))