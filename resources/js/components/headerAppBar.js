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
import { CircularProgress, Fab, Fade, LinearProgress, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import { green } from '@mui/material/colors';
import CheckIcon from '@mui/icons-material/Check';
import { useNavigate } from 'react-router-dom';
import useScrollTrigger from '@mui/material/useScrollTrigger';
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


const ButtonProgress = React.forwardRef(({ loading, success, onClick, children, progress = undefined, ...props }, ref) => {
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

const Pad = styled('div')(({ theme }) => ({
  height: 66,
  [`${theme.breakpoints.up("xs")} and (orientation: landscape)`]: {
    height: 58
  },
  [theme.breakpoints.up("sm")]: {
    height: 74
  }
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

const SearchBar = ({defaultValue, onSearch, placeHolder='Search...', inputProps = { 'aria-label': 'search' }}) =>           
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
</Search>;

export default function PrimarySearchAppBar({ name, searchValue, onSearch = () => { }, ...props }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };


  const [scanGoing, setScanGoing] = React.useState(false);
  const [scanSuccess, setScanSucces] = React.useState(false);
  const [scan, setScan] = React.useState(null);

  const handleNewScan = () => {
    fetch('/api/jobs/create')
      .then(res => res.json())
      .then(res => res.data)
      .then(res => setScan(res) || setIntervalScan(res.id));
  }

  let interval;
  const setIntervalScan = id => {
    interval = setInterval(() => {
      fetch('/api/jobs/' + id)
        .then(res => res.json())
        .then(res => res.data)
        .then(setScan)
        .catch(() => setScan(null) || setScanSucces(true) || clearInterval(interval))
    }, 1000);
  }

  React.useEffect(() => {
    fetch('/api/jobs/')
      .then(res => res.json())
      .then(res => res.data.length > 0 && setIntervalScan(res.data[0].id))
    return () => {setScan(null) || setScanSucces(false) || clearInterval(interval)};
  }, []);

  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
      <MenuItem onClick={handleMenuClose}>My account</MenuItem>
    </Menu>
  );

  const mobileMenuId = 'primary-search-account-menu-mobile';
  const renderMobileMenu = (
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
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem onClick={handleNewScan}>
        <IconButton size="large" aria-label="show 4 new mails" color="inherit">
          {scan !== null ? <CircularProgress /> : <FolderIcon />}
        </IconButton>
        <p>New Scan</p>
      </MenuItem>
      <MenuItem>
        <ListItemIcon><DarkModeToggleButton/></ListItemIcon>
        <ListItemText>{"Change color"}</ListItemText>
      </MenuItem>
    </Menu>
  );

  //const name = props.name;
  const navigate = useNavigate();
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar id="app-bar" position="fixed" className="not-scrolled">
        <Toolbar id="back-to-top-anchor">
          
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="open drawer"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ display: { xs: 'none', sm: 'block' } }}
            onClick={() => navigate('/')}
          >
            {name}
          </Typography>

          <SearchBar defaultValue={searchValue} onSearch={onSearch}/>
          
          {/**
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              defaultValue={searchValue}
              placeholder="Search…"
              inputProps={{ 'aria-label': 'search' }}
              onKeyDown={(e) => e.key === 'Enter' && onSearch(e.target.value)}
            />
          </Search>
          */}

          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Tooltip title={scan ? "Scan going" : "Lunch new scan"}>
              <div>
                <ButtonProgress
                  aria-label="show 4 new mails"
                  //color={"primary"}
                  loading={scan !== null}
                  onClick={handleNewScan}
                  success={scanSuccess}
                  disabled={scan !== null}
                  progress={scan && scan.progressPercentage}
                >
                  {scanSuccess ? <CheckIcon /> : <FolderIcon />}
                </ButtonProgress>
              </div>
            </Tooltip>
            <DarkModeToggleButton />
          </Box>


          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="show more"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MoreIcon />
            </IconButton>
          </Box>
        </Toolbar>
        {scan !== null && <LinearProgress color={scanSuccess ? "success" : undefined} variant={scan && scan.progressPercentage ? "determinate" : undefined} value={scan && scan.progressPercentage}/>}
      </AppBar>
      {renderMobileMenu}
      {renderMenu}
      <Pad />
      <ScrollTop />
    </Box>
  );
}
