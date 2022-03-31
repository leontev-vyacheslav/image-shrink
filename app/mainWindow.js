const { app, BrowserWindow } = require('electron');

const path = require('path');
const os = require('os');
const { ipcRenderer } = require('electron');

class MainWindow {
  aboutDialog = null;

  showAboutDialog = () => {
    if (this.aboutDialog === null) {
      this.aboutDialog = new DevExpress.ui.dxPopup(document.getElementById('aboutDialog'), {
        title: 'ImageShrink',
        width: 450,
        height: 300,
        showTitle: true,
        closeOnOutsideClick: true,
        visible: false,
        showCloseButton: true,

        onShowing: () => {
          new DevExpress.ui.dxButton(document.getElementById('aboutDialog_OkButton'), {
            text: 'OK',
            onClick: () => {
              this.aboutDialog.hide();
            },
          });
        },
      });
    }
    this.aboutDialog.show();
  };

  execute = () => {
    ipcRenderer.on('image:done', () => {
      DevExpress.ui.notify('The image was rendered successfully!', 'success', 5000);
    });

    let mainMenu, closeMenu, browseButton, resizeButton, uploadedFileTextEditor, outputFilePathTextEditor, qualitySlider;

    mainMenu = new DevExpress.ui.dxMenu(document.getElementById('mainMenu'), {
      items: [
        {
          icon: 'menu',
          items: [
            {
              text: 'About...',
              icon: 'image',
              beginGroup: true,
              onClick: () => {
                this.showAboutDialog();
              },
            },
            {
              text: 'Quit',
              icon: 'export',
              onClick: () => {
                app.quit();
              },
            },
          ],
        },
      ],
    });

    closeMenu = new DevExpress.ui.dxMenu(document.getElementById('closeMenu'), {
      items: [
        {
          icon: 'close',
          onClick: () => {
            app.quit();
          },
        },
      ],
    });

    browseButton = new DevExpress.ui.dxButton(document.getElementById('browseButton'), {
      text: 'BROWSE',
      onClick: () => {
        const fileInput = document.getElementById('fileInput');
        fileInput.onchange = (e) => {
          const fileName = e.target.files[0].path;
          uploadedFileTextEditor.option('value', fileName);
          resizeButton.option('disabled', false);
        };
        fileInput.click();
      },
    });

    resizeButton = new DevExpress.ui.dxButton(document.getElementById('resizeButton'), {
      text: 'RESIZE',
      type: 'danger',
      disabled: true,

      onClick: () => {
        const path = uploadedFileTextEditor.option('value'),
          quality = qualitySlider.option('value');

        ipcRenderer.send('image:minimize', {
          path,
          quality,
        });
      },
    });

    uploadedFileTextEditor = new DevExpress.ui.dxTextBox(document.getElementById('uploadedFileTextEditor'), {
      placeholder: 'Uploaded file name',
      readOnly: true,
      hoverStateEnabled: true,
    });

    outputFilePathTextEditor = new DevExpress.ui.dxTextBox(document.getElementById('outputFilePathTextEditor'), {
      placeholder: 'Output file path',
      readOnly: true,
      hoverStateEnabled: true,
      value: path.join(os.homedir(), 'image-shrink'),
    });

    qualitySlider = new DevExpress.ui.dxSlider(document.getElementById('qualitySlider'), {
      min: 10,
      max: 100,
      value: 30,
      tooltip: {
        enabled: true,
        format: function (value) {
          return value;
        },
        showMode: 'always',
        position: 'top',
      },
    });
  };
}
module.exports = MainWindow;
