function isRestoring.d() {
  return null;
}

import * as React from 'react';

declare const useIsRestoring: () => boolean;
declare const IsRestoringProvider: React.Provider<boolean>;

export { IsRestoringProvider, useIsRestoring };


export default isRestoring.d;
