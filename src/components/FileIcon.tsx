import apk from '../assets/imgs/file-extensions/apk.svg';
import csv from '../assets/imgs/file-extensions/csv.svg';
import txt from '../assets/imgs/file-extensions/txt.svg';
import ppt from '../assets/imgs/file-extensions/ppt.svg';
import doc from '../assets/imgs/file-extensions/doc.svg';
import jpg from '../assets/imgs/file-extensions/jpg.svg';
import xls from '../assets/imgs/file-extensions/xls.svg';
import png from '../assets/imgs/file-extensions/png.svg';
import svg from '../assets/imgs/file-extensions/xls.svg';
import pdf from '../assets/imgs/file-extensions/pdf.svg';
import unknown from '../assets/imgs/file-extensions/unknown.svg';
import video from '../assets/imgs/file-extensions/video.svg';
import mp3 from '../assets/imgs/file-extensions/mp3.svg';
import { useMemo } from 'react';

const extensionMapping = {
    apk: apk,
    csv: csv,
    txt: txt,
    ppt: ppt,
    doc: doc,
    jpg: jpg,
    xls: xls,
    png: png,
    svg: svg,
    pdf: pdf,
    video: video,
    mp3: mp3,
    unknown: unknown
} as const


function FileIcon({ extension, style }: FileIconProps) {
    const url = useMemo(() => getFileExtensionImage(extension), [extension])
    return (
        <img src={url} style={{ width: '4rem', height: '4rem', ...style }} />
    )
}

export default FileIcon

type FileIconProps = {
    extension: string,
    style?: React.CSSProperties
}

function getFileExtensionImage(name: string) {
    if (!name) return extensionMapping.unknown;
    let extension: keyof typeof extensionMapping | null = null;
    for (const key of Object.keys(extensionMapping)) {
        if ((key as keyof typeof extensionMapping).includes(name) || name.includes(key as keyof typeof extensionMapping)) {
            extension = (key as keyof typeof extensionMapping);
            break;
        }
    }
    if (extension) {
        return extensionMapping[extension]
    }
    else return extensionMapping.unknown
}

