package com.timertrink.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

public class AlarmReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        try {
            Intent serviceIntent = new Intent(context, AlarmSoundService.class);
            serviceIntent.setAction(AlarmBridgePlugin.ACTION_ALARM);

            if (intent != null) {
                serviceIntent.putExtra("title", intent.getStringExtra("title"));
                serviceIntent.putExtra("message", intent.getStringExtra("message"));
                serviceIntent.putExtra("soundName", intent.getStringExtra("soundName"));
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(serviceIntent);
            } else {
                context.startService(serviceIntent);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
