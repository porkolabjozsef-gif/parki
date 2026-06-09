const { withAndroidManifest, withDangerousMod } = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

// Add NotificationListenerService to AndroidManifest
const withNotificationListenerManifest = (config) => {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    const app = manifest.manifest.application[0];

    if (!app.service) app.service = [];

    const serviceExists = app.service.some(
      (s) => s.$?.['android:name'] === '.ParkiNotificationService'
    );

    if (!serviceExists) {
      app.service.push({
        $: {
          'android:name': '.ParkiNotificationService',
          'android:exported': 'true',
          'android:label': 'Parki értesítésfigyelő',
          'android:permission': 'android.permission.BIND_NOTIFICATION_LISTENER_SERVICE',
        },
        'intent-filter': [
          {
            action: [
              {
                $: {
                  'android:name':
                    'android.service.notification.NotificationListenerService',
                },
              },
            ],
          },
        ],
      });
    }

    return config;
  });
};

// Copy native Kotlin files into the Android project
const withNotificationListenerKotlin = (config) => {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const packagePath = path.join(
        config.modRequest.platformProjectRoot,
        'app/src/main/java/com/porki/parki'
      );
      fs.mkdirSync(packagePath, { recursive: true });

      const serviceCode = `package com.porki.parki

import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification

class ParkiNotificationService : NotificationListenerService() {

    companion object {
        var watchedPackages: Set<String> = setOf(
            "hu.parkl.android",
            "com.easypark.android",
            "com.parkmobile.android",
            "com.flowbird.android",
            "hu.mol.move",
            "com.mypermit.android"
        )
        var onNotificationChanged: ((Map<String, Any>) -> Unit)? = null
    }

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        sbn ?: return
        if (sbn.packageName !in watchedPackages) return
        val extras = sbn.notification.extras
        val appName = getAppName(sbn.packageName)
        onNotificationChanged?.invoke(mapOf(
            "action" to "posted",
            "package" to sbn.packageName,
            "appName" to appName,
            "text" to (extras.getCharSequence("android.text")?.toString() ?: "")
        ))
    }

    override fun onNotificationRemoved(sbn: StatusBarNotification?) {
        sbn ?: return
        if (sbn.packageName !in watchedPackages) return
        onNotificationChanged?.invoke(mapOf(
            "action" to "removed",
            "package" to sbn.packageName
        ))
    }

    private fun getAppName(packageName: String): String {
        return try {
            val info = packageManager.getApplicationInfo(packageName, 0)
            packageManager.getApplicationLabel(info).toString()
        } catch (e: Exception) { packageName }
    }
}`;

      fs.writeFileSync(
        path.join(packagePath, 'ParkiNotificationService.kt'),
        serviceCode
      );

      return config;
    },
  ]);
};

module.exports = (config) => {
  config = withNotificationListenerManifest(config);
  config = withNotificationListenerKotlin(config);
  return config;
};
