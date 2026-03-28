package com.timertrink.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "AlarmBridge")
public class AlarmBridgePlugin extends Plugin {

    public static final int ALARM_REQUEST_CODE = 8001;
    public static final String ACTION_ALARM = "com.timertrink.app.ACTION_ALARM";
    public static final String ACTION_STOP_ALARM = "com.timertrink.app.ACTION_STOP_ALARM";

    // 🔥 BURASI HATA VEREN SATIRDI
    private static final String PREFS = "pomodoro_prefs";

    @PluginMethod
    public void scheduleAlarm(PluginCall call) {
        Long triggerAtMillisObj = call.getLong("triggerAtMillis");
        String title = call.getString("title", "Süre doldu!");
        String message = call.getString("message", "Alarm çalıyor");
        String soundName = call.getString("soundName", "beep");

        if (triggerAtMillisObj == null || triggerAtMillisObj <= 0) {
            call.reject("Geçersiz triggerAtMillis");
            return;
        }

        long triggerAtMillis = triggerAtMillisObj;
        Context context = getContext();

        AlarmManager alarmManager =
                (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);

        if (alarmManager == null) {
            call.reject("AlarmManager bulunamadı");
            return;
        }

        Intent intent = new Intent(context, AlarmReceiver.class);
        intent.setAction(ACTION_ALARM);
        intent.putExtra("title", title);
        intent.putExtra("message", message);
        intent.putExtra("soundName", soundName);

        PendingIntent pendingIntent = PendingIntent.getBroadcast(
                context,
                ALARM_REQUEST_CODE,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        try {
            alarmManager.cancel(pendingIntent);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(
                        AlarmManager.RTC_WAKEUP,
                        triggerAtMillis,
                        pendingIntent
                );
            } else {
                alarmManager.setExact(
                        AlarmManager.RTC_WAKEUP,
                        triggerAtMillis,
                        pendingIntent
                );
            }

            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);

        } catch (Exception e) {
            call.reject("Alarm kurulamadı: " + e.getMessage());
        }
    }

    @PluginMethod
    public void cancelAlarm(PluginCall call) {
        Context context = getContext();
        cancelEverything(context);

        JSObject ret = new JSObject();
        ret.put("success", true);
        call.resolve(ret);
    }

    public static void cancelEverything(Context context) {
        try {
            AlarmManager alarmManager =
                    (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);

            Intent intent = new Intent(context, AlarmReceiver.class);
            intent.setAction(ACTION_ALARM);

            PendingIntent pendingIntent = PendingIntent.getBroadcast(
                    context,
                    ALARM_REQUEST_CODE,
                    intent,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );

            if (alarmManager != null) {
                alarmManager.cancel(pendingIntent);
            }

            pendingIntent.cancel();

        } catch (Exception ignored) {
        }

        try {
            Intent stopIntent = new Intent(context, AlarmSoundService.class);
            context.stopService(stopIntent);
        } catch (Exception ignored) {
        }
    }
}
