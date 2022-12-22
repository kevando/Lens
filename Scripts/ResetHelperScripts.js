// RestartHelperScripts.js
// Version: 1.0
// Event: Lens Initialized
// Description: Resets behavior and tween manager. helpful for sequences that repeat
// Author: @Kevando (I wrote this, but I took a lot from the Music Lens Template)

// @input bool restartTweens 
// @input bool resetTweens = true {"showIf" : "restartTweens", "label":"    Reset Tweens","hint": "This mostly effects tweens that use offsets"}
// @input SceneObject[] tweenObjects {"showIf" : "restartTweens"}
// @input bool restartBehavior {"hint" : "Behavior", "label": "Restart Behaviors"}
// @input bool behaviorReinit = true {"label":"    Reinitialize","showIf" : "restartBehavior", "hint": "reinitialize all enabled behavior scripts."}
// @input bool behaviorCallAwake = true {"label":"    On Awake","showIf" : "restartBehavior", "hint": "trigger onAwake Event once sceneObject is enabled"}
// @input bool behaviorCallTurnOn = true {"label":"    On Start","showIf" : "restartBehavior", "hint": "trigger onStart Event once sceneObject is enabled"}

function restartBehaviors() {
    if (global.behaviorSystem && script.restartBehavior) {
        if (script.behaviorReinit) {
            global.behaviorSystem.sendCustomTrigger("_reinitialize_all_behaviors");
        }
        if (script.behaviorCallAwake) {
            global.behaviorSystem.sendCustomTrigger("_trigger_all_awake_behaviors");
        }
        if (script.behaviorCallTurnOn) {
            global.behaviorSystem.sendCustomTrigger("_trigger_all_turn_on_behaviors");
        }
    }
}

function restartAutoTweens(so) {
    var scriptComponents = so.getComponents("Component.ScriptComponent");
    var tweenName;
    var tweenObject;

    for (var i = 0; i < scriptComponents.length; i++) {
        if (scriptComponents[i].playAutomatically == true) {
            tweenName = scriptComponents[i].api.tweenName;
            tweenObject = scriptComponents[i].api.tweenObject;

            // RESET!
            if (script.resetTweens) {
                global.tweenManager.resetObject(tweenObject, tweenName);
            }

            // RESTART!
            global.tweenManager.startTween(tweenObject, tweenName);
        }
    }
    var childrenCount = so.getChildrenCount();
    for (var j = 0; j < childrenCount; j++) {
        restartAutoTweens(so.getChild(j));
    }
}

function restartTweens() {
    for (var i = 0; i < script.tweenObjects.length; i++) {
        var scriptObject = script.tweenObjects[i];
        restartAutoTweens(scriptObject);
    }
    print("here we go again");
}

script.api.restartEverything = function() {
    if (global.behaviorSystem && script.restartBehavior) {
        restartBehaviors();
    }
    if (script.restartTweens) {
        restartTweens();
    }
    print("Here we go again...");
};

