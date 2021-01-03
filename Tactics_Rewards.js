//=============================================================================
// Tactics_Rewards.js
//=============================================================================

/*:
 * @plugindesc Review of the rewards for tactics battle.
 * Requires: Tactics_Basics.js and above of Tactics_Combat.
 * @author Bilal El Moussaoui (https://twitter.com/arleq1n)
 *
 * @param Attack Exp Formula
 * @desc The gain experience formula for an attack.
 * @default b.exp() / 10
 *
 * @help
 * -----------------------------------------------------------------------------
 * Basics
 * Rewards are gained at the end of each action. There are two types of rewards:
 * enemy rewards and action rewards.
 * 
 * You gain the enemy rewards when the enemy is dead.
 * 
 * You gain action rewards when you process an action. The reward for an action is
 * defined by the tag <Exp Formula:b.exp() / 10> in the database for an item or
 * skill.
 *
 * -----------------------------------------------------------------------------
 * To Do
 *    - no rewards if an action is missed
 *    - display golds and drop items in the window
 *    - display level up window
 *
 * -----------------------------------------------------------------------------
 * Help
 * If you encounter a error, please report it in the following thread :
 *     https://forums.rpgmakerweb.com/index.php?threads/tactics-system-1-0.117600/
 */

var ExpGain = ExpGain || {};
ExpGain.Parameters = PluginManager.parameters('Tactics_Rewards');

ExpGain.attackExpFormula = String(ExpGain.Parameters['Attack Exp Formula']);

//-----------------------------------------------------------------------------
// Scene_Battle
//
// The scene class of the battle tactics system screen.

ExpGain.Scene_Battle_createAllWindows = Scene_Battle.prototype.createAllWindows;
Scene_Battle.prototype.createAllWindows = function() {
    ExpGain.Scene_Battle_createAllWindows.call(this);
    this.createExpWindow();
};

Scene_Battle.prototype.createExpWindow = function() {
    this._expWindow = new Window_Exp();
    this._expWindow.x = Graphics.width / 2 - this._expWindow.width / 2;
    this._expWindow.y = Graphics.height / 2 - this._expWindow.height / 2;
    this.addWindow(this._expWindow);
};

ExpGain.Scene_Battle_createDisplayObjects = Scene_Battle.prototype.createDisplayObjects;
Scene_Battle.prototype.createDisplayObjects = function() {
    ExpGain.Scene_Battle_createDisplayObjects.call(this);
    BattleManager.setExpWindow(this._expWindow);
};

ExpGain.Scene_Battle_isAnyInputWindowActive = Scene_Battle.prototype.isAnyInputWindowActive;
Scene_Battle.prototype.isAnyInputWindowActive = function() {
    return ExpGain.Scene_Battle_isAnyInputWindowActive.call(this) || this._expWindow.active;
};

//-----------------------------------------------------------------------------
// BattleManager
//
// The static class that manages battle progress.

ExpGain.BattleManager_setup = BattleManager.setup;
BattleManager.setup = function(troopId, canEscape, canLose) {
    ExpGain.BattleManager_setup.call(this, troopId, canEscape, canLose);
    this.makeRewards();
};

BattleManager.setExpWindow = function(expWindow) {
    this._expWindow = expWindow;
};

ExpGain.BattleManager_invokeAction = BattleManager.invokeAction;
BattleManager.invokeAction = function(subject, target) {
    ExpGain.BattleManager_invokeAction.call(this, subject, target);
    this.invokeRewards(target);
};

BattleManager.invokeRewards = function(target) {
    if (this._subject.isActor()) {
        if (target.isEnemy() && target.isDead()) {
            this.gainRewardsEnemy(target);
        } else {
            this.gainRewardsAction(target)
        }
    }
};

ExpGain.BattleManager_invokeCounterAttack = BattleManager.invokeCounterAttack;
BattleManager.invokeCounterAttack = function(subject, target) {
    ExpGain.BattleManager_invokeCounterAttack.call(this, subject, target);
    if (target.isActor()) {
        if (subject.isEnemy() && subject.isDead()) {
            this.gainRewardsEnemy(subject);
        } else {
            this.gainRewardsAction(subject)
        }
    }
};

BattleManager.gainRewardsEnemy = function(enemy) {
    this._rewards.gold += enemy.gold();
    this._rewards.exp += enemy.exp();
    this._rewards.items = this._rewards.items.concat(enemy.makeDropItems());
};

BattleManager.gainRewardsAction = function(target) {
    this._rewards.exp += this._action.evalExpFormula(target);
};

ExpGain.BattleManager_nextAction = BattleManager.nextAction;
BattleManager.nextAction = function() {
    this.nextRewardsAction();
    ExpGain.BattleManager_nextAction.call(this);
};

BattleManager.nextRewardsAction = function() {
    if (this._rewards.exp > 0) {
        this._infoWindow.close();
        var actor = this._subject;
        if (!this._subject.isActor()) {
            actor = this._targets[this._targets.length - 1];
        }
        this._expWindow.setup(actor);
        actor.gainExp(this._rewards.exp, false);
        this.displayRewards();
        this.gainRewards();
        this.makeRewards();
    }
};

BattleManager.makeRewards = function() {
    this._rewards = {};
    this._rewards.gold = 0;
    this._rewards.exp = 0;
    this._rewards.items = [];
};

BattleManager.gainRewards = function() {
    this.gainGold();
    this.gainDropItems();
};

BattleManager.displayRewards = function() {
};

ExpGain.BattleManager_isBusy  = BattleManager.isBusy;
BattleManager.isBusy = function() {
    return (ExpGain.BattleManager_isBusy.call(this) || this._expWindow.isBusy());
};

ExpGain.BattleManager_updateEvent = BattleManager.updateEvent;
BattleManager.updateEvent = function() {
    if (this._battlePhase !== 'action') {
        return ExpGain.BattleManager_updateEvent.call(this);
    } else {
        return false;
    }
};

//-----------------------------------------------------------------------------
// Game_Action
//
// The game object class for a battle action.

Game_Action.prototype.attackExpFormula = function() {
    return this.expFormula() || ExpGain.attackExpFormula;
};

Game_Action.prototype.expFormula = function() {
    return this.item().meta['Exp Formula'];
};

Game_Action.prototype.evalExpFormula = function(target) {
    var formula = this.isAttack() ? this.attackExpFormula() : this.expFormula();
    try {
        var item = this.item();
        var a = this.subject();
        var b = target;
        var value = Math.max(eval(formula), 0);
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

ExpGain.Game_Actor_changeExp = Game_Actor.prototype.changeExp;
Game_Actor.prototype.changeExp = function(exp, show) {
    ExpGain.Game_Actor_changeExp.call(this, exp, false);
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
        SoundManager.playOk();
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

Window_Exp.prototype.isBusy = function() {
    return this._actor || this.pause;
};