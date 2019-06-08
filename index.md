# Tactics System v.0.5

This document is a user guide to quickly configure the Tactics System in a new project. Please read the instructions carefully before using this system. The Tactics System is a tactical battle system for RPG Maker MV inspired by Final Fantasy Tactics and the Fire Emblem series.


# Basics
## Prepare Yourself !
The **Tactics System** allows the creation of tactical-RPG with **RPG Maker MV**  (v.1.6.2)  software. **The Tactics System has been designed to be easy to use**. Just create a map with events defining the position of units and use a plugin command to launch a fight !

An example demo of how to use the system is provided [in the forum](https://forums.rpgmakerweb.com/index.php?forums/js-plugins-in-development.137/). The Tactics System will be updated regularly, so please check the forum regularly.

## System Flow
The fight proceeds in the same way as an episode of the series Fire Emblem : we have the **player phase** and the **enemy phase**.

## Condition of victory and defeat
The conditions of victory and defeat are simple : **the player wins if all enemy’s units are dead, the player loses if all his units are dead**.
Other conditions should be available in the system soon.

# Battle map
Player and enemy units are positioned with events. The command to start the fight is simple ! It consists of a plugin command contained in an event.

## Units
We need to bind the events to the actors and enemies in the database. The bond of the event to an actor is realized with the following note :

| Note           | description                               |
|----------------|-------------------------------------------|
|`<actor:id>`    | Determine the event as an actor for battle. The identifier represents that of the actor in the database.  The image representing the actor is not directly associated with it. You must manually display the correct image in the event.                                          |
|`<party:id>`    | Determine the event as an actor for battle. The identifier represents that of the actor in the party. By example, `<party:1>` bond the event with the leader of party. You should not manually display the correct image in the event.
|`<enemy:id>`    | Determine the event as an enemy for battle.
|`<aggro:int>`   | An enemy have also a aggro (aggresive) parameter who defines the action area. By default, this parameter is the same than the move attribute. Use this note for determines an action area.

> All notes in the above table must be indicated in the note section in an event.

## Start Battle
To start a battle, use the following command : startBattleTS. This command is blocking. At the end of the combat, the system resumes the flow of the event used.  All other events are being updated in parallel.

| Plugin command  | description                            |
|-----------------|----------------------------------------|
|`TS.startBattle` | To start a battle. This command is blocking. At the end of the combat, the system resumes the flow of the event used.  All other events are being updated in parallel.

> Other plugin commands should be added soon.

# Database

| Note                    | data                     | description                           |
|-------------------------|--------------------------|---------------------------------------|
|`<move:int>`             | _actors/classes/enemies_ | This defines a unit’s ability to move.

> All notes in the above table must be indicated in the note section in an event.

# Note
You need an image _Selector.png_ in the **img/system** folder to display the selector.
