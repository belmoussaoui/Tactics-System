//=============================================================================
// TacticsConfig.js
//=============================================================================

/*:
 * @plugindesc Adds basic configuration data for the player.
 * Requires: TacticsSystem.js
 * @author Bilal El Moussaoui (https://twitter.com/arleq1n)
 *
 * @param Basic Default Configuration
 *
 * @param Cursor Speed
 * @parent Basic Default Configuration
 * @desc The cursor speed. 1: Slow, 2: Normal, 3: Fast
 * @default 2
 * @min 1
 * @max 3
 * @type Number
 *
 * @param Show Map Grid
 * @parent Basic Default Configuration
 * @desc Show the grid of the battle scene.
 * @default true
 * @on Yes
 * @off No
 * @type Boolean
 *
 * @param Auto Turn End
 * @parent Basic Default Configuration
 * @desc Automatically end the player's turn.
 * @default true
 * @on Yes
 * @off No
 * @type Boolean
 *
 * @param Unit Speed
 * @parent Basic Default Configuration
 * @text Unit Speed
 * @desc The moving speed of the units.
 * 1: Slow1, 2: Slow2, 3: Slow3 4: Norm, 5: Fast1, 6: Fast2
 * @default 3
 * @min 1
 * @max 6
 * @type Number
 *
 * @param Show Hp Gauge
 * @parent Basic Default Configuration
 * @desc Show the hp gauge of the units
 * @default true
 * @on Yes
 * @off No
 * @type Boolean
 *
 * @param Text Manager
 *
 * @param Cursor Speed Term
 * @parent Text Manager
 * @desc The cursor speed term.
 * @default Cursor Speed
 *
 * @param Show Map Grid Term
 * @parent Text Manager
 * @desc The show map grid term.
 * @default Show Map Grid
 *
 * @param Auto Turn End Term
 * @parent Text Manager
 * @desc The auto turn end term.
 * @default Auto Turn End
 *
 * @param Unit Speed Term
 * @parent Text Manager
 * @desc The unit speed term.
 * @default Unit Speed
 *
 * @param Show Hp Gauge Term
 * @parent Text Manager
 * @desc The show hp gauge term.
 * @default Show Hp Gauge
 *
 */

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
    case 'false':
        return false;
    default:
        return Boolean(this);
    }
};

var TacticsConfig = TacticsConfig || {};
TacticsConfig.Parameters = PluginManager.parameters('TacticsConfig');

TacticsConfig.cursorSpeed =     Number(TacticsConfig.Parameters['Cursor Speed']);
TacticsConfig.showMapGrid =     TacticsConfig.Parameters['Show Map Grid'].toBoolean();
TacticsConfig.autoTurnEnd =     TacticsConfig.Parameters['Auto Turn End'].toBoolean();
TacticsConfig.unitSpeed =       Number(TacticsConfig.Parameters['Unit Speed']);
TacticsConfig.showHpGauge =     TacticsConfig.Parameters['Show Hp Gauge'].toBoolean();
TacticsConfig.cursorSpeedTerm = String(TacticsConfig.Parameters['Cursor Speed Term']);
TacticsConfig.showMapGridTerm = String(TacticsConfig.Parameters['Show Map Grid Term']);
TacticsConfig.autoTurnEndTerm = String(TacticsConfig.Parameters['Auto Turn End Term']);
TacticsConfig.unitSpeedTerm =   String(TacticsConfig.Parameters['Unit Speed Term']);
TacticsConfig.showHpGaugeTerm = String(TacticsConfig.Parameters['Show Hp Gauge Term']);

//-----------------------------------------------------------------------------
// ConfigManager
//
// The static class that manages the configuration data.

ConfigManager.cursorSpeed3 = TacticsConfig.cursorSpeed;
ConfigManager.showMapGrid =  TacticsConfig.showMapGrid;
ConfigManager.autoTurnEnd =  TacticsConfig.autoTurnEnd;
ConfigManager.unitSpeed5 =   TacticsConfig.unitSpeed;
ConfigManager.showHpGauge =  TacticsConfig.showHpGauge;

TacticsConfig.makeData = ConfigManager.makeData;
ConfigManager.makeData = function() {
    var config = TacticsConfig.makeData.call(this);
    config.autoTurnEnd = this.autoTurnEnd;
    config.showMapGrid = this.showMapGrid;
    config.unitSpeed5 = this.unitSpeed5;
    config.cursorSpeed3 = this.cursorSpeed3;
    config.showHpGauge = this.showHpGauge;
    return config;
};

TacticsConfig.applyData = ConfigManager.applyData;
ConfigManager.applyData = function(config) {
    TacticsConfig.applyData.call(this, config);
    this.autoTurnEnd = this.readFlag(config, 'autoTurnEnd');
    this.showMapGrid = this.readFlag(config, 'showMapGrid');
    this.unitSpeed5 = this.readVariable5(config, 'unitSpeed5');
    this.cursorSpeed3 = this.readVariable3(config, 'cursorSpeed3');
    this.showHpGauge = this.readFlag(config, 'showHpGauge');
};

ConfigManager.readVariable5 = function(config, name) {
    var value = config[name];
    if (value !== undefined) {
        return Number(value).clamp(1, 5);
    }
    return 3;
};

ConfigManager.readVariable3 = function(config, name) {
    var value = config[name];
    if (value !== undefined) {
        return Number(value).clamp(1, 3);
    }
    return 2;
};

ConfigManager.refresh = function() {
    $gameSelectorTS.refresh();
    $gamePartyTS.refresh();
    $gameTroopTS.refresh();
};

//-----------------------------------------------------------------------------
// Window_Options
//
// The window for changing various settings on the options screen.

TacticsConfig.Window_Options_makeCommandList = Window_Options.prototype.makeCommandList;
Window_Options.prototype.makeCommandList = function() {
    TacticsConfig.Window_Options_makeCommandList.call(this);
    this.addTacticsOptions();
};

Window_Options.prototype.addTacticsOptions = function() {
    this.addCommand(TacticsConfig.autoTurnEndTerm, 'autoTurnEnd');
    this.addCommand(TacticsConfig.showMapGridTerm, 'showMapGrid');
    this.addCommand(TacticsConfig.unitSpeedTerm, 'unitSpeed5');
    this.addCommand(TacticsConfig.cursorSpeedTerm, 'cursorSpeed3');
    this.addCommand(TacticsConfig.showHpGaugeTerm, 'showHpGauge');
};

TacticsConfig.Window_Options_statusText  = Window_Options.prototype.statusText ;
Window_Options.prototype.statusText = function(index) {
    var symbol = this.commandSymbol(index);
    var value = this.getConfigValue(symbol);
    if (this.isVariableSymbol(symbol)) {
        return value;
    } else {
        return TacticsConfig.Window_Options_statusText.call(this, index);
    }
};

Window_Options.prototype.isVariableSymbol = function(symbol) {
    return this.isVariable5Symbol(symbol) || this.isVariable3Symbol(symbol);
};

Window_Options.prototype.isVariable5Symbol = function(symbol) {
    return symbol.contains('5');
};

Window_Options.prototype.isVariable3Symbol = function(symbol) {
    return symbol.contains('3');
};

Window_Options.prototype.booleanStatusText = function(value) {
    return value ? 'ON' : 'OFF';
};

Window_Options.prototype.volumeStatusText = function(value) {
    return value + '%';
};

TacticsConfig.Window_Options_processOk = Window_Options.prototype.processOk;
Window_Options.prototype.processOk = function() {
    var index = this.index();
    var symbol = this.commandSymbol(index);
    var value = this.getConfigValue(symbol);
    if (this.isVariable5Symbol(symbol)) {
        value = (value + 1);
        if (value > 5) {
            value = 1;
        }
        this.changeValue(symbol, value);
    }  else if (this.isVariable3Symbol(symbol)) {
        value = (value + 1);
        if (value > 3) {
            value = 1;
        }
        this.changeValue(symbol, value);
    } else {
        TacticsConfig.Window_Options_processOk.call(this);
    }
};

TacticsConfig.Window_Options_cursorRight = Window_Options.prototype.cursorRight;
Window_Options.prototype.cursorRight = function(wrap) {
    var index = this.index();
    var symbol = this.commandSymbol(index);
    var value = this.getConfigValue(symbol);
    if (this.isVariable5Symbol(symbol)) {
        value++;
        value = value.clamp(1, 5);
        this.changeValue(symbol, value);
    } else if (this.isVariable3Symbol(symbol)) {
        value++;
        value = value.clamp(1, 3);
        this.changeValue(symbol, value);
    } else {
         TacticsConfig.Window_Options_cursorRight.call(this, wrap);
    }
};

TacticsConfig.Window_Options_cursorLeft = Window_Options.prototype.cursorLeft;
Window_Options.prototype.cursorLeft = function(wrap) {
    var index = this.index();
    var symbol = this.commandSymbol(index);
    var value = this.getConfigValue(symbol);
    if (this.isVariable5Symbol(symbol)) {
        value--;
        value = value.clamp(1, 5);
        this.changeValue(symbol, value);
    } else if (this.isVariable3Symbol(symbol)) {
        value--;
        value = value.clamp(1, 3);
        this.changeValue(symbol, value);
    } else {
         TacticsConfig.Window_Options_cursorLeft.call(this, wrap);
    }
};

Window_Options.prototype.getConfigValue = function(symbol) {
    return ConfigManager[symbol];
};

Window_Options.prototype.setConfigValue = function(symbol, volume) {
    ConfigManager[symbol] = volume;
};

//-----------------------------------------------------------------------------
// Scene_Options
//
// The scene class of the options screen.

Scene_Options.prototype.terminate = function() {
    Scene_MenuBase.prototype.terminate.call(this);
    ConfigManager.save();
    ConfigManager.refresh();
};

//-----------------------------------------------------------------------------
// BattleManagerTS
//
// The static class that manages battle progress.

TacticsConfig.BattleManagerTS_updateStartPlayer = BattleManagerTS.updateStartPlayer;
BattleManagerTS.updateStartPlayer = function() {
    TacticsConfig.BattleManagerTS_updateStartPlayer.call(this);
    if (!this._subject && !$gamePartyTS.isPhase()) {
        if (!ConfigManager.autoTurnEnd) {
            $gameSelectorTS.setTransparent(false);
            this._battlePhase = 'explore';
        }
    }
};

//-----------------------------------------------------------------------------
// Game_Battler
//
// The superclass of Game_Actor and Game_Enemy. It contains methods for sprites
// and actions.

TacticsConfig.Game_Battler_setupEvent = Game_Battler.prototype.setupEvent;
Game_Battler.prototype.setupEvent = function(eventId) {
    TacticsConfig.Game_Battler_setupEvent.call(this, eventId);
    this.event().setMoveSpeed(ConfigManager.unitSpeed5);
};

Game_Battler.prototype.refreshConfig = function() {
    this.event().setMoveSpeed(ConfigManager.unitSpeed5);
};

//-----------------------------------------------------------------------------
// Game_UnitTS
//
// The superclass of Game_PartyTS and Game_TroopTS.

Game_UnitTS.prototype.refresh = function() {
    this.members().forEach(function(member) {
        member.refreshConfig();
    });
};

//-----------------------------------------------------------------------------
// Game_SelectorTS
//
// The game object class for the selector.

Game_SelectorTS.prototype.refresh = function() {
    this._speed = ConfigManager.cursorSpeed3 + 3;
};

TacticsConfig.Game_SelectorTS_initMembers = Game_SelectorTS.prototype.initMembers;
Game_SelectorTS.prototype.initMembers = function() {
    TacticsConfig.Game_SelectorTS_initMembers.call(this);
    this.refresh();
};

//-----------------------------------------------------------------------------
// Sprite_GridTS
//
// The sprite for displaying a grid.

TacticsConfig.Sprite_GridTS_update = Sprite_GridTS.prototype.update;
Sprite_GridTS.prototype.update = function() {
    TacticsConfig.Sprite_GridTS_update.call(this);
    if (!ConfigManager.showMapGrid) {
        this.opacity = 0;
    } else {
        this.opacity = TacticsSystem.gridOpacity || 60;
    }
};

//-----------------------------------------------------------------------------
// Sprite_HpGaugeTS
//
// The sprite for displaying the hp gauge.

TacticsConfig.Sprite_HpGaugeTS_update = Sprite_HpGaugeTS.prototype.update;
Sprite_HpGaugeTS.prototype.update = function(battler) {
    TacticsConfig.Sprite_HpGaugeTS_update.call(this, battler)
    if (!ConfigManager.showHpGauge) {
        this.bitmap.clear();
    }
};