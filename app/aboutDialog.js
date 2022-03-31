const { getCurrentWindow } = require('electron');

class AboutDialog {
  execute = () => {
    new DevExpress.ui.dxButton(document.getElementById('closeButton'), {
      text: 'Close',
      onClick: () => {
        getCurrentWindow().close();
      },
    });
  };
}

module.exports = AboutDialog;
