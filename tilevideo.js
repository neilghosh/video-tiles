// Global variables
var players = [];
var localVideo = [];
var isFullscreenMode = false;

// Video feeds configuration
var eclipseVideos = [
    { key: "P9M_e3JbpLY", title: "Time And Date" },
    { key: "2MJY_ptQW1o", title: "NASA Official" },
    { key: "XwQDEzpnYkk", title: "Chuck's Astrophotography" },
    { key: "Lb1kgHP5g80", title: "GRIFFITH OBSERVATORY" },
    { key: "7B74-teYM2g", title: "Time" },
    { key: "T8jK_f4_FiY", title: "Video From Space" },
    { key: "wQ4U6z5-gxE", title: "The Sun" },
    { key: "Dzjunyh_v1g", title: "First Post" },
    { key: "LUAeGft7W6c", title: "Sky News" }
];

var spaceVideos = [
    { key: "Hj1XwNjvkDE", title: "NASA Live: Earth Views" },
    { key: "vytmBNhc9ig", title: "NASA Live: ISS Stream" },
    { key: "fO9e9jnhYK8", title: "NASA Live: Space Station" },
    { key: "RtU_mdL2vBM", title: "NASA Space Station" }
];

var myVideos = [];

var earthcamVideos = [
    { key: "rnXIjl_Rzy4", title: "Times Square NYC" },
    { key: "MnyjqGMkzmw", title: "Las Vegas Strip" },
    { key: "57w2gYXjRic", title: "Abbey Road London" },
    { key: "yW0OOEO9usE", title: "Waikiki Beach Hawaii" },
    { key: "qHW8srS0ylo", title: "Bourbon Street New Orleans" }
];

// Feed configuration
var feeds = {
    "eclipse": eclipseVideos,
    "space": spaceVideos,
    "earthcam": earthcamVideos,
    "myvideos": myVideos
};

// Constants for localStorage
const DEFAULT_FEED = "eclipse";
const DEFAULT_FEED_STORAGE_KEY = "default_feed";
const CUSTOM_VIDEOS_STORAGE_KEY = "my_videos";

// Utility functions
function showLoading(show) {
    const loadingDiv = document.getElementById('loading');
    if (loadingDiv) {
        loadingDiv.style.display = show ? 'block' : 'none';
    }
}

function showError(message) {
    const container = document.getElementById('container');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    container.appendChild(errorDiv);
    
    // Auto-remove error after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 5000);
}

function isValidYouTubeVideoId(videoId) {
    // Basic validation for YouTube video ID format
    const regex = /^[a-zA-Z0-9_-]{11}$/;
    return regex.test(videoId);
}

// YouTube API ready callback
function onYouTubeIframeAPIReady() {
    console.log('YouTube IFrame API ready');
    
    try {
        // Get saved feed preference or use default
        const defaultFeed = localStorage.getItem(DEFAULT_FEED_STORAGE_KEY) || DEFAULT_FEED;
        
        // Set the dropdown to the saved preference
        const feedSelect = document.getElementById('feeds');
        if (feedSelect) {
            feedSelect.value = defaultFeed;
        }
        
        // Load and render videos
        renderVideos();
    } catch (error) {
        console.error('Error initializing video tiles:', error);
        showError('Failed to initialize video player. Please refresh the page.');
    }
}

// Render videos based on current feed selection
function renderVideos() {
    try {
        showLoading(true);
        
        const currentFeed = getCurrentFeed();
        console.log('Rendering videos for feed:', currentFeed);
        
        // Save current feed preference
        localStorage.setItem(DEFAULT_FEED_STORAGE_KEY, currentFeed);
        
        // Get videos from current feed
        const videos = getVideosFromFeed();
        
        // Render the video players
        renderPlayers(videos);
        
        showLoading(false);
    } catch (error) {
        console.error('Error rendering videos:', error);
        showError('Failed to load videos. Please try again.');
        showLoading(false);
    }
}

// Get current feed selection
function getCurrentFeed() {
    const feedSelect = document.getElementById('feeds');
    return feedSelect ? feedSelect.value : DEFAULT_FEED;
}

// Get videos from current feed including custom videos
function getVideosFromFeed() {
    const currentFeed = getCurrentFeed();
    const baseVideos = feeds[currentFeed] || [];
    
    // Get custom videos for current feed
    const customVideos = getLocalVideosForCurrentFeed();
    
    // Combine base videos with custom videos
    return [...baseVideos, ...customVideos];
}

// Get custom videos for current feed from localStorage
function getLocalVideosForCurrentFeed() {
    try {
        const storageKey = getCurrentFeed() + "_" + CUSTOM_VIDEOS_STORAGE_KEY;
        const savedVideos = localStorage.getItem(storageKey);
        return savedVideos ? JSON.parse(savedVideos) : [];
    } catch (error) {
        console.error('Error loading custom videos:', error);
        return [];
    }
}

// Clear all current players
function clearPlayers() {
    // Stop and destroy all current players
    players.forEach(player => {
        try {
            if (player && typeof player.destroy === 'function') {
                player.destroy();
            }
        } catch (error) {
            console.warn('Error destroying player:', error);
        }
    });
    
    players = [];
    
    // Clear container HTML
    const container = document.getElementById('container');
    if (container) {
        container.innerHTML = '';
    }
}

// Render video players
function renderPlayers(videos) {
    clearPlayers();
    
    if (!videos || videos.length === 0) {
        const container = document.getElementById('container');
        if (container) {
            container.innerHTML = '<div class="loading">No videos available for this feed. Add some custom videos!</div>';
        }
        return;
    }
    
    // Arrange videos in optimal grid layout
    const arrangedVideos = arrangeVideosByAspectRatio(videos);
    
    arrangedVideos.forEach((video, index) => {
        if (video && video.key && isValidYouTubeVideoId(video.key)) {
            const playerId = `player_${index}`;
            addVideo(playerId, video.key, video.title, video.aspectClass);
        } else {
            console.warn('Invalid video data:', video);
        }
    });
}

// Arrange videos by aspect ratio for optimal grid layout
function arrangeVideosByAspectRatio(videos) {
    const currentFeed = getCurrentFeed();
    
    // Define aspect ratio patterns for different feeds
    const aspectPatterns = {
        space: ['wide', 'wide', 'standard', 'standard'], // NASA streams tend to be wide format
        earthcam: ['wide', 'standard', 'wide', 'standard', 'standard'], // Mixed city/street cams
        eclipse: ['standard', 'standard', 'standard', 'standard', 'standard', 'standard', 'standard', 'standard', 'standard'] // Default grid
    };
    
    const pattern = aspectPatterns[currentFeed] || aspectPatterns.eclipse;
    
    return videos.map((video, index) => {
        const aspectClass = pattern[index % pattern.length] || 'standard';
        return {
            ...video,
            aspectClass: aspectClass
        };
    });
}

// Add a new video to the container
function addVideo(playerId, videoId, title, aspectClass = 'standard') {
    try {
        const container = document.getElementById('container');
        if (!container) {
            throw new Error('Container element not found');
        }
        
        // Create video wrapper with aspect ratio class
        const wrapper = document.createElement('div');
        wrapper.className = `video-wrapper new-video ${aspectClass}-aspect`;
        
        // Add title if provided
        if (title) {
            const titleElement = document.createElement('div');
            titleElement.className = 'video-title';
            titleElement.textContent = title;
            wrapper.appendChild(titleElement);
        }
        
        // Create player div
        const playerDiv = document.createElement('div');
        playerDiv.id = playerId;
        wrapper.appendChild(playerDiv);
        
        container.appendChild(wrapper);
        
        // Adjust player dimensions based on aspect ratio
        const dimensions = getPlayerDimensions(aspectClass);
        
        // Create YouTube player
        const player = new YT.Player(playerId, {
            height: dimensions.height,
            width: dimensions.width,
            videoId: videoId,
            playerVars: { 
                'autoplay': 0,  // Don't autoplay by default
                'controls': 1,
                'modestbranding': 1,
                'rel': 0
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange,
                'onError': onPlayerError
            }
        });
        
        players.push(player);
        
        // Remove animation class after animation completes
        setTimeout(() => {
            wrapper.classList.remove('new-video');
        }, 500);
        
    } catch (error) {
        console.error('Error adding video:', error);
        showError(`Failed to add video: ${error.message}`);
    }
}

// Get player dimensions based on aspect ratio class
function getPlayerDimensions(aspectClass) {
    const baseDimensions = {
        wide: { width: '640', height: '360' },     // 16:9 wide format
        standard: { width: '560', height: '315' }, // Standard 16:9
        square: { width: '400', height: '400' }    // 1:1 for special cams
    };
    
    return baseDimensions[aspectClass] || baseDimensions.standard;
}

// YouTube player event handlers
function onPlayerReady(event) {
    console.log('Player ready:', event.target.getVideoData().title);
    // Mute all videos by default
    event.target.mute();
}

function onPlayerStateChange(event) {
    // Handle player state changes if needed
    const state = event.data;
    if (state === YT.PlayerState.ENDED) {
        console.log('Video ended:', event.target.getVideoData().title);
    }
}

function onPlayerError(event) {
    const error = event.data;
    console.error('YouTube player error:', error);
    
    let errorMessage = 'Video playback error';
    switch (error) {
        case 2:
            errorMessage = 'Invalid video ID';
            break;
        case 5:
            errorMessage = 'HTML5 player error';
            break;
        case 100:
            errorMessage = 'Video not found or private';
            break;
        case 101:
        case 150:
            errorMessage = 'Video unavailable in embedded player';
            break;
    }
    
    showError(errorMessage);
}

// Control functions
function addNewVideo() {
    try {
        const newVideoInput = document.getElementById('newVideo');
        if (!newVideoInput) {
            throw new Error('Video input field not found');
        }
        
        const videoId = newVideoInput.value.trim();
        
        if (!videoId) {
            showError('Please enter a YouTube video ID');
            return;
        }
        
        if (!isValidYouTubeVideoId(videoId)) {
            showError('Please enter a valid YouTube video ID (11 characters)');
            return;
        }
        
        // Add to current players immediately
        const playerId = `player_custom_${Date.now()}`;
        addVideo(playerId, videoId, 'Custom Video');
        
        // Save to localStorage for current feed
        const customVideos = getLocalVideosForCurrentFeed();
        customVideos.push({ key: videoId, title: 'Custom Video' });
        
        const storageKey = getCurrentFeed() + "_" + CUSTOM_VIDEOS_STORAGE_KEY;
        localStorage.setItem(storageKey, JSON.stringify(customVideos));
        
        // Clear the input
        newVideoInput.value = '';
        
        console.log('Added custom video:', videoId);
        
    } catch (error) {
        console.error('Error adding new video:', error);
        showError(`Failed to add video: ${error.message}`);
    }
}

function stopAll() {
    players.forEach(player => {
        try {
            if (player && typeof player.stopVideo === 'function') {
                player.stopVideo();
            }
        } catch (error) {
            console.warn('Error stopping player:', error);
        }
    });
    console.log('Stopped all videos');
}

function playAll() {
    players.forEach(player => {
        try {
            if (player && typeof player.playVideo === 'function') {
                player.playVideo();
                // Ensure videos remain muted when playing
                if (typeof player.mute === 'function') {
                    player.mute();
                }
            }
        } catch (error) {
            console.warn('Error playing player:', error);
        }
    });
    console.log('Started all videos (muted)');
}

function muteAll() {
    players.forEach(player => {
        try {
            if (player && typeof player.mute === 'function') {
                player.mute();
            }
        } catch (error) {
            console.warn('Error muting player:', error);
        }
    });
    console.log('Muted all videos');
}

function resetVideos() {
    try {
        // Clear custom videos for current feed
        const storageKey = getCurrentFeed() + "_" + CUSTOM_VIDEOS_STORAGE_KEY;
        localStorage.removeItem(storageKey);
        
        // Re-render videos
        renderVideos();
        
        console.log('Reset custom videos for current feed');
        
    } catch (error) {
        console.error('Error resetting videos:', error);
        showError('Failed to reset videos. Please refresh the page.');
    }
}

// Fullscreen mode functions
function toggleFullscreenMode() {
    isFullscreenMode = !isFullscreenMode;
    const body = document.body;
    const btn = document.getElementById('fullscreenBtn');
    
    if (isFullscreenMode) {
        body.classList.add('fullscreen-mode');
        btn.textContent = '🚪 Exit Fullscreen';
        btn.title = 'Exit fullscreen video mode';
        
        // Try to enter browser fullscreen as well
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log('Browser fullscreen not available:', err);
            });
        }
        
        console.log('Entered fullscreen mode');
    } else {
        body.classList.remove('fullscreen-mode');
        btn.textContent = '🖥️ Fullscreen Mode';
        btn.title = 'Toggle fullscreen video mode';
        
        // Exit browser fullscreen
        if (document.exitFullscreen && document.fullscreenElement) {
            document.exitFullscreen().catch(err => {
                console.log('Error exiting browser fullscreen:', err);
            });
        }
        
        console.log('Exited fullscreen mode');
    }
    
    // Re-render videos with new layout
    setTimeout(() => {
        renderVideos();
    }, 100);
}

// Add keyboard shortcuts
document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('keydown', function(event) {
        // Only handle shortcuts if not typing in an input field
        if (event.target.tagName.toLowerCase() === 'input') {
            return;
        }
        
        switch (event.code) {
            case 'Space':
                event.preventDefault();
                playAll();
                break;
            case 'KeyS':
                event.preventDefault();
                stopAll();
                break;
            case 'KeyM':
                event.preventDefault();
                muteAll();
                break;
            case 'KeyF':
                event.preventDefault();
                toggleFullscreenMode();
                break;
            case 'Escape':
                if (isFullscreenMode) {
                    event.preventDefault();
                    toggleFullscreenMode();
                }
                break;
        }
    });
    
    // Handle browser fullscreen changes
    document.addEventListener('fullscreenchange', function() {
        // If user exits browser fullscreen, also exit our fullscreen mode
        if (!document.fullscreenElement && isFullscreenMode) {
            // Don't trigger toggleFullscreenMode to avoid recursion
            isFullscreenMode = false;
            document.body.classList.remove('fullscreen-mode');
            const btn = document.getElementById('fullscreenBtn');
            if (btn) {
                btn.textContent = '🖥️ Fullscreen Mode';
                btn.title = 'Toggle fullscreen video mode';
            }
            setTimeout(() => {
                renderVideos();
            }, 100);
        }
    });
});

console.log('Video Tiles script loaded successfully');
