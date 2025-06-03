#!/usr/bin/env python3
"""
Test script to verify iPhone connection and location setting capability
"""

import sys
import traceback

def test_connection():
    try:
        print("Testing iPhone connection...")
        
        from pymobiledevice3.lockdown import create_using_usbmux
        from pymobiledevice3.services.simulate_location import DtSimulateLocation
        
        # Test connection
        lockdown = create_using_usbmux()
        device_info = lockdown.get_value()
        
        print(f"✓ Connected to: {device_info.get('DeviceName', 'Unknown Device')}")
        print(f"✓ iOS Version: {device_info.get('ProductVersion', 'Unknown')}")
        print(f"✓ Device UDID: {device_info.get('UniqueDeviceID', 'Unknown')}")
        
        # Test location service
        service = DtSimulateLocation(lockdown)
        print("✓ Location service initialized")
        
        # Test setting a location (San Francisco)
        test_lat, test_lng = 37.7749, -122.4194
        print(f"Testing location set to: {test_lat}, {test_lng}")
        service.set(test_lat, test_lng)
        print("✓ Location set successfully")
        
        # Wait a moment then restore real GPS
        import time
        time.sleep(2)
        print("Restoring real GPS...")
        service.clear()
        print("✓ Real GPS restored")
        
        print("\n🎉 All tests passed! Your setup is working correctly.")
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed: {str(e)}")
        print("\nDetailed error:")
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_connection()
    sys.exit(0 if success else 1)