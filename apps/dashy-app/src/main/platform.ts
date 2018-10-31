import { app } from "electron";
import * as path from "path";

export const getPath = directory => {
    return app.getPath(directory);
};

export const FILE_NAME = "recently-used-documents.json";
export const MAX_RECENTLY_USED_DOCUMENTS = 12;
export const RECENTS_PATH = path.join(getPath("userData"), FILE_NAME);
export const isOsx = process.platform === "darwin";
export const isWindows = process.platform === "win32";
export const isOsxOrWindows = isOsx || isWindows;
