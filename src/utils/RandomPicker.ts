/**
 * 随机从数组中随机选择一个元素且不重复
 */
export class RandomPicker {
    originalArray: number[];
    array: number[];
    constructor(arr: number[]) {
      this.originalArray = arr;
      this.array = [...arr]; // 复制一份数组，以免修改原数组
    }
    shuffle() {
      let currentIndex = this.array.length;
      let randomIndex;
      
      // 当数组还有未取出的元素时
      while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex); // 生成随机索引
        currentIndex--;
  
        // 交换当前元素与随机元素
        [this.array[currentIndex], this.array[randomIndex]] = [this.array[randomIndex], this.array[currentIndex]];
      }
    }
  
    // 获取一个随机且不重复的元素
    getRandom() {
      if (this.array.length === 0) {
        console.log("所有元素都已取完");
        return null;
      }
  
      const randomElement = this.array.pop(); // 取出并移除数组中的最后一个元素
      return randomElement;
    }
  
    // 重置数组，使其可以重新从头开始随机选择
    reset() {
      this.array = [...this.originalArray]; // 恢复为原始数组
    }
  }
  
  