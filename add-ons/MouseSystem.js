//=============================================================================
// MouseSystem.js v0.2.1
//=============================================================================

/*:
 * @plugindesc Add features for control with the mouse.
 * Requires: TacticsSystem.js.
 * @author Bilal El Moussaoui (https://twitter.com/arleq1n)
 *
 * @help
 *
 * For more information, please consult :
 *   - https://forums.rpgmakerweb.com/index.php?threads/tactics-system.97023/
 */

var MouseSystem = MouseSystem || {};
MouseSystem.Parameters = PluginManager.parameters('MouseSystem');

//-----------------------------------------------------------------------------
/**
 * The static class that handles input data from the mouse and touchscreen.
 *
 * @class TouchInput
 */

/**
 * Clears all the touch data.
 *
 * @static
 * @method clear
 */
var TouchInput_clear = TouchInput.clear;
TouchInput.clear = function() {
    TouchInput_clear.call(this);
    this._active = false;
    this._currentX = 0;
    this._currentY = 0;
};

/**
 * @static
 * @method _onMouseMove
 * @param {MouseEvent} event
 * @private
 */
var TouchInput_onMouseMove = TouchInput._onMouseMove;
TouchInput._onMouseMove = function(event) {
    this._currentX = Graphics.pageToCanvasX(event.pageX);
    this._currentY = Graphics.pageToCanvasY(event.pageY);
    this.setActive(true);
    TouchInput_onMouseMove.call(this, event);
};

/**
 * [read-only] The x coordinate on the canvas area.
 *
 * @static
 * @property x
 * @type Number
 */
Object.defineProperty(TouchInput, 'currentX', {
    get: function() {
        return this._currentX;
    },
    configurable: true
});

/**
 * [read-only] The y coordinate on the canvas area.
 *
 * @static
 * @property y
 * @type Number
 */
Object.defineProperty(TouchInput, 'currentY', {
    get: function() {
        return this._currentY;
    },
    configurable: true
});

/**
 * Updates the input data.
 *
 * @static
 * @method update
 */
var Input_update = Input.update;
Input.update = function() {
    for (var name in this._currentState) {
        if (this._currentState[name] && !this._previousState[name]) {
            TouchInput.setActive(false);
        }
    }
    Input_update.call(this);
};

/**
 * @static
 * @method _updateGamepadState
 * @param {Gamepad} gamepad
 * @param {Number} index
 * @private
 */
var Input_updateGamepadState = Input._updateGamepadState
Input._updateGamepadState = function(gamepad) {
    Input_updateGamepadState.call(this, gamepad);
    for (var j = 0; j < newState.length; j++) {
        if (newState[j] !== lastState[j]) {
            var buttonName = this.gamepadMapper[j];
            if (buttonName) {
                TouchInput.setActive(false);
            }
        }
    }
};

/**
 * [read-only] The x coordinate on the canvas area of the latest touch event.
 *
 * @static
 * @property x
 * @type Number
 */
Object.defineProperty(TouchInput, 'x', {
    get: function() {
        return this._currentX;
    },
    configurable: true
});

/**
 * [read-only] The y coordinate on the canvas area of the latest touch event.
 *
 * @static
 * @property y
 * @type Number
 */
Object.defineProperty(TouchInput, 'y', {
    get: function() {
        return this._currentY;
    },
    configurable: true
});

TouchInput.setActive = function(value) {
    this._active = value;
};

TouchInput.isActive = function() {
    return this._active;
};

//-----------------------------------------------------------------------------
// Scene_BattleTS
//
// The scene class of the battle tactics system screen.

Scene_BattleTS.prototype.isMapTouchOk = function() {
    return false;
};

MouseSystem.Scene_BattleTS_updateBattleProcess = Scene_BattleTS.prototype.updateBattleProcess;
Scene_BattleTS.prototype.updateBattleProcess = function() {
    if (!this.isAnyInputWindowActive() || BattleManagerTS.isBattleEnd()) {
        $gameSelectorTS.updateMoveByMouse();
    }
    MouseSystem.Scene_BattleTS_updateBattleProcess.call(this);
};

//-----------------------------------------------------------------------------
// BattleManagerTS
//
// The static class that manages battle progress.

MouseSystem.BattleManagerTS_udpateMove = BattleManagerTS.updateMove;
BattleManagerTS.updateMove = function() {
    MouseSystem.BattleManagerTS_udpateMove.call(this);
    var x = $gameSelectorTS.x;
    var y = $gameSelectorTS.y;
    $gameMap.performScroll(x, y);
};

//-----------------------------------------------------------------------------
// Game_SelectorTS
//
// The game object class for the selector.

Game_SelectorTS.prototype.updateMoveByMouse = function() {
    if (this.canMove() && TouchInput.isActive()) {
        this._x = $gameMap.canvasToMapX(TouchInput.currentX);
        this._y = $gameMap.canvasToMapY(TouchInput.currentY);
        this.executeMove(this.x, this.y);
        this.updateSelect();
    }
};

Game_SelectorTS.prototype.updateScroll = function(lastScrolledX, lastScrolledY) {
    if (this.canMove()) {
        var x1 = lastScrolledX;
        var y1 = lastScrolledY;
        var x2 = this.scrolledX();
        var y2 = this.scrolledY();
        if (TouchInput.isActive()) {
            this.updateScrollTouch();
        } else {
            this.updateScrollInput(x1, y1, x2, y2);
        }
    }
};

Game_SelectorTS.prototype.updateScrollTouch = function() {
    if ($gameMap.adjustY(this.y) > (Graphics.height / $gameMap.tileHeight() - 1) - 1) {
        $gameMap.scrollDown(this.distancePerFrame());
    }
    if ($gameMap.adjustX(this.x) < 1) {
        $gameMap.scrollLeft(this.distancePerFrame());
    }
    if ($gameMap.adjustX(this.x) > (Graphics.width / $gameMap.tileWidth() - 1) - 1) {
        $gameMap.scrollRight(this.distancePerFrame());
    }
    if ($gameMap.adjustY(this.y) < 1) {
        $gameMap.scrollUp(this.distancePerFrame());
    }
};

Game_SelectorTS.prototype.updateScrollInput = function(x1, y1, x2, y2) {
    if (y2 > y1 && y2 > this.centerY()) {
        $gameMap.scrollDown(y2 - y1);
    }
    if (x2 < x1 && x2 < this.centerX()) {
        $gameMap.scrollLeft(x1 - x2);
    }
    if (x2 > x1 && x2 > this.centerX()) {
        $gameMap.scrollRight(x2 - x1);
    }
    if (y2 < y1 && y2 < this.centerY()) {
        $gameMap.scrollUp(y1 - y2);
    }
};

MouseSystem.Game_SelectorTS_canMove = Game_SelectorTS.prototype.canMove;
Game_SelectorTS.prototype.canMove = function() {
    return MouseSystem.Game_SelectorTS_canMove.call(this) && BattleManagerTS.isActive();
};

Game_SelectorTS.prototype.triggerTouchAction = function() {
    return TouchInput.isTriggered();
};

//-----------------------------------------------------------------------------
// Game_Map
//
// The game object class for a map. It contains scrolling and passage
// determination functions.

Game_Map.prototype.roundXWithDirection8 = function(x, d) {
    return this.roundX(x + (d === 0 || d === 2 || d === 8 ? 0 : d % 3 === 0 ? 1 : -1));
};

Game_Map.prototype.roundYWithDirection8 = function(y, d) {
    return this.roundY(y + (d === 0 || d === 4 || d === 6 ? 0 : d <= 3 ? 1 : -1));
};

//-----------------------------------------------------------------------------
// Window_Selectable
//
// The window class with cursor movement and scroll functions.

Window_Selectable.prototype.processTouch = function() {
    if (this.isOpenAndActive()) {
        if (TouchInput.isTriggered() && this.isTouchedInsideFrame()) {
            this._touching = true;
            this.onTouch(true);
        } else if (TouchInput.isCancelled()) {
            if (this.isCancelEnabled()) {
                this.processCancel();
            }
        }
        if (this.isTouchedInsideFrame()) {
            if (TouchInput.isActive()) {
                this.onTouch(false);
            }
        }
    } else {
        this._touching = false;
    }
};