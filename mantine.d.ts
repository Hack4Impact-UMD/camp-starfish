// mantine.d.ts

import '@mantine/core';

// 1. Extend the default ButtonVariant type to include your custom variants
type ExtendedButtonVariant = 'cancel' | 'generate' | (
  // Use a conditional type to maintain compatibility if the base type isn't a string
  import('@mantine/core').ButtonVariant extends string ? import('@mantine/core').ButtonVariant : never
);

// 2. Extend the Mantine theme override module to include your new types
// This tells TypeScript that the Button component can now use 'cancel' and 'generate' variants
declare module '@mantine/core' {
  export interface ButtonProps {
    variant?: ExtendedButtonVariant | (string & {});
  }

  // Optional: If you want MantineThemeOverride to fully recognize 'variants' in the theme object
  // MantineThemeComponents is usually extended for this, but for simple component overrides,
  // extending the ButtonProps often forces the theme override to pick it up.
  
  // If the error persists after just the ButtonProps change, you may need a global module declaration for the Button component config:
  export interface MantineThemeComponents {
    Button: {
      variants?: Record<ExtendedButtonVariant, (theme: MantineTheme) => any>;
      // The rest of the Button configuration properties
      styles?: any;
      defaultProps?: any;
      classNames?: any;
    };
  }
}