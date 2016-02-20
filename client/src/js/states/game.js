/**
 * Created by petermares on 20/02/2016.
 */

module.exports = (function() {
    var settings = require('../../settings');
    var o = {};
    var _tiles = {
        tile_grass: 'assets/grass_128x128.png',
        tile_sky: 'assets/sky.png'
    };
    var player;
    var state = 'waiting';
    var platforms;
    var level;
    var numJumps = 0;
    var serverLabel, gameOverLabel;
    var deathEmitter;

    o.preload = function() {
        console.log('Game.preload');

        this.game.stage.backgroundColor = '#000';

        // load images
        for (var k in _tiles) {
            this.load.image(k, _tiles[k]);
        }

        this.game.load.json('level', 'http://' + settings.server.host + ':' + settings.server.port + '/player/' + settings.playerID + '/level');
    };

    o.create = function() {
        console.log('Game.create');

        level = this.game.cache.getJSON('level');
        level.gaps *= 2;
        console.log(level);
        var serverVersion = this.game.cache.getJSON('server_version');

        var sky = this.game.add.sprite(0, 0, 'sky');
        sky.width = settings.display.width;

        platforms = this.game.add.group();
        platforms.enableBody = true;
        var ground;
        for ( var i = 1; i <= level.size; i++ ) {
            if ( level.gaps && (i == Math.floor(level.size / level.gaps)) ) {
                level.gaps--;
                console.log('generating gap at position: ' + i);
                i += 2;
            } else {
                ground = platforms.create((i-1) * 64, this.game.world.height-64, 'tile_grass');
                ground.body.immovable = true;
                ground.scale.set(0.5, 0.5);
                ground.body.friction.x = 0;
            }
        }

        // create the player
        player = this.game.add.sprite(256, 0, 'dude');
        this.game.physics.arcade.enable(player);
        player.body.bounce.y = 0;
        player.body.gravity.y = 350;
        player.body.collideWorldBounds = true;
        player.animations.add('right', [1, 2, 3, 4], 10, true);
        player.animations.add('jump', [5, 6], 10, true);
        player.animations.add('fall', [0], 10, true);

        // text
        serverLabel = this.game.add.text(8, 8, getServerVersion(serverVersion), {fontSize: '24', fill: '#000' })
        gameOverLabel = this.game.add.text(this.game.world.centerX, this.game.world.centerY, 'Game Over', {font: 'bold 96pt arial', fill: '#F00'});
        gameOverLabel.anchor.set(0.5);
        gameOverLabel.visible = false;

        // emitter
        deathEmitter = this.game.add.emitter(this.game.world.centerX, 0, 100);
        deathEmitter.makeParticles('heart');
        deathEmitter.gravity = 300;
    };

    o.update = function() {
        this.game.physics.arcade.collide(player, platforms);
        switch ( state ) {
            case    'waiting':
                if ( player.body.touching.down ) {
                    state = 'running';
                }
                break;

            case    'running':
                this.run();
                break;

            case    'dead':
                gameOverLabel.visible = true;
                var scale = player.scale;
                if ( scale.x > 0 ) {
                    scale.x -= 0.05;
                    scale.y -= 0.05;
                    player.scale = scale;
                }
                break;
        }
    };

    o.run = function() {
        var cursors = this.game.input.keyboard.createCursorKeys();
        var isJumping = !player.body.touching.down;
        var runSpeed = 150;

        runSpeed += Math.abs(platforms.children[0].x) / 64;

        updateRunnerSpeedTo(runSpeed);

        if ( player.body.bottom >= settings.display.height ||
             player.body.touching.right ) {
            // kill the player and end the game
            killPlayer();
        }


        if ( cursors.up.isDown) {
            // enable a single and double jump.
            // doubleJumps are only allowed on a certain part of the initial jump arc
            if ( player.body.velocity.y > -100 && numJumps < 1 ) {
                player.body.velocity.y = -250;
                numJumps++;
            }
        }
        if ( cursors.down.isDown) {
            player.body.velocity.y = 800;
        }

        if ( isJumping ) {
            player.animations.play('jump');
        } else {
            player.animations.play('right');
            numJumps = 0;
        }
    };

    function updateRunnerSpeedTo(speed) {
        platforms.forEach(function(ground) {
            ground.body.velocity.x = -speed;
        }, this);
    }

    function killPlayer() {
        state = 'dead';
        updateRunnerSpeedTo(0);
        deathEmitter.x = player.worldPosition.x + player.width/2;
        deathEmitter.y = player.worldPosition.y + player.height/2;
        deathEmitter.start(true, 2000, null, 15);
    }

    function getServerVersion(o) {
        return 'Server version: ' + o.name + ' ' + o.version;
    }

    return o;
})();