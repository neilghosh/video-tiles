var players = [];

var eclipseVideos = [
  { key: "2FKh2xLo4Ek", title: "Royal Observatory Greenwich"},
  { key: "Zg3O8NnnboA", title: "The Virtual Telescope Project" },
  { key: "0sx_vuKEGlY", title: "Time & Date" },
  { key: "U-xv7_fxut4", title: "Space Satellite" },
  { key: "BDRyWgOMOpw", title: "SteviePAX" },
  { key: "5ZTmKiPlTO8", title: "catchingphotons" },
  { key: "5ZTmKiPlTO8", title: "Chelmsford, UK" } //1nUMDx8PiF4
];

var spaceVideos = [
  { key: "EEIk7gwjgIM", title: "NASA ISS Live Stream" },
  { key: "DDU-rZs-Ic4", title: "Space Official" },
  { key: "21X5lGlDOfg", title: "NASA TV" },
  { key: "5_rLJNq7Rw8", title: "Earth From Sace" }
];

var myeVideos = [
];


var feeds = [];
feeds["eclipse"] = eclipseVideos;
feeds["space"] = spaceVideos;
feeds["myvideos"] = myeVideos;

const DEFAULT_FEED = "eclipse";
const DEFAULT_FEED_STORAGE_KEY = "default_feed";
const CUSTOM_VIDEOS_STORAGE_KEY = "my_videos";

var localVideo = [];

function onYouTubeIframeAPIReady() {
  var defaultFeed = localStorage.getItem(DEFAULT_FEED_STORAGE_KEY) == undefined ? DEFAULT_FEED : localStorage.getItem(DEFAULT_FEED_STORAGE_KEY);
  $("#feeds").val(defaultFeed);
  renderPlayers(feeds[defaultFeed]);
}

function renderVideos() {
  videos = getVideosFromFeed()
  localStorage.setItem(DEFAULT_FEED_STORAGE_KEY, $("#feeds").val());
  renderPlayers(videos);
}

function getVideosFromFeed() {
  var feed = $("#feeds").val();
  return feeds[feed];
}

function renderPlayers() {
  clearPlayers();
  var localVideo = JSON.parse(localStorage.getItem(getLocalVideosForCurrentFeed()));
  videos = getVideosFromFeed();
  videos = videos.concat(localVideo);
  videos.forEach((obj, i) => {
    addVideo("player" + i, obj.key)
  })
}

function getLocalVideosForCurrentFeed() {
  return $("#feeds").val()+"_"+CUSTOM_VIDEOS_STORAGE_KEY;
}

function clearPlayers() {
  players = [];
  $("#container").html("");
}

function addNewVideo() {
  var videoId = $("#newVideo").val();
  var playerId = "player" + (players.length + 1);
  addVideo(playerId, videoId);
  localVideo.push({ key: videoId, title: "" });
  localStorage.setItem(getLocalVideosForCurrentFeed(), JSON.stringify(localVideo));
}

function addVideo(videoId, key) {
  $("#container").append(`
  <div id=`+ videoId + `/>
`);

  player = new YT.Player(videoId, {
    height: '315',
    width: '560',
    videoId: key,
    playerVars: { 'autoplay': 1, 'controls': 1 },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
  players.push(player);
}

function onPlayerReady(event) {
  event.target.mute();
  event.target.playVideo();
}

function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.ENDED) {
    // player2.playVideo();
  }
}

function resetVideos() {
  localVideo = [];
  localStorage.setItem(CUSTOM_VIDEOS_STORAGE_KEY, JSON.stringify(localVideo))
  renderPlayers();
}

function stopAll() {
  players.forEach((obj, i) => {
    obj.stopVideo();
  })
}

function playAll() {
  players.forEach((obj, i) => {
    obj.playVideo();
  })
}

function muteAll() {
  players.forEach((obj, i) => {
    obj.mute();
  })
}
