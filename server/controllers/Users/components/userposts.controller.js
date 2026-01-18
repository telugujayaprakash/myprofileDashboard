const Post = require('../../../models/Posts/postSchema');
const User = require('../../../models/Users/userSchema');
const Profile = require('../../../models/Users/profileSchema');

// Create a new post
const createPost = async (req, res) => {
    try {
        const { textmsg } = req.body;
        const userid = req.userId;

        if (!textmsg || textmsg.trim().length === 0) {
            return res.status(400).json({ message: 'Post content cannot be empty' });
        }

        // Find user details
        const user = await User.findOne({ userid });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create the post
        const newPost = new Post({
            userid,
            username: user.username,
            textmsg: textmsg.trim()
        });

        await newPost.save();

        res.status(201).json({
            message: 'Post created successfully',
            post: {
                _id: newPost._id,
                userid: newPost.userid,
                username: newPost.username,
                textmsg: newPost.textmsg,
                likes: { count: 0, users: [] },
                shares: { count: 0, users: [] },
                comments: [],
                createdAt: newPost.createdAt
            }
        });

    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get user's own posts
const getUserPosts = async (req, res) => {
    try {
        const { username } = req.params;
        const requestingUserId = req.userId; // Optional, for authentication

        // Find user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get posts by this user
        const posts = await Post.find({
            userid: user.userid,
            isActive: true
        }).sort({ createdAt: -1 });

        res.status(200).json({
            user: {
                userid: user.userid,
                username: user.username
            },
            posts: posts.map(post => ({
                _id: post._id,
                userid: post.userid,
                username: post.username,
                textmsg: post.textmsg,
                likes: post.likes,
                shares: post.shares,
                commentsCount: post.comments.length,
                comments: post.comments.slice(-3), // Last 3 comments
                createdAt: post.createdAt,
                updatedAt: post.updatedAt
            }))
        });

    } catch (error) {
        console.error('Error fetching user posts:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get posts for feed (from users the current user follows only)
const getFeedPosts = async (req, res) => {
    try {
        const userid = req.userId;

        // Find user's profile to get following list
        const userProfile = await Profile.findOne({ userid });
        if (!userProfile) {
            return res.status(404).json({ message: 'User profile not found' });
        }

        // Get posts from followed users only (exclude own posts)
        const followingUserIds = userProfile.following || [];
        const feedUserIds = followingUserIds;

        const posts = await Post.find({
            userid: { $in: feedUserIds },
            isActive: true
        }).sort({ createdAt: -1 }).limit(50); // Limit to 50 posts for performance

        res.status(200).json({
            posts: posts.map(post => ({
                _id: post._id,
                userid: post.userid,
                username: post.username,
                textmsg: post.textmsg,
                likes: post.likes,
                shares: post.shares,
                commentsCount: post.comments.length,
                comments: post.comments.slice(-3), // Last 3 comments
                createdAt: post.createdAt,
                updatedAt: post.updatedAt
            }))
        });

    } catch (error) {
        console.error('Error fetching feed posts:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Like a post
const likePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userid = req.userId;

        const post = await Post.findById(postId);
        if (!post || !post.isActive) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if user already liked
        const alreadyLiked = post.likes.users.includes(userid);

        if (alreadyLiked) {
            // Unlike the post
            post.likes.users = post.likes.users.filter(id => id !== userid);
            post.likes.count = Math.max(0, post.likes.count - 1);
        } else {
            // Like the post
            if (!post.likes.users.includes(userid)) {
                post.likes.users.push(userid);
                post.likes.count += 1;
            }
        }

        await post.save();

        res.status(200).json({
            message: alreadyLiked ? 'Post unliked' : 'Post liked',
            likes: post.likes
        });

    } catch (error) {
        console.error('Error liking post:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Share a post
const sharePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userid = req.userId;

        const post = await Post.findById(postId);
        if (!post || !post.isActive) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if user already shared
        const alreadyShared = post.shares.users.includes(userid);

        if (!alreadyShared) {
            post.shares.users.push(userid);
            post.shares.count += 1;
            await post.save();
        }

        // Generate shareable link
        const shareableLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/post/${postId}`;

        res.status(200).json({
            message: 'Post shared successfully',
            shares: post.shares,
            shareableLink: shareableLink
        });

    } catch (error) {
        console.error('Error sharing post:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Add comment to post
const addComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { comment } = req.body;
        const userid = req.userId;

        if (!comment || comment.trim().length === 0) {
            return res.status(400).json({ message: 'Comment cannot be empty' });
        }

        // Find user
        const user = await User.findOne({ userid });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const post = await Post.findById(postId);
        if (!post || !post.isActive) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Add comment
        const newComment = {
            userid,
            username: user.username,
            comment: comment.trim()
        };

        post.comments.push(newComment);
        await post.save();

        res.status(201).json({
            message: 'Comment added successfully',
            comment: newComment,
            commentsCount: post.comments.length
        });

    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get post details with all comments
const getPostDetails = async (req, res) => {
    try {
        const { postId } = req.params;

        const post = await Post.findById(postId);
        if (!post || !post.isActive) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.status(200).json({
            post: {
                _id: post._id,
                userid: post.userid,
                username: post.username,
                textmsg: post.textmsg,
                likes: post.likes,
                shares: post.shares,
                comments: post.comments,
                createdAt: post.createdAt,
                updatedAt: post.updatedAt
            }
        });

    } catch (error) {
        console.error('Error fetching post details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete a post (only by post owner)
const deletePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userid = req.userId;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if user owns the post
        if (post.userid !== userid) {
            return res.status(403).json({ message: 'You can only delete your own posts' });
        }

        // Soft delete by setting isActive to false
        post.isActive = false;
        await post.save();

        res.status(200).json({ message: 'Post deleted successfully' });

    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Search users by username or name
const searchUsers = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.trim().length < 2) {
            return res.status(400).json({ message: 'Search query must be at least 2 characters' });
        }

        const searchRegex = new RegExp(q.trim(), 'i');

        // Find users matching the search
        const users = await User.find({
            $or: [
                { username: searchRegex },
                { email: searchRegex }
            ],
            isActive: true
        }).limit(20);

        // Get profile data for each user
        const usersWithProfiles = await Promise.all(
            users.map(async (user) => {
                const profile = await Profile.findOne({ userid: user.userid });
                return {
                    userid: user.userid,
                    username: user.username,
                    profession: profile?.profession || 'Not specified',
                    name: profile?.name || user.username,
                    displayPicture: profile?.displayPicture || null
                };
            })
        );

        res.status(200).json({
            users: usersWithProfiles,
            total: usersWithProfiles.length
        });

    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Search posts by content
const searchPosts = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.trim().length < 2) {
            return res.status(400).json({ message: 'Search query must be at least 2 characters' });
        }

        const searchRegex = new RegExp(q.trim(), 'i');

        // Find posts matching the search
        const posts = await Post.find({
            textmsg: searchRegex,
            isActive: true
        }).sort({ createdAt: -1 }).limit(20);

        res.status(200).json({
            posts: posts.map(post => ({
                _id: post._id,
                userid: post.userid,
                username: post.username,
                textmsg: post.textmsg,
                likes: post.likes,
                shares: post.shares,
                commentsCount: post.comments.length,
                comments: post.comments.slice(-3), // Last 3 comments
                createdAt: post.createdAt,
                updatedAt: post.updatedAt
            })),
            total: posts.length
        });

    } catch (error) {
        console.error('Error searching posts:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
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
};