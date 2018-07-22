//=============================================================================
// TacticsSystem.js v0.2.1 [Ignis]
//=============================================================================

/*:
 * @plugindesc A Tactical Battle System like Final Fantasy Tactics or Fire Emblem series.
 * @author El Moussaoui Bilal (embxii_)
 *
 * @param cursor speed
 * @desc The cursor speed. 1: Slow, 2: Normal, 3: Fast
 * @default 2
 *
 * @param grid opacity
 * @desc The grid opacity of the battle scene.
 * @default 40
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
 * @desc The color to display the move range..
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
 * @help
 *
 * For more information, please consult :
 *   - https://forums.rpgmakerweb.com/index.php?threads/tactics-system-ignis.97023/
 * Plugin Command:
 *   StartBattleTS          # Start battle scene
 */

var TacticsSystem = TacticsSystem || {};
TacticsSystem.Parameters = PluginManager.parameters('TacticsSystem');

TacticsSystem.cursorSpeed =        Number(TacticsSystem.Parameters['cursor speed']);
TacticsSystem.gridOpacity =        Number(TacticsSystem.Parameters['grid opacity']);
TacticsSystem.movePoints =         Number(TacticsSystem.Parameters['move points']);
TacticsSystem.actionRange =        String(TacticsSystem.Parameters['action range']);
TacticsSystem.moveScopeColor =     String(TacticsSystem.Parameters['move scope color']);
TacticsSystem.allyScopeColor =     String(TacticsSystem.Parameters['ally scope color']);
TacticsSystem.enemyScopeColor =    String(TacticsSystem.Parameters['enemy scope color']);
TacticsSystem.animationIdOfDeath = String(TacticsSystem.Parameters['animationId of death']);

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
    $gamePlayer.setThrough(true);
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
    //this.createScrollTextWindow();
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
    var width = Graphics.boxWidth - 192;
    var height = this._actorCommandWindow.fittingHeight(4);
    this._skillWindow = new Window_BattleSkill(0, this._actorCommandWindow.y, width, height);
    this._skillWindow.x = Graphics.boxWidth - this._skillWindow.width;
    this._skillWindow.setHelpWindow(this._helpWindow);
    this._skillWindow.setHandler('ok',     this.onSkillOk.bind(this));
    this._skillWindow.setHandler('cancel', this.onSkillCancel.bind(this));
    this.addWindow(this._skillWindow);
};

Scene_BattleTS.prototype.createItemWindow = function() {
    var width = Graphics.boxWidth - 192;
    var height = this._actorCommandWindow.fittingHeight(4);
    this._itemWindow = new Window_BattleItem(0, this._actorCommandWindow.y, width, height);
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
    BattleManagerTS.startBattle();
    $gameSelectorTS.setPosition($gamePlayer.x, $gamePlayer.y);
};

Scene_BattleTS.prototype.update = function() {
    $gameSelectorTS.update(BattleManagerTS.active());
    this.updateDestination();
    var active = this.isActive();
    $gameMap.update(active);
    if (active && !this.isBusy()) {
        this.updateBattleProcess();
        if ($gameSelectorTS.hadMoved()) {
            this.updateStatusWindow();
        }
    }
    $gameTimer.update(active);
    $gameScreen.update();
    Scene_Base.prototype.update.call(this);
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
    } else {
        this._statusWindow.close();
    }
};

Scene_BattleTS.prototype.canShowStatusWindow = function(select) {
    return select && select.isAlive();
};

Scene_BattleTS.prototype.isAnyInputWindowActive = function() {
    return (this._actorCommandWindow.active ||
            this._skillWindow.active ||
            this._itemWindow.active ||
            this._actorWindow.active ||
            this._enemyWindow.active ||
            this._eventWindow.active);
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

Scene_BattleTS.prototype.startActorCommandSelection = function() {
    this._actorCommandWindow.setup(BattleManagerTS.subject());
};

Scene_BattleTS.prototype.commandAttack = function() {
    var action = BattleManagerTS.inputtingAction();
    action.setAttack();
    BattleManagerTS.setupLocalBattle(action);
    BattleManagerTS.updateRedCells(action);
    this.selectEnemySelection();
};

Scene_BattleTS.prototype.commandSkill = function() {
    this._skillWindow.setActor(BattleManagerTS.subject());
    this._skillWindow.setStypeId(this._actorCommandWindow.currentExt());
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
    BattleManagerTS.processAction();
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
    BattleManagerTS.processAction();
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
    BattleManagerTS.setupLocalBattle(action);
    BattleManagerTS.updateRedCells(action);
    this.onSelectAction();
};

Scene_BattleTS.prototype.onSkillCancel = function() {
    this._skillWindow.hide();
    this._actorCommandWindow.activate();
};

Scene_BattleTS.prototype.onItemOk = function() {
    var item = this._itemWindow.item();
    var action = BattleManagerTS.inputtingAction();
    action.setItem(item.id);
    $gameParty.setLastItem(item);
    BattleManagerTS.setupLocalBattle(action);
    BattleManagerTS.updateRedCells(action);
    this.onSelectAction();
};

Scene_BattleTS.prototype.onItemCancel = function() {
    this._itemWindow.hide();
    this._actorCommandWindow.activate();
};

Scene_BattleTS.prototype.commandSeize = function() {
    BattleManagerTS.win();
    this._actorCommandWindow.close();
};

Scene_BattleTS.prototype.onSelectAction = function() {
    var action = BattleManagerTS.inputtingAction();
    this._skillWindow.hide();
    this._itemWindow.hide();
    if (!action.needsSelection()) {
        this._actorCommandWindow.close();
        BattleManagerTS.processAction();
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
    $gamePlayer.setThrough(false);
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
    $gameTroop.clear();
    $gameScreen.onBattleStart();
    $gamePartyTS.onBattleStart();
    $gameTroop.onBattleStart();
    this.createGameObjects();
};

BattleManagerTS.initMembers = function() {
    this._phase = 'init';
    this._subPhase = '';
    this._turn = 0;
    this._logWindow = null;
    this._spriteset = null;
    this._subject = null;
    this._blueCells = null;
    this._canLose = false;
    this._range = null;
    this._targets = [];
    this._rewards = {};
    this._eventCallback = null;
    this._troopId = 0;
    this._isBattleEnd = false;
};

BattleManagerTS.setLogWindow = function(logWindow) {
    this._logWindow = logWindow;
};

BattleManagerTS.setSpriteset = function(spriteset) {
    this._spriteset = spriteset;
};

BattleManagerTS.subjectTS = function() {
    return this._subject;
};

BattleManagerTS.subject = function() {
    return this._subject.battler();
};

BattleManagerTS.startBattle = function() {
    this._spriteset.createGrid();
    this._phase = 'preparation';
};

BattleManagerTS.createGameObjects = function() {
    var actors = [];
    var enemies = [];
    for (var i = 1; i < $dataMap.events.length; i++) {
        var event = $dataMap.events[i];
        if (event != null) {
            if (parseInt(event.meta['actor']) > 0) {
                this.createGameActors(actors, event, i);
            } else if (parseInt(event.meta['enemy']) > 0) {
                this.createGameEnemies(enemies, event, i);
            }
        }
    }
    this.setupGameObjectsTS(actors, enemies);
};

BattleManagerTS.setupGameObjectsTS = function(actors, enemies) {
    $gamePartyTS.setup(actors);
    $gameParty.setupTS($gamePartyTS.battlerMembers());
    $gameTroopTS.setup(enemies);
    $gameTroop.setupTS($gameTroopTS.battleMembers());
    $gameSelectorTS.setup(actors.concat(enemies));
};

BattleManagerTS.createGameActors = function(actors, event, i) {
    var actorId = parseInt(event.meta['actor']);
    actors.push(new Game_ActorTS(event.x, event.y, actorId, i));
};

BattleManagerTS.createGameEnemies = function(enemies, event, i) {
    var enemyId = parseInt(event.meta['enemy']);
    enemies.push(new Game_EnemyTS(event.x, event.y, enemyId, i));
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
        case 'playerExplore':
            this.updateExplore();
            break;
        case 'playerSelect':
            this.updateSelect();
            break;
        case 'enemyPhase':
            this.updateEnemyPhase();
            break;
        case 'move':
            this.updateMove();
            break;
        case 'action':
            this.updateAction();
            break;
        case 'battleEnd':
            this.updateBattleEnd();
            break;
        case 'event':
            this.endEvent();
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
    case 'playerExplore':
    case 'enemyPhase':
    case 'event':
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
    this._logWindow.startTurn();
    if (this._turn !== 1) {
        $gameSelectorTS.restorePosition();
    }
    this.startPlayerPhase();
};

BattleManagerTS.startPlayerPhase = function() {
    this._subject = null;
    $gameTroopTS.updateBlueCells();
    $gamePartyTS.updateBlueCells();
    this.updateBlueCells();
    if (this.isPlayerPhase()) {
        this._phase = 'playerExplore';
    } else {
        this._spriteset.removeBlueCells();
        this.endPlayerPhase();
    }
};

BattleManagerTS.isPlayerPhase = function() {
    return $gamePartyTS.isPhase();
};

BattleManagerTS.updateExplore = function() {
    this.updateBlueCells();
    if (this.canSelectActor($gameSelectorTS.select())) {
        SoundManager.playOk();
        this._subject = $gameSelectorTS.select();
        this._blueCells = this._subject.blueCells();
        $gameParty.setupTS([this._subject.battler()]);
        this._phase = 'playerSelect';
    }
};

BattleManagerTS.updateSelect = function() {
    if (this.isOnBlueCells(this._blueCells)) {
        if (this.canExecuteMove($gameSelectorTS.select())) {
            SoundManager.playOk();
            this._spriteset.removeBlueCells();
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
        if (this.subject().isActor()) {
            this._phase = 'input';
        } else {
            this.setupAction();
        }
    }
};

BattleManagerTS.isInputting = function() {
    return this._phase === 'input';
};

BattleManagerTS.inputtingAction = function() {
    return this.subject().inputtingAction();
};

BattleManagerTS.endPlayerPhase = function() {
    $gameSelectorTS.savePosition();
    $gamePartyTS.onTurnEnd();
    this.startEnemyPhase();
};

BattleManagerTS.startEnemyPhase = function() {
    this._subject = null;
    if (this.isEnemyPhase()) {
        this._phase = 'enemyPhase';
    } else {
        this.endEnemyPhase();
    }
};

BattleManagerTS.isEnemyPhase = function() {
    return $gameTroopTS.isPhase();
};

BattleManagerTS.updateEnemyPhase = function() {
    this._subject = this.getNextEnemy();
    $gameTroop.setupTS([this.subject()]);
    this._subject.updateBlueCells();
    var pos = this._subject.makeMove();
    var x = pos[0];
    var y = pos[1];
    if (x != this._subject.x || y != this._subject.y) {
        $gameSelectorTS.performTransfer(pos[0], pos[1]);
        this._phase = 'move';
    } else {
        this.setupAction();
    }
};

BattleManagerTS.setupAction = function() {
    this.subject().makeActions();
    var action = this.subject().currentAction();
    if (action && action.isValid()) {
        this.setupLocalBattle(action);
    }
    this.processAction();
};

BattleManagerTS.getNextEnemy = function() {
    return $gameTroopTS.canPlayMembers()[0];
};

BattleManagerTS.endEnemyPhase = function() {
    $gameTroopTS.onTurnEnd();
    this.endTurn();
};

BattleManagerTS.processAction = function() {
    var subject = this.subject();
    var action = subject.currentAction();
    if (action && action.isValid()) {
        action.prepare();
        this.startAction();
        subject.removeCurrentAction();
    } else {
        subject.onAllActionsEnd();
        this._logWindow.displayAutoAffectedStatus(subject);
        this._logWindow.displayCurrentState(subject);
        this._logWindow.displayRegeneration(subject);
        this.endBattlePhase();
    }
};

BattleManagerTS.refreshState = function(battler) {
    var friendsUnitTS = battler.friendsUnitTS();
    battler = friendsUnitTS.getBattlerTS(battler);
    battler.refreshState();
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
        this.endAction();
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
    this.refreshState(target);
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

BattleManagerTS.endAction = function() {
    this._spriteset.removeRedCells();
    this._logWindow.endAction(this.subject());
    this.endBattlePhase();
};

BattleManagerTS.endBattlePhase = function() {
    this._subject.endAction();
    if (this._subject.isActor()) {
        this.updateLastTarget();
        this.startPlayerPhase();
    } else {
        this.startEnemyPhase();
    }
};

BattleManagerTS.updateLastTarget = function() {
    $gameSelectorTS.updateSelect();
    var battler = $gameSelectorTS.select()
    if (battler != null) {
        battler.createBlueCells();
        this.updateBlueCells();
    }
};

BattleManagerTS.startEvent = function() {
    this._phase = 'event';
};


BattleManagerTS.endEvent = function() {
    this.endAction();
};

BattleManagerTS.endTurn = function() {
    this.startTurn();
};

BattleManagerTS.updateBlueCells = function() {
    var subject = $gameSelectorTS.select();
    if ($gameSelectorTS.hadMoved()) {
        this._spriteset.removeBlueCells();
        if (this.canShowBlueCells(subject)) {
            this._spriteset.createBlueCells(subject.blueCells());
        }
    }
};

BattleManagerTS.setupLocalBattle = function(action) {
    var gameFriends = action.friendsUnit();
    gameFriends.setupTS(action.battleFriendsUnit(this._subject));
    var gameOpponents = action.opponentsUnit();
    gameOpponents.setupTS(action.battleOpponentsUnit(this._subject));
};

BattleManagerTS.updateRedCells = function(action) {
    this._spriteset.removeRedCells();
    this._spriteset.createRedCells(action);
};

BattleManagerTS.processCancel = function() {
    this._spriteset.removeRedCells();
    $gameSelectorTS.performTransfer(this._subject.x, this._subject.y);
};


BattleManagerTS.performTransfer = function(battler) {
    $gameSelectorTS.performTransfer(battler.x, battler.y);
};

BattleManagerTS.selectPreviousCommand = function() {
    SoundManager.playCancel();
    this._spriteset.removeBlueCells();
    this._phase = 'playerExplore';
    this._subject.restorePosition();
    $gameSelectorTS.performTransfer($gameSelectorTS.x, $gameSelectorTS.y);
    $gameSelectorTS.updateSelect();
    this.updateBlueCells();
};

BattleManagerTS.checkBattleEnd = function() {
    if (this._phase) {
        if ($gamePartyTS.isAllDead()) {
            this.processDefeat();
            return true;
        } else if ($gameTroopTS.isAllDead()) {
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
    if (this._canLose) {
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

BattleManagerTS.isOnBlueCells = function(blueCells) {
    for (var i = 0; i < blueCells.length; i++) {
        var blueCell = blueCells[i];
        var x = blueCell[0];
        var y = blueCell[1];
        if ($gameSelectorTS.pos(x, y)) {
            return true;
        }
    }
    return false;
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
    this._direction = 0;
    this._oldX = 0;
    this._oldY = 0;
    this._speed = TacticsSystem.cursorSpeed + 3 || 5;
    this._wait = 0;
    this._select = null;
    this._hadMoved = false;
    this._data = [];
};

Game_SelectorTS.prototype.setup = function(data) {
    this._data = data;
};

Game_SelectorTS.prototype.pos = function(x, y) {
    return this.x === x && this.y === y;
};

Game_SelectorTS.prototype.setPosition = function(x, y) {
    this._x = x;
    this._y = y;
};

Game_SelectorTS.prototype.isWaiting = function() {
    return this._wait >= 0;
};

Game_SelectorTS.prototype.select = function() {
    return this._select;
};

Game_SelectorTS.prototype.hadMoved= function(x, y) {
    return this._hadMoved;
};

Game_SelectorTS.prototype.getInputDirection = function() {
    return Input.dir4;
};

Game_SelectorTS.prototype.update = function(active) {
    if (active) {
        this.moveByInput();
        this.moveByDestination();
        this.updateScroll();
        this.updateWait();
    }
};

Game_SelectorTS.prototype.updateWait = function() {
    if (this.isWaiting()) {
        this._wait -= Math.pow(2, this._speed) / 256;
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
    if (this.y < y) {
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
    this._hadMoved = true;
    this._wait = 1;
    this._direction = direction;
    this._x = x;
    this._y = y;
};

Game_SelectorTS.prototype.performTransfer = function(x, y) {
    this._x = x;
    this._y = y;
    this._hadMoved = true;
    $gameMap.setDisplayPos(x - this.centerX(), y - this.centerY());
    this.updateSelect();
};

Game_SelectorTS.prototype.isValid = function(x, y) {
    return x >= 0 && y >= 0 && x < $gameMap.width() && y < $gameMap.height();
};

Game_SelectorTS.prototype.updateSelect = function() {
    this._select = null;
    this._data.forEach(function(data) {
        if (data && data.isAlive() && this.isOnData(data)) {
            this._select = data;
        }
    }, this);
};

Game_SelectorTS.prototype.isOnData = function(data) {
    return this.pos(data.x, data.y);
};

Game_SelectorTS.prototype.updateScroll = function() {
    if (this._direction === 2 && this.y > this.centerY()) {
        $gameMap.startScroll(2, 1, this._speed);
    }
    if (this._direction === 4 && this.x < $gameMap.width() - 1 - this.centerX()) {
        $gameMap.startScroll(4, 1, this._speed);
    }
    if (this._direction === 6 && this.x > this.centerX()) {
        $gameMap.startScroll(6, 1, this._speed);
    }
    if (this._direction === 8 && this.y < $gameMap.height() - 1 - this.centerY()) {
        $gameMap.startScroll(8, 1, this._speed);
    }
    this._direction = 0;
    $gameMap.updateScroll();
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
    this._oldX = this.x;
    this._oldY = this.y;
};

Game_SelectorTS.prototype.restorePosition = function() {
    this.performTransfer(this._oldX, this._oldY);
};

Game_SelectorTS.prototype.scrolledX = function() {
    return $gameMap.adjustX(this.x);
};

Game_SelectorTS.prototype.scrolledY = function() {
    return $gameMap.adjustY(this.y);
};

Game_SelectorTS.prototype.screenX = function() {
    var tw = $gameMap.tileWidth();
    return Math.round(this.scrolledX() * tw);
};

Game_SelectorTS.prototype.screenY = function() {
    var th = $gameMap.tileHeight();
    return Math.round(this.scrolledY() * th);
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

//-----------------------------------------------------------------------------
// Game_EventBattlerTS
//
// The superclass of Game_ActorTS and Game_EnemyTS. It contains methods for
// event and actor.

function Game_EventBattlerTS() {
    this.initialize.apply(this, arguments);
}

Game_EventBattlerTS.prototype.constructor = Game_EventBattlerTS;

Object.defineProperties(Game_EventBattlerTS.prototype, {
    x: { get: function() { return this._x; }, configurable: true },
    y: { get: function() { return this._y; }, configurable: true }
});

Game_EventBattlerTS.prototype.initialize = function(x, y, eventId) {
    this.initMembers()
    this._x = x;
    this._y = y;
    this._oldX = x;
    this._oldY = y;
    this._event = $gameMap.event(eventId);
};

Game_EventBattlerTS.prototype.initMembers = function() {
    this._x = 0;
    this._y = 0;
    this._event = null;
    this._move = 0;
    this._blueCells = [];
    this._movePath = [];
    this._hasPlayed = false;
};

Game_EventBattlerTS.prototype.pos = function(x, y) {
    return this.x === x && this.y === y;
};

Game_EventBattlerTS.prototype.event = function(x, y) {
    return this._event;
};

Game_EventBattlerTS.prototype.battler = function(x, y) {
    return null;
};

Game_EventBattlerTS.prototype.setMove = function(object) {
    this._move = object.meta['move'] || TacticsSystem.movePoints || 5;
};

Game_EventBattlerTS.prototype.canPlay = function() {
    return !this._hasPlayed;
};

Game_EventBattlerTS.prototype.isMoving = function() {
    return this._event.isMoving();
};

Game_EventBattlerTS.prototype.onTurnStart = function() {
    this._hasPlayed = false;
    this.createBlueCells();
};

Game_EventBattlerTS.prototype.onTurnEnd = function() {
    this.battler().onTurnEnd();
};

Game_EventBattlerTS.prototype.endAction = function() {
    this.defaultDirection();
    this._hasPlayed = true;
    this._oldX = this._x;
    this._oldY = this._y;
};

Game_EventBattlerTS.prototype.defaultDirection = function() {
    this._event.setDirection(2);
};

Game_EventBattlerTS.prototype.blueCells = function() {
    return this._blueCells;
};

Game_EventBattlerTS.prototype.updateBlueCells = function() {
    this.createBlueCells();
};

Game_EventBattlerTS.prototype.createBlueCells = function() {
    var start = [[this.x, this.y]]
    this._blueCells = [[this.x, this.y]];
    for (var i = 0; i < this._move; i++) {
        var temp = [];
        for (var j = 0; j < start.length; j++) {
            var nextCells = this.nextCells(start[j]);
            this._blueCells = this._blueCells.concat(nextCells);
            temp = temp.concat(nextCells);
        }
        start = JsonEx.makeDeepCopy(temp);
    }
};

Game_EventBattlerTS.prototype.nextCells = function (start) {
    var x = start[0];
    var y = start[1];
    var nextCells = [];
    for (var d = 8; d >= 2; d -= 2) {
        if (this._event.canPass(x, y, d)) {
            var x2 = $gameMap.roundXWithDirection(x, d);
            var y2 = $gameMap.roundYWithDirection(y, d);
            if (!this.isMoveValid(x2, y2)) {
                nextCells.push([x2, y2]);
            }
        }
    }
    return nextCells;
};

Game_EventBattlerTS.prototype.isMoveValid = function (x, y) {
    for (var i = 0; i < this._blueCells.length; i++) {
        var x2 = this._blueCells[i][0];
        var y2 = this._blueCells[i][1];
        if (x === x2 && y === y2) {
            return true;
        }
    }
    return false;
};

Game_EventBattlerTS.prototype.moveStraightTo = function(x, y) {
    var direction = this._event.findDirectionTo(x, y);
    this._x = $gameMap.roundXWithDirection(this.x, direction);
    this._y = $gameMap.roundYWithDirection(this.y, direction);
    this._event.moveStraight(direction);
};

Game_EventBattlerTS.prototype.refreshState = function() {
    if (!this.isAlive()) {
        var animationIdOfDeath = TacticsSystem.animationIdOfDeath || -1;
        this._event.requestAnimation(animationIdOfDeath);
        this._event.erase();
    }
};

Game_EventBattlerTS.prototype.isActor = function() {
    return this.battler().isActor();
};

Game_EventBattlerTS.prototype.isAlive = function(item) {
    return this.battler().isAlive();
};

Game_EventBattlerTS.prototype.opponentsUnit = function() {
    return null;
};

Game_EventBattlerTS.prototype.isItemRangeValid = function(item) {
    if (!item) {
        return false;
    } else if (DataManager.isSkill(item)) {
        return this.meetsSkillRangeConditions(item);
    } else if (DataManager.isItem(item)) {
        return this.meetsItemRangeConditions(item);
    } else {
        return false;
    }
};

Game_EventBattlerTS.prototype.meetsSkillRangeConditions = function(item) {
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

Game_EventBattlerTS.prototype.meetsItemRangeConditions = function(item) {
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

Game_EventBattlerTS.prototype.restorePosition = function() {
    this._event.setPosition(this._oldX, this._oldY);
    this._x = this._oldX;
    this._y = this._oldY;
    this.defaultDirection();
};

//-----------------------------------------------------------------------------
// Game_ActorTS
//
// The game object class for an actor.

function Game_ActorTS() {
    this.initialize.apply(this, arguments);
}

Game_ActorTS.prototype = Object.create(Game_EventBattlerTS.prototype);
Game_ActorTS.prototype.constructor = Game_ActorTS;

Game_ActorTS.prototype.initialize = function(x, y, actorId, eventId) {
    Game_EventBattlerTS.prototype.initialize.call(this, x, y, eventId);
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
    Game_EventBattlerTS.prototype.onTurnStart.call(this);
    // Game_EnemyTS doesn't need make actions on turn start
    this.battler().makeActions();
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

Game_ActorTS.prototype.actions = function() {
    return this._actions;
};

//-----------------------------------------------------------------------------
// Game_EnemyTS
//
// The game object class for an enemy.

function Game_EnemyTS() {
    this.initialize.apply(this, arguments);
}

Game_EnemyTS.prototype = Object.create(Game_EventBattlerTS.prototype);
Game_EnemyTS.prototype.constructor = Game_EnemyTS;

Game_EnemyTS.prototype.initialize = function(x, y, enemyId, eventId) {
    Game_EventBattlerTS.prototype.initialize.call(this, x, y, eventId);
    this._enemy = new Game_Enemy(enemyId, x, y);
    this.setMove($dataEnemies[enemyId]);
    this.setScope($dataEnemies[enemyId]);
};

Game_EnemyTS.prototype.setScope = function(object) {
    this._scope = object.meta['scope'] || this._move;
};

Game_EnemyTS.prototype.scope = function() {
    return this._scope;
};

Game_EnemyTS.prototype.battler = function() {
    return this._enemy;
};

Game_EnemyTS.prototype.enemy = function() {
    return this._enemy.enemy();
};

Game_EnemyTS.prototype.opponentsUnit = function() {
    return $gamePartyTS;
};

Game_EnemyTS.prototype.friendsUnit = function() {
    return $gameTroopTS;
};

Game_EnemyTS.prototype.makeAllMoves = function() {
    var rate = 0;
    var x = this.x;
    var y = this.y;
    var pos = [this.x, this.y];
    for (var i = 0; i < this.blueCells().length; i++) {
        var temp = this.blueCells()[i];
        this._x = temp[0];
        this._y = temp[1];
        var actionList = this.enemy().actions.filter(function(a) {
            return this.battler().isActionValid(a);
        }, this);
        var sum = actionList.reduce(function(r, a) {
            return r + a.rating;
        }, 0);
        if (sum > rate) {
            rate = sum;
            pos = [this.x, this.y];
        }
    }
    this._x = x;
    this._y = y;
    return pos;
};

Game_EnemyTS.prototype.makeMove = function(movesList) {
    return this.makeAllMoves();
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

Game_UnitTS.prototype.aliveMembers = function() {
    return this.members().filter(function(member) {
        return member.isAlive();
    });
};

Game_UnitTS.prototype.deadMembers = function() {
    return this.members().filter(function(member) {
        return member.isDead();
    });
};

Game_UnitTS.prototype.onTurnStart = function() {
    this.members().forEach(function(member) {
        member.onTurnStart();
    });
};

Game_UnitTS.prototype.onTurnEnd = function() {
    this.members().forEach(function(member) {
        member.onTurnEnd();
    });
};

Game_UnitTS.prototype.makeActions = function() {
    this.members().forEach(function(member) {
        member.makeActions();
    });
};

Game_UnitTS.prototype.updateBlueCells = function() {
    this.members().forEach(function(member) {
        member.updateBlueCells();
    });
};

Game_UnitTS.prototype.isAllDead = function() {
    return this.aliveMembers().length === 0;
};

Game_UnitTS.prototype.canPlayMembers = function() {
    return this.aliveMembers().filter(function(member) {
        return member.canPlay();
    });
};

Game_UnitTS.prototype.isPhase = function() {
    return this.canPlayMembers().length > 0;
};

Game_UnitTS.prototype.getBattlerTS = function(battler) {
    for (var i = 0; i < this.members().length; i++) {
        var member = this.members()[i]
        if (member.battler() === battler) {
            return member;
        }
    }
};

Game_UnitTS.prototype.getBattler = function(event) {
    for (var i = 0; i < this.members().length; i++) {
        var member = this.members()[i];
        if (member.event() === event) {
            return member.battler();
        }
    }
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

Game_PartyTS.prototype.inBattleTS = function() {
    return this._inBattleTS;
};

Game_PartyTS.prototype.setup = function(actors) {
    this._actors = actors;
    this._maxBattleMembers = actors.length;
    this.members().forEach(function(member) {
        member.refreshState();
    });
};

Game_PartyTS.prototype.members = function() {
    return this._actors;
};

Game_PartyTS.prototype.battleMembers = function() {
    return $gameParty.members().map(function(member) {
        return this.getBattlerTS(member);
    }, this);
};

Game_PartyTS.prototype.actorIdMembers = function() {
    return this.battlerMembers().map(function(member) {
        return member.actorId();
    });
};

Game_PartyTS.prototype.onBattleStart = function() {
    this._inBattleTS = true;
};

Game_PartyTS.prototype.maxBattleMembers = function() {
    return this._maxBattleMembers;
};

Game_PartyTS.prototype.setBattleMembers= function(number) {
    this._maxBattleMembers = number;
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
    return this._enemies;
};

Game_TroopTS.prototype.battleMembers = function() {
    return $gameTroop.members().map(function(member) {
        return this.getBattlerTS(member);
    }, this);
};

Game_TroopTS.prototype.onBattleStart = function() {
    $gameTroop.onBattleStart();
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
    var y = 0;
    Window_Base.prototype.initialize.call(this, x, y, width, height);
    this.openness = 0;
};

Window_BattleStatusTS.prototype.setup = function(actor) {
    this.refresh();
};

Window_BattleStatusTS.prototype.windowWidth = function() {
    return 240;
};

Window_BattleStatusTS.prototype.windowHeight = function() {
    return this.fittingHeight(this.numVisibleRows());
};

Window_BattleStatusTS.prototype.numVisibleRows = function() {
    return 2;
};

Window_BattleStatusTS.prototype.open = function(actor) {
    this.refresh(actor)
    Window_Base.prototype.open.call(this);
};

Window_BattleStatusTS.prototype.refresh = function(actor) {
    this.contents.clear();
    this.drawItem(actor.battler());
};

Window_BattleStatusTS.prototype.drawItem = function(actor) {
    this.drawGaugeArea(actor);
};

Window_BattleStatusTS.prototype.drawGaugeArea = function(actor) {
    if ($dataSystem.optDisplayTp) {
        this.drawGaugeAreaWithTp(actor);
    } else {
        this.drawGaugeAreaWithoutTp(actor);
    }
};

Window_BattleStatusTS.prototype.drawGaugeAreaWithTp = function(actor) {
    this.drawActorHp(actor,   0,  0, 200);
    this.drawActorMp(actor,   0, 35, 110);
    this.drawActorTp(actor, 120, 35,  80);
};

Window_BattleStatusTS.prototype.drawGaugeAreaWithoutTp = function(actor) {
    this.drawActorHp(actor,  0,  0, 200);
    this.drawActorMp(actor, 30, 35, 170);
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
    this.refresh();
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

Window_BattleTargetTS.prototype.actorIndex = function() {
    return -1;
};

Window_BattleTargetTS.prototype.show = function() {
    this.refresh();
    this.select(0);
    BattleManagerTS.performTransfer(this.target());
    Window_Selectable.prototype.show.call(this);
};

Window_BattleTargetTS.prototype.processCursorMove = function () {
    if (this.isCursorMovable()) {
        var lastIndex = this.index();
        if (Input.isRepeated('down')) {
            this.cursorDown(Input.isTriggered('down'));
        }
        if (Input.isRepeated('up')) {
            this.cursorUp(Input.isTriggered('up'));
        }
        if (Input.isRepeated('right')) {
            this.cursorRight(Input.isTriggered('right'));
        }
        if (Input.isRepeated('left')) {
            this.cursorLeft(Input.isTriggered('left'));
        }
        if (this.index() !== lastIndex) {
            SoundManager.playCursor();
            BattleManagerTS.performTransfer(this.target());
        }
    }
};

Window_BattleTargetTS.prototype.onTouch = function(triggered) {
    var lastIndex = this.index();
    var x = this.canvasToLocalX(TouchInput.x);
    var y = this.canvasToLocalY(TouchInput.y);
    var hitIndex = this.hitTest(x, y);
    if (hitIndex >= 0) {
        if (hitIndex === this.index()) {
            if (triggered && this.isTouchOkEnabled()) {
                this.processOk();
            }
        } else if (this.isCursorMovable()) {
            this.select(hitIndex);
        }
    } else if (this._stayCount >= 10) {
        if (y < this.padding) {
            this.cursorUp();
        } else if (y >= this.height - this.padding) {
            this.cursorDown();
        }
    }
    if (this.index() !== lastIndex) {
        SoundManager.playCursor();
        BattleManagerTS.performTransfer(this.target());
    }
};

//-----------------------------------------------------------------------------
// Window_BattleActor
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
    var subject = BattleManagerTS.subjectTS();
    if (subject) {
        this._actions = subject.actions();
    }
    Window_BattleTargetTS.prototype.refresh.call(this);
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
    this.x = $gameSelectorTS.screenX();
    this.y = $gameSelectorTS.screenY();
};

//-----------------------------------------------------------------------------
// Sprite_CellTS
//
// The sprite for displaying a cell.

function Sprite_CellTS() {
    this.initialize.apply(this, arguments);
};

Sprite_CellTS.prototype = Object.create(Sprite_Base.prototype);
Sprite_CellTS.prototype.constructor = Sprite_CellTS;

Sprite_CellTS.prototype.initialize = function(x, y) {
    Sprite_Base.prototype.initialize.call(this);
    this._x = x;
    this._y = y;
};

Sprite_CellTS.prototype.update = function() {
    Sprite_Base.prototype.update.call(this);
    this.x = Math.round($gameMap.adjustX(this._x) * 48);
    this.y = Math.round($gameMap.adjustY(this._y) * 48);
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
        for (var y = 0; y < height; y++) {
            var context = this.bitmap._context;
            var w = x * 48;
            var h = y * 48;
            context.rect(w, h, w + 48, h + 48);
            context.stroke();
        }
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
    this._blueCells = [];
    this._redCells = [];
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

Spriteset_MapTS.prototype.createBlueCells = function(blueCells) {
    this._blueCells = [];
    for (var i = 0; i < blueCells.length; i++) {
        var x = blueCells[i][0];
        var y = blueCells[i][1];
        var color = TacticsSystem.moveScopeColor || '#0066CC';
        var cell = this.createColorCell(x, y, color);
        this._blueCells.push(cell);
    }
};

Spriteset_MapTS.prototype.removeBlueCells = function() {
    for (var i = 0; i < this._blueCells.length; i++) {
        this._blueCells[i].hide(); 
        this._tilemap.removeChild(this._blueCells[i]);
    }
};

Spriteset_MapTS.prototype.createRedCells = function(action) {
    this._redCells = [];
    var range = action.range();
    for (var i = 0; i < range.length; i++) {
        var x = range[i][0];
        var y = range[i][1];
        var color = ''
        if (action.isForFriend()) {
            color = TacticsSystem.allyScopeColor || '#008000';
        } else {
            color = TacticsSystem.enemyScopeColor || '#B22222';
        }
        this.createColorCell(x, y, color);
        this._redCells.push(cell);
    }
};

Spriteset_MapTS.prototype.removeRedCells = function() {
    for (var i = 0; i < this._redCells.length; i++) {
        this._redCells[i].hide();
        this._tilemap.removeChild(this._redCells[i]);
    }
};

Spriteset_MapTS.prototype.createColorCell = function(x, y, color) {
    cell = new Sprite_CellTS(x, y);
    cell.bitmap = new Bitmap(48, 48);
    cell.bitmap.fillRect(2, 2, 44, 44, color);
    cell.opacity = 120;
    cell.z = 1;
    this._tilemap.addChild(cell);
    return cell;
};

Spriteset_MapTS.prototype.createGrid = function() {
    this._tilemap.addChild(new Sprite_GridTS());
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
    return false;
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
};

Sprite_BattlerTS.prototype.setBattler = function(battler) {
    this._battler = battler;
};

Sprite_BattlerTS.prototype.update = function() {
    Sprite_Character.prototype.update.call(this);
    this.updateDamagePopup();
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
        if (this._battler.isSpriteVisible()) {
            var sprite = new Sprite_Damage();
            sprite.x = this.x + this.damageOffsetX();
            sprite.y = this.y + this.damageOffsetY();
            sprite.z = this.z + 1;
            sprite.setup(this._battler);
            this._damages.push(sprite);
            this.parent.addChild(sprite);
        }
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

//-----------------------------------------------------------------------------
// Miscellaneous
//
// Rewrite and extension of some methodes

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

var DataManager_createGameObjectsTS = DataManager.createGameObjects;
DataManager.createGameObjects = function() {
    $gameSelectorTS =     new Game_SelectorTS();
    $gameTroopTS =        new Game_TroopTS();
    $gamePartyTS =        new Game_PartyTS();
    DataManager_createGameObjectsTS.call();
};

Game_Action.prototype.battleOpponentsUnit = function(subject) {
    var units = subject.opponentsUnit().aliveMembers();
    var battlers = this.searchBattlers(subject, units);
    return battlers;
};

Game_Action.prototype.battleFriendsUnit = function(subject) {
    var units = subject.friendsUnit().aliveMembers();
    var init = [subject.battler()]; // first for the user keeps the same index !
    var battlers = init.concat(this.searchBattlers(subject, units));
    return battlers;
};

Game_Action.prototype.searchBattlers = function(subject, units) {
    var battlers = [];
    this.createRange(subject);
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

Game_Action.prototype.createRange = function(subject) {
    var data = '';
    if (this.isAttack() && subject.isActor()) {
        data = this.getWeaponRange(subject.battler());
    } else {
        data = this.getSkillRange();
    }
    var x = subject.x;
    var y = subject.y;
    var range = eval('[' + data + ']');
    this._range = range;
};

Game_Action.prototype.getWeaponRange = function(actor) {
    var data = '';
    var weapon = actor.weapons()[0];
    if (typeof weapon === 'undefined') {
        data = this.getSkillRange();
    } else {
        data = weapon.meta('range');
        if (typeof weapon === 'undefined') {
            data = this.getSkillRange();
        }
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

var Game_BattlerBase_canUseTS = Game_BattlerBase.prototype.canUse;
Game_BattlerBase.prototype.canUse = function(item) {
    if ($gameParty.inBattleTS()) {
        if (!this.isItemRangeValid(item)) {
            return false;
        }
    }
    return Game_BattlerBase_canUseTS.call(this, item);
};

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

Game_Actor.prototype.friendsUnitTS = function() {
    return $gamePartyTS;
};

Game_Actor.prototype.isSpriteVisible = function() {
    return $gameSystem.isSideView() || $gameParty.inBattleTS();
};

Game_Enemy.prototype.friendsUnitTS = function() {
    return $gameTroopTS;
};

Game_Party.prototype.setupTS = function(actors) {
    var actorsId = [];
    for (var i = 0; i < actors.length; i++) {
        actorsId.push(actors[i].actorId());
    }
    $gamePartyTS.setBattleMembers(actorsId.length);
    this.changeOrder(actorsId);
};

Game_Party.prototype.changeOrder = function(actors) {
    for (var i = 0; i < this._actors.length; i++) {
        if (!actors.contains(this._actors[i])) {
            actors.push(this._actors[i]);
        }
    }
    this._actors = actors;
};

Game_Party.prototype.maxBattleMembers = function() {
    return $gamePartyTS.maxBattleMembers();
};

Game_Party.prototype.members = function() {
    return this.inBattle() || this.inBattleTS() ? this.battleMembers() : this.allMembers();
};

Game_Party.prototype.inBattleTS = function() {
    return $gamePartyTS.inBattleTS();
};

Game_Troop.prototype.setupTS = function(enemies) {
    this._enemies = enemies;
    //this.makeUniqueNames();
};

Game_Troop.prototype.increaseTurn = function() {
    this._turnCount++;
};

Game_CharacterBase.prototype.isCollidedWithEvents = function(x, y) {
    // for an character to pass through an actor
    // it's used to calculate the shortest path
    var events = $gameMap.eventsXyNt(x, y);
    return events.some(function(event) {
        var dataEvent = $dataMap.events[event.eventId()];
        return event.isNormalPriority() && isNaN(parseInt(dataEvent.meta["actor"]));
    });
};

Game_Character.prototype.searchLimit = function() {
    return 32; // 12 by default
};

var Game_Event_isCollidedWithEventsTS = Game_Event.prototype.isCollidedWithEvents;
Game_Event.prototype.isCollidedWithEvents = function(x, y) {
    // for an actor to pass through an actor
    var thisDataEvent = $dataMap.events[this.eventId()];
    if (!isNaN(parseInt(thisDataEvent.meta["actor"]))) {
        var events = $gameMap.eventsXyNt(x, y);
        return events.some(function(event) {
            var dataEvent = $dataMap.events[event.eventId()];
            return event.isNormalPriority() && isNaN(parseInt(dataEvent.meta["actor"]));
        });
    } else {
        return Game_Event_isCollidedWithEventsTS.call(this, x, y);
    }
};

var Game_Event_initializeTS = Game_Event.prototype.initialize;
Game_Event.prototype.initialize = function(mapId, eventId) {
    Game_Event_initializeTS.call(this, mapId, eventId);
    this.setName(this.event().name);
};

Game_Event.prototype.setName = function(name) {
    this._name = name;
};

Game_Event.prototype.name = function() {
    return this._name;
};

Game_Event.prototype.isActorTS = function() {
    return parseInt(this.event().meta['actor']) > 0;
};

Game_Event.prototype.isEnemyTS = function() {
    return parseInt(this.event().meta['enemy']) > 0;
};

Game_Event.prototype.battlerTS = function() {
    return this.isActorTS() ? $gamePartyTS.getBattler(this) : $gameTroopTS.getBattler(this);;
};

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

var Window_BattleLog_showNormalAnimationTS = Window_BattleLog.prototype.showNormalAnimation;
Window_BattleLog.prototype.showNormalAnimation = function(targets, animationId, mirror) {
    if ($gameParty.inBattleTS()) {
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

Sprite_Character.prototype.character = function() {
    return this._character;
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
