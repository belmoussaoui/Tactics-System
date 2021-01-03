//=============================================================================
// Tactics_Counter.js
//=============================================================================

/*:
 * @plugindesc Counter attack like fire emblem series.
 * Requires: Tactics_Basic.js.
 * @author Bilal El Moussaoui (https://twitter.com/arleq1n)
 */

var CounterAttack = CounterAttack || {};
CounterAttack.Parameters = PluginManager.parameters('Counter_Attack');

//-----------------------------------------------------------------------------
// BattleManager
//
// The static class that manages battle progress.

CounterAttack.BattleManager_updatePhase = BattleManager.updatePhase;
BattleManager.updatePhase = function() {
    switch (this._battlePhase) {
    case 'counter':
        this.updateCounter();
        break;
    default:
        CounterAttack.BattleManager_updatePhase.call(this);
        break;
    } 
};

BattleManager.startAction = function() {
    this._battlePhase = 'action';
    this._subject.useItem(this._action.item());
    this._action.applyGlobal();
    this._logWindow.startAction(this._subject, this._action, [this._targets[this._targetIndex+1]]);
};

BattleManager.startAction = function() {
    this._battlePhase = 'action';
    this._subject.useItem(this._action.item());
    this._action.applyGlobal();
};

BattleManager.invokeAction = function(subject, target) {
    if (target.isAlive()) {
        this._logWindow.startAction(this._subject, this._action, [target]);
        this._logWindow.push('pushBaseLine');
        this.invokeNormalAction(subject, target);
        subject.setLastTarget(target);
        this._logWindow.push('popBaseLine');
        this.invokeRewards(target);
    }
    if (this.isInvokeCounter(subject, target)) {
        this._battlePhase = 'counter';
        this.invokeRewards(target);
    } else {
        this._battlePhase = 'action';
    }
};

BattleManager.isInvokeCounter = function(subject, target) {
    var action = new Game_Action(target);
    action.setAttack();
    return target.canCounter() && action.canCounter(subject, target) && this._targetIndex === 0;
};

BattleManager.updateCounter = function() {
    var target = this._targets[this._targetIndex];
    $gameSelector.performTransfer(this._subject.x, this._subject.y);
    this.invokeCounterAction(this._subject, target);
};

BattleManager.invokeCounterAction = function(subject, target) {
    this._logWindow.push('pushBaseLine');
    this.invokeCounterAttack(subject, target);
    subject.setLastTarget(target);
    this._logWindow.push('popBaseLine');
    this._battlePhase = 'action';
    this._logWindow.endAction(target);
};

Game_Battler.prototype.canCounter = function() {
    return this.isAlive() && this.canMove();
};

//-----------------------------------------------------------------------------
// Game_Action
//
// The game object class for a battle action.

Game_Action.prototype.canCounter = function(subject, target) {
    return this.combatOpponentsUnit(target).contains(subject) && this.item().meta['Can Counter'] !== 'false';
};

Game_Action.prototype.numRepeats = function(targets) {
    var repeats = this.item().repeats;
    var a = this.subject();
    var b = targets[0];
    var action = this;
    if (!this.isForFriend()) {
        if (action.speed() >= b.agi + 4) {
            repeats += 1;
        }
    }
    return Math.floor(repeats);
};

Game_Action.prototype.itemCnt = function(target) {
    return 100;
};

Game_Action.prototype.itemMrf = function(target) {
    return 100;
};

Game_Action.prototype.repeatTargets = function(targets) {
    var repeatedTargets = [];
    var repeats = this.numRepeats(targets);
    for (var i = 0; i < targets.length; i++) {
        var target = targets[i];
        if (target) {
            for (var j = 0; j < repeats; j++) {
                repeatedTargets.push(target);
            }
        }
    }
    return repeatedTargets;
};

Game_Action.prototype.evaluate = function() {
    var value = 0;
    this.itemTargetCandidates().forEach(function(target) {
        var targetValue = this.evaluateWithTarget(target);
        if (this.isForAll()) {
            value += targetValue;
        } else if (targetValue > value) {
            value = targetValue;
            this._targetIndex = target.index();
        }
    }, this);
    value *= this.numRepeats(this.itemTargetCandidates());
    if (value > 0) {
        value += Math.random();
    }
    return value;
};

Game_Action.prototype.speed = function() {
    var agi = this.subject().agi;
    var speed = agi;
    if (this.item()) {
        speed += this.item().speed;
    }
    if (this.isAttack()) {
        speed += this.subject().attackSpeed();
    }
    return speed;
};
