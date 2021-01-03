//=============================================================================
// Tactics_PrepaPhase.js
//=============================================================================

/*:
 * @plugindesc Add-on to manage unit party before the battle.
 * Requires: Tactics_Basic.js.
 * 
 * @author Bilal El Moussaoui (https://twitter.com/arleq1n)
 *
 * @param Start Scope Color
 * @desc The color to display the start position.
 * @default #FFD700
 *
 * @param Start Battle Term
 * @desc The start battle term.
 * @default Start Battle
 *
 * @param Preparation Phase Id
 * @desc The switch id to set if it's the preparation phase.
 * @default 4
 * @type variable
 *
 * @param Open Prepa Menu
 * @desc Open the preparation menu automatically first in the battle scene.
 * @default true
 * @type boolean
 *
 * @help
 * For more information, please consult :
 *   - https://forums.rpgmakerweb.com/index.php?threads/tactics-system-1-0.117600/
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
    case 'false':
        return false;
    default:
        return true;
    }
};

var BattlePreparation = BattlePreparation || {};
BattlePreparation.Parameters = PluginManager.parameters('Tactics_Prepa');

BattlePreparation.startScopeColor =    String(BattlePreparation.Parameters['Start Scope Color']);
BattlePreparation.startBattleTerm =    String(BattlePreparation.Parameters['Start Battle Term']);
BattlePreparation.preparationPhaseId = Number(BattlePreparation.Parameters['Preparation Phase Id']);
BattlePreparation.openPrepaMenu =      String(BattlePreparation.Parameters['Open Prepa Menu']).toBoolean();

//-----------------------------------------------------------------------------
// Game_Interpreter
//
// The interpreter for running event commands.

BattlePreparation.Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
    BattlePreparation.Game_Interpreter_pluginCommand.call(this, command, args);
    switch(command) {
    case 'BattlePreparation.MenuEnable':
        this.prepaMenuEnable();
        break;
    case 'BattlePreparation.MenuDisable':
        this.prepaMenuDisable();
        break;
    case 'BattlePreparation.MenuOpen':
        this.prepaMenuOpen();
        break;
     case 'BattlePreparation.MenuClose':
        this.prepaMenuClose();
        break;
    }
};


Game_Interpreter.prototype.prepaMenuEnable = function() {
    $gameSystem.enablePrepa();
};

Game_Interpreter.prototype.prepaMenuDisable = function() {
    $gameSystem.disablePrepa();
};

Game_Interpreter.prototype.prepaMenuOpen = function() {
    
};

Game_Interpreter.prototype.prepaMenuClose = function() {
    
};

//-----------------------------------------------------------------------------
// Scene_Battle
//
// The scene class of the tactics screen.

BattlePreparation.Scene_Battle_start = Scene_Battle.prototype.start;
Scene_Battle.prototype.start = function() {
    BattlePreparation.Scene_Battle_start.call(this);
    TacticsSystem.Game_Screen_onBattleStart.call($gameScreen);
    if (this._registerWindow2) {
        this._registerWindow2.refresh();
    }
    BattleManager.setWindowStatus(this._formationWindow);
};

BattlePreparation.Scene_Battle_createAllWindows = Scene_Battle.prototype.createAllWindows;
Scene_Battle.prototype.createAllWindows = function() {
    BattlePreparation.Scene_Battle_createAllWindows.call(this);
    this.createFormationWindow();
    if (BattleManager.isPrepaPhase()) {
        this._registerWindow1 = this._mapWindow;
        this._registerWindow2 = this._statusWindow;
        this._mapWindow = this._prepaWindow;
        this._statusWindow = this._formationWindow;
        if (BattlePreparation.openPrepaMenu) {
            this.callMenu();
            this.menuCalling = false;
        }
    } else {
        this._prepaWindow.close();
        this._formationWindow.close();
        this._mapWindow.refresh();
    }
};

BattlePreparation.Scene_Battle_createLogWindow = Scene_Battle.prototype.createLogWindow;
Scene_Battle.prototype.createLogWindow = function() {
    BattlePreparation.Scene_Battle_createLogWindow.call(this);
    this.createPreparationWindow();
};

Scene_Battle.prototype.createLogWindowBefore = function() {
    this._logWindow = new Window_BattleLog();
    this.addWindow(this._logWindow);
};

Scene_Battle.prototype.createPreparationWindow = function() {
    this._prepaWindow = new Window_TacticsPrepa(0, 0);
    this._prepaWindow.setHandler('startBattle', this.commandStartBattle.bind(this));
    this._prepaWindow.setHandler('equip',       this.commandPersonal.bind(this));
    this._prepaWindow.setHandler('status',      this.commandPersonal.bind(this));
    this._prepaWindow.setHandler('formation',   this.commandFormation.bind(this));
    this._prepaWindow.setHandler('options',     this.commandOptions.bind(this));
    this._prepaWindow.setHandler('gameEnd',     this.commandGameEnd.bind(this));
    this._prepaWindow.setHandler('cancel',      this.commandCancelMapWindow.bind(this));
    this.addWindow(this._prepaWindow);
};

Scene_Battle.prototype.createFormationWindow = function() {
    var wx = this._prepaWindow.x + this._prepaWindow.width;
    this._formationWindow = new Window_TacticsFormation(wx, 0);
    this._formationWindow.reserveFaceImages();
    this._formationWindow.hide();
    this.addWindow(this._formationWindow);
};

Scene_Battle.prototype.commandStartBattle = function() {
    SoundManager.playOk();
    BattleManager.onStartBattle();
    this.commandCancelMapWindow();
    this._mapWindow = this._registerWindow1;
    this._statusWindow = this._registerWindow2;
};

Scene_Battle.prototype.commandFormation = function() {
    this._formationWindow.setFormationMode(true);
    this._formationWindow.selectLast();
    this._formationWindow.activate();
    this._formationWindow.setHandler('ok',     this.onFormationOk.bind(this));
    this._formationWindow.setHandler('cancel', this.onFormationCancel.bind(this));
    this._formationWindow.show();
};

Scene_Battle.prototype.onFormationOk = function() {
    var index = this._formationWindow.index();
    var actor = $gameParty.members()[index];
    var pendingIndex = this._formationWindow.pendingIndex();
    if (pendingIndex >= 0) {
        $gamePartyTs.swapOrder(index, pendingIndex);
        this._formationWindow.setPendingIndex(-1);
        this._formationWindow.redrawItem(index);
    } else {
        this._formationWindow.setPendingIndex(index);
    }
    this._formationWindow.activate();
};

Scene_Battle.prototype.onFormationCancel = function() {
    if (this._formationWindow.pendingIndex() >= 0) {
        this._formationWindow.setPendingIndex(-1);
        this._formationWindow.activate();
    } else {
        this._formationWindow.deselect();
        this._mapWindow.activate();
    }
    var select = $gameSelector.select();
    if (select && select.isAlive()) {
        this._actorWindow.open(select);
    } else {
        this._actorWindow.close();
    }
};

BattlePreparation.Scene_Battle_refreshStatus = Scene_Battle.prototype.refreshStatus;
Scene_Battle.prototype.refreshStatus = function() {
    BattlePreparation.Scene_Battle_refreshStatus.call(this);
};

//-----------------------------------------------------------------------------
// BattleManager
//
// The static class that manages tactics progress.

BattleManager.onStartBattle = function() {
    this._phase = 'startPhase';
    this._battlePhase = '';
    $gameMap.clearStartTiles();
    this.startBattle();
};

BattlePreparation.BattleManager_startBattle = BattleManager.startBattle;
BattleManager.startBattle = function() {
    if (!this.isPrepaPhase()) {
        BattlePreparation.BattleManager_startBattle.call(this);
    }
};

BattleManager.isPrepaPhase = function () {
    return this._phase === 'preparationPhase';
};

BattleManager.setWindowStatus = function (statusWindow) {
    this._formationWindow = statusWindow;
};

BattlePreparation.BattleManager_createGameObjects = BattleManager.createGameObjects;
BattleManager.createGameObjects = function() {
    BattlePreparation.BattleManager_createGameObjects.call(this);
    var isStartPrepa = false;
    for (var i = 0; i < $gameMap.events().length; i++) {
        var event = $gameMap.events()[i];
        if (event.tparam('Start')) {
            isStartPrepa = true;
            $gameMap.addStartTile(event);
            $gamePartyTs.addAutoActor(event);
        }
    }
    if (isStartPrepa) {
        this.startPrepaPhase();
    }
    $gamePartyTs.setupMembers();
};

BattleManager.startPrepaPhase = function() {
    this._phase = 'preparationPhase';
    this._battlePhase = 'explore';
    $gameSelector.setTransparent(false);
    $gameTroopTs.onTurnStart();
    $gamePartyTs.onTurnStart();
    this.refreshMoveTiles();
};

BattlePreparation.BattleManager_isActive = BattleManager.isActive;
BattleManager.isActive = function() {
    if (!this._logWindow.isBusy()) {
        switch (this._phase) {
        case 'preparationPhase':
            return true;
        }
    }
    return BattlePreparation.BattleManager_isActive.call(this);
};

BattlePreparation.BattleManager_update = BattleManager.update;
BattleManager.update = function() {
    if (!this.isBusy() && !this.updateEvent()) {
        switch (this._phase) {
        case 'preparationPhase':
            this.updatePreparationPhase();
            break;
        default:
            BattlePreparation.BattleManager_update.call(this);
            break;
        }
    }
};

BattleManager.updatePreparationPhase = function() {
    switch (this._battlePhase) {
    case 'explore':
        this.updateStartExplore();
        break;
    case 'select':
        this.updateStartSelect();
        break;
    }
};

BattleManager.updateStartExplore = function() {
    this.refreshSubject();
    var x = $gameSelector.x;
    var y = $gameSelector.y;
    if ($gameMap.isOnStartTiles(x, y)) {
        if ($gameSelector.isOk()) {
            SoundManager.playOk();
            this.selectPending();
        }
    }
}

BattleManager.selectPending = function() {
    this._battlePhase = 'select';
    $gameSelector.updateSelect();
    this._subject = $gameSelector.select();
    var x = $gameSelector.x;
    var y = $gameSelector.y;
    if (this._subject) {
        this._subject.performSelect();
    } else {
        this._subject = $gameMap.eventIdXy(x, y);
    }
};

BattleManager.updateStartSelect = function() {
    this.refreshSubstitute();
    var x = $gameSelector.x;
    var y = $gameSelector.y;
    if ($gameMap.isOnStartTiles(x, y)) {
        if ($gameSelector.isOk()) {
            SoundManager.playOk();
            this.substituteBattler();
        }
    }
};

BattleManager.substituteBattler = function() {
    var x = this._subject.x;
    var y = this._subject.y;
    var eventId1 = $gameMap.eventIdXy(x, y);
    var index1 = $gamePartyTs.eventIndex(eventId1);
    
    x = $gameSelector.x;
    y = $gameSelector.y;
    eventId1 = $gameMap.eventIdXy(x, y);
    var index2 = $gamePartyTs.eventIndex(eventId1);
    
    $gamePartyTs.swapOrder(index1, index2);
    this._enemyWindow.close();
    this._formationWindow.redrawItem(index1);
    this._formationWindow.redrawItem(index2);
    this._battlePhase = 'explore';
}

BattleManager.refreshSubstitute = function() {
    var select = $gameSelector.select();
    if (select && select.isAlive()) {
        this._enemyWindow.open(select);
    } else {
        this._enemyWindow.close();
    }
};

BattlePreparation.BattleManager_updateEvent = BattleManager.updateEvent;
BattleManager.updateEvent = function() {
    BattlePreparation.BattleManager_updateEvent.call(this);
    switch (this._phase) {
    case 'preparationPhase':
        $gameSwitches.update();
        $gameVariables.update();
    }
};

//-----------------------------------------------------------------------------
// Game_System
//
// The game object class for the system data.

BattlePreparation.Game_System_initialize = Game_System.prototype.initialize;
Game_System.prototype.initialize = function() {
    this._prepaEnabled = true;
    BattlePreparation.Game_System_initialize.call(this);
};

Game_System.prototype.isPrepaEnabled = function() {
    return this._prepaEnabled;
};

Game_System.prototype.disablePrepa = function() {
    this._prepaEnabled = false;
};

Game_System.prototype.enablePrepa = function() {
    this._prepaEnabled = true;
};

//-----------------------------------------------------------------------------
// Game_PartyTs
//
// The game object class for a party tactics.

Game_PartyTs.prototype.initialize = function() {
    Game_UnitTs.prototype.initialize.call(this);
    this.clear();
};

BattlePreparation.Game_PartyTs_clear = Game_PartyTs.prototype.clear;
Game_PartyTs.prototype.clear = function() {
    BattlePreparation.Game_PartyTs_clear.call(this);
    this._events = [];
    this._fixedMembers = 0;
};

Game_PartyTs.prototype.addAutoActor = function(event) {
    var actorId = $gameParty.firstMemberAvailable();
    if (actorId !== -1) {
        this.addActor(actorId, event, true);
        this._fixedMembers -= 1;
    } else {
        this._maxBattleMembers += 1;
        this._actors.push(-1);
        this._events.push(event.eventId());
    }
};

Game_PartyTs.prototype.eventIndex = function(eventId) {
    return this._events.indexOf(eventId);
};

BattlePreparation.Game_PartyTs_addActor = Game_PartyTs.prototype.addActor;
Game_PartyTs.prototype.addActor = function(actorId, event, needRefresh) {
    if (!this._actors.contains(actorId)) {
        this._fixedMembers += 1;
        var eventId = event.eventId();
        this._events.push(eventId);
    };
    BattlePreparation.Game_PartyTs_addActor.call(this, actorId, event, needRefresh);
};

Game_PartyTs.prototype.index = function(actorId) {
    return this._actors.indexOf(actorId);
};

BattlePreparation.Game_Party_members = Game_PartyTs.prototype.members;
Game_PartyTs.prototype.members = function() {
    return this.allMembers().slice(0, this._maxBattleMembers).filter(function(actor) {
        return actor;
    });
};

Game_PartyTs.prototype.allMembers = function() {
    return this._actors.map(function(id) {
        return $gameActors.actor(id);
    });
};

Game_PartyTs.prototype.setupMembers = function() {
    this._actors.concat($gameParty.actors()).forEach(function(actorId) {
        if (this._actors.indexOf(actorId) == -1) {
            this._actors.push(actorId);
        }
    }, this);
};

Game_PartyTs.prototype.swapOrder = function(index1, index2) {
    if (this.isBattleMember(index1) && this.isBattleMember(index2)) {
        this.swapPosition(index1, index2);
    } else {
        this.insertInBattleMembers(index1, index2);
    }
    var temp = this._actors[index1];
    this._actors[index1] = this._actors[index2];
    this._actors[index2] = temp;
    $gamePlayer.refresh();
};

Game_PartyTs.prototype.isBattleMember = function(index) {
    return index < this._maxBattleMembers;
};

Game_PartyTs.prototype.swapPosition = function(index1, index2) {
    var event1 = $gameMap.event(this._events[index1]);
    var event2 = $gameMap.event(this._events[index2]);
    var x = event1.x;
    var y = event1.y;
    event1.setPosition(event2.x, event2.y);
    event2.setPosition(x, y);
    var temp = this._events[index1];
    this._events[index1] = this._events[index2];
    this._events[index2] = temp;
};

Game_PartyTs.prototype.insertInBattleMembers = function(index1, index2) {
    var actor1 = this.allMembers()[index1];
    var actor2 = this.allMembers()[index2];
    if (index2 < this._maxBattleMembers && actor1) {
        actor1.setupEvent(this._events[index2]);
        actor1.refreshImage();
    }
    if (index1 < this._maxBattleMembers && actor2) {
        actor2.setupEvent(this._events[index1]);
        actor2.refreshImage();
    }
};

Game_PartyTs.prototype.isFixedMember = function(index) {
    return index < this._fixedMembers;
}

//-----------------------------------------------------------------------------
// Game_Party
//
// The game object class for the party. Information such as gold and items is
// included.

Game_Party.prototype.firstMemberAvailable = function() {
    for (var i = 0; i < this._actors.length; i++) {
        var actorId = this._actors[i];
        if (!$gamePartyTs.actors().contains(actorId)) {
            return actorId;
        }
    }
    return -1;
};

Game_Party.prototype.actors = function() {
    return this._actors;
};

//-----------------------------------------------------------------------------
// Window_TacticsPrepa
//
// The window for displaying essential commands for progressing though the game.

function Window_TacticsPrepa() {
    this.initialize.apply(this, arguments);
}

Window_TacticsPrepa.prototype = Object.create(Window_MenuCommand.prototype);
Window_TacticsPrepa.prototype.constructor = Window_TacticsPrepa;

Window_TacticsPrepa.prototype.initialize = function(x, y) {
    Window_MenuCommand.prototype.initialize.call(this, x, y);
    this.selectLast();
    this.hide();
    this.deactivate();
};

Window_TacticsPrepa._lastCommandSymbol = null;

Window_TacticsPrepa.initCommandPosition = function() {
    this._lastCommandSymbol = null;
};

Window_TacticsPrepa.prototype.windowWidth = function() {
    return 240;
};

Window_TacticsPrepa.prototype.numVisibleRows = function() {
    return this.maxItems();
};

Window_TacticsPrepa.prototype.addMainCommands = function() {
    var enabled = this.areMainCommandsEnabled();
    this.addCommand(BattlePreparation.startBattleTerm, 'startBattle');
    if (this.needsCommand('equip')) {
        this.addCommand(TextManager.equip, 'equip', enabled);
    }
    if (this.needsCommand('status')) {
        this.addCommand(TextManager.status, 'status', enabled);
    }
};

Window_TacticsPrepa.prototype.addOriginalCommands = function() {
};

Window_TacticsPrepa.prototype.addSaveCommand = function() {
};

Window_TacticsPrepa.prototype.selectLast = function() {
    this.selectSymbol(Window_TacticsPrepa._lastCommandSymbol);
};

//-----------------------------------------------------------------------------
// Window_MenuStatusTS
//
// The window for displaying party member status on the menu screen.

function Window_TacticsFormation() {
    this.initialize.apply(this, arguments);
}

Window_TacticsFormation.prototype = Object.create(Window_MenuStatus.prototype);
Window_TacticsFormation.prototype.constructor = Window_TacticsFormation;

Window_TacticsFormation.prototype.maxItems = function() {
    return $gamePartyTs.allMembers().length;
};

Window_TacticsFormation.prototype.processOk = function() {
    Window_Selectable.prototype.processOk.call(this);
    var actor = $gamePartyTs.allMembers()[this.index()];
    if (actor) {
        $gameParty.setMenuActor($gamePartyTs.allMembers()[this.index()]);
    }
};

Window_TacticsFormation.prototype.isCurrentItemEnabled = function() {
    if (this._formationMode) {
        var actor = $gamePartyTs.allMembers()[this.index()];
        return !$gamePartyTs.isFixedMember(this.index());
    } else {
        return true;
    }
};

Window_TacticsFormation.prototype.selectLast = function() {
    this.select($gameParty.menuActor().index() || 0);
};

Window_TacticsFormation.prototype.drawItemImage = function(index) {
    var actor = $gamePartyTs.allMembers()[index];
    var rect = this.itemRect(index);
    if (actor) {
        this.changePaintOpacity($gamePartyTs.isBattleMember(index));
        this.drawActorFace(actor, rect.x + 1, rect.y + 1, Window_Base._faceWidth, Window_Base._faceHeight);
        this.changePaintOpacity(true);
    }
};

Window_TacticsFormation.prototype.drawItemStatus = function(index) {
    var actor = $gamePartyTs.allMembers()[index];
    var rect = this.itemRect(index);
    if (actor) {
        var x = rect.x + 162;
        var y = rect.y + rect.height / 2 - this.lineHeight() * 1.5;
        var width = rect.width - x - this.textPadding();
        this.drawActorSimpleStatus(actor, x, y, width);
    }
};

//-----------------------------------------------------------------------------
// Game_Map
//
// The game object class for a map. It contains scrolling and passage
// determination functions.

BattlePreparation.Game_Map_intialize = Game_Map.prototype.initialize;
Game_Map.prototype.initialize = function() {
    BattlePreparation.Game_Map_intialize.call(this);
    this._startTiles = [];
};

Game_Map.prototype.clearStartTiles = function() {
    this._startTiles = [];
};

Game_Map.prototype.startTiles = function() {
    return this._startTiles;
};

Game_Map.prototype.addStartTile = function(event) {
    var x = event.x;
    var y = event.y;
    var tile = $gameMap.tile(x, y);
    this._startTiles.push(tile);
};

Game_Map.prototype.isOnStartTiles = function(x, y) {
    return this._startTiles.contains(this.tile(x, y));
};

Game_Map.prototype.setStartColor = function() {
    this._color = TacticsSystem.moveScopeColor;
};


//-----------------------------------------------------------------------------
// Game_Switches
//
// The game object class for switches.

BattlePreparation.Game_Switches_updatePhase = Game_Switches.prototype.updatePhase;
Game_Switches.prototype.updatePhase = function() {
    BattlePreparation.Game_Switches_updatePhase.call(this);
    this.setValue(BattlePreparation.preparationPhaseId, false);
    switch (BattleManager.phase()) {
    case 'preparationPhase':
        this.setValue(BattlePreparation.preparationPhaseId, true);
        break;
    }
};

//-----------------------------------------------------------------------------
// Spriteset_Tactics
//
// The set of sprites on the tactics screen.

BattlePreparation.Spriteset_Tactics_createBaseTiles = Spriteset_Tactics.prototype.createBaseTiles;
Spriteset_Tactics.prototype.createBaseTiles = function() {
    BattlePreparation.Spriteset_Tactics_createBaseTiles.call(this);
    this._startTilesSprite = this.createTiles(BattlePreparation.startScopeColor);
};

BattlePreparation.Spriteset_Tactics_updateTiles = Spriteset_Tactics.prototype.updateTiles;
Spriteset_Tactics.prototype.updateTiles = function() {
    BattlePreparation.Spriteset_Tactics_updateTiles.call(this);
    if (this._startTiles !== $gameMap.startTiles()) {
        this.updateStartTiles();
    }
};

Spriteset_Tactics.prototype.updateStartTiles = function() {
    this._startTiles = $gameMap.startTiles();
    var width = $gameMap.width();
    var height = $gameMap.height();
    this._startTilesSprite.bitmap.clearRect(0, 0, width * 48, height * 48);
    this._rangeTilesSprite.color = BattlePreparation.startScopeColor;
    this._startTiles.forEach(function(tile) {
        var x = $gameMap.positionTileX(tile) * 48;
        var y = $gameMap.positionTileY(tile) * 48;
        var color = this._startTilesSprite.color;
        this._startTilesSprite.bitmap.fillRect(x + 2, y + 2, 44, 44, color);
    }, this);
};