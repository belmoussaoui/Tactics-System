//=============================================================================
// ExpGainSystem.js
//=============================================================================

/*:
 * @plugindesc A small review of the rewards system.
 * Requires: TacticsSystem.js
 * @author Bilal El Moussaoui (https://twitter.com/arleq1n)
 *
 * @help
 *
 * For more information, please consult :
 *   - https://forums.rpgmakerweb.com/index.php?threads/tactics-system.97023/
 */

var ExpGainSystem = ExpGainSystem || {};
ExpGainSystem.Parameters = PluginManager.parameters('ExpGainSystem');

//-----------------------------------------------------------------------------
// Scene_BattleTS
//
// The scene class of the battle tactics system screen.

ExpGainSystem.Scene_BattleTS_createAllWindows = Scene_BattleTS.prototype.createAllWindows;
Scene_BattleTS.prototype.createAllWindows = function() {
    ExpGainSystem.Scene_BattleTS_createAllWindows.call(this);
    this.createExpWindow();
    this.createLevelUpWindow();
};

Scene_BattleTS.prototype.createExpWindow = function() {
    this._expWindow = new Window_Exp();
    this._expWindow.x = Graphics.width/2 - this._expWindow.width/2;
    this._expWindow.y = Graphics.height/2 - this._expWindow.height/2;
    this.addWindow(this._expWindow);
};

Scene_BattleTS.prototype.createLevelUpWindow = function() {
    this._levelUpWindow = new Window_LevelUp();
    this._levelUpWindow.x = Graphics.width/2 - this._levelUpWindow.width/2;
    this._levelUpWindow.y = Graphics.height/2 - this._levelUpWindow.height/2;
    this.addWindow(this._levelUpWindow);
    this._expWindow.setLevelUpWindow(this._levelUpWindow);
};

ExpGainSystem.Scene_BattleTS_createDisplayObjects = Scene_BattleTS.prototype.createDisplayObjects;
Scene_BattleTS.prototype.createDisplayObjects = function() {
    ExpGainSystem.Scene_BattleTS_createDisplayObjects.call(this);
    BattleManagerTS.setExpWindow(this._expWindow);
};

ExpGainSystem.Scene_BattleTS_isAnyInputWindowActive = Scene_BattleTS.prototype.isAnyInputWindowActive;
Scene_BattleTS.prototype.isAnyInputWindowActive = function() {
    return ExpGainSystem.Scene_BattleTS_isAnyInputWindowActive.call(this) || this._expWindow.active
        || this._levelUpWindow.active;
};

//-----------------------------------------------------------------------------
// BattleManagerTS
//
// The static class that manages battle progress.

ExpGainSystem.BattleManagerTS_setup = BattleManagerTS.setup;
BattleManagerTS.setup = function(troopId, canEscape, canLose) {
    ExpGainSystem.BattleManagerTS_setup.call(this, troopId, canEscape, canLose);
    this.makeRewards();
};

BattleManagerTS.setExpWindow = function(expWindow) {
    this._expWindow = expWindow;
};

ExpGainSystem.BattleManagerTS_invokeAction = BattleManagerTS.invokeAction;
BattleManagerTS.invokeAction = function(subject, target) {
    ExpGainSystem.BattleManagerTS_invokeAction.call(this, subject, target);
    if (!target.isActor() && !target.isAlive()) {
        this.gainRewardsEnemy(target);
    }
};

ExpGainSystem.BattleManagerTS_nextAction = BattleManagerTS.nextAction;
BattleManagerTS.nextAction = function() {
    if (this._rewards.exp > 0) {
        this._expWindow.setup(this._subject);
        this._subject.gainExp(this._rewards.exp);
        this.displayRewards();
        this.gainRewards();
        this.makeRewards();
    } else {
        ExpGainSystem.BattleManagerTS_nextAction.call(this);
    }
};

BattleManagerTS.makeRewards = function() {
    this._rewards = {};
    this._rewards.gold = 0;
    this._rewards.exp = 0;
    this._rewards.items = [];
};

BattleManagerTS.gainRewardsEnemy = function(enemy) {
    this._rewards.gold += enemy.gold();
    this._rewards.exp += enemy.exp();
    this._rewards.items = this._rewards.items.concat(enemy.makeDropItems());
};

BattleManagerTS.gainRewards = function() {
    this.gainGold();
    this.gainDropItems();
};

//-----------------------------------------------------------------------------
// Game_Actor
//
// The game object class for an actor.

Game_Actor.prototype.expRate = function() {
    return (this.currentExp() - this.currentLevelExp()) / this.nextLevelExp();
};

Game_Actor.prototype.expRate100 = function() {
    return Math.floor(this.expRate() * 100);
};

Game_Actor.prototype.gainRate = function() {
    return (this.nextLevelExp() - this.currentLevelExp()) / 100;
};

ExpGainSystem.Game_Actor_changeExp = Game_Actor.prototype.changeExp;
Game_Actor.prototype.changeExp = function(exp, show) {
    ExpGainSystem.Game_Actor_changeExp.call(this, exp, false);
};

//-----------------------------------------------------------------------------
// Window_Base
//
// The superclass of all windows within the game.

Window_Base.prototype.expGaugeColor1 = function() {
    return this.textColor(14);
};

Window_Base.prototype.expGaugeColor2 = function() {
    return this.textColor(21);
};

Window_Base.prototype.drawGauge = function(x, y, width, rate, color1, color2) {
    var fillW = Math.floor(width * rate);
    var gaugeY = y + this.lineHeight() - 12;
    this.contents.fillRect(x, gaugeY, width, 10, this.gaugeBackColor());
    this.contents.gradientFillRect(x, gaugeY, fillW, 10, color1, color2);
};

//-----------------------------------------------------------------------------
// Window_Exp
//
// The window for displaying the experience gain gauge.

function Window_Exp() {
    this.initialize.apply(this, arguments);
}

Window_Exp.prototype = Object.create(Window_Base.prototype);
Window_Exp.prototype.constructor = Window_Exp;

Window_Exp.prototype.initialize = function() {
    var wight = this.windowWidth();
    var height = this.windowHeight();
    Window_Base.prototype.initialize.call(this, 0, 0, wight, height);
    this.openness = 0;
    this._actor = null;
    this._level = 0;
    this._tempActor = null;
    this._showCount = 0;
    this._waitCount = 0;
    this._levelUpWindow = null;
    this.refresh();
    this.deactivate();
};

Window_Exp.prototype.windowWidth = function() {
    return 300;
};

Window_Exp.prototype.windowHeight = function() {
    return this.fittingHeight(this.numVisibleRows());
};

Window_Exp.prototype.numVisibleRows = function() {
    return 1;
};

Window_Exp.prototype.setLevelUpWindow = function(levelUpWindow) {
    this._levelUpWindow = levelUpWindow;
};

Window_Exp.prototype.setup = function(actor) {
    this._actor = actor;
    this._level = actor.level;
    this._showCount = 0;
    this._waitCount = 0;
    this.setTempActor(actor);
    this.refresh();
    this.activate();
    this.open();
    this._levelUpWindow.setTempActor(actor);
    Window_Base.prototype.open.call(this);
};

Window_Exp.prototype.update = function() {
    if (this._actor) {
        if (this.needRefresh()) {
            this.updateGaugeExp();
        } else {
            this.updateWaitCount()
        }
    }
    Window_Base.prototype.update.call(this);
};

Window_Exp.prototype.updateGaugeExp = function() {
    this._showCount++;
    if (this._showCount > 30) {
        var currentExp = this._tempActor.currentExp();
        var gainExp = this._tempActor.gainRate();
        var level = this._tempActor.level;
        this._tempActor.changeExp(currentExp + gainExp, false);
        this.refresh();
    }
};

Window_Exp.prototype.updateWaitCount = function() {
    this._waitCount++;
    if (this._waitCount > 60) {
        this._actor = null;
        this.deactivate();
        this.close();
        this.showLevelUp();
    }
};

Window_Exp.prototype.showLevelUp = function() {
    if (this.needLevelUp()) {
        this._levelUpWindow.refresh();
        this._levelUpWindow.open();
    }
};

Window_Exp.prototype.needLevelUp = function() {
    return this._level !== this._tempActor.level;
};

Window_Exp.prototype.needRefresh = function() {
    return this._tempActor.level !== this._actor.level ||
        this._tempActor.currentExp() < this._actor.currentExp();
};

Window_Exp.prototype.refresh = function() {
    this.contents.clear();
    if (this._actor) {
        this.drawExpInfo();
    }
};

Window_Exp.prototype.drawExpInfo = function() {
    var rate = this._tempActor.expRate();
    this.drawActorLevel(this._tempActor.level, 0, 0);
    this.drawGaugeArea(50, 0, this.contentsWidth() - 50, rate);
};

Window_Exp.prototype.drawActorLevel = function(level, x, y) {
    this.changeTextColor(this.systemColor());
    this.drawText(TextManager.levelA, x, y + 8, 32);
    this.resetTextColor();
    this.drawText(level, x + 32, y + 8, 32);
};

Window_Exp.prototype.drawGaugeArea = function(x, y, width, rate) {
    width = width || 186;
    var color1 = this.expGaugeColor1();
    var color2 = this.expGaugeColor2();
    this.drawGauge(x, y, width, rate, color1, color2);
    var rate100 = Math.floor(rate * 100);
    this.drawText(rate100, width * rate - 8 + 50, y, 64);
};

Window_Exp.prototype.setTempActor = function(actor) {
    var tempActor = JsonEx.makeDeepCopy(actor);
    if (this._tempActor !== tempActor) {
        this._tempActor = tempActor;
        this.refresh();
    }
};

//-----------------------------------------------------------------------------
// Window_LevelUp
//
// The window for displaying the level up.

function Window_LevelUp() {
    this.initialize.apply(this, arguments);
}

Window_LevelUp.prototype = Object.create(Window_Base.prototype);
Window_LevelUp.prototype.constructor = Window_LevelUp;

Window_LevelUp.prototype.initialize = function() {
    var wight = this.windowWidth();
    var height = this.windowHeight();
    Window_Base.prototype.initialize.call(this, 0, 0, wight, height);
    this.openness = 0;
    this._actor = null;
    this._tempActor = null;
    this.refresh();
    this.deactivate();
};

Window_LevelUp.prototype.setup = function(actor) {
    this._actor = actor;
    this.refresh();
    this._waitCount = 0;
};

Window_LevelUp.prototype.open = function() {
    Window_Base.prototype.open.call(this);
    this.activate();
};

Window_LevelUp.prototype.windowWidth = function() {
    return 280;
};

Window_LevelUp.prototype.windowHeight = function() {
    return this.fittingHeight(this.numVisibleRows());
};

Window_LevelUp.prototype.numVisibleRows = function() {
    return 7;
};

Window_LevelUp.prototype.update = function() {
    Window_Base.prototype.update.call(this);
    if (this.active) {
        if (Input.isTriggered('ok')) {
            this.hide()
            this.deactivate();
            this.close();
        }
    }
};

Window_LevelUp.prototype.refresh = function() {
    this.contents.clear();
    if (this._actor) {
        var lineHeight = this.lineHeight();
        this.changeTextColor(this.systemColor());
        this.drawActorClass(this._actor, 0, lineHeight * 0);
        this.drawBattlerLevel(this._actor, this.contentsWidth() - 48, 0);
        this.resetTextColor();
        this.drawHorzLine(lineHeight * 0);
        for (var i = 0; i < 6; i++) {
            this.drawItem(0, this.lineHeight() * (1 + i), 2 + i);
        }
    }
};

Window_LevelUp.prototype.drawItem = function(x, y, paramId) {
    this.drawParamName(x + this.textPadding(), y, paramId);
    if (this._tempActor) {
        this.drawCurrentParam(x + 120, y, paramId);
    }
    this.drawRightArrow(x + 168, y);
    if (this._actor && this._tempActor) {
        this.drawNewParam(x + 176, y, paramId);
    }
};

Window_LevelUp.prototype.drawParamName = function(x, y, paramId) {
    this.changeTextColor(this.systemColor());
    this.drawText(TextManager.param(paramId), x, y, 120);
};

Window_LevelUp.prototype.drawCurrentParam = function(x, y, paramId) {
    this.resetTextColor();
    this.drawText(this._tempActor.paramBase(paramId), x, y, 48, 'right');
};

Window_LevelUp.prototype.drawRightArrow = function(x, y) {
    this.changeTextColor(this.systemColor());
    this.drawText('\u2192', x, y, 32, 'center');
};

Window_LevelUp.prototype.drawNewParam = function(x, y, paramId) {
    var newValue = this._actor.paramBase(paramId);
    var diffvalue = newValue - this._tempActor.paramBase(paramId);
    this.changeTextColor(this.paramchangeTextColor(diffvalue));
    this.drawText(newValue, x, y, 48, 'right');
};

Window_LevelUp.prototype.drawHorzLine = function(y) {
    var lineY = y + this.lineHeight() - 1;
    this.contents.paintOpacity = 48;
    this.contents.fillRect(0, lineY, this.contentsWidth(), 2, this.lineColor());
    this.contents.paintOpacity = 255;
};

Window_LevelUp.prototype.lineColor = function() {
    return this.systemColor();
};

Window_LevelUp.prototype.setTempActor = function(actor) {
    var tempActor = JsonEx.makeDeepCopy(actor);
    if (this._tempActor !== tempActor) {
        this._tempActor = tempActor;
        this.refresh();
    }
};
