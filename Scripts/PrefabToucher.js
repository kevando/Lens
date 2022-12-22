// Spawns a prefab where the user touches 
// Author: Lens Studio Team

//@input Component.Camera camera
//@input Asset.ObjectPrefab myPrefab
script.createEvent("TouchStartEvent").bind(onTouchStart);
function onTouchStart(e){
    if(script.camera){
        var touchPosition = e.getTouchPosition();
        var worldPosition = script.camera.screenSpaceToWorldSpace(touchPosition, 200);
        var mySceneObject = createObjectFromPrefab();
        mySceneObject.getTransform().setWorldPosition(worldPosition);
    }
}
function createObjectFromPrefab(){
    if(script.myPrefab){
        var instanceObject = script.myPrefab.instantiate(script.getSceneObject());
        return instanceObject;
    }
    else{
        return undefined;
    }
}