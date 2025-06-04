"""
Services package for Location Spoofer
Provides device connectivity and location spoofing functionality
"""

# Import main components for easier access
from .connection_manager import ConnectionManager, ConnectionType
from .bluetooth_connector import BluetoothConnector

__all__ = [
    'ConnectionManager',
    'ConnectionType',
    'BluetoothConnector'
] 