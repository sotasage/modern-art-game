"use client"

import { useEffect } from 'react';
import { cleanupLocalStorage } from '@/lib/storageCleanup';

const LocalStorageCleanup = () => {
    useEffect(() => {
        // アプリ起動時にクリーンアップを実行
        cleanupLocalStorage();
    }, []);
    
    return null;
}

export default LocalStorageCleanup