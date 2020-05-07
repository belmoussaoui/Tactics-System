//=============================================================================
// CombatScene.js
//=============================================================================

/*:
 * @plugindesc Add-on to display the combat animation scene.
 * Requires: TacticsSystem.js
 * @author Bilal El Moussaoui (https://twitter.com/arleq1n)
*
 * @param start transition delay
 * @desc The transition delay to starting display the scene combat
 * @default 30
 *
 * @param end transition delay
 * @desc The transition delay to ending display the scene combat
 * @default 30
 *
 * @help
 *
 * For more information, please consult :
 *   - https://forums.rpgmakerweb.com/index.php?threads/tactics-system-1-0.117600/
 */

var CombatScene = CombatScene || {};
CombatScene.Parameters = PluginManager.parameters('CombatScene');

CombatScene.startTransitionDelay = Number(CombatScene.Parameters['start transition delay']);
CombatScene.endTransitionDelay =   Number(CombatScene.Parameters['end transition delay']);

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
    this.createStatusWindow();
    this.createMessageWindow();
    if (BattleManagerTS._expWindow) {
        this.addChild(BattleManagerTS._expWindow)
    }
};

Scene_Combat.prototype.createLogWindow = function() {
    this._logWindow = new Window_BattleLog();
    this._logWindow.setSpriteset(this._spriteset);
    BattleManagerTS.setLogWindow(this._logWindow);
    this.addWindow(this._logWindow);
};

Scene_Combat.prototype.createStatusWindow = function() {
    this._statusSubjectWindow = new Window_BattleStatusTS();
    this._statusSubjectWindow.x = Graphics.width/2 + 32;
    this.addWindow(this._statusSubjectWindow);
    this._statusTargetWindow = new Window_BattleStatusTS();
    this._statusTargetWindow.x = Graphics.width/2 - this._statusTargetWindow.width - 32;
    this.addWindow(this._statusTargetWindow);
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
    this.updateSubjectStatusWindow();
    if (!BattleManagerTS._expWindow || !BattleManagerTS._expWindow.isOpen()) {
        BattleManagerTS.update();
    }
    Scene_Base.prototype.update.call(this);
};

Scene_Combat.prototype.isSceneChangeOk = function() {
    return this.isActive() && !$gameMessage.isBusy();
};

Scene_Combat.prototype.updateSubjectStatusWindow = function() {
    var select = BattleManagerTS.subject();
    var target = $gameSelectorTS.select();
    if (select.isActor()) {
        this._statusSubjectWindow.open(select);
        this._statusTargetWindow.open(target);
    } else {
        this._statusSubjectWindow.open(target);
        this._statusTargetWindow.open(select);
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
    var action = BattleManagerTS.inputtingAction()
    if (action && action.needCombatScene()) {
        if (this.isSceneChangeOk() && BattleManagerTS.isStartCombat()) {
            SceneManager.push(Scene_Combat);
        }
    }
    if (SceneManager.isNextScene(Scene_Combat)) {
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
    this._waitCount = CombatScene.startTransitionDelay;
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
    this._waitCount = 0;
};

CombatScene.BattleManagerTS_setupAction = BattleManagerTS.setupAction;
BattleManagerTS.setupAction = function() {
    CombatScene.BattleManagerTS_setupAction.call(this);
    if (this._action && this._action.isValid()) {
        var target = this._targets[0];
        $gameSelectorTS.performTransfer(target.x, target.y);
        this._startCombat = true;
        this._waitCount = CombatScene.endTransitionDelay;
    }
};

CombatScene.BattleManagerTS_updateClose = BattleManagerTS.updateClose;
BattleManagerTS.updateClose = function() {
    if (!this.checkCombatEnd()) {
        CombatScene.BattleManagerTS_updateClose.call(this);
    }
};

BattleManagerTS.checkCombatEnd = function() {
    this._startCombat = false;
    if (SceneManager.isPreviousScene(Scene_BattleTS)) {
        $gameSelectorTS.savePosition();
        SceneManager.pop();
        return true;
    }
    return false;
};

BattleManagerTS.isStartCombat = function() {
    return this._startCombat;
};

BattleManagerTS.subject = function() {
    return this._subject;
};

CombatScene.BattleManagerTS_nextAction = BattleManagerTS.nextAction;
BattleManagerTS.nextAction = function() {
    if (this._waitCount > 0) {
        this._waitCount -= 1;
    }
    if (this._waitCount <= 0 && !this.checkCombatEnd()) {
        CombatScene.BattleManagerTS_nextAction.call(this);
    }
};

CombatScene.BattleManagerTS_checkBattleEnd = BattleManagerTS.checkBattleEnd;
BattleManagerTS.checkBattleEnd = function() {
    if (!SceneManager.isPreviousScene(Scene_BattleTS)) {
        return CombatScene.BattleManagerTS_checkBattleEnd.call(this);
    } else {
        return false;
    }
};

//-----------------------------------------------------------------------------
// Game_SelectorTS
//
// The game object class for the selector.

CombatScene.Game_SelectorTS_isBusy = Game_SelectorTS.prototype.isBusy;
Game_SelectorTS.prototype.isBusy = function() {
    if (SceneManager.isPreviousScene(Scene_BattleTS)) {
        return false
    }
    return CombatScene.Game_SelectorTS_isBusy.call(this);
};


//-----------------------------------------------------------------------------
// Game_Action
//
// The game object class for a battle action.

Game_Action.prototype.needCombatScene = function() {
    return !this.isGuard() && !this.isWait();
};

//-----------------------------------------------------------------------------
// Window_BattleLog
//
// The window for displaying battle progress. No frame is displayed, but it is
// handled as a window for convenience.

Window_BattleLog.prototype.showNormalAnimation = function(targets, animationId, mirror) {
    TacticsSystem.Window_BattleLog_showNormalAnimation.call(this, targets, animationId, mirror);
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
    var centerX = Graphics.width / 2.0;
    var centerY = Graphics.height / 2.0;
    var span = 100;
    var slide = 200;
    this.setHome(centerX - (span * (max - 1)) + (slide * index), centerY);
};

Sprite_Enemy.prototype.setHomeEnemySideView = function(index) {
    this.setHome(200 - index * 32, 280 + index * 96);
};