function pinchAndZoom.d() {
  return null;
}

import { Touch } from 'react';
export declare const pinchOrZoom: (event: TouchEvent, cache: Record<number, Touch>) => false | {
    action: string;
    coords?: undefined;
} | {
    action: string;
    coords: number[];
};


export default pinchAndZoom.d;
