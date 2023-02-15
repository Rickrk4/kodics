import * as React from 'react';
import { Pagination, Stack, Zoom, Box, Grid } from '@mui/material';
import FolderOffIcon from '@mui/icons-material/FolderOff';
import ReadableCard from './readableCard';

export default ({ readables, onReadableSelect, spacing=2, enableServerSidePagination = false, pageCount, currentPage, onPageChange, ...props }) =>
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={spacing}>
        {readables.length > 0 ? readables.map((readable, index) =>
          <Zoom in={true} style={{ transitionDelay: (50 * index) + 'ms', transitionDuration: 100 }} key={readable.id}>
            <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
              <ReadableCard
                id={readable.id}
                title={readable.title}
                image={readable.cover_url}
                readable={readable.children.length == 0}
                borderRadius={4}
                type={readable.ext == 'epub' ? 'book' : 'comic'}
                height={280}
                onPrimaryButtonClick={e => onReadableSelect(readable)}
                primaryButtonLabel={readable.children.length == 0 ? 'Read' : 'Open'}
              />
            </Grid>
          </Zoom>
        ) : <Stack sx={{top: 0, left: 0, right: 0, bottom: 0, height: '100%', width: '100%', position: 'absolute'}} alignItems='center' justifyContent='center'>
              <FolderOffIcon color="disabled" sx={{fontSize: 140}}/>
            </Stack>
        }
      </Grid>
      {enableServerSidePagination && pageCount > 1 && (
        <Box display="flex" width='100%' alignItems="center" justifyContent="center" style={{padding: '4ch'}}>
          <Pagination count={pageCount} page={currentPage} onChange={onPageChange} />
        </Box>
      )}
    </Box>

