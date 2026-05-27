class MainScene extends Phaser.Scene {

    constructor() {
        super('MainScene');
    }

    preload() {

        // TILEMAP
        this.load.tilemapTiledJSON('level1', 'assets/maps/level1.json');

        // TILESETS
        this.load.image('platformTiles', 'assets/tiles/pixel-platformer.png');
        this.load.image('industrialTiles', 'assets/tiles/industrial.png');
        this.load.image('foodTiles', 'assets/tiles/food.png');
        //this.load.image('backgroundTiles', 'assets/tiles/background.png');

        // IMAGES
        this.load.image('player', 'assets/images/player.png');
        this.load.image('jump', 'assets/images/player_jump.png');
        this.load.image('donut', 'assets/images/donut.png');
        
        /* AUDIO
        this.load.audio('jump', 'assets/audio/jump.wav');
        this.load.audio('collect', 'assets/audio/collect.wav');
        */
    }

    create() {

        // CREATE TILEMAP
        const map = this.make.tilemap({
            key: 'level1'
        });

        this.add.rectangle(0, 0, map.widthInPixels, map.heightInPixels, 0x2c3e50).setOrigin(0);

        // CONNECT TILESETS
        const platformSet = map.addTilesetImage('tileset-tiles', 'platformTiles');
        const industrialSet = map.addTilesetImage('Industrial', 'industrialTiles');
        const foodSet = map.addTilesetImage('Collectibles', 'foodTiles');
        //const backgroundSet = map.addTilesetImage('Background', 'backgroundTiles');

        // CREATE LAYERS
        //this.backgroundLayer = map.createLayer('Background', backgroundSet, 0, 0);
        this.platformLayer = map.createLayer('Platforms', [platformSet, industrialSet, foodSet], 0, 0);
        this.decorationLayer = map.createLayer('Decorations', [platformSet, industrialSet, foodSet], 0, 0);

        // ENABLE PLATFORM COLLISION
        this.platformLayer.setCollisionByExclusion([-1]);

        // FIND PLAYER SPAWN
        const spawnPoint = map.findObject(
            'Player',
            obj => obj.name === 'player_spawn'
        );

        // CREATE PLAYER
        this.player = this.physics.add.sprite(
            spawnPoint.x,
            spawnPoint.y,
            'player'
        );

        // PLAYER COLLISION
        this.physics.add.collider(
            this.player,
            this.platformLayer
        );

        this.platformLayer.renderDebug(this.add.graphics(), {
            tileColor: null,
            collidingTileColor: new Phaser.Display.Color(255, 0, 0, 120),
            faceColor: new Phaser.Display.Color(0, 255, 0, 120)
        });

        // SCORE
        this.score = 0;
        this.scoreText = this.add.text(16, 16, 'Score: 0', 
            {
                fontSize: '24px',
                fill: '#ffffff'
            }
        );

        this.scoreText.setScrollFactor(0);

        this.collectibles = this.physics.add.group();

        map.getObjectLayer('Collectibles').objects.forEach(obj => {
            const item = this.collectibles.create(obj.x, obj.y, 'donut');

            item.body.setAllowGravity(false);
            item.body.setImmovable(true);
            item.body.moves = false;
            item.value = obj.value || 1;
        });
        
        this.physics.add.overlap(
            this.player,
            this.collectibles,
            (player, item) => {

                this.score += item.value;
                item.destroy();

                this.scoreText.setText('Score: ' + this.score);
            }
        );

        map.getObjectLayer('FallTriggers').objects.forEach(obj => {

            const zone = this.add.zone(obj.x, obj.y, obj.width, obj.height);
            this.physics.add.existing(zone, true);

            this.physics.add.overlap(this.player, zone, () => {

                console.log("Fall trigger activated");

                //drop platform code here
            });
        });

        map.getObjectLayer('EndFlag').objects.forEach(obj => {

            const flagZone = this.add.zone(obj.x, obj.y, obj.width, obj.height);
            this.physics.add.existing(flagZone, true);

            this.physics.add.overlap(this.player, flagZone, () => {
                console.log("LEVEL COMPLETE");
            });
        });

        // CAMERA
        this.cameras.main.startFollow(this.player);

        this.cameras.main.setBounds(
            0,
            0,
            map.widthInPixels,
            map.heightInPixels
        );

        // CONTROLS
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys({
            W: Phaser.Input.Keyboard.KeyCodes.W,
            A: Phaser.Input.Keyboard.KeyCodes.A,
            S: Phaser.Input.Keyboard.KeyCodes.S,
            D: Phaser.Input.Keyboard.KeyCodes.D
        });

    }

    update() {

        const speed = 200;
        const jumpPower = -400;

        // LEFT
        if (this.keys.A.isDown) {
            this.player.setVelocityX(-speed);
        }
        // RIGHT
        else if (this.keys.D.isDown) {
            this.player.setVelocityX(speed);
        }
        // IDLE
        else {
            this.player.setVelocityX(0);
        }

        // JUMP
        if (
            this.cursors.space.isDown &&
            this.player.body.blocked.down
        ) {

            this.player.setVelocityY(jumpPower);

        }
    }
}

// GAME CONFIG
const config = {

    type: Phaser.AUTO,

    width: 1280,
    height: 720,

    physics: {
        default: 'arcade',

        arcade: {
            gravity: { y: 800 },
            debug: false
        }
    },

    scene: [MainScene]
};

// START GAME
new Phaser.Game(config);