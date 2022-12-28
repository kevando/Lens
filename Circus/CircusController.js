// @ui {"label":"UI"}
// @input Component.ScriptComponent cameraMovementController
// @input Component.Camera maskedCamera
// @input Component.Camera movementCamera
// @input SceneObject lobbyPos
// @input SceneObject entrancePos
// @input SceneObject insideTentPos
// @input SceneObject moonPartyPos
// @ui {"widget":"separator"}
//@input Asset.Texture segmentationTexture
// @input Component.PostEffectVisual enteringTentEffect
// @input Component.Text stubs

// Player Management
var circusEventsAttended = 0;
var hasTicket = false;
var holdingTicket = false;

var globalTime = 0;
var lobbyTime = 0;
var tentTime = 0;
var moonPartyTime = 0;

// "Score" variables
var ticketStubs;

const tickStubsKey = "tickStubs";
var persistentStore = global.persistentStorageSystem.store;
ticketStubs = persistentStore.getFloat(tickStubsKey) || 0;

function addTicketStub() {
  ticketStubs++;
  persistentStore.putFloat(tickStubsKey, ticketStubs);
  updateStubsLabel();
}

// Time Management
var msTicker = 0;

function onSecondTick() {
  var clock = getClock();
  if (clock.s % 10 === 0) {
    print(clock.s);
    stateMachine.sendSignal("onTenSecondTick");
  }

  if (clock.s === 0 && clock.m % 5 === 0) {
    stateMachine.sendSignal("onTheFiveMinute");
  }

  if (clock.s === 0) {
    stateMachine.sendSignal("onClockMinute1");
  }
  if (clock.s === 0 && clock.m % 5 === 0) {
    stateMachine.sendSignal("onClockMinute5");
  }
  if (clock.s === 0 && clock.m % 10 === 0) {
    stateMachine.sendSignal("onClockMinute10");
  }
}

function onUpdate(eventData) {
  globalTime += global.getDeltaTime();

  if (msTicker < 1) {
    msTicker += global.getDeltaTime();
  } else {
    msTicker = 0;
    onSecondTick();
  }
}

script.createEvent("UpdateEvent").bind(onUpdate);

function getClock() {
  var now = new Date();
  return {
    s: now.getSeconds(),
    m: now.getMinutes(),
    h: now.getHours(),
  };
}

//   ------------------------------------------------------------

// Create our state machine
var stateMachine = new global.StateMachine("CircusState", script);

stateMachine.onStateChanged = notifyStateChanged;

var states = {};

states.none = stateMachine.addState({ name: "None" });

states.lobby = stateMachine.addState({
  name: "Lobby",
  onEnter: function () {
    updateStubsLabel();
    print("In da lobby");
    script.movementCamera.enabled = false;
    script.maskedCamera.enabled = true;
    script.enteringTentEffect.enabled = false;
    script.cameraMovementController.api.setTargetObject(script.lobbyPos);
    script.cameraMovementController.api.setPositionEasingSpeed(1);
  },
  onUpdate: function () {
    lobbyTime += global.getDeltaTime();
  },
});

states.beginEntering = stateMachine.addState({
  name: "BeginEntering",
  onEnter: function () {
    script.enteringTentEffect.enabled = true; // slow build until start time
  },
});

//     Tent Entrance
//   ------------------
states.tentEntrance = stateMachine.addState({
  name: "TentEntrance",
  onEnter: function () {
    script.movementCamera.enabled = true;
    script.maskedCamera.enabled = false;
    script.enteringTentEffect.enabled = true;
    script.cameraMovementController.api.setTargetObject(script.entrancePos);
    script.cameraMovementController.api.setPositionEasingSpeed(0.5);
  },
});
states.tentEntrance.addTimedTransition("InsideTent", 60);

states.insideTent = stateMachine.addState({
  name: "InsideTent",
  onEnter: function () {
    script.cameraMovementController.api.setTargetObject(script.insideTentPos);
    script.cameraMovementController.api.setPositionEasingSpeed(0.7);
    script.movementCamera.maskTexture = null; //script.segmentationTexture;
  },
});
states.insideTent.addTimedTransition("MoonParty", 60);

states.moonParty = stateMachine.addState({
  name: "MoonParty",
  onEnter: function () {
    script.cameraMovementController.api.setTargetObject(script.moonPartyPos);
    script.cameraMovementController.api.setPositionEasingSpeed(1);
  },
  onExit: function () {
    script.movementCamera.enabled = false;
    addTicketStub();
  },
});
states.moonParty.addSimpleSignalTransition("Lobby", "screenTapped");

// ----------------------------------
//        Transition Signals
// ----------------------------------

states.none.addSimpleSignalTransition("Lobby", "faceFound");
states.lobby.addSimpleSignalTransition("BeginEntering", "grabbedTicket");
states.beginEntering.addSimpleSignalTransition(
  "TentEntrance",
  "onClockMinute5"
); // poor naming for show time

script.createEvent("TapEvent").bind(function (eventData) {
  stateMachine.sendSignal("screenTapped");
});

// ----------------------------------
//        Public API
// ----------------------------------

var stateChangedCallbacks = [];
function notifyStateChanged(newStateName, oldStateName) {
  for (var i = 0; i < stateChangedCallbacks.length; i++) {
    if (stateChangedCallbacks[i]) {
      stateChangedCallbacks[i](newStateName, oldStateName);
    }
  }
}

global.circusController = {};

// Game State API
global.circusController.sendSignal = function (signal) {
  stateMachine.sendSignal(signal);
};

global.circusController.getTicketStubCount = function () {
  return eventsAttended;
};

global.circusController.addStateChangedCallback = function (callback) {
  stateChangedCallbacks.push(callback);
};

//  ----------------------------------
//        Display
//  ----------------------------------

function updateStubsLabel() {
  var stubsText = "";
  for (i = 0; i < ticketStubs; i++) {
    stubsText += "🎟\n";
  }
  script.stubs.text = stubsText;
}

// ----------------------------------
// Finally, enter the intial state
// ----------------------------------
stateMachine.enterState("None");
