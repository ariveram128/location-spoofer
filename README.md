# Location Spoofer

A desktop application for controlling iPhone location spoofing via USB/WiFi connection without requiring jailbreak.

## Project Overview

Location Spoofer is an open-source desktop application that enables users to simulate different GPS locations on their iPhone without jailbreaking the device. This approach bypasses mobile app store restrictions by running control software on the desktop that communicates with the mobile device.

## Features

- Spoof GPS location on iPhone via USB or WiFi connection
- Interactive map interface for selecting locations
- Multiple movement simulation modes (walking, cycling, driving)
- Route planning with multiple waypoints
- GPX route import/export capability
- Location favorites management
- Real-time GPS restoration

## Technologies

- **Desktop**: Electron, Node.js
- **Communication**: libimobiledevice, pymobiledevice3
- **Maps**: Leaflet.js
- **iPhone Connection**: USB/WiFi protocols

## Installation

### Prerequisites

- Windows 11 (macOS/Linux support planned for future)
- Python 3.9+ with pip
- Node.js LTS version
- USB connection to iPhone
- iPhone with Developer Mode enabled
- iTunes (for iPhone drivers)

### Setup

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/location-spoofer.git
   cd location-spoofer
   ```

2. Install Python dependencies:
   ```
   python -m venv myvenv
   source myvenv/bin/activate  # On Windows: myvenv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Install Node.js dependencies:
   ```
   npm install
   ```

4. Run the application:
   ```
   npm start
   ```

## Usage

1. Connect your iPhone via USB cable
2. Launch the application
3. Verify connection status in the app
4. Select a location on the map or enter coordinates
5. Choose movement mode (teleport, walking, driving)
6. Click "Set Location" to begin location spoofing
7. Use "Reset to Real GPS" to restore actual location

## Development

### Project Structure

```
location-spoofer/
├── src/
│   ├── main/         # Electron main process
│   ├── renderer/     # UI components
│   ├── services/     # iPhone communication
│   └── utils/        # Helper functions
├── scripts/          # Utility scripts
├── docs/             # Documentation
└── resources/        # Application resources
```

### Testing iPhone Connection

Use the test script to verify proper connection to your iPhone:

```
python scripts/test-connection.py
```

### Building for Distribution

```
npm run build
```

## License

This project is open-source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request 