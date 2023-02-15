import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import ThemeProxy from './components/themeProxy';
import App from './pages/app';
import ComicReader from './pages/comicReader';
import EpubReader from './pages/epubReader';



const root = createRoot(document.getElementById('app'));
root.render(
    <ThemeProxy >
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App />} key={document.location.href}> 
                    <Route path="r" element={<App api="readables" />} key={document.location.href}>
                        <Route path=":id" element={<App />} key={document.location.href} />
                    </Route>
                </Route>   
                <Route path="c/:id" element={<ComicReader />} />
                <Route path="b/:id" element={<EpubReader  />} />
                <Route path="reader/:id" element={<ComicReader />} />
                <Route path="b/reader/:id" element={<EpubReader />} />
            </Routes>
        </BrowserRouter>
    </ThemeProxy>);
