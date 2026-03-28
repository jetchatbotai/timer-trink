package com.timertrink.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
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

    private static final String PREFS = "pomodoro_prefs";
    private static final String UI_PREFS = "timer_trink_prefs";

    // ===============================
    // SHARED PREFS HELPERS
    // ===============================
    public static SharedPreferences getPomodoroPrefs(Context context) {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    public static void savePomodoroState(
            Context context,
            boolean enabled,
            String phase,
            int work,
            int brk,
            int cycle,
            long endAt
    ) {
        SharedPreferences prefs = getPomodoroPrefs(context);
        prefs.edit()
                .putBoolean("enabled", enabled)
                .putString("phase", phase)
                .putInt("work", work)
                .putInt("break", brk)
                .putInt("cycle", cycle)
                .putLong("endAt", endAt)
                .apply();
    }

    public static void clearPomodoroState(Context context) {
        SharedPreferences prefs = getPomodoroPrefs(context);
        prefs.edit().clear().apply();
    }

    // ===============================
    // INTERNAL SCHEDULER
    // ===============================
    public void scheduleAlarmInternal(
            Context context,
            long triggerAtMillis,
            String title,
            String message,
            String soundName
    ) {
        AlarmManager alarmManager =
                (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);

        if (alarmManager == null) {
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
        } catch (Exception ignored) {
        }
    }

    // ===============================
    // PLUGIN METHODS
    // ===============================
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

        try {
            scheduleAlarmInternal(
                    getContext(),
                    triggerAtMillisObj,
                    title,
                    message,
                    soundName
            );

            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Alarm kurulamadı: " + e.getMessage());
        }
    }

    @PluginMethod
    public void cancelAlarm(PluginCall call) {
        try {
            cancelEverything(getContext());

            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Alarm iptal edilemedi: " + e.getMessage());
        }
    }

    @PluginMethod
    public void savePomodoroState(PluginCall call) {
        try {
            boolean enabled = call.getBoolean("enabled", false);
            String phase = call.getString("phase", "work");
            Integer workObj = call.getInt("work", 25);
            Integer breakObj = call.getInt("break", 5);
            Integer cycleObj = call.getInt("cycle", 0);
            Long endAtObj = call.getLong("nextEnd");

            int work = workObj != null ? workObj : 25;
            int brk = breakObj != null ? breakObj : 5;
            int cycle = cycleObj != null ? cycleObj : 0;
            long endAt = endAtObj != null ? endAtObj : 0L;

            savePomodoroState(getContext(), enabled, phase, work, brk, cycle, endAt);

            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Pomodoro state kaydedilemedi: " + e.getMessage());
        }
    }

    @PluginMethod
    public void clearPomodoroState(PluginCall call) {
        try {
            clearPomodoroState(getContext());

            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Pomodoro state temizlenemedi: " + e.getMessage());
        }
    }

    @PluginMethod
    public void getPomodoroState(PluginCall call) {
        try {
            SharedPreferences prefs = getPomodoroPrefs(getContext());

            JSObject ret = new JSObject();
            ret.put("enabled", prefs.getBoolean("enabled", false));
            ret.put("phase", prefs.getString("phase", "work"));
            ret.put("work", prefs.getInt("work", 25));
            ret.put("break", prefs.getInt("break", 5));
            ret.put("cycle", prefs.getInt("cycle", 0));
            ret.put("endAt", prefs.getLong("endAt", 0L));

            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Pomodoro state okunamadı: " + e.getMessage());
        }
    }

    @PluginMethod
    public void consumeAlarmStoppedFromNotification(PluginCall call) {
        try {
            SharedPreferences prefs =
                    getContext().getSharedPreferences(UI_PREFS, Context.MODE_PRIVATE);

            boolean stopped = prefs.getBoolean("alarm_stopped_from_notification", false);

            if (stopped) {
                prefs.edit().putBoolean("alarm_stopped_from_notification", false).apply();
            }

            JSObject ret = new JSObject();
            ret.put("stopped", stopped);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Flag okunamadı: " + e.getMessage());
        }
    }

    // ===============================
    // STATIC CLEANUP
    // ===============================
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
