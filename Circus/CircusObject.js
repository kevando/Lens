

// only ticket for now


  script.createEvent("TapEvent").bind(function (eventData) {
    global.circusController.sendSignal("grabbedTicket");
  });