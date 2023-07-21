# Informations

Title: Go-kart
Author: Avel LE MEE MORET
Year and season: 2023 Summer
Curriculum and semester: IBS2
Created in PRIMA course at HFU

# Links

- Link to the finished and executable application on Github-Pages: https://easzyyyyy.github.io/prima/Projects/Karting/index.html
- Link to the source code (prima): https://github.com/easzyyyyy/prima/tree/main
- Link to the source code (Go-Kart): https://github.com/easzyyyyy/prima/tree/main/Projects/Karting
- Link to the design document: https://github.com/easzyyyyy/prima/tree/main/Projects/Karting/presentation.pdf

# How to use

Click the center button to start the game.
Move your kart using WASD or ZQSD keys.
Change camera view using C.
Restart lap using R.
The goal is to make the best time while staying inside the track limits.

# Catalogue

Units and Positions : The 0 is the center of the track. Distance unit is meter (m) and speed unit is meter per second (m/s).

Hierarchy : The kart, start and spectator nodes contain a geometry node which allows to group and apply transformations on the different subparts contained in it.
The kart ComponentRigidbody is directly applied to the kart node so it can use the kart ComponentTransform to make the kart move.
The track is a bit different because it contains two different layers. One for the texture and one under it for the track limits. The texture node contains a static ComponentRigidbody in order to collide with the kart. It also contains a Material which is added on runtime (see below).

Editor : The editor allowed me to create the 3D models of the kart and the spectator by grouping, transforming and applying materials on several meshes.

CustomScriptComponent : The CustomScriptComponent was not really useful for me during this project but it allowed me to animate the spectator only if the best lap time is under 12 seconds.

Extend : The kart and track node extends the Fudge node.

Sound : I had to create a motor sound in fudge. I use a simple motor idle sound and increase or decrease it rate in order to modify the pitch.

VUI : In order for the player to see his current, previous and best speed and lap time, I created a VUI with all this information. It also shows how to change cameras and restart the lap.

Event-System : I used the event system to know which key the player presses in order to detect if the player wants to restart the lap or toggle the camera position.

External Data : I used a configuration file in order to change the default camera position, the max velocity and other data useful for the movement of the kart.

Light : I have a simple environment light only used to see the track.

Physics : I use physic on the kart to move it and create collision between the kart and the track. Physics makes it easy to reproduce the behavior of a kart.

Animation : I created a little animation so the spectator says hello when the best time is under 12 seconds.
