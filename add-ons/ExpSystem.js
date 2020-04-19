//=============================================================================
// ExpGainSystem.js
//=============================================================================

/*:
 * @plugindesc A small review of the rewards system.
 * Requires: TacticsSystem.js
 * @author Bilal El Moussaoui (https://twitter.com/arleq1n)
 *
 * @param attack exp formula
 * @desc The gain experience formula for an attack.
 * @default b.exp() / 10
 *
 * @help
 *
 * For more information, please consult :
 *   - https://forums.rpgmakerweb.com/index.php?threads/tactics-system-1-0.117600/
 */

var ExpGainSystem = ExpGainSystem || {};
ExpGainSystem.Parameters = PluginManager.parameters('ExpSystem');

ExpGainSystem.attackExpFormula = String(ExpGainSystem.Parameters['attack exp formula']);

//-----------------------------------------------------------------------------
// Scene_BattleTS
//
// The scene class of the battle tactics system screen.

ExpGainSystem.Scene_BattleTS_createAllWindows = Scene_BattleTS.prototype.createAllWindows;
Scene_BattleTS.prototype.createAllWindows = function() {
    ExpGainSystem.Scene_BattleTS_createAllWindows.call(this);
    this.createExpWindow();
};

Scene_BattleTS.prototype.createExpWindow = function() {
    this._expWindow = new Window_Exp();
    this._expWindow.x = Graphics.width/2 - this._expWindow.width/2;
    this._expWindow.y = Graphics.height/2 - this._expWindow.height/2;
    this.addWindow(this._expWindow);
};

ExpGainSystem.Scene_BattleTS_createDisplayObjects = Scene_BattleTS.prototype.createDisplayObjects;
Scene_BattleTS.prototype.createDisplayObjects = function() {
    ExpGainSystem.Scene_BattleTS_createDisplayObjects.call(this);
    BattleManagerTS.setExpWindow(this._expWindow);
};

ExpGainSystem.Scene_BattleTS_isAnyInputWindowActive = Scene_BattleTS.prototype.isAnyInputWindowActive;
Scene_BattleTS.prototype.isAnyInputWindowActive = function() {
    return ExpGainSystem.Scene_BattleTS_isAnyInputWindowActive.call(this) || this._expWindow.active;
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
    if (this._subject.isActor() && !target.isActor()) {
        if (!target.isAlive()) {
            this.gainRewardsEnemy(target);
        } else {
            this.gainRewardsAttack(target);
        }
    }

};

ExpGainSystem.BattleManagerTS_nextAction = BattleManagerTS.nextAction;
BattleManagerTS.nextAction = function() {
    if (this._rewards.exp > 0 && this._subject.isActor()) {
        this._infoWindow.close();
        this._expWindow.setup(this._subject);
        this._subject.gainExp(this._rewards.exp, false);
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

BattleManagerTS.gainRewardsAttack = function(enemy) {
    this._rewards.exp += this._action.evalDamageExp(enemy);
};

BattleManagerTS.gainRewards = function() {
    this.gainGold();
    this.gainDropItems();
};

BattleManagerTS.displayRewards = function() {
};

Game_Action.prototype.evalDamageExp = function(target) {
    try {
        var item = this.item();
        var a = this.subject();
        var b = target;
        var value = Math.max(eval(ExpGainSystem.attackExpFormula), 0);
        if (isNaN(value)) value = 0;
        return value;
    } catch (e) {
        return 0;
    }
};

//-----------------------------------------------------------------------------
// Game_Actor
//
// The game object class for an actor.

Game_Actor.prototype.expRate = function() {
    return (this.currentExp() - this.currentLevelExp()) / (this.nextLevelExp() - this.currentLevelExp());
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
    this.refresh();
    this.deactivate();
};

Window_Exp.prototype.windowWidth = function() {
    return 550;
};

Window_Exp.prototype.windowHeight = function() {
    return this.fittingHeight(this.numVisibleRows());
};

Window_Exp.prototype.numVisibleRows = function() {
    return 4;
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
    Window_Base.prototype.open.call(this);
};

Window_Exp.prototype.update = function() {
    if (this._actor) {
        if (this.needRefresh()) {
            this.updateGaugeExp();
        } else {
            this.updateWaitCount()
        }
        this.updateInput();
    }
    Window_Base.prototype.update.call(this);
};

Window_Exp.prototype.isTriggered = function() {
    return (Input.isRepeated('ok') || Input.isRepeated('cancel') ||
            TouchInput.isRepeated());
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
        this.pause = true;
    }
};

Window_Exp.prototype.updateInput = function() {
    if (this.pause) {
        if (this.isTriggered()) {
            this.pause = false;
            this._actor = null;
            this.deactivate();
            this.close();
        }
    }
};

Window_Exp.prototype.needRefresh = function() {
    return this._tempActor.level !== this._actor.level ||
        this._tempActor.currentExp() < this._actor.currentExp();
};

Window_Exp.prototype.refresh = function() {
    this.contents.clear();
    if (this._actor) {
        this.drawActorFace(this._actor, 0, 0, Window_Base._faceWidth, Window_Base._faceHeight);
        this.drawActorSimpleStatus(this._actor, 0, 0, 408);
        this.drawExpInfo();
    }
};

Window_Exp.prototype.drawActorSimpleStatus = function(actor, x, y, width) {
    var lineHeight = this.lineHeight();
    var x2 = x + 150;
    var width2 = Math.min(200, width - 180 - this.textPadding());
    this.drawActorName(actor, x, y);
    this.drawActorIcons(actor, x, y + lineHeight * 2);
    this.drawActorClass(actor, x2, y);
};

Window_Exp.prototype.drawExpInfo = function() {
    var rate = this._tempActor.expRate();
    var lineHeight = this.lineHeight();
    var x = 150;
    var y = lineHeight * 2;
    this.drawActorLevel(this._tempActor.level, x, lineHeight);
    this.drawGaugeArea(x + 60, lineHeight, this.contentsWidth() - x - 70, rate);
    var expTotal = TextManager.expTotal.format(TextManager.exp);
    var expNext = TextManager.expNext.format(TextManager.level);
    var value1 = this._actor.currentExp();
    var value2 = this._actor.nextRequiredExp();
    if (this._actor.isMaxLevel()) {
        value1 = '-------';
        value2 = '-------';
    }
    this.changeTextColor(this.systemColor());
    this.drawText(expTotal, x, y + lineHeight * 0, 350);
    this.drawText(expNext, x, y + lineHeight * 1, 350);
    this.resetTextColor();
    this.drawText(value1, x, y + lineHeight * 0, 350, 'right');
    this.drawText(value2, x, y + lineHeight * 1, 350, 'right');
};

Window_Exp.prototype.drawActorLevel = function(level, x, y) {
    this.changeTextColor(this.systemColor());
    this.drawText(TextManager.levelA, x, y, 32);
    this.resetTextColor();
    this.drawText(level, x + 32, y, 32);
};

Window_Exp.prototype.drawGaugeArea = function(x, y, width, rate) {
    width = width || 186;
    var color1 = this.expGaugeColor1();
    var color2 = this.expGaugeColor2();
    this.drawGauge(x, y, width, rate, color1, color2);
    var rate100 = Math.floor(rate * 100);
    this.drawText(rate100, width * rate - 8 + x, y, 64);
};

Window_Exp.prototype.setTempActor = function(actor) {
    var tempActor = JsonEx.makeDeepCopy(actor);
    if (this._tempActor !== tempActor) {
        this._tempActor = tempActor;
        this.refresh();
    }
};

Window_Exp.prototype.expGaugeColor1 = function() {
    return this.textColor(14);
};

Window_Exp.prototype.expGaugeColor2 = function() {
    return this.textColor(21);
};

Window_Exp.prototype.drawGauge = function(x, y, width, rate, color1, color2) {
    var fillW = Math.floor(width * rate);
    var gaugeY = y + this.lineHeight() - 16;
    this.contents.fillRect(x, gaugeY, width, 10, this.gaugeBackColor());
    this.contents.gradientFillRect(x, gaugeY, fillW, 10, color1, color2);
};