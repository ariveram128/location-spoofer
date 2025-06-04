#!/usr/bin/env python3
"""
Test script to verify Bluetooth connectivity with iOS devices
"""

import asyncio
import logging
import sys
import os

# Add parent directory to path to import the BluetoothConnector class
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Import correctly using Python module naming conventions
from src.services.bluetooth_connector import BluetoothConnector

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("bluetooth-test")

async def test_bluetooth_connection():
    """
    Test the Bluetooth discovery and connection functionality
    """
    try:
        print("Testing Bluetooth connectivity...")
        connector = BluetoothConnector()
        
        # Discover available Bluetooth devices
        print("\n1. Scanning for Bluetooth devices...")
        devices = await connector.discover_devices(timeout=10)
        
        if not devices:
            print("\n❌ No Bluetooth devices found nearby")
            return False
            
        print(f"\n✓ Found {len(devices)} device(s)")
        
        # List discovered devices
        print("\nAvailable devices:")
        for idx, (address, device) in enumerate(devices.items(), 1):
            print(f"{idx}. {device['name']} ({address}) - Signal: {device['rssi']} dBm")
        
        # Ask user to select a device to connect to
        if len(devices) > 1:
            try:
                selection = int(input("\nSelect a device by number (or press Enter for first): ").strip() or "1")
                if selection < 1 or selection > len(devices):
                    selection = 1
            except ValueError:
                selection = 1
        else:
            selection = 1
        
        selected_address = list(devices.keys())[selection - 1]
        selected_device = devices[selected_address]
        print(f"\n2. Attempting to connect to {selected_device['name']} ({selected_address})...")
        
        # Try to connect
        connected = await connector.connect(selected_address)
        
        if not connected:
            print("\n❌ Failed to connect to the selected device")
            return False
            
        print(f"\n✓ Connected successfully to {selected_device['name']}")
        
        # Test location sending
        print("\n3. Testing location sending capability...")
        # San Francisco coordinates
        test_lat, test_lng = 37.7749, -122.4194
        
        print(f"Sending test location: {test_lat}, {test_lng}")
        sent = await connector.send_location(test_lat, test_lng)
        
        if not sent:
            print("\n❌ Failed to send location data")
        else:
            print("\n✓ Location data sent successfully")
        
        # Disconnect
        print("\n4. Disconnecting...")
        await connector.disconnect()
        print("✓ Device disconnected")
        
        if sent:
            print("\n🎉 Bluetooth test completed successfully!")
            return True
        else:
            print("\n⚠️ Bluetooth connected but location services may not be available")
            return False
            
    except Exception as e:
        print(f"\n❌ Test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    # Run the test function
    result = asyncio.run(test_bluetooth_connection())
    sys.exit(0 if result else 1) 