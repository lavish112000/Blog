/**
 * Sample test file to demonstrate testing framework
 * Tests basic utility functions
 */

describe('Blog Website - Basic Tests', () => {
  describe('DOM Manipulation', () => {
    test('should create element with class', () => {
      document.body.innerHTML = '<div class="test-class"></div>';
      const element = document.querySelector('.test-class');
      expect(element).not.toBeNull();
      expect(element.className).toBe('test-class');
    });

    test('should update element content', () => {
      document.body.innerHTML = '<div id="test"></div>';
      const element = document.getElementById('test');
      element.textContent = 'Hello World';
      expect(element.textContent).toBe('Hello World');
    });
  });

  describe('String Utilities', () => {
    test('should trim whitespace', () => {
      const text = '  Hello World  ';
      expect(text.trim()).toBe('Hello World');
    });

    test('should convert to lowercase', () => {
      const text = 'HELLO WORLD';
      expect(text.toLowerCase()).toBe('hello world');
    });
  });

  describe('Array Operations', () => {
    test('should filter array elements', () => {
      const numbers = [1, 2, 3, 4, 5];
      const filtered = numbers.filter(n => n > 3);
      expect(filtered).toEqual([4, 5]);
    });

    test('should map array elements', () => {
      const numbers = [1, 2, 3];
      const doubled = numbers.map(n => n * 2);
      expect(doubled).toEqual([2, 4, 6]);
    });
  });
});
