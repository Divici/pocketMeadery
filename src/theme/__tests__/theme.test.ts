import { lightTheme, darkTheme } from '../theme';

describe('theme', () => {
  const requiredKeys = [
    'background',
    'surface',
    'primary',
    'accent',
    'border',
    'text',
    'muted',
  ] as const;

  describe('lightTheme', () => {
    it('has all required color tokens', () => {
      requiredKeys.forEach((key) => {
        expect(lightTheme[key]).toBeDefined();
        expect(typeof lightTheme[key]).toBe('string');
        expect(lightTheme[key]).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });

    it('uses burgundy/wine primary', () => {
      expect(lightTheme.primary).toBe('#6B1F1A');
    });

    it('uses honey accent', () => {
      expect(lightTheme.accent).toBe('#E4B95E');
    });
  });

  describe('darkTheme', () => {
    it('has all required color tokens', () => {
      requiredKeys.forEach((key) => {
        expect(darkTheme[key]).toBeDefined();
        expect(typeof darkTheme[key]).toBe('string');
        expect(darkTheme[key]).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });

    it('uses wine primary', () => {
      expect(darkTheme.primary).toBe('#9E3B34');
    });

    it('uses honey accent', () => {
      expect(darkTheme.accent).toBe('#D4A843');
    });
  });
});
