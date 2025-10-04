/**
 *  坠落物体类
 */
import { RandomPicker } from "@utils/index";

const assetImages: string[] = [
    "/meme/SHIKOKU.png",
    "/meme/ALAN.png",
    "/meme/AME.png",
    "/meme/NYANGUY.png",
    "/meme/petunia.png",
    "/meme/TRUMPS.png",
];
export class FallingObject {
    private canvas: any;
    private ctx: any;
    private x: number;
    private y: number;
    private size: number;
    private speed: number;
    private blockImage: any;
    private data: any;
    constructor(canvas: any, data: any) {
      // const blocks: any = new RandomPicker(data.data).getRandom();
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.x = Math.random() * canvas.width;
      this.y = 0;
      this.size = Math.random() * 30 + 20; // 随机物体大小
      this.speed = Math.random() * 3 + 2; // 随机物体下落速度
      this.data = data;
      this.blockImage = new Image();
        //this.blockImage.src = "/bitCoin.png"; 
        this.blockImage.src = assetImages[0];
        this.blockImage.onload = () => {
            this.draw(); // 只有在图片加载完成后调用绘制
        };
    }

    update() {
      this.y += this.speed;
    }

    draw() {
        this.ctx.drawImage(this.blockImage, this.x, this.y, this.size, this.size);
    }

    checkCollision(character: {
      x: number;
      width: any;
      y: number;
      height: any;
    }) {
      if (
        this.x < character.x + character.width &&
        this.x + this.size > character.x &&
        this.y < character.y + character.height &&
        this.y + this.size > character.y
      ) {
        return true; // 发生碰撞
      }
      return false;
    }
  }