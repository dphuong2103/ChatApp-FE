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
import * as data from '../mock/fileExtensions.json';

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
    unknown: unknown
} as const


export function getFileExtensionImage(name: string) {
    if (!name) return extensionMapping.unknown;
    let extension: keyof typeof extensionMapping | null = null;
    for (var key of Object.keys(extensionMapping)) {
        if (key.includes(name) || name.includes(key)) {
            extension = (key as keyof typeof extensionMapping);
            break;
        }
    }
    if (extension) {
        return extensionMapping[extension]
    }
    else return extensionMapping.unknown
}

export function fromMimeToType(mime?: string) {
    const value = Object.keys(data).find(key => data[key as keyof typeof data] == mime);
    if (!value) return 'unknown';
    return value;
}

export function getExtensionFromName(name: string) {
    return name.split('.').pop() ?? ''
}

export function isImageFromFileName(name: string) {
    return imagesExtension.includes(getExtensionFromName(name));
}

export function isVideoFromFileName(name: string) {
    const extension = name.split('.').pop();
    return extension && extension.toLowerCase() === 'mp4';
}

const imagesExtension = ['jpg', 'png', 'svg']