const videoPoints = 0;
const qna = document.querySelector("#qna");
const video = document.querySelector("#video");
const startDiv = document.querySelector("#startDiv");
const videoQuestions = document.querySelector("#videoQuestions");
const videoPlayer = document.querySelector("#videoPlayer");
const instructions = document.querySelector("#instructions");
const proceedBtn = document.querySelector("#videoProceed button");

const wrong = document.querySelector("#wrong");
const correct = document.querySelector("#correct");

const qnaTimer = document.querySelector("#qnaTimer");
var videoTimer = document.querySelector("#videoTimer");

let videoLevels = document.querySelector("#videoLevels");

let qnaInterval;
let videoInterval;

let wrongAns = false;

const videoURLs = [
  "https://player.thetavideoapi.com/video/video_tek0h3m6canxjdzrtcnveiu86f",
  "https://player.thetavideoapi.com/video/video_01hg0gmue0aimbig40t3uks6qr",
  "https://player.thetavideoapi.com/video/video_ebsgqrq0inxwzx4prjus8ftx9j",
  "https://player.thetavideoapi.com/video/video_895stgizzscdkdr6hgh1deqwfe",
  "https://player.thetavideoapi.com/video/video_npis7qemf93xecfttansiad5yv",
  "https://player.thetavideoapi.com/video/video_0xs3me78wy8y55nhcz9r3rcfie",
  "https://player.thetavideoapi.com/video/video_8q5zm9a8a4szmpi3fhx56f9ksr",
  "https://player.thetavideoapi.com/video/video_09u1jykx0ypssc2k2x4su6k8ny",
  "https://player.thetavideoapi.com/video/video_z653k8jvqp69x9d2gbxsui8f2k",
];

// tracks: environment, technology, history (3 of each)
const videoTracker = {
  0: {
    type: "environment",
    used: false,
    videoQuestions: {
      0: {
        q: "Which layer carries electrical charges?",
        o: ["Atmosphere", "Thermosphere", "Stratosphere", "Exosphere"],
        ans: "Thermosphere",
      },
      1: {
        q: "What is the range of Troposphere?",
        o: ["50-75 miles", "30-35 miles", "4-10 miles", "above 400 miles"],
        ans: "4-10 miles",
      },
      2: {
        q: "Why aeroplanes fly in the Stratosphere?",
        o: [
          "No weather disturbances",
          "Ions presence",
          "Low temperature",
          "High lift",
        ],
        ans: "No weather disturbances",
      },
      3: {
        q: "Layer which blocks out UV rays",
        o: ["Thermosphere", "Stratosphere", "Troposphere", "Exosphere"],
        ans: "Stratosphere",
      },
    },
  },
  1: {
    type: "environment",
    used: false,
    videoQuestions: {
      0: {
        q: "In a single gram of soil, how many micro-organisms can be found?",
        o: ["5k", "150k", "10k", "50k"],
        ans: "50k",
      },
      1: {
        q: "Which was fascinated by the importance of earthworms?",
        o: ["Aristotle", "Linnaeus", "Mendel", "Darwin"],
        ans: "Darwin",
      },
      2: {
        q: "How much soil is made in 100 years?",
        o: ["15mm", "5mm", "100mm", "7.5mm"],
        ans: "5mm",
      },
      3: {
        q: "Oldest found soil is present in?",
        o: ["India", "Australia", "South Africa", "UK"],
        ans: "South Africa",
      },
    },
  },
  2: {
    type: "environment",
    used: false,
    videoQuestions: {
      0: {
        q: "Where do they breed?",
        o: ["Arctic", "Swamps", "Marshs", "Tropics"],
        ans: "Tropics",
      },
      1: {
        q: "Which species of whales were referred in the video?",
        o: ["Humpback", "Orca", "Blue", "Fin"],
        ans: "Humpback",
      },
      2: {
        q: "In which year, commercial whaling was banned?",
        o: ["1903", "1804", "1972", "1986"],
        ans: "1986",
      },
      3: {
        q: "Which location was picturized in the video?",
        o: ["South Africa", "Asia", "Antartica", "Australia"],
        ans: "South Africa",
      },
    },
  },
  3: {
    type: "technology",
    used: false,
    videoQuestions: {
      0: {
        q: "Neural network works upon?",
        o: ["Classes", "Feature Detection", "Labels", "Error Detection"],
        ans: "Feature Detection",
      },
      1: {
        q: "AI softwares are possible due to?",
        o: ["Cathode Rays", "CPUs", "Transistors", "GPUs"],
        ans: "GPUs",
      },
      2: {
        q: "A human face can have how many facial features?",
        o: ["14", "10", "15", "17"],
        ans: "15",
      },
      3: {
        q: "What can be regarded as the university for AI softwares?",
        o: ["Artificial neurons", "Dark web", "Segmented data", "Big data"],
        ans: "Big data",
      },
    },
  },
  4: {
    type: "technology",
    used: false,
    videoQuestions: {
      0: {
        q: "Which is not an OS?",
        o: ["macOS", "iOS", "LibOS", "Windows"],
        ans: "LibOS",
      },
      1: {
        q: "Google offers OS for what kind of devices?",
        o: ["Kiosk", "Mac", "Tablets", "Android"],
        ans: "Android",
      },
      2: {
        q: "OS is an intermediary between",
        o: [
          "User & computer",
          "Monitor & computer",
          "User & monitor",
          "CPU & printer",
        ],
        ans: "User & computer",
      },
      3: {
        q: "Which is an OS offered by Apple?",
        o: ["MacOS", "Windows", "Linux", "Unix"],
        ans: "MacOS",
      },
    },
  },
  5: {
    type: "technology",
    used: false,
    videoQuestions: {
      0: {
        q: "What is used in real life for encryption?",
        o: ["Addition", "Division", "Modulus", "Multiplication"],
        ans: "Modulus",
      },
      1: {
        q: "What is encryption?",
        o: [
          "Conversion to numerical value",
          "Scrambling a plain text",
          "Debugging",
          "Project testing",
        ],
        ans: "Scrambling a plain text",
      },
      2: {
        q: "Key used by both parties to encrypt message",
        o: ["Public", "Private", "Foreign", "Candidate"],
        ans: "Public",
      },
      3: {
        q: "Terms related to cryptography",
        o: [
          "Machine Learning",
          "Web",
          "Hash & salt",
          "Artificial Intelligence",
        ],
        ans: "Hash & salt",
      },
    },
  },
  6: {
    type: "history",
    used: false,
    videoQuestions: {
      0: {
        q: "At the age of 22, Picasso moved to?",
        o: ["London", "New York", "Paris", "Budapest"],
        ans: "Paris",
      },
      1: {
        q: "Which item ignited spark in Picasso?",
        o: ["Cigar puff", "Graffiti", "Sparkling sun", "Music"],
        ans: "Cigar puff",
      },
      2: {
        q: "What was Picasso's radical art form known as?",
        o: ["Op art", "Suprematism", "Expressionism", "Cubism"],
        ans: "Cubism",
      },
      3: {
        q: "According to him, a picture is a sum of?",
        o: ["Contsruction", "Art & craft", "Destructions", "Additions"],
        ans: "Destructions",
      },
    },
  },
  7: {
    type: "history",
    used: false,
    videoQuestions: {
      0: {
        q: "Who coined the termed Industrial Revolution?",
        o: ["James Watt", "Arnold Toynbee", "Robert Owen", "George Stephenson"],
        ans: "Arnold Toynbee",
      },
      1: {
        q: "What was the integral part of this revolution?",
        o: ["Cotton", "Iron & coal", "Steam engine", "Power loom"],
        ans: "Steam engine",
      },
      2: {
        q: "What helped Industrial revolution to flourish?",
        o: [
          "Blue Revolution",
          "White Revolution",
          "Green Revolution",
          "Agricultural Revolution",
        ],
        ans: "Agricultural Revolution",
      },
      3: {
        q: "From where this revolution started?",
        o: ["UK", "Europe", "USA", "Asia"],
        ans: "UK",
      },
    },
  },
  8: {
    type: "history",
    used: false,
    videoQuestions: {
      0: {
        q: "Who was fighting against Axis powers?",
        o: ["Japan", "Poland", "USA", "Italy"],
        ans: "USA",
      },
      1: {
        q: "When was atomic bomb dropped?",
        o: ["6 Sept 1955", "6 Aug 1945", "16 Jan 1947", "31 Jan 1943"],
        ans: "6 Aug 1945",
      },
      2: {
        q: "Which one is not a part of Axis powers?",
        o: ["Japan", "USSR", "Germany", "Italy"],
        ans: "USSR",
      },
      3: {
        q: "What was the timeline of the war?",
        o: ["1930-40", "1939-46", "1938-47", "1939-45"],
        ans: "1939-45",
      },
    },
  },
};

const videoTime = [155, 280, 205, 120, 95, 135, 130, 235, 205];

let randomNum;

const qnaCountdown = () => {
  qnaTimer.textContent--;
  if (qnaTimer.textContent == 0) {
    clearInterval(qnaInterval);
    video.style.display = "none";
    videoQuestions.style.display = "none";

    startDiv.style.display = "flex";
    instructions.style.display = "none";

    // if the user has provided the correct answers
    if (
      document.querySelector("#q1Ans").value !== "select" &&
      document.querySelector("#q2Ans").value !== "select" &&
      document.querySelector("#q3Ans").value !== "select" &&
      document.querySelector("#q4Ans").value !== "select" &&
      document.querySelector("#q1Ans").value ===
        videoTracker[randomNum].videoQuestions[0].ans &&
      document.querySelector("#q2Ans").value ===
        videoTracker[randomNum].videoQuestions[1].ans &&
      document.querySelector("#q3Ans").value ===
        videoTracker[randomNum].videoQuestions[2].ans &&
      document.querySelector("#q4Ans").value ===
        videoTracker[randomNum].videoQuestions[3].ans
    ) {
      totalVideoLevels++;
      incScore("10");
      document.querySelector("#overAllScore").innerHTML =
        parseInt(document.querySelector("#overAllScore").innerHTML) + 10;
      document.querySelector("#score").textContent =
        document.querySelector("#overAllScore").textContent;
      if (Number(videoLevels.textContent < 9)) {
        videoLevels.textContent = Number(videoLevels.textContent) + 1;
      }

      proceedBtn.disabled = true;
      claps.play();
      proceedBtn.disabled = false;
      wrongAns = false;
      correct.style.display = "block";
      wrong.style.display = "none";
      videoTracker[randomNum].used = true;
      proceedBtn.textContent = "Next question";
    } else {
      if (
        parseInt(document.querySelector("#overAllScore").innerHTML) - 5 >=
        0
      ) {
        incScore("-5");
        document.querySelector("#overAllScore").innerHTML =
          parseInt(document.querySelector("#overAllScore").innerHTML) - 5;
      } else {
        document.querySelector("#overAllScore").innerHTML = 0;
      }
      document.querySelector("#score").textContent =
        document.querySelector("#overAllScore").textContent;
      wrongAns = true;
      wrong.style.display = "block";
      correct.style.display = "none";
      videoTracker[randomNum].used = false;
      proceedBtn.textContent = "Retry";
    }

    // resetting the UI assets
    qna.style.display = "none";
    qnaTimer.style.display = "none";
    videoTimer.style.display = "block";

    // emptying the question fields
    for (let a = 1; a < 5; a++) {
      document.querySelector(`#q${a}`).remove();
      document.querySelector(`#q${a}Ans`).remove();
    }

    const tags = ["technology", "environment", "history"];
    tags.forEach((el) => {
      document.querySelector(`#${el}`).style.display = "none";
    });

    video.style.background = "rgba(0,0,0,0)";
    videoQuestions.style.background = "white";

    currentActiveGame = "thetaVideo";
  }
};

const switchQuestionsAns = () => {
  qnaTimer.style.display = "block";
  videoTimer.style.display = "none";
  qna.style.display = "block";

  videoQuestions.style.background = "rgba(0,0,0,0)";
  video.style.background = "white";

  for (let a = 0; a < 4; a++) {
    const para = document.createElement("p");
    para.setAttribute("id", `q${a + 1}`);
    para.textContent = `${a + 1}. ${
      videoTracker[randomNum].videoQuestions[a].q
    }`;
    qna.appendChild(para);

    const select = document.createElement("select");
    select.setAttribute("id", `q${a + 1}Ans`);

    var option = document.createElement("option");
    option.setAttribute("value", "select");
    option.textContent = "Select";
    select.appendChild(option);

    for (let op = 0; op < 4; op++) {
      var option = document.createElement("option");
      option.setAttribute(
        "value",
        videoTracker[randomNum].videoQuestions[a].o[op]
      );
      option.textContent = videoTracker[randomNum].videoQuestions[a].o[op];
      select.appendChild(option);
    }
    qna.appendChild(select);
  }
  currentActiveGame = "";
  qnaTimer.textContent = 30;
  qnaInterval = window.setInterval(qnaCountdown, 1000);
};

const videoCountdown = () => {
  videoTimer.textContent--;
  if (videoTimer.textContent == 0) {
    clearInterval(videoInterval);
    document.querySelector("iframe").remove();
    switchQuestionsAns();
  }
};

const populateUI = () => {
  startDiv.style.display = "none";
  videoQuestions.style.display = "flex";
  video.style.display = "flex";

  videoTimer.textContent = videoTime[randomNum];
  videoInterval = window.setInterval(videoCountdown, 1000);

  const tags = ["technology", "environment", "history"];
  tags.forEach((el) => {
    if (videoTracker[randomNum].type === el) {
      document.querySelector(`#${el}`).style.display = "block";
    }
  });
};

const appendIframe = (src) => {
  let iframe = document.createElement("iframe");
  iframe.width = "400";
  iframe.height = "250";
  iframe.src = src;
  iframe.onload = populateUI;

  videoPlayer.appendChild(iframe);
};

document.querySelector("#videoProceed").addEventListener("click", (e) => {
  const proceedBtn = e.target; // Use e.target to reference the clicked button

  // Disable the button after it's clicked
  proceedBtn.disabled = true;

  // generates a no between 0 and 8
  randomNum = Math.floor(Math.random() * 9);

  var itr = 0;
  for (let el in videoTracker) {
    if (videoTracker[el].used) itr++;
  }

  if (itr < 9) {
    if (
      !wrongAns &&
      (proceedBtn.textContent == "Proceed" ||
        proceedBtn.textContent == "Retry" ||
        proceedBtn.textContent == "Next question")
    ) {
      // Perform your logic here
    }

    while (videoTracker[randomNum].used) {
      randomNum = Math.floor(Math.random() * 9);
    }

    video.style.background = "rgba(0,0,0,0)";
    videoQuestions.style.background = "white";

    appendIframe(videoURLs[randomNum]);

    // Re-enable the button after the action is complete (e.g., after 1 second)
    setTimeout(() => {
      proceedBtn.disabled = false;
    }, 1000);
  } else {
    document.querySelector("#completedAllLevels").style.display = "block";
    instructions.style.display = "none";
    startDiv.style.display = "flex";
    proceedBtn.textContent = "Back to village";

    proceedBtn.addEventListener("click", () => {
      location.href = "/";
    });

    correct.style.display = "none";
    wrong.style.display = "none";

    videoQuestions.style.display = "none";
    video.style.display = "none";
  }
});
