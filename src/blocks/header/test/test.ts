import Header from '../header';

describe("something", () => {
    const header = new Header();
    it('should be created', () => {
        expect(header.show()).toBe('hellow');
    });
});
