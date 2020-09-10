# Tactics System v.1.2

This document is a user guide to  Tactics System. Please read the instructions carefully before using this system. The Tactics System is a tactical battle system for RPG Maker MV.


# Basics
## Prepare Yourself !
The **Tactics System** allows the creation of tactical-RPG with **RPG Maker MV**  (v.1.6.2)  software. **The Tactics System has been designed to be easy to use**. Just create a map with events defining the position of units and use battle processing event command to launch a fight !

An example demo of how to use the system [is provided](https://github.com/belmoussaoui/Tactics-System/releases/tag/v.1.2)

## System Flow
The fight proceeds in the same way as an episode of the series Fire Emblem : we have the **player phase** and the **enemy phase**.

## Condition of victory and defeat
The conditions of victory and defeat are simple : **the player wins if all enemy’s units are dead, the player loses if all his units are dead**.
You can define your own conditions with plugin commands.

# Battle map
Player and enemy units are positioned with events. The command to start the fight is simple ! It consists to use the battle processing command contained in an event.

## Units
We need to bind the events to the actors and enemies in the database. The bond of the event to an actor is realized with the following note :

| Note           | description                               |
|----------------|-------------------------------------------|
|`<Actor:id>`    | Determine the event as an actor for battle. The identifier represents that of the actor in the database.  The image representing the actor is not directly associated with it. You must manually display the correct image in the event.                                          |
|`<Party:id>`    | Determine the event as an actor for battle. The identifier represents that of the actor in the party. By example, `<Party:1>` bond the event with the leader of party. You should not manually display the correct image in the event.
|`<Enemy:id>`    | Determine the event as an enemy for battle.
|`<Aggro:int>`   | An enemy have also an aggro (aggresive) parameter who defines the action area. By default, this parameter is the same than the move attribute. Use this note for determines an action area.
|`<Name:string>`   | This is the name that will appear in the menu when a unit can activate the event by button.
|`<Ts-Parameter:Move int>` | Add buff/debuff move for an item/state.


> All notes in the above table must be indicated in the note section in an event.

## Start Battle

| Plugin command  | description                            |
|-----------------|----------------------------------------|
|`TacticsSystem.ProcessVictory`| Proceed immediately to the victory of the battle.
|`TacticsSystem.ProcessDefeat`| Proceed immediately to the defeat of the battle.
|`TacticsSystem.SelectorMoveTo x y`|Move the selector to position x and y.
|`TacticsSystem.SelectorTransfer x y` | Move immediately the selector to position x and y.
|`TacticsSystem.SelectorEvent eventId` |  Move immediately the selector to position at event of eventId.
|`TacticsSystem.ClearAll [on/off]` |  Activate or desactivate clear all condition victory.
|`TacticsSystem.BattlerEndAction` | Ends the subject's turn.

# Database
## Actors, Classes and Enemies

| Note                    | description                          |
|-------------------------|--------------------------------------|
|`<Move:int>`             | This defines a unit’s ability to move.

> All notes in the above table must be indicated in the note section in database.

## Skills, items and weapons

| Note                    | description                           |
|-------------------------|---------------------------------------|
| `<Range:int>`   | Defines a range in the shape of a diamond of size int.
|`<Range:int int>` | Defines a min range and max range in the shape of a diamond
|`<Range:int int shape>` | Defines a range in the shape of [diamond, rectangle or line] of size int

> All notes in the above table must be indicated in the note section in database.

# Note
You need an image _Selector.png_ in the **img/system** folder (by default) to display the selector.
