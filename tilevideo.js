var players = [];

var videos = [
  { key: "rD6IeVB9Ayk", title: "Eithiopia" },
  { key: "rD6IeVB9Ayk", title: "Eithiopia" },
  { key: "56rpzC0RA04", title: "Eithiopia" },
  { key: "_tEab2xekhQ", title: "Eithiopia" },
  { key: "3jYS_XKoJ6g", title: "Eithiopia" },
  { key: "EEIk7gwjgIM", title: "SomeTitle" }
];

var localVideo = [];

function onYouTubeIframeAPIReady() {
  renderPlayers();
}

function renderPlayers(){
  clearPlayers();
  var localVideo = JSON.parse(localStorage.getItem("videos"));
  videos = videos.concat(localVideo);
  videos.forEach((obj, i) => {
    addVideo("player" + i, obj.key)
  })
}

function clearPlayers(){
  players = [];
  $("#container").html("");
}

function addNewVideo(){
  var videoId = $("#newVideo").val();
  var playerId = "player" + (players.length+1);
  addVideo(playerId,videoId);
  localVideo.push({ key : videoId, title : ""});
  localStorage.setItem("videos", JSON.stringify(localVideo));
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
  event.target.playVideo();
}

function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.ENDED) {
    // player2.playVideo();
  }
}

function resetVideos(){
  localVideo = [];
  localStorage.setItem("videos", JSON.stringify(localVideo))
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
