import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { Container, Stack, CircularProgress, Typography, Link } from '@mui/material';
import { FolderZip } from '@mui/icons-material';

import PrimarySearchAppBar from '../components/headerAppBar';
import ReadableGallery from '../components/readableGallery';
import Header, { SearchBar, HeaderItem, ButtonProgress } from '../components/header';
import { DarkModeToggleButton, DarkModeToggleMenuItem } from '../components/themeProxy';
import useScanService from '../libs/scanService';
import CheckIcon from '@mui/icons-material/Check';
import FolderIcon from '@mui/icons-material/Folder';


export default function App() {

    const [scan, newScan] = useScanService();

    const [searchParams, setSearchParams] = useSearchParams();
    let q = searchParams.get('query') ?? '';
    let p = Number(searchParams.get('page') ?? 1);
    let id = useParams().id ?? '';

    const [readables, setReadables] = useState(null);
    const [pageNum, setPageNum] = useState(0);

    const navigate = useNavigate();
    const handleReadableOpen = readable => navigate(
        `/${readable.children.length > 0 ? 'r' : (readable.ext == 'epub' ? 'b' : 'c')}/${readable.id}`
    );

    useEffect(() => {
        fetch(`/api/readables/${id}?page=${p}&query=${q}`)
            .then(response => response.json())
            .then(result => setReadables(result.data) || setPageNum(parseInt(result.meta.last_page)));   
        return () => { setReadables(null) || setPageNum(0) };
    }, [id, q, p]);

    const HeaderBar = () =>
        <Header mobileMenuContent={[<HeaderItem key={'ScanHeaderItem'}
            Component={ButtonProgress}
            variant="outlined"
            onClick={newScan}
            label={scan && scan.progressPercentage ? `Scan progress ${parseInt(Number(scan.progressPercentage))}%` : 'Start New Scan'}
            loading={Boolean(scan)}
            disabled={Boolean(scan) && scan.progressPercentage != 100}
            progress={scan && scan.progressPercentage}
            success={scan && scan.progressPercentage === 100}
        >{scan && scan.progressPercentage === 100 ? <CheckIcon/> : <FolderIcon />}</HeaderItem>,
        <HeaderItem key={'DarkModeHeaderItem'}
            Component={DarkModeToggleButton}
            RenderMobile={DarkModeToggleMenuItem}
            label={'Change Theme'}
            size="large"
        ></HeaderItem>
        ]}><Link href={'/'} underline={'none'} color="inherit">
                <Typography variant="h6" noWrap component="div" sx={{ display: { xs: 'none', sm: 'block' } }}>KODIX</Typography>
            </Link>
            <SearchBar defaultValue={q} onSearch={q => setSearchParams({ 'query': q, 'page': 1 })} />
        </Header>;


    return (<>
        <HeaderBar />
        {/** <PrimarySearchAppBar name="KODICS" searchValue={q} onSearch={q => setSearchParams({ 'query': q, 'page': 1 })} /> */}
        <Container maxWidth="xl" >
            {readables ?
                <ReadableGallery
                    readables={readables}
                    onReadableSelect={handleReadableOpen}
                    enableServerSidePagination={true}
                    pageCount={pageNum}
                    currentPage={p}
                    onPageChange={(event, p) => setSearchParams({ 'page': p, 'query': q })}
                />
                : <Stack sx={{ top: 0, left: 0, right: 0, bottom: 0, height: '100%', width: '100%', position: 'absolute' }} justifyContent='center' alignItems='center'><CircularProgress /></Stack>}
        </Container>
    </>);
}