import React from 'react';
import IconButton from '@mui/material/IconButton';
import { useTheme, ThemeProvider, createTheme } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import useMediaQuery from '@mui/material/useMediaQuery';
import { CssBaseline, ListItemIcon, ListItemText, MenuItem } from '@mui/material';
import { blueGrey } from '@mui/material/colors';

export const ColorModeContext = React.createContext({ toggleColorMode: () => { } });

export function changeTheme(){
  const colorMode = React.useContext(ColorModeContext);
  colorMode.toggleColorMode()
};

export const DarkModeToggleButton = React.forwardRef((props, ref) => {
  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);
  return (
    <IconButton {...props} ref={ref}  onClick={colorMode.toggleColorMode} color="inherit">
      {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
    </IconButton>
  );
})

export const DarkModeToggleMenuItem = React.forwardRef(({label = 'Toggle dark mode', ...props}, ref) => {
  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);
  return (
    <MenuItem {...props} ref={ref} onClick={colorMode.toggleColorMode}>
      <ListItemIcon>{theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}</ListItemIcon>
      <ListItemText>{label}</ListItemText>
    </MenuItem>
  );
})

export default function ThemeProxy(props) {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)', { noSsr: true });
  const [mode, setMode] = React.useState(prefersDarkMode ? 'dark' : 'light');
  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [],
  );

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: blueGrey,
        },
      }),
    [mode],
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {props.children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}