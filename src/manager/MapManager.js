import Mineral from "../objects/Mineral";

export default class MapManager {
  constructor(scene) {
    this.scene = scene;
    this.minerals = [];
  }

  createMap = (level = 1) => {
    const map = this.scene.make.tilemap({ key: 'map' });
    const tileSet = map.getTileset('miner_mineral');
    const objectLayer = map.getObjectLayer(`Map Layer${level}`);

    objectLayer.objects.forEach((obj) => {
      const x = Math.floor(obj.x) + 50;
      const y = Math.floor(obj.y) - 10;
      const gid = obj.gid - 2;
      const price = Number(obj.properties?.find(p => p.name === 'price')?.value) || Phaser.Math.Between(10, 500);
      const weight = Number(obj.properties?.find(p => p.name === 'weight')?.value) || Phaser.Math.Between(10, 90);
      const name = obj.name;
      const type = obj.type;
      const objectData = tileSet.tileData[gid]?.objectgroup?.objects[0];
      const verts = objectData?.polygon?.map(poly => ({ x: poly.x, y: poly.y }));

      const data = { x, y, gid, price, weight, type, verts, width: obj.width, height: obj.height, name };
      const mineral = new Mineral(this.scene, data); // Mineral이 sprite/body/behavior 생성
      this.minerals.push(mineral);
    });
  }
}