const { session, ipcMain, net } = require('electron');

const bdAnalysis = (app, bdID, referer) => {
  if (!app || !bdID) {
    throw new Error('app or bdID param is required!');
  }

  // bind ipcMain event
  bingMsg(bdID);

  // change request referer header
  app.on('ready', () => {
    changeReferer(referer);
  });
};

function changeReferer(referer)
{
  const filter = {
    urls: ['*://hm.baidu.com']
  }

  session.defaultSession.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
    details.requestHeaders['Referer'] = referer;
    callback({ requestHeaders:  details.requestHeaders });
  });
}

function bingMsg(bdID)
{
  ipcMain.on('analysis-start', (event, arg) => {
    const request = net.request({
      method: 'GET',
      protocol: 'https:',
      hostname: 'hm.baidu.com',
      port: 443,
      path: `/hm.js?${bdID}`,
    });

    let responseContent = '';

    request.on('response', response => {
      response.on('data', chunk => {
        responseContent += chunk;
      })
      response.on('end', () => {
        event.sender.send('send-analysis-script', responseContent)
      })
    });

    request.end();
  });
}

module.exports = bdAnalysis;
