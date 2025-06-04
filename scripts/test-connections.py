#!/usr/bin/env python3
"""
Test script for all connection types (USB, WiFi, Bluetooth)
"""

import asyncio
import logging
import sys
import os
import argparse
from enum import Enum

# Add parent directory to path to import our modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Import the connection manager
from src.services.connection_manager import ConnectionManager, ConnectionType

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("connection-test")

class TestType(Enum):
    """Test types"""
    ALL = "all"
    BLUETOOTH = "bluetooth"
    USB = "usb"
    WIFI = "wifi"

async def test_connections(test_type: TestType = TestType.ALL):
    """
    Test connections using the specified type
    
    Args:
        test_type: Type of connection to test
    """
    try:
        print(f"Testing {test_type.value} connections...")
        manager = ConnectionManager()
        
        # Convert test type to connection type
        connection_type = None
        if test_type == TestType.BLUETOOTH:
            connection_type = ConnectionType.BLUETOOTH
        elif test_type == TestType.USB:
            connection_type = ConnectionType.USB
        elif test_type == TestType.WIFI:
            connection_type = ConnectionType.WIFI
        
        # Scan for devices
        print("\n1. Scanning for devices...")
        devices = await manager.scan_devices(connection_type)
        
        if not devices:
            print("\n❌ No devices found")
            return False
            
        print(f"\n✓ Found {len(devices)} device(s)")
        
        # List discovered devices
        print("\nAvailable devices:")
        for idx, (device_id, info) in enumerate(devices.items(), 1):
            print(f"{idx}. {info.get('name', 'Unknown')} ({device_id}) - "
                  f"Type: {info.get('connection_type', 'Unknown')}")
        
        # Ask user to select a device if there are multiple
        if len(devices) > 1:
            try:
                selection = int(input("\nSelect a device by number (or press Enter for first): ").strip() or "1")
                if selection < 1 or selection > len(devices):
                    selection = 1
            except ValueError:
                selection = 1
        else:
            selection = 1
        
        selected_id = list(devices.keys())[selection - 1]
        selected_device = devices[selected_id]
        print(f"\n2. Connecting to {selected_device.get('name', 'Unknown')} ({selected_id})...")
        
        # Connect to the selected device
        connected = await manager.connect(selected_id)
        
        if not connected:
            print("\n❌ Failed to connect to the selected device")
            return False
            
        print("\n✓ Connected successfully!")
        
        # Test location setting
        print("\n3. Testing location setting...")
        # San Francisco coordinates
        test_lat, test_lng = 37.7749, -122.4194
        
        print(f"Setting location to {test_lat}, {test_lng} (San Francisco)")
        location_set = await manager.set_location(test_lat, test_lng)
        
        if not location_set:
            print("\n❌ Failed to set location")
        else:
            print("\n✓ Location set successfully!")
            
        # Wait a moment for location to take effect
        print("\nWaiting 5 seconds for location to take effect...")
        await asyncio.sleep(5)
        
        # Test another location
        print("\n4. Testing another location...")
        # New York coordinates
        test_lat, test_lng = 40.7128, -74.0060
        
        print(f"Setting location to {test_lat}, {test_lng} (New York)")
        location_set = await manager.set_location(test_lat, test_lng)
        
        if not location_set:
            print("\n❌ Failed to set second location")
        else:
            print("\n✓ Second location set successfully!")
        
        # Disconnect
        print("\n5. Disconnecting...")
        await manager.disconnect()
        print("✓ Device disconnected")
        
        if location_set:
            print("\n🎉 Connection test completed successfully!")
            return True
        else:
            print("\n⚠️ Connection established but location setting may have failed")
            return False
            
    except Exception as e:
        print(f"\n❌ Test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def parse_args():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(description="Test device connections")
    parser.add_argument(
        "--type",
        choices=["all", "bluetooth", "usb", "wifi"],
        default="all",
        help="Connection type to test"
    )
    return parser.parse_args()

if __name__ == "__main__":
    args = parse_args()
    test_type = TestType(args.type)
    result = asyncio.run(test_connections(test_type))
    sys.exit(0 if result else 1) 