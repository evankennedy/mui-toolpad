import * as React from 'react';
import { Paper as MuiPaper, PaperProps as MuiPaperProps } from '@mui/material';
import { createComponent } from '@mui/toolpad-core';
import { SX_PROP_HELPER_TEXT } from './constants';

function Paper({ children, sx, ...props }: MuiPaperProps) {
  return (
    <MuiPaper sx={{ padding: 1, width: '100%', ...sx }} {...props}>
      {children}
    </MuiPaper>
  );
}

export default createComponent(Paper, {
  layoutDirection: 'vertical',
  argTypes: {
    elevation: {
      helperText:
        'The [elevation](https://mui.com/material-ui/react-paper/#elevation) can be used to establish a hierarchy between other content. In practical terms, the elevation controls the size of the shadow applied to the surface. In dark mode, raising the elevation also makes the surface lighter.',
      typeDef: { type: 'number', minimum: 0, default: 1 },
    },
    children: {
      typeDef: { type: 'element' },
      control: { type: 'layoutSlot' },
    },
    sx: {
      helperText: SX_PROP_HELPER_TEXT,
      typeDef: { type: 'object' },
    },
  },
});
