const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let iPhoneConnected = false;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        },
        icon: path.join(__dirname, '../../assets/icon.png'),
        title: 'Location Spoofer'
    });

    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    
    // Open DevTools in development
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// IPC handlers for iPhone communication
ipcMain.handle('connect-iphone', async () => {
    try {
        const result = await checkiPhoneConnection();
        iPhoneConnected = result.success;
        return result;
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('set-location', async (event, { latitude, longitude }) => {
    if (!iPhoneConnected) {
        return { success: false, error: 'iPhone not connected' };
    }

    try {
        const result = await setDeviceLocation(latitude, longitude);
        return result;
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('restore-real-gps', async () => {
    try {
        const result = await restoreRealGPS();
        return result;
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// iPhone communication functions
function checkiPhoneConnection() {
    return new Promise((resolve, reject) => {
        const python = spawn('python', ['-c', `
import sys
try:
    from pymobiledevice3.lockdown import create_using_usbmux
    from pymobiledevice3.services.simulate_location import SimulateLocationService
    
    lockdown = create_using_usbmux()
    device_info = lockdown.get_value()
    print(f"Connected: {device_info.get('DeviceName', 'Unknown Device')}")
    print(f"iOS Version: {device_info.get('ProductVersion', 'Unknown')}")
    sys.exit(0)
except Exception as e:
    print(f"Error: {str(e)}")
    sys.exit(1)
        `]);

        let output = '';
        let error = '';

        python.stdout.on('data', (data) => {
            output += data.toString();
        });

        python.stderr.on('data', (data) => {
            error += data.toString();
        });

        python.on('close', (code) => {
            if (code === 0) {
                const lines = output.trim().split('\n');
                resolve({
                    success: true,
                    deviceName: lines[0]?.replace('Connected: ', '') || 'iPhone',
                    iosVersion: lines[1]?.replace('iOS Version: ', '') || 'Unknown'
                });
            } else {
                reject(new Error(error || 'Failed to connect to iPhone'));
            }
        });
    });
}

function setDeviceLocation(latitude, longitude) {
    return new Promise((resolve, reject) => {
        const python = spawn('python', ['-c', `
import sys
try:
    from pymobiledevice3.lockdown import create_using_usbmux
    from pymobiledevice3.services.simulate_location import SimulateLocationService
    
    lockdown = create_using_usbmux()
    service = SimulateLocationService(lockdown)
    service.set(${latitude}, ${longitude})
    print("Location set successfully")
    sys.exit(0)
except Exception as e:
    print(f"Error: {str(e)}")
    sys.exit(1)
        `]);

        let output = '';
        let error = '';

        python.stdout.on('data', (data) => {
            output += data.toString();
        });

        python.stderr.on('data', (data) => {
            error += data.toString();
        });

        python.on('close', (code) => {
            if (code === 0) {
                resolve({ success: true, message: 'Location updated successfully' });
            } else {
                reject(new Error(error || 'Failed to set location'));
            }
        });
    });
}

function restoreRealGPS() {
    return new Promise((resolve, reject) => {
        const python = spawn('python', ['-c', `
import sys
try:
    from pymobiledevice3.lockdown import create_using_usbmux
    from pymobiledevice3.services.simulate_location import SimulateLocationService
    
    lockdown = create_using_usbmux()
    service = SimulateLocationService(lockdown)
    service.clear()
    print("Real GPS restored")
    sys.exit(0)
except Exception as e:
    print(f"Error: {str(e)}")
    sys.exit(1)
        `]);

        let output = '';
        let error = '';

        python.stdout.on('data', (data) => {
            output += data.toString();
        });

        python.stderr.on('data', (data) => {
            error += data.toString();
        });

        python.on('close', (code) => {
            if (code === 0) {
                resolve({ success: true, message: 'Real GPS restored' });
            } else {
                reject(new Error(error || 'Failed to restore GPS'));
            }
        });
    });
}