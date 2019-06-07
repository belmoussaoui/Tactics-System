//=============================================================================
// ExperienceGainSystem.js v0.1
//=============================================================================

/*:
 * @plugindesc A small review of the experience gain system adapted for the tactics system.
 * @author Bilal El Moussaoui (https://twitter.com/arleq1n)
 *
 * @help
 *
 * For more information, please consult :
 *   - https://forums.rpgmakerweb.com/index.php?threads/tactics-system.97023/
 */

var ExperienceGainSystem = ExperienceGainSystem || {};
ExperienceGainSystem.Parameters = PluginManager.parameters('ExperienceGainSystem');

//-----------------------------------------------------------------------------
// Scene_BattleTS
//
// The scene class of the battle tactics system screen.

Scene_BattleTS.prototype.createExpWindow = function() {
    this._expWindow = new Window_Exp();
    this._expWindow.x = Graphics.width/2 - this._expWindow.width/2;
    this._expWindow.y = Graphics.height/2 - this._expWindow.height/2;
    this.addWindow(this._expWindow);
};

Scene_BattleTS.prototype.updateExpWindow = function() {
    if (this._expWindow.expRate() && !this._expWindow.isOpen()) {
        var actor = BattleManagerTS.subject();
        this._expWindow.open(actor);
    }
};

ExperienceGainSystem.Scene_BattleTS_createDisplayObjects = Scene_BattleTS.prototype.createDisplayObjects;
Scene_BattleTS.prototype.createDisplayObjects = function() {
    ExperienceGainSystem.Scene_BattleTS_createDisplayObjects.call(this);
    BattleManagerTS.setExpWindow(this._expWindow);
};

ExperienceGainSystem.Scene_BattleTS_createAllWindows = Scene_BattleTS.prototype.createAllWindows;
Scene_BattleTS.prototype.createAllWindows = function() {
    ExperienceGainSystem.Scene_BattleTS_createAllWindows.call(this);
    this.createExpWindow();
};

ExperienceGainSystem.Scene_BattleTS_update = Scene_BattleTS.prototype.update;
Scene_BattleTS.prototype.update = function() {
    var active = this.isActive();
    if (active && !this.isBusy()) {
        this.updateExpWindow();
    }
    ExperienceGainSystem.Scene_BattleTS_update.call(this);
};

//-----------------------------------------------------------------------------
// BattleManagerTS
//
// The static class that manages battle progress.

BattleManagerTS.setExpWindow = function(expWindow) {
    this._expWindow = expWindow;
};

ExperienceGainSystem.BattleManagerTS_initMembers = BattleManagerTS.initMembers;
BattleManagerTS.initMembers = function() {
    ExperienceGainSystem.BattleManagerTS_initMembers.call(this);
    this._exp = 0;
};

ExperienceGainSystem.BattleManagerTS_isBusy = BattleManagerTS.isBusy;
BattleManagerTS.isBusy = function() {
    return ExperienceGainSystem.BattleManagerTS_isBusy.call(this) || this._expWindow.isBusy();
};

ExperienceGainSystem.BattleManagerTS_invokeAction = BattleManagerTS.invokeAction;
BattleManagerTS.invokeAction = function(subject, target) {
    ExperienceGainSystem.BattleManagerTS_invokeAction.call(this, subject, target);
    if (!target.isAlive() && !target.isActor()) {
        this._exp += target.exp();
    }
};

ExperienceGainSystem.BattleManagerTS_endBattlePhase = BattleManagerTS.endBattlePhase;
BattleManagerTS.endBattlePhase = function() {
    if (this._subject.isActor() && this._exp > 0) {
        this._expWindow.setup(this.subject());
        this.subject().gainExp(this._exp);
        this._exp = 0;
    }
    ExperienceGainSystem.BattleManagerTS_endBattlePhase.call(this);
};

Game_Actor.prototype.expRate = function() {
    return (this.currentExp() - this.currentLevelExp()) / this.nextLevelExp();
};

Window_Base.prototype.drawExp = function(x, y, width, rate) {
    width = width || 186;
    var color1 = this.hpGaugeColor1();
    var color2 = this.hpGaugeColor2();
    this.drawGauge(x, y, width, rate, color1, color2);
    this.changeTextColor(this.systemColor());
    this.drawText(TextManager.exp, x, y, 44);
    var rate = Math.floor(rate * 100);
 //   if (actor.isMaxLevel()) {
 //       rate = '/';
 //   }
    this.resetTextColor(this.systemColor());
    this.drawText(rate, x + width - 44, y, 44);
};

BattleManagerTS.gainRewards = function() {
    this.gainGold();
    this.gainDropItems();
};

BattleManagerTS.displayRewards = function() {
    this.displayGold();
    this.displayDropItems();
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
    this.contentsOpacity = 0;
    this._showCount = 0;
    this._soundCount = 0;
    this._actor = null;
    this.openness = 0;
    this._expRate = null;
    this._level = null;
    this.refresh();
};

Window_Exp.prototype.windowWidth = function() {
    return 360;
};

Window_Exp.prototype.windowHeight = function() {
    return this.fittingHeight(1);
};

Window_Exp.prototype.update = function() {
    Window_Base.prototype.update.call(this);
    if (this._showCount > 0) {
        this.updateFadeIn();
        this._showCount--;
    } else if (this._showCount <= 0 && !this._expRate) {
        this.updateFadeOut();
        if (this.contentsOpacity <= 0) {
            this.close();
        }
    }
    if (this.contentsOpacity == 255) {
        this.updateExpRate();
    }
};


Window_Exp.prototype.updateExpRate = function() {
    if (this.needRefresh()) {
        this._soundCount += this._showCount > 0 ? 1 : 5;
        if (this._soundCount >= 10) {
             SoundManager.playCursor();
            this._soundCount = 0;
        }
        this._expRate += this._showCount > 0 ? 0.001 : 0.005;
        if (this._expRate >= 1) {
            this._level += 1;
            this._expRate = 0.001;
        }
        this.refresh();
    } else {
        this._expRate = null;
    }
};

Window_Exp.prototype.updateFadeIn = function() {
    this.contentsOpacity += 16;
};

Window_Exp.prototype.updateFadeOut = function() {
    this.contentsOpacity -= 16;
};

Window_Exp.prototype.open = function(actor) {
    this._actor = actor;
    this.refresh();
    this._showCount = 180;
    Window_Base.prototype.open.call(this);
};

Window_Exp.prototype.close = function() {
    Window_Base.prototype.close.call(this);
    this._actor = null;
    this._showCount = 0;
};

Window_Exp.prototype.refresh = function() {
    this.contents.clear();
    if (this._expRate) {
        this.drawExp(0, 0,  this.contentsWidth(), this._expRate);
    }
};

Window_Exp.prototype.setup = function(actor) {
    this._expRate = actor.expRate() + 0.001;
    this._level = actor.level;
};

Window_Exp.prototype.expRate = function() {
    return this._expRate;
};

Window_Exp.prototype.expRate100 = function(expRate) {
    return Math.floor(expRate * 100);
};

Window_Exp.prototype.needRefresh = function() {
    return this._actor && (this.expRate100(this._expRate) !== this.expRate100(this._actor.expRate())) ||
        (this._level !== this._actor.level);
};

Window_Exp.prototype.isBusy = function() {
    return this._actor || this.isOpen();
};