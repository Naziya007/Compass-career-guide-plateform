const express = require('express');
const User = require('../models/User');
const router = express.Router();

// @route   GET /api/users/profile/:userId
// @desc    Get user profile by ID
// @access  Public (for now)
router.get('/profile/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/users/profile/:userId
// @desc    Update user profile
// @access  Private (user can only update their own profile)
router.put('/profile/:userId', async (req, res) => {
  try {
    const { firstName, lastName, age, gender, class: userClass, location } = req.body;

    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update profile fields
    if (firstName) user.profile.firstName = firstName;
    if (lastName) user.profile.lastName = lastName;
    if (age) user.profile.age = age;
    if (gender) user.profile.gender = gender;
    if (userClass) user.profile.class = userClass;
    if (location) user.profile.location = location;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        profile: user.profile
      }
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/:userId/recommendations
// @desc    Get user recommendations
// @access  Private
router.get('/:userId/recommendations', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('recommendations interestTags');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      recommendations: user.recommendations,
      interestTags: user.interestTags
    });

  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/users/:userId/preferences
// @desc    Update user preferences
// @access  Private
router.post('/:userId/preferences', async (req, res) => {
  try {
    const { preferredLanguage, notificationsEnabled, shareDataWithMentors } = req.body;

    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update preferences
    if (preferredLanguage !== undefined) user.preferences.preferredLanguage = preferredLanguage;
    if (notificationsEnabled !== undefined) user.preferences.notificationsEnabled = notificationsEnabled;
    if (shareDataWithMentors !== undefined) user.preferences.shareDataWithMentors = shareDataWithMentors;

    await user.save();

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: user.preferences
    });

  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
