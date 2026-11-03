import Phaser from 'phaser';
import { SCENES } from '../../utils/constants';
import useGameStore from '../../store/GameStore';


export default class BootScene extends Phaser.Scene {
    constructor() {
        super(SCENES.BOOT);
    }
    
    preload() {
        // Load new Swordsman lvl 3 spritesheets
        const heroPath = 'assets/sprites/hero/Tiled_files/Swordsman3/';
        this.load.spritesheet('hero_idle', `${heroPath}Swordsman_lvl3_Idle_with_shadow.png`, { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('hero_walk', `${heroPath}Swordsman_lvl3_Walk_with_shadow.png`, { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('hero_run', `${heroPath}Swordsman_lvl3_Run_with_shadow.png`, { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('hero_attack', `${heroPath}Swordsman_lvl3_attack_with_shadow.png`, { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('hero_hurt', `${heroPath}Swordsman_lvl3_Hurt_with_shadow.png`, { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('hero_death', `${heroPath}Swordsman_lvl3_Death_with_shadow.png`, { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('hero_death_red', `${heroPath}Swordsman_lvl3_Death_red.png`, { frameWidth: 64, frameHeight: 64 });
        
        // Load Swordsman2 NPC spritesheets
        const npcPath = 'assets/sprites/hero/PNG/Swordsman_lvl2/With_shadow/';
        this.load.spritesheet('swordsman_lvl2_idle', `${npcPath}Swordsman_lvl2_Idle_with_shadow.png`, { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('swordsman_lvl2_walk', `${npcPath}Swordsman_lvl2_Walk_with_shadow.png`, { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('swordsman_lvl2_run', `${npcPath}Swordsman_lvl2_Run_with_shadow.png`, { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('swordsman_lvl2_attack', `${npcPath}Swordsman_lvl2_attack_with_shadow.png`, { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('swordsman_lvl2_hurt', `${npcPath}Swordsman_lvl2_Hurt_with_shadow.png`, { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('swordsman_lvl2_death', `${npcPath}Swordsman_lvl2_Death_with_shadow.png`, { frameWidth: 64, frameHeight: 64 });

        
        // Load Standard Goblin enemy spritesheets
        const enemyPath = 'assets/sprites/enemy/red/';
        this.load.spritesheet('goblin_idle', `${enemyPath}Idle.png`, { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('goblin_walk', `${enemyPath}Walk.png`, { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('goblin_run', `${enemyPath}Run.png`, { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('goblin_attack', `${enemyPath}Attack.png`, { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('goblin_hurt', `${enemyPath}Hurt.png`, { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('goblin_death', `${enemyPath}Death.png`, { frameWidth: 64, frameHeight: 64 });
        
        // Load Green Orc enemy spritesheets from the 'green' folder
        const greenPath = 'assets/sprites/enemy/green/';
        this.load.spritesheet('orc_idle', `${greenPath}orc2_idle_with_shadow.png`, { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('orc_walk', `${greenPath}orc2_walk_with_shadow.png`, { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('orc_run', `${greenPath}orc2_run_with_shadow.png`, { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('orc_attack', `${greenPath}orc2_attack_with_shadow.png`, { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('orc_hurt', `${greenPath}orc2_hurt_with_shadow.png`, { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('orc_death', `${greenPath}orc2_death_with_shadow.png`, { frameWidth: 64, frameHeight: 64 });

        const ge = this.make.graphics({x: 0, y: 0, add: false});
        ge.fillStyle(0xff0000);
        ge.fillRect(0,0,32,32);
        ge.generateTexture('goblin', 32, 32);
        ge.generateTexture('orc', 32, 32);
        ge.generateTexture('skeleton', 32, 32);
        
        const gn = this.make.graphics({x: 0, y: 0, add: false});
        // NPC textures are now handled by the swordsman_lvl2 spritesheets

        const powerupPath = 'assets/powerup/';
        this.load.image('health_potion', `${powerupPath}50.png`);
        this.load.image('strength_potion', `${powerupPath}24.png`);
        this.load.image('iron_sword', `${powerupPath}50.png`); // Temporary mapping
        this.load.image('magic_ring', `${powerupPath}50.png`); // Temporary mapping

        // Env Objects
        const objPath = 'assets/objects/';
        this.load.image('obj_black_crystal', `${objPath}Black_crystal1.png`);
        this.load.image('obj_blue_crystal', `${objPath}Blue_crystal4.png`);
        this.load.image('obj_green_crystal', `${objPath}Green_crystal1.png`);
        this.load.image('obj_red_crystal', `${objPath}Red_crystal1.png`);
        this.load.image('obj_yellow_crystal', `${objPath}Yellow_crystal4.png`);
        this.load.image('obj_blue_ruins', `${objPath}Blue-gray_ruins3.png`);
        this.load.image('obj_brown_ruins', `${objPath}Brown-gray_ruins1.png`);
        this.load.image('obj_water_ruins', `${objPath}Water_ruins1.png`);
        this.load.image('obj_white_ruins', `${objPath}White_ruins2.png`);
        this.load.image('obj_yellow_ruins', `${objPath}Yellow_ruins3.png`);
        
        // Spooky Assets (AI Generated)
        this.load.spritesheet('spooky_objects', `${objPath}spooky_objects.png`, { frameWidth: 64, frameHeight: 64 });


        // Background Overhaul Assets
        const bgPath = 'assets/background/';
        this.load.image('bg_land', `${bgPath}land.png`);
        this.load.image('bg_main', `${bgPath}main_bg.png`);
        this.load.image('bg_bridge', `${bgPath}bridge.png`);

        // Roads
        for (let i = 1; i <= 10; i++) {
            this.load.image(`road_${i}`, `${bgPath}road_${i}.png`);
        }

        // Stones/Walls
        for (let i = 1; i <= 6; i++) {
            this.load.image(`stone_${i}`, `${bgPath}stone_${i}.png`);
        }

        // Decorations (Bones/Debris)
        for (let i = 1; i <= 7; i++) {
            this.load.image(`decor_${i}`, `${bgPath}decor_${i}.png`);
        }

        // Mystic Aqua Theme (AI Generated)
        this.load.spritesheet('mystic_paths', `${bgPath}mystic_paths.png`, { frameWidth: 32, frameHeight: 32 });
        // Volcanic Background
        this.load.image('lava_ground', 'assets/background/lava_ground.png');
        // Canonical Bridge Assets
        this.load.spritesheet('path_bridges', 'assets/bridge/Bridges.png', { frameWidth: 16, frameHeight: 16 });
        // Precise named frames for 'Perfect' Stone Bridge (targeted from Bridges_01 logic)

        // Logical Dungeon Set
        this.load.spritesheet('walls_floor', `${bgPath}walls_floor.png`, { frameWidth: 32, frameHeight: 32 });

        // Environment & Paths

        const pathAssets = 'assets/paths/';

        this.load.spritesheet('bridges', `${pathAssets}Bridges.png`, { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('env_objects', `${pathAssets}Objects.png`, { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('interactables', `${pathAssets}doors_lever_chest_animation.png`, { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('decorations', `${pathAssets}decorative_cracks_walls.png`, { frameWidth: 16, frameHeight: 16 });

        // Generate simple particle textures
        const p = this.make.graphics({x: 0, y: 0, add: false});
        p.fillStyle(0xffffff);
        p.fillRect(0, 0, 4, 4);
        p.generateTexture('spark', 4, 4);
        
        p.clear();
        p.fillStyle(0xffffff);
        p.fillCircle(4, 4, 4);
        p.generateTexture('dust', 8, 8);
        
        // Load Game BGM
        this.load.audio('game_bgm', 'assets/bgm/game_bgm.mp3');
        this.load.audio('sword_hit', 'assets/bgm/sword_hit.mp3');

        // Debugging Load Errors
        this.load.on('loaderror', (file) => {
            console.error('Failed to load file:', file.src);
        });
    }
    
    create() {
        useGameStore.getState().setScene(SCENES.MENU);
        this.scene.start(SCENES.MENU);
    }
}
