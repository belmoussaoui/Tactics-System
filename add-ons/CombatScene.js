//=============================================================================
// CombatScene.js v0.1
//=============================================================================

/*:
 * @plugindesc Add-on to display the combat animation scene for the TacticsSystem.
 * @author El Moussaoui Bilal (https://twitter.com/embxii_)
*
 * @param transition delay
 * @desc The transition delay to display the scene combat
 * @default 30
 *
 * @help
 *
 * For more information, please consult :
 *   - https://forums.rpgmakerweb.com/index.php?threads/tactics-system.97023/
 */

var CombatScene = CombatScene || {};
CombatScene.Parameters = PluginManager.parameters('CombatScene');

CombatScene.transitionDelay = Number(CombatScene.Parameters['transition delay']);

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
    BattleManagerTS.processAction();
};

Scene_Combat.prototype.createDisplayObjects = function() {
    this.createSpriteset();
    this.createWindowLayer();
    this.createAllWindows();
};

Scene_Combat.prototype.createSpriteset = function() {
    this._spriteset = new Spriteset_Battle();
    BattleManagerTS.setSpriteset(this._spriteset);
    this.addChild(this._spriteset);
};

Scene_Combat.prototype.createAllWindows = function() {
    this.createLogWindow();
    this.createMessageWindow();
};

Scene_Combat.prototype.createLogWindow = function() {
    this._logWindow = new Window_BattleLog();
    this._logWindow.setSpriteset(this._spriteset);
    BattleManagerTS.setLogWindow(this._logWindow);
    this.addWindow(this._logWindow);
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
    BattleManagerTS.update();
    Scene_Base.prototype.update.call(this);
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
// Scene_BattleTS
//
// The scene class of the battle tactics system screen.

CombatScene.Scene_BattleTS_initialize = Scene_BattleTS.prototype.initialize;
Scene_BattleTS.prototype.initialize = function() {
    CombatScene.Scene_BattleTS_initialize.call(this);
    this._waitCount = 0;
};

CombatScene.Scene_BattleTS_update = Scene_BattleTS.prototype.update;
Scene_BattleTS.prototype.update = function() {
    CombatScene.Scene_BattleTS_update.call(this);
    if (this.isSceneChangeOk() && BattleManagerTS.isStartCombat()) {
        SceneManager.push(Scene_Combat);
    } else if (SceneManager.isNextScene(Scene_Combat)) {
        this.updateEncounterEffect();
    }
};

CombatScene.Scene_BattleTS_isBusy = Scene_BattleTS.prototype.isBusy;
Scene_BattleTS.prototype.isBusy = function() {
    return (CombatScene.Scene_BattleTS_isBusy.call(this) || this._waitCount > 0);
};

CombatScene.Scene_BattleTS_stop = Scene_BattleTS.prototype.stop;
Scene_BattleTS.prototype.stop = function() {
    if (SceneManager.isNextScene(Scene_Combat)) {
        this._windowLayer.visible = false;
        SceneManager.snapForBackground();
        this._windowLayer.visible = true;
        this.launchCombat();
    }
    CombatScene.Scene_BattleTS_stop.call(this);
};

Scene_BattleTS.prototype.launchCombat = function() {
    this.startEncounterEffect();
};

Scene_BattleTS.prototype.startEncounterEffect = function() {
    this._waitCount = CombatScene.transitionDelay;
};

Scene_BattleTS.prototype.updateEncounterEffect = function() {
    if (this._waitCount > 0) {
        this._waitCount--;
    }
};

Scene_BattleTS.prototype.isSceneChangeOk = function() {
    return this.isActive() && !$gameMessage.isBusy();
};

//-----------------------------------------------------------------------------
// BattleManagerTS
//
// The static class that manages battle progress.

CombatScene.BattleManagerTS_initMembers = BattleManagerTS.initMembers;
BattleManagerTS.initMembers = function() {
    CombatScene.BattleManagerTS_initMembers.call(this);
    this._startCombat = false;
};

BattleManagerTS.setupAction = function() {
    var action = this.subject().currentAction();
    if (action && action.isValid()) {
        this.setupLocalBattle(action);
        this._startCombat = true;
    } else {
        this.processAction();
    }
};

CombatScene.BattleManagerTS_endBattlePhase = BattleManagerTS.endBattlePhase
BattleManagerTS.endBattlePhase = function() {
    if (SceneManager.isPreviousScene(Scene_BattleTS)) {
        this._startCombat = false;
        $gameSelectorTS.savePosition();
        SceneManager.pop();
    } else {
        CombatScene.BattleManagerTS_endBattlePhase.call(this);
    }
};

BattleManagerTS.isStartCombat = function() {
    return this._startCombat;
};

//-----------------------------------------------------------------------------
// Window_BattleLog
//
// The window for displaying battle progress. No frame is displayed, but it is
// handled as a window for convenience.

Window_BattleLog.prototype.showNormalAnimation = function(targets, animationId, mirror) {
    Window_BattleLog_showNormalAnimationTS.call(this, targets, animationId, mirror);
};

//-----------------------------------------------------------------------------
// Sprite_Enemy
//
// The sprite for displaying an enemy.

CombatScene.Sprite_Enemy_setBattler = Sprite_Enemy.prototype.setBattler 
Sprite_Enemy.prototype.setBattler = function(battler) {
    CombatScene.Sprite_Enemy_setBattler.call(this, battler);
    if (!$gameSystem.isSideView()) {
        this.setHomeEnemy(battler.index());
    } else {
        this.setHomeEnemySideView(battler.index())
    }
};

Sprite_Enemy.prototype.setHomeEnemy = function(index) {
    var max = $gameTroop.members().length;
    var centerX = Graphics.width / 2.0;
    var centerY = Graphics.height / 2.0;
    var span = 100;
    var slide = 200;
    this.setHome(centerX - (span * (max - 1)) + (slide * index), centerY);
};

Sprite_Enemy.prototype.setHomeEnemySideView = function(index) {
    this.setHome(200 - index * 32, 280 + index * 96);
};