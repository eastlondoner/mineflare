if(typeof process === 'undefined') {
    window.process = {
        env: {},
    } as any;
}

const apiBaseUrl = process.env.PUBLIC_BACKEND_URL ||`${window.location.protocol}//${window.location.host}`;
console.log("apiBaseUrl", apiBaseUrl, process.env);

export function apiHost() {
  const host = new URL(apiBaseUrl).host;
  console.log("apiHost", host);
  return host;
}

function backendUrl(path: string) {
  if(path.startsWith('/')) {
    return `${apiBaseUrl.replace(/\/$/, '')}${path}`;
  }
  const currentPathWithoutQuery = window.location.pathname.split('?')[0];
  const pathDirs = currentPathWithoutQuery.split('/');
  pathDirs.pop();  // we never want the 'filename'
  while(path.startsWith('..')) {
    pathDirs.shift();
    pathDirs.shift();
  }
  const newPath = pathDirs.join('/');
  return `${apiBaseUrl}${newPath}${path}`;
}


export function fetchApi(path: string, init?: Parameters<typeof fetch>[1]) {
    return fetch(backendUrl(path), init);
}
