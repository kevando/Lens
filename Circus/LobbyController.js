// @input Asset.ObjectPrefab ticketPrefab
// @input SceneObject ticketPrefabParent

var ticketObj;

// Create our state machine
var stateMachine = new global.StateMachine("LobbyState", script);

stateMachine.onStateChanged = handleStateChanged;

var states = {};

//     Empty Lobby
//   ----------------
states.empty = stateMachine.addState({
  name: "Empty",
  onEnter: function () {
    print("empty");
  },
});

states.empty.addSimpleSignalTransition("DispensingTicket", "smiled");

//     Ticket
//   ----------------
states.dispensingTicket = stateMachine.addState({
  name: "DispensingTicket",
  onEnter: function () {
    print("I'm ready");
    dispenseTicket();
  },
});

// ========================================================================================

function handleStateChanged(newStateName, oldStateName) {
  print("Lobby From " + oldStateName + " to " + newStateName);
}

function handleCircusStateChanged(newStateName, oldStateName) {
  print("Circus  From " + oldStateName + " to " + newStateName);
  if (newStateName === "Lobby") {
    stateMachine.enterState("Empty");
  }
  if (newStateName === "TentEntrance") {
    ticketObj.destroy();
  }
}

global.circusController.addStateChangedCallback(handleCircusStateChanged);

script.createEvent("SmileFinishedEvent").bind(function (eventData) {
  stateMachine.sendSignal("smiled");
});

script.createEvent("FaceFoundEvent").bind(function (eventData) {
  global.circusController.sendSignal("faceFound");
});

function dispenseTicket() {
  ticketObj = script.ticketPrefab.instantiate(script.ticketPrefabParent);
  ticketObj.enabled = true;
}
