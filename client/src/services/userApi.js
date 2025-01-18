import api from './api';

const USER_CACHE_KEY = 'user_profile_cache';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const getCachedUserProfile = (userId) => {
  const cachedData = localStorage.getItem(USER_CACHE_KEY);
  if (cachedData) {
    const parsedData = JSON.parse(cachedData);
    const userCache = parsedData[userId];
    if (userCache && Date.now() - new Date(userCache.cachedAt).getTime() < CACHE_EXPIRY) {
      return userCache;
    }
  }
  return null;
};

const setCachedUserProfile = (userId, profile) => {
  const cachedData = localStorage.getItem(USER_CACHE_KEY);
  const parsedData = cachedData ? JSON.parse(cachedData) : {};
  parsedData[userId] = { ...profile, cachedAt: new Date().toISOString() };
  localStorage.setItem(USER_CACHE_KEY, JSON.stringify(parsedData));
};

export const fetchUserProfile = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    const profile = response.data;
    setCachedUserProfile(userId, profile);
    return profile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    if (error.useCache) {
      const cachedProfile = getCachedUserProfile(userId);
      if (cachedProfile) {
        console.log('Using cached user profile data');
        return { ...cachedProfile, isCached: true };
      }
    }
    // Return a default profile if no cached data is available
    return {
      id: userId,
      username: 'User',
      statusMessage: 'Offline',
      avatar: 'https://via.placeholder.com/100',
      isCached: false,
      isDefault: true
    };
  }
};

export const updateUserProfile = async (userId, profileData) => {
  try {
    const response = await api.put(`/users/${userId}`, profileData);
    const updatedProfile = response.data;
    setCachedUserProfile(userId, updatedProfile);
    return updatedProfile;
  } catch (error) {
    console.error('Error updating user profile:', error);
    // Update the local cache even if the server update fails
    const cachedProfile = getCachedUserProfile(userId) || {};
    const updatedProfile = { ...cachedProfile, ...profileData, isCached: true, lastUpdateAttempt: new Date().toISOString() };
    setCachedUserProfile(userId, updatedProfile);
    return updatedProfile;
  }
};

