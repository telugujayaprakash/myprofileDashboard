const User = require('../../../models/Users/userSchema');
const Profile = require('../../../models/Users/profileSchema');

// Follow a user
const followUser = async (req, res) => {
    try {
        const authenticatedUserId = req.userId;
        const { username } = req.params;

        // Find the user to follow
        const userToFollow = await User.findOne({ username });
        if (!userToFollow) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Can't follow yourself
        if (userToFollow.userid === authenticatedUserId) {
            return res.status(400).json({ message: 'You cannot follow yourself' });
        }

        // Find authenticated user
        const authenticatedUser = await User.findOne({ userid: authenticatedUserId });
        if (!authenticatedUser) {
            return res.status(404).json({ message: 'Authenticated user not found' });
        }
        if (!authenticatedUser.username) {
            return res.status(400).json({ message: 'Authenticated user missing username' });
        }

        // Find authenticated user's profile
        let authenticatedProfile = await Profile.findOne({ userid: authenticatedUserId });
        if (!authenticatedProfile) {
            // Create profile if it doesn't exist
            authenticatedProfile = new Profile({
                userid: authenticatedUserId,
                username: authenticatedUser.username,
                following: [],
                followers: []
            });
        } else {
            // Ensure username is set on existing profile (in case it was missing)
            if (!authenticatedProfile.username) {
                authenticatedProfile.username = authenticatedUser.username;
            }
        }
        
        // Ensure following array exists
        if (!authenticatedProfile.following) {
            authenticatedProfile.following = [];
        }

        // Find target user's profile
        let targetProfile = await Profile.findOne({ userid: userToFollow.userid });
        if (!targetProfile) {
            if (!userToFollow.username) {
                return res.status(400).json({ message: 'Target user missing username' });
            }
            targetProfile = new Profile({
                userid: userToFollow.userid,
                username: userToFollow.username,
                following: [],
                followers: []
            });
        } else {
            // Ensure username is set on existing profile (in case it was missing)
            if (!targetProfile.username) {
                targetProfile.username = userToFollow.username;
            }
        }
        
        // Ensure followers array exists
        if (!targetProfile.followers) {
            targetProfile.followers = [];
        }

        // Check if already following
        if (authenticatedProfile.following.includes(userToFollow.userid)) {
            return res.status(400).json({ message: 'You are already following this user' });
        }

        // Add to following list
        authenticatedProfile.following.push(userToFollow.userid);
        await authenticatedProfile.save();

        // Add to target's followers list
        if (!targetProfile.followers.includes(authenticatedUserId)) {
            targetProfile.followers.push(authenticatedUserId);
            await targetProfile.save();
        }

        res.status(200).json({
            message: 'User followed successfully',
            followingCount: authenticatedProfile.following.length,
            followersCount: targetProfile.followers.length
        });

    } catch (error) {
        console.error('Error following user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Unfollow a user
const unfollowUser = async (req, res) => {
    try {
        const authenticatedUserId = req.userId;
        const { username } = req.params;

        // Find the user to unfollow
        const userToUnfollow = await User.findOne({ username });
        if (!userToUnfollow) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find authenticated user
        const authenticatedUser = await User.findOne({ userid: authenticatedUserId });
        if (!authenticatedUser) {
            return res.status(404).json({ message: 'Authenticated user not found' });
        }

        // Find authenticated user's profile
        const authenticatedProfile = await Profile.findOne({ userid: authenticatedUserId });
        if (!authenticatedProfile) {
            return res.status(404).json({ message: 'Your profile not found' });
        }
        
        // Ensure username is set on existing profile (in case it was missing)
        if (!authenticatedProfile.username) {
            authenticatedProfile.username = authenticatedUser.username;
        }
        
        // Ensure following array exists
        if (!authenticatedProfile.following) {
            authenticatedProfile.following = [];
        }

        // Find target user's profile
        const targetProfile = await Profile.findOne({ userid: userToUnfollow.userid });
        if (!targetProfile) {
            return res.status(404).json({ message: 'Target user profile not found' });
        }
        
        // Ensure username is set on existing profile (in case it was missing)
        if (!targetProfile.username) {
            targetProfile.username = userToUnfollow.username;
        }
        
        // Ensure followers array exists
        if (!targetProfile.followers) {
            targetProfile.followers = [];
        }

        // Check if currently following
        if (!authenticatedProfile.following.includes(userToUnfollow.userid)) {
            return res.status(400).json({ message: 'You are not following this user' });
        }

        // Remove from following list
        authenticatedProfile.following = authenticatedProfile.following.filter(
            id => id !== userToUnfollow.userid
        );
        await authenticatedProfile.save();

        // Remove from target's followers list
        targetProfile.followers = targetProfile.followers.filter(
            id => id !== authenticatedUserId
        );
        await targetProfile.save();

        res.status(200).json({
            message: 'User unfollowed successfully',
            followingCount: authenticatedProfile.following.length,
            followersCount: targetProfile.followers.length
        });

    } catch (error) {
        console.error('Error unfollowing user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Check if following a user
const checkFollowing = async (req, res) => {
    try {
        const authenticatedUserId = req.userId;
        const { username } = req.params;

        const userToCheck = await User.findOne({ username });
        if (!userToCheck) {
            return res.status(404).json({ message: 'User not found' });
        }

        const authenticatedProfile = await Profile.findOne({ userid: authenticatedUserId });
        if (!authenticatedProfile) {
            return res.status(200).json({ isFollowing: false });
        }

        const isFollowing = authenticatedProfile.following.includes(userToCheck.userid);

        res.status(200).json({ isFollowing });

    } catch (error) {
        console.error('Error checking follow status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { followUser, unfollowUser, checkFollowing };