/**
 * Created by petermares on 20/02/2016.
 */

module.exports = (function() {
    var o = {};
    var _images = {
        logo: 'assets/logo.png',
        sky: 'assets/sky.png',
        diamond: 'assets/diamond.png'

    };
    var _spritesheets = {
        baddie: {
            file: 'assets/baddie.png',
            width: 32,
            height: 32
        },
        dude: {
            file: 'assets/peter_green.png',
            width: 48,
            height: 64
        }
    };
    var element;

    o.preload = function() {
        console.log('Preloader.preload');

        // load images
        for ( k in _images ) {
            this.load.image(k, _images[k]);
        }

        // load the sprite sheets
        for ( k in _spritesheets ) {
            this.load.spritesheet(k, _spritesheets[k].file, _spritesheets[k].width, _spritesheets[k].height);
        }
    };

    o.create = function() {
        console.log('Preloader.create');

        element = this.game.add.sprite(this.scale.width/2, this.scale.height/2, 'logo');
        element.anchor.set(0.5);

        this.state.start('mainmenu');
    };

    return o;
})();
