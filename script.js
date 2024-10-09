const atlassianBitbucketGame = document.querySelector(
  "div#atlassianBitbucketGame"
);
const atlassianJiraGame = document.querySelector("div#atlassianJiraGame");
const jiraStats = document.querySelector("div#jiraStats");
const CANVAS = document.querySelector("canvas");
const ctx = CANVAS.getContext("2d");

const jiraCanvas = document.querySelector("#jiraGame");
const jiraCtx = jiraCanvas.getContext("2d");

const gameCanvas = document.querySelector("#gameCanvas");

// 80vh will be the height = (window.innerHeight/10 * 8)
const width = (CANVAS.width = jiraCanvas.width = innerWidth);
const height = (CANVAS.height = jiraCanvas.height = innerHeight);

let currentActiveGame = "";

let villageCollisionMap = [];
for (let i = 0; i < villageCollision.length; i += 50) {
  villageCollisionMap.push(villageCollision.slice(i, i + 50));
}

let roomCollisionMap = [];
for (let i = 0; i < roomColiision.length; i += 20) {
  roomCollisionMap.push(roomColiision.slice(i, i + 20));
}

let mazeCollisionMap = [];
for (let i = 0; i < mazeColiision.length; i += 180) {
  mazeCollisionMap.push(mazeColiision.slice(i, i + 180));
}

const offset = {
  x: -100,
  y: 0,
};

const villageBoundaries = [];
villageCollisionMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol !== 0)
      villageBoundaries.push(
        new Boundary({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y,
          },
        })
      );
  });
});

const roomBoundaries = [];
roomCollisionMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol !== 0)
      roomBoundaries.push(
        new Boundary({
          position: {
            x: j * Boundary.width,
            y: i * Boundary.height,
          },
        })
      );
  });
});

let mazeBoundaries = [];
mazeCollisionMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol !== 0)
      mazeBoundaries.push(
        new Boundary({
          position: {
            x: j * Boundary.width - 1400,
            y: i * Boundary.height - 1200,
          },
        })
      );
  });
});

const village = new Image();
village.src = "./img/village.png";

const foregroundImg = new Image();
foregroundImg.src = "./img/foreground.png";

const room = new Image();
room.src = "./img/room.png";

const maze = new Image();
maze.src = "./img/mazeMap.png";

const playerImage = new Image();
playerImage.src = "./img/playerDown.png";

const playerImageUp = new Image();
playerImageUp.src = "./img/playerUp.png";

const playerImageLeft = new Image();
playerImageLeft.src = "./img/playerLeft.png";

const playerImageRight = new Image();
playerImageRight.src = "./img/playerRight.png";

const player = new Sprite({
  position: {
    // 192*68 is the dimension of the playerDown.png
    x: CANVAS.width / 4 + 200,
    y: CANVAS.height / 2 + 60,
  },
  image: playerImage,
  frames: {
    max: 4,
    hold: 10,
  },
  sprites: {
    down: playerImage,
    up: playerImageUp,
    left: playerImageLeft,
    right: playerImageRight,
  },
});

const background = new Sprite({
  position: {
    x: offset.x,
    y: offset.y,
  },
  image: village,
});

const foreground = new Sprite({
  position: {
    x: offset.x,
    y: offset.y,
  },
  image: foregroundImg,
});

const roomBackground = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  image: room,
});

const roomPlayer = new Sprite({
  position: {
    x: 450,
    y: 350,
  },
  image: playerImageLeft,
  frames: {
    max: 4,
    hold: 10,
  },
  sprites: {
    down: playerImage,
    up: playerImageUp,
    left: playerImageLeft,
    right: playerImageRight,
  },
});

const mazeBackground = new Sprite({
  position: {
    x: -1400,
    y: -1200,
  },
  image: maze,
  context: jiraCtx,
});

const mazePlayer = new Sprite({
  position: {
    x: 450,
    y: 480,
  },
  image: playerImageLeft,
  frames: {
    max: 4,
    hold: 10,
  },
  sprites: {
    down: playerImage,
    up: playerImageUp,
    left: playerImageLeft,
    right: playerImageRight,
  },
  context: jiraCtx,
});

const keys = {
  up: { pressed: false },
  down: { pressed: false },
  left: { pressed: false },
  right: { pressed: false },
};

const villageMovables = [background, ...villageBoundaries, foreground];
const roomMovables = [roomBackground, ...roomBoundaries];
const mazeMovables = [mazeBackground, ...mazeBoundaries];

const collisionDetection = ({ rect1, rect2 }) => {
  return (
    // for right side detection
    rect1.position.x + rect1.width >= rect2.position.x &&
    // for left side detection
    rect1.position.x <= rect2.position.x + rect2.width &&
    // for topside detection (upside)
    rect1.position.y <= rect2.position.y + rect2.height &&
    // for downside detection
    rect1.position.y + rect1.height >= rect2.position.y
  );
};

let insideRoom = false;
let jiraGameZone = false;
let videoGameZone = false;
let bitbucketGameZone = false;

let detailsDiv = document.querySelector("div#homeDiv");

let jiraX = 0;
let jiraY = 0;

// function to control the player's movements
function navigatePlayer(playerType, movingBool, boundaryType, movableType) {
  const playerSpeed = 5;
  if (keys.up.pressed && lastKey === "up") {
    playerType.image = playerType.sprites.up;
    playerType.animate = true;
    for (let i = 0; i < boundaryType.length; i++) {
      const boundary = boundaryType[i];
      if (
        collisionDetection({
          rect1: playerType,
          rect2: {
            ...boundary,
            position: {
              x: boundary.position.x,
              y: boundary.position.y + playerSpeed,
            },
          },
        })
      ) {
        movingBool = false;
        break;
      }
    }
    if (movingBool) {
      if (currentActiveGame == "jira") jiraY++;

      movableType.forEach((movable) => {
        movable.position.y += playerSpeed;
      });
    }
  } else if (keys.down.pressed && lastKey === "down") {
    playerType.image = playerType.sprites.down;
    playerType.animate = true;
    for (let i = 0; i < boundaryType.length; i++) {
      const boundary = boundaryType[i];
      if (
        collisionDetection({
          rect1: playerType,
          rect2: {
            ...boundary,
            position: {
              x: boundary.position.x,
              y: boundary.position.y - playerSpeed,
            },
          },
        })
      ) {
        movingBool = false;
        break;
      }
    }
    if (movingBool) {
      if (currentActiveGame == "jira") jiraY--;
      movableType.forEach((movable) => {
        movable.position.y -= playerSpeed;
      });
    }
  } else if (keys.left.pressed && lastKey === "left") {
    playerType.image = playerType.sprites.left;
    playerType.animate = true;
    for (let i = 0; i < boundaryType.length; i++) {
      const boundary = boundaryType[i];
      if (
        collisionDetection({
          rect1: playerType,
          rect2: {
            ...boundary,
            position: {
              x: boundary.position.x + playerSpeed,
              y: boundary.position.y,
            },
          },
        })
      ) {
        movingBool = false;
        break;
      }
    }
    if (movingBool) {
      if (currentActiveGame == "jira") jiraX++;
      movableType.forEach((movable) => {
        movable.position.x += playerSpeed;
      });
    }
  } else if (keys.right.pressed && lastKey === "right") {
    playerType.image = playerType.sprites.right;
    playerType.animate = true;
    for (let i = 0; i < boundaryType.length; i++) {
      const boundary = boundaryType[i];
      if (
        collisionDetection({
          rect1: playerType,
          rect2: {
            ...boundary,
            position: {
              x: boundary.position.x - playerSpeed,
              y: boundary.position.y,
            },
          },
        })
      ) {
        movingBool = false;
        break;
      }
    }
    if (movingBool) {
      if (currentActiveGame == "jira") jiraX--;
      movableType.forEach((movable) => {
        movable.position.x -= playerSpeed;
      });
    }
  }
}

// function to show detailed info about the house and keys to be pressed for further interactions
let houseName = "";
let showInfoString = "";
function showInfo() {
  if (
    background.position.x <= 110 &&
    background.position.x >= 25 &&
    background.position.y == -50
  ) {
    return {
      showInfoString:
        "<b>PERSONAL ROOM</b> <br>Press <b>Ctrl + Enter key</b> to get inside the room",
      houseName: "personalHouse",
      result: true,
    };
  } else if (
    background.position.x <= -646 &&
    background.position.x >= -694 &&
    background.position.y <= -96 &&
    background.position.y >= -123
  ) {
    return {
      showInfoString:
        "<b><u>Maze Runner Game Guidelines</u></b><br>" +
        "1. You have to find your way through the 6 varying mazes and<br> make it to the house of the animated-sprite player<br><br>" +
        "2. Each level is accompanied with a timer and if you can't<br> make it till the timer ends, then you will be shifted<br> back to the start of the current level<br><br>" +
        "3. To exit the game and reach back to the village,<br> you have to hit BACKSPACE<br><br>" +
        "4. Uptil the reload, all your data and achievements are stored.<br><br>" +
        "5. So, enjoy your stay. We bet you won't be bored",
      result: true,
    };
  } else if (
    background.position.x <= -736 &&
    background.position.x >= -784 &&
    background.position.y <= -3 &&
    background.position.y >= -21
  ) {
    return {
      showInfoString:
        "<b><u>Video game & home of player</u></b><br>" +
        "<span style='text-align:left'>1. <span>The animated-sprite player has worked very hard with us for the past <br>1 month,so now whenever he sees the bed, he clinches onto<br> the bed & don't leave it .<b></span><br><br>" +
        "<span style='text-align:left'>2. So, don't enter into the PERSONAL HOUSE of the player</b>. <br>That is a dead end and you won't be able to<br>come out of that</span><br><br>" +
        "<span style='text-align:left'>3. What we suggest is that, whenever you think of exiting the game, <br>visit the player's house and use the computer to view you stats. Viewing your <br>achievements before a nap is a great idea</span><br><br>" +
        "<span style='text-align:left'>4. This a game made possible by <b>pure vanilla JS, no frameworks<br>or third party libraries</b> have been used and we are proud of the <br>fact that we pulled it off it such a short span</span><br><br>" +
        "<span style='text-align:left'>5. The video game has 9 levels, it contains videos on 3 <b>different domains</b>,<br>watch a video & answer questions related to the video.</span>" +
        "<br><br><span style='text-align: left'>NOTE: The score will be calculated on the following matrix:<br><ul><li>+10 for pair of tiles made in the EASY level</li><li>+12 for pair of tiles made in HARD level</li><li>-3 for each wrong pair</li><li>+15 for clearing a maze</li><li>-5 for running out of time</li><li>+10 for answering a video correctly</li><li>-5 for wrong answer in video game</li><ul></span>",
      result: true,
    };
  } else if (
    background.position.x <= -826 &&
    background.position.x >= -886 &&
    background.position.y <= -93 &&
    background.position.y >= -120
  ) {
    return {
      showInfoString:
        "<b><u>Flip The Bucket Game Guidelines</u></b><br>" +
        "1. The most advance and unique game you would have ever played.<br>A set of total 5 levels that will keep you hooked<br><br>" +
        "2. The bucket-tiles contain different <b>words & phrases </b>related to <br>Theta, OS, DBMS, Algorithms<br><br>" +
        "3. A pair of <b>3 correctly matched tiled</b> will become a set and for an <b>EASY</b><br>level, you have to make 3 sets (9 tiles in total) & for a <b>DIFFICULT</b> one<br> you have to make 5 sets (15 tiles in total)<br><br>" +
        "4. According to your fetched stats, if you fall in the <b>Adverse category</b><br>then the difficulty from level 1 to 5 will be HARD for you, whereas for <br>the normal ones, the first 3 levels will be EASY ones<br><br>" +
        "5. Undoubtedly, this game can be a bit overwhelming at the first instance<br> and even we (as creators) got stuck sometimes. So, in order to aid you, <br>we have provided the option of <b>HINT</b><br><br>" +
        "6. Post clicking on the question mark icon, a correct tile will be shown. <b><br>Note: The hint will be active once per level. And in order<br> to use it, you first have to select a tile and accordingly the hint will <br>locate the another correct pair for that tile</b>",
      result: true,
    };
  } else if (
    background.position.x <= -1193 &&
    background.position.x >= -1285 &&
    background.position.y <= -195 &&
    background.position.y >= -228
  ) {
    return {
      showInfoString: "Press <b>j key</b> to play Maze Runner game",
      houseName: "jira",
      result: true,
    };
  } else if (
    background.position.x <= 221 &&
    background.position.x >= 167 &&
    background.position.y <= -531 &&
    background.position.y >= -558
  ) {
    return {
      showInfoString: "Press <b>b key</b> to play Flip the Bucket game",
      houseName: "bitbucket",
      result: true,
    };
  } else if (
    background.position.x <= -1450 &&
    background.position.x >= -1600 &&
    background.position.y <= -531 &&
    background.position.y >= -555
  ) {
    return {
      showInfoString: "Press <b>v key</b> to play Video Game",
      houseName: "thetaVideo",
      result: true,
    };
  } else return { result: false };
}

let animationId;
function animate() {
  //   console.log(`X: ${background.position.x} Y: ${background.position.y}`)
  animationId = window.requestAnimationFrame(animate);
  background.draw();
  villageBoundaries.forEach((villageBoundary) => {
    villageBoundary.draw();
  });

  player.draw();
  foreground.draw();

  let moving = true;
  player.animate = false;

  const travelToRoom = showInfo();

  insideRoom = false;
  jiraGameZone = false;
  bitbucketGameZone = false;

  if (travelToRoom.result) {
    detailsDiv.innerHTML = travelToRoom.showInfoString;
    switch (travelToRoom.houseName) {
      case "personalHouse":
        insideRoom = true;
        break;
      case "jira":
        jiraGameZone = true;
        break;
      case "bitbucket":
        bitbucketGameZone = true;
        break;
      case "thetaVideo":
        videoGameZone = true;
        break;
    }
  } else {
    detailsDiv.innerHTML = "";
  }

  // navigatePlayer function call
  navigatePlayer(player, moving, villageBoundaries, villageMovables);
}

function teleportToRoom() {
  cancelAnimationFrame(animationId);
  gsap.to("#overlappingDiv", {
    opacity: 1,
    repeat: 2,
    yolo: true,
    duration: 1,
    onComplete: () => {
      detailsDiv.style.display = "none";
      initiateRoom();
      gsap.to("#overlappingDiv", {
        opacity: 0,
      });
    },
  });
}

function initBitbucketGame() {
  // calling the function that will start the setup for bitbucketGame
  initializeLevel({ level: currentLevel });
  document.querySelector("body").style.background =
    "linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('./img/bgd.jpg')";
  document.querySelector("body").style.backgroundPosition = "center";
  document.querySelector("body").style.backgroundRepeat = "no-repeat";
  document.querySelector("body").style.backgroundSize = "cover";
  document.querySelector("body").style.height = "100vh";
  document.querySelector("body").style.overflow = "hidden";

  bitGameSong.play();

  playedBitbucketGame = true;
  currentActiveGame = "bitbucket";
  CANVAS.style.display = "none";
  detailsDiv.style.display = "none";
  atlassianBitbucketGame.style.display = "block";
}

const jiraLevelsArray = {
  1: {
    x: -1952,
    y: {
      first: -1635,
      second: -1659,
    },
    duration: 40,
  },
  2: {
    x: -2915,
    y: {
      first: -1155,
      second: -1179,
    },
    duration: 30,
  },
  3: {
    x: -3863,
    y: {
      first: -627,
      second: -651,
    },
    duration: 30,
  },
  4: {
    x: -4820,
    y: {
      first: -1155,
      second: -1179,
    },
    duration: 35,
  },
  5: {
    x: -5789,
    y: {
      first: -1683,
      second: -1707,
    },
    duration: 35,
  },
  6: {
    x: -6668,
    y: {
      first: -1683,
      second: -1707,
    },
    duration: 30,
  },
};

const jiraFirstLevelCoordinates = [-1400, -1200];

let mazeId;
let intervalName;
let currentJiraLevel = 0;
let passedAllJiraLevels = false;
let countdownTimer = jiraLevelsArray[currentJiraLevel + 1].duration;

function initJiraGame() {
  currentActiveGame = "jira";
  CANVAS.style.display = "none";
  gameCanvas.style.display = "none";

  if (passedAllJiraLevels) {
    document.querySelector("#clearedJiraLevels").style.display = "block";
  } else {
    intervalName = setInterval(changeTimer, 1000);
    jiraCanvas.style.display = "block";
    jiraStats.style.display = "block";
    atlassianJiraGame.style.display = "flex";
    initiateMaze();
  }
}

function backToVillage() {
  cancelAnimationFrame(roomId);
  gsap.to("#overlappingDiv", {
    opacity: 1,
    repeat: 2,
    yolo: true,
    duration: 1,
    onComplete: () => {
      animate();
      gsap.to("#overlappingDiv", {
        opacity: 0,
      });
    },
  });
}

let roomId;
let fetchStats = false;
function initiateRoom() {
  //console.log(`X: ${roomBackground.position.x} Y: ${roomBackground.position.y}`);
  detailsDiv.style.display = "none";
  roomId = requestAnimationFrame(initiateRoom);
  ctx.fillStyle = "white";

  ctx.fillRect(0, 0, width, height);
  roomBackground.draw();

  roomBoundaries.forEach((roomBoundary) => {
    roomBoundary.draw();
  });

  fetchStats =
    roomBackground.position.x >= -245 &&
    roomBackground.position.x <= -240 &&
    roomBackground.position.y === 105
      ? true
      : false;

  if (fetchStats) {
    populateModal("GAME SUMMARY", [
      `<span style="color: red">${personalHomeStats.easyBitPair}</span> easy tile pairs made`,
      `<span style="color: red">${personalHomeStats.wrongBitPair}</span> hard tile pairs made`,
      `<span style="color: red">${personalHomeStats.hardBitPair}</span> wrong pairs made`,
      `<span style="color: red">${currentJiraLevel}</span> level(s) completed in Maze runner game`,
      `<span style="color: red">${totalVideoLevels}</span> level(s) completed in thata video game`,
      `<span style="color: red">${personalHomeStats.runOutOfTime}</span> time(s) you ran out of time`,
    ]);
    toggleClasses.forEach((el) => {
      el.classList.remove("hidden");
    });
  }

  roomPlayer.draw();

  let moving = true;
  roomPlayer.animate = false;
  navigatePlayer(roomPlayer, moving, roomBoundaries, roomMovables);
}

function checkLevel(x, y) {
  if (
    currentJiraLevel <= 5 &&
    x <= jiraLevelsArray[currentJiraLevel + 1].x &&
    (y <= jiraLevelsArray[currentJiraLevel + 1].y.first ||
      y <= jiraLevelsArray[currentJiraLevel + 1].y.second)
  ) {
    document.querySelector("#levelJira").innerHTML = `Level:<br> <b>0${
      currentJiraLevel + 2
    }/06</b>`;
    currentJiraLevel++;

    if (currentJiraLevel <= 5) {
      incScore("15");
      document.querySelector("#overAllScore").innerHTML =
        parseInt(document.querySelector("#overAllScore").innerHTML) + 15;
      countdownTimer = jiraLevelsArray[currentJiraLevel + 1].duration;
    }

    clearInterval(intervalName);
    intervalName = setInterval(changeTimer, 1000);

    if (streak >= 3)
      payUser(
        0.05,
        `Maze Runner Game Level ${currentJiraLevel} completion reward`
      );
  } else if (
    currentJiraLevel == 6 &&
    x <= jiraLevelsArray[6].x &&
    (y <= jiraLevelsArray[6].y.first || y <= jiraLevelsArray[6].y.second)
  ) {
    document.querySelector("#levelJira").innerHTML = `DONE`;
    clearInterval(intervalName);
    passedAllJiraLevels = true;
    // countdownTimer = 60
  }
}

function initiateMaze() {
  checkLevel(mazeBackground.position.x, mazeBackground.position.y);
  //console.log(`X: ${mazeBackground.position.x} Y: ${mazeBackground.position.y}`);
  mazeId = requestAnimationFrame(initiateMaze);

  mazeBackground.draw();

  mazeBoundaries.forEach((mazeBoundary) => {
    mazeBoundary.draw();
  });

  mazePlayer.draw();

  let moving = true;
  mazePlayer.animate = false;
  navigatePlayer(mazePlayer, moving, mazeBoundaries, mazeMovables);
}

function changeTimer() {
  if (countdownTimer < 10) {
    document.querySelector("#timeJira").textContent = `0${countdownTimer}`;
  } else {
    document.querySelector("#timeJira").textContent = countdownTimer;
  }
  countdownTimer--;
  if (countdownTimer < 0) {
    personalHomeStats.runOutOfTime++;
    if (parseInt(document.querySelector("#overAllScore").innerHTML) - 5 >= 0) {
      incScore("-5");
      document.querySelector("#overAllScore").innerHTML =
        parseInt(document.querySelector("#overAllScore").innerHTML) - 5;
    } else {
      document.querySelector("#overAllScore").innerHTML = 0;
    }
    clearInterval(intervalName);
    alert(
      "Sorry, the time is over. Now, you have to start from this level again. Best of luck and buck up your shoes"
    );
    countdownTimer = 40;
    // GREAT EXECUTION (ALMOST UNBELIEVABLE TO ACHIEVE THIS)
    mazeMovables.forEach((movable) => {
      if (jiraY != 0) {
        movable.position.y = movable.position.y - 3 * jiraY;
      }
      if (jiraX != 0) {
        movable.position.x = movable.position.x - 3 * jiraX;
      }
    });
    jiraX = 0;
    jiraY = 0;
    intervalName = setInterval(changeTimer, 1000);
    currentJiraLevel = 1;
    document.querySelector("#levelJira").innerHTML = `Level:<br> <b>01/06</b>`;
  }
}

animate();

let lastKey = "";
window.addEventListener("keydown", (e) => {
  if (movePlayer) {
    switch (e.key) {
      case "ArrowUp":
        keys.up.pressed = true;
        lastKey = "up";
        break;
      case "ArrowDown":
        keys.down.pressed = true;
        lastKey = "down";
        break;
      case "ArrowLeft":
        keys.left.pressed = true;
        lastKey = "left";
        break;
      case "ArrowRight":
        keys.right.pressed = true;
        lastKey = "right";
        break;
      default:
        break;
    }
  }
});

window.addEventListener("keyup", (e) => {
  switch (e.key) {
    case "ArrowUp":
      keys.up.pressed = false;
      break;
    case "ArrowDown":
      keys.down.pressed = false;
      break;
    case "ArrowLeft":
      keys.left.pressed = false;
      break;
    case "ArrowRight":
      keys.right.pressed = false;
      break;
    default:
      break;
  }
});

// eventlistener for entering into the room
window.addEventListener("keydown", (e) => {
  if (insideRoom && e.key === "Enter") {
    if (e.ctrlKey) teleportToRoom();
  }
  if (jiraGameZone && (e.key === "j" || e.key === "J")) {
    // document.querySelector("#void").style.height = '0vh';
    // document.querySelector("#nft").style.display = "none"
    document.querySelector("#timeJira").style.display = "block";
    document.querySelector("#levelJira").style.display = "block";
    document.querySelector("#username").style.display = "none";

    cancelAnimationFrame(animationId);
    initJiraGame();
  }
  if (bitbucketGameZone && (e.key === "b" || e.key === "B")) {
    // document.querySelector("#void").style.height = '0vh';
    controlMainSong(mainSong, "stop");
    document.querySelector(".musicOptions").style.display = "none";
    document.querySelector("#username").style.display = "none";

    initBitbucketGame();
  }
  if (videoGameZone && (e.key === "v" || e.key === "V")) {
    movePlayer = false;
    controlMainSong(mainSong, "stop");
    document.querySelector("#score").textContent =
      document.querySelector("#overAllScore").textContent;
    document.querySelector("#thetaGame").style.display = "block";
    document.querySelector("#landing-section").style.display = "none";
    document.querySelector("#game").style.display = "none";

    document.querySelector("#username").style.display = "none";

    currentActiveGame = "thetaVideo";

    video.style.display = "none";
    videoQuestions.style.display = "none";
    startDiv.style.display = "flex";
  }
  if (
    e.key === "Backspace" &&
    document.querySelector("#levelsCompletedDiv").style.display == "none"
  ) {
    if (currentActiveGame === "thetaVideo") {
      const tags = ["technology", "environment", "history"];
      tags.forEach((el) => {
        document.querySelector(`#${el}`).style.display = "none";
      });
      clearInterval(qnaInterval);
      clearInterval(videoInterval);

      movePlayer = true;
      controlMainSong(mainSong, "play");
      document.querySelector("#game").style.display = "block";
      document.querySelector("#username").style.display = "block";
      document.querySelector("#thetaGame").style.display = "none";
      document.querySelector(".musicOptions").style.display = "block";
      if (document.querySelector("iframe")) {
        document.querySelector("iframe").remove();
      }
      correct.style.display = "none";
      wrong.style.display = "none";
      instructions.style.display = "block";

      proceedBtn.textContent = "Proceed";
    } else if (currentActiveGame === "bitbucket" && paying == false) {
      // document.querySelector("#void").style.height = '5vh';
      bitGameSong.stop();
      controlMainSong(mainSong, "play");
      bitbucketGameDiv.innerHTML = "";
      arrayForHints = [];
      correctOrderAnsArray = [];
      selectedTiles = [];
      currentlyFlipped = [];
      atlassianBitbucketGame.style.display = "none";
      totalLives = lives.childElementCount;

      document.querySelector("#username").style.display = "block";
      document.querySelector(".musicOptions").style.display = "block";

      document.querySelector("body").style = "";
    } else if (currentActiveGame === "jira") {
      if (!passedAllJiraLevels) {
        mazeMovables.forEach((movable) => {
          if (jiraY != 0) {
            movable.position.y = movable.position.y - 3 * jiraY;
          }
          if (jiraX != 0) {
            movable.position.x = movable.position.x - 3 * jiraX;
          }
        });
        jiraX = 0;
        jiraY = 0;

        // document.querySelector("#void").style.height = '5vh'
        document.querySelector("#username").style.display = "block";
        document.querySelector("#timeJira").style.display = "none";
        document.querySelector("#levelJira").style.display = "none";
        document.querySelector(".musicOptions").style.display = "block";

        // setting back the variables to the initial value
        countdownTimer = 40;
        clearInterval(intervalName);
        currentJiraLevel = 1;
        document.querySelector(
          "#levelJira"
        ).innerHTML = `Level:<br> <b>01/06</b>`;

        cancelAnimationFrame(mazeId);
        // document.querySelector("#selectMusic").style.display = "block";
        atlassianJiraGame.style.display = "none";
      } else {
        atlassianJiraGame.style.display = "flex";
      }

      gameCanvas.style.display = "block";
      jiraStats.style.display = "none";

      animate();
    }

    if (paying == false) {
      atlassianJiraGame.style.display = "none";
      jiraCanvas.style.display = "none";
      currentActiveGame = "";
      detailsDiv.style.display = "block";
      CANVAS.style.display = "block";
    }
  }
});
