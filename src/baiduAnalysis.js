import { ipcRenderer } from 'electron';

const bdAnalysis = url => {
  // send msg to ipcMain to get script
  ipcRenderer.send('analysis-start');

  // exec script in ipcRenderer
  ipcRenderer.on('send-analysis-script', (event, arg) => {
    window._hmt = window._hmt || [];

    const scriptTag = document.createElement('script');

    scriptTag.type = "text/javascript";
    scriptTag.text = arg;

    // document.getElementsByTagName('head')[0].appendChild(scriptTag);
    document.body.appendChild(scriptTag);
    window._hmt.push(['_trackPageview', url]);
  });
};

export default bdAnalysis;
