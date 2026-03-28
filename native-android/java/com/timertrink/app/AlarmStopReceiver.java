package com.timertrink.app;

import android.app.AlarmManager;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;

public class AlarmStopReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        try {
            AlarmManager alarmManager =
                    (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);

            Intent alarmIntent = new Intent(context, AlarmReceiver.class);
            alarmIntent.setAction(AlarmBridgePlugin.ACTION_ALARM);

            PendingIntent alarmPendingIntent = PendingIntent.getBroadcast(
                    context,
                    AlarmBridgePlugin.ALARM_REQUEST_CODE,
                    alarmIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );

            if (alarmManager != null) {
                alarmManager.cancel(alarmPendingIntent);
            }

            alarmPendingIntent.cancel();
        } catch (Exception ignored) {
        }

        try {
            Intent stopIntent = new Intent(context, AlarmSoundService.class);
            context.stopService(stopIntent);
        } catch (Exception ignored) {
        }

        try {
            NotificationManager nm =
                    (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm != null) {
                nm.cancel(AlarmSoundService.NOTIFICATION_ID);
            }
        } catch (Exception ignored) {
        }

        try {
            SharedPreferences prefs =
                    context.getSharedPreferences("timer_trink_prefs", Context.MODE_PRIVATE);
            prefs.edit().putBoolean("alarm_stopped_from_notification", true).apply();
        } catch (Exception ignored) {
        }
    }
}
