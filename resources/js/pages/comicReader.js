import { useEffect, useState } from "react";
import { Carousel } from "react-responsive-carousel";
import { useParams } from "react-router-dom";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import useWindowDimensions from "../libs/dimensions";
//import { View, Image, StyleSheet } from 'react-native-web';
import { AppBar, Container, Box, CircularProgress, Fab, Grid, LinearProgress, List, ListItem, ListItemButton, Pagination, Paper, Stack, Tab, Tabs, useTheme, Zoom, IconButton, Collapse, Slide, Typography, Divider } from "@mui/material";
import { LocalDining } from "@mui/icons-material";
//import Carousel from "nuka-carousel";
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PanoramaVerticalSelectIcon from '@mui/icons-material/PanoramaVerticalSelect';
import PanoramaHorizontalSelectIcon from '@mui/icons-material/PanoramaHorizontalSelect';
import CloseIcon from '@mui/icons-material/Close';
import {useNavigate} from 'react-router-dom';
import ViewSidebarIcon from '@mui/icons-material/ViewSidebar';

const VerticalReader = ({images, currentPage = 0, onClick = undefined, maxWidth='80%', ...props}) => 
  <Box onClick={() => onClick && onClick()} {...props}>
    <List>
      {images.map((image, i) => <ListItem key={i}> <div style={{margin: 'auto', maxWidth: maxWidth}}><ListItemButton autoFocus={i === currentPage} hidden/><img src={'/'+image} width="100%" loading="lazy" onFocusVisible={() => console.log('load ' + i)}/></div></ListItem>)}
    </List>
  </Box>;

const ImageContainer = ({src, Placeholder = CircularProgress, width= '100%', height= '100%', position= 'absolute'}) => {
  const [load, setLoad] = useState(false);
  const imageLoader = new Image();
  imageLoader.src = src;
  imageLoader.onload = () => { setLoad(true) };
  return <>{load ? <div style={{
      position: position,
      width: width,
      height: height,
     // backgroundImage: "url(/"+image+")",
      backgroundSize: 'contain',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundImage: `url(${src})`
    }}/> : <div style={{
      position: position,
      width:width,
      height: height}}
    > 
      <Stack sx={{ height: '100%' }} alignItems="center" justifyContent="center"><Placeholder /></Stack>
    </div>}
  </>;
}


export default function ComicReader() {
    const id = useParams().id;
    const uri = '/api/readables/' + id;
    const [readable, setReadable] = useState(null);

    const navigate = useNavigate();
    const theme = useTheme();
    const transitionDuration = {
      enter: theme.transitions.duration.enteringScreen,
      exit: theme.transitions.duration.leavingScreen,
    };

    const {width, height} = useWindowDimensions();
    const [currentPage, setCurrentPage] = useState(0);
    const [showHud, setShowHud] = useState(false);
    const [axis, setAxis] = useState('horizontal');
    const [openThumbnail, setOpenThumbnail] = useState(false);

    useEffect(() => {
        let interval = setInterval(() => {
            fetch(uri)
            .then(response => response.json())
            .then(response => response.data)
            .then(response => setReadable(response) || (response.status == "finished" && clearInterval(interval)))
            .catch(() => console.log("Unable to fetch comic " + id))
        }, 1000)
        return () => clearInterval(interval) && setReadable(null);
    }, []);
    
    useEffect(() => {readable && (document.title = readable.title)}, [readable]);


    return (<>
            <Stack style={{position: 'fixed', zIndex: 3, direction: 'row', left: 0, right: 0, top: 0 }} direction="row" justifyContent="space-between" alignItems="center" padding={4}>
              <Zoom in={showHud} timeout={transitionDuration} unmountOnExit>
                <Fab aria-label="close" onClick={(event) => setOpenThumbnail(!openThumbnail)}>
                  <ViewSidebarIcon/>
                </Fab>
              </Zoom>
              <Zoom in={showHud} timeout={transitionDuration} unmountOnExit>
                <Fab aria-label="close" onClick={(event) => {navigate(-1); event.stopPropagation();}}>
                  <CloseIcon/>
                </Fab>
              </Zoom>
              <Zoom in={showHud} timeout={transitionDuration} unmountOnExit>
                <Fab color="secondary" aria-label="add" onClick={(event) => {setAxis(axis == 'vertical' ? 'horizontal' : 'vertical');  event.stopPropagation();}}>
                  <PanoramaVerticalSelectIcon style={{transform: axis === "horizontal" ? 'rotate(90deg)' : '', transition: `transform ${transitionDuration.enter}ms ease`}}/>
                </Fab>
              </Zoom>
            </Stack>

            {readable && (<Slide direction={axis == 'horizontal' ? "up" : "right"} in={showHud && openThumbnail} >
              <Paper style={{overflow: 'auto', margin: 16, borderRadius: 8, backgroundColor: theme.palette.background.paper, position: 'fixed', zIndex: theme.zIndex.drawer +2, left: 0, right: axis == 'vertical' ? undefined : 0, bottom: 0, top: axis == 'horizontal' ? undefined:0}}>
                <Stack>
                  <Box><IconButton onClick={() => setOpenThumbnail(false)} sx={{float: 'right'}}><CloseIcon /></IconButton></Box>
                  <Divider variant="middle"  />
                  <Tabs value={currentPage} onChange={(e, value) => setCurrentPage(value)} variant="scrollable" scrollButtons="auto" orientation={axis}>
                    {readable.images.map((image, i) => <Tab key={i} icon={<img src={'/'+image} width={96} loading="lazy"/>} label={i+1} />)}
                  </Tabs>
                </Stack>
              </Paper>
            </Slide>)}
            <Stack>
              {readable  ?  ( 
                axis === "horizontal" ? 
                  <Carousel 
                    selectedItem={currentPage}
                    onChange={(i, item) => setCurrentPage(i)}
                    autoFocus={true} 
                    useKeyboardArrows={true} 
                    emulateTouch={true} 
                    swipable={true} 
                    showStatus={false} 
                    showIndicators={false} 
                    showThumbs={false}
                    showArrows={showHud}
                    onClickItem={() => setShowHud(!showHud)}
                    renderArrowPrev={(onClickHandler, hasPrev, label) => 
                      <Stack sx={{height: '100%', position: 'absolute', zIndex: 2, left: 0, top: 0}}  justifyContent="center" padding={4}>
                        <Zoom in={showHud} timeout={transitionDuration} unmountOnExit>
                          <Fab disabled = {!hasPrev} color="primary" aria-label="add" onClick={onClickHandler}>
                            <ArrowBackIcon/>
                          </Fab>
                        </Zoom> 
                      </Stack>}
                    renderArrowNext={(onClickHandler, hasPrev, label) => 
                      <Stack sx={{height: '100%', position: 'absolute', zIndex: 2, right: 0, top: 0}}  justifyContent="center" padding={4}>
                        <Zoom in={showHud} timeout={transitionDuration} unmountOnExit>
                          <Fab disabled={!hasPrev} color="primary" aria-label="add" onClick={onClickHandler}>
                            <ArrowForwardIcon/>
                          </Fab>
                        </Zoom> 
                      </Stack>}
                    
                    //dynamicHeight={true} 
                    //centerMode={true} 
                    //centerSlidePercentage={getImageProps()}
                  >
                    {readable.images.map((image, i) => <ImageContainer key={i} src={`/${image}`} position="relative" width={width} height={height}/>)}
                  </Carousel> : 
                  <Container><VerticalReader currentPage={currentPage} images={readable.images} onClick={() => setShowHud(!showHud)}/></Container>) : (<LinearProgress />)}
             
            </Stack>            

          </>
          
        );
}
