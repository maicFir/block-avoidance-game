   // 角色类
export class Character {
    private canvas: any;
    private ctx: any;
    private x: number;
    private y: number;
    private width: number;
    private height: number;
    private speed: number;
    private velocityY: number;
    private gravity: number;
    lives: number;
    private image: HTMLImageElement;
    constructor(x: number, y: number, canvas: any) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.x = x;
      this.y = y;
      this.width = 50;
      this.height = 50;
      this.speed = 5;
      this.velocityY = 0; // 重力的速度
      this.gravity = 0.5; // 重力大小
      this.lives = 3; // 生命数量
      this.image = new Image();
      this.image.src = "/role.png";
      this.image.onload = () => {
        this.draw();
      };
    }

    move(left: boolean, right: boolean) {
      if (left) this.x -= this.speed;
      if (right) this.x += this.speed;
    }

    jump() {
      if (this.y === this.canvas.height - this.height) {
        // 确保只有在地面上时可以跳跃
        this.velocityY = -15;
      }
    }

    update() {
      this.y += this.velocityY;
      if (this.y < this.canvas.height - this.height) {
        this.velocityY += this.gravity;
      } else {
        this.y = this.canvas.height - this.height; // 防止角色掉出画面
        this.velocityY = 0;
      }
    }

    draw() {
      this.ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
   
    }
  }