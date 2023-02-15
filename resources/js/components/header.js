import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import Badge from '@mui/material/Badge';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MailIcon from '@mui/icons-material/Mail';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MoreIcon from '@mui/icons-material/MoreVert';
import { DarkModeToggleButton } from './themeProxy';
import FolderIcon from '@mui/icons-material/Folder';
import { CircularProgress, Fab, Fade, LinearProgress, ListItemIcon, ListItemText, Tooltip, useMediaQuery, useScrollTrigger, useTheme } from '@mui/material';
import { green } from '@mui/material/colors';
import CheckIcon from '@mui/icons-material/Check';
import { useNavigate } from 'react-router-dom';

import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';


export function ScrollTop(props) {
  const { children, window } = props;
  // Note that you normally won't need to set the window ref as useScrollTrigger
  // will default to window.
  // This is only being set here because the demo is in an iframe.
  const trigger = useScrollTrigger({
    target: window ? window() : undefined,
    disableHysteresis: true,
    threshold: 100,
  });

  const handleClick = (event) => {
    const anchor = (event.target.ownerDocument || document).querySelector(
      '#back-to-top-anchor',
    );

    if (anchor) {
      anchor.scrollIntoView({
        block: 'center',
      });
    }
  };

  return (
    <Fade in={trigger}>
      <Box
        onClick={handleClick}
        role="presentation"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
      >
        <Fab size="small" aria-label="scroll back to top">
          <KeyboardArrowUpIcon />
        </Fab>
      </Box>
    </Fade>
  );
}


export const ButtonProgress = React.forwardRef(({ loading, success, onClick, children, progress = undefined, ...props }, ref) => {
  return (<Box sx={{ position: 'relative', margin: 0.5 }}>
    <Fab
      size={'small'}
      onClick={onClick}
      sx={{
        ...(success && {
          bgcolor: green[500],
          '&:hover': {
            bgcolor: green[700],
          },
        }),
      }}
      {...props}
    >
      {children}
    </Fab>
    {loading && (
      <CircularProgress
        size={48}
        color={success ? "success" : undefined}
        variant={progress ? "determinate" : undefined}
        value={ progress ?? undefined}
        sx={{
          position: 'absolute',
          top: -4,
          left: -4,
          zIndex: 1,
        }}
      />
    )}
  </Box>);
})



const Pad = styled('div')(({ theme }) => ({
  height: 66,
  [`${theme.breakpoints.up("xs")} and (orientation: landscape)`]: {
    height: 58
  },
  [theme.breakpoints.up("sm")]: {
    height: 74
  }
}));



export const SearchBar = ({defaultValue, onSearch, placeHolder='Search...', inputProps = { 'aria-label': 'search' }}) => {
  
  const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(3),
      width: 'auto',
    },
  }));

  const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }));
  
  const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
      padding: theme.spacing(1, 1, 1, 0),
      // vertical padding + font size from searchIcon
      paddingLeft: `calc(1em + ${theme.spacing(4)})`,
      transition: theme.transitions.create('width'),
      width: '100%',
      [theme.breakpoints.up('md')]: {
        minWidth: '30ch',
        maxWidth: '40ch',
      },
    },
  }));

  return (          
    <Search>
      <SearchIconWrapper>
        <SearchIcon />
      </SearchIconWrapper>
      <StyledInputBase
        defaultValue={defaultValue}
        placeholder={placeHolder}
        inputProps={inputProps}
        onKeyDown={(e) => e.key === 'Enter' && onSearch(e.target.value)}
      />
    </Search>
  );
};

export function HeaderItem({label, children, mode = 'desktop', onClick, Component, renderDesktop, RenderMobile, ...props}){
  return <>
    <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
      {renderDesktop ? <renderDesktop/> : <Tooltip title={label}><span><Component {...props} onClick={onClick}>{children}</Component></span></Tooltip>}
    </Box>
    <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
      {RenderMobile  ? <RenderMobile /> : <MenuItem onClick={onClick}><ListItemIcon>{children}</ListItemIcon><ListItemText>{label}</ListItemText></MenuItem>}
    </Box>
  </>;
}

export default function Header({drawerContent, mobileMenuContent, children, showUpButton = false, showBottomLinearProgress = false, bottomLinearProgressProps, ...props}){

  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);
  const mobileMenuId = 'primary-search-account-menu-mobile';

  const MobileMenu = () =>  
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={Boolean(mobileMoreAnchorEl)}
      onClose={() => setMobileMoreAnchorEl(null)}
    >
      {mobileMenuContent}
    </Menu>
  ;

  const MenuButton = ({size= "large", color= "inherit", ariaLabel= "open drawer", children, ...otherProps }) => 
    <IconButton size={size} color={color} aria-label={ariaLabel} onClick={(event) => {setMobileMoreAnchorEl(event.currentTarget)}} {...otherProps}>
      {children}
    </IconButton>;

  return (<Box sx={{ flexGrow: 1 }}>
    <AppBar id="app-bar" position="fixed" className="not-scrolled">
      <Toolbar>
        {drawerContent && <MenuButton edge="start" sx={{ mr: 2 }}><MenuIcon /></MenuButton>}
        {children}
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
          {mobileMenuContent}
        </Box>
        
        {mobileMenuContent && 
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="show more"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={event => setMobileMoreAnchorEl(event.currentTarget)}
              color="inherit"
            >
              <MoreIcon />
            </IconButton>
          </Box>}
      </Toolbar>
      {bottomLinearProgressProps}
    </AppBar>
    {mobileMenuContent && <MobileMenu />}
    <Pad id="back-to-top-anchor" />
    {showUpButton && <ScrollTop />}
  </Box>);
};