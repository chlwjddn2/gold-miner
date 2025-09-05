export default class MapManager {
  constructor(scene) {
    this.scene = scene;
    this.minerals = [];
  }

  loadAssets() {
    console.log('load map');
    
    this.scene.load.tilemapTiledJSON("map", "/map.json");
    this.scene.load.spritesheet('minerals', '/mineral.png', {
      frameWidth: 350,
      frameHeight: 350
    });
  }

  createMap() {
    const randomNunber = Phaser.Math.Between(1, 2);
    const map = this.scene.make.tilemap({ key: "map" });
    const objectLayer = map.getObjectLayer(`Object Layer ${randomNunber}`);
    const tileSets = map.getTileset("mineral");

    objectLayer.objects.forEach((obj) => {
      const x = Math.floor(obj.x);
      const y = Math.floor(obj.y) - 80;
      const gid = obj.gid - 1;

      const sprite = this.scene.matter.add.sprite(x, y, "minerals", gid);
      const objectData = tileSets.tileData[gid]?.objectgroup?.objects[0];
      const verts = objectData?.polygon?.map(poly => ({ x: poly.x + 100, y: poly.y + 100 }));
      
      if (verts) sprite.setBody({ type: 'fromVertices', verts });
      
      sprite.setDisplaySize(obj.width, obj.height);
      sprite.price = Number(obj.properties.find((property) => property.name === 'price').value);
      sprite.weight = Number(obj.properties.find((property) => property.name === 'weight').value);
      this.minerals.push(sprite);
    });
  }
}