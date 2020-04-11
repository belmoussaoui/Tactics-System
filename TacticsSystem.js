//=============================================================================
// TacticsSystem.js v1.0.1
//=============================================================================

/*:
 * @plugindesc A Tactical Battle System like Fire Emblem series.
 * Requires: Selector.png in img/system.
 * @author Bilal El Moussaoui (https://twitter.com/arleq1n)
 *
 * @param cursor speed
 * @desc The cursor speed. 1: Slow, 2: Normal, 3: Fast
 * @default 2
 *
 * @param grid opacity
 * @desc The grid opacity of the battle scene.
 * @default 30
 *
 * @param move points
 * @desc The movement distance of a unit.
 * @default 5
 *
 * @param action range
 * @desc The range of skill or object.
 * @default diamond 1
 *
 * @param wait skill id
 * @desc The wait skill id in the database
 * @default 7
 *
 * @param move scope color
 * @desc The color to display the move range.
 * @default #0066CC
 *
 * @param ally scope color
 * @desc The color to display the range of an action on an ally.
 * @default #008000
 *
 * @param enemy scope color
 * @desc The color to display the range of an action on an enemy.
 * @default #B22222
 *
 * @param display manager
 * @default
 *
 * @param show hp gauge
 * @parent display manager
 * @desc Show the hp gauge below the unit. 0: False, 1: True
 * @default 1
 *
 * @param show state icon
 * @parent display manager
 * @desc Show the icon state of a unit. 0: False, 1: True
 * @default 1
 *
 * @param show battle start
 * @parent display manager
 * @desc Show the battle start sprite. 0: False, 1: True
 * @default 1
 *
 * @param duration start sprite
 * @parent display manager
 * @desc The duration to display the start sprite.
 * @default 300
 *
 * @param show information window
 * @parent display manager
 * @desc Show the information battle window.
 * @default 1
 *
 * @param text manager
 * @default
 *
 * @param battle start term
 * @parent text manager
 * @desc The battle start term.
 * @default Battle Start
 *
 * @param end turn term
 * @parent text manager
 * @desc The end turn term.
 * @default End Turn
 *
 * @param damage term (abbr.)
 * @parent text manager
 * @desc The damage abbrevation term.
 * @default Dmg
 *
 * @param recover term (abbr.)
 * @parent text manager
 * @desc The recover abbrevation term.
 * @default Rcv
 *
 * @param drain term (abbr.)
 * @parent text manager
 * @desc The drain abbrevation term.
 * @default Drn
 *
 * @param hit rate term (abbr.)
 * @parent text manager
 * @desc The hit rate abbrevation term.
 * @default Hit
 *
 * @param critical rate term (abbr.)
 * @parent text manager
 * @desc The critical rate abbrevation term.
 * @default Cri
 *
 * @param wait command name
 * @parent text manager
 * @desc The wait command name to display in actor command window.
 * @default Wait
 *
 * @param switches manager
 * @default
 *
 * @param battle start id
 * @parent switches manager
 * @desc The switch id to set if the battle has started.
 * @default 1
 *
 * @param player phase id
 * @parent switches manager
 * @desc The switch id to set if it's the player phase.
 * @default 2
 *
 * @param enemy phase id
 * @parent switches manager
 * @desc The switch id to set if it's the enemy phase.
 * @default 3
 *
 * @param variables manager
 * @default
 *
 * @param current phase id
 * @parent variables manager
 * @desc The variable id to set the current phase.
 * 1: startPhase, 2 : playerPhase, 3 : enemyPhase, 4 : battleEnd (can't to be use)
 * @default 1
 *
 * @param current player phase id
 * @parent variables manager
 * @desc The variable id to set the sub phase of player.
 * 1: explore, 2 : select, 3 : target
 * @default 2
 *
 * @param current battle phase id
 * @parent variables manager
 * @desc The variable id to set the sub phase of player and enemy.
 * 1: start, 2 : move, 3 : action, 4 : turnEnd (can't to be use)
 * @default 3
 *
 * @param turn count id
 * @parent variables manager
 * @desc The variable id to set the turn count of battle.
 * @default 4
 *
 * @help
 *
 * For more information, please consult :
 *   - https://forums.rpgmakerweb.com/index.php?threads/tactics-system-1-0.117600/
 * Plugin Command:
 *   TS.battleProcessing [ON/OFF] # Activate or desactivate the system.
 *   TS.battleWin                 # Proceed immediately to the victory of the battle.
 *   TS.battleLose                # Proceed immediately to the defeat of the battle.
 *   TS.selectorMoveTo x y        # Move the selector to position x and y.
 *   TS.selectorTransfer x y      # Move immediately the selector to position x and y.
 *   TS.selectorEvent eventId     # Move immediately the selector to position at event of eventId.
 *   TS.clearAll [ON/OFF]         # Activate or desactivate clear all condition victory.
 */

var TacticsSystem = TacticsSystem || {};
TacticsSystem.Parameters = PluginManager.parameters('TacticsSystem');

TacticsSystem.cursorSpeed =           Number(TacticsSystem.Parameters['cursor speed']);
TacticsSystem.gridOpacity =           Number(TacticsSystem.Parameters['grid opacity']);
TacticsSystem.mvp =                   Number(TacticsSystem.Parameters['move points']);
TacticsSystem.actionRange =           String(TacticsSystem.Parameters['action range']);
TacticsSystem.waitSkillId =           Number(TacticsSystem.Parameters['wait skill id']);
TacticsSystem.moveScopeColor =        String(TacticsSystem.Parameters['move scope color']);
TacticsSystem.allyScopeColor =        String(TacticsSystem.Parameters['ally scope color']);
TacticsSystem.enemyScopeColor =       String(TacticsSystem.Parameters['enemy scope color']);
TacticsSystem.showHpGauge =           Number(TacticsSystem.Parameters['show hp gauge']);
TacticsSystem.showStateIcon =         Number(TacticsSystem.Parameters['show state icon']);
TacticsSystem.showBattleStart =       Number(TacticsSystem.Parameters['show battle start']);
TacticsSystem.durationStartSprite =   Number(TacticsSystem.Parameters['duration start sprite']);
TacticsSystem.showInformationWindow = Number(TacticsSystem.Parameters['show information window']);
TacticsSystem.battleStartTerm =       String(TacticsSystem.Parameters['battle start term']);
TacticsSystem.endTurnTerm =           String(TacticsSystem.Parameters['end turn term']);
TacticsSystem.damageTerm =            String(TacticsSystem.Parameters['damage term (abbr.)']);
TacticsSystem.recoverTerm =           String(TacticsSystem.Parameters['recover term (abbr.)']);
TacticsSystem.drainTerm =             String(TacticsSystem.Parameters['drain term (abbr.)']);
TacticsSystem.hitRateTerm =           String(TacticsSystem.Parameters['hit rate term (abbr.)']);
TacticsSystem.criticalRateTerm =      String(TacticsSystem.Parameters['critical rate term (abbr.)']);
TacticsSystem.wait =                  String(TacticsSystem.Parameters['wait command name']);
TacticsSystem.battleStartId =         Number(TacticsSystem.Parameters['battle start id']);
TacticsSystem.playerPhaseId =         Number(TacticsSystem.Parameters['player phase id']);
TacticsSystem.enemyPhaseId =          Number(TacticsSystem.Parameters['enemy phase id']);
TacticsSystem.phaseVarId =            Number(TacticsSystem.Parameters['current phase id']);
TacticsSystem.playerPhaseVarId =      Number(TacticsSystem.Parameters['current player phase id']);
TacticsSystem.battlePhaseVarId =      Number(TacticsSystem.Parameters['current battle phase id']);
TacticsSystem.turnCountVarId =        Number(TacticsSystem.Parameters['turn count id']);

//-----------------------------------------------------------------------------
// Scene_BattleTS
//
// The scene class of the battle tactics system screen.

function Scene_BattleTS() {
    this.initialize.apply(this, arguments);
}

Scene_BattleTS.prototype = Object.create(Scene_Base.prototype);
Scene_BattleTS.prototype.constructor = Scene_BattleTS;

Scene_BattleTS.prototype.initialize = function() {
    Scene_Base.prototype.initialize.call(this);
};

Scene_BattleTS.prototype.create = function() {
    Scene_Base.prototype.create.call(this);
    $gameSwitches.setValue(TacticsSystem.battleStartId, true);
    this.createDisplayObjects();
};

Scene_BattleTS.prototype.createDisplayObjects = function() {
    this.createSpriteset();
    this.createWindowLayer();
    this.createAllWindows();
    BattleManagerTS.setLogWindow(this._logWindow);
    BattleManagerTS.setSubjectWindow(this._subjectWindow);
    BattleManagerTS.setTargetWindow(this._targetWindow);
    BattleManagerTS.setInfoWindow(this._infoWindow);
    BattleManagerTS.setSpriteset(this._spriteset);
    this._logWindow.setSpriteset(this._spriteset);
};

Scene_BattleTS.prototype.createSpriteset = function() {
    this._spriteset = new Spriteset_MapTS();
    this.addChild(this._spriteset);
};

Scene_BattleTS.prototype.createAllWindows = function() {
    this.createLogWindow();
    this.createBattleWindow();
    this.createActorCommandWindow();
    this.createHelpWindow();
    this.createSkillWindow();
    this.createItemWindow();
    this.createMessageWindow();
    this.createInfoWindow();
    this.createMapWindow();
    this.createStatusWindow();
};

Scene_BattleTS.prototype.createLogWindow = function() {
    this._logWindow = new Window_BattleLog();
    this.addWindow(this._logWindow);
};

Scene_BattleTS.prototype.createBattleWindow = function() {
    this.createSubjectWindow();
    this.createTargetWindow();
};

Scene_BattleTS.prototype.createSubjectWindow = function() {
    this._subjectWindow = new Window_BattleStatusTS();
    this._subjectWindow.x = Graphics.width/2 - this._subjectWindow.width - 32;
    this.addWindow(this._subjectWindow);
};

Scene_BattleTS.prototype.createTargetWindow = function() {
    this._targetWindow = new Window_BattleStatusTS();
    this._targetWindow.x = Graphics.width/2 + 32;
    this.addWindow(this._targetWindow);
};

Scene_BattleTS.prototype.createActorCommandWindow = function() {
    this._actorCommandWindow = new Window_ActorCommandTS();
    this._actorCommandWindow.setHandler('attack', this.commandAttack.bind(this));
    this._actorCommandWindow.setHandler('skill',  this.commandSkill.bind(this));
    this._actorCommandWindow.setHandler('guard',  this.commandGuard.bind(this));
    this._actorCommandWindow.setHandler('item',   this.commandItem.bind(this));
    this._actorCommandWindow.setHandler('event',  this.commandEvent.bind(this));
    this._actorCommandWindow.setHandler('cancel', this.selectPreviousCommand.bind(this));
    this._actorCommandWindow.setHandler('wait',   this.commandWait.bind(this));
    this.addWindow(this._actorCommandWindow);
};

Scene_BattleTS.prototype.createHelpWindow = function() {
    this._helpWindow = new Window_Help();
    this._helpWindow.visible = false;
    this.addWindow(this._helpWindow);
};

Scene_BattleTS.prototype.createSkillWindow = function() {
    var width = Graphics.boxWidth - this._actorCommandWindow.width;
    var height = this._actorCommandWindow.fittingHeight(4);
    this._skillWindow = new Window_BattleSkillTS(0, this._actorCommandWindow.y, width, height);
    this._skillWindow.setHelpWindow(this._helpWindow);
    this._skillWindow.setHandler('ok',     this.onSkillOk.bind(this));
    this._skillWindow.setHandler('cancel', this.onSkillCancel.bind(this));
    this.addWindow(this._skillWindow);
};

Scene_BattleTS.prototype.createItemWindow = function() {
    var width = Graphics.boxWidth - this._actorCommandWindow.width;
    var height = this._actorCommandWindow.fittingHeight(4);
    this._itemWindow = new Window_BattleItemTS(0, this._actorCommandWindow.y, width, height);
    this._itemWindow.setHelpWindow(this._helpWindow);
    this._itemWindow.setHandler('ok',     this.onItemOk.bind(this));
    this._itemWindow.setHandler('cancel', this.onItemCancel.bind(this));
    this.addWindow(this._itemWindow);
};

Scene_BattleTS.prototype.createMessageWindow = function() {
    this._messageWindow = new Window_Message();
    this.addWindow(this._messageWindow);
    this._messageWindow.subWindows().forEach(function(window) {
        this.addWindow(window);
    }, this);
};

Scene_BattleTS.prototype.createInfoWindow = function() {
    this._infoWindow = new Window_BattleInfoTS();
    this._infoWindow.y = Graphics.boxHeight - this._infoWindow.height;
    this._infoWindow.y -= this._subjectWindow.height;
    this._infoWindow.x = Graphics.width/2 + 32;
    this.addWindow(this._infoWindow);
};

Scene_BattleTS.prototype.createMapWindow = function() {
    this._mapWindow = new Window_BattleMap(0, 0);
    this._mapWindow.x = Graphics.width/2 - this._mapWindow.width/2;
    this._mapWindow.y = Graphics.height/2 - this._mapWindow.height/2;
    this._mapWindow.setHandler('endTurn',   this.commandEndTurn.bind(this));
    this._mapWindow.setHandler('equip',     this.commandPersonal.bind(this));
    this._mapWindow.setHandler('status',    this.commandPersonal.bind(this));
    this._mapWindow.setHandler('options',   this.commandOptions.bind(this));
    // this._mapWindow.setHandler('save',      this.commandSave.bind(this));
    this._mapWindow.setHandler('gameEnd',   this.commandGameEnd.bind(this));
    this._mapWindow.setHandler('cancel',    this.commandCancelMapWindow.bind(this));
    this.addWindow(this._mapWindow);
};

Scene_BattleTS.prototype.createStatusWindow = function() {
    this._statusWindow = new Window_MenuStatusTS(0, 0);
    this._statusWindow.x = Graphics.width/2 - this._statusWindow.width/2;
    this._statusWindow.reserveFaceImages();
    this._statusWindow.hide();
    this.addWindow(this._statusWindow);
};

Scene_BattleTS.prototype.commandPersonal = function() {
    this._statusWindow.setFormationMode(false);
    this._statusWindow.selectLast();
    this._statusWindow.activate();
    this._statusWindow.setHandler('ok',     this.onPersonalOk.bind(this));
    this._statusWindow.setHandler('cancel', this.onPersonalCancel.bind(this));
    this._statusWindow.show();
};

Scene_BattleTS.prototype.commandFormation = function() {
};

Scene_BattleTS.prototype.commandOptions = function() {
    SceneManager.push(Scene_Options);
    $gameSelectorTS.setTransparent(false);
    this._subjectWindow.show();
};

Scene_BattleTS.prototype.commandSave = function() {
    SceneManager.push(Scene_Save);
};

Scene_BattleTS.prototype.commandGameEnd = function() {
    SceneManager.push(Scene_GameEnd);
};

Scene_BattleTS.prototype.commandCancelMapWindow = function() {
    $gameSelectorTS.setTransparent(false);
    this._subjectWindow.show();
    this._mapWindow.hide();
    this._mapWindow.deactivate();
    this.menuCalling = false;
};

Scene_BattleTS.prototype.start = function() {
    Scene_Base.prototype.start.call(this);
    $gamePlayer.setThrough(true);
    this.startFadeIn(this.slowFadeSpeed(), false);
    BattleManagerTS.startBattle();
    this.menuCalling = false;
    this._statusWindow.refresh();
    this.loadFacesetEnemy();
    this.setTransparentAlive();
};

Scene_BattleTS.prototype.loadFacesetEnemy = function() {
    $gameTroopTS.members().forEach(function(member) {
        ImageManager.loadEnemy(member.battlerName());
    });
};

Scene_BattleTS.prototype.setTransparentAlive = function() {
    $gamePartyTS.members().concat($gameTroopTS.members()).forEach(function(member) {
        if (!member.isAlive()) {
            member.event().setTransparent(true);
        }
    });
};

Scene_BattleTS.prototype.update = function() {
    this.updateDestination();
    var active = this.isActive();
    $gameMap.update(active);
    $gameTimer.update(active);
    if (active && !this.isBusy()) {
        this.updateBattleProcess();
    }
    $gameSelectorTS.update();
    $gameScreen.update();
    Scene_Base.prototype.update.call(this);
};

Scene_BattleTS.prototype.isMenuEnabled = function() {
    return $gameSystem.isMenuEnabled() && !$gameMap.isEventRunning();
};

Scene_BattleTS.prototype.isMenuCalled = function() {
    return Input.isTriggered('menu') || TouchInput.isCancelled();
};

Scene_BattleTS.prototype.updateCallMenu = function() {
    if (this.isMenuEnabled()) {
        if (this.menuCalling) {
            $gameSelectorTS.setTransparent(true);
            this._subjectWindow.hide();
            SceneManager.snapForBackground();
            this.callMenu();
        }
         if (this.isMenuCalled() && BattleManagerTS.isExploring()) {
            this.menuCalling = true;
        }
    } else {
        this.menuCalling = false;
    }
};

Scene_BattleTS.prototype.callMenu = function() {
    SoundManager.playOk();
    this.menuCalling = false;
    this._mapWindow.show();
    this._mapWindow.activate();
};

Scene_BattleTS.prototype.commandEndTurn = function() {
    SoundManager.playOk();
    BattleManagerTS.onAllTurnEnd();
    this.commandCancelMapWindow();
};

Scene_BattleTS.prototype.updateDestination = function() {
    if (this.isMapTouchOk()) {
        this.processMapTouch();
    } else {
        //$gameTemp.clearDestination();  some problem with plugin command...
    }
};

Scene_BattleTS.prototype.isMapTouchOk = function() {
    return this.isActive() && BattleManagerTS.isActive() && !this._mapWindow.active;
};

Scene_BattleTS.prototype.processMapTouch = function() {
    if (TouchInput.isTriggered()) {
        var x = $gameMap.canvasToMapX(TouchInput.x);
        var y = $gameMap.canvasToMapY(TouchInput.y);
        $gameSelectorTS.moveTo(x, y);
    }
};

Scene_BattleTS.prototype.updateBattleProcess = function() {
    if (!this.isAnyInputWindowActive() || BattleManagerTS.isBattleEnd()) {
        this.updateCallMenu();
        $gameSelectorTS.updateMoveByInput();
        if (BattleManagerTS.isInputting() && !$gameMap.isEventRunning()) {
            this.startActorCommandSelection();
        }
        BattleManagerTS.update();
    }
};

Scene_BattleTS.prototype.isBusy = function() {
    return ((this._messageWindow && this._messageWindow.isClosing()) ||
             Scene_Base.prototype.isBusy.call(this) || $gameSelectorTS.isBusy());
};

Scene_BattleTS.prototype.isAnyInputWindowActive = function() {
    return (this._actorCommandWindow.active ||
            this._skillWindow.active ||
            this._itemWindow.active ||
            this._mapWindow.active ||
            this._statusWindow.active);
};

Scene_BattleTS.prototype.startActorCommandSelection = function() {
    this._subjectWindow.show();
    this._actorCommandWindow.setup(BattleManagerTS.actor());
};

Scene_BattleTS.prototype.commandAttack = function() {
    var action = BattleManagerTS.inputtingAction();
    action.setAttack();
    BattleManagerTS.setupCombat(action);
    BattleManagerTS.refreshRedCells(action);
    this.onSelectAction();
    BattleManagerTS.processTarget();
};

Scene_BattleTS.prototype.commandSkill = function() {
    this._subjectWindow.hide();
    this._skillWindow.setActor(BattleManagerTS.actor());
    this._skillWindow.setStypeId(this._actorCommandWindow.currentExt());
    this._skillWindow.refresh();
    this._skillWindow.show();
    this._skillWindow.activate();
};

Scene_BattleTS.prototype.commandGuard = function() {
    BattleManagerTS.inputtingAction().setGuard();
    this._actorCommandWindow.close();
    BattleManagerTS.processAction();
};

Scene_BattleTS.prototype.commandItem = function() {
    this._subjectWindow.hide();
    this._itemWindow.refresh();
    this._itemWindow.show();
    this._itemWindow.activate();
};

Scene_BattleTS.prototype.commandEvent = function() {
    var subject = BattleManagerTS.actor();
    var eventId = subject.actionsButton()[this._actorCommandWindow.index()];
    var event = $gameMap.event(eventId);
    event.setActor(subject);
    event.start();
    BattleManagerTS.turnTowardCharacter(event);
    this.onSelectAction();
};

Scene_BattleTS.prototype.commandWait = function() {
    BattleManagerTS.inputtingAction().setWait();
    this._actorCommandWindow.close();
    BattleManagerTS.setupAction();
};

Scene_BattleTS.prototype.onPersonalOk = function() {
    $gameSelectorTS.setTransparent(false);
    switch (this._mapWindow.currentSymbol()) {
    case 'skill':
        SceneManager.push(Scene_Skill);
        break;
    case 'equip':
        SceneManager.push(Scene_Equip);
        break;
    case 'status':
        SceneManager.push(Scene_Status);
        break;
    }
};

Scene_BattleTS.prototype.onPersonalCancel = function() {
    this._statusWindow.deselect();
    this._statusWindow.hide();
    this._mapWindow.activate();
    $gameSelectorTS.setTransparent(false);
};


Scene_BattleTS.prototype.selectPreviousCommand = function() {
    if ($gameTemp.canCancel()) {
        SoundManager.playCancel();
        BattleManagerTS.previousSelect();
        this.endCommandSelection();
    }
};

Scene_BattleTS.prototype.onEventCancel = function() {
    this._eventWindow.hide();
    this._actorCommandWindow.activate();
};

Scene_BattleTS.prototype.onSkillOk = function() {
    this._subjectWindow.show();
    var skill = this._skillWindow.item();
    var action = BattleManagerTS.inputtingAction();
    action.setSkill(skill.id);
    BattleManagerTS.actor().setLastBattleSkill(skill);
    this.onSelectAction();
    BattleManagerTS.processTarget();
};

Scene_BattleTS.prototype.onSkillCancel = function() {
    BattleManagerTS.processCancel();
    this._subjectWindow.show();
    this._skillWindow.hide();
    this._actorCommandWindow.activate();
};

Scene_BattleTS.prototype.onItemOk = function() {
    this._subjectWindow.show();
    var item = this._itemWindow.item();
    var action = BattleManagerTS.inputtingAction();
    action.setItem(item.id);
    $gameParty.setLastItem(item);
    this.onSelectAction();
    BattleManagerTS.processTarget();
};

Scene_BattleTS.prototype.onItemCancel = function() {
    BattleManagerTS.processCancel();
    this._subjectWindow.show();
    this._itemWindow.hide();
    this._actorCommandWindow.activate();
};

Scene_BattleTS.prototype.onSelectAction = function() {
    $gameTemp.setCancel(false);
    this._skillWindow.hide();
    this._itemWindow.hide();
    this._actorCommandWindow.close();
};

Scene_BattleTS.prototype.endCommandSelection = function() {
    this._actorCommandWindow.close();
};

Scene_BattleTS.prototype.stop = function() {
    Scene_Base.prototype.stop.call(this);
    if (this.needsSlowFadeOut()) {
        this.startFadeOut(this.slowFadeSpeed(), false);
    } else {
        this.startFadeOut(this.fadeSpeed(), false);
    }
    this._subjectWindow.close();
    this._targetWindow.close();
    this._infoWindow.close();
};

Scene_BattleTS.prototype.needsSlowFadeOut = function() {
    return (SceneManager.isNextScene(Scene_Title) ||
            SceneManager.isNextScene(Scene_Gameover));
};

Scene_BattleTS.prototype.terminate = function() {
    Scene_Base.prototype.terminate.call(this);
    //BattleManagerTS.terminate();
};

//-----------------------------------------------------------------------------
// BattleManagerTS
//
// The static class that manages battle progress.

function BattleManagerTS() {
    throw new Error('This is a static class');
}

BattleManagerTS.setup = function(troopId, canEscape, canLose) {
    this.initMembers();
    this._canEscape = canEscape;
    this._canLose = canLose;
    if (troopId !== undefined) {
        this._troopId = Number(troopId);
        $gameTroop.setup(this._troopId);
    }
    this.makeEscapeRatio();
    $gameSwitches.update();
    $gameVariables.update();
    var x = $gamePlayer.x;
    var y = $gamePlayer.y;
    $gameSelectorTS.performTransfer(x, y);
    this._phase = 'startPhase';
};

BattleManagerTS.initMembers = function() {
    this._phase = 'init';
    this._battlePhase = 'init';
    this._troopId = 0;
    this._canEscape = false;
    this._canLose = false;
    this._eventCallback = null;
    this._preemptive = false;
    this._surprise = false;
    this._actorIndex = -1;
    this._actionForcedBattler = null;
    this._actionBattlers = [];
    this._subject = null;
    this._action = null;
    this._targets = [];
    this._targetIndex = -1;
    this._logWindow = null;
    this._subjectWindow = null;
    this._targetWindow = null;
    this._spriteset = null;
    this._escapeRatio = 0;
    this._escaped = false;
    this._rewards = {};
    this._turnForced = false;
};

BattleManagerTS.createGameObjects = function() {
    for (var i = 0; i < $gameMap.events().length; i++) {
        var event = $gameMap.events()[i];
        if (event.tparam('actor') > 0) {
            this.addGameActor(event);
        } else if (event.tparam('party') > 0) {
            this.addGameParty(event)
        } else if (event.tparam('enemy') > 0) {
            this.addGameEnemy(event);
        } else {
            continue;
        }
    }
};

BattleManagerTS.addGameActor = function(event) {
    var actorId = Number(event.tparam('actor'));
    $gamePartyTS.addActor(actorId, event);
};

BattleManagerTS.addGameParty = function(event) {
    var partyId = event.tparam('party');
    var actorId = $gameParty.memberId(partyId);
    $gamePartyTS.addActor(actorId, event, true);
};

BattleManagerTS.addGameEnemy = function(event) {
    var enemyId = event.tparam('enemy');
    var enemy = new Game_Enemy(enemyId);
    $gameTroopTS.addEnemy(enemy, event);
};

BattleManagerTS.setEventCallback = function(callback) {
    this._eventCallback = callback;
};

BattleManagerTS.setLogWindow = function(logWindow) {
    this._logWindow = logWindow;
};

BattleManagerTS.setSubjectWindow = function(subjectWindow) {
    this._subjectWindow = subjectWindow;
};

BattleManagerTS.setTargetWindow = function(targetWindow) {
    this._targetWindow = targetWindow;
};

BattleManagerTS.setInfoWindow = function(infoWindow) {
    this._infoWindow = infoWindow;
};

BattleManagerTS.setSpriteset = function(spriteset) {
    this._spriteset = spriteset;
};

BattleManagerTS.onEncounter = function() {
    this._preemptive = (Math.random() < this.ratePreemptive());
    this._surprise = (Math.random() < this.rateSurprise() && !this._preemptive);
};

BattleManagerTS.ratePreemptive = function() {
    return $gameParty.ratePreemptive($gameTroop.agility());
};

BattleManagerTS.rateSurprise = function() {
    return $gameParty.rateSurprise($gameTroop.agility());
};

BattleManagerTS.startBattle = function() {
    $gamePartyTS.onBattleStart();
    $gameTroopTS.onBattleStart();
    $gameScreen.onBattleStart();
    $gameSystem.onBattleStart();
};

BattleManagerTS.isActive = function() {
    if (!this._logWindow.isBusy()) {
        switch (this._battlePhase) {
        case 'explore':
        case 'select':
        case 'target':
            return true;
        }
    }
    return false;
};

BattleManagerTS.makeEscapeRatio = function() {
    this._escapeRatio = 0.5 * $gameParty.agility() / $gameTroop.agility();
};

BattleManagerTS.update = function() {
    if (!this.isBusy() && !this.updateEvent()) {
        switch (this._phase) {
        case 'startPhase':
            this.updateStartPhase();
            break;
        case 'playerPhase':
            this.updatePlayerPhase();
            break;
        case 'enemyPhase':
            this.updatePhase();
            break;
        case 'battleEnd':
            this.updateBattleEnd();
            break;
        }
    }
};

BattleManagerTS.updatePlayerPhase = function() {
    switch (this._battlePhase) {
    case 'explore':
        this.updateExplore();
        break;
    case 'select':
        this.updateSelect();
        break;
    case 'target':
        this.updateTarget();
        break;
    default:
        this.updatePhase();
        break;
    }
};

BattleManagerTS.updatePhase = function() {
    switch (this._battlePhase) {
    case 'start':
        this.updateStart();
        break;
    case 'move':
        this.updateMove();
        break;
    case 'open':
        this.processAction();
        break;
    case 'action':
        this.updateAction();
        break;
    case 'close':
        this.updateClose();
        break;
    case 'turnEnd':
        this.updateTurnEnd();
        break;
    }
};

BattleManagerTS.isBusy = function() {
    return ($gameMessage.isBusy() || this._spriteset.isBusy() ||
        this._logWindow.isBusy() || $gameSelectorTS.isBusy());
};

BattleManagerTS.updateEvent = function() {
    switch (this._phase) {
    case 'startPhase':
    case 'playerPhase':
    case 'enemyPhase':
        $gameSwitches.update();
        $gameVariables.update();
        if (false) {  //this.isActionForced()) {  // to do
            this.processForcedAction();
            return true;
        } else {
            return this.updateEventMain();
        }
    }
};

BattleManagerTS.updateEventMain = function() {
    $gameTroop.updateInterpreter();
    $gameParty.requestMotionRefresh();
    if ($gameTroop.isEventRunning() || this.checkBattleEnd()) {
        return true;
    }
    $gameTroop.setupBattleEvent();
    if ($gameTroop.isEventRunning() || SceneManager.isSceneChanging()) {
        return true;
    }
    if ($gameMap.isEventRunning()) {
        return true;
    }
    return false;
};

BattleManagerTS.battlePhase = function() {
    return this._battlePhase;
};

BattleManagerTS.isInputting = function() {
    return this._battlePhase === 'input';
};

BattleManagerTS.isAborting = function() {
    return this._battlePhase === 'aborting';
};

BattleManagerTS.isExploring = function() {
    return this._battlePhase === 'explore';
};

BattleManagerTS.isTurnEnd = function() {
    return this._battlePhase === 'turnEnd';
};

BattleManagerTS.phase = function() {
    return this._phase;
};

BattleManagerTS.isPlayerPhase = function() {
    return this._phase === 'playerPhase';
};

BattleManagerTS.isEnemyPhase = function() {
    return this._phase === 'enemyPhase';
};

BattleManagerTS.isBattleEnd = function() {
    return this._phase === 'battleEnd';
};

BattleManagerTS.canEscape = function() {
    return this._canEscape;
};

BattleManagerTS.canLose = function() {
    return this._canLose;
};

BattleManagerTS.isEscaped = function() {
    return this._escaped;
};

BattleManagerTS.allBattlerMembers = function() {
    return $gamePartyTS.members().concat($gameTroopTS.members());
};

BattleManagerTS.actor = function() {
    return this._actorIndex >= 0 ?  $gamePartyTS.members()[this._actorIndex] : null;
};

BattleManagerTS.makePlayerOrders = function() {
    this._playersOrder = $gamePartyTS.restrictedMembers();
};

BattleManagerTS.makeEnemyOrders = function() {
    this._enemiesOrder = $gameTroopTS.battleMembers();
};

BattleManagerTS.updateStartPhase = function() {
    this.makePlayerOrders();
    $gameTroop.increaseTurn();
    $gameTroopTS.onTurnStart();
    $gamePartyTS.onTurnStart();
    $gameSelectorTS.setTransparent(true);
    this._logWindow.startTurn();
    this._phase = 'playerPhase';
    this._battlePhase = 'start';
    // other solution ?
    // use battle log ?
    if ($gameTroopTS.needDisplayStart()) {
        $gameTroopTS.setNeedStart(false);
        this._spriteset.onBattleStart();
    }
    $gameSelectorTS.updateSelect();
    this.refreshMoveTiles();
};

// in game selectorTS
BattleManagerTS.updateExplore = function() {
    this.refreshSubject();
    if ($gameSelectorTS.isMoving()) {
        this.refreshMoveTiles();
    }
    var select = $gameSelectorTS.select();
    if (select && select.isActor() && select.canAction()) {
        if ($gameSelectorTS.isOk()) {
            SoundManager.playOk();
            this.selectActor();
        }
    }
};

BattleManagerTS.refreshMoveTiles = function() {
    var select = $gameSelectorTS.select();
    if (select) {
        $gameMap.setMoveColor();
        select.makeRange();
    } else {
        $gameMap.eraseTiles();
    }
};

BattleManagerTS.selectActor = function() {
    this._battlePhase = 'select';
    $gameSelectorTS.updateSelect();
    this._subject = $gameSelectorTS.select();
    this._subject.performSelect();  // in window log !
    this._actorIndex = this._subject.indexTS();
    this._subject.savePosition();
    $gameParty.setupTS([this._subject]);
    this.refreshMoveTiles();
};

// in game selectorTS
BattleManagerTS.updateSelect = function() {
    var x = $gameSelectorTS.x;
    var y = $gameSelectorTS.y;
    if ($gameSelectorTS.isMoving()) {
        this._subject.refreshMovesAction(x, y);
    }
    var battler = $gameSelectorTS.select();
    if ($gameMap.isOnTiles(x, y)) {
        if (!battler || this._subject === battler) {
            if ($gameSelectorTS.isOk()) {
                SoundManager.playOk();
                this._battlePhase = 'move';
                $gameMap.eraseTiles();
            }
        }
    }
    if ($gameSelectorTS.isCancelled()) {
        SoundManager.playCancel();
        this.previousSelect();
    }
};

BattleManagerTS.previousSelect = function() {
    this._battlePhase = 'explore';
    this._subject.restorePosition();
    var select = $gameSelectorTS.select();
    this._subject = null;
    $gameSelectorTS.updateSelect();
    this.refreshMoveTiles();
    var select = $gameSelectorTS.select();
    if (select && select.isAlive()) {
        this._subjectWindow.open(select);
    } else {
        this._subjectWindow.close();
    }
};

BattleManagerTS.processTarget = function() {
    this._battlePhase = 'target';
};

// in game selectorTS
BattleManagerTS.updateTarget = function() {
    if ($gameSelectorTS.isMoving()) {
        this.refreshTarget();
    }
    var x = $gameSelectorTS.x;
    var y = $gameSelectorTS.y;
    var select = $gameSelectorTS.select();
    var action = this.inputtingAction();
    if ($gameSelectorTS.isOk()) {
        if ($gameMap.isOnTiles(x, y) && action.isTargetValid(select)) {
            SoundManager.playOk();
            $gameTemp.setCancel(false);
            action.setTarget(select.index());
            this.setupAction();
        } else {
            SoundManager.playBuzzer();
        }
    }
    if ($gameSelectorTS.isCancelled()) {
        SoundManager.playCancel();
        this.previousTarget();
    }
};

BattleManagerTS.previousTarget = function() {
    SoundManager.playCancel();
    this._battlePhase = 'input';
    this.processCancel();
    this._targetWindow.close();
    this._infoWindow.close();
};

BattleManagerTS.inputtingAction = function() {
    return this.actor() ? this.actor().inputtingAction() : null;
};

BattleManagerTS.refreshSubject = function() {
    var select = $gameSelectorTS.select();
    if ($gameSelectorTS.isMoving()) {
        if (select && select.isAlive()) {
            this._subjectWindow.open(select);
        } else {
            this._subjectWindow.close();
        }
    }
};

BattleManagerTS.refreshTarget = function() {
    var select = $gameSelectorTS.select();
    if (select && select.isAlive()) {
        this._subject.turnTowardCharacter(select);
        this._targetWindow.open(select);
        this.refreshInfo();
    } else {
        this._subject.event().setDirection(2);
        this._targetWindow.close();
        this._infoWindow.close();
    }
};

BattleManagerTS.refreshInfo = function() {
    var select = $gameSelectorTS.select();
    var action = this.inputtingAction();
    if (action.isTargetValid(select)) {
        this._infoWindow.open(select);
    } else {
        this._infoWindow.close();
    }
};

BattleManagerTS.updateStart = function() {
    var select = $gameSelectorTS.select();
    $gameMap.setMoveColor();
    if (select) {
        select.makeRange();
    }
    if (this._phase === 'playerPhase') {
        this.updateStartPlayer();
    } else {
        this.updateStartEnemy();
    }
};

BattleManagerTS.updateStartPlayer = function() {
    this._subject = this._playersOrder.shift();
    if (this._subject) {
        this.restrictedPhase();
    } else if ($gamePartyTS.isPhase()) {
        $gameSelectorTS.setTransparent(false);
        this._battlePhase = 'explore';
    } else {
        this._battlePhase = 'turnEnd';
    }
};

BattleManagerTS.restrictedPhase = function() {
    this._battlePhase = 'move';
    this._subject.makeRange();  // in makemoves
    this._subject.makeMoves();
    this._subject.makeActions();
    $gameParty.setupTS([this._subject]);
    $gameMap.eraseTiles();
    var x = this._subject.tx;
    var y = this._subject.ty;
    $gameSelectorTS.performTransfer(x, y);
};

BattleManagerTS.updateStartEnemy = function() {
    if ($gameTroopTS.isPhase()) {
        $gameSelectorTS.setTransparent(false);
        this.updateEnemyPhase();
    } else {
        this._battlePhase = 'turnEnd';
    }
};

BattleManagerTS.updateEnemyPhase = function() {
    this._battlePhase = 'move';
    this._subject = this._enemiesOrder.shift();
    $gameTroop.setupTS([this._subject]);
    this._subject.makeRange();  // in makemoves
    this._subject.makeMoves();
    this._subject.makeActions();
    $gameMap.eraseTiles();
    if (this._subject.isPattern()) {
        var x = this._subject.tx;
        var y = this._subject.ty;
        $gameSelectorTS.performTransfer(x, y);
    }
};

BattleManagerTS.updateMove = function() {
    if (!this._subject.isMoving()) {
        var action = this._subject.currentMove();
        if (action && action.isMove()) {
            action.applyMove();
            this._subject.nextMove();
        }
        if (!action || !action.isMove()){
            if (this._subject.isActor() && !this._subject.isRestricted() && !this._subject.isAutoBattle()) {
                var x = this._subject.tx;
                var y = this._subject.ty;
                $gameSelectorTS.performTransfer(x, y);
                this._battlePhase = 'input';
            } else {
                this.setupAction();
            }
        }
    }
};

BattleManagerTS.setupAction = function() {
    this._action = this._subject.currentAction();
    if (this._action && this._action.isValid()) {
        // Make Targets here before.
        this.setupCombat(this._action);
        var subject = this._subject;
        var targets = this._action.makeTargets();
        this._targetIndex = -1;
        this._targets = targets;
        this.setDirectionTargets();
    }
    this._battlePhase = 'open';
};

BattleManagerTS.processAction = function() {
    var subject = this._subject;
    var action = subject.currentAction();
    this._action = action;
    if (action) {
        action.prepare();
        if (action.isValid()) {
            this.startAction();
        } else {  // last action
            this.endAction();
        }
    } else {
        this.endAction();
    }
};

BattleManagerTS.endAction = function() {
    $gameSelectorTS.updateSelect();  // target is dead
    $gameMap.eraseTiles();
    $gameTemp.setCancel(true);
    var subject = this._subject;
    subject.onAllActionsEnd();
    this._logWindow.displayAutoAffectedStatus(subject);
    this._logWindow.displayCurrentState(subject);
    this._logWindow.displayRegeneration(subject);
    this._battlePhase = 'close';
};

BattleManagerTS.updateClose = function() {
    this._battlePhase = 'start';
    this._subjectWindow.close();
    this._targetWindow.close();
    this._infoWindow.close();
    this._subject.onActionEnd();
    this._subject = null;
};

BattleManagerTS.startAction = function() {
    this._battlePhase = 'action';
    this._subject.useItem(this._action.item());
    this._action.applyGlobal();
    // legal to pass object argument in oop?
    this._logWindow.startAction(this._subject, this._action, this._targets);
};

BattleManagerTS.updateAction = function() {
    this._targetIndex++;
    var target = this._targets[this._targetIndex];
    if (target) {
        this.turnTowardCharacter(target);
        $gameSelectorTS.performTransfer(target.x, target.y);
        this.invokeAction(this._subject, target);
    } else {
        this._logWindow.endAction(this._subject);
        this.nextAction();
    }
};

BattleManagerTS.setDirectionTargets = function() {
    this._targets.forEach(function(target) {
        this.turnTowardCharacter(target);
    }, this);
};

BattleManagerTS.restoreDirectionTargets = function() {
    this._targets.forEach(function(target) {
        target.event().setDirection(2);
    }, this);
};

BattleManagerTS.nextAction = function() {
    this.restoreDirectionTargets();
    if (this._subject.nextAction() && this._subject.isActor() && !this._subject.isAutoBattle()) {
        this.processCancel();
        this._targetWindow.close();
        this._infoWindow.close();
        this._battlePhase = 'input';
    } else {
        this.processAction();
    }
};

BattleManagerTS.invokeAction = function(subject, target) {
    this._logWindow.push('pushBaseLine');
    if (Math.random() < this._action.itemCnt(target)) {
        this.invokeCounterAttack(subject, target);
    } else if (Math.random() < this._action.itemMrf(target)) {
        this.invokeMagicReflection(subject, target);
    } else {
        this.invokeNormalAction(subject, target);
    }
    subject.setLastTarget(target);
    this._logWindow.push('popBaseLine');
};

BattleManagerTS.invokeNormalAction = function(subject, target) {
    var realTarget = this.applySubstitute(target);
    this._action.apply(target);
    this._logWindow.displayActionResults(subject, target);
};

BattleManagerTS.invokeCounterAttack = function(subject, target) {
    var action = new Game_Action(target);
    action.setAttack();
    action.apply(subject);
    this._logWindow.displayCounter(target);
    this._logWindow.displayActionResults(target, subject);
};

BattleManagerTS.invokeMagicReflection = function(subject, target) {
    this._logWindow.displayReflection(target);
    this._action.apply(subject);
    this._logWindow.displayActionResults(subject, subject);
};

BattleManagerTS.applySubstitute = function(target) {
    if (this.checkSubstitute(target)) {
        var substitute = target.friendsUnit().substituteBattler();
        if (substitute && target !== substitute) {
            this._logWindow.displaySubstitute(substitute, target);
            return substitute;
        }
    }
    return target;
};

BattleManagerTS.checkSubstitute = function(target) {
    return target.isDying() && !this._action.isCertainHit();
};

BattleManagerTS.updateTurnEnd = function() {
    if (this._phase === 'playerPhase') {
        this.endPlayerPhase();
    } else {
        this.endEnemyPhase();
    }
};

BattleManagerTS.endPlayerPhase = function() {
    this._phase = 'enemyPhase';
    this._battlePhase = 'start';
    $gameTroopTS.members().forEach(function(enemy) {
        enemy.onTurnEnd();
        this._logWindow.displayAutoAffectedStatus(enemy);
        this._logWindow.displayRegeneration(enemy);
    }, this);
    $gamePartyTS.onTurnStart();
    $gameSelectorTS.setTransparent(true);
    $gameSelectorTS.savePosition();
    $gameMap.eraseTiles();
    this.makeEnemyOrders();
};

BattleManagerTS.endEnemyPhase = function() {
    this._phase = 'startPhase';
    this._battlePhase = 'start';
    $gamePartyTS.members().forEach(function(actor) {
        actor.onTurnEnd();
        this._logWindow.displayAutoAffectedStatus(actor);
        this._logWindow.displayRegeneration(actor);
    }, this);
    $gameSelectorTS.restorePosition();
    $gameSelectorTS.setTransparent(false);
    $gameMap.eraseTiles();
    //this.makeAllyOrders();
};

BattleManagerTS.setupCombat = function(action) {
    var gameFriends = action.friendsUnit();
    gameFriends.setupTS(action.combatFriendsUnit(this._subject));
    var gameOpponents = action.opponentsUnit();
    gameOpponents.setupTS(action.combatOpponentsUnit(this._subject));
};

BattleManagerTS.refreshRedCells = function(action) {
    $gameMap.eraseTiles();
    BattleManagerTS.setupCombat(action);
    $gameMap.setActionColor(action);
    action.showRange();
};

BattleManagerTS.turnTowardCharacter = function(character) {
    this._subject.turnTowardCharacter(character);
    character.turnTowardCharacter(this._subject);
};

BattleManagerTS.processCancel = function() {
    $gameMap.eraseTiles();
    var x = this._subject.x;
    var y = this._subject.y;
    $gameSelectorTS.performTransfer(x, y);
};

BattleManagerTS.checkBattleEnd = function() {
    if (this._phase && this._battlePhase === 'close') {
        if ($gamePartyTS.isAllDead()) {
            this.processDefeat();
            return true;
        } else if ($gameTroopTS.isAllDead() && TacticsSystem.clearAll) {
            this.processVictory();
            return true;
        }
    }
    return false;
};

BattleManagerTS.processVictory = function() {
    // to change
    this._subjectWindow.close();
    this._targetWindow.close();
    this._infoWindow.close();
    $gameSelectorTS.setTransparent(true);
    $gameParty.setupTS($gamePartyTS.members());
    $gameTroop.setupTS($gameTroopTS.members());
    $gameParty.removeBattleStates();
    $gameParty.performVictory();
    this.playVictoryMe();
    this.replayBgmAndBgs();
    this.makeRewards();
    this.displayVictoryMessage();
    this.displayRewards();
    this.gainRewards();
    this.endBattle(0);
};


BattleManager.processAbort = function() {
    $gameSelectorTS.setTransparent(true);
    $gameParty.setupTS($gamePartyTS.members());
    $gameTroop.setupTS($gameTroopTS.members());
    $gameParty.removeBattleStates();
    this.replayBgmAndBgs();
    this.endBattle(1);
};

BattleManagerTS.processDefeat = function() {
    $gameSelectorTS.setTransparent(true);
    this.displayDefeatMessage();
    this.playDefeatMe();
    if (this._canLose) {
        this.replayBgmAndBgs();
    } else {
        AudioManager.stopBgm();
    }
    this.endBattle(2);
};

BattleManagerTS.endBattle = function(result) {
    this._phase = 'battleEnd';
    $gameMap.eraseTiles();
    if (this._eventCallback) {
        this._eventCallback(result);
    }
    if (result === 0) {
        $gameSystem.onBattleWin();
    } else if (this._escaped) {
        $gameSystem.onBattleEscape();
    }
};

BattleManagerTS.playVictoryMe = function() {
    AudioManager.playMe($gameSystem.victoryMe());
};

BattleManagerTS.playDefeatMe = function() {
    AudioManager.playMe($gameSystem.defeatMe());
};

BattleManagerTS.makeRewards = function() {
    this._rewards = {};
    this._rewards.gold = $gameTroop.goldTotal();
    this._rewards.exp = $gameTroop.expTotal();
    this._rewards.items = $gameTroop.makeDropItems();
};

BattleManagerTS.replayBgmAndBgs = function() {
    // bgm and bgs in battlemanger !
    BattleManager.replayBgmAndBgs();
};

BattleManagerTS.displayVictoryMessage = function() {
    $gameMessage.add(TextManager.victory.format($gameParty.name()));
};

BattleManagerTS.displayDefeatMessage = function() {
    $gameMessage.add(TextManager.defeat.format($gameParty.name()));
};

BattleManagerTS.displayRewards = function() {
    this.displayExp();
    this.displayGold();
    this.displayDropItems();
};

BattleManagerTS.displayExp = function() {
    var exp = this._rewards.exp;
    if (exp > 0) {
        var text = TextManager.obtainExp.format(exp, TextManager.exp);
        $gameMessage.add('\\.' + text);
    }
};

BattleManagerTS.displayGold = function() {
    var gold = this._rewards.gold;
    if (gold > 0) {
        $gameMessage.add('\\.' + TextManager.obtainGold.format(gold));
    }
};

BattleManagerTS.displayDropItems = function() {
    var items = this._rewards.items;
    if (items.length > 0) {
        $gameMessage.newPage();
        items.forEach(function(item) {
            $gameMessage.add(TextManager.obtainItem.format(item.name));
        });
    }
};

BattleManagerTS.gainRewards = function() {
    this.gainExp();
    this.gainGold();
    this.gainDropItems();
};

BattleManagerTS.gainExp = function() {
    var exp = this._rewards.exp;
    $gameParty.allMembers().forEach(function(actor) {
        actor.gainExp(exp);
    });
};

BattleManagerTS.gainGold = function() {
    $gameParty.gainGold(this._rewards.gold);
};

BattleManagerTS.gainDropItems = function() {
    var items = this._rewards.items;
    items.forEach(function(item) {
        $gameParty.gainItem(item, 1);
    });
};

BattleManagerTS.updateBattleEnd = function() {
    if (!this._escaped && $gameParty.isAllDead() || TacticsSystem.isDefeated) {
        if (this._canLose) {
            $gameParty.reviveBattleMembers();
            SceneManager.pop();
        } else {
            SceneManager.goto(Scene_Gameover);
        }
    } else {
        SceneManager.pop();
    }
    this._phase = null;
    this.terminate();
};

BattleManagerTS.onAllTurnEnd = function() {
    this._battlePhase = 'turnEnd';
    $gamePartyTS.onAllTurnEnd();
};

BattleManagerTS.terminate = function() {
    $gameSwitches.setValue(TacticsSystem.battleStartId, false);
    $gamePlayer.setThrough(false);
    $gamePlayer.refresh();
    $gamePartyTS.onBattleEnd();
    $gameTroopTS.onBattleEnd();
    $gamePartyTS.clear();
    $gameTroopTS.clear();
};

//-----------------------------------------------------------------------------
// Game_SelectorTS
//
// The game object class for the selector.

function Game_SelectorTS() {
    this.initialize.apply(this);
}

Game_SelectorTS.prototype.constructor = Game_SelectorTS;

Object.defineProperties(Game_SelectorTS.prototype, {
    x: { get: function() { return this._x; }, configurable: true },
    y: { get: function() { return this._y; }, configurable: true }
});

Game_SelectorTS.prototype.initialize = function() {
    this.initMembers();
};

Game_SelectorTS.prototype.initMembers = function() {
    this._x = 0;
    this._y = 0;
    this._realX = 0;
    this._realY = 0;
    this._direction = 0;
    this._speed = TacticsSystem.cursorSpeed + 3 || 5;
    this._wait = 0;
    this._selectIndex = -1;
    this._isMoving = false;
    this._transparent = false;
    this._scrolledX = 0;
    this._scrolledY = 0;
    this._active = true;
    this._reachedDest = false;
};

Game_SelectorTS.prototype.pos = function(x, y) {
    return this.x === x && this.y === y;
};

Game_SelectorTS.prototype.setPosition = function(x, y) {
    this._realX = this._x = x;
    this._realY = this._y = y;
};

Game_SelectorTS.prototype.isWaiting = function() {
    return this._wait > 0;
};

Game_SelectorTS.prototype.activate = function() {
    this._active = true;
};

Game_SelectorTS.prototype.deactivate = function() {
    this._active = false;
};

Game_SelectorTS.prototype.select = function() {
    return this.battlers()[this._selectIndex];
};

Game_SelectorTS.prototype.isMoving = function() {
    return this._isMoving;
};

Game_SelectorTS.prototype.getInputDirection = function() {
    return Input.dir4;
};

Game_SelectorTS.prototype.updateMoveByInput = function() {
    if (BattleManagerTS.isActive()) {
        this.moveByInput();
    }
};

Game_SelectorTS.prototype.update = function() {
    this._isMoving = false;
    this.moveByDestination();
    this.updateMove();
    // don't update scrool here if destination...
    if (!$gameMap.isDestinationValid()) {
        this.updateScroll(this._scrolledX, this._scrolledY);
    }
    this.updateWait();
    this._scrolledX = this.scrolledX();
    this._scrolledY = this.scrolledY();
};

Game_SelectorTS.prototype.distancePerFrame = function() {
    return Math.pow(2, this._speed) / 256;
};

Game_SelectorTS.prototype.updateWait = function() {
    if (this.isWaiting()) {
        this._wait -= this.distancePerFrame();
    }
};

Game_SelectorTS.prototype.canMove = function() {
    return !$gameMap.isEventRunning() && !$gameMessage.isBusy() &&
        this._active;
};

Game_SelectorTS.prototype.moveByInput = function() {
    var direction = this.getInputDirection();
    if (this.canMove() && !this.isWaiting() && direction > 0) {
        var x = $gameMap.roundXWithDirection(this.x, direction);
        var y = $gameMap.roundYWithDirection(this.y, direction);
        if (this.isValid(x, y)) {
            SoundManager.playCursor();
            this.executeMove(x, y, direction);
            this.updateSelect();
        }
    }
};

Game_SelectorTS.prototype.moveByDestination = function() {
    if (this.canMove() && !this.isWaiting() && $gameTemp.isDestinationValid()) {
        var x = $gameTemp.destinationX();
        var y = $gameTemp.destinationY();
        direction = this.findDirectionTo(x, y);
        if (direction > 0) {
            x = $gameMap.roundXWithDirection(this.x, direction);
            y = $gameMap.roundYWithDirection(this.y, direction);
            this.executeMove(x, y, direction);
            this.updateSelect();
        } else {
            this._isMoving = true;
            this._reachedDest = true;
            $gameTemp.clearDestination();
        }
    }
};

Game_SelectorTS.prototype.findDirectionTo = function(x, y) {
    if (this.y < y) {
        return 2;
    }
    if (this.x > x) {
        return 4;
    }
    if (this.x < x) {
        return 6;
    }
    if (this.y > y) {
        return 8;
    }
    return 0;
};

Game_SelectorTS.prototype.executeMove = function(x, y, direction) {
    this._wait = 1;
    this._isMoving = true;
    this._x = x;
    this._y = y;
    this._direction = direction;
};

Game_SelectorTS.prototype.performTransfer = function(x, y) {
    this._x = this._realX = x;
    this._y = this._realY = y;
    $gameMap.performScroll(x, y);
    this.updateSelect();
};

Game_SelectorTS.prototype.isValid = function(x, y) {
    return x >= 0 && y >= 0 && x < $gameMap.width() && y < $gameMap.height();
};

Game_SelectorTS.prototype.updateMove = function() {
    if (this._x < this._realX) {
        this._realX = Math.max(this._realX - this.distancePerFrame(), this._x);
    }
    if (this._x > this._realX) {
        this._realX = Math.min(this._realX + this.distancePerFrame(), this._x);
    }
    if (this._y < this._realY) {
        this._realY = Math.max(this._realY - this.distancePerFrame(), this._y);
    }
    if (this._y > this._realY) {
        this._realY = Math.min(this._realY + this.distancePerFrame(), this._y);
    }
};

Game_SelectorTS.prototype.battlers = function() {
    return $gamePartyTS.members().concat($gameTroopTS.members());
};

Game_SelectorTS.prototype.updateSelect = function() {
    this._selectIndex = -1;
    for (var i = 0; i < this.battlers().length; i++) {
        var battler = this.battlers()[i];
        if (this.pos(battler.x, battler.y)) {
            if (battler.isAlive()) {
                this._selectIndex = i;
            }
        }
    }
};

Game_SelectorTS.prototype.updateScroll = function(lastScrolledX, lastScrolledY) {
    var x1 = lastScrolledX;
    var y1 = lastScrolledY;
    var x2 = this.scrolledX();
    var y2 = this.scrolledY();
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

Game_SelectorTS.prototype.centerX = function() {
    return (Graphics.width / $gameMap.tileWidth() - 1) / 2.0;
};

Game_SelectorTS.prototype.centerY = function() {
    return (Graphics.height / $gameMap.tileHeight() - 1) / 2.0;
};

Game_SelectorTS.prototype.moveTo = function(x, y) {
    $gameTemp.setDestination(x, y);
};

Game_SelectorTS.prototype.savePosition = function() {
    $gameTemp.setPosition(this.x, this.y);
};

Game_SelectorTS.prototype.restorePosition = function() {
    if ($gameTemp.isPositionValid()) {
        var positionX = $gameTemp.positionX();
        var positionY = $gameTemp.positionY();
        this.performTransfer(positionX, positionY);
    }
};

Game_SelectorTS.prototype.scrolledX = function() {
    return $gameMap.adjustX(this._realX);
};

Game_SelectorTS.prototype.scrolledY = function() {
    return $gameMap.adjustY(this._realY);
};

Game_SelectorTS.prototype.screenX = function() {
    var tw = $gameMap.tileWidth();
    return Math.round($gameMap.adjustX(this.x) * tw);
};

Game_SelectorTS.prototype.screenY = function() {
    var th = $gameMap.tileHeight();
    return Math.round($gameMap.adjustY(this.y) * th);
};

Game_SelectorTS.prototype.isOk = function() {
    return Input.isTriggered('ok') || this.triggerTouchAction();
};

Game_SelectorTS.prototype.isCancelled = function() {
    return Input.isTriggered('menu') || TouchInput.isCancelled();
};

Game_SelectorTS.prototype.triggerTouchAction = function() {
    if (this._reachedDest) {
        this._reachedDest = false;
        return true;
    }
    return false;
};

Game_SelectorTS.prototype.setTransparent = function(transparent) {
    this._transparent = transparent;
};

Game_SelectorTS.prototype.isTransparent = function() {
    return this._transparent;
};

Game_SelectorTS.prototype.isBusy = function() {
    return ($gameMap.isDestinationValid() || $gameTemp.isDestinationValid());
};

//-----------------------------------------------------------------------------
// Game_UnitTS
//
// The superclass of Game_PartyTS and Game_TroopTS.

function Game_UnitTS() {
    this.initialize.apply(this, arguments);
}

Game_UnitTS.prototype.initialize = function() {
    this._inBattle = false;
};

Game_UnitTS.prototype.members = function() {
    return [];
};

Game_UnitTS.prototype.updateActive = function() {
    this.members().forEach(function(member) {
        member.updateActive();
    });
};

Game_UnitTS.prototype.aliveMembers = function() {
    return this.members().filter(function(member) {
        return member.isAlive();
    });
};

Game_UnitTS.prototype.isAllDead = function() {
    return this.aliveMembers().length === 0;
};

Game_UnitTS.prototype.onTurnStart = function() {
    this.members().forEach(function(member) {
        member.onTurnStart();
    });
};

Game_UnitTS.prototype.canActionMembers = function() {
    return this.aliveMembers().filter(function(member) {
        return member.canAction();
    });
};

Game_UnitTS.prototype.isPhase = function() {
    return this.canActionMembers().length > 0;
};

//-----------------------------------------------------------------------------
// Game_PartyTS
//
// The game object class for a party tactic.

function Game_PartyTS() {
    this.initialize.apply(this, arguments);
}

Game_PartyTS.prototype = Object.create(Game_UnitTS.prototype);
Game_PartyTS.prototype.constructor = Game_PartyTS;

Game_PartyTS.prototype.initialize = function() {
    Game_UnitTS.prototype.initialize.call(this);
    this.clear();
};

Game_PartyTS.prototype.members = function() {
    return this._actors.map(function(id) {
        return $gameActors.actor(id);
    });
};

Game_PartyTS.prototype.clear = function() {
    this._actors = [];
    this._maxBattleMembers = 0;
    this._inBattle = false;
};

Game_PartyTS.prototype.maxBattleMembers = function() {
    return this._maxBattleMembers;
};

Game_PartyTS.prototype.addActor = function(actorId, event, needRefresh) {
    if (!this._actors.contains(actorId)) {
        var actor = $gameActors.actor(actorId);
        var eventId = event.eventId();
        actor.setupEvent(eventId);
        this._maxBattleMembers++;
        this._actors.push(actorId);
        if (needRefresh) {
            actor.refreshImage();
        }
    }
};

Game_PartyTS.prototype.actors = function() {
    return this._actors;
};

Game_PartyTS.prototype.removeActor = function() {
};

Game_PartyTS.prototype.onBattleStart = function() {
    this._inBattle = true;
    $gameParty.onBattleStart();
};

Game_PartyTS.prototype.inBattle = function() {
    return this._inBattle;
};

Game_PartyTS.prototype.allMembers = function() {
    return this._actors.map(function(id) {
        return $gameActors.actor(id);
    });
};

Game_PartyTS.prototype.restrictedMembers = function() {
    return this.members().filter(function(member) {
        return (member.isRestricted() || member.isAutoBattle()) && member.isAlive();
    }, this);
};

Game_PartyTS.prototype.onAllTurnEnd = function() {
    this.aliveMembers().forEach(function(actor) {
        actor.onActionEnd();
    });
};

Game_PartyTS.prototype.onBattleEnd = function() {
    // call through event !
    $gameParty.onBattleEnd();
    this._inBattle = false;
};

//-----------------------------------------------------------------------------
// Game_TroopTS
//
// The game object class for a troop tactic.

function Game_TroopTS() {
    this.initialize.apply(this, arguments);
}

Game_TroopTS.prototype = Object.create(Game_UnitTS.prototype);
Game_TroopTS.prototype.constructor = Game_TroopTS;

Game_TroopTS.prototype.initialize = function() {
    Game_UnitTS.prototype.initialize.call(this);
    this.clear();
};

Game_TroopTS.prototype.clear = function() {
    this._enemies = [];
    this._inBattle = false;
    this._needStart = true;
};

Game_TroopTS.prototype.addEnemy = function(enemy, event) {
    var eventId = event.eventId();
    if (event.tparam('index') > 0) {
        index = event.tparam('index') - 1;
        this._enemies.splice(index, 0, enemy);
    } else {
        this._enemies.push(enemy);
    }
    enemy.setupEvent(eventId);
    //if (member.hidden) {
    //    enemy.hide();
    //}
};

Game_TroopTS.prototype.onBattleStart = function() {
    this._inBattle = true;
    $gameTroop.onBattleStart();
};

Game_TroopTS.prototype.members = function() {
    return this._enemies.slice(0);
};

Game_TroopTS.prototype.battleMembers = function() {
    return this.members().filter(function(enemy) {
        return enemy.isAppeared();
    });
};

Game_TroopTS.prototype.onBattleEnd = function() {
    $gameTroop.onBattleEnd();
    this._inBattle = false;
};

Game_TroopTS.prototype.needDisplayStart = function() {
    return this._needStart;
};

Game_TroopTS.prototype.setNeedStart = function(value) {
    this._needStart = value;
};

//-----------------------------------------------------------------------------
// Window_ActorCommandTS
//
// The window for selecting an actor's action on the battle screen.

function Window_ActorCommandTS() {
    this.initialize.apply(this, arguments);
}

Window_ActorCommandTS.prototype = Object.create(Window_ActorCommand.prototype);
Window_ActorCommandTS.prototype.constructor = Window_ActorCommandTS;

Window_ActorCommandTS.prototype.initialize = function() {
    var x = Graphics.boxWidth - this.windowWidth();
    var y = Graphics.boxHeight - this.windowHeight();
    Window_Command.prototype.initialize.call(this, x, y);
    this.openness = 0;
    this.deactivate();
    this._actor = null;
};

Window_ActorCommandTS.prototype.setup = function(actor) {
    this._actor = actor;
    this.refresh();
    // refresh clear and make command !
    // don't need to call methods
    // this.clearCommand();
    // this.makeCommand();
    this.selectLast();
    this.activate();
    this.open();
};

Window_ActorCommandTS.prototype.makeCommandList = function() {
    if (this._actor) {
        this.addActionCommand();
        this.addAttackCommand();
        this.addSkillCommands();
        if (this._actor.canGuard()) {
            this.addGuardCommand();
        } else {
            this.addWaitCommand();
        }
        this.addItemCommand();
    }
};

Window_ActorCommandTS.prototype.addActionCommand = function() {
    this._actor.checkEventTriggerThere();
    this._actor.actionsButton().forEach(function(eventId) {
        var event = $gameMap.event(eventId);
        this.addCommand(event.name(), 'event');
    }, this);
};

Window_ActorCommandTS.prototype.addWaitCommand = function() {
    this.addCommand(TacticsSystem.wait, 'wait', true);
};


//-----------------------------------------------------------------------------
// Window_BattleStatusTS
//
// The window for displaying the unit status on the battle screen.

function Window_BattleStatusTS() {
    this.initialize.apply(this, arguments);
}

Window_BattleStatusTS.prototype = Object.create(Window_Base.prototype);
Window_BattleStatusTS.prototype.constructor = Window_BattleStatusTS;

Window_BattleStatusTS.prototype.initialize = function() {
    var y = Graphics.boxHeight - (this.windowHeight());
    var width = this.windowWidth();
    var height = this.windowHeight();
    Window_Base.prototype.initialize.call(this, 0, y, width, height);
    this.openness = 0;
    this._battler = null;
};

Window_BattleStatusTS.prototype.windowWidth = function() {
    return 816/2 - 32;
};

Window_BattleStatusTS.prototype.windowHeight = function() {
    return this.fittingHeight(this.numVisibleRows());
};

Window_BattleStatusTS.prototype.numVisibleRows = function() {
    return 4;
};

Window_BattleStatusTS.prototype.open = function(battler) {
    if (battler) {
        this._battler = battler;
    }
    this.refresh();
    Window_Base.prototype.open.call(this);
};

Window_BattleStatusTS.prototype.refresh = function() {
    this.contents.clear();
    if (this._battler) {
        this.drawBattlerStatus();
    }
};

Window_BattleStatusTS.prototype.drawBattlerStatus = function() {
    if (this._battler.isActor()) {
        this.drawActorFace(this._battler, 0, 0, Window_Base._faceWidth, Window_Base._faceHeight);
        this.drawActorSimpleStatus(this._battler, 0, 0, 376);
    } else {
        this.drawEnemyImage(this._battler, 0, 0);
        this.drawEnemySimpleStatus(this._battler, 0, 0, 376);
    }
};

Window_BattleStatusTS.prototype.drawActorSimpleStatus = function(actor, x, y, width) {
    var lineHeight = this.lineHeight();
    var x2 = x + 150;
    var width2 = Math.min(200, width - 180 - this.textPadding());
    this.drawActorName(actor, x, y);
    this.drawActorLevel(actor, x, y + lineHeight * 1);
    this.drawActorIcons(actor, x, y + lineHeight * 2);
    this.drawActorClass(actor, x2, y);
    if ($dataSystem.optDisplayTp) {
        this.drawActorHp(actor, x2, y + lineHeight * 1, width2);
        this.drawActorMp(actor, x2, y + lineHeight * 2, width2);
        this.drawActorTp(actor, x2, y + lineHeight * 3, width2);
    } else {
        this.drawActorHp(actor, x2, y + lineHeight * 1, width2);
        this.drawActorMp(actor, x2, y + lineHeight * 2, width2);
    }
};

Window_BattleStatusTS.prototype.drawEnemySimpleStatus = function(enemy, x, y, width) {
    var lineHeight = this.lineHeight();
    var x2 = x + 150;
    var width2 = Math.min(200, width - 180 - this.textPadding());
    this.drawActorName(enemy, x2, y);
    this.drawActorHp(enemy, x2, y + lineHeight * 1, width2);
    this.drawActorMp(enemy, x2, y + lineHeight * 2, width2);
};

Window_BattleStatusTS.prototype.drawEnemyImage = function(battler, x, y) {
    width = Window_Base._faceWidth;
    height = Window_Base._faceHeight;
    var bitmap = ImageManager.loadEnemy(battler.battlerName());
    var pw = bitmap.width;
    var ph = bitmap.height;
    var sw = Math.min(width, pw);
    var sh = Math.min(height, ph);
    var dx = Math.floor(x + Math.max(width - pw, 0) / 2);
    var dy = Math.floor(y + Math.max(height - ph, 0) / 2);
    var q = 150 / Math.max(bitmap.width, bitmap.height)
    this.contents.blt(bitmap, 0, 0, pw, ph, 0, 0, bitmap.width * q, bitmap.height * q);
};

//-----------------------------------------------------------------------------
// Window_BattleSkillTS
//
// The window for selecting a skill to use on the battle screen.

function Window_BattleSkillTS() {
    this.initialize.apply(this, arguments);
}

Window_BattleSkillTS.prototype = Object.create(Window_BattleSkill.prototype);
Window_BattleSkillTS.prototype.constructor = Window_BattleSkillTS;

Window_BattleSkillTS.prototype.processCursorMove = function() {
    var lastIndex = this.index();
    Window_BattleSkill.prototype.processCursorMove.call(this);
    if (this.index() !== lastIndex) {
        this.refreshRedCells();
    }
};

Window_BattleSkillTS.prototype.show = function() {
    Window_BattleSkill.prototype.show.call(this);
    if (this.item()) {
        this.refreshRedCells();
    }
};

Window_BattleSkillTS.prototype.onTouch = function(triggered) {
    var lastIndex = this.index();
    Window_BattleSkill.prototype.onTouch.call(this, triggered);
    if (this.index() !== lastIndex) {
        this.refreshRedCells();
    }
};

Window_BattleSkillTS.prototype.refreshRedCells = function() {
    var action = BattleManagerTS.inputtingAction();
    action.setSkill(this.item().id);
    BattleManagerTS.refreshRedCells(action);
};

//-----------------------------------------------------------------------------
// Window_BattleItemTS
//
// The window for selecting a item to use on the battle screen.

function Window_BattleItemTS() {
    this.initialize.apply(this, arguments);
}

Window_BattleItemTS.prototype = Object.create(Window_BattleItem.prototype);
Window_BattleItemTS.prototype.constructor = Window_BattleItemTS;

Window_BattleItemTS.prototype.processCursorMove = function() {
    var lastIndex = this.index();
    Window_BattleItem.prototype.processCursorMove.call(this);
    if (this.index() !== lastIndex) {
        var action = BattleManagerTS.inputtingAction();
        action.setItem(this.item().id);
        BattleManagerTS.refreshRedCells(action);
    }
};

Window_BattleItemTS.prototype.show = function() {
    Window_BattleItem.prototype.show.call(this);
    if (this.item()) {
        var action = BattleManagerTS.inputtingAction();
        action.setItem(this.item().id);
        BattleManagerTS.refreshRedCells(action);
    }
};

//-----------------------------------------------------------------------------
// Window_BattleInfoTS
//
// The window for displaying the combat information on the battle screen.

function Window_BattleInfoTS() {
    this.initialize.apply(this, arguments);
}

Window_BattleInfoTS.prototype = Object.create(Window_Base.prototype);
Window_BattleInfoTS.prototype.constructor = Window_BattleInfoTS;

Window_BattleInfoTS.prototype.initialize = function() {
    var width = this.windowWidth();
    var height = this.windowHeight();
    Window_Base.prototype.initialize.call(this, 0, 0, width, height);
    this.openness = 0;
};

Window_BattleInfoTS.prototype.windowWidth = function() {
    return 816/2 - 32;
};

Window_BattleInfoTS.prototype.windowHeight = function() {
    return this.fittingHeight(this.numVisibleRows());
};

Window_BattleInfoTS.prototype.numVisibleRows = function() {
    return 1;
};

Window_BattleInfoTS.prototype.open = function(battlerTS) {
    this.refresh(battlerTS);
    Window_Base.prototype.open.call(this);
};

Window_BattleInfoTS.prototype.refresh = function(battler) {
    this.contents.clear();
    this.drawItem(battler);
};

Window_BattleInfoTS.prototype.drawItem = function(battler) {
    this.drawDamage(battler, 0, 0, 80);
    this.drawHit(battler, 130, 0, 80);
    this.drawCri(battler, 235, 0, 80);
};

Window_BattleInfoTS.prototype.drawBattlerLevel = function(actor, x, y) {
    this.changeTextColor(this.systemColor());
    this.drawText(TextManager.levelA, x, y, 48);
    this.resetTextColor();
    this.drawText(actor.level, x, y, 36, 'right');
};

Window_BattleInfoTS.prototype.drawBattlerHp = function(actor, x, y, width) {
    width = width || 186;
    this.changeTextColor(this.systemColor());
    this.drawText(TextManager.hpA, x, y, 44);
    this.drawCurrentAndMax(actor.hp, actor.mhp, x, y, width,
                           this.hpColor(actor), this.normalColor());
};

Window_BattleInfoTS.prototype.drawBattlerMp = function(actor, x, y, width) {
    width = width || 186;
    this.changeTextColor(this.systemColor());
    this.drawText(TextManager.mpA, x, y, 44);
    this.drawCurrentAndMax(actor.mp, actor.mmp, x, y, width,
                           this.mpColor(actor), this.normalColor());
};

Window_BattleInfoTS.prototype.drawCurrentAndMax = function(current, max, x, y,
                                                                  width, color1, color2) {
    var labelWidth = this.textWidth('HP');
    var valueWidth = this.textWidth('00');
    var slashWidth = this.textWidth('/');
    var x1 = x + width - valueWidth;
    var x2 = x1 - slashWidth;
    var x3 = x2 - valueWidth;
    this.changeTextColor(color1);
    this.drawText(current, x3, y, valueWidth, 'right');
    this.changeTextColor(color2);
    this.drawText('/', x2, y, slashWidth, 'right');
    this.drawText(max, x1, y, valueWidth, 'right');
};

Window_BattleInfoTS.prototype.drawDamage = function(actor, x, y, width) {
    var action = BattleManagerTS.inputtingAction();
    this.drawDamageType(actor, x, y, width);
    var minHit = Math.abs(action.testDamageMinMaxValue(actor, false));
    var maxHit = Math.abs(action.testDamageMinMaxValue(actor, true));
    this.drawText(minHit + '-' + maxHit, x + 45, 0, 65, 'right');
};

Window_BattleInfoTS.prototype.drawDamageType = function(actor, x, y, width) {
    var action = BattleManagerTS.inputtingAction();
    this.changeTextColor(this.systemColor());
    if (action.isDamage()) {
        this.drawText(TacticsSystem.damageTerm, x, 0, 30);
    } else if (action.isRecover()) {
        this.drawText(TacticsSystem.recoverTerm, x, 0, 30);
    } else {
        this.drawText(TacticsSystem.drainTerm, x, 0, 30);
    }
    this.resetTextColor();
};

Window_BattleInfoTS.prototype.drawHit = function(actor, x, y, width) {
    this.changeTextColor(this.systemColor());
    this.drawText(TacticsSystem.hitRateTerm, x, y, 30);
    this.resetTextColor();
    var action = BattleManagerTS.inputtingAction();
    var hit = action.itemHit(actor) * 100 + '%';
    this.drawText(hit, x + 35, y, 50, 'right');
};

Window_BattleInfoTS.prototype.drawCri = function(actor, x, y, width) {
    this.changeTextColor(this.systemColor());
    this.drawText(TacticsSystem.criticalRateTerm, x, y, 30);
    this.resetTextColor();
    var action = BattleManagerTS.inputtingAction();
    var hit = action.itemCri(actor) * 100 + '%';
    this.drawText(hit, x + 35, y, 50, 'right');
};

//-----------------------------------------------------------------------------
// Window_BattleMap
//
// The window for displaying essential commands for progressing though the game.

function Window_BattleMap() {
    this.initialize.apply(this, arguments);
}

Window_BattleMap.prototype = Object.create(Window_MenuCommand.prototype);
Window_BattleMap.prototype.constructor = Window_BattleMap;

Window_BattleMap.prototype.initialize = function(x, y) {
    Window_MenuCommand.prototype.initialize.call(this, x, y);
    this.selectLast();
    this.hide();
    this.deactivate();
};

Window_BattleMap._lastCommandSymbol = null;

Window_BattleMap.initCommandPosition = function() {
    this._lastCommandSymbol = null;
};

Window_BattleMap.prototype.windowWidth = function() {
    return 240;
};

Window_BattleMap.prototype.numVisibleRows = function() {
    return this.maxItems();
};

Window_BattleMap.prototype.addMainCommands = function() {
    var enabled = this.areMainCommandsEnabled();
    this.addCommand(TacticsSystem.endTurnTerm, 'endTurn');
    if (this.needsCommand('equip')) {
        this.addCommand(TextManager.equip, 'equip', enabled);
    }
    if (this.needsCommand('status')) {
        this.addCommand(TextManager.status, 'status', enabled);
    }
};

Window_BattleMap.prototype.addOriginalCommands = function() {
};

Window_BattleMap.prototype.addSaveCommand = function() {
};

Window_BattleMap.prototype.addFormationCommand = function() {
};

Window_BattleMap.prototype.selectLast = function() {
    this.selectSymbol(Window_BattleMap._lastCommandSymbol);
};

//-----------------------------------------------------------------------------
// Window_MenuStatusTS
//
// The window for displaying party member status on the menu screen.

function Window_MenuStatusTS() {
    this.initialize.apply(this, arguments);
}

Window_MenuStatusTS.prototype = Object.create(Window_MenuStatus.prototype);
Window_MenuStatusTS.prototype.constructor = Window_MenuStatusTS;

Window_MenuStatusTS.prototype.maxItems = function() {
    return $gamePartyTS.members().length;
};

Window_MenuStatusTS.prototype.processOk = function() {
    Window_Selectable.prototype.processOk.call(this);
    $gameParty.setMenuActor($gamePartyTS.members()[this.index()]);
};

Window_MenuStatusTS.prototype.isCurrentItemEnabled = function() {
    if (this._formationMode) {
        var actor = $gamePartyTS.members()[this.index()];
        return actor && actor.isFormationChangeOk();
    } else {
        return true;
    }
};

Window_MenuStatusTS.prototype.selectLast = function() {
    this.select($gameParty.menuActor().index() || 0);
};

Window_MenuStatusTS.prototype.drawItemImage = function(index) {
    var actor = $gamePartyTS.members()[index];
    var rect = this.itemRect(index);
    this.changePaintOpacity(actor.isBattleMember());
    this.drawActorFace(actor, rect.x + 1, rect.y + 1, Window_Base._faceWidth, Window_Base._faceHeight);
    this.changePaintOpacity(true);
};

Window_MenuStatusTS.prototype.drawItemStatus = function(index) {
    var actor = $gamePartyTS.members()[index];
    var rect = this.itemRect(index);
    var x = rect.x + 162;
    var y = rect.y + rect.height / 2 - this.lineHeight() * 1.5;
    var width = rect.width - x - this.textPadding();
    this.drawActorSimpleStatus(actor, x, y, width);
};

//-----------------------------------------------------------------------------
// Sprite_SelectorTS
//
// The sprite for displaying a selector.

function Sprite_SelectorTS() {
    this.initialize.apply(this, arguments);
};

Sprite_SelectorTS.prototype = Object.create(Sprite_Base.prototype);
Sprite_SelectorTS.prototype.constructor = Sprite_SelectorTS;

Sprite_SelectorTS.prototype.initialize = function() {
    Sprite_Base.prototype.initialize.call(this);
    this.loadBitmap();
};

Sprite_SelectorTS.prototype.loadBitmap = function() {
    this.bitmap = ImageManager.loadSystem('Selector');
};

Sprite_SelectorTS.prototype.update = function() {
    Sprite_Base.prototype.update.call(this);
    this.updateVisibility();
    this.x = $gameSelectorTS.screenX();
    this.y = $gameSelectorTS.screenY();
};

Sprite_SelectorTS.prototype.updateVisibility = function() {
    Sprite_Base.prototype.updateVisibility.call(this);
    this.visible = !$gameSelectorTS.isTransparent();
};

//-----------------------------------------------------------------------------
// Sprite_GridTS
//
// The sprite for displaying a grid.

// move to spriteset
function Sprite_GridTS() {
    this.initialize.apply(this, arguments);
};

Sprite_GridTS.prototype = Object.create(Sprite_Base.prototype);
Sprite_GridTS.prototype.constructor = Sprite_GridTS;

Sprite_GridTS.prototype.initialize = function() {
    Sprite_Base.prototype.initialize.call(this);
    this.setFrame(0, 0, Graphics.width, Graphics.height);
    this.createBitmap();
    this.z = 1;
    this.opacity = TacticsSystem.gridOpacity || 60;
};

Sprite_GridTS.prototype.createBitmap = function() {
    var width = $gameMap.width();
    var height = $gameMap.height();
    this.bitmap = new Bitmap(width * 48, height * 48);
    for (var x = 0; x < width; x++) {
        this.bitmap.drawLine(48 * x, 0, 48 * x, height * 48);
    }
    for (var y = 0; y < height; y++) {
        this.bitmap.drawLine(0, 48 * y, width * 48, 48 * y);
    }
};

Sprite_GridTS.prototype.update = function() {
    Sprite_Base.prototype.update.call(this);
    var screen = $gameScreen;
    var scale = screen.zoomScale();
    this.scale.x = scale;
    this.scale.y = scale;
    this.x = Math.round($gameMap.adjustX(0) * 48);
    this.y = Math.round($gameMap.adjustY(0) * 48);
    this.x += Math.round(screen.shake());
};

//-----------------------------------------------------------------------------
// Spriteset_MapTS
//
// The set of sprites on the map screen.

function Spriteset_MapTS() {
    this.initialize.apply(this, arguments);
}

Spriteset_MapTS.prototype = Object.create(Spriteset_Map.prototype);
Spriteset_MapTS.prototype.constructor = Spriteset_MapTS;

Spriteset_MapTS.prototype.initialize = function() {
    Spriteset_Map.prototype.initialize.call(this);
    this.createSelector();
    this.createActors();
    this.createEnemies();
    this.createStart();
    this.createGrid();
};

Spriteset_MapTS.prototype.createLowerLayer = function() {
    Spriteset_Map.prototype.createLowerLayer.call(this);
    this.createBaseTiles();
};

Spriteset_MapTS.prototype.createBaseTiles = function() {
    this._tilesSprite = new Sprite_Base();
    this._tilesSprite.z = 1;
    this._rangeTilesSprite = this.createTiles(TacticsSystem.moveScopeColor);
    this._tilemap.addChild(this._tilesSprite);
};

Spriteset_MapTS.prototype.createSelector = function() {
    this._selectorSprite = new Sprite_SelectorTS();
    this._selectorSprite.z = 1;
    this._tilemap.addChild(this._selectorSprite);
};

Spriteset_MapTS.prototype.createTiles = function(color) {
    var tilesSprite = new Sprite_Base();
    var width = $gameMap.width();
    var height = $gameMap.height();
    tilesSprite.bitmap = new Bitmap(width * 48, height * 48);
    tilesSprite.opacity = 120;
    tilesSprite.color = color;
    this._tilesSprite.addChild(tilesSprite);
    return tilesSprite
};

Spriteset_MapTS.prototype.updateRangeTiles = function() {
    this._rangeTiles = $gameMap.tiles();
    var width = $gameMap.width();
    var height = $gameMap.height();
    this._rangeTilesSprite.bitmap.clearRect(0, 0, width * 48, height * 48);
    this._rangeTilesSprite.color = $gameMap.color();
    this._rangeTiles.forEach(function(tile) {
        var x = $gameMap.positionTileX(tile) * 48;
        var y = $gameMap.positionTileY(tile) * 48;
        var color = this._rangeTilesSprite.color;
        this._rangeTilesSprite.bitmap.fillRect(x + 2, y + 2, 44, 44, color);
    }, this);
};

Spriteset_MapTS.prototype.updateTiles = function() {
    if (this._rangeTiles !== $gameMap.tiles()) {
        this.updateRangeTiles();
    }
    this._tilesSprite.x = $gameScreen.zoomScale();
    this._tilesSprite.y = $gameScreen.zoomScale();
    this._tilesSprite.x = Math.round($gameMap.adjustX(0) * 48);
    this._tilesSprite.y = Math.round($gameMap.adjustY(0) * 48);
    this._tilesSprite.x += Math.round($gameScreen.shake());
};

Spriteset_MapTS.prototype.createCharacters = function() {
    this._characterSprites = [];
    $gameMap.events().forEach(function(event) {
        var sprite = null;
        if (event.isActor() || event.isEnemy()) {
            sprite = new Sprite_BattlerTS(event);
        } else {
            sprite = new Sprite_Character(event);
        }
        this._characterSprites.push(sprite);
    }, this);
    for (var i = 0; i < this._characterSprites.length; i++) {
        this._tilemap.addChild(this._characterSprites[i]);
    }
};

Spriteset_MapTS.prototype.createActors = function() {
    this._actorSprites = [];
    this._characterSprites.forEach(function(sprite) {
        var event = sprite.character();
        if (event.isActor()) {
            this._actorSprites.push(sprite);
        }
    }, this);
};

Spriteset_MapTS.prototype.createEnemies = function() {
    this._enemySprites = [];
    this._characterSprites.forEach(function(sprite) {
        var event = sprite.character();
        if (event.isEnemy()) {
            this._enemySprites.push(sprite);
        }
    }, this);
};

Spriteset_MapTS.prototype.battlerSprites = function() {
    return this._enemySprites.concat(this._actorSprites);
};

Spriteset_MapTS.prototype.createGrid = function() {
    this._tilemap.addChild(new Sprite_GridTS());
};

Spriteset_MapTS.prototype.update = function() {
    Spriteset_Map.prototype.update.call(this);
    this.updateTiles();
};

Spriteset_MapTS.prototype.isBusy = function() {
    return this.isAnimationPlaying() || this.isAnyoneMoving();
};

Spriteset_MapTS.prototype.isAnimationPlaying = function() {
    for (var i = 0; i < this._characterSprites.length; i++) {
        if (this._characterSprites[i].isAnimationPlaying()) {
            return true;
        }
    }
    if (this._startSprite.isPlaying()) {
        return true;
    }
    return false;
};

Spriteset_MapTS.prototype.isAnyoneMoving = function() {
    var battlerSprites = this.battlerSprites();
    for (var i = 0; i < battlerSprites.length; i++) {
        var event = battlerSprites[i].character();
        if (event.isMoving()) {
            return true;
        }
    }
    return false;
};

Spriteset_MapTS.prototype.createStart = function() {
    this._startSprite = new Sprite_StartTS();
    this.addChild(this._startSprite);
};

Spriteset_MapTS.prototype.onBattleStart = function() {
    this._startSprite.setup();
};

Spriteset_MapTS.prototype.isEffecting = function() {
    return this.battlerSprites().some(function(sprite) {
        return sprite.isEffecting();
    });
};

//-----------------------------------------------------------------------------
// Sprite_BattlerTS
//
// The sprite for displaying a battler.

function Sprite_BattlerTS() {
    this.initialize.apply(this, arguments);
};

Sprite_BattlerTS.prototype = Object.create(Sprite_Character.prototype);
Sprite_BattlerTS.prototype.constructor = Sprite_BattlerTS;

Sprite_BattlerTS.prototype.initialize = function(character) {
    Sprite_Character.prototype.initialize.call(this, character);
    this._damages = [];
    this._appeared = false;
    this._shake = 0;  // unused
    this._effectType = null;
    this._effectDuration = 0;
    this.createStateIconSprite();
    this.setBattler(character.battler());
    if (TacticsSystem.showStateIcon) {
        this.createStateIconSprite();
    }
    if (TacticsSystem.showHpGauge) {
        this.createHpGaugeSprite();
    }
};

Sprite_BattlerTS.prototype.createStateIconSprite = function() {
    this._stateIconSprite = new Sprite_StateIcon();
    this._stateIconSprite.setup(this._battler);
    this._stateIconSprite.y = -5;
    this._stateIconSprite.x = 15;
    this._stateIconSprite.z = this.z;
    this._stateIconSprite.scale.x = 0.6;
    this._stateIconSprite.scale.y = 0.6;
    this.addChild(this._stateIconSprite);
};

Sprite_BattlerTS.prototype.createHpGaugeSprite = function() {
    this._hpGaugeSprite = new Sprite_HpGaugeTS(this._battler);
    this._hpGaugeSprite.z = this.z;
    this.addChild(this._hpGaugeSprite);
};

Sprite_BattlerTS.prototype.initVisibility = function() {
    this._appeared = this._battler.isAlive();
    if (!this._appeared) {
        this.opacity = 0;
    }
};

Sprite_BattlerTS.prototype.setBattler = function(battler) {
    this._battler = battler;
};

Sprite_BattlerTS.prototype.update = function() {
    Sprite_Character.prototype.update.call(this);
    this.updateDamagePopup();
    this.updateColor();
    this.updateEffect();
};

Sprite_BattlerTS.prototype.updateDamagePopup = function() {
    this.setupDamagePopup();
    if (this._damages.length > 0) {
        for (var i = 0; i < this._damages.length; i++) {
            this._damages[i].update();
        }
        if (!this._damages[0].isPlaying()) {
            this.parent.removeChild(this._damages[0]);
            this._damages.shift();
        }
    }
};

Sprite_BattlerTS.prototype.setupDamagePopup = function() {
    if (this._battler.isDamagePopupRequested()) {
        var sprite = new Sprite_Damage();
        sprite.x = this.x + this.damageOffsetX();
        sprite.y = this.y + this.damageOffsetY();
        sprite.z = this.z + 1;
        sprite.setup(this._battler);
        this._damages.push(sprite);
        this.parent.addChild(sprite);
        this._battler.clearDamagePopup();
        this._battler.clearResult();
    }
};

Sprite_BattlerTS.prototype.damageOffsetX = function() {
    return 24;
};

Sprite_BattlerTS.prototype.damageOffsetY = function() {
    return 24;
};

Sprite_BattlerTS.prototype.isChangeColor = function() {
    return this._battler.isActor && this._battler.canAction() && !this._battler.isRestricted();
};

Sprite_BattlerTS.prototype.updateColor = function() {
    if (this.isChangeColor()) {
        this.setColorTone([0, 0, 0, 0]);
    } else {
        this.setColorTone([0, 0, 0, 255]);
    }
};

Sprite_BattlerTS.prototype.setupEffect = function() {
    if (this._appeared && this._battler.isEffectRequested()) {
        this.startEffect(this._battler.effectType());
        this._battler.clearEffect();
    }
    if (!this._appeared && this._battler.isAlive()) {
        this.startEffect('appear');
    } else if (this._appeared && this._battler.isHidden()) {
        this.startEffect('disappear');
    }
};

Sprite_BattlerTS.prototype.startEffect = function(effectType) {
    this._effectType = effectType;
    switch (this._effectType) {
    case 'appear':
        this.startAppear();
        break;
    case 'disappear':
        this.startDisappear();
        break;
    case 'whiten':
        this.startWhiten();
        break;
    case 'blink':
        this.startBlink();
        break;
    case 'collapse':
        this.startCollapse();
        break;
    case 'bossCollapse':
        this.startBossCollapse();
        break;
    case 'instantCollapse':
        this.startInstantCollapse();
        break;
    }
    this.revertToNormal();
};

Sprite_BattlerTS.prototype.startAppear = function() {
    this._effectDuration = 16;
    this._appeared = true;
};

Sprite_BattlerTS.prototype.startDisappear = function() {
    this._effectDuration = 32;
    this._appeared = false;
};

Sprite_BattlerTS.prototype.startWhiten = function() {
    this._effectDuration = 16;
};

Sprite_BattlerTS.prototype.startBlink = function() {
    this._effectDuration = 20;
};

Sprite_BattlerTS.prototype.startCollapse = function() {
    this._effectDuration = 32;
    this._appeared = false;
};

Sprite_BattlerTS.prototype.startBossCollapse = function() {
    this._effectDuration = 60;
    this._appeared = false;
};

Sprite_BattlerTS.prototype.startInstantCollapse = function() {
    this._effectDuration = 16;
    this._appeared = false;
};

Sprite_BattlerTS.prototype.updateEffect = function() {
    this.setupEffect();
    if (this._effectDuration > 0) {
        this._effectDuration--;
        switch (this._effectType) {
        case 'whiten':
            this.updateWhiten();
            break;
        case 'blink':
            this.updateBlink();
            break;
        case 'appear':
            this.updateAppear();
            break;
        case 'disappear':
            this.updateDisappear();
            break;
        case 'collapse':
            this.updateCollapse();
            break;
        case 'bossCollapse':
            this.updateBossCollapse();
            break;
        case 'instantCollapse':
            this.updateInstantCollapse();
            break;
        }
        if (this._effectDuration === 0) {
            this._effectType = null;
        }
    }
};

Sprite_BattlerTS.prototype.isEffecting = function() {
    return this._effectType !== null;
};

Sprite_BattlerTS.prototype.revertToNormal = function() {
    this._shake = 0;
    this.blendMode = 0;
    this.opacity = 255;
    this.setBlendColor([0, 0, 0, 0]);
};

Sprite_BattlerTS.prototype.updateWhiten = function() {
    var alpha = 128 - (16 - this._effectDuration) * 10;
    this.setBlendColor([255, 255, 255, alpha]);
};

Sprite_BattlerTS.prototype.updateBlink = function() {
    this.opacity = (this._effectDuration % 10 < 5) ? 255 : 0;
};

Sprite_BattlerTS.prototype.updateAppear = function() {
    this.opacity = (16 - this._effectDuration) * 16;
};

Sprite_BattlerTS.prototype.updateDisappear = function() {
    this.opacity = 256 - (32 - this._effectDuration) * 10;
};

Sprite_BattlerTS.prototype.updateCollapse = function() {
    this.blendMode = Graphics.BLEND_ADD;
    this.setBlendColor([255, 128, 128, 128]);
    this.opacity *= this._effectDuration / (this._effectDuration + 1);
};

Sprite_BattlerTS.prototype.updateBossCollapse = function() {
    this._shake = this._effectDuration % 2 * 4 - 2;
    this.blendMode = Graphics.BLEND_ADD;
    this.opacity *= this._effectDuration / (this._effectDuration + 1);
    this.setBlendColor([255, 255, 255, 255 - this.opacity]);
    if (this._effectDuration % 20 === 19) {
        SoundManager.playBossCollapse2();
    }
};

Sprite_BattlerTS.prototype.updateInstantCollapse = function() {
    this.opacity = 0;
};

Sprite_BattlerTS.prototype.isEffecting = function() {
    return this._effectType !== null;
};

Sprite_BattlerTS.prototype.updateOther = function() {
    if (this._battler.isAlive()) {
        Sprite_Character.prototype.updateOther.call(this);
    }
};

//-----------------------------------------------------------------------------
// Sprite_HpGaugeTS
//
// The sprite for displaying the hp gauge.

function Sprite_HpGaugeTS() {
    this.initialize.apply(this, arguments);
};

Sprite_HpGaugeTS.prototype = Object.create(Sprite_Base.prototype);
Sprite_HpGaugeTS.prototype.constructor = Sprite_HpGaugeTS;

Sprite_HpGaugeTS.prototype.initialize = function(battler) {
    Sprite_Base.prototype.initialize.call(this);
    this.bitmap = new Bitmap(40, 4);
    this.windowskin = ImageManager.loadSystem('Window');
    this.anchor.x = 0.5;
    this.anchor.y = 0;
    this._battler = battler;
};

Sprite_HpGaugeTS.prototype.gaugeBackColor = function() {
    return this.textColor(19);
};

Sprite_HpGaugeTS.prototype.hpGaugeColor1 = function() {
    return this.textColor(20);
};

Sprite_HpGaugeTS.prototype.hpGaugeColor2 = function() {
    return this.textColor(21);
};

Sprite_HpGaugeTS.prototype.textColor = function(n) {
    var px = 96 + (n % 8) * 12 + 6;
    var py = 144 + Math.floor (n / 8) * 12 + 6;
    return this.windowskin.getPixel(px, py);
};

Sprite_HpGaugeTS.prototype.update = function(battler) {
    Sprite_Base.prototype.update.call(this);
    this.bitmap.clear();
    if (this._battler.isAlive()) {
        this.drawBattlerHP();
    }
};

Sprite_HpGaugeTS.prototype.drawBattlerHP = function() {
    var width = 40;
    var color1 = this.hpGaugeColor1();
    var color2 = this.hpGaugeColor2();
    this.drawGauge(0, 0, width, this._battler.hpRate(), color1, color2)
};

Sprite_HpGaugeTS.prototype.drawGauge = function(x, y, width, rate, color1, color2) {
    var fillW = Math.floor(width * rate);
    this.bitmap.fillRect(x, y, width, 4, this.gaugeBackColor());
    this.bitmap.gradientFillRect(x, y, fillW, 4, color1, color2);
};

//-----------------------------------------------------------------------------
// Sprite_StartTS
//
// The sprite for displaying the start message.

function Sprite_StartTS() {
    this.initialize.apply(this, arguments);
};

Sprite_StartTS.prototype = Object.create(Sprite_Base.prototype);
Sprite_StartTS.prototype.constructor = Sprite_StartTS;

Sprite_StartTS.prototype.initialize = function() {
    Sprite_Base.prototype.initialize.call(this);
    this.bitmap = new Bitmap(Graphics.width, Graphics.height);
    this._delay = 0;
    this._duration = 0;
    this.z = 8;
    this.opacity = 0;
};


Sprite_StartTS.prototype.maxDuration = function() {
    return TacticsSystem.durationStartSprite || 120;
};

Sprite_StartTS.prototype.setupDuration = function(duration) {
    this._duration = this.maxDuration();
};

Sprite_StartTS.prototype.update = function(battler) {
    Sprite_Base.prototype.update.call(this);
    this.updateMain();
    this.updatePosition();
    this.updateOpacity();
};

Sprite_StartTS.prototype.isPlaying = function() {
    return this._duration > 0;
};

Sprite_StartTS.prototype.updateMain = function() {
    if (this.isPlaying()) {
        this._duration--;
        this.updatePosition();
    } else {
        this.hide();
    }
};

Sprite_StartTS.prototype.updatePosition = function() {
    this.x = Graphics.width / 2 - this.bitmap.width / 2;
    this.y = Graphics.height / 2 - this.bitmap.height / 2 - 120;
};

Sprite_StartTS.prototype.updateBitmap = function() {
};

Sprite_StartTS.prototype.setup = function() {
    if (TacticsSystem.showBattleStart) {
        this.drawStart();
    }
    this.setupDuration();
};

Sprite_StartTS.prototype.updateOpacity = function() {
    if (this._duration < 30) {
        this.opacity = 255 * this._duration / 30;
    }
    if (this._duration > this.maxDuration() - 60) {
        this.opacity = 255 * (this.maxDuration() - this._duration ) / 60;
    }
};

Sprite_StartTS.prototype.drawStart = function() {
    var x = 20;
    var y = Graphics.height / 2;
    var maxWidth = Graphics.width - x * 2;
    this.bitmap.clear();
    this.bitmap.outlineColor = 'black';
    this.bitmap.outlineWidth = 8;
    this.bitmap.fontSize = 86;
    this.bitmap.drawText(TacticsSystem.battleStartTerm, x, y, maxWidth, 48, 'center');
    this.bitmap.outlineWidth = 4;
    this.bitmap.fontSize = 28;
    var text = $gameTroop.name();
    if (text) {
        this.bitmap.drawText(text, x, y + 56, maxWidth, 32, 'center');
    }
    this.opacity = 255;
    this.show();
};

//-----------------------------------------------------------------------------
// Scene_Map
//
// The scene class of the map screen.

TacticsSystem.Scene_Map_stop = Scene_Map.prototype.stop;
Scene_Map.prototype.stop = function() {
    TacticsSystem.Scene_Map_stop.call(this);
    if (SceneManager.isNextScene(Scene_BattleTS)) {
        this.launchBattle();
    }
};

TacticsSystem.Scene_Map_launchBattle = Scene_Map.prototype.launchBattle;
Scene_Map.prototype.launchBattle = function() {
    // launchbattlets two times ! because push scene battle in first
    if (TacticsSystem.isActive) {
        // abort launchbattlets if scene_battle and ts.isactive
        if (SceneManager.isNextScene(Scene_BattleTS)) {
            this.launchBattleTS();
        }
    } else {
        TacticsSystem.Scene_Map_launchBattle.call(this);
    }
};

Scene_Map.prototype.launchBattleTS = function() {
    BattleManager.saveBgmAndBgs();
    this.stopAudioOnBattleStart();
    this._encounterEffectDuration = this.encounterEffectSpeed();
    this._mapNameWindow.hide();
};

TacticsSystem.Scene_Map_update = Scene_Map.prototype.update;
Scene_Map.prototype.update = function() {
    TacticsSystem.Scene_Map_update.call(this);
    if (SceneManager.isNextScene(Scene_BattleTS)) {
        this.updateEncounterEffect();
    }
};

TacticsSystem.Scene_Map_updateEncounterEffect = Scene_Map.prototype.updateEncounterEffect;
Scene_Map.prototype.updateEncounterEffect = function() {
    if (SceneManager.isNextScene(Scene_BattleTS)) {
        this.updateEncounterEffectTS();
    } else {
        TacticsSystem.Scene_Map_updateEncounterEffect.call(this);
    }
};

Scene_Map.prototype.updateEncounterEffectTS = function() {
    if (this._encounterEffectDuration > 0) {
        this._encounterEffectDuration--;
        var timer = this._encounterEffectDuration;
        var startTimer = this.encounterEffectSpeed();
        if (timer === startTimer - 1) {
            this.startFadeOut(this.slowFadeSpeed());
            BattleManagerTS.createGameObjects();
        }
        if (timer === Math.floor(startTimer / 2)) {
            BattleManager.playBattleBgm();
        }
    }
};

TacticsSystem.Scene_Map_encounterEffectSpeed = Scene_Map.prototype.encounterEffectSpeed;
Scene_Map.prototype.encounterEffectSpeed = function() {
    return SceneManager.isNextScene(Scene_BattleTS) ? 180 : TacticsSystem.Scene_Map_encounterEffectSpeed(this);
};

//-----------------------------------------------------------------------------
// DataManager
//
// The static class that manages the database and game objects.

TacticsSystem.DataManager_createGameObjects = DataManager.createGameObjects;
DataManager.createGameObjects = function() {
    $gameSelectorTS = new Game_SelectorTS();
    $gameTroopTS =    new Game_TroopTS();
    $gamePartyTS =    new Game_PartyTS();
    TacticsSystem.DataManager_createGameObjects.call(this);
};

//-----------------------------------------------------------------------------
// SceneManager
//
// The static class that manages scene transitions.

SceneManager.isCurrentScene = function(sceneClass) {
    return this._scene && this._scene.constructor === sceneClass;
};

//-----------------------------------------------------------------------------
// BattleManager
//
// The static class that manages battle progress.

TacticsSystem.BattleManager_isTurnEnd = BattleManager.isTurnEnd;
BattleManager.isTurnEnd = function() {
    // for $gameTroop turn end condition
    if ($gamePartyTS.inBattle()) {
        return BattleManagerTS.isTurnEnd();
    } else {
        return TacticsSystem.BattleManager_isTurnEnd.call(this);
    }
};

TacticsSystem.BattleManager_setup = BattleManager.setup;
BattleManager.setup = function(troopId, canEscape, canLose) {
    if (TacticsSystem.isActive) {
        BattleManagerTS.setup(troopId, canEscape, canLose);
    } else {
        TacticsSystem.BattleManager_setup.call(this, troopId, canEscape, canLose);
    }
};

TacticsSystem.BattleManager_setEventCallback = BattleManager.setEventCallback;
BattleManager.setEventCallback = function(callback) {
    if (TacticsSystem.isActive) {
        BattleManagerTS.setEventCallback(callback);
    } else {
        TacticsSystem.BattleManager_setEventCallback.call(this, callback);
    }
};

//-----------------------------------------------------------------------------
// Game_Temp
//
// The game object class for temporary data that is not included in save data.

TacticsSystem.Game_Temp_initialize = Game_Temp.prototype.initialize;
Game_Temp.prototype.initialize = function() {
    TacticsSystem.Game_Temp_initialize.call(this);
    this._positionX = null;
    this._positionY = null;
    this._canCancel = true;
};

Game_Temp.prototype.isPositionValid = function(x, y) {
    this._positionX = x;
    this._positionY = y;
};

Game_Temp.prototype.setPosition = function(x, y) {
    this._positionX = x;
    this._positionY = y;
};

Game_Temp.prototype.clearPosition = function() {
    this._positionX = null;
    this._positionY = null;
};

Game_Temp.prototype.isPositionValid = function() {
    return this._positionX !== null;
};

Game_Temp.prototype.positionX = function() {
    return this._positionX;
};

Game_Temp.prototype.positionY = function() {
    return this._positionY;
};

Game_Temp.prototype.canCancel = function() {
    return this._canCancel;
};

Game_Temp.prototype.setCancel = function(canCancel) {
    this._canCancel = canCancel;
};

//-----------------------------------------------------------------------------
// Game_Switches
//
// The game object class for switches.

Game_Switches.prototype.update = function() {
    this.updatePhase();
};

Game_Switches.prototype.updatePhase = function() {
    this.setValue(TacticsSystem.playerPhaseId, false);
    this.setValue(TacticsSystem.enemyPhaseId, false);
    switch (BattleManagerTS.phase()) {
    case 'playerPhase':
        this.setValue(TacticsSystem.playerPhaseId, true);
        break;
    case 'enemyPhase':
        this.setValue(TacticsSystem.enemyPhaseId, true);
        break
    }
};

//-----------------------------------------------------------------------------
// Game_Variables
//
// The game object class for variables.

Game_Variables.prototype.update = function() {
    this.updatePhase();
    this.updatePlayerPhase();
    this.updateBattlePhase();
    this.updateTurnCount();
};

Game_Variables.prototype.updatePhase = function() {
    switch (BattleManagerTS.phase()) {
    case 'startPhase':
        var value = 1;
        break;
    case 'playerPhase':
        var value = 2;
        break;
    case 'enemyPhase':
        var value = 3;
        break
    // can't to be used
    case 'battleEnd':
        var value = 4;
        break;
    default:
        var value = 0;
        break;
    }
    this.setValue(TacticsSystem.phaseVarId, value);
};

Game_Variables.prototype.updatePlayerPhase = function() {
    switch (BattleManagerTS.battlePhase()) {
    case 'explore':
        var value = 1;
        break;
    case 'select':
        var value = 2;
        break;
    case 'target':
        var value = 3;
        break
    default:
        var value = 0;
        break;
    }
    this.setValue(TacticsSystem.playerPhaseVarId, value);
};

Game_Variables.prototype.updateBattlePhase = function() {
    switch (BattleManagerTS.battlePhase()) {
    case 'start':
        var value = 1;
        break;
    case 'move':
        var value = 2;
        break;
    case 'action':
        var value = 3;
        break
    case 'turnEnd':
        var value = 4;
        break;
    default:
        var value = 0;
        break;
    }
    this.setValue(TacticsSystem.battlePhaseVarId, value);
};

Game_Variables.prototype.updateTurnCount = function() {
    this.setValue(TacticsSystem.turnCountVarId, $gameTroop.turnCount());
};

//-----------------------------------------------------------------------------
// Game_Action
//
// The game object class for a battle action.

TacticsSystem.Game_Action_initialize = Game_Action.prototype.initialize;
Game_Action.prototype.initialize = function(subject, forcing) {
    TacticsSystem.Game_Action_initialize.call(this, subject, forcing);
    this._moveRoute = 0;
};

Game_Action.prototype.combatOpponentsUnit = function(battler) {
    var units = battler.opponentsUnitTS().aliveMembers();
    var battlers = this.searchBattlers(battler, units);
    return battlers;
};

Game_Action.prototype.combatFriendsUnit = function(battler) {
    var friends = battler.friendsUnitTS().aliveMembers();
    var first = [battler]; // first for the user keeps the same index !
    var battlers = first.concat(this.searchBattlers(battler, friends));
    return battlers;
};

Game_Action.prototype.searchBattlers = function(battler, units) {
    var battlers = [];
    var item = this.item();
    if (this.isAttackRange(battler)) {
        item = battler.weapons()[0] || battler.weapons()[1];
    }
    this.updateRange(item, battler.tx, battler.ty);
    for (var i = 0; i < this._range.length; i++) {
        var redCell = this._range[i];
        var x = redCell[0];
        var y = redCell[1];
        for (var j = 0; j < units.length; j++) {
            if (units[j].pos(x, y) && units[j] !== battler) {
                battlers.push(units[j]);
            }
        }
    }
    return battlers;
};

Game_Action.prototype.isAttackRange = function (subject) {
    return subject.isActor() && this.isAttack() && !subject.hasNoWeapons();
};

Game_Action.prototype.updateRange = function(item, x, y) {
    var data = this.extractRangeData(item);
    var range = null;
    if (data[0] === 'custom') {
        this._range = eval(data[1]);
    } else {
        this._range = this.createRange(data[0], parseInt(data[1]), x, y);
    }
};

Game_Action.prototype.extractRangeData = function (object) {
    var re = /(\[.*?\])/g;
    var data = object.meta['range'] || TacticsSystem.actionRange;
    var match = re.exec(data)
    if (match) {
        return ['custom', data];
    } else {
        return data.trim().split(' ');
    }
};

Game_Action.prototype.createRange = function(tag, d, x, y) {
    var range = [];
    for (var i = x - d; i <= x + d; i++) {
        for (var j = y - d; j <= y + d; j++) {
            if (tag === 'diamond' && Math.abs(i - x) + Math.abs(j - y) <= d) {
                range.push([i, j]);
            } else if (tag === 'line' && i === x || j === y) {
                range.push([i, j]);
            } else if (tag === 'rectangle') {
                range.push([i, j]);
            }
        }
    }
    return range;
};

Game_Action.prototype.range = function() {
    return this._range;
};

Game_Action.prototype.showRange = function() {
    this._range.forEach(function(pos) {
        var tile = $gameMap.tile(pos[0], pos[1]);
        $gameMap.addTile(tile);
    }, this)
};

Game_Action.prototype.color = function() {
    return this.isForFriend() ? TacticsSystem.allyScopeColor : TacticsSystem.enemyScopeColor;
}

Game_Action.prototype.testDamageMinMaxValue = function(target, minMax) {
    var item = this.item();
    var baseValue = this.evalDamageFormula(target);
    var value = baseValue * this.calcElementRate(target);
    if (this.isPhysical()) {
        value *= target.pdr;
    }
    if (this.isMagical()) {
        value *= target.mdr;
    }
    if (baseValue < 0) {
        value *= target.rec;
    }
    value = this.testMinMaxVariance(value, item.damage.variance, minMax);
    value = this.applyGuard(value, target);
    value = Math.round(value);
    return value;
};

Game_Action.prototype.testMinMaxVariance = function(damage, variance, minMax) {
    var amp = Math.floor(Math.max(Math.abs(damage) * variance / 100, 0));
    var v = minMax ? amp : - amp;
    return damage >= 0 ? damage + v : damage - v;
};

Game_Action.prototype.setMove = function(moveRoute) {
    this._moveRoute = moveRoute;
};

Game_Action.prototype.applyMove = function() {
    var command = { code : this._moveRoute };
    var event = this.subject().event();
    event.processMoveCommand(command);
};

Game_Action.prototype.isTargetValid = function(battler) {
    if (this.isForOpponent()) {
        return battler && !battler.isActor();
    } else {
        return battler && battler.isActor();
    }
};

Game_Action.prototype.isMove = function() {
    return this._moveRoute !== 0;
};

Game_Action.prototype.setWait = function() {
    this.setSkill(this.subject().waitSkillId());
};

Game_Action.prototype.isWait = function() {
    return this.item() === $dataSkills[this.subject().waitSkillId()];
};

TacticsSystem.Game_Action_subject = Game_Action.prototype.subject;
Game_Action.prototype.subject = function() {
    TacticsSystem.Game_Action_subject.call(this);
    if ($gamePartyTS.inBattle()) {
        if (this._subjectActorId <= 0) {
            return $gameTroopTS.members()[this._subjectEnemyIndex];
        }
    }
    return TacticsSystem.Game_Action_subject.call(this);
};

TacticsSystem.Game_Action_setSubject = Game_Action.prototype.setSubject;
Game_Action.prototype.setSubject = function(subject) {
    TacticsSystem.Game_Action_setSubject.call(this, subject);
    // For enemy restriction attack an ally...
    if (!subject.isActor()) {
        this._subjectEnemyIndex = $gameTroopTS.members().indexOf(subject);
    }
};

//-----------------------------------------------------------------------------
// Game_BattlerBase
//
// The superclass of Game_Battler. It mainly contains parameters calculation.

TacticsSystem.Game_BattlerBase_canUse = Game_BattlerBase.prototype.canUse;
Game_BattlerBase.prototype.canUse = function(item) {
    if ($gamePartyTS.inBattle()) {
        if (!this.isItemRangeValid(item)) {
            return false;
        }
    }
    return TacticsSystem.Game_BattlerBase_canUse.call(this, item);
};

Game_BattlerBase.prototype.isOccasionOk = function(item) {
    if ($gameParty.inBattle() || $gamePartyTS.inBattle()) {
        return item.occasion === 0 || item.occasion === 1;
    } else {
        return item.occasion === 0 || item.occasion === 2;
    }
};

Game_BattlerBase.prototype.waitSkillId = function() {
    return TacticsSystem.waitSkillId;
};

//-----------------------------------------------------------------------------
// Game_Battler
//
// The superclass of Game_Actor and Game_Enemy. It contains methods for sprites
// and actions.

Object.defineProperties(Game_Battler.prototype, {
    // event position X
    x: { get: function() { return this.event().x; }, configurable: true },
    // event position Y
    y: { get: function() { return this.event().y; }, configurable: true },
    // Tactical position X
    tx: { get: function() { return this._tx; }, configurable: true },
    // Tactical position Y
    ty: { get: function() { return this._ty; }, configurable: true },
    // MoVe Point
    mvp: { get: function() { return this.tparam('mvp') || TacticsSystem.mvp; }, configurable: true }
});

TacticsSystem.Game_Battler_initMembers = Game_Battler.prototype.initMembers;
Game_Battler.prototype.initMembers = function() {
    TacticsSystem.Game_Battler_initMembers.call(this);
    this._tx = 0;
    this._ty = 0;
    this._eventId = 0;
    // use $gameChar ?
    this._char = new Game_Character();  // it's used to calculate the shortest path
    this._actionIndex = 0;
    this._moveIndex = 0;
    this._moves = [];
    this._canAction = true;
    this._active = false;
    this._requestImage = false;
};

Game_Battler.prototype.setupEvent = function(eventId) {
    this._eventId = eventId;
    this._tx = this.event().x;
    this._ty = this.event().y;
    this.event().setBattler(this);
};

Game_Battler.prototype.clearEvent = function() {
    this._eventId = 0;
    this._tx = 0;
    this._ty = 0;
};

Game_Battler.prototype.event = function() {
    return $gameMap.event(this._eventId);
};

Game_Battler.prototype.dataEvent = function() {
    return this.event().event();  // stange method...
};

Game_Battler.prototype.pos = function(x, y) {
    return this.event().pos(x, y);
};

Game_Battler.prototype.currentBattler = function() {
    return null;
};

Game_Battler.prototype.tparam = function(paramString) {
    var param = this.currentBattler().meta[paramString] || this.dataEvent().meta[paramString];
    if (param) {
        param.replace(/\s/g, '');
    }
    return param;
};

Game_Battler.prototype.onTurnStart = function() {
    if (this.isRestricted) {
        this._canAction = true;
        this.event().setStepAnime(true);
    }
    this.makeActions();
    this.makeMoves();
};

Game_Battler.prototype.onActionEnd = function() {
    this._canAction = false;
    this.event().setDirection(2);
};

Game_Battler.prototype.isMoving = function() {
    return this.event().isMoving();
};

Game_Battler.prototype.turnTowardCharacter = function(character) {
    this.event().turnTowardCharacter(character)
};

Game_Battler.prototype.isItemRangeValid = function(item) {
    if (!item) {
        return false;
    } else if (DataManager.isSkill(item)) {
        return this.isSkillRangeOk(item);
    } else if (DataManager.isItem(item)) {
        return this.isItemRangeOk(item);
    } else {
        return false;
    }
};

Game_Battler.prototype.isSkillRangeOk = function(item) {
    var action = new Game_Action(this);
    action.setSkill(item.id);
    if (this.isConfused()) {
        return this.isConfusedRangeOk(action);
    } if (action.isForOpponent()) {
        return action.combatOpponentsUnit(this).length > 0;
    }
    if (action.isForFriend()) {
        return action.combatFriendsUnit(this).length > 0;
    }
    return false;
};

Game_Battler.prototype.isItemRangeOk = function(item) {
    var action = new Game_Action(this);
    action.setItem(item.id);
    if (action.isForOpponent()) {
        return action.combatOpponentsUnit(this).length > 0;
    }
    if (action.isForFriend()) {
        return action.combatFriendsUnit(this).length > 0;
    }
    return false;
};

Game_Battler.prototype.nextAction = function() {
    this._actionIndex++;
    if (this._actionIndex < this.numActions()) {
        return true;
    } else {
        return false;
    }
};

TacticsSystem.Game_Battler_currentAction = Game_Battler.prototype.currentAction;
Game_Battler.prototype.currentAction = function() {
    if ($gamePartyTS.inBattle()) {
         return this._actions[this._actionIndex];
    } else {
        return TacticsSystem.Game_Battler_currentAction.call(this);
    }
};

TacticsSystem.Game_Battler_clearActions = Game_Battler.prototype.clearActions;
Game_Battler.prototype.clearActions = function() {
    TacticsSystem.Game_Battler_clearActions.call(this);
    this._actionIndex = 0;
};

Game_Battler.prototype.currentMove = function() {
    return this._moves[this._moveIndex];
};

Game_Battler.prototype.nextMove = function() {
    this._moveIndex++;
    if (this._moveIndex <= this.numMoves()) {
        return true;
    } else {
        return false;
    }
};

Game_Battler.prototype.numMoves = function() {
    return this._moves.length;
};

Game_Battler.prototype.makeMoves = function() {
    this.clearMoves();
    if (this.canMove()) {
        var moveTimes = this.makeMoveTimes();
        this._moves = [];
        for (var i = 0; i < moveTimes; i++) {
            this._moves.push(new Game_Action(this));
        }
    }
    if (this.isRestricted()) {
        this.makeConfusionMove()
    }
};

Game_Battler.prototype.makeMoveTimes = function() {
    return this.mvp;
};

Game_Battler.prototype.clearMoves = function() {
    this._tx = this.x;
    this._ty = this.y;
    this._moves = [];
    this._moveIndex = 0;
};

Game_Battler.prototype.refreshMovesAction = function(x, y) {
    if ($gameMap.isOnTiles(x, y)) {
        this.makeMoves();
        this._tx = x;
        this._ty = y;
        this.makeShortestMoves();
    } else {
        this.makeMoves();
    }
};

Game_Battler.prototype.makeShortestMoves = function() {
    this._char.setPosition(this.x, this.y);
    var index = 0;
    while (!this.tpos() && index < this.numMoves()) {
        var d = this._char.findDirectionTo(this.tx, this.ty);
        this._char.moveStraight(d);
        this._moves[index].setMove(d / 2);
        index++;
    }
    this._tx = this._char.x;
    this._ty = this._char.y;
};

Game_Battler.prototype.tpos = function() {
    return this.tx === this._char.x && this.ty === this._char.y;
}

Game_Battler.prototype.canAction = function() {
    return $gamePartyTS.inBattle() ? this._canAction : true;
};

Game_Battler.prototype.makeRange = function() {
    $gameMap.makeRange(this.numMoves(), this.event());
};

Game_Battler.prototype.makeConfusionMove = function() {
    var action = new Game_Action(this);
    action.setConfusion();
    $gameMap.makeRange(this.mvp, this.event());
    var targets = [new Point(this.x, this.y)];
    for (var i = 0; i < $gameMap.tiles().length; i++) {
        var tile = $gameMap.tiles()[i];
        this._tx = $gameMap.positionTileX(tile);
        this._ty = $gameMap.positionTileY(tile);
        if (this.canUse(action.item())) {
            // actor can't use action in another actor
            if ($gameMap.eventsXy(this.tx, this.ty).length === 0) {
                targets.push(new Point(this.tx, this.ty));
            }
        }
    }
    $gameMap.eraseTiles();
    var target = targets[Math.randomInt(targets.length)];
    this._tx = target.x;
    this._ty = target.y;
};

Game_Battler.prototype.isConfusedRangeOk = function(action) {
    switch (this.confusionLevel()) {
    case 1:
        return action.combatOpponentsUnit(this).length > 0;
    case 2:
        return action.combatOpponentsUnit(this).length > 0 ||
            action.combatFriendsUnit(this).length > 1;  // don't count self
    default:
        return action.combatFriendsUnit(this).length > 1;
    }
};

TacticsSystem.Game_Battler_performCollapse = Game_Battler.prototype.performCollapse;
Game_Battler.prototype.performCollapse = function() {
    if ($gamePartyTS.inBattle()) {
        this.event().setThrough(true);
    } else {
        TacticsSystem.Game_Battler_performCollapse.call(this);
    }
};

Game_Battler.prototype.performSelect = function() {
    this.requestEffect('whiten');
};

//-----------------------------------------------------------------------------
// Game_Actor
//
// The game object class for an actor.

TacticsSystem.Game_Actor_initMembers = Game_Actor.prototype.initMembers;
Game_Actor.prototype.initMembers = function() {
    TacticsSystem.Game_Actor_initMembers.call(this);
    this._actionsButton = [];
};

Game_Actor.prototype.setupEvent = function(eventId) {
    Game_Battler.prototype.setupEvent.call(this, eventId);
    this.event().setPriorityType(1);
    // to find a path to through an actor
    this._char.setIsActor(true);
};

Game_Actor.prototype.currentBattler = function() {
    return this.actor();
};

Game_Actor.prototype.indexTS = function() {
    return $gamePartyTS.members().indexOf(this);
};

Game_Actor.prototype.friendsUnitTS = function() {
    return $gamePartyTS;
};

Game_Actor.prototype.opponentsUnitTS = function() {
    return $gameTroopTS;
};

Game_Actor.prototype.savePosition = function() {
    $gameTemp.setPosition(this.x, this.y);
};

Game_Actor.prototype.restorePosition = function() {
    var positionX = $gameTemp.positionX();
    var positionY = $gameTemp.positionY();
    this.event().setPosition(positionX, positionY);
    this.event().setDirection(2);
    this._tx = positionX;
    this._ty = positionY;
};

Game_Actor.prototype.refreshImage = function() {
    this.event().setImage(this.characterName(), this.characterIndex());
};

Game_Actor.prototype.actionsButton = function() {
    return this._actionsButton;
};

Game_Actor.prototype.canActionButton = function() {
    return this.checkEventTriggerThere();
};

Game_Actor.prototype.checkEventTriggerThere = function() {
    this._actionsButton = []
    for (var d = 8; d >= 2; d -= 2) {
        var x1 = this.x;
        var y1 = this.y;
        var x2 = $gameMap.roundXWithDirection(x1, d);
        var y2 = $gameMap.roundYWithDirection(y1, d);
        this.checkEventsTriggerHere(x2, y2);
    }
    return this._actionsButton.length > 0;
};

Game_Actor.prototype.checkEventsTriggerHere = function(x, y) {
    if (!$gameMap.isEventRunning()) {
        var events = $gameMap.eventsXy(x, y);
        for (var i = 0; i < events.length; i++) {
            var event = events[i];
            if (event.page()) {
                var list = event.list();
                if (event.isTriggerIn([0]) && list && list.length > 1) {
                    this._actionsButton.push(event.eventId());
                }
            }
        }
    }
};

Game_Actor.prototype.checkEventTriggerTouch = function() {
    if (!$gameMap.isEventRunning()) {
        return $gameMap.eventsRangeXy(this.x, this.y).some(function(event) {
            if (event.isTriggerIn([1,2])) {
                event.start();
                return true;
            }
            return false;
        });
    }
    return false;
};

TacticsSystem.Game_Actor_inputtingAction = Game_Actor.prototype.inputtingAction;
Game_Actor.prototype.inputtingAction = function() {
    if ($gamePartyTS.inBattle()) {
        return this.action(this._actionIndex);
    } else {
        return TacticsSystem.Game_Actor_inputtingAction.call(this);
    }
};

TacticsSystem.Game_Actor_performCollapse = Game_Actor.prototype.performCollapse;
Game_Actor.prototype.performCollapse = function() {
    TacticsSystem.Game_Actor_performCollapse.call(this);
    if ($gamePartyTS.inBattle()) {
        this.requestEffect('bossCollapse');
    }
};

TacticsSystem.Game_Actor_isBattleMember = Game_Actor.prototype.isBattleMember;
Game_Actor.prototype.isBattleMember = function() {
    if ($gamePartyTS.inBattle()) {
        return $gamePartyTS.members().contains(this);
    } else {
        return TacticsSystem.Game_Actor_isBattleMember.call(this);
    }
};

Game_Actor.prototype.makeMoves = function() {
    Game_Battler.prototype.makeMoves.call(this);
    if (!this.isRestricted() && this.isAutoBattle()) {
        this.autoMoves();
    }
};

Game_Actor.prototype.autoMoves = function() {
    this.makeAutoBattleMoves();
    this.makeShortestMoves();
};

Game_Actor.prototype.makeAutoBattleMoves = function() {
    var saveX = this.tx;
    var saveY = this.ty;
    $gameMap.makeRange(16, this.event());
    var maxValue = Number.MIN_VALUE;
    for (var i = 0; i < $gameMap.tiles().length; i++) {
        var tile = $gameMap.tiles()[i];
        this._tx = $gameMap.positionTileX(tile);
        this._ty = $gameMap.positionTileY(tile);
        var list = this.makeActionList();
        var value = 0;
        for (var j = 0; j < list.length; j++) {
            value += list[j].evaluate();
        }
        if (value > maxValue) {
            maxValue = value;
            saveX = this.tx;
            saveY = this.ty;
        }
    }
    $gameMap.eraseTiles();
    this._tx = saveX;
    this._ty = saveY;
};

Game_Actor.prototype.onActionEnd = function() {
    Game_Battler.prototype.onActionEnd.call(this);
    this.event().setStepAnime(false);
};

//-----------------------------------------------------------------------------
// Game_Enemy
//
// The game object class for an enemy.

Object.defineProperties(Game_Enemy.prototype, {
    // AGGressivity
    agg: { get: function() { return this.tparam('agg') || 99; }, configurable: true }
});

Game_Enemy.prototype.currentBattler = function() {
    return this.enemy();
};

Game_Enemy.prototype.friendsUnitTS = function() {
    return $gameTroopTS;
};

Game_Enemy.prototype.opponentsUnitTS = function() {
    return $gamePartyTS;
};


Game_Enemy.prototype.makeMoves = function() {
    Game_Battler.prototype.makeMoves.call(this);
    if (!this.isConfused()) {
        this.findAction();
    }
    this.makeShortestMoves();
};

Game_Enemy.prototype.findAction = function() {
    this._rate = 0;
    var saveX = this.tx;
    var saveY = this.ty;
    $gameMap.makeRange(this.agg, this.event());
    for (var i = 0; i < $gameMap.tiles().length; i++) {
        var tile = $gameMap.tiles()[i];
        this._tx = $gameMap.positionTileX(tile);
        this._ty = $gameMap.positionTileY(tile);
        var actionList = this.enemy().actions.filter(function(a) {
            return this.isActionValid(a);
        }, this);
        var sum = actionList.reduce(function(r, a) {
            return r + a.rating * 3;
        }, 0);
        if (sum > this._rate) {
            this._rate = sum;
            saveX = this.tx;
            saveY = this.ty;
        }
    }
    $gameMap.eraseTiles();
    this._tx = saveX;
    this._ty = saveY;
};

Game_Enemy.prototype.isPattern = function() {
    return this._rate > 0;
};

Game_Enemy.prototype.applyMove = function() {
    var action = this.currentMove();
    if (action) {
        action.applyMove();
    }
};

//-----------------------------------------------------------------------------
// Game_Unit
//
// The superclass of Game_Party and Game_Troop.

TacticsSystem.Game_Unit_onBattleStart = Game_Unit.prototype.onBattleStart;
Game_Unit.prototype.onBattleStart = function() {
    TacticsSystem.Game_Unit_onBattleStart.call(this);
    if ($gamePartyTS.inBattle()) {
        this._inBattle = false;
    }
};

//-----------------------------------------------------------------------------
// Game_Party
//
// The game object class for the party. Information such as gold and items is
// included.

Game_Party.prototype.setupTS = function(actors) {
    var actorsId = [];
    for (var i = 0; i < actors.length; i++) {
        actorsId.push(actors[i].actorId());
    }
    this._maxBattleMembers = actors.length;

    actorsId.forEach(function(actorId) {
        if (this._actors.contains(actorId)) {
            this.removeActor(actorId);
        }
    }, this);
    this._actors = actorsId.concat(this._actors);
};

Game_Party.prototype.setMaxBattleMembers = function() {
    this._maxBattleMembers = this.allMembers().length;
};

Game_Party.prototype.maxBattleMembers = function() {
    return $gamePartyTS.inBattle() ? this._maxBattleMembers : 4;
};

Game_Party.prototype.members = function() {
    return this.inBattle() || $gamePartyTS.inBattle() ? this.battleMembers() : this.allMembers();
};

Game_Party.prototype.memberId = function(partyId) {
    return this.members()[partyId - 1].actorId();
};

//-----------------------------------------------------------------------------
// Game_Troop
//
// The game object class for a troop and the battle-related data.

Game_Troop.prototype.setupTS = function(enemies) {
    this._enemies = enemies;
    //this.makeUniqueNames();
};

TacticsSystem.Game_Troop_increaseTurn = Game_Troop.prototype.increaseTurn;
Game_Troop.prototype.increaseTurn = function() {
    if (this._troopId > 0) {
        TacticsSystem.Game_Troop_increaseTurn.call(this);
    } else {
        this._turnCount++;
    }
};

TacticsSystem.Game_Troop_setupBattleEvent = Game_Troop.prototype.setupBattleEvent;
Game_Troop.prototype.setupBattleEvent = function() {
    if (this._troopId > 0) {
        TacticsSystem.Game_Troop_setupBattleEvent.call(this);
    }
};

Game_Troop.prototype.name = function() {
    return this._troopId > 0 ? this.troop().name : null;
};

TacticsSystem.Game_Troop_meetsConditions = Game_Troop.prototype.meetsConditions;
Game_Troop.prototype.meetsConditions = function(page) {
    var c = page.conditions;
    if (c.enemyValid) {
        var enemy = $gameTroopTS.members()[c.enemyIndex];
        if (!enemy || enemy.hpRate() * 100 > c.enemyHp) {
            return false;
        }
        if (!c.turnEnding && !c.turnValid && !c.actorValid && !c.switchValid) {
            return true;  // Only enemy valid
        }
    } else {
        page.conditions.enemyValid = false;
        return TacticsSystem.Game_Troop_meetsConditions.call(this, page);
    }
};

//-----------------------------------------------------------------------------
// Game_Map
//
// The game object class for a map. It contains scrolling and passage
// determination functions.

TacticsSystem.Game_Map_intialize = Game_Map.prototype.initialize;
Game_Map.prototype.initialize = function() {
    TacticsSystem.Game_Map_intialize.call(this);
    this._tiles = [];
    this._color = '';
    this._destinationX = null;
    this._destinationY = null;
};

Game_Map.prototype.addTile = function(tile) {
    this._tiles.push(tile);
};

Game_Map.prototype.positionTileX = function(tile) {
    return tile % $dataMap.width;
};

Game_Map.prototype.positionTileY = function(tile) {
    return Math.floor(tile / $dataMap.width);
};

Game_Map.prototype.isTileAdded = function(tile) {
    return this._tiles.contains(tile);
};

Game_Map.prototype.tile = function(x, y) {
    return y * $dataMap.width + x;
};

Game_Map.prototype.tiles = function() {
    return this._tiles;
};

Game_Map.prototype.eraseTiles = function() {
    this._tiles = [];
};

Game_Map.prototype.isOnTiles = function(x, y) {
    return this._tiles.contains(this.tile(x, y));
};

Game_Map.prototype.setMoveColor = function() {
    this._color = TacticsSystem.moveScopeColor;
};

Game_Map.prototype.setActionColor = function(action) {
    this._color = action.color();
};

Game_Map.prototype.color = function() {
    return this._color;
};

Game_Map.prototype.performScroll = function(x, y) {
    var x = Math.floor(Math.min(x, $gameMap.width() - this.screenTileX()/2));
    var y = Math.floor(Math.min(y, $gameMap.height() - this.screenTileY()/2));
    this._destinationX = Math.round(Math.max(x - this.screenTileX()/2, 0));
    this._destinationY = Math.round(Math.max(y - this.screenTileY()/2, 0));
    this._scrollSpeed = 5;
};

Game_Map.prototype.clearDestination = function() {
    this._destinationX = null;
    this._destinationY = null;
};

Game_Map.prototype.isDestinationValid = function() {
    return this._destinationX !== null;
};

TacticsSystem.Game_Map_updateScroll = Game_Map.prototype.updateScroll;
Game_Map.prototype.updateScroll = function() {
    if (this.isDestinationValid()) {
        var x = Math.max(this._displayX, 0);
        var y = Math.max(this._displayY, 0);
        if (y < this._destinationY) {
            $gameMap.scrollDown(this.scrollDistance());
        }
        if (x > this._destinationX) {
            $gameMap.scrollLeft(this.scrollDistance());
        }
        if (x < this._destinationX) {
            $gameMap.scrollRight(this.scrollDistance());
        }
        if (y > this._destinationY) {
            $gameMap.scrollUp(this.scrollDistance());
        }
        if (x === this._destinationX && y === this._destinationY) {
            this.clearDestination();
        }
    } else {
        TacticsSystem.Game_Map_updateScroll.call(this);
    }
};

Game_Map.prototype.makeRange = function(distance, event) {
    var queue = [];
    var level = [];
    var startTile = this.tile(event.x, event.y)
    
    this.eraseTiles();
    queue.push(startTile);
    level[startTile] = 0;
    this.addTile(startTile);

    while (queue.length && level[queue[0]] < distance) {
        var start = queue.shift();
        var x = this.positionTileX(start);
        var y = this.positionTileY(start);
        for (var d = 8; d >= 2; d -= 2) {
            if (event.canPass(x, y, d)) {
                var x2 = this.roundXWithDirection(x, d);
                var y2 = this.roundYWithDirection(y, d);
                var tile = this.tile(x2, y2);
                if (!this.isTileAdded(tile)) {
                    queue.push(tile);
                    level[tile] = level[start] + 1;
                    this.addTile(tile);
                }
            }
        }
    }
};

Game_Map.prototype.eventsRangeXy = function(tx, ty) {
    return this.events().filter(function(event) {
        var x = event.x;
        var y = event.y;
        var d = Number(event.tparam('range')) || 1;
        for (var i = x - d; i <= x + d; i++) {
            for (var j = y - d; j <= y + d; j++) {
                if (Math.abs(i - x) + Math.abs(j - y) <= d) {
                    if (tx === i && ty === j) {
                        return true
                    }
                }
            }
        }
        return false;
    }, tx, ty);
};

//-----------------------------------------------------------------------------
// Game_CharacterBase
//
// The superclass of Game_Character. It handles basic information, such as
// coordinates and images, shared by all characters.


Game_CharacterBase.prototype.setIsActor = function(isActor) {
    this._isActor = isActor;
};

Game_CharacterBase.prototype.isActor = function() {
    return this._isActor;
};

TacticsSystem.Game_CharacterBase_isCollidedWithEvents = Game_CharacterBase.prototype.isCollidedWithEvents;
Game_CharacterBase.prototype.isCollidedWithEvents = function(x, y) {
    // for an actor to pass through an actor
    if (this.isActor()) {
        var events = $gameMap.eventsXyNt(x, y);
        return events.some(function(event) {
            return event.isNormalPriority() && !event.isActor();
        });
    } else {
         return TacticsSystem.Game_CharacterBase_isCollidedWithEvents.call(this, x, y);
    }
};

//-----------------------------------------------------------------------------
// Game_Character
//
// The superclass of Game_Player, Game_Follower, GameVehicle, and Game_Event.

Game_Character.prototype.searchLimit = function() {
    return 32; // 12 by default
};

//-----------------------------------------------------------------------------
// Game_Event
//
// The game object class for an event. It contains functionality for event page
// switching and running parallel process events.

TacticsSystem.Game_Event_initMembers = Game_Event.prototype.initMembers;
Game_Event.prototype.initMembers = function() {
    TacticsSystem.Game_Event_initMembers.call(this);
    this._battler = null;
    this._actor = null;
};

Game_Event.prototype.setBattler = function(battler) {
    this._battler = battler;
};

Game_Event.prototype.isActor = function() {
    return this._battler && this._battler.isActor();
};

Game_Event.prototype.isEnemy = function() {
    return this._battler && this._battler.isEnemy();
};

// no oop ! copy ? index ?
Game_Event.prototype.battler = function() {
    return this._battler;
};

Game_Event.prototype.setActor = function(actor) {
    this._actor = actor;
};

// no oop ! copy ? index ?
Game_Event.prototype.actor = function() {
    return this._actor;
};

Game_Event.prototype.tparam = function(paramString) {
    var param = this.event().meta[paramString];
    if (typeof param === 'string') {
        param = param.replace(/\s/g, '');
    }
    return param
};

TacticsSystem.Game_Event_isCollidedWithEvents = Game_Event.prototype.isCollidedWithEvents;
Game_Event.prototype.isCollidedWithEvents = function(x, y) {
    // for an actor to pass through an actor
    if (this.isActor() || this.isEnemy()) {
        return Game_Character.prototype.isCollidedWithEvents.call(this, x, y)
    } else {
         return TacticsSystem.Game_Event_isCollidedWithEvents.call(this, x, y);
    }
};

Game_Event.prototype.isAppeared = function() {
    return this.findProperPageIndex() !== -1 && !this._erased;
};

TacticsSystem.Game_Event_update = Game_Event.prototype.update;
Game_Event.prototype.update = function() {
    TacticsSystem.Game_Event_update.call(this);
    this.updateAppeared()
};

Game_Event.prototype.updateAppeared = function() {
    if (this.isActor() || this.isEnemy()) {
        if (this.isAppeared()) {
            this._battler.appear();
        } else {
            this._battler.hide();
        }
    }
};

Game_Event.prototype.name = function() {
    return this.tparam('name') || this.event().name;
};

//-----------------------------------------------------------------------------
// Game_Interpreter
//
// The interpreter for running event commands.

TacticsSystem.Game_Interpreter_updateWaitMode = Game_Interpreter.prototype.updateWaitMode;
Game_Interpreter.prototype.updateWaitMode = function() {
    var waiting = false;
    switch (this._waitMode) {
    case 'TS.battle':
        waiting = SceneManager.isCurrentScene(Scene_BattleTS) || SceneManager.isSceneChanging();
        break;
    case 'TS.selector':
        waiting = $gameSelectorTS.isBusy();
        break;
    default:
        return TacticsSystem.Game_Interpreter_updateWaitMode.call(this);
    }
    if (!waiting) {
        this._waitMode = '';
    }
    return waiting;
};

// Battle Processing
TacticsSystem.Game_Interpreter_command301 = Game_Interpreter.prototype.command301;
Game_Interpreter.prototype.command301 = function() {

    var res = TacticsSystem.Game_Interpreter_command301.call(this);
    if (SceneManager.isNextScene(Scene_Battle) && TacticsSystem.isActive) {
        SceneManager.pop();
        this.setWaitMode('TS.battle');
        SceneManager.push(Scene_BattleTS);
    }
    return res;
};

TacticsSystem.Game_Interpreter_iterateEnemyIndex = Game_Interpreter.prototype.iterateEnemyIndex;
Game_Interpreter.prototype.iterateEnemyIndex = function(param, callback) {
    if ($gamePartyTS.inBattle()) {
        if (param < 0) {
            $gameTroopTS.members().forEach(callback);
        } else {
            var enemy = $gameTroopTS.members()[param];
            if (enemy) {
                callback(enemy);
            }
        }
    } else {
        TacticsSystem.Game_Interpreter_iterateEnemyIndex.call(this, param, callback);
    }

};

//-----------------------------------------------------------------------------
// Window_BattleLog
//
// The window for displaying battle progress. No frame is displayed, but it is
// handled as a window for convenience.

TacticsSystem.Window_BattleLog_showNormalAnimation = Window_BattleLog.prototype.showNormalAnimation;
Window_BattleLog.prototype.showNormalAnimation = function(targets, animationId, mirror) {
    if ($gamePartyTS.inBattle()) {
        var animation = $dataAnimations[animationId];
        if (animation) {
            targets.forEach(function(target) {
                target.event().requestAnimation(animationId);
            });
        }
    } else {
        TacticsSystem.Window_BattleLog_showNormalAnimation.call(this, targets, animationId, mirror);
    }
};

//-----------------------------------------------------------------------------
// Sprite_Character
//
// The sprite for displaying a character.

Sprite_Character.prototype.character = function() {
    return this._character;
};

//-----------------------------------------------------------------------------
/**
 * The basic object that represents an image.
 *
 * @class Bitmap
 * @constructor
 * @param {Number} width The width of the bitmap
 * @param {Number} height The height of the bitmap
 */

/**
 * Draw a line.
 *
 * @method drawLine
 * @param {Number} x1 The x coordinate for the start.
 * @param {Number} y1 The y coordinate for the start.
 * @param {Number} x2 The x coordinate for the destination.
 * @param {Number} y2 The y coordinate for the destination.
 */
Bitmap.prototype.drawLine = function(x1, y1, x2, y2) {
    var context = this._context;
    context.save();
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
    context.restore();
    this._setDirty();
};

(function() {
    TacticsSystem.isActive = true;
    TacticsSystem.clearAll = true;
    TacticsSystem.Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        TacticsSystem.Game_Interpreter_pluginCommand.call(this, command, args);
        switch(command) {
            case 'TS.battleProcessing':
                if (args[0].toUpperCase() === 'ON') {
                    TacticsSystem.isActive = true;
                }
                if (args[0].toUpperCase() === 'OFF') {
                    TacticsSystem.isActive = false;
                }
                break;
            case 'TS.battleWin':
                BattleManagerTS.processVictory();
                break;
            case 'TS.battleLose':
                TacticsSystem.isDefeated = true;
                BattleManagerTS.processDefeat();
                break;
            case 'TS.selectorTransfer':
                $gameSelectorTS.performTransfer(Number(args[0]), Number(args[1]));
                this.setWaitMode('TS.selector');
                break;
            case 'TS.selectorMoveTo':
                $gameSelectorTS.moveTo(Number(args[0]), Number(args[1]));
                this.setWaitMode('TS.selector');
                break;
            case 'TS.selectorEvent':
                var eventId = Number(args[0]);
                var event = $gameMap.event(eventId);
                $gameSelectorTS.performTransfer(event.x, event.y);
                this.setWaitMode('TS.selector');
                break;
            case 'TS.selectorActive':
                 if (args[0].toUpperCase() === 'ON') {
                    $gameSelectorTS.activate();
                }
                if (args[0].toUpperCase() === 'OFF') {
                    $gameSelectorTS.deactivate();
                }
                break;
            case 'TS.clearAll':
                if (args[0].toUpperCase() === 'ON') {
                    TacticsSystem.clearAll = true;
                }
                if (args[0].toUpperCase() === 'OFF') {
                    TacticsSystem.clearAll = false;
                }
                break;
            case 'TS.actorTurnEnd':
                BattleManagerTS.endAction();
                break;
        }
    };
})();