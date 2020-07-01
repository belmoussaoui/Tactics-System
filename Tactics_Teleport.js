//=============================================================================
// TeleportSkill.js
//=============================================================================

/*:
 * @plugindesc A teleportation skill for an ally or an enemy requested by strik156.
 * Requires: TacticsSystem.js.
 * @author Bilal El Moussaoui (https://twitter.com/arleq1n)
 *
 * @param Teleport Distance Formula
 * @desc The formula of distance for teleport skill.
 * @default a.mat/2
 *
 * @help
 * Use the <Effect:teleport> tag in the note section of a skill to define it as a
 * teleport skill.
 *
 * You can only choose an enemy, an ally or the user as a scope. All other
 * parameters of the skill are defined in the same way as a normal skill.
 *
 * You can also define the distance of the teleportation by a formula that works
 * in the same way as the damage formula by the tag <Formula:a.mat/2>.
 */

var TeleportSkill = TeleportSkill || {};
TeleportSkill.Parameters = PluginManager.parameters('Tactics_Teleport');

TeleportSkill.teleportFormula = String(TeleportSkill.Parameters['Teleport Distance Formula']);

//-----------------------------------------------------------------------------
// BattleManager
//
// The static class that manages battle progress.

TeleportSkill.BattleManager_isActive = BattleManager.isActive;
BattleManager.isActive = function() {
    if (!this._logWindow.isBusy()) {
        switch (this._battlePhase) {
        case 'tile':
            return true;
        }
    }
    return TeleportSkill.BattleManager_isActive.call(this);
};

TeleportSkill.BattleManager_updatePlayerPhase = BattleManager.updatePlayerPhase;
BattleManager.updatePlayerPhase = function() {
    switch (this._battlePhase) {
    case 'tile':
        this.updateTile();
    default:
        TeleportSkill.BattleManager_updatePlayerPhase.call(this);
        break;
    }
};

TeleportSkill.BattleManager_updateTarget = BattleManager.updateTarget;
BattleManager.updateTarget = function() {
    TeleportSkill.BattleManager_updateTarget.call(this);
    var x = $gameSelector.x;
    var y = $gameSelector.y;
    var select = $gameSelector.select();
    var action = this.inputtingAction();
    if ($gameSelector.isOk()) {
        if ($gameMap.isOnTiles(x, y) && action.isTargetValid(select)) {
            if (action.isTeleport()) {
                var distance = action.evalTeleportFormula();
                var event = this._subject.event();
                $gameMap.makeRange(distance, event, true);
                $gameSelector.savePosition();
                this._battlePhase = 'tile';
            }
        }
    }
};

BattleManager.updateTile = function() {
    var x = $gameSelector.x;
    var y = $gameSelector.y;
    var select = $gameSelector.select();
    var action = this.inputtingAction();
    if ($gameSelector.isOk()) {
        if ($gameMap.isOnTiles(x, y) && !select) {
            SoundManager.playOk();
            $gameTemp.setCancel(false);
            action.setPosition(x, y);
            this.setupAction();
            $gameSelector.restorePosition();
        } else {
            SoundManager.playBuzzer();
        }
    }
    if ($gameSelector.isCancelled()) {
        SoundManager.playCancel();
        this.previousTarget();
    }
};

//-----------------------------------------------------------------------------
// Game_Action
//
// The game object class for a battle action.

TeleportSkill.Game_Action_initialize = Game_Action.prototype.initialize;
Game_Action.prototype.initialize = function(subject, forcing) {
    TeleportSkill.Game_Action_initialize.call(this, subject, forcing);
    this._positionX = -1;
    this._positionY = -1;
};

Game_Action.prototype.isTileTarget = function() {
    return this.item().meta['target'];
};

Game_Action.prototype.setPosition = function(x, y) {
    this._positionX = x;
    this._positionY = y;
};

Game_Action.prototype.isTeleport = function() {
    if (this.item()) {
        var param = this.item().meta['Effect'];
        if (param) {
            return param.trim() === 'Teleport';
        }
    }
    return false;
};

Game_Action.prototype.evalTeleportFormula = function(target) {
    try {
        var item = this.item();
        var a = this.subject();
        var b = this.makeTargets().shift() || null;
        var v = $gameVariables._data;
        var value = Math.max(eval(item.meta['Formula'] || TeleportSkill.teleportFormula), 0);
        if (isNaN(value)) value = 0;
        return value;
    } catch (e) {
        return 0;
    }
};

TeleportSkill.Game_Action_apply = Game_Action.prototype.apply;
Game_Action.prototype.apply = function(target) {
    TeleportSkill.Game_Action_apply.call(this, target);
    var result = target.result();
    var effect = this.item().meta['Effect'];
    if (result.isHit() && effect) {
        effect.trim().split(',').forEach(function(effect) {
            this.applyMetaEffect(target, effect);
        }, this);
    }
};

Game_Action.prototype.applyMetaEffect = function(target, effect) {
    switch (effect) {
    case 'Teleport':
        this.itemEffectTeleport(target, effect);
        break;
    }
};

Game_Action.prototype.itemEffectTeleport = function(target, effect) {
    target.setPosition(this._positionX, this._positionY);
    this.makeSuccess(target);
};

TeleportSkill.Game_Action_testApply = Game_Action.prototype.testApply
Game_Action.prototype.testApply = function(target) {
    return TeleportSkill.Game_Action_testApply.call(this, target) || this.isTeleport();
};

TeleportSkill.Game_Action_needCombatScene = Game_Action.prototype.needCombatScene;
Game_Action.prototype.needCombatScene = function() {
    return TeleportSkill.Game_Action_needCombatScene.call(this) && !this.isTeleport();
};