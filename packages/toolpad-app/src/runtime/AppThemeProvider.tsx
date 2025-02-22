import * as React from 'react';
import { createTheme, ThemeOptions, PaletteOptions, ThemeProvider } from '@mui/material';
import * as colors from '@mui/material/colors';
import * as appDom from '../appDom';
import { AppTheme } from '../types';

export function createToolpadTheme(toolpadTheme: AppTheme = {}): ThemeOptions {
  const palette: PaletteOptions = {};
  const primary = toolpadTheme['palette.primary.main'];
  if (primary) {
    palette.primary = (colors as any)[primary];
  }

  const secondary = toolpadTheme['palette.secondary.main'];
  if (secondary) {
    palette.secondary = (colors as any)[secondary];
  }

  const mode = toolpadTheme['palette.mode'];
  if (mode) {
    palette.mode = mode;
  }

  const theme = createTheme();

  return createTheme(theme, {
    typography: {
      h1: {
        fontSize: `3.25rem`,
        fontWeight: 800,
      },

      h2: {
        fontSize: `2.25rem`,
        fontWeight: 700,
      },

      h3: {
        fontSize: `1.75rem`,
        fontWeight: 700,
      },

      h4: {
        fontSize: `1.5rem`,
        fontWeight: 700,
      },

      h5: {
        fontSize: `1.25rem`,
        fontWeight: 700,
      },

      h6: {
        fontSize: `1.15rem`,
        fontWeight: 700,
      },
    },
    palette,
  });
}

export interface ThemeProviderProps {
  dom: appDom.AppDom;
  children?: React.ReactNode;
}

export default function AppThemeProvider({ dom, children }: ThemeProviderProps) {
  const theme = React.useMemo(() => {
    const root = appDom.getApp(dom);
    const { themes = [] } = appDom.getChildNodes(dom, root);
    const themeNode = themes.length > 0 ? themes[0] : null;
    const toolpadTheme: AppTheme = themeNode?.theme
      ? appDom.fromConstPropValues(themeNode.theme)
      : {};
    return createToolpadTheme(toolpadTheme);
  }, [dom]);

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
