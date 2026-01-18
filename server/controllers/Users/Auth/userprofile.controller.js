const User = require('../../../models/Users/userSchema');
const Profile = require('../../../models/Users/profileSchema');
const jwt = require('jsonwebtoken');

// Get user profile by username
const getProfile = async (req, res) => {
    try {
        const { username } = req.params;

        // Find the profile user by username
        const profileUser = await User.findOne({ username });
        if (!profileUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find the user's profile data
        const userProfile = await Profile.findOne({ userid: profileUser.userid });

        // Get user's posts for profile view (like Instagram)
        const Post = require('../../../models/Posts/postSchema');
        const userPosts = await Post.find({
            userid: profileUser.userid,
            isActive: true
        }).sort({ createdAt: -1 }).limit(20); // Limit to 20 recent posts

        // Check if token exists and extract user info
        const authHeader = req.headers['authorization'];
        let authenticatedUser = null;
        let tokenExists = false;

        if (authHeader) {
            try {
                // Handle both "Bearer <token>" and "<token>" formats
                const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

                // Verify token and get user info
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                authenticatedUser = await User.findOne({ userid: decoded.userid });
                tokenExists = true;
            } catch (error) {
                // Token is invalid or expired, treat as no token
                tokenExists = false;
            }
        }

        // Check if the authenticated user is viewing their own profile
        const isOwnProfile = authenticatedUser && authenticatedUser.username === username;
        const isTokenUserMatched = tokenExists && authenticatedUser && authenticatedUser.username === username;

        if (isOwnProfile && tokenExists) {
            // Return full profile with edit permission for own profile
            return res.status(200).json({
                isOwnProfile: true,
                canEdit: true,
                userMatched: true,
                profile: {
                    userid: profileUser.userid,
                    username: profileUser.username,
                    email: profileUser.email,
                    phonenumber: profileUser.phonenumber,
                    isAdmin: profileUser.isAdmin,
                    isActive: profileUser.isActive,
                    createdAt: profileUser.createdAt,
                    updatedAt: profileUser.updatedAt
                },
                profileData: userProfile ? {
                    displayPicture: userProfile.displayPicture,
                    name: userProfile.name,
                    profession: userProfile.profession,
                    dateOfBirth: userProfile.dateOfBirth,
                    status: userProfile.status,
                    socialMediaLinks: userProfile.socialMediaLinks,
                    following: userProfile.following,
                    followers: userProfile.followers,
                    followingCount: userProfile.following ? userProfile.following.length : 0,
                    followersCount: userProfile.followers ? userProfile.followers.length : 0,
                    isProfileComplete: userProfile.isProfileComplete,
                    updatedAt: userProfile.updatedAt
                } : null,
                posts: userPosts.map(post => ({
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
        } else if (tokenExists && !isTokenUserMatched) {
            // Check if authenticated user is following this profile user
            const authenticatedProfile = await Profile.findOne({ userid: authenticatedUser.userid });
            const isFollowing = authenticatedProfile && authenticatedProfile.following 
                ? authenticatedProfile.following.includes(profileUser.userid) 
                : false;

            // Token exists but user doesn't match - show limited profile with some public profile data
            return res.status(200).json({
                isOwnProfile: false,
                canEdit: false,
                userMatched: false,
                isFollowing: isFollowing,
                message: "Token user does not match profile user",
                profile: {
                    username: profileUser.username,
                    isActive: profileUser.isActive,
                    createdAt: profileUser.createdAt
                },
                profileData: userProfile ? {
                    displayPicture: userProfile.displayPicture,
                    name: userProfile.name,
                    profession: userProfile.profession,
                    status: userProfile.status,
                    followingCount: userProfile.following ? userProfile.following.length : 0,
                    followersCount: userProfile.followers ? userProfile.followers.length : 0
                } : null,
                posts: userPosts.map(post => ({
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
        } else {
            // No token or invalid token - show limited profile for visitors
            return res.status(200).json({
                isOwnProfile: false,
                canEdit: false,
                userMatched: false,
                message: "Viewing as visitor - limited details",
                profile: {
                    username: profileUser.username,
                    isActive: profileUser.isActive,
                    createdAt: profileUser.createdAt
                },
                profileData: userProfile ? {
                    displayPicture: userProfile.displayPicture,
                    name: userProfile.name,
                    profession: userProfile.profession,
                    status: userProfile.status,
                    followingCount: userProfile.following ? userProfile.following.length : 0,
                    followersCount: userProfile.followers ? userProfile.followers.length : 0
                } : null,
                posts: userPosts.map(post => ({
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
        }

    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update user profile (only for own profile)
const updateProfile = async (req, res) => {
    try {
        const authenticatedUserId = req.userId;
        const { username, email, phonenumber } = req.body;

        // Find the authenticated user
        const authenticatedUser = await User.findOne({ userid: authenticatedUserId });
        if (!authenticatedUser) {
            return res.status(404).json({ message: 'Authenticated user not found' });
        }

        // Check if user is trying to update their own profile
        const profileUser = await User.findOne({ username: authenticatedUser.username });
        if (!profileUser) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        // Only allow updating own profile
        if (authenticatedUser.userid !== profileUser.userid) {
            return res.status(403).json({ message: 'You can only update your own profile' });
        }

        // Check if new username/email is already taken by another user
        if (username && username !== authenticatedUser.username) {
            const existingUsername = await User.findOne({ username });
            if (existingUsername) {
                return res.status(400).json({ message: 'Username already taken' });
            }
        }

        if (email && email !== authenticatedUser.email) {
            const existingEmail = await User.findOne({ email });
            if (existingEmail) {
                return res.status(400).json({ message: 'Email already taken' });
            }
        }

        // Update profile fields
        const updateData = {};
        if (username) updateData.username = username;
        if (email) updateData.email = email;
        if (phonenumber !== undefined) updateData.phonenumber = phonenumber; // Allow empty phonenumber
        updateData.updatedAt = new Date();

        const updatedUser = await User.findOneAndUpdate(
            { userid: authenticatedUserId },
            updateData,
            { new: true }
        );

        res.status(200).json({
            message: 'Profile updated successfully',
            profile: {
                userid: updatedUser.userid,
                username: updatedUser.username,
                email: updatedUser.email,
                phonenumber: updatedUser.phonenumber,
                updatedAt: updatedUser.updatedAt
            }
        });

    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update user profile data
const updateProfileData = async (req, res) => {
    try {
        const authenticatedUserId = req.userId;
        const {
            displayPicture,
            name,
            profession,
            dateOfBirth,
            status,
            socialMediaLinks
        } = req.body;

        // Find the authenticated user
        const authenticatedUser = await User.findOne({ userid: authenticatedUserId });
        if (!authenticatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find or create the user's profile
        let userProfile = await Profile.findOne({ userid: authenticatedUserId });

        if (!userProfile) {
            // Create profile if it doesn't exist
            userProfile = new Profile({
                userid: authenticatedUserId,
                username: authenticatedUser.username
            });
        }

        // Update profile fields
        const updateData = {};

        if (displayPicture !== undefined) updateData.displayPicture = displayPicture;
        if (name !== undefined) updateData.name = name;
        if (profession !== undefined) updateData.profession = profession;
        if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
        if (status !== undefined) updateData.status = status;

        // Handle social media links array
        if (socialMediaLinks !== undefined) {
            // Validate social media links structure
            if (Array.isArray(socialMediaLinks)) {
                const validPlatforms = ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'github', 'website', 'other'];
                const validatedLinks = socialMediaLinks.filter(link =>
                    link.platform && link.url && validPlatforms.includes(link.platform)
                );
                updateData.socialMediaLinks = validatedLinks;
            }
        }

        // Check if profile is complete (has basic required fields)
        const hasBasicInfo = updateData.name && updateData.profession;
        if (hasBasicInfo) {
            updateData.isProfileComplete = true;
        }

        // Update the profile
        const updatedProfile = await Profile.findOneAndUpdate(
            { userid: authenticatedUserId },
            updateData,
            { new: true, upsert: true }
        );

        res.status(200).json({
            message: 'Profile updated successfully',
            profileData: {
                displayPicture: updatedProfile.displayPicture,
                name: updatedProfile.name,
                profession: updatedProfile.profession,
                dateOfBirth: updatedProfile.dateOfBirth,
                status: updatedProfile.status,
                socialMediaLinks: updatedProfile.socialMediaLinks,
                followingCount: updatedProfile.following ? updatedProfile.following.length : 0,
                followersCount: updatedProfile.followers ? updatedProfile.followers.length : 0,
                isProfileComplete: updatedProfile.isProfileComplete,
                updatedAt: updatedProfile.updatedAt
            }
        });

    } catch (error) {
        console.error('Error updating profile data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { getProfile, updateProfile, updateProfileData };