//=============================================================================
// Tactics_Combat.js
//=============================================================================

/*:
 * @plugindesc Add-on to display the combat animation scene.
 * Requires: Tactics_Basic.js
 * @author Bilal El Moussaoui (https://twitter.com/arleq1n)
 *
 *
 * @help
 *
 * Note Tag
 *
 * <Skip Combat:false> [skills]
 *    To skip combat scene for a specific skill.
 *
 * For more information, please consult :
 *   - https://forums.rpgmakerweb.com/index.php?threads/tactics-system-1-0.117600/
 */

var CombatScene = CombatScene || {};
CombatScene.Parameters = PluginManager.parameters('Tactics_Combat');

/**
 * Converts a boolean string.
 *
 * @method String.prototype.toBoolean
 * @return {Boolean} A boolean of string
 */
String.prototype.toBoolean = function(){
    var s = String(this);
    switch (s) {
    case 'true':
        return true;
    default:
        return false;
    }
};

//-----------------------------------------------------------------------------
// Game_Interpreter
//
// The interpreter for running event commands.

CombatScene.Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
    CombatScene.Game_Interpreter_pluginCommand.call(this, command, args);
    switch(command) {
        case 'CombatScene.ClearBattleback':
            this.clearBattleback(args[0]);
            break;
        case 'CombatScene.AddBattleback':
            this.addBattleback(args[0], args[1], args[2]);
            break;
    }
};

Game_Interpreter.prototype.clearBattleback = function() {
    $gameMap.clearBattleback();
};

Game_Interpreter.prototype.addBattleback = function(battlebackName1, battlebackName2, regionId) {
    regionId = regionId ? Number(regionId) : 0;
    $gameMap.addBattleback(battlebackName1, battlebackName2, regionId)
};

//-----------------------------------------------------------------------------
// Scene_Combat
//
// The scene class to display combat animation scene.

function Scene_Combat() {
    this.initialize.apply(this, arguments);
}

Scene_Combat.prototype = Object.create(Scene_Base.prototype);
Scene_Combat.prototype.constructor = Scene_Combat;

Scene_Combat.prototype.initialize = function() {
    Scene_Base.prototype.initialize.call(this);
};

Scene_Combat.prototype.create = function() {
    Scene_Base.prototype.create.call(this);
    this.createDisplayObjects();
};

Scene_Combat.prototype.start = function() {
    Scene_Base.prototype.start.call(this);
    this.startFadeIn(this.fadeSpeed(), false);
    this.updateSubjectStatusWindow();
};

Scene_Combat.prototype.createDisplayObjects = function() {
    this.createSpriteset();
    this.createWindowLayer();
    this.createAllWindows();
};

Scene_Combat.prototype.createSpriteset = function() {
    this._spriteset = new Spriteset_Battle();
    BattleManager.setSpriteset(this._spriteset);
    this.addChild(this._spriteset);
};

Scene_Combat.prototype.createAllWindows = function() {
    this.createLogWindow();
    this.createStatusWindow();
    this.createMessageWindow();
};

Scene_Combat.prototype.createLogWindow = function() {
    this._logWindow = new Window_BattleLog();
    this._logWindow.setSpriteset(this._spriteset);
    BattleManager.setLogWindow(this._logWindow);
    this.addWindow(this._logWindow);
};

Scene_Combat.prototype.createStatusWindow = function() {
    this._actorWindow = new Window_TacticsStatus();
    this._actorWindow.x = Graphics.boxWidth / 2 + 32;
    this.addWindow(BattleManager._actorWindow);
    this._enemyWindow = new Window_TacticsStatus();
    this._enemyWindow.x = Graphics.boxWidth / 2 - this._enemyWindow.width - 32;
    this.addWindow(BattleManager._enemyWindow);
};

Scene_Combat.prototype.createMessageWindow = function() {
    this._messageWindow = new Window_Message();
    this.addWindow(this._messageWindow);
    this._messageWindow.subWindows().forEach(function(window) {
        this.addWindow(window);
    }, this);
};

Scene_Combat.prototype.update = function() {
    var active = this.isActive();
    $gameScreen.update();
    BattleManager._actorWindow.refresh();
    BattleManager._enemyWindow.refresh();
    BattleManager.update();
    Scene_Base.prototype.update.call(this);
};

Scene_Combat.prototype.isSceneChangeOk = function() {
    return this.isActive() && !$gameMessage.isBusy();
};

Scene_Combat.prototype.updateSubjectStatusWindow = function() {
    var select = BattleManager.subject();
    var target = $gameSelector.select();
    if (select.isActor()) {
        BattleManager._actorWindow.open(select);
        BattleManager._enemyWindow.open(target);
    } else {
        BattleManager._actorWindow.open(target);
        BattleManager._enemyWindow.open(select);
    }
};

Scene_Combat.prototype.needsSlowFadeOut = function() {
    return (SceneManager.isNextScene(Scene_Title) ||
            SceneManager.isNextScene(Scene_Gameover));
};

Scene_Combat.prototype.terminate = function() {
    Scene_Base.prototype.terminate.call(this);
    AudioManager.stopMe();
    ImageManager.clearRequest();
};

//-----------------------------------------------------------------------------
// Scene_Battle
//
// The scene class of the battle tactics system screen.

CombatScene.Scene_Battle_initialize = Scene_Battle.prototype.initialize;
Scene_Battle.prototype.initialize = function() {
    CombatScene.Scene_Battle_initialize.call(this);
    this._waitCount = 0;
};

CombatScene.Scene_Battle_update = Scene_Battle.prototype.update;
Scene_Battle.prototype.update = function() {
    CombatScene.Scene_Battle_update.call(this);
    var action = BattleManager._action;
    if (action && action.needCombatScene()) {
        if (this.isSceneChangeOk() && BattleManager.isStartCombat()) {
            SceneManager.push(Scene_Combat);
        }
    }
    if (SceneManager.isNextScene(Scene_Combat)) {
        this.updateEncounterEffect();
    }
};

CombatScene.Scene_Battle_isBusy = Scene_Battle.prototype.isBusy;
Scene_Battle.prototype.isBusy = function() {
    return (CombatScene.Scene_Battle_isBusy.call(this) || this._waitCount > 0);
};

CombatScene.Scene_Battle_stop = Scene_Battle.prototype.stop;
Scene_Battle.prototype.stop = function() {
    if (SceneManager.isNextScene(Scene_Combat)) {
        this._windowLayer.visible = false;
        SceneManager.snapForBackground();
        this._windowLayer.visible = true;
        this.launchCombat();
    }
    CombatScene.Scene_Battle_stop.call(this);
};

Scene_Battle.prototype.launchCombat = function() {
    this.startEncounterEffect();
};

Scene_Battle.prototype.startEncounterEffect = function() {
    this._waitCount = 30;
};

Scene_Battle.prototype.updateEncounterEffect = function() {
    if (this._waitCount > 0) {
        this._waitCount--;
    }
};

Scene_Battle.prototype.isSceneChangeOk = function() {
    return this.isActive() && !$gameMessage.isBusy();
};

//-----------------------------------------------------------------------------
// BattleManager
//
// The static class that manages battle progress.

CombatScene.BattleManager_initMembers = BattleManager.initMembers;
BattleManager.initMembers = function() {
    CombatScene.BattleManager_initMembers.call(this);
    this._startCombat = false;
    this._waitCount = 0;
};

CombatScene.BattleManager_setupAction = BattleManager.setupAction;
BattleManager.setupAction = function() {
    CombatScene.BattleManager_setupAction.call(this);
    if (this._action && this._action.isValid() && !this._action.isMove()) {
        var target = this._targets[0];
        $gameMap.setupBattlebackCombat(target.event());
        $gameSelector.performTransfer(target.x, target.y);
        this._startCombat = true;
        this._waitCount = 15;
    }
};

CombatScene.BattleManager_updateClose = BattleManager.updateClose;
BattleManager.updateClose = function() {
    if (!this.checkCombatEnd()) {
        CombatScene.BattleManager_updateClose.call(this);
        SceneManager._scene._statusWindow.refresh();
    }
};

BattleManager.checkCombatEnd = function() {
    this._startCombat = false;
    if (SceneManager.isPreviousScene(Scene_Battle)) {
        $gameSelector.savePosition();
        SceneManager.pop();
        return true;
    }
    return false;
};

BattleManager.isStartCombat = function() {
    return this._startCombat;
};

BattleManager.subject = function() {
    return this._subject;
};

CombatScene.BattleManager_nextAction = BattleManager.nextAction;
BattleManager.nextAction = function() {
    if (this._waitCount > 0) {
        this._waitCount -= 1;
    }
    if (this._waitCount <= 0 && !this.checkCombatEnd()) {
        CombatScene.BattleManager_nextAction.call(this);
    }
};

CombatScene.BattleManager_checkBattleEnd = BattleManager.checkBattleEnd;
BattleManager.checkBattleEnd = function() {
    if (!SceneManager.isPreviousScene(Scene_Battle)) {
        return CombatScene.BattleManager_checkBattleEnd.call(this);
    } else {
        return false;
    }
};

CombatScene.BattleManager_updateEventMain = BattleManager.updateEventMain;
BattleManager.updateEventMain = function() {
    if (!SceneManager.isPreviousScene(Scene_Battle)) {
        return CombatScene.BattleManager_updateEventMain.call(this);
    }
    return false;
};

CombatScene.BattleManager_updateBattleEnd = BattleManager.updateBattleEnd;
BattleManager.updateBattleEnd = function() {
    if (!SceneManager.isPreviousScene(Scene_Battle)) {
        CombatScene.BattleManager_updateBattleEnd.call(this);
    }
};

//-----------------------------------------------------------------------------
// Game_Selector
//
// The game object class for the selector.

CombatScene.Game_Selector_isBusy = Game_Selector.prototype.isBusy;
Game_Selector.prototype.isBusy = function() {
    if (SceneManager.isPreviousScene(Scene_Battle)) {
        return false
    }
    return CombatScene.Game_Selector_isBusy.call(this);
};


//-----------------------------------------------------------------------------
// Game_Map
//
// The game object class for a map. It contains scrolling and passage
// determination functions.

CombatScene.Game_Map_initialize  = Game_Map.prototype.initialize;
Game_Map.prototype.initialize = function() {
    CombatScene.Game_Map_initialize.call(this);
    this._battlebacks = [];
};

Game_Map.prototype.clearBattleback = function() {
    this._battlebacks = [];
};

Game_Map.prototype.addBattleback = function(battlebackName1, battlebackName2, regionId) {
    var battleback = {};
    battleback.battlebackName1 = battlebackName1;
    battleback.battlebackName2 = battlebackName2;
    battleback.regionId = regionId;
    this._battlebacks.push(battleback);
};

Game_Map.prototype.setupBattlebackCombat = function(event) {
    this.setupBattleback();
    try {
        for (var i = 0; i < this._battlebacks.length; i++) {
            var battleback = this._battlebacks[i];
            if (event.regionId() === battleback.regionId) {
                var battlebackName1 = battleback.battlebackName1;
                var battlebackName2 = battleback.battlebackName2;
                this.changeBattleback(battlebackName1, battlebackName2);
            }
        }
    } catch (e) {
    }
};

//-----------------------------------------------------------------------------
// Game_Action
//
// The game object class for a battle action.

Game_Action.prototype.needCombatScene = function() {
    return !this.isGuard() && !this.isWait() && !this.skipScene();
};

Game_Action.prototype.skipScene = function() {
    return this.item() && this.item().meta['Skip Combat'] === 'true';
};

//-----------------------------------------------------------------------------
// Window_BattleLog
//
// The window for displaying battle progress. No frame is displayed, but it is
// handled as a window for convenience.

CombatScene.Window_BattleLog_showNormalAnimation = Window_BattleLog.prototype.showNormalAnimation;
Window_BattleLog.prototype.showNormalAnimation = function(targets, animationId, mirror) {
    if (SceneManager.isCurrentScene(Scene_Combat)) {
        TacticsSystem.Window_BattleLog_showNormalAnimation.call(this, targets, animationId, mirror);
    } else {
        CombatScene.Window_BattleLog_showNormalAnimation.call(this, targets, animationId, mirror);
    }
};

//-----------------------------------------------------------------------------
// Sprite_Enemy
//
// The sprite for displaying an enemy.

CombatScene.Sprite_Enemy_setBattler = Sprite_Enemy.prototype.setBattler 
Sprite_Enemy.prototype.setBattler = function(battler) {
    CombatScene.Sprite_Enemy_setBattler.call(this, battler);
    var index = battler.index();
    if (!$gameSystem.isSideView()) {
        this.setHomeEnemy(index);
    } else {
        this.setHomeEnemySideView(index);
    }
};

Sprite_Enemy.prototype.setHomeEnemy = function(index) {
    var max = $gameTroop.members().length;
    var centerX = Graphics.width / 2;
    var centerY = Graphics.height / 2;
    var span = 100;
    var slide = 200;
    this.setHome(centerX - (span * (max - 1)) + (slide * index), centerY);
};

Sprite_Enemy.prototype.setHomeEnemySideView = function(index) {
    var centerX = Graphics.width / 2;
    this.setHome(centerX - 300 - index * 32, 300 + index * 96);
};