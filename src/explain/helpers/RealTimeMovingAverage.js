/**
 * Real-time moving average calculator for blood flow signals
 */
export default class RealTimeMovingAverage {
    constructor(windowSize) {
      this.windowSize = windowSize;
      this.values = [];
      this.sum = 0;
      this.currentAverage = 0;
    }
  
    /**
     * Add a new data point and update the average
     * @param {number} newValue - The newest blood flow measurement
     * @return {number} - The updated average flow
     */
    addValue(newValue) {
      // Add the new value
      this.values.push(newValue);
      this.sum += newValue;
      
      // Remove oldest value if we exceed the window size
      if (this.values.length > this.windowSize) {
        const oldestValue = this.values.shift();
        this.sum -= oldestValue;
      }
      
      // Calculate the current average
      this.currentAverage = this.sum / this.values.length;
      return this.currentAverage;
    }
    
    /**
     * Get the current average without adding a new value
     * @return {number} - The current average flow
     */
    getCurrentAverage() {
      return this.currentAverage;
    }
    
    /**
     * Reset the moving average calculator
     */
    reset() {
      this.values = [];
      this.sum = 0;
      this.currentAverage = 0;
    }
  }