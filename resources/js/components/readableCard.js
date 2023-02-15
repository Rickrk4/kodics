import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';

import Typography from '@mui/material/Typography';
import { Skeleton, useMediaQuery, useTheme, Stack } from '@mui/material';


const CardSkeleton = ({desktopMode = true}) => 
    <Stack direction={desktopMode ? 'column': 'row'}>
      <Skeleton variant="rectangular" width={desktopMode ? 245 : 151} height={desktopMode ? 280 : 151} />
      <Stack padding={2}>
        <Skeleton variant="text" height={50} width={200}/>
        <Skeleton variant="text" height={50} width={200}/>
      </Stack>
    </Stack>;

export default function ReadableCard({
  title, image, readable,
  height = 280,
  mobileHeight = 151,
  desktopWidth = 245,
  mobileWidth = '100%',
  showActions = true, 
  enableImageTrigger = true, 
  onPrimaryButtonClick = () => {}, 
  onSecondaryButtonClick=() => {}, 
  primaryButtonLabel="Read", 
  secondaryButtonLabel="Detail", 
  borderRadius, 
  enableMobileMode = true,
  ...props }) {
    
    
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const theme = useTheme();
  const desktopMode = useMediaQuery(theme.breakpoints.up('sm'));

  return (
    <Card sx={{ width: desktopMode ? desktopWidth : mobileWidth, margin: 'auto', borderRadius: borderRadius }}>
      {!imageLoaded && <CardSkeleton desktopMode={desktopMode}/>}
      <div style={{display: imageLoaded ? 'flex' : 'none', flexDirection: desktopMode ? 'column':'row'}}>
          <Button onClick={e => enableImageTrigger && onPrimaryButtonClick(e)} style={{padding: 0}}>
            <CardMedia
              component="img"
              height={desktopMode ? height : mobileHeight}
              image={image}
              sx={{width: desktopMode ? desktopWidth : mobileHeight, borderRadius: borderRadius}}
              alt="green iguana"
              onLoad={() => {setImageLoaded(true)}}
            />
          </Button>
        <Stack sx={{width: '100%'}}>
          {title && (<CardContent>
            <Typography gutterBottom variant="subtitle1" component="div" sx={{height: 50, overflow: 'hidden'}}>
              {title}
            </Typography>
          </CardContent>)}
          
          {showActions && (<CardActions>
            <Stack sx={{width: '100%'}} direction={{sm: "row" , xs:"row-reverse"}} justifyContent={"space-between"}>
              <Button size={desktopMode ? "medium" : "large"} variant="contained" onClick={onPrimaryButtonClick} >{primaryButtonLabel}</Button>
              <Button size={desktopMode ? "medium" : "large"} onClick={onSecondaryButtonClick}>{secondaryButtonLabel}</Button>
            </Stack>
          </CardActions>)}
        </Stack>
      </div>
    </Card>
  );
}
