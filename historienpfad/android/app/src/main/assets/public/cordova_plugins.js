
  cordova.define('cordova/plugin_list', function(require, exports, module) {
    module.exports = [
      {
        "id": "cordova-plugin-device.device",
        "file": "plugins/cordova-plugin-device/www/device.js",
        "pluginId": "cordova-plugin-device",
        "clobbers": [
          "device"
        ]
      },
      {
        "id": "cordova-plugin-geolocation.geolocation",
        "file": "plugins/cordova-plugin-geolocation/www/android/geolocation.js",
        "pluginId": "cordova-plugin-geolocation",
        "clobbers": [
          "navigator.geolocation"
        ]
      },
      {
        "id": "cordova-plugin-geolocation.PositionError",
        "file": "plugins/cordova-plugin-geolocation/www/PositionError.js",
        "pluginId": "cordova-plugin-geolocation"
      },
      {
        "id": "cordova-plugin-ionic-keyboard.keyboard",
        "file": "plugins/cordova-plugin-ionic-keyboard/www/android/keyboard.js",
        "pluginId": "cordova-plugin-ionic-keyboard",
        "clobbers": [
          "window.Keyboard"
        ]
      }
    ];
    module.exports.metadata =
    // TOP OF METADATA
    {
      "cordova-plugin-device": "2.0.2",
      "cordova-plugin-geolocation": "4.0.1",
      "cordova-plugin-ionic-keyboard": "2.0.5",
      "cordova-plugin-whitelist": "1.3.3"
    };
    // BOTTOM OF METADATA
    });
    