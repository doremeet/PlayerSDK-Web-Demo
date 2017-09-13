'use strict';

function createMyPlayer(elemId) {
  var element = document.getElementById(elemId);
  var player = sdk.createPlayer(document.querySelector('#' + elemId + ' > video'));
  player.resize(element.offsetWidth, element.offsetHeight);

  var seek = element.getElementsByClassName('player-seek')[0];
  var seekBar = element.getElementsByClassName('seek-bar')[0];
  var seekBuffer = element.getElementsByClassName('seek-buffer')[0];
  var playerTime = element.getElementsByClassName('player-time')[0];
  var playerDuration = element.getElementsByClassName('player-duration')[0];
  var qualitiesMenu = element.getElementsByClassName('qualities-menu')[0];
  var fullscreen = element.getElementsByClassName('player-fullscreen')[0];
  var playerPlay = element.getElementsByClassName('player-play')[0];

  seek.addEventListener('click', function(e) {
    e.stopPropagation();
    player.seekTo((e.offsetX / seek.clientWidth) * player.duration);
  });

  fullscreen.addEventListener('click', function() {
    if (!element.classList.contains('fullscreen')) {
      requestFullscreen(element);
    } else {
      exitFullscreen();
    }
  });

  playerPlay.addEventListener('click', function() {
    if (player.playWhenReady) {
      player.playWhenReady = false;
      element.classList.add('paused');
    } else {
      player.playWhenReady = true;
      element.classList.remove('paused');
    }
  });

  onFullscreenChange(function() {
    if (fullscreenElement() === element) {
      element.classList.add('fullscreen');
    } else {
      element.classList.remove('fullscreen');
    }
  });

  player.on('stateChanged', function () {
    if (player.duration === 0 && state !== IBandSDK.Player.State.INITIALIZE) {
      playerTime.innerText = 'LIVE';

      seek.style.visibility = 'hidden';
      playerDuration.style.visibility = 'hidden';
    } else {
      playerTime.innerText = getTime(player.currentPosition);

      seek.style.visibility = 'visible';
      seekBar.style.width = (player.currentPosition / player.duration) * 100 + '%';

      playerDuration.style.visibility = 'visible';
      playerDuration.innerText = getTime(player.duration);
    }
  });

  window.addEventListener('resize', function() {
    player.resize(element.offsetWidth, element.offsetHeight);
  });

  player.on('variantsCreated', function (variants) {
    while (qualitiesMenu.hasChildNodes()) {
      qualitiesMenu.removeChild(qualitiesMenu.lastChild);
    }

    var li = document.createElement('li');
    li.innerText = 'Auto';
    li.className = 'selected active';
    li.setAttribute('tabindex', 0);
    li.onclick = function() {
      player.setAutoVariant();
      updateVariantsStates(qualitiesMenu, 0, player.getCurrentVariantIndex() + 1);
    };
    qualitiesMenu.appendChild(li);

    variants.forEach(function (variant, i) {
      var li = document.createElement('li');
      li.innerText = variant.height + 'p';
      li.setAttribute('tabindex', i + 1);
      li.onclick = function() {
        player.setCurrentVariant(i);
        updateVariantsStates(qualitiesMenu, i + 1, i + 1);
      };
      qualitiesMenu.appendChild(li);
    });
  });

  player.on('currentVariantChanged', function (variantIndex) {
    updateVariantsStates(qualitiesMenu, 0, variantIndex + 1);
  });

  player.on('currentPositionUpdate', function (currentPosition) {
    playerTime.innerText = getTime(currentPosition);
    seekBar.style.width = (currentPosition / player.duration) * 100 + '%';
  });

  player.on('bufferPositionUpdate', function (bufferPosition) {
    seekBuffer.style.width = (bufferPosition / player.duration) * 100 + '%';
  });

  return player;
}

function updateVariantsStates(qualitiesMenu, selectedIndex, activeIndex) {
  for(var i = 0; i < qualitiesMenu.childNodes.length; i+= 1) {
    qualitiesMenu.childNodes[i].className = '';
  }

  if (selectedIndex !== activeIndex) {
    qualitiesMenu.childNodes[selectedIndex].className = 'selected';
    qualitiesMenu.childNodes[activeIndex].className = 'active';
  } else {
    qualitiesMenu.childNodes[activeIndex].className = 'selected active';
  }
}

function getTime(ms) {
  var seconds = Math.floor((ms / 1e3) % 60);
  var minutes = Math.floor(ms / 60e3);

  if (seconds < 10) seconds = '0' + seconds;
  if (minutes < 10) minutes = '0' + minutes;

  return minutes + ':' + seconds;
}

function fullscreenEnabled() {
  return document.fullscreenEnabled
    || document.webkitFullscreenEnabled
    || document.mozFullScreenEnabled
    || document.msFullScreenEnabled;
}

function fullscreenElement() {
  return document.fullscreenElement
    || document.webkitFullscreenElement
    || document.mozFullScreenElement
    || document.msFullscreenElement;
}

function requestFullscreen(element) {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if (element.webkitRequestFullScreen) {
    element.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
  }
}

function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
}

function onFullscreenChange(exitHandler) {
  document.addEventListener('webkitfullscreenchange', exitHandler, false);
  document.addEventListener('mozfullscreenchange', exitHandler, false);
  document.addEventListener('fullscreenchange', exitHandler, false);
  document.addEventListener('MSFullscreenChange', exitHandler, false);
}
