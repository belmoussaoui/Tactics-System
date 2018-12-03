//=============================================================================
// TacticsSystem.js v0.4.0.4
//=============================================================================

/*:
 * @plugindesc A Tactical Battle System like Final Fantasy Tactics or Fire Emblem series.
 * @author El Moussaoui Bilal (https://twitter.com/embxii_)
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
 * @default [x+1,y],[x-1,y],[x,y+1],[x,y-1]
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
 * @param animationId of death
 * @desc The animation for the death of a unit.
 * @default 97
 *
 * @param show hp gauge
 * @desc Show the hp gauge below the unit. 0: False, 1: True
 * @default 1
 *
 * @param show state icon
 * @desc Show the icon state of a unit. 0: False, 1: True
 * @default 1
 *
 * @param show phase sprite
 * @desc Show the phase sprite. 0: False, 1: True
 * @default 1
 *
 * @param duration phase sprite
 * @desc The duration to display the phase sprite.
 * @default 120
 *
 * @help
 *
 * For more information, please consult :
 *   - https://forums.rpgmakerweb.com/index.php?threads/tactics-system.97023/
 * Plugin Command:
 *   StartBattleTS          # Start battle scene
 */

var TacticsSystem = TacticsSystem || {};
TacticsSystem.Parameters = PluginManager.parameters('TacticsSystem');

TacticsSystem.cursorSpeed =         Number(TacticsSystem.Parameters['cursor speed']);
TacticsSystem.gridOpacity =         Number(TacticsSystem.Parameters['grid opacity']);
TacticsSystem.movePoints =          Number(TacticsSystem.Parameters['move points']);
TacticsSystem.actionRange =         String(TacticsSystem.Parameters['action range']);
TacticsSystem.moveScopeColor =      String(TacticsSystem.Parameters['move scope color']);
TacticsSystem.allyScopeColor =      String(TacticsSystem.Parameters['ally scope color']);
TacticsSystem.enemyScopeColor =     String(TacticsSystem.Parameters['enemy scope color']);
TacticsSystem.animationIdOfDeath =  String(TacticsSystem.Parameters['animationId of death']);
TacticsSystem.animationIdOfDeath =  String(TacticsSystem.Parameters['animationId of death']);
TacticsSystem.animationIdOfDeath =  String(TacticsSystem.Parameters['animationId of death']);
TacticsSystem.showHpGauge =         Number(TacticsSystem.Parameters['show hp gauge']);
TacticsSystem.showStateIcon =       Number(TacticsSystem.Parameters['show state icon']);
TacticsSystem.showPhaseSprite =     Number(TacticsSystem.Parameters['show phase sprite']);
TacticsSystem.durationPhaseSprite = Number(TacticsSystem.Parameters['duration phase sprite']);

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
    this.createDisplayObjects();
};

Scene_BattleTS.prototype.createDisplayObjects = function() {
    this.createSpriteset();
    this.createSelector();
    this.createWindowLayer();
    this.createAllWindows();
    BattleManagerTS.setLogWindow(this._logWindow);
    BattleManagerTS.setSpriteset(this._spriteset);
    this._logWindow.setSpriteset(this._spriteset);
};

Scene_BattleTS.prototype.createSpriteset = function() {
    this._spriteset = new Spriteset_MapTS();
    this.addChild(this._spriteset);
};

Scene_BattleTS.prototype.createSelector = function() {
    this._selectorSprite = new Sprite_SelectorTS();
    this.addChild(this._selectorSprite);
};

Scene_BattleTS.prototype.createAllWindows = function() {
    this.createLogWindow();
    this.createStatusWindow();
    this.createActorCommandWindow();
    this.createHelpWindow();
    this.createSkillWindow();
    this.createItemWindow();
    this.createActorWindow();
    this.createEnemyWindow();
    this.createEventWindow();
    this.createMessageWindow();
};

Scene_BattleTS.prototype.createLogWindow = function() {
    this._logWindow = new Window_BattleLog();
    this.addWindow(this._logWindow);
};

Scene_BattleTS.prototype.createStatusWindow = function() {
    this._statusWindow = new Window_BattleStatusTS();
    this.addWindow(this._statusWindow);
};

Scene_BattleTS.prototype.createActorCommandWindow = function() {
    this._actorCommandWindow = new Window_ActorCommandTS();
    this._actorCommandWindow.setHandler('attack', this.commandAttack.bind(this));
    this._actorCommandWindow.setHandler('skill',  this.commandSkill.bind(this));
    this._actorCommandWindow.setHandler('guard',  this.commandGuard.bind(this));
    this._actorCommandWindow.setHandler('item',   this.commandItem.bind(this));
    this._actorCommandWindow.setHandler('action', this.commandAction.bind(this));
    this._actorCommandWindow.setHandler('cancel', this.selectPreviousCommand.bind(this));
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
    this._skillWindow.x = Graphics.boxWidth - this._skillWindow.width;
    this._skillWindow.setHelpWindow(this._helpWindow);
    this._skillWindow.setHandler('ok',     this.onSkillOk.bind(this));
    this._skillWindow.setHandler('cancel', this.onSkillCancel.bind(this));
    this.addWindow(this._skillWindow);
};

Scene_BattleTS.prototype.createItemWindow = function() {
    var width = Graphics.boxWidth - this._actorCommandWindow.width;
    var height = this._actorCommandWindow.fittingHeight(4);
    this._itemWindow = new Window_BattleItemTS(0, this._actorCommandWindow.y, width, height);
    this._itemWindow.x = Graphics.boxWidth - this._itemWindow.width;
    this._itemWindow.setHelpWindow(this._helpWindow);
    this._itemWindow.setHandler('ok',     this.onItemOk.bind(this));
    this._itemWindow.setHandler('cancel', this.onItemCancel.bind(this));
    this.addWindow(this._itemWindow);
};

Scene_BattleTS.prototype.createActorWindow = function() {
    this._actorWindow = new Window_BattleActorTS(0, this._actorCommandWindow.y);
    this._actorWindow.x = Graphics.boxWidth - this._actorWindow.width;
    this._actorWindow.setHandler('ok',     this.onActorOk.bind(this));
    this._actorWindow.setHandler('cancel', this.onActorCancel.bind(this));
    this.addWindow(this._actorWindow);
};

Scene_BattleTS.prototype.createEnemyWindow = function() {
    this._enemyWindow = new Window_BattleEnemyTS(0, this._actorCommandWindow.y);
    this._enemyWindow.x = Graphics.boxWidth - this._enemyWindow.width;
    this._enemyWindow.setHandler('ok',     this.onEnemyOk.bind(this));
    this._enemyWindow.setHandler('cancel', this.onEnemyCancel.bind(this));
    this.addWindow(this._enemyWindow);
};

Scene_BattleTS.prototype.createEventWindow = function() {
    this._eventWindow = new Window_BattleEventTS(0, this._actorCommandWindow.y);
    this._eventWindow.x = Graphics.boxWidth - this._eventWindow.width;
    this._eventWindow.setHandler('ok',     this.onEventOk.bind(this));
    this._eventWindow.setHandler('cancel', this.onEventCancel.bind(this));
    this.addWindow(this._eventWindow);
};

Scene_BattleTS.prototype.createMessageWindow = function() {
    this._messageWindow = new Window_Message();
    this.addWindow(this._messageWindow);
    this._messageWindow.subWindows().forEach(function(window) {
        this.addWindow(window);
    }, this);
};

Scene_BattleTS.prototype.start = function() {
    Scene_Base.prototype.start.call(this);
    //BattleManagerTS.playBattleBgm();  see updateEncounterEffect
    BattleManagerTS.startBattle();
};

Scene_BattleTS.prototype.update = function() {
    $gameSelectorTS.update(BattleManagerTS.active());
    this.updateDestination();
    var active = this.isActive();
    $gameMap.update(active);
    if (active && !this.isBusy()) {
        this.updateBattleProcess();
        this.updateStatusWindow();
    }
    $gameTimer.update(active);
    $gameScreen.update();
    Scene_Base.prototype.update.call(this);
};

Scene_BattleTS.prototype.updateDestination = function() {
    if (this.isMapTouchOk()) {
        this.processMapTouch();
    } else {
        $gameTemp.clearDestination();
    }
};

Scene_BattleTS.prototype.isMapTouchOk = function() {
    return this.isActive() && BattleManagerTS.active();
};

Scene_BattleTS.prototype.processMapTouch = function() {
    if (TouchInput.isTriggered()) {
        var x = $gameMap.canvasToMapX(TouchInput.x);
        var y = $gameMap.canvasToMapY(TouchInput.y);
        $gameTemp.setDestination(x, y);
    }
};

Scene_BattleTS.prototype.updateBattleProcess = function() {
    if (!this.isAnyInputWindowActive() || BattleManagerTS.isBattleEnd()) {
        if (BattleManagerTS.isInputting()) {
            this.startActorCommandSelection();
        }
        BattleManagerTS.update();
    }
};

Scene_BattleTS.prototype.isBusy = function() {
    return ((this._messageWindow && this._messageWindow.isClosing()) ||
            Scene_Base.prototype.isBusy.call(this));
};

Scene_BattleTS.prototype.updateStatusWindow = function() {
    var select = $gameSelectorTS.select();
    if (this.canShowStatusWindow(select)) {
        this._statusWindow.open(select);
    } else if (BattleManagerTS.isInputting() || BattleManagerTS.isExploration()) {
        this._statusWindow.close();
    }
};

Scene_BattleTS.prototype.canShowStatusWindow = function(select) {
    return select && select.isAlive() && BattleManagerTS.isExploration();
};

Scene_BattleTS.prototype.isAnyInputWindowActive = function() {
    return (this._actorCommandWindow.active ||
            this._skillWindow.active ||
            this._itemWindow.active ||
            this._actorWindow.active ||
            this._enemyWindow.active ||
            this._eventWindow.active);
};

Scene_BattleTS.prototype.startActorCommandSelection = function() {
    this._actorCommandWindow.setup(BattleManagerTS.subject());
};

Scene_BattleTS.prototype.commandAttack = function() {
    var action = BattleManagerTS.inputtingAction();
    action.setAttack();
    BattleManagerTS.setupLocalBattle(action);
    BattleManagerTS.refreshRedCells(action);
    this.onSelectAction();
};

Scene_BattleTS.prototype.commandSkill = function() {
    this._skillWindow.setActor(BattleManagerTS.subject());
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
    this._itemWindow.refresh();
    this._itemWindow.show();
    this._itemWindow.activate();
};

Scene_BattleTS.prototype.commandAction = function() {
    this.selectEventSelection();
};

Scene_BattleTS.prototype.selectPreviousCommand = function() {
    BattleManagerTS.selectPreviousCommand();
    this.endCommandSelection();
};

Scene_BattleTS.prototype.selectActorSelection = function() {
    this._actorWindow.refresh();
    this._actorWindow.show();
    this._actorWindow.activate();
};

Scene_BattleTS.prototype.onActorOk = function() {
    var action = BattleManagerTS.inputtingAction();
    action.setTarget(this._actorWindow.actorIndex());
    this._actorWindow.hide();
    this._actorCommandWindow.close();
    BattleManagerTS.setupAction();
};

Scene_BattleTS.prototype.onActorCancel = function() {
    this._actorWindow.hide();
    BattleManagerTS.processCancel();
    switch (this._actorCommandWindow.currentSymbol()) {
    case 'skill':
        this._skillWindow.show();
        this._skillWindow.activate();
        break;
    case 'item':
        this._itemWindow.show();
        this._itemWindow.activate();
        break;
    }
};

Scene_BattleTS.prototype.selectEnemySelection = function() {
    this._enemyWindow.refresh();
    this._enemyWindow.show();
    this._enemyWindow.select(0);
    this._enemyWindow.activate();
};

Scene_BattleTS.prototype.onEnemyOk = function() {
    var action = BattleManagerTS.inputtingAction();
    action.setTarget(this._enemyWindow.enemyIndex());
    this._enemyWindow.hide();
    this._actorCommandWindow.close();
    BattleManagerTS.setupAction();
};

Scene_BattleTS.prototype.onEnemyCancel = function() {
    this._enemyWindow.hide();
    BattleManagerTS.processCancel();
    switch (this._actorCommandWindow.currentSymbol()) {
    case 'attack':
        this._actorCommandWindow.activate();
        break;
    case 'skill':
        this._skillWindow.show();
        this._skillWindow.activate();
        break;
    case 'item':
        this._itemWindow.show();
        this._itemWindow.activate();
        break;
    }
};

Scene_BattleTS.prototype.selectEventSelection = function() {
    this._eventWindow.refresh();
    this._eventWindow.show();
    this._eventWindow.activate();
};

Scene_BattleTS.prototype.onEventOk = function() {
    var event = this._eventWindow.target();
    event.start();
    BattleManagerTS.startEvent();
    this._eventWindow.hide();
    this._actorCommandWindow.close();
};

Scene_BattleTS.prototype.onEventCancel = function() {
    this._eventWindow.hide();
    this._actorCommandWindow.activate();
};

Scene_BattleTS.prototype.onSkillOk = function() {
    var skill = this._skillWindow.item();
    var action = BattleManagerTS.inputtingAction();
    action.setSkill(skill.id);
    BattleManagerTS.subject().setLastBattleSkill(skill);
    this.onSelectAction();
};

Scene_BattleTS.prototype.onSkillCancel = function() {
    BattleManagerTS.processCancel();
    this._skillWindow.hide();
    this._actorCommandWindow.activate();
};

Scene_BattleTS.prototype.onItemOk = function() {
    var item = this._itemWindow.item();
    var action = BattleManagerTS.inputtingAction();
    action.setItem(item.id);
    $gameParty.setLastItem(item);
    this.onSelectAction();
};

Scene_BattleTS.prototype.onItemCancel = function() {
    BattleManagerTS.processCancel();
    this._itemWindow.hide();
    this._actorCommandWindow.activate();
};

Scene_BattleTS.prototype.onSelectAction = function() {
    var action = BattleManagerTS.inputtingAction();
    this._skillWindow.hide();
    this._itemWindow.hide();
    if (!action.needsSelection()) {
        this._actorCommandWindow.close();
        BattleManagerTS.setupAction();
    } else if (action.isForOpponent()) {
        this.selectEnemySelection();
    } else {
        this.selectActorSelection();
    }
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
    this._statusWindow.close();
};

Scene_BattleTS.prototype.needsSlowFadeOut = function() {
    return (SceneManager.isNextScene(Scene_Title) ||
            SceneManager.isNextScene(Scene_Gameover));
};

Scene_BattleTS.prototype.terminate = function() {
    Scene_Base.prototype.terminate.call(this);
    BattleManagerTS.terminate();
};

//-----------------------------------------------------------------------------
// BattleManagerTS
//
// The static class that manages battle progress.

function BattleManagerTS() {
    throw new Error('This is a static class');
}

BattleManagerTS.setup = function() {
    this.initMembers();
    $gameScreen.onBattleStart();
    $gameTroop.clear();
    this.createGameObjects();
    var x = $gamePlayer.x;
    var y = $gamePlayer.y;
    $gameSelectorTS.setPosition(x, y);
};

BattleManagerTS.initMembers = function() {
    this._phase = 'preparation';
    this._canLose = false;
    this._logWindow = null;
    this._spriteset = null;
    this._subject = null;
    this._canLose = false;
    this._range = null;
    this._targets = [];
    this._rewards = {};
    this._eventCallback = null;
    this._troopId = 0;
    this._isBattleEnd = false;
    this._turn = 0;
    this._playersOrder = [];
    this._enemiesOrder = [];
};

BattleManagerTS.createGameObjects = function() {
    var actors = [];
    var enemies = [];
    for (var i = 0; i < $gameMap.events().length; i++) {
        var event = $gameMap.events()[i];
        var meta = event.meta();
        if (parseInt(meta['actor']) > 0) {
            this.createGameActors(actors, event);
        } else if (parseInt(meta['enemy']) > 0) {
            this.createGameEnemies(enemies, event);
        }
    }
    this.setupGameObjectsTS(actors, enemies);
};

BattleManagerTS.setupGameObjectsTS = function(actors, enemies) {
    $gamePartyTS.setup(actors);
    $gameTroopTS.setup(enemies);
};

BattleManagerTS.createGameActors = function(actors, event) {
    var actorId = parseInt(event.meta()['actor']);
    actors.push(new Game_ActorTS(event, actorId));
};

BattleManagerTS.createGameEnemies = function(enemies, event) {
    var enemyId = parseInt(event.meta()['enemy']);
    enemies.push(new Game_EnemyTS(event, enemyId));
};

BattleManagerTS.startBattle = function() {
    $gamePlayer.setThrough(true);
    this._spriteset.createGrid()
};

BattleManagerTS.setLogWindow = function(logWindow) {
    this._logWindow = logWindow;
};

BattleManagerTS.setSpriteset = function(spriteset) {
    this._spriteset = spriteset;
};

BattleManagerTS.subject = function() {
    return this._subject.battler();  // use index
};

BattleManagerTS.active = function() {
    if (!this._logWindow.isBusy()) {
        switch (this._phase) {
        case 'preparation':
        case 'playerExplore':
        case 'playerSelect':
            return true;
        }
    }
    return false;
};

BattleManagerTS.update = function() {
    if (!this.isBusy() && !this.updateEvent()) {
        switch (this._phase) {
        case 'preparation':
            this.preparation();
            break;
        case 'startPlayer':
            this.startPlayerPhase();
            break;
        case 'playerExplore':
            this.updateExplore();
            break;
        case 'playerSelect':
            this.updateSelect();
            break;
        case 'startEnemy':
            this.startEnemyPhase();
            break;
        case 'move':
            this.updateMove();
            break;
        case 'action':
            this.updateAction();
            break;
        case 'endAction':
            this.endBattlePhase();
            break;
        case 'battleEnd':
            this.updateBattleEnd();
            break;
        }
    }
};

BattleManagerTS.isBusy = function() {
    return ($gameMessage.isBusy() || this._spriteset.isBusy() ||
        this._logWindow.isBusy());
};

BattleManagerTS.updateEvent = function() {
    switch (this._phase) {
    case 'startPlayer':
    case 'startEnemy':
    case 'endAction':
        return this.updateEventMain();
    }
};

BattleManagerTS.updateEventMain = function() {
    $gameTroop.updateInterpreter();
    $gameParty.requestMotionRefresh();
    if ($gameTroop.isEventRunning() || this.checkBattleEnd()) {
        return true;
    }
    if ($gameTroop.isEventRunning() || SceneManager.isSceneChanging()) {
        return true;
    }
    if ($gameTroop.isEventRunning() || SceneManager.isSceneChanging()) {
        return true;
    }
    if ($gameMap.isEventRunning()) {
        return true;
    }
    return false;
};

BattleManagerTS.preparation = function() {
    this.startTurn();
};

BattleManagerTS.startTurn = function() {
    this._turn++;
    $gameTroop.increaseTurn();
    $gameTroopTS.onTurnStart();
    $gamePartyTS.onTurnStart();
    $gameSelectorTS.setTransparent(true);
    $gameSelectorTS.restorePosition();
    this._logWindow.startTurn();
    this.makePlayersOrder();
    this.makeEnemiesOrder();
    this._spriteset.startPhase('Player Phase');
    this._phase = 'startPlayer';
};

BattleManagerTS.makePlayersOrder = function() {
    var battlers = $gamePartyTS.restrictedMembers();
    // agiliy sort...
    this._playersOrder = battlers;
};

BattleManagerTS.makeEnemiesOrder = function() {
    var battlers = $gameTroopTS.aliveMembers();
    // agility sort...
    this._enemiesOrder = battlers;
};

BattleManagerTS.getNextPlayer = function() {
    return this._playersOrder.shift();
};

BattleManagerTS.getNextEnemy = function() {
    return this._enemiesOrder.shift();
};

BattleManagerTS.startPlayerPhase = function() {
    $gameSelectorTS.setTransparent(false);
    this._subject = this.getNextPlayer();
    if (this._subject) {
        this.updatePlayerPhase();
    } else if (this.isPlayerPhase()) {
        this.refreshBlueCells();
        this._phase = 'playerExplore';
    } else {
        this.endPlayerPhase();
    }
};

BattleManagerTS.updatePlayerPhase = function() {
    // see updateEnemiePhase !
    this._subject.updateRange();
    $gameParty.setupTS([this._subject.battler()]);
    var pos = this._subject.makeMove();
    $gameSelectorTS.performTransfer(pos.x, pos.y);
    this.subject().makeActions();
    this._phase = 'move';
};

BattleManagerTS.isPlayerPhase = function() {
    return $gamePartyTS.isPhase();
};

BattleManagerTS.updateExplore = function() {
    this.refreshBlueCells();
    if (this.canSelectActor($gameSelectorTS.select())) {
        SoundManager.playOk();
        this._subject = $gameSelectorTS.select();
        this._subject.savePosition();
        $gameParty.setupTS([this._subject.battler()]);
        this._phase = 'playerSelect';
    }
};

BattleManagerTS.updateSelect = function() {
    var x = $gameSelectorTS.x;
    var y = $gameSelectorTS.y;
    var select = $gameSelectorTS.select();
    if ($gameMap.isOnTiles(x, y)) {
        if (this.canExecuteMove(select)) {
            SoundManager.playOk();
            $gameMap.eraseTiles();
            this._phase = 'move';
        }
    }
    if (this.isCancelled()) {
        this.selectPreviousCommand();
    }
};

BattleManagerTS.updateMove = function() {
    var x = $gameSelectorTS.x;
    var y = $gameSelectorTS.y;
    this._subject.moveStraightTo(x, y);
    if (this._subject.pos(x, y) && !this._subject.isMoving()) {
        if (this.subject().isActor() && !this.subject().isRestricted()) {
            this._phase = 'input';
        } else {
            this.setupAction();
        }
    }
};

BattleManagerTS.isInputting = function() {
    return this._phase === 'input';
};

BattleManagerTS.isExploration = function() {
    return this._phase === 'playerExplore';
};

BattleManagerTS.isSelect = function() {
    return this._phase === 'playerSelect';
};

BattleManagerTS.isStartPhase = function() {
    return this._phase === 'startPlayer' || this._phase === 'startEnemy';
};

BattleManagerTS.inputtingAction = function() {
    return this.subject().inputtingAction();
};

BattleManagerTS.endPlayerPhase = function() {
    $gameSelectorTS.setTransparent(true);
    $gameSelectorTS.savePosition();
    $gameTroopTS.battlerMembers().forEach(function(enemy) {
        enemy.onTurnEnd();
        this._logWindow.displayAutoAffectedStatus(enemy);
        this._logWindow.displayRegeneration(enemy);
    }, this);
    this._spriteset.startPhase('Enemy Phase');
    this._phase = 'startEnemy';
};

BattleManagerTS.startEnemyPhase = function() {
    $gameSelectorTS.setTransparent(false);
    this._subject = null;
    if (this.isEnemyPhase()) {
        this.updateEnemyPhase();
    } else {
        this.endEnemyPhase();
    }
};

BattleManagerTS.isEnemyPhase = function() {
    return $gameTroopTS.isPhase();
};

BattleManagerTS.updateEnemyPhase = function() {
    this._subject = this.getNextEnemy();
    this._subject.updateRange();
    $gameTroop.setupTS([this.subject()]);
    var pos = this._subject.makeMove();
    $gameSelectorTS.performTransfer(pos.x, pos.y);
    this.subject().makeActions();
    $gameMap.eraseTiles();
    this._phase = 'move';
};

BattleManagerTS.endEnemyPhase = function() {
    $gamePartyTS.battlerMembers().forEach(function(actor) {
        actor.onTurnEnd();
        this._logWindow.displayAutoAffectedStatus(actor);
        this._logWindow.displayRegeneration(actor);
    }, this);
    this.startTurn();
};

BattleManagerTS.setupAction = function() {
    var action = this.subject().currentAction();
    if (action && action.isValid()) {
        this.setupLocalBattle(action);
    }
    this.processAction();
};

BattleManagerTS.processAction = function() {
    var subject = this.subject();
    var action = subject.currentAction();
    if (action) {
        action.prepare();
        if (action.isValid()) {
            this.startAction();
        }
        subject.removeCurrentAction();
    } else {
        subject.onAllActionsEnd();
        this._logWindow.displayAutoAffectedStatus(subject);
        this._logWindow.displayCurrentState(subject);
        this._logWindow.displayRegeneration(subject);
        this._phase = 'endAction';
    }
};

BattleManagerTS.startAction = function() {
    var subject = this.subject();
    var action = subject.currentAction();
    var targets = action.makeTargets();
    this._phase = 'action';
    this._action = action;
    this._targets = targets;
    subject.useItem(action.item());
    this._action.applyGlobal();
    this._logWindow.startAction(subject, action, targets);
};

BattleManagerTS.updateAction = function() {
    var target = this._targets.shift();
    if (target) {
        var friendsUnitTS = target.friendsUnitTS();
        var battler = friendsUnitTS.getBattlerTS(target);
        BattleManagerTS.performTransfer(battler);
        this.invokeAction(this.subject(), target);
    } else {
        this._logWindow.endAction(this.subject());
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
    $gamePartyTS.refreshState();
    $gameTroopTS.refreshState();
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

BattleManagerTS.endBattlePhase = function() {
    this._subject.endAction();
    $gameMap.eraseTiles();
    if (this._subject.isActor()) {
        this._phase = 'startPlayer';
    } else {
        this._phase = 'startEnemy';
    }
};

BattleManagerTS.refreshBlueCells = function() {
    if ($gameSelectorTS.hadMoved()) {
        $gameMap.eraseTiles();
        var subject = $gameSelectorTS.select();
        if (this.canShowBlueCells(subject)) {
            $gameMap.setMoveColor();
            subject.updateRange();
        }
    }
};

BattleManagerTS.setupLocalBattle = function(action) {
    var gameFriends = action.friendsUnit();
    gameFriends.setupTS(action.battleFriendsUnit(this._subject));
    var gameOpponents = action.opponentsUnit();
    gameOpponents.setupTS(action.battleOpponentsUnit(this._subject));
};

BattleManagerTS.refreshRedCells = function(action) {
    $gameMap.eraseTiles();
    BattleManagerTS.setupLocalBattle(action);
    $gameMap.setActionColor(action);
    action.showRange();
};

BattleManagerTS.processCancel = function() {
    $gameMap.eraseTiles();
    var x = this._subject.x;
    var y = this._subject.y;
    $gameSelectorTS.performTransfer(x, y);
};

BattleManagerTS.performTransfer = function(battler) {
    $gameSelectorTS.performTransfer(battler.x, battler.y);
};

BattleManagerTS.selectPreviousCommand = function() {
    SoundManager.playCancel();
    this._subject.restorePosition();
    $gameSelectorTS.updateSelect();
    this.refreshBlueCells();
    this._phase = 'playerExplore'
};

BattleManagerTS.checkBattleEnd = function() {
    if (this._phase && BattleManagerTS.isStartPhase()) {
        if ($gamePartyTS.isAllDead()) {
            $gameSelectorTS.setTransparent(true);
            this.processDefeat();
            return true;
        } else if ($gameTroopTS.isAllDead()) {
            $gameSelectorTS.setTransparent(true);
            this.processVictory();
            return true;
        }
    }
    return false;
};

BattleManagerTS.processVictory = function() {
    $gameParty.setupTS($gamePartyTS.battlerMembers());
    $gameTroop.setupTS($gameTroopTS.battlerMembers());
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

BattleManagerTS.processDefeat = function() {
    this.displayDefeatMessage();
    this.playDefeatMe();
    if (this._canLose) { // fix this
        this.replayBgmAndBgs();
    } else {
        AudioManager.stopBgm();
    }
    this.endBattle(2);
};

BattleManagerTS.endBattle = function(result) {
    this._phase = 'battleEnd';
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
    AudioManager.stopBgm();
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
    if (!this._escaped && $gameParty.isAllDead()) {
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
    this._isBattleEnd = true;
};

BattleManagerTS.isBattleEnd = function() {
    return this._isBattleEnd;
};

BattleManagerTS.isTriggered = function() {
    return Input.isTriggered('ok') || $gameSelectorTS.triggerTouchAction();
};

BattleManagerTS.isCancelled = function() {
    return Input.isTriggered('cancel') || TouchInput.isCancelled();
};

BattleManagerTS.canShowBlueCells = function(select) {
    return select && select.canPlay() && select.isAlive();
};

BattleManagerTS.canSelectActor = function(actor) {
    return (this.isTriggered() && this.selectIsValidForSelection(actor));
};

BattleManagerTS.selectIsValidForSelection = function(actor) {
    return (actor && actor.isActor() && actor.canPlay());
};

BattleManagerTS.canExecuteMove = function(subject) {
    return (this.isTriggered() && this.selectIsValidForMove(subject));
};

BattleManagerTS.selectIsValidForMove = function(subject) {
    return (!subject || subject === this._subject);
};

BattleManagerTS.terminate = function() {
    $gamePlayer.setThrough(false);
    $gameTemp.clearPosition();
};

BattleManagerTS.startEvent = function() {
    this._phase = 'action';
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
    this._select = null;
    this._hadMoved = false;
    this._transparent = false;
};

Game_SelectorTS.prototype.pos = function(x, y) {
    return this.x === x && this.y === y;
};

Game_SelectorTS.prototype.setPosition = function(x, y) {
    this._realX = this._x = x;
    this._realY = this._y = y;
};

Game_SelectorTS.prototype.isWaiting = function() {
    return this._wait >= 0;
};

Game_SelectorTS.prototype.select = function() {
    return this._select;
};

Game_SelectorTS.prototype.hadMoved= function() {
    return this._hadMoved;
};

Game_SelectorTS.prototype.getInputDirection = function() {
    return Input.dir4;
};

Game_SelectorTS.prototype.update = function(active) {
    if (active) {
        var scrolledX = this.scrolledX();
        var scrolledY = this.scrolledY();
        this.moveByInput();
        this.moveByDestination();
        this.updateMove();
        this.updateScroll(scrolledX, scrolledY);
        this.updateWait();
    }
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
    return (!$gameMap.isEventRunning() && !$gameMessage.isBusy());
};

Game_SelectorTS.prototype.moveByInput = function() {
    var direction = this.getInputDirection();
    this._hadMoved = false;
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
    this._direction = direction;
    this._x = x;
    this._y = y;
};

Game_SelectorTS.prototype.performTransfer = function(x, y) {
    this._realX = this._x = x;
    this._realY = this._y = y;
    $gameMap.setDisplayPos(x - this.centerX(), y - this.centerY());
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

Game_SelectorTS.prototype.updateSelect = function() {
    this._hadMoved = true;
    this._select = null;
    var actors = $gamePartyTS.aliveMembers();
    var enemies = $gameTroopTS.aliveMembers();
    var data = actors.concat(enemies);
    data.forEach(function(battler) {
        if (this.isOnData(battler)) {
            this._select = battler;
        }
    }, this);
};

Game_SelectorTS.prototype.isOnData = function(data) {
    return this.pos(data.x, data.y);
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

Game_SelectorTS.prototype.triggerTouchAction = function() {
    if ($gameTemp.isDestinationValid()) {
        var destX = $gameTemp.destinationX();
        var destY = $gameTemp.destinationY();
        if (this.x === destX && destY === this.y) {
            $gameTemp.clearDestination();
            return true;
        }
    }
    return false;
};

Game_SelectorTS.prototype.setTransparent = function(transparent) {
    this._transparent = transparent;
};

Game_SelectorTS.prototype.isTransparent = function() {
    return this._transparent;
};

//-----------------------------------------------------------------------------
// Game_BattlerTS
//
// The superclass of Game_ActorTS and Game_EnemyTS. It contains methods for
// event and actor.

function Game_BattlerTS() {
    this.initialize.apply(this, arguments);
}

Game_BattlerTS.prototype.constructor = Game_BattlerTS;

Object.defineProperties(Game_BattlerTS.prototype, {
    x: { get: function() { return this._x; }, configurable: true },
    y: { get: function() { return this._y; }, configurable: true }
});

Game_BattlerTS.prototype.initialize = function(event) {
    this.initMembers()
    this._x = event.x;
    this._y = event.y;
    this._event = event;
};

Game_BattlerTS.prototype.initMembers = function() {
    this._x = 0;
    this._y = 0;
    this._event = null;
    this._move = 0;
    this._movePath = [];
    this._hasPlayed = false;
};

Game_BattlerTS.prototype.pos = function(x, y) {
    return this.x === x && this.y === y;
};

Game_BattlerTS.prototype.event = function(x, y) {
    return this._event;
};

Game_BattlerTS.prototype.battler = function(x, y) {
    return null;
};

Game_BattlerTS.prototype.setMove = function(object) {
    this._move = object.meta['move'] || TacticsSystem.movePoints || 5;
};

Game_BattlerTS.prototype.canPlay = function() {
    return !this._hasPlayed;
};

Game_BattlerTS.prototype.onTurnStart = function() {
    this._hasPlayed = false;
};

Game_BattlerTS.prototype.endAction = function() {
    this.defaultDirection();
    this._hasPlayed = true;
};

Game_BattlerTS.prototype.defaultDirection = function() {
    this._event.setDirection(2);
};

Game_BattlerTS.prototype.updateRange = function() {
    this._event.tilesRange(this._move);
};

Game_BattlerTS.prototype.moveStraightTo = function(x, y) {
    var direction = this._event.findDirectionTo(x, y);
    this._x = $gameMap.roundXWithDirection(this._event.x, direction);
    this._y = $gameMap.roundYWithDirection(this._event.y, direction);
    this._event.moveStraight(direction);
};

Game_BattlerTS.prototype.refreshState = function() {
    if (!this.isAlive() && !this._event.isErased()) {
        var animationIdOfDeath = TacticsSystem.animationIdOfDeath || -1;
        this._event.requestAnimation(animationIdOfDeath);
        this._event.erase();
    }
};

Game_BattlerTS.prototype.isMoving = function() {
    return this._event.isMoving();
};

Game_BattlerTS.prototype.isActor = function() {
    return this.battler().isActor();
};

Game_BattlerTS.prototype.isAlive = function() {
    return this.battler().isAlive();
};

Game_BattlerTS.prototype.isItemRangeValid = function(item) {
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

Game_BattlerTS.prototype.isSkillRangeOk = function(item) {
    var action = new Game_Action(this.battler());
    action.setSkill(item.id);
    if (action.isForOpponent()) {
        return action.battleOpponentsUnit(this).length > 0;
    }
    if (action.isForFriend()) {
        return action.battleFriendsUnit(this).length > 0;
    }
    return false;
};

Game_BattlerTS.prototype.isItemRangeOk = function(item) {
    var action = new Game_Action(this.battler());
    action.setItem(item.id);
    if (action.isForOpponent()) {
        return action.battleOpponentsUnit(this).length > 0;
    }
    if (action.isForFriend()) {
        return action.battleFriendsUnit(this).length > 0;
    }
    return false;
};

Game_BattlerTS.prototype.makeMove = function() {
    //if (this.isAutoBattle()) {
    //    this.makeAutoBattleMove();
    //}
    if (this.battler().isConfused()) {
        return this.makeConfusionMove();
    }
    return new Point(this.x, this.y);
};

Game_BattlerTS.prototype.makeConfusionMove = function() {
    var action = new Game_Action(this.battler());
    action.setConfusion();
    var target = [new Point(this.x, this.y)];
    for (var i = 0; i < $gameMap.tiles().length; i++) {
        var temp = $gameMap.tiles()[i];
        this._x = temp.x;
        this._y = temp.y;
        if (this.battler().canUse(action.item()) && this.isConfusedRangeOk(action)) {
            if ($gameMap.eventsXy(this._x, this._y).length === 0) {
                target.push(new Point(this.x, this.y));
            }
        }
    }
    target = target[Math.floor(Math.random() * target.length)];
    this._x = target.x;
    this._y = target.y;
    return target;
};

Game_BattlerTS.prototype.isConfusedRangeOk = function(action) {
    switch (this.battler().confusionLevel()) {
    case 1:
        return action.battleOpponentsUnit(this).length > 0;
    case 2:
        return action.battleOpponentsUnit(this).length > 0 ||
            action.battleFriendsUnit(this).length > 1;  // don't count self
    default:
        return action.battleFriendsUnit(this).length > 1;
    }
};

//-----------------------------------------------------------------------------
// Game_ActorTS
//
// The game object class for an actor.

function Game_ActorTS() {
    this.initialize.apply(this, arguments);
}

Game_ActorTS.prototype = Object.create(Game_BattlerTS.prototype);
Game_ActorTS.prototype.constructor = Game_ActorTS;

Game_ActorTS.prototype.initialize = function(event, actorId) {
    Game_BattlerTS.prototype.initialize.call(this, event);
    this._actor = $gameActors.actor(actorId);
    this._actions = [];
    this.setMove($dataActors[actorId]);
};

Game_ActorTS.prototype.battler = function() {
    return this._actor;
};

Game_ActorTS.prototype.opponentsUnit = function() {
    return $gameTroopTS;
};

Game_ActorTS.prototype.friendsUnit = function() {
    return $gamePartyTS;
};

Game_ActorTS.prototype.onTurnStart = function() {
    Game_BattlerTS.prototype.onTurnStart.call(this);
    this.battler().makeActions();
};

Game_ActorTS.prototype.actions = function() {
    return this._actions;
};

Game_ActorTS.prototype.canAction = function() {
    return this.checkEventTriggerThere();
};

Game_ActorTS.prototype.checkEventTriggerThere = function() {
    this._actions = []
    for (var d = 8; d >= 2; d -= 2) {
        var x1 = this.x;
        var y1 = this.y;
        var x2 = $gameMap.roundXWithDirection(x1, d);
        var y2 = $gameMap.roundYWithDirection(y1, d);
        this.checkEventsTriggerHere(x2, y2);
    }
    return this._actions.length > 0;
};

Game_ActorTS.prototype.checkEventsTriggerHere = function(x, y) {
    if (!$gameMap.isEventRunning()) {
        var events = $gameMap.eventsXy(x, y);
        for (var i = 0; i < events.length; i++) {
            var event = events[i];
            if (event.isTriggerIn([0]) && event.isNormalPriority() === true) {
                this._actions.push(event);
            }
        }
    }
};

Game_ActorTS.prototype.restorePosition = function() {
    var positionX = $gameTemp.positionX();
    var positionY = $gameTemp.positionY();
    this._event.setPosition(positionX, positionY);
    this._x = positionX;
    this._y = positionY;
    this.defaultDirection();
};

Game_ActorTS.prototype.savePosition = function() {
    $gameTemp.setPosition(this.x, this.y);
};

//-----------------------------------------------------------------------------
// Game_EnemyTS
//
// The game object class for an enemy.

function Game_EnemyTS() {
    this.initialize.apply(this, arguments);
}

Game_EnemyTS.prototype = Object.create(Game_BattlerTS.prototype);
Game_EnemyTS.prototype.constructor = Game_EnemyTS;

Game_EnemyTS.prototype.initialize = function(event, enemyId) {
    Game_BattlerTS.prototype.initialize.call(this, event);
    this._enemy = new Game_Enemy(enemyId, 0, 0); // to do x and y
    this._char = new Game_Character();  // it's used to calculate the shortest path
    this.setMove($dataEnemies[enemyId]);
    this.setAggro($dataEnemies[enemyId], event);
};

Game_EnemyTS.prototype.setAggro = function(object, event) {
    var meta = event.meta();
    this._aggro = parseInt(meta['aggro']) || object.meta['aggro'] || this._move;
};

Game_EnemyTS.prototype.aggro = function() {
    return this._aggro;
};

Game_EnemyTS.prototype.battler = function() {
    return this._enemy;
};

Game_EnemyTS.prototype.opponentsUnit = function() {
    return $gamePartyTS;
};

Game_EnemyTS.prototype.friendsUnit = function() {
    return $gameTroopTS;
};

Game_EnemyTS.prototype.makeMove = function() {
    if (this.battler().isConfused()) {
        return this.makeConfusionMove();
    } else if (!this.battler().canMove()) {
        return new Point(this.x, this.y);
    } else {
        return this.findBestMove();
    }
};

Game_EnemyTS.prototype.findBestMove = function() {
    this._event.tilesRange(this._aggro);
    var target = this.findTarget();
    this._event.tilesRange(this._move);
    var pos = new Point(this.x, this.y);
    this._char.setPosition(this.x, this.y);
    while (!this.isPosFound(this._char.x, this._char.y, pos, target)) {
        pos = new Point(this._char.x, this._char.y);
        var direction = this._char.findDirectionTo(target.x, target.y);
        this._char.moveStraight(direction);
    }
    this._x = pos.x;
    this._y = pos.y;
    return pos;
};

Game_EnemyTS.prototype.findTarget = function() {
    var rate = 0;
    var x = this.x;
    var y = this.y;
    var target = new Point(this.x, this.y);
    for (var i = 0; i < $gameMap.tiles().length; i++) {
        var tile = $gameMap.tiles()[i];
        this._x = $gameMap.positionTileX(tile);
        this._y = $gameMap.positionTileY(tile);
        var actionList = this.battler().enemy().actions.filter(function(a) {
            return this.battler().isActionValid(a);
        }, this);
        var sum = actionList.reduce(function(r, a) {
            return r + a.rating * 3;  // * 3 !
        }, 0);
        if (sum > rate) {
            rate = sum;
            target = new Point(this.x, this.y);
        }
    }
    this._x = x;
    this._y = y;
    return target;
};

Game_EnemyTS.prototype.isPosFound = function(x, y, pos, target) {
    return !$gameMap.isOnTiles(x, y) || this.isOnTarget(pos, target);
};

Game_EnemyTS.prototype.isOnTarget = function(pos, target) {
    return pos.x === target.x && pos.y === target.y;
};

//-----------------------------------------------------------------------------
// Game_UnitTS
//
// The superclass of Game_PartyTS and Game_Troop.

function Game_UnitTS() {
    this.initialize.apply(this, arguments);
}

Game_UnitTS.prototype.initialize = function() {
};

Game_UnitTS.prototype.members = function() {
    return [];
};

Game_UnitTS.prototype.battlerMembers = function() {
    return this.members().map(function(member) {
        return member.battler();
    });
};

Game_UnitTS.prototype.eventMembers = function() {
    return this.members().map(function(member) {
        return member.event();
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

Game_UnitTS.prototype.canPlayMembers = function() {
    return this.aliveMembers().filter(function(member) {
        return member.canPlay();
    });
};

Game_UnitTS.prototype.isPhase = function() {
    return this.canPlayMembers().length > 0;
};

Game_UnitTS.prototype.getBattlerTS = function(object) {
    for (var i = 0; i < this.members().length; i++) {
        var member = this.members()[i]
        if (member.battler() === object) {
            return member;
        }
        if (member.event() === object) {
            return member;
        }
    }
    return null;
};

Game_UnitTS.prototype.refreshState = function() {
    this.members().forEach(function(member) {
        member.refreshState();
    });
};

//-----------------------------------------------------------------------------
// Game_PartyTS
//
// The game object class for a troop.

function Game_PartyTS() {
    this.initialize.apply(this, arguments);
}

Game_PartyTS.prototype = Object.create(Game_UnitTS.prototype);
Game_PartyTS.prototype.constructor = Game_PartyTS;

Game_PartyTS.prototype.initialize = function() {
    Game_UnitTS.prototype.initialize.call(this);
    this._interpreter = new Game_Interpreter();
    this._actors = [];
    this._maxBattleMembers = 4;
    this._inBattleTS = false;
};

Game_PartyTS.prototype.setup = function(actors) {
    this._actors = actors;
    this._maxBattleMembers = actors.length;
    this._inBattleTS = true;
};

Game_PartyTS.prototype.inBattleTS = function() {
    return this._inBattleTS;
};

Game_PartyTS.prototype.members = function() {
    return this._actors.slice(0);
};

Game_PartyTS.prototype.battleMembers = function() {
    return $gameParty.members().map(function(member) {
        return this.getBattlerTS(member);
    }, this);
};

Game_PartyTS.prototype.maxBattleMembers = function() {
    return this._maxBattleMembers;
};

Game_PartyTS.prototype.restrictedMembers = function() {
    return this.members().filter(function(member) {
        return member.battler().isRestricted() && member.isAlive();
    }, this);
};

//-----------------------------------------------------------------------------
// Game_TroopTS
//
// The game object class for a troop.

function Game_TroopTS() {
    this.initialize.apply(this, arguments);
}

Game_TroopTS.prototype = Object.create(Game_UnitTS.prototype);
Game_TroopTS.prototype.constructor = Game_TroopTS;

Game_TroopTS.prototype.initialize = function() {
    Game_UnitTS.prototype.initialize.call(this);
};

Game_TroopTS.prototype.setup = function(enemies) {
    this._enemies = enemies;
};

Game_TroopTS.prototype.members = function() {
    return this._enemies.slice(0);
};

Game_TroopTS.prototype.battleMembers = function() {
    return $gameTroop.members().map(function(member) {
        return this.getBattlerTS(member);
    }, this);
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
    Window_ActorCommand.prototype.initialize.call(this);
};

Window_ActorCommandTS.prototype.setup = function(actor) {
    this._actor = actor;
    this.refresh();
    this.selectLast();
    this.activate();
    this.open();
};

Window_ActorCommandTS.prototype.makeCommandList = function() {
    if (this._actor) {
        this.addAttackCommand();
        this.addSkillCommands();
        this.addGuardCommand();
        this.addItemCommand();
        this.addActionCommand();
    }
};

Window_ActorCommandTS.prototype.addActionCommand = function() {
    var friendsUnitTS = this._actor.friendsUnitTS();
    var actorTS = friendsUnitTS.getBattlerTS(this._actor);
    if (actorTS.canAction()) {
        this.addCommand('Action', 'action');
    }
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
    var width = this.windowWidth();
    var height = this.windowHeight();
    var x = Graphics.boxWidth - (this.windowWidth());
    var y = Graphics.boxHeight - (this.windowHeight());
    Window_Base.prototype.initialize.call(this, x, y, width, height);
    this.openness = 0;
};

Window_BattleStatusTS.prototype.setup = function(actor) {
    this.refresh();
};

Window_BattleStatusTS.prototype.windowWidth = function() {
    return 420;
};

Window_BattleStatusTS.prototype.windowHeight = function() {
    return this.fittingHeight(this.numVisibleRows());
};

Window_BattleStatusTS.prototype.numVisibleRows = function() {
    return 4;
};

Window_BattleStatusTS.prototype.open = function(battlerTS) {
    this.refresh(battlerTS)
    Window_Base.prototype.open.call(this);
};

Window_BattleStatusTS.prototype.refresh = function(battlerTS) {
    var battler = battlerTS.battler();
    var event = battlerTS.event();
    this.contents.clear();
    if (battler.isActor()) {
        this.drawActorFace(battler, 0, 0, Window_Base._faceWidth, Window_Base._faceHeight);
        this.drawActorSimpleStatus(battler, 0, 0, 420);
    } else {
        this.drawEnemyImage(battler, 0, 0);
        this.drawEnemySimpleStatus(battler, 0, 0, 420);
    }
};

Window_Base.prototype.drawEnemySimpleStatus = function(enemy, x, y, width) {
    var lineHeight = this.lineHeight();
    var x2 = x + 180;
    var width2 = Math.min(200, width - 180 - this.textPadding());
    this.drawActorName(enemy, x2, y);
    this.drawActorHp(enemy, x2, y + lineHeight * 1, width2);
    this.drawActorMp(enemy, x2, y + lineHeight * 2, width2);
};

Window_Base.prototype.drawEnemyImage = function(battler, x, y, width, height) {
    width = width || Window_Base._faceWidth;
    height = height || Window_Base._faceHeight;
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
// Window_BattleTarget
//
// The window for selecting a target on the battle screen.

function Window_BattleTargetTS() {
    this.initialize.apply(this, arguments);
}

Window_BattleTargetTS.prototype = Object.create(Window_Selectable.prototype);
Window_BattleTargetTS.prototype.constructor = Window_BattleTargetTS;

Window_BattleTargetTS.prototype.initialize = function(x, y) {
    var width = this.windowWidth();
    var height = this.windowHeight();
    Window_Selectable.prototype.initialize.call(this, x, y, width, height);
    this.hide();
};

Window_BattleTargetTS.prototype.windowWidth = function() {
    return Graphics.boxWidth - 192;
};

Window_BattleTargetTS.prototype.windowHeight = function() {
    return this.fittingHeight(this.numVisibleRows());
};

Window_BattleTargetTS.prototype.numVisibleRows = function() {
    return 4;
};

Window_BattleTargetTS.prototype.maxCols = function() {
    return 2;
};

Window_BattleTargetTS.prototype.maxItems = function() {
    return 0;
};

Window_BattleTargetTS.prototype.target = function() {
    return null;
};

Window_BattleTargetTS.prototype.show = function() {
    this.refresh();
    this.select(0);
    BattleManagerTS.performTransfer(this.target());
    Window_Selectable.prototype.show.call(this);
};

Window_BattleTargetTS.prototype.processCursorMove = function () {
    var lastIndex = this.index();
    Window_Selectable.prototype.processCursorMove.call(this);
    if (this.index() !== lastIndex) {
        BattleManagerTS.performTransfer(this.target());
    }
};

Window_BattleTargetTS.prototype.onTouch = function(triggered) {
    var lastIndex = this.index();
    Window_Selectable.prototype.onTouch.call(this, triggered);
    if (this.index() !== lastIndex) {
        BattleManagerTS.performTransfer(this.target());
    }
};

//-----------------------------------------------------------------------------
// Window_BattleActorTS
//
// The window for selecting a target actor on the battle screen.

function Window_BattleActorTS() {
    this.initialize.apply(this, arguments);
}

Window_BattleActorTS.prototype = Object.create(Window_BattleTargetTS.prototype);
Window_BattleActorTS.prototype.constructor = Window_BattleActorTS;

Window_BattleActorTS.prototype.initialize = function(x, y) {
    this._actors = [];
    Window_BattleTargetTS.prototype.initialize.call(this, x, y);
};

Window_BattleActorTS.prototype.maxItems = function() {
    return this._actors.length;
};

Window_BattleActorTS.prototype.target = function() {
    return this._actors[this.index()];
};

Window_BattleActorTS.prototype.actorIndex = function() {
    var actor = this.target().battler();
    return actor ? actor.index() : -1;
};

Window_BattleActorTS.prototype.drawItem = function(index) {
    this.resetTextColor();
    if (this._actors[index]) {
        var name = this._actors[index].battler().name();
        var rect = this.itemRectForText(index);
        this.drawText(name, rect.x, rect.y, rect.width);
    }
};

Window_BattleActorTS.prototype.hide = function() {
    Window_BattleTargetTS.prototype.hide.call(this);
    $gameParty.select(null);
};

Window_BattleActorTS.prototype.refresh = function() {
    this._actors = $gamePartyTS.battleMembers();
    Window_BattleTargetTS.prototype.refresh.call(this);
};

Window_BattleActorTS.prototype.select = function(index) {
    Window_BattleTargetTS.prototype.select.call(this, index);
    $gameParty.select(this.target());
};

//-----------------------------------------------------------------------------
// Window_BattleEnemyTS
//
// The window for selecting a target enemy on the battle screen.

function Window_BattleEnemyTS() {
    this.initialize.apply(this, arguments);
}

Window_BattleEnemyTS.prototype = Object.create(Window_BattleTargetTS.prototype);
Window_BattleEnemyTS.prototype.constructor = Window_BattleEnemyTS;

Window_BattleEnemyTS.prototype.initialize = function(x, y) {
    this._enemies = [];
    Window_BattleTargetTS.prototype.initialize.call(this, x, y);
};

Window_BattleEnemyTS.prototype.maxItems = function() {
    return this._enemies.length;
};

Window_BattleEnemyTS.prototype.target = function() {
    return this._enemies[this.index()];
};

Window_BattleEnemyTS.prototype.enemyIndex = function() {
    var enemy = this.target().battler();
    return enemy ? enemy.index() : -1;
};

Window_BattleEnemyTS.prototype.drawItem = function(index) {
    this.resetTextColor();
    var name = this._enemies[index].battler().name();
    var rect = this.itemRectForText(index);
    this.drawText(name, rect.x, rect.y, rect.width);
};

Window_BattleEnemyTS.prototype.hide = function() {
    Window_BattleTargetTS.prototype.hide.call(this);
    $gameTroop.select(null);
};

Window_BattleEnemyTS.prototype.refresh = function() {
    this._enemies = $gameTroopTS.battleMembers();
    Window_BattleTargetTS.prototype.refresh.call(this);
};

Window_BattleEnemyTS.prototype.select = function(index) {
    Window_BattleTargetTS.prototype.select.call(this, index);
    $gameTroop.select(this.target());
};

Window_BattleEnemyTS.prototype.processCursorMove = function () {
    var lastIndex = this.index();
    Window_BattleTargetTS.prototype.processCursorMove.call(this);
    if (this.index() !== lastIndex) {
        var action = BattleManagerTS.inputtingAction();
        action.setTarget(this.enemyIndex())
        console.log(action.makeDamageValue(this.target().battler(), false));
    }
};

//-----------------------------------------------------------------------------
// Window_BattleEvent
//
// The window for selecting a event on the battle screen.

function Window_BattleEventTS() {
    this.initialize.apply(this, arguments);
}

Window_BattleEventTS.prototype = Object.create(Window_BattleTargetTS.prototype);
Window_BattleEventTS.prototype.constructor = Window_BattleEventTS;

Window_BattleEventTS.prototype.initialize = function(x, y) {
    this._actions = [];
    // bad idea to call that this._events !
    // initialize create an attribute "this._events" that is an empty object
    // come from Pixi's EventEmitter !
    Window_BattleTargetTS.prototype.initialize.call(this, x, y);
};

Window_BattleEventTS.prototype.maxItems = function() {
    return this._actions.length;
};

Window_BattleEventTS.prototype.target = function() {
    return this._actions[this.index()];
};

Window_BattleEventTS.prototype.drawItem = function(index) {
    this.resetTextColor();
    var name = this._actions[index].name();
    var rect = this.itemRectForText(index);
    this.drawText(name, rect.x, rect.y, rect.width);
};


Window_BattleEventTS.prototype.refresh = function() {
    var subject = BattleManagerTS._subject;  // to do
    if (subject) {
        this._actions = subject.actions();
    }
    Window_BattleTargetTS.prototype.refresh.call(this);
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
        var action = BattleManagerTS.inputtingAction();
        action.setSkill(this.item().id);
        BattleManagerTS.refreshRedCells(action);
    }
};

Window_BattleSkillTS.prototype.show = function() {
    Window_BattleSkill.prototype.show.call(this);
    if (this.item()) {
        var action = BattleManagerTS.inputtingAction();
        action.setSkill(this.item().id);
        BattleManagerTS.refreshRedCells(action);
    }
};

//-----------------------------------------------------------------------------
// Window_BattleItemTS
//
// The window for selecting a item to use on the battle screen.

function Window_BattleItemTS() {
    this.initialize.apply(this, arguments);
}

Window_BattleItemTS.prototype = Object.create(Window_BattleItem.prototype);
Window_BattleItemTS.prototype.constructor = Window_BattleSkillTS;

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
// The sprite for displaying a selector.

function Spriteset_MapTS() {
    this.initialize.apply(this, arguments);
}

Spriteset_MapTS.prototype = Object.create(Spriteset_Map.prototype);
Spriteset_MapTS.prototype.constructor = Spriteset_MapTS;

Spriteset_MapTS.prototype.initialize = function() {
    Spriteset_Map.prototype.initialize.call(this);
    this.createActors();
    this.createEnemies();
    this.createPhase();
};

Spriteset_MapTS.prototype.createLowerLayer = function() {
    Spriteset_Map.prototype.createLowerLayer.call(this);
    this.createTiles();
};

Spriteset_MapTS.prototype.createTiles = function() {
    this._tilesSprite = new Sprite_Base();
    var width = $gameMap.width();
    var height = $gameMap.height();
    this._tilesSprite.bitmap = new Bitmap(width * 48, height * 48);
    this._tilesSprite.z = 1;
    this._tilesSprite.opacity = 120;
    this._tilesSprite.color = TacticsSystem.moveScopeColor || '#0066CC';
    this.loadTiles();
    this._tilemap.addChild(this._tilesSprite);
};

Spriteset_MapTS.prototype.updateTiles = function() {
    if (this._tiles !== $gameMap.tiles()) {
        this.loadTiles();
    }
    var screen = $gameScreen;
    var scale = screen.zoomScale();
    this._tilesSprite.x = scale;
    this._tilesSprite.y = scale;
    this._tilesSprite.x = Math.round($gameMap.adjustX(0) * 48);
    this._tilesSprite.y = Math.round($gameMap.adjustY(0) * 48);
    this._tilesSprite.x += Math.round(screen.shake());
};

Spriteset_MapTS.prototype.loadTiles = function() {
    this._tiles = $gameMap.tiles();
    var width = $gameMap.width();
    var height = $gameMap.height();
    this._tilesSprite.bitmap.clearRect(0, 0, width * 48, height * 48);
    this._tilesSprite.color = $gameMap.color();
    this._tiles.forEach(function(tile) {
        var x = $gameMap.positionTileX(tile) * 48;
        var y = $gameMap.positionTileY(tile) * 48;
        var color = this._tilesSprite.color;
        this._tilesSprite.bitmap.fillRect(x + 2, y + 2, 44, 44, color);
    }, this);
};

Spriteset_MapTS.prototype.createCharacters = function() {
    this._characterSprites = [];
    $gameMap.events().forEach(function(event) {
        var sprite = null;
        if (event.isActorTS() || event.isEnemyTS()) {
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
        if (event.isActorTS()) {
            this._actorSprites.push(sprite);
        }
    }, this);
};

Spriteset_MapTS.prototype.createEnemies = function() {
    this._enemySprites = [];
    this._characterSprites.forEach(function(sprite) {
        var event = sprite.character();
        if (event.isEnemyTS()) {
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
    if (this._phaseSprite.isPlaying()) {
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

Spriteset_MapTS.prototype.isEffecting = function() {
    return false;  // ?
};

Spriteset_MapTS.prototype.createPhase = function() {
    this._phaseSprite = new Sprite_PhaseTS();
    this.addChild(this._phaseSprite);
};

Spriteset_MapTS.prototype.startPhase = function(phase) {
    //if (...)
    this._phaseSprite.setup(phase);
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
    this.setBattler(character.battlerTS());
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

Sprite_BattlerTS.prototype.setBattler = function(battlerTS) {
    this._battlerTS = battlerTS;
    this._battler = battlerTS.battler();
};

Sprite_BattlerTS.prototype.update = function() {
    Sprite_Character.prototype.update.call(this);
    this.updateDamagePopup();
    this.updateColor();
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

Sprite_BattlerTS.prototype.updateColor = function() {
    if (this._battlerTS.canPlay()) {
        this.setColorTone([0, 0, 0, 0]);
    } else {
        this.setColorTone([0, 0, 0, 255]);
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

Sprite_HpGaugeTS.prototype.drawBattlerState = function() {
    var width = 40;
    var color1 = this.hpGaugeColor1();
    var color2 = this.hpGaugeColor2();
    this.drawIcon(0, 0, width, this._battler.hpRate(), color1, color2)
};

//-----------------------------------------------------------------------------
// Sprite_PhaseTS
//
// The sprite for displaying the current phase.

function Sprite_PhaseTS() {
    this.initialize.apply(this, arguments);
};

Sprite_PhaseTS.prototype = Object.create(Sprite_Base.prototype);
Sprite_PhaseTS.prototype.constructor = Sprite_PhaseTS;

Sprite_PhaseTS.prototype.initialize = function() {
    Sprite_Base.prototype.initialize.call(this);
    this.bitmap = new Bitmap(Graphics.width, Graphics.height);
    this._delay = 0;
    this._duration = 0;
    this.z = 8;
    this.opacity = 0;
};


Sprite_PhaseTS.prototype.maxDuration = function() {
    return TacticsSystem.durationPhaseSprite || 120;
};

Sprite_PhaseTS.prototype.setupDuration = function(duration) {
    this._duration = this.maxDuration();
};

Sprite_PhaseTS.prototype.update = function(battler) {
    Sprite_Base.prototype.update.call(this);
    this.updateMain();
    this.updatePosition();
    this.updateOpacity();
};

Sprite_PhaseTS.prototype.isPlaying = function() {
    return this._duration > 0;
};

Sprite_PhaseTS.prototype.updateMain = function() {
    if (this.isPlaying()) {
        this._duration--;
        this.updatePosition();
    } else {
        this.hide();
    }
};

Sprite_PhaseTS.prototype.updatePosition = function() {
    this.x = Graphics.width / 2 - this.bitmap.width / 2;
    this.y = Graphics.height / 2 - this.bitmap.height / 2 - 120;
};

Sprite_PhaseTS.prototype.updateBitmap = function() {
};

Sprite_PhaseTS.prototype.setup = function(phase) {
    if (TacticsSystem.showPhaseSprite) {
        this.drawPhase(phase);
    }
    this.setupDuration();
};

Sprite_PhaseTS.prototype.updateOpacity = function() {
    if (this._duration < 30) {
        this.opacity = 255 * this._duration / 30;
    }
    if (this._duration > this.maxDuration() - 60) {
        this.opacity = 255 * (this.maxDuration() - this._duration ) / 60;
    }
};

Sprite_PhaseTS.prototype.drawPhase = function(phase) {
    var x = 20;
    var y = Graphics.height / 2;
    var maxWidth = Graphics.width - x * 2;
    var text = phase;
    this.bitmap.clear();
    this.bitmap.outlineColor = 'black';
    this.bitmap.outlineWidth = 8;
    this.bitmap.fontSize = 72;
    this.bitmap.drawText(text, x, y, maxWidth, 48, 'center');
    this.opacity = 255;
    this.show();
};

//-----------------------------------------------------------------------------
// Scene_Map
//
// The scene class of the map screen.

var Scene_Map_stopTS = Scene_Map.prototype.stop;
Scene_Map.prototype.stop = function() {
    Scene_Map_stopTS.call(this);
    if (SceneManager.isNextScene(Scene_BattleTS)) {
        this.launchBattle();
    }
};

var Scene_Map_updateTS = Scene_Map.prototype.update;
Scene_Map.prototype.update = function() {
    Scene_Map_updateTS.call(this);
    if (SceneManager.isNextScene(Scene_BattleTS)) {
        this.updateEncounterEffect();
    }
};

//-----------------------------------------------------------------------------
// DataManager
//
// The static class that manages the database and game objects.

var DataManager_createGameObjectsTS = DataManager.createGameObjects;
DataManager.createGameObjects = function() {
    $gameSelectorTS =     new Game_SelectorTS();
    $gameTroopTS =        new Game_TroopTS();
    $gamePartyTS =        new Game_PartyTS();
    DataManager_createGameObjectsTS.call(this);
};

//-----------------------------------------------------------------------------
// Game_Temp
//
// The game object class for temporary data that is not included in save data.

var Game_Temp_initializeTS = Game_Temp.prototype.initialize;
Game_Temp.prototype.initialize = function() {
    Game_Temp_initializeTS.call(this);
    this._positionX = null;
    this._positionY = null;
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

//-----------------------------------------------------------------------------
// Game_Action
//
// The game object class for a battle action.

Game_Action.prototype.battleOpponentsUnit = function(subject) {
    var units = subject.opponentsUnit().aliveMembers();
    var battlers = this.searchBattlers(subject, units);
    return battlers;
};

Game_Action.prototype.battleFriendsUnit = function(subject) {
    var friends = subject.friendsUnit().aliveMembers();
    var init = [subject.battler()]; // first for the user keeps the same index !
    var battlers = init.concat(this.searchBattlers(subject, friends));
    return battlers;
};

Game_Action.prototype.searchBattlers = function(subject, units) {
    var battlers = [];
    this.updateRange(subject);
    for (var i = 0; i < this._range.length; i++) {
        var redCell = this._range[i];
        var x = redCell[0];
        var y = redCell[1];
        for (var j = 0; j < units.length; j++) {
            if (units[j].pos(x, y) && units[j] !== subject) {
                battlers.push(units[j].battler());
            }
        }
    }
    return battlers;
};

Game_Action.prototype.updateRange = function(subject) {
    var data = null;
    if (this.isAttack() && subject.isActor()) {
        data = this.getWeaponRange(subject.battler());
    }
    if (!data) {
        data = this.getSkillRange();
    }
    var x = subject.x;
    var y = subject.y;
    this._range = eval('[' + data + ']');
};

Game_Action.prototype.getWeaponRange = function(actor) {
    var data = null;
    var weapon = actor.weapons()[0];
    if (weapon) {
        data = weapon.meta['range'];
    }
    return data;
};

Game_Action.prototype.getSkillRange = function(subject) {
    var data = this.item().meta['range'];
    if (typeof data === 'undefined') {
        data = TacticsSystem.actionRange;
    }
    if (this.isForFriend()) {
        data = '[x, y],' + data;
    }
    if (this.isForUser()) {
        data = '[x, y]';
    }
    return data;
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

//-----------------------------------------------------------------------------
// Game_BattlerBase
//
// The superclass of Game_Battler. It mainly contains parameters calculation.

Game_BattlerBase.prototype.isItemRangeValid = function(item) {
    var friendsUnitTS = this.friendsUnitTS();
    var battler = friendsUnitTS.getBattlerTS(this);
    return battler.isItemRangeValid(item);
};

Game_BattlerBase.prototype.isOccasionOk = function(item) {
    if ($gameParty.inBattle() || $gameParty.inBattleTS()) {
        return item.occasion === 0 || item.occasion === 1;
    } else {
        return item.occasion === 0 || item.occasion === 2;
    }
};

var Game_BattlerBase_canUseTS = Game_BattlerBase.prototype.canUse;
Game_BattlerBase.prototype.canUse = function(item) {
    if ($gameParty.inBattleTS() && !$gameParty.inBattle()) {
        if (!this.isItemRangeValid(item)) {
            return false;
        }
    }
    return Game_BattlerBase_canUseTS.call(this, item);
};

//-----------------------------------------------------------------------------
// Game_Actor
//
// The game object class for an actor.

Game_Actor.prototype.friendsUnitTS = function() {
    return $gamePartyTS;
};

//-----------------------------------------------------------------------------
// Game_Enemy
//
// The game object class for an enemy.

Game_Enemy.prototype.friendsUnitTS = function() {
    return $gameTroopTS;
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
    this._actors = actorsId;
};

Game_Party.prototype.maxBattleMembers = function() {
    return this._maxBattleMembers;
};

Game_Party.prototype.members = function() {
    return this.inBattle() || this.inBattleTS() ? this.battleMembers() : this.allMembers();
};

Game_Party.prototype.inBattleTS = function() {
    return $gamePartyTS.inBattleTS();
};

//-----------------------------------------------------------------------------
// Game_Troop
//
// The game object class for a troop and the battle-related data.

Game_Troop.prototype.setupTS = function(enemies) {
    this._enemies = enemies;
    //this.makeUniqueNames();
};

Game_Troop.prototype.increaseTurn = function() {
    this._turnCount++;
};

//-----------------------------------------------------------------------------
// Game_Map
//
// The game object class for a map. It contains scrolling and passage
// determination functions.

var Game_Map_intializeTS = Game_Map.prototype.initialize;
Game_Map.prototype.initialize = function() {
    Game_Map_intializeTS.call(this);
    this._tiles = [];
    this._color = '';
};

Game_Map.prototype.addTile = function(tile) {
    return this._tiles.push(tile);
};

Game_Map.prototype.positionTileX = function(tile) {
    return Math.floor(tile / $dataMap.width);
};

Game_Map.prototype.positionTileY = function(tile) {
    return tile % $dataMap.width;
};

Game_Map.prototype.isTileAdded = function(tile) {
    return this._tiles.contains(tile);
};

Game_Map.prototype.tile = function(x, y) {
    return x * $dataMap.width + y;
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

var Game_Event_initializeTS = Game_Event.prototype.initialize;
Game_Event.prototype.initialize = function(mapId, eventId) {
    Game_Event_initializeTS.call(this, mapId, eventId);
    this.setName(this.event().name);
    this.setMeta(this.event().meta);
};

var Game_Event_isCollidedWithEventsTS = Game_Event.prototype.isCollidedWithEvents;
Game_Event.prototype.isCollidedWithEvents = function(x, y) {
    // for an actor to pass through an actor
    if (this.isActorTS()) {
        var events = $gameMap.eventsXyNt(x, y);
        return events.some(function(event) {
            return event.isNormalPriority() && !event.isActorTS();
        });
    } else {
        return Game_Event_isCollidedWithEventsTS.call(this, x, y);
    }
};

Game_Event.prototype.setName = function(name) {
    this._name = name;
};

Game_Event.prototype.name = function() {
    return this._name;
};

Game_Event.prototype.isErased = function() {
    return this._erased;
};

Game_Event.prototype.setMeta = function(meta) {
    this._meta = meta;
};

Game_Event.prototype.meta = function() {
    return this._meta;
};

Game_Event.prototype.isActorTS = function() {
    return parseInt(this.event().meta['actor']) > 0;
};

Game_Event.prototype.isEnemyTS = function() {
    return parseInt(this.event().meta['enemy']) > 0;
};

Game_Event.prototype.battlerTS = function() {
    return this.isActorTS() ? $gamePartyTS.getBattlerTS(this) : $gameTroopTS.getBattlerTS(this);
};

Game_Event.prototype.tilesRange = function(distance) {
    var queue = [];
    var level = [];
    var startTile = $gameMap.tile(this.x, this.y)
    
    $gameMap.eraseTiles();
    queue.push(startTile);
    level[startTile] = 0;
    $gameMap.addTile(startTile);

    while (queue.length && level[queue[0]] < distance) {
        var start = queue.shift();
        var x = $gameMap.positionTileX(start);
        var y = $gameMap.positionTileY(start);
        for (var d = 8; d >= 2; d -= 2) {
            if (this.canPass(x, y, d)) {
                var x2 = $gameMap.roundXWithDirection(x, d);
                var y2 = $gameMap.roundYWithDirection(y, d);
                var tile = $gameMap.tile(x2, y2);
                if (!$gameMap.isTileAdded(tile)) {
                    queue.push(tile);
                    level[tile] = level[start] + 1;
                    $gameMap.addTile(tile);
                }
            }
        }
    }
};

//-----------------------------------------------------------------------------
// Game_Interpreter
//
// The interpreter for running event commands.

var Game_Interpreter_updateWaitModeTS = Game_Interpreter.prototype.updateWaitMode;
Game_Interpreter.prototype.updateWaitMode = function() {
    if (this._waitMode === 'battleTS') {
        var waiting = !BattleManagerTS.isBattleEnd();
        if (!waiting) {
            this._waitMode = '';
        }
        return waiting;
    } else {
        return Game_Interpreter_updateWaitModeTS.call(this);
    }
};

//-----------------------------------------------------------------------------
// Window_BattleLog
//
// The window for displaying battle progress. No frame is displayed, but it is
// handled as a window for convenience.

var Window_BattleLog_showNormalAnimationTS = Window_BattleLog.prototype.showNormalAnimation;
Window_BattleLog.prototype.showNormalAnimation = function(targets, animationId, mirror) {
    if ($gameParty.inBattleTS() && !$gameParty.inBattle()) { // to do
        var animation = $dataAnimations[animationId];
        if (animation) {
            targets.forEach(function(target) {
                var friendsUnitTS = target.friendsUnitTS();
                var targetTS = friendsUnitTS.getBattlerTS(target);
                targetTS.event().requestAnimation(animationId);
            });
        }
    } else {
        Window_BattleLog_showNormalAnimationTS.call(this, targets, animationId, mirror);
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
    var Game_Interpreter_pluginCommandTS = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        Game_Interpreter_pluginCommandTS.call(this, command, args);
        if (command === 'startBattleTS') {
            BattleManagerTS.setup();
            this.setWaitMode('battleTS');
            SceneManager.push(Scene_BattleTS);
        }
    };
})();