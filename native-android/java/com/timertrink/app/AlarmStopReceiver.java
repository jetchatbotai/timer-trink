package com.timertrink.app;

import android.app.AlarmManager;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

public class AlarmStopReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        try {
            AlarmManager alarmManager =
                    (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);

            Intent alarmIntent = new Intent(context, AlarmReceiver.class);
            alarmIntent.setAction("com.timertrink.app.ACTION_ALARM");

            PendingIntent alarmPendingIntent = PendingIntent.getBroadcast(
                    context,
                    8001,
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
    }
}
