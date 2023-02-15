import { Backdrop, Box, Button, ButtonGroup, CardMedia, CircularProgress, Divider, Drawer, Fab, FormControl, IconButton, Input, InputLabel, List, ListItem, ListItemButton, ListItemIcon, ListItemText, MenuItem, Paper, Select, Skeleton, Stack, styled, Tab, Tabs, ToggleButton, ToggleButtonGroup, Typography, useMediaQuery, useTheme } from "@mui/material";
import React, { useEffect, useRef, useState } from "react"
import { ReactReader } from "react-reader"
import { useNavigate, useParams } from "react-router-dom";
import regeneratorRuntime from "regenerator-runtime";

import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TextDecreaseIcon from '@mui/icons-material/TextDecrease';
import TextIncreaseIcon from '@mui/icons-material/TextIncrease';

import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import FormatAlignJustifyIcon from '@mui/icons-material/FormatAlignJustify';
import FormatIndentIncreaseIcon from '@mui/icons-material/FormatIndentIncrease';
import FormatIndentDecreaseIcon from '@mui/icons-material/FormatIndentDecrease';
import ExpandIcon from '@mui/icons-material/Expand';
import CompressIcon from '@mui/icons-material/Compress';
import CloseIcon from '@mui/icons-material/Close';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';

import ListAltIcon from '@mui/icons-material/ListAlt';
import SettingsIcon from '@mui/icons-material/Settings';
import { maxWidth } from "@mui/system";

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <>{children}</>}
    </div>
  );
}


const Menu = ({width= 240, anchor,  children, onQuit, ...props}) => {
  const [open, setOpen] = useState(false);
  const onClose = () => setOpen(!open);
  const theme = useTheme();
  const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-start',
  }));


  
  return (<>
    {!open && <IconButton sx={{position: 'absolute', top: 6, right: 6, zIndex: (theme) => theme.zIndex.drawer}} onClick={onClose}><MenuIcon /></IconButton>}
    <Drawer 
      anchor={anchor}
      open={open}
      onClose={onClose}
      sx={{
        width: width,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: width,
        },
      }}
      {...props}
    >
      <DrawerHeader>
        <Stack direction="row" justifyContent={"space-between"} sx={{width: '100%'}}>
          <IconButton onClick={onClose} >
            {theme.direction === 'rtl' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
          {onQuit && <IconButton onClick={onQuit} ><CloseIcon /></IconButton>}
        </Stack>
      </DrawerHeader>
      <Divider />
      {children}
    </Drawer>
  </>);

}


const ToggleButtonRange = ({value, step, onChange, max, min, DecreaseIcon, IncreaseIcon, ...otherProps}) => 
  <ToggleButtonGroup onChange={onChange} {...otherProps}>
    <ToggleButton value={-step} disabled={value <= min}><DecreaseIcon /></ToggleButton>
    <ToggleButton value={0} sx={{width: '100%'}}>{value}</ToggleButton>
    <ToggleButton value={+step} disabled={value >= max}><IncreaseIcon /></ToggleButton>
  </ToggleButtonGroup>;

export default function EpubReader () {
    const uri = '/api/readables/' + useParams().id + ".epub"; //Aggiungere estensione fittizia, anche se non c'è nella route
    
    const viewerRef = useRef(null);
    const [renditionRef, setRenditionRef] = useState(null);

    const [location, setLocation] = useState(null);
    const locationChanged = epubcifi => {
      setLocation(epubcifi);
    }

    const navigate = useNavigate();
    const theme = useTheme();
    const [fontSize, setFontSize] = useState(Number(theme.typography.body1.fontSize.replace("rem",''))*16);
    useEffect(() => {
      renditionRef && renditionRef.themes.fontSize(`${fontSize}px`)
    }, [fontSize, renditionRef]);


    const [flow, setFlow] = useState('paginated');
    useEffect(() => {renditionRef && renditionRef.flow(flow)}, [flow]);

    const [epubStyle, setEpubStyle] = useState({
      "*": {
        color: theme.palette.text.primary,
        background: theme.palette.background.default,
        backgroundColor: theme.palette.background.default,
      },
      body: {
        'line-height': 1.2,
      },
      p: {
        color: theme.palette.text.primary,
        backgroundColor: null,
      },
      span: {
        color: theme.palette.text.primary,
        backgroundColor: null,
      }
    });
    useEffect(() => {
      renditionRef && (renditionRef.themes.register('custom', epubStyle) || renditionRef.themes.select('custom'));
    }, [epubStyle, renditionRef]);
    
    const [coverLoaded, setCoverLoaded] = useState(false);
    const [tab, setTab] = useState(0);
    const [toc, setToc] = useState(null);
    const desktopMode = useMediaQuery(theme.breakpoints.up('sm'));

  return (
    <div id="epub-reader-container" style={{ height: "100vh", backgroundColor: theme.palette.background.default}} >
      <ReactReader 
        url={uri} 
        ref={viewerRef}
        location={location}
        locationChanged={locationChanged}
        getRendition={(rendition) => {
          setRenditionRef(rendition);
          document.getElementById("epub-reader-container").firstChild.firstChild.style.backgroundColor = theme.palette.background.default;
        }}
        tocChanged={setToc}
      />
      <Backdrop open={!location} sx={{zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: theme.palette.background.default}}>
        <CircularProgress />
      </Backdrop>
      <Menu anchor={'right'} onQuit={() => navigate(-1)} width={desktopMode ? 240 : '100%'}>
        <CardMedia
          component="img"
          height={360}
          image={`/api/readables/${useParams().id}/cover`}
          sx={{display: coverLoaded ? 'block' : 'none'}}
          onLoad={() => setCoverLoaded(true)}
          alt="green iguana"
        />
        {!coverLoaded && <Skeleton variant="rectangular" width={254} height={360} />}  
        <Divider />

        <Tabs variant="fullWidth" value={tab} onChange={(e, value) => setTab(value)} aria-label="basic tabs example">
          <Tab label="Settings" id={0} />
          <Tab label="TOC"      id={1} />
        </Tabs>
        <TabPanel value={tab} index={0}>
          <List>
            <ListItem key="flow-select">
              <FormControl fullWidth>
                <Select
                  label="Flow"
                  value={flow}
                  onChange={e => setFlow(e.target.value)}
                  fullWidth>
                  <MenuItem value={'paginated'}>Paginated</MenuItem>
                  <MenuItem value={'scrolled'}>Continuous</MenuItem>
                </Select>
              </FormControl>
            </ListItem>
            <ListItem key="font-size">
              <FormControl variant="filled" fullWidth>
                <ToggleButtonRange max={72} min={6} step={2} value={fontSize} 
                  DecreaseIcon={TextDecreaseIcon}  IncreaseIcon={TextIncreaseIcon}
                  onChange={(e, value) => setFontSize(Number(fontSize) + Number(value))}
                />
              </FormControl>
            </ListItem>
            <ListItem key="font-family-select">
              <FormControl fullWidth>
                <Select
                  label="Font Family"
                  defaultValue={'Helvetica, sans-serif'}
                  onChange={e => setEpubStyle({...epubStyle, '*': {...epubStyle['*'], "font-family": e.target.value}})}
                  fullWidth>
                  <MenuItem value={'Helvetica, sans-serif'}><Typography style={{fontFamily: 'Helvetica, sans-serif'}}>Helvetica</Typography></MenuItem>
                  <MenuItem value={'"Times New Roman", Times, serif'}><Typography style={{fontFamily: '"Times New Roman", Times, serif'}}>Times New Roman</Typography></MenuItem>
                  <MenuItem value={'Arial, serif'}><Typography style={{fontFamily: 'Arial, serif'}}>Arial</Typography></MenuItem>
                </Select>
              </FormControl>
            </ListItem>


            <ListItem key="font-align-select">
              <ToggleButtonGroup fullWidth exclusive value={epubStyle.p['text-align'] ?? 'left'} onChange={(e, value) => setEpubStyle( {...epubStyle, 'p': {"text-align": value}})}>
                <ToggleButton value='left'><FormatAlignLeftIcon /></ToggleButton>
                <ToggleButton value='center'><FormatAlignCenterIcon /></ToggleButton>
                <ToggleButton value='right'><FormatAlignRightIcon /></ToggleButton>
                <ToggleButton value='justify'><FormatAlignJustifyIcon /></ToggleButton>
              </ToggleButtonGroup>
            </ListItem>
            <ListItem key="indentation">
              <FormControl fullWidth>
                <ToggleButtonRange min={0} max={8} step={1} DecreaseIcon={FormatIndentDecreaseIcon} IncreaseIcon={FormatIndentIncreaseIcon}
                  value={Number((epubStyle.body['text-indent'] ?? '0rem').replace('rem', ''))}
                  onChange={(e, value) => setEpubStyle( {...epubStyle, 'body': {...epubStyle.body, "text-indent": `${Number((epubStyle.body['text-indent'] ?? '0rem').replace('rem', '')) + Number(value)}rem`}})}
                />
              </FormControl>
            </ListItem>
            <ListItem key="line-height">
              <FormControl fullWidth>
                <ToggleButtonRange min={1} max={2} step={0.1} value={Number(epubStyle.body['line-height'])}
                  IncreaseIcon={ExpandIcon} DecreaseIcon={CompressIcon}
                  onChange={(e, value) => setEpubStyle( {...epubStyle, 'body': {...epubStyle.body, "line-height": Number(epubStyle.body['line-height']) + Number(value)}})}
                />
              </FormControl>
            </ListItem>
          </List>
        </TabPanel>
        <TabPanel value={tab} index={1}>
          <List dense>{toc && toc.map((t,i) => 
            <ListItem key={i}><Paper sx={{width: '100%', borderRadius: 4}}>
              <ListItemButton onClick={() => setLocation(t.href)} sx={{paddingTop: 2, paddingBottom: 2, borderRadius: 4}}>
                <ListItemIcon><BookmarkBorderIcon /></ListItemIcon>
                <ListItemText primary={t.label} />
              </ListItemButton>
            </Paper></ListItem>)}
          </List>
        </TabPanel>        
      </Menu>
    </div>
  )
}