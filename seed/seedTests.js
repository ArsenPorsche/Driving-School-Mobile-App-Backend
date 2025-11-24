const mongoose = require("mongoose");
const Test = require("../models/Test");
require("dotenv").config();

const seedTests = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    await Test.deleteMany({});

    const tests = [
      {
        topic: "Road Signs",
        title: "Road Signs",
        description: "Questions about road signs and their meanings",
        active: true,
        questions: [
          {
            question: "What does the 'STOP' sign mean?",
            answers: ["No stopping allowed", "Mandatory stop", "Stopping prohibited", "Parking allowed"],
            correctAnswer: 1,
          },
          {
            question: "Which sign warns about a pedestrian crossing?",
            answers: ["White triangle with red border", "Blue square", "Yellow diamond", "Red circle"],
            correctAnswer: 0,
          },
          {
            question: "What does a sign with a red circle and white horizontal bar mean?",
            answers: ["No entry", "No traffic", "No parking", "No stopping"],
            correctAnswer: 0,
          },
          {
            question: "Which sign indicates a main road?",
            answers: ["White square in yellow diamond", "Red triangle", "Blue circle", "Yellow triangle"],
            correctAnswer: 0,
          },
          {
            question: "What does a blue round sign with white arrow pointing right mean?",
            answers: ["Right turn recommended", "Mandatory turn right", "Right turn prohibited", "Parking on right"],
            correctAnswer: 1,
          },
          {
            question: "Which sign warns about uneven road?",
            answers: ["White triangle with red border", "Yellow diamond", "Blue square", "Red circle"],
            correctAnswer: 0,
          },
          {
            question: "What does the 'Speed Limit 50' sign mean?",
            answers: ["Recommended speed", "Maximum allowed speed", "Minimum speed", "Average speed"],
            correctAnswer: 1,
          },
          {
            question: "Which sign indicates a highway?",
            answers: ["Blue with white road image", "Red with white bar", "Yellow diamond", "White triangle"],
            correctAnswer: 0,
          },
          {
            question: "What does a sign with a red cross mean?",
            answers: ["Hospital nearby", "Intersection", "Railway crossing without barrier", "Emergency stop"],
            correctAnswer: 2,
          },
          {
            question: "Which sign prohibits overtaking?",
            answers: ["Red circle with two cars", "Blue circle", "Yellow triangle", "White square"],
            correctAnswer: 0,
          },
          {
            question: "What does the 'Children' sign mean?",
            answers: ["School nearby", "Warning about possible children appearance", "Playground", "Kindergarten"],
            correctAnswer: 1,
          },
          {
            question: "Which sign indicates one-way traffic?",
            answers: ["Blue rectangle with white arrow", "Red circle", "Yellow diamond", "White triangle"],
            correctAnswer: 0,
          },
          {
            question: "What does a sign with a bicycle image mean?",
            answers: ["Bicycle lane", "Bicycles prohibited", "Bicycle rental", "Bicycle parking"],
            correctAnswer: 0,
          },
          {
            question: "Which sign warns about a tunnel?",
            answers: ["White triangle with tunnel image", "Blue square", "Red circle", "Yellow diamond"],
            correctAnswer: 0,
          },
          {
            question: "What does the 'No Turn' sign mean?",
            answers: ["No left or right turn", "No U-turn", "No straight ahead", "No overtaking"],
            correctAnswer: 0,
          },
          {
            question: "Which sign indicates parking?",
            answers: ["Blue square with white letter P", "Red circle", "Yellow diamond", "White triangle"],
            correctAnswer: 0,
          },
          {
            question: "What does a sign with a deer image mean?",
            answers: ["Zoo nearby", "Warning about wild animals", "Hunting grounds", "Nature reserve"],
            correctAnswer: 1,
          },
          {
            question: "Which sign prohibits parking?",
            answers: ["Blue circle with red cross", "Red circle", "Yellow triangle", "White square"],
            correctAnswer: 0,
          },
          {
            question: "What does the 'Roundabout' sign mean?",
            answers: ["Traffic in circle following arrows", "Circle traffic prohibited", "Recommended route", "Detour road"],
            correctAnswer: 0,
          },
          {
            question: "Which sign warns about slippery road?",
            answers: ["White triangle with car and curves", "Blue square", "Red circle", "Yellow diamond"],
            correctAnswer: 0,
          },
        ],
      },
      {
        topic: "Intersections",
        title: "Intersections and Crossing Rules",
        description: "Rules for crossing different types of intersections",
        active: true,
        questions: [
          {
            question: "Who has priority at an uncontrolled intersection of equal roads?",
            answers: ["Traffic from the right", "Traffic from the left", "Whoever arrived first", "Larger vehicle"],
            correctAnswer: 0,
          },
          {
            question: "What to do at a controlled intersection with yellow traffic light?",
            answers: ["Speed up", "Stop", "Continue carefully", "Signal"],
            correctAnswer: 1,
          },
          {
            question: "Who has priority when turning left at green light?",
            answers: ["Oncoming traffic going straight", "Traffic on left", "Traffic on right", "Pedestrians"],
            correctAnswer: 0,
          },
          {
            question: "How to identify the main road at an intersection?",
            answers: ["By 'Main Road' sign", "By road width", "By traffic intensity", "By road surface condition"],
            correctAnswer: 0,
          },
          {
            question: "What does a flashing yellow traffic light mean?",
            answers: ["Speed up", "Uncontrolled intersection", "Stop", "Drive carefully"],
            correctAnswer: 1,
          },
          {
            question: "Who has priority at a roundabout?",
            answers: ["Traffic in the circle", "Traffic entering", "Larger vehicle", "Whoever signaled"],
            correctAnswer: 0,
          },
          {
            question: "Can you enter an intersection during a traffic jam?",
            answers: ["Yes, always", "No, if it blocks cross traffic", "Yes, but slowly", "Only at green light"],
            correctAnswer: 1,
          },
          {
            question: "Who has priority during simultaneous lane change?",
            answers: ["Traffic on the right", "Traffic on the left", "Larger vehicle", "Whoever started first"],
            correctAnswer: 0,
          },
          {
            question: "What to do at a T-intersection approaching on the joining road?",
            answers: ["Always yield", "Has priority", "Check signs", "Sound horn"],
            correctAnswer: 2,
          },
          {
            question: "Must you yield to pedestrians when turning?",
            answers: ["Yes, always", "No, they must wait", "Only at green light for them", "Only at controlled crossings"],
            correctAnswer: 0,
          },
          {
            question: "What does an additional traffic light arrow section mean?",
            answers: ["Movement allowed in arrow direction", "Movement prohibited", "Signal change warning", "Recommended direction"],
            correctAnswer: 0,
          },
          {
            question: "Who has priority at uncontrolled intersection of unequal roads?",
            answers: ["Traffic on main road", "Traffic on secondary road", "Larger vehicle", "Whoever arrived first"],
            correctAnswer: 0,
          },
          {
            question: "Can you make a U-turn at an intersection?",
            answers: ["Yes, if not prohibited by signs", "No, never", "Only at large intersections", "Only from right lane"],
            correctAnswer: 0,
          },
          {
            question: "What to do when approaching intersection from four sides simultaneously?",
            answers: ["Follow right-hand rule", "Larger vehicle goes", "Whoever signaled", "Random order"],
            correctAnswer: 0,
          },
          {
            question: "What to do at red traffic light?",
            answers: ["Speed up", "Stop before stop line", "Continue carefully", "Signal"],
            correctAnswer: 1,
          },
          {
            question: "Does a tram have priority at intersections?",
            answers: ["Yes, in most situations", "No, general rules", "Only at controlled intersections", "Only when going straight"],
            correctAnswer: 0,
          },
          {
            question: "What does red light with green arrow mean?",
            answers: ["Movement allowed in arrow direction with yield", "Movement prohibited", "Movement allowed without restrictions", "Straight only"],
            correctAnswer: 0,
          },
          {
            question: "How to turn left from one-way road?",
            answers: ["From left lane", "From any lane", "From right lane", "Only with sign"],
            correctAnswer: 0,
          },
          {
            question: "Can you reverse at an intersection?",
            answers: ["No, it's prohibited", "Yes, in traffic jam", "Yes, if no sign", "Only at uncontrolled"],
            correctAnswer: 0,
          },
          {
            question: "Who has right to cross intersection first at green light?",
            answers: ["Traffic completing crossing", "Whoever arrived first", "Larger vehicle", "Whoever signaled"],
            correctAnswer: 0,
          },
        ],
      },
      {
        topic: "Traffic Rules",
        title: "General Traffic Rules",
        description: "Basic rules of road behavior",
        active: true,
        questions: [
          {
            question: "What is the maximum speed limit in urban areas?",
            answers: ["50 km/h", "60 km/h", "70 km/h", "80 km/h"],
            correctAnswer: 1,
          },
          {
            question: "From what age can you drive a motorcycle?",
            answers: ["16 years", "18 years", "21 years", "25 years"],
            correctAnswer: 0,
          },
          {
            question: "Is using seat belts mandatory?",
            answers: ["Yes, always", "Only on highway", "Only for driver", "Only at speeds over 60 km/h"],
            correctAnswer: 0,
          },
          {
            question: "What is minimum distance to car ahead when stopping?",
            answers: ["To see its rear wheels", "1 meter", "2 meters", "No limit"],
            correctAnswer: 0,
          },
          {
            question: "Can you talk on phone while driving?",
            answers: ["No, without hands-free system", "Yes, always", "Only short calls", "Only at low speed"],
            correctAnswer: 0,
          },
          {
            question: "Where is stopping allowed on the road?",
            answers: ["Right side of shoulder", "Center of road", "Left side", "Anywhere"],
            correctAnswer: 0,
          },
          {
            question: "What is the allowed alcohol limit for drivers?",
            answers: ["0 permille", "0.2 permille", "0.5 permille", "1 permille"],
            correctAnswer: 0,
          },
          {
            question: "Can you transport children in front seat?",
            answers: ["Yes, in special car seat", "No, never", "Only after 12 years", "Only with adults"],
            correctAnswer: 0,
          },
          {
            question: "What to do in case of accident?",
            answers: ["Stop, turn on hazards, call police", "Leave quickly", "Continue driving", "Sound horn"],
            correctAnswer: 0,
          },
          {
            question: "What speed is allowed on highway?",
            answers: ["130 km/h", "110 km/h", "90 km/h", "No limit"],
            correctAnswer: 0,
          },
          {
            question: "Can you drive without a license?",
            answers: ["No, it's administrative offense", "Yes, if forgotten", "Yes, in own city", "Yes, for short distances"],
            correctAnswer: 0,
          },
          {
            question: "What does double solid line marking mean?",
            answers: ["Crossing prohibited", "Can cross for overtaking", "Recommended lane boundary", "Intersection warning"],
            correctAnswer: 0,
          },
          {
            question: "Must you yield to pedestrians at crossing?",
            answers: ["Yes, always", "No, they must wait", "Only at traffic light", "Only at controlled crossings"],
            correctAnswer: 0,
          },
          {
            question: "What distance to maintain behind truck ahead?",
            answers: ["Safe distance to brake in time", "10 meters", "20 meters", "No limit"],
            correctAnswer: 0,
          },
          {
            question: "Can you use fog lights during day?",
            answers: ["Yes, instead of low beams", "No, only in fog", "Only in winter", "Only on highway"],
            correctAnswer: 0,
          },
          {
            question: "What to do with flat tire on highway?",
            answers: ["Turn on hazards, move to shoulder, place warning sign", "Continue driving", "Stop in middle of road", "Sound horn"],
            correctAnswer: 0,
          },
          {
            question: "Can you overtake at pedestrian crossing?",
            answers: ["No, it's prohibited", "Yes, if no pedestrians", "Yes, with good visibility", "Only with traffic light"],
            correctAnswer: 0,
          },
          {
            question: "What information to provide when documenting accident?",
            answers: ["Driver's license and insurance data", "Only phone number", "Only address", "Nothing needed"],
            correctAnswer: 0,
          },
          {
            question: "Can you tow a car at night?",
            answers: ["Yes, with lights on", "No, it's prohibited", "Only short distances", "Only on highways"],
            correctAnswer: 0,
          },
          {
            question: "What does traffic officer's raised hand gesture mean?",
            answers: ["Attention, signal changing", "Movement allowed", "Movement prohibited", "Turn left"],
            correctAnswer: 0,
          },
        ],
      },
      {
        topic: "Overtaking and Turns",
        title: "Overtaking and Turning Rules",
        description: "Techniques and rules for safe overtaking and turns",
        active: true,
        questions: [
          {
            question: "Where is overtaking prohibited?",
            answers: ["At intersections, bridges, crossings, curves with limited visibility", "Only on bridges", "Only at crossings", "Nowhere"],
            correctAnswer: 0,
          },
          {
            question: "From which lane should you turn right?",
            answers: ["From rightmost lane", "From any lane", "From center lane", "From left lane"],
            correctAnswer: 0,
          },
          {
            question: "Can you overtake a car on the right?",
            answers: ["No, only on left", "Yes, always", "Yes, in urban areas", "Yes, on multi-lane roads in slow traffic"],
            correctAnswer: 3,
          },
          {
            question: "What does left turn signal on car ahead mean?",
            answers: ["It's about to turn or overtake", "Forgot to turn off", "Asking to pass", "Warning about obstacle"],
            correctAnswer: 0,
          },
          {
            question: "Is signaling before maneuver mandatory?",
            answers: ["Yes, always", "Only in urban areas", "Only on highway", "No, optional"],
            correctAnswer: 0,
          },
          {
            question: "How to make U-turn on road with tram tracks?",
            answers: ["From tram tracks in same direction if signs don't prohibit", "Only outside tracks", "From anywhere", "U-turn prohibited"],
            correctAnswer: 0,
          },
          {
            question: "Can you overtake before uncontrolled crossing?",
            answers: ["No, it's prohibited", "Yes, if no pedestrians", "Yes, with good visibility", "Only during day"],
            correctAnswer: 0,
          },
          {
            question: "How far in advance to turn on signal?",
            answers: ["Early enough to warn others", "Right before maneuver", "100 meters before", "50 meters before"],
            correctAnswer: 0,
          },
          {
            question: "What to do if oncoming car appears during overtaking?",
            answers: ["Return to your lane immediately", "Speed up", "Sound horn", "Continue overtaking"],
            correctAnswer: 0,
          },
          {
            question: "Can you overtake on uphill with limited visibility?",
            answers: ["No, it's dangerous and prohibited", "Yes, if no solid line", "Yes, in good weather", "Yes, if fast car"],
            correctAnswer: 0,
          },
          {
            question: "How to properly turn left from one-way road?",
            answers: ["Change to left lane, yield to oncoming traffic, turn", "Turn from any lane", "Stop before turn", "Sound horn"],
            correctAnswer: 0,
          },
          {
            question: "Can you overtake vehicle with hazard lights on?",
            answers: ["Yes, but carefully", "No, it's prohibited", "Only with good visibility", "Only during day"],
            correctAnswer: 0,
          },
          {
            question: "What to do after completing overtaking?",
            answers: ["Turn on right signal and return to your lane", "Continue in left lane", "Stop", "Speed up"],
            correctAnswer: 0,
          },
          {
            question: "Can you overtake a convoy of vehicles?",
            answers: ["Yes, if ensured safety", "No, always prohibited", "Only during day", "Only on highway"],
            correctAnswer: 0,
          },
          {
            question: "When can't you start overtaking?",
            answers: ["If car ahead is overtaking or car behind started overtaking", "Never", "Only at night", "Only in fog"],
            correctAnswer: 0,
          },
          {
            question: "Must you yield when completing overtaking?",
            answers: ["Yes, if can't complete maneuver safely", "No, others must yield", "Only to trucks", "Only in city"],
            correctAnswer: 0,
          },
          {
            question: "How to make U-turn on narrow road?",
            answers: ["Using adjacent territory or reverse", "Across solid line", "Through sidewalk", "It's prohibited"],
            correctAnswer: 0,
          },
          {
            question: "Can you overtake at railway crossing?",
            answers: ["No, strictly prohibited", "Yes, if no train", "Yes, if no barrier", "Only bicycles"],
            correctAnswer: 0,
          },
          {
            question: "What to do if obstacle discovered after turn?",
            answers: ["Stop or bypass safely", "Sound horn", "Reverse", "Speed up"],
            correctAnswer: 0,
          },
          {
            question: "Is turn signal needed when changing to adjacent lane?",
            answers: ["Yes, always", "No, on multi-lane roads", "Only on highway", "Only in city"],
            correctAnswer: 0,
          },
        ],
      },
      {
        topic: "Parking",
        title: "Parking and Stopping Rules",
        description: "Rules and allowed parking locations",
        active: true,
        questions: [
          {
            question: "Where is stopping prohibited?",
            answers: ["At crossings, within 5m of crossing, on bridges", "Only at crossings", "Only on bridges", "Nowhere"],
            correctAnswer: 0,
          },
          {
            question: "How to park parallel to curb?",
            answers: ["Approach parallel, reverse, align", "At angle", "Perpendicular", "Doesn't matter"],
            correctAnswer: 0,
          },
          {
            question: "Can you park on sidewalk?",
            answers: ["Only if permitted by sign", "Yes, always", "No, never", "Only half on sidewalk"],
            correctAnswer: 0,
          },
          {
            question: "What is maximum stop duration for passenger boarding/alighting?",
            answers: ["Time needed for these actions", "5 minutes", "10 minutes", "No limit"],
            correctAnswer: 0,
          },
          {
            question: "Can you leave car with engine running?",
            answers: ["No, must turn off engine when leaving", "Yes, in winter", "Yes, if briefly", "Yes, always"],
            correctAnswer: 0,
          },
          {
            question: "At what distance from crossing can you park?",
            answers: ["Not closer than 10m before and 5m after", "Right next to it", "Not closer than 5m", "Not closer than 20m"],
            correctAnswer: 0,
          },
          {
            question: "Can you park near fire hydrant?",
            answers: ["No, it's prohibited", "Yes, if no fire", "Yes, briefly", "Yes, always"],
            correctAnswer: 0,
          },
          {
            question: "How to park on slope?",
            answers: ["Turn wheels to curb and engage handbrake", "Leave as is", "Only handbrake", "Only in gear"],
            correctAnswer: 0,
          },
          {
            question: "Can you park opposite driveway entrance?",
            answers: ["No, it creates obstruction", "Yes, if briefly", "Yes, always", "Only at night"],
            correctAnswer: 0,
          },
          {
            question: "What does parking sign with disabled symbol mean?",
            answers: ["Space only for disabled", "Recommended space for disabled", "Disabled nearby", "Disabled center"],
            correctAnswer: 0,
          },
          {
            question: "Can you park on lawn?",
            answers: ["No, it's prohibited and fined", "Yes, if no sign", "Yes, in parks", "Yes, in winter"],
            correctAnswer: 0,
          },
          {
            question: "Where can you park at night in urban area?",
            answers: ["At special lots or right shoulder", "Anywhere", "Only on sidewalk", "Only near building"],
            correctAnswer: 0,
          },
          {
            question: "Must you turn on hazards during forced stop?",
            answers: ["Yes, and place warning triangle", "No, triangle enough", "No, hazards enough", "No, nothing needed"],
            correctAnswer: 0,
          },
          {
            question: "What distance for warning triangle in urban area?",
            answers: ["At least 20 meters", "At least 10 meters", "At least 30 meters", "Any distance"],
            correctAnswer: 0,
          },
          {
            question: "Can you park at public transport stop?",
            answers: ["No, it's prohibited", "Yes, when no bus", "Yes, briefly", "Only cars"],
            correctAnswer: 0,
          },
          {
            question: "What to do when parking near store on busy street?",
            answers: ["Find allowed spot even if farther", "Park at entrance", "On sidewalk", "With hazards anywhere"],
            correctAnswer: 0,
          },
          {
            question: "Can you leave children in car unattended?",
            answers: ["No, it's dangerous and prohibited", "Yes, briefly", "Yes, if doors locked", "Yes, if over 7 years"],
            correctAnswer: 0,
          },
          {
            question: "What to do before leaving vehicle?",
            answers: ["Turn off engine, engage handbrake, take keys, lock", "Only lock", "Only turn off engine", "Only handbrake"],
            correctAnswer: 0,
          },
          {
            question: "Can you park on roadway at night without lights?",
            answers: ["No, it's dangerous and prohibited", "Yes, if no other place", "Yes, on outskirts", "Yes, with hazards"],
            correctAnswer: 0,
          },
          {
            question: "What distance from tram track for parking?",
            answers: ["Not closer than 3 meters", "Right next to it", "Not closer than 1 meter", "Not closer than 5 meters"],
            correctAnswer: 0,
          },
        ],
      },
    ];

    await Test.insertMany(tests);
    console.log("Tests seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding tests:", error);
    process.exit(1);
  }
};

seedTests();
