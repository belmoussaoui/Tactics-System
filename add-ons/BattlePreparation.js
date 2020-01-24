//=============================================================================
// BattlePreparation.js v1.0
//=============================================================================

/*:
 * @plugindesc Add-on to manage unit party before the battle.
 * Requires: TacticsSystem.js.
 * 
 * @author Bilal El Moussaoui (https://twitter.com/arleq1n)
 *
 * @param start scope color
 * @desc The color to display the start position.
 * @default #FFD700
 *
 * @param start battle term
 * @desc The start battle term.
 * @default Start Battle
 *
 * @param start battle term
 * @desc The start battle term.
 * @default Start Battle
 *
 * @param preparation phase id
 * @desc The switch id to set if it's the preparation phase.
 * @default 4
 *
 * @help
 *
 * For more information, please consult :
 *   - https://forums.rpgmakerweb.com/index.php?threads/tactics-system.97023/
 */

var BattlePreparation = BattlePreparation || {};
BattlePreparation.Parameters = PluginManager.parameters('BattlePreparation');

BattlePreparation.startScopeColor =    String(BattlePreparation.Parameters['start scope color']);
BattlePreparation.startBattleTerm =    String(BattlePreparation.Parameters['start battle term']);
BattlePreparation.preparationPhaseId = Number(BattlePreparation.Parameters['preparation phase id']);

BattlePreparation.Scene_BattleTS_start = Scene_BattleTS.prototype.start;
Scene_BattleTS.prototype.start = function() {
    BattlePreparation.Scene_BattleTS_start.call(this);
    this._statusWindow2.refresh();
    BattleManagerTS.setWindowStatus(this._statusWindow2);
};

BattlePreparation.Scene_BattleTS_createAllWindows = Scene_BattleTS.prototype.createAllWindows;
Scene_BattleTS.prototype.createAllWindows = function() {
    this.createLogWindowBefore();
    this.createPreparationWindow();
    BattlePreparation.Scene_BattleTS_createAllWindows.call(this);
    this.createFormationWindow();
    if (BattleManagerTS._phase === 'preparationPhase') {
        this._registerWindow = this._mapWindow;
        this._mapWindow = this._formationWindow;
    } else {
        this._mapWindow.refresh();
    }
};

Scene_BattleTS.prototype.createLogWindow = function() {
    // Need to create log window before preparation window.
    // Else create preparation window after and hide when status window is opened.
};

Scene_BattleTS.prototype.createLogWindowBefore = function() {
    this._logWindow = new Window_BattleLog();
    this.addWindow(this._logWindow);
};

Scene_BattleTS.prototype.createPreparationWindow = function() {
    this._formationWindow = new Window_Formation(0, 0);
    this._formationWindow.x = Graphics.width/2 - this._formationWindow.width/2;
    this._formationWindow.y = Graphics.height/2 - this._formationWindow.height/2;
    this._formationWindow.setHandler('startBattle', this.commandStartBattle.bind(this));
    this._formationWindow.setHandler('equip',       this.commandPersonal.bind(this));
    this._formationWindow.setHandler('status',      this.commandPersonal.bind(this));
    this._formationWindow.setHandler('formation',   this.commandFormation.bind(this));
    this._formationWindow.setHandler('options',     this.commandOptions.bind(this));
    this._formationWindow.setHandler('gameEnd',     this.commandGameEnd.bind(this));
    this._formationWindow.setHandler('cancel',      this.commandCancelMapWindow.bind(this));
    this.addWindow(this._formationWindow);
};

Scene_BattleTS.prototype.createFormationWindow = function() {
    this._statusWindow2 = new Window_FormationTS(0, 0);
    this._statusWindow2.x = Graphics.width/2 - this._statusWindow2.width/2;
    this._statusWindow2.reserveFaceImages();
    this._statusWindow2.hide();
    this.addWindow(this._statusWindow2);
};

Scene_BattleTS.prototype.commandStartBattle = function() {
    SoundManager.playOk();
    BattleManagerTS.onStartBattle();
    this.commandCancelMapWindow();
    this._mapWindow = this._registerWindow;
};

Scene_BattleTS.prototype.commandFormation = function() {
    this._statusWindow2.setFormationMode(true);
    this._statusWindow2.selectLast();
    this._statusWindow2.activate();
    this._statusWindow2.setHandler('ok',     this.onFormationOk.bind(this));
    this._statusWindow2.setHandler('cancel', this.onFormationCancel.bind(this));
    this._statusWindow2.show();
};

Scene_BattleTS.prototype.onFormationOk = function() {
    var index = this._statusWindow2.index();
    var actor = $gameParty.members()[index];
    var pendingIndex = this._statusWindow2.pendingIndex();
    if (pendingIndex >= 0) {
        $gamePartyTS.swapOrder(index, pendingIndex);
        this._statusWindow2.setPendingIndex(-1);
        this._statusWindow2.redrawItem(index);
    } else {
        this._statusWindow2.setPendingIndex(index);
    }
    this._statusWindow2.activate();
};

Scene_BattleTS.prototype.onFormationCancel = function() {
    if (this._statusWindow2.pendingIndex() >= 0) {
        this._statusWindow2.setPendingIndex(-1);
        this._statusWindow2.activate();
    } else {
        this._statusWindow2.deselect();
        this._statusWindow2.hide();
        this._mapWindow.activate();
    }
    var select = $gameSelectorTS.select();
    if (select && select.isAlive()) {
        this._subjectWindow.open(select);
    } else {
        this._subjectWindow.close();
    }
};

Scene_BattleTS.prototype.isAnyInputWindowActive = function() {
    return (this._actorCommandWindow.active ||
            this._skillWindow.active ||
            this._itemWindow.active ||
            this._mapWindow.active ||
            this._statusWindow.active ||
            this._statusWindow2.active);
};


BattlePreparation.Scene_BattleTS_refreshStatus = Scene_BattleTS.prototype.refreshStatus;
Scene_BattleTS.prototype.refreshStatus = function() {
    BattlePreparation.Scene_BattleTS_refreshStatus.call(this);
};

//-----------------------------------------------------------------------------
// BattleManagerTS
//
// The static class that manages battle progress.

BattleManagerTS.setWindowStatus = function (window1) {
    this._statusWindow2 = window1;
};

BattlePreparation.BattleManagerTS_createGameObjects = BattleManagerTS.createGameObjects;
BattleManagerTS.createGameObjects = function() {
    BattlePreparation.BattleManagerTS_createGameObjects.call(this);
    var isBattlePreparation = false;
    for (var i = 0; i < $gameMap.events().length; i++) {
        var event = $gameMap.events()[i];
        if (event.tparam('start')) {
            isBattlePreparation = true;
            this.addStartTile(event);
            this.addAutoGameParty(event);
        }
    }
    if (isBattlePreparation) {
        this._phase = 'preparationPhase';
        this._battlePhase = 'explore';
        $gameSelectorTS.setTransparent(false);
        $gameTroopTS.onTurnStart();
        $gamePartyTS.onTurnStart();
    }
    $gamePartyTS.setupMembers();
};

BattleManagerTS.addAutoGameParty = function(event) {
    $gamePartyTS.addAutoActor(event);
};

BattleManagerTS.onStartBattle = function() {
    this._phase = 'startPhase';
    $gameMap.clearStartTiles();
};

BattleManagerTS.addStartTile = function(event) {
    var x = event.x;
    var y = event.y;
    var tile = $gameMap.tile(x, y);
    $gameMap.addStartTile(tile);
};

BattlePreparation.BattleManagerTS_isActive = BattleManagerTS.isActive;
BattleManagerTS.isActive = function() {
    if (!this._logWindow.isBusy()) {
        switch (this._phase) {
        case 'preparationPhase':
            return true;
        }
    }
    return BattlePreparation.BattleManagerTS_isActive.call(this);
};

BattlePreparation.BattleManagerTS_update = BattleManagerTS.update;
BattleManagerTS.update = function() {
    if (!this.isBusy() && !this.updateEvent()) {
        switch (this._phase) {
        case 'preparationPhase':
            this.updatePreparationPhase();
            break;
        default:
            BattlePreparation.BattleManagerTS_update.call(this);
            break;
        }
    }
};

BattleManagerTS.updatePreparationPhase = function() {
    switch (this._battlePhase) {
    case 'explore':
        this.updateStartExplore();
        break;
    case 'select':
        this.updateStartSelect();
        break;
    }
};

BattleManagerTS.updateStartExplore = function() {
    this.refreshSubject();
    var x = $gameSelectorTS.x;
    var y = $gameSelectorTS.y;
    if ($gameMap.isOnStartTiles(x, y)) {
        if ($gameSelectorTS.isOk()) {
            SoundManager.playOk();
            this.selectPending();
        }
    }
}

BattleManagerTS.selectPending = function() {
    this._battlePhase = 'select';
    $gameSelectorTS.updateSelect();
    this._subject = $gameSelectorTS.select();
    var x = $gameSelectorTS.x;
    var y = $gameSelectorTS.y;
    if (this._subject) {
        this._subject.performSelect();
    } else {
        this._subject = $gameMap.eventIdXy(x, y);
    }
};

BattleManagerTS.updateStartSelect = function() {
    this.refreshSubstitute();
    var x = $gameSelectorTS.x;
    var y = $gameSelectorTS.y;
    if ($gameMap.isOnStartTiles(x, y)) {
        if ($gameSelectorTS.isOk()) {
            SoundManager.playOk();
            this.substituteBattler();
        }
    }
};

BattleManagerTS.substituteBattler = function() {
    var x = this._subject.x;
    var y = this._subject.y;
    var eventId1 = $gameMap.eventIdXy(x, y);
    var index1 = $gamePartyTS._events.indexOf(eventId1);
    
    x = $gameSelectorTS.x;
    y = $gameSelectorTS.y;
    eventId1 = $gameMap.eventIdXy(x, y);
    var index2 = $gamePartyTS._events.indexOf(eventId1);
    
    $gamePartyTS.swapOrder(index1, index2);
    this._targetWindow.close();
    this._statusWindow2.redrawItem(index1);
    this._statusWindow2.redrawItem(index2);
    this._battlePhase = 'explore';
}

BattleManagerTS.refreshSubstitute = function() {
    var select = $gameSelectorTS.select();
    if (select && select.isAlive()) {
        this._targetWindow.open(select);
    } else {
        this._targetWindow.close();
    }
};

BattlePreparation.BattleManagerTS_updateEvent = BattleManagerTS.updateEvent;
BattleManagerTS.updateEvent = function() {
    BattlePreparation.BattleManagerTS_updateEvent.call(this);
    switch (this._phase) {
    case 'preparationPhase':
        $gameSwitches.update();
        $gameVariables.update();
    }
};

//-----------------------------------------------------------------------------
// Game_PartyTS
//
// The game object class for a party tactic.

Game_PartyTS.prototype.initialize = function() {
    Game_UnitTS.prototype.initialize.call(this);
    this.clear();
};

BattlePreparation.Game_PartyTS_clear = Game_PartyTS.prototype.clear;
Game_PartyTS.prototype.clear = function() {
    BattlePreparation.Game_PartyTS_clear.call(this);
    this._events = [];
    this._fixedMembers = 0;
};

Game_PartyTS.prototype.addAutoActor = function(event) {
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

BattlePreparation.Game_PartyTS_addActor = Game_PartyTS.prototype.addActor;
Game_PartyTS.prototype.addActor = function(actorId, event, needRefresh) {
    if (!this._actors.contains(actorId)) {
        this._fixedMembers += 1;
        var eventId = event.eventId();
        this._events.push(eventId);
    };
    BattlePreparation.Game_PartyTS_addActor.call(this, actorId, event, needRefresh);
};

Game_PartyTS.prototype.index = function(actorId) {
    return this._actors.indexOf(actorId);
};

BattlePreparation.Game_Party_members = Game_PartyTS.prototype.members;
Game_PartyTS.prototype.members = function() {
    return this.allMembers().slice(0, this._maxBattleMembers).filter(function(actor) {
        return actor;
    });
};

Game_PartyTS.prototype.allMembers = function() {
    return this._actors.map(function(id) {
        return $gameActors.actor(id);
    });
};

Game_PartyTS.prototype.setupMembers = function() {
    this._actors.concat($gameParty.actors()).forEach(function(actorId) {
        if (this._actors.indexOf(actorId) == -1) {
            this._actors.push(actorId);
        }
    }, this);
};

Game_PartyTS.prototype.swapOrder = function(index1, index2) {
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

Game_PartyTS.prototype.isBattleMember = function(index) {
    return index < this._maxBattleMembers
};

Game_PartyTS.prototype.swapPosition = function(index1, index2) {
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

Game_PartyTS.prototype.insertInBattleMembers = function(index1, index2) {
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

Game_PartyTS.prototype.isFixedMember = function(index) {
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
        if (!$gamePartyTS.actors().contains(actorId)) {
            return actorId;
        }
    }
    return -1;
};

Game_Party.prototype.actors = function() {
    return this._actors;
};

//-----------------------------------------------------------------------------
// Window_Formation
//
// The window for displaying essential commands for progressing though the game.

function Window_Formation() {
    this.initialize.apply(this, arguments);
}

Window_Formation.prototype = Object.create(Window_MenuCommand.prototype);
Window_Formation.prototype.constructor = Window_Formation;

Window_Formation.prototype.initialize = function(x, y) {
    Window_MenuCommand.prototype.initialize.call(this, x, y);
    this.selectLast();
    this.hide();
    this.deactivate();
};

Window_Formation._lastCommandSymbol = null;

Window_Formation.initCommandPosition = function() {
    this._lastCommandSymbol = null;
};

Window_Formation.prototype.windowWidth = function() {
    return 240;
};

Window_Formation.prototype.numVisibleRows = function() {
    return this.maxItems();
};

Window_Formation.prototype.addMainCommands = function() {
    var enabled = this.areMainCommandsEnabled();
    this.addCommand(BattlePreparation.startBattleTerm, 'startBattle');
    if (this.needsCommand('equip')) {
        this.addCommand(TextManager.equip, 'equip', enabled);
    }
    if (this.needsCommand('status')) {
        this.addCommand(TextManager.status, 'status', enabled);
    }
};

Window_Formation.prototype.addOriginalCommands = function() {
};

Window_Formation.prototype.addSaveCommand = function() {
};

Window_Formation.prototype.selectLast = function() {
    this.selectSymbol(Window_Formation._lastCommandSymbol);
};

//-----------------------------------------------------------------------------
// Window_MenuStatusTS
//
// The window for displaying party member status on the menu screen.

function Window_FormationTS() {
    this.initialize.apply(this, arguments);
}

Window_FormationTS.prototype = Object.create(Window_MenuStatus.prototype);
Window_FormationTS.prototype.constructor = Window_FormationTS;

Window_FormationTS.prototype.maxItems = function() {
    return $gamePartyTS.allMembers().length;
};

Window_FormationTS.prototype.processOk = function() {
    Window_Selectable.prototype.processOk.call(this);
    var actor = $gamePartyTS.allMembers()[this.index()];
    if (actor) {
        $gameParty.setMenuActor($gamePartyTS.allMembers()[this.index()]);
    }
};

Window_FormationTS.prototype.isCurrentItemEnabled = function() {
    if (this._formationMode) {
        var actor = $gamePartyTS.allMembers()[this.index()];
        return !$gamePartyTS.isFixedMember(this.index());
    } else {
        return true;
    }
};

Window_FormationTS.prototype.selectLast = function() {
    this.select($gameParty.menuActor().index() || 0);
};

Window_FormationTS.prototype.drawItemImage = function(index) {
    var actor = $gamePartyTS.allMembers()[index];
    var rect = this.itemRect(index);
    if (actor) {
        this.changePaintOpacity(actor.isBattleMember());
        this.drawActorFace(actor, rect.x + 1, rect.y + 1, Window_Base._faceWidth, Window_Base._faceHeight);
        this.changePaintOpacity(true);
    }
};

Window_FormationTS.prototype.drawItemStatus = function(index) {
    var actor = $gamePartyTS.allMembers()[index];
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

Game_Map.prototype.addStartTile = function(tile) {
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
    switch (BattleManagerTS.phase()) {
    case 'preparationPhase':
        this.setValue(BattlePreparation.preparationPhaseId, true);
        break;
    }
};

//-----------------------------------------------------------------------------
// Spriteset_MapTS
//
// The set of sprites on the map screen.

Spriteset_MapTS.prototype.createBaseTiles = function() {
    this._tilesSprite = new Sprite_Base();
    this._tilesSprite.z = 1;
    this._rangeTilesSprite = this.createTiles(TacticsSystem.moveScopeColor);
    this._startTilesSprite = this.createTiles(BattlePreparation.startScopeColor);
    this._tilemap.addChild(this._tilesSprite);
};

BattlePreparation.Spriteset_MapTS_updateTiles = Spriteset_MapTS.prototype.updateTiles;
Spriteset_MapTS.prototype.updateTiles = function() {
    BattlePreparation.Spriteset_MapTS_updateTiles.call(this);
    if (this._startTiles !== $gameMap.startTiles()) {
        this.updateStartTiles();
    }
};

Spriteset_MapTS.prototype.updateStartTiles = function() {
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