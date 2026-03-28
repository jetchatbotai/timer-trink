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

    private static final String PREFS = "timertrink_native_prefs";

    private static final String KEY_ALARM_STOPPED_FROM_NOTIFICATION = "alarm_stopped_from_notification";

    private static final String KEY_POMODORO_ENABLED = "pomodoro_enabled";
    private static final String KEY_POMODORO_PHASE = "pomodoro_phase";
    private static final String KEY_POMODORO_WORK = "pomodoro_work";
    private static final String KEY_POMODORO_BREAK = "pomodoro_break";
    private static final String KEY_POMODORO_CYCLE = "pomodoro_cycle";
    private static final String KEY_POMODORO_AUTO_ADVANCE = "pomodoro_auto_advance";
    private static final String KEY_POMODORO_END_AT = "pomodoro_end_at";

    private static final String KEY_LAST_TITLE = "last_title";
    private static final String KEY_LAST_MESSAGE = "last_message";
    private static final String KEY_LAST_SOUND = "last_sound";

    public static SharedPreferences getPrefs(Context context) {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    public static void setAlarmStoppedFromNotification(Context context, boolean value) {
        getPrefs(context)
                .edit()
                .putBoolean(KEY_ALARM_STOPPED_FROM_NOTIFICATION, value)
                .apply();
    }

    public static boolean consumeAlarmStoppedFromNotificationFlag(Context context) {
        SharedPreferences prefs = getPrefs(context);
        boolean stopped = prefs.getBoolean(KEY_ALARM_STOPPED_FROM_NOTIFICATION, false);
        if (stopped) {
            prefs.edit().putBoolean(KEY_ALARM_STOPPED_FROM_NOTIFICATION, false).apply();
        }
        return stopped;
    }

    public static void savePomodoroState(
            Context context,
            boolean enabled,
            String phase,
            int work,
            int brk,
            int cycle,
            boolean autoAdvance,
            long endAt
    ) {
        getPrefs(context)
                .edit()
                .putBoolean(KEY_POMODORO_ENABLED, enabled)
                .putString(KEY_POMODORO_PHASE, phase == null ? "work" : phase)
                .putInt(KEY_POMODORO_WORK, work)
                .putInt(KEY_POMODORO_BREAK, brk)
                .putInt(KEY_POMODORO_CYCLE, cycle)
                .putBoolean(KEY_POMODORO_AUTO_ADVANCE, autoAdvance)
                .putLong(KEY_POMODORO_END_AT, endAt)
                .apply();
    }

    public static void disablePomodoro(Context context) {
        getPrefs(context)
                .edit()
                .putBoolean(KEY_POMODORO_ENABLED, false)
                .putLong(KEY_POMODORO_END_AT, 0L)
                .apply();
    }

    public static boolean isPomodoroEnabled(Context context) {
        return getPrefs(context).getBoolean(KEY_POMODORO_ENABLED, false);
    }

    public static String getPomodoroPhase(Context context) {
        return getPrefs(context).getString(KEY_POMODORO_PHASE, "work");
    }

    public static int getPomodoroWork(Context context) {
        return getPrefs(context).getInt(KEY_POMODORO_WORK, 25);
    }

    public static int getPomodoroBreak(Context context) {
        return getPrefs(context).getInt(KEY_POMODORO_BREAK, 5);
    }

    public static int getPomodoroCycle(Context context) {
        return getPrefs(context).getInt(KEY_POMODORO_CYCLE, 0);
    }

    public static boolean getPomodoroAutoAdvance(Context context) {
        return getPrefs(context).getBoolean(KEY_POMODORO_AUTO_ADVANCE, true);
    }

    public static long getPomodoroEndAt(Context context) {
        return getPrefs(context).getLong(KEY_POMODORO_END_AT, 0L);
    }

    public static void saveLastAlarmMeta(Context context, String title, String message, String soundName) {
        getPrefs(context)
                .edit()
                .putString(KEY_LAST_TITLE, title == null ? "Süre doldu!" : title)
                .putString(KEY_LAST_MESSAGE, message == null ? "Alarm çalıyor" : message)
                .putString(KEY_LAST_SOUND, soundName == null ? "beep" : soundName)
                .apply();
    }

    public static String getLastTitle(Context context) {
        return getPrefs(context).getString(KEY_LAST_TITLE, "Süre doldu!");
    }

    public static String getLastMessage(Context context) {
        return getPrefs(context).getString(KEY_LAST_MESSAGE, "Alarm çalıyor");
    }

    public static String getLastSound(Context context) {
        return getPrefs(context).getString(KEY_LAST_SOUND, "beep");
    }

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

        Context context = getContext();
        long triggerAtMillis = triggerAtMillisObj;

        saveLastAlarmMeta(context, title, message, soundName);
        boolean ok = scheduleAlarmInternal(context, triggerAtMillis, title, message, soundName);

        if (!ok) {
            call.reject("Alarm kurulamadı");
            return;
        }

        JSObject ret = new JSObject();
        ret.put("success", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void cancelAlarm(PluginCall call) {
        Context context = getContext();
        cancelEverything(context);

        JSObject ret = new JSObject();
        ret.put("success", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void savePomodoroNativeState(PluginCall call) {
        Context context = getContext();

        boolean enabled = Boolean.TRUE.equals(call.getBoolean("enabled", false));
        String phase = call.getString("phase", "work");
        int work = call.getInt("work", 25);
        int brk = call.getInt("break", 5);
        int cycle = call.getInt("cycle", 0);
        boolean autoAdvance = Boolean.TRUE.equals(call.getBoolean("autoAdvance", true));
        Long endAtObj = call.getLong("endAt");
        long endAt = endAtObj == null ? 0L : endAtObj;

        savePomodoroState(context, enabled, phase, work, brk, cycle, autoAdvance, endAt);

        JSObject ret = new JSObject();
        ret.put("success", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void getPomodoroState(PluginCall call) {
        Context context = getContext();

        JSObject ret = new JSObject();
        ret.put("enabled", isPomodoroEnabled(context));
        ret.put("phase", getPomodoroPhase(context));
        ret.put("work", getPomodoroWork(context));
        ret.put("break", getPomodoroBreak(context));
        ret.put("cycle", getPomodoroCycle(context));
        ret.put("autoAdvance", getPomodoroAutoAdvance(context));
        ret.put("endAt", getPomodoroEndAt(context));

        call.resolve(ret);
    }

    @PluginMethod
    public void consumeAlarmStoppedFromNotification(PluginCall call) {
        Context context = getContext();
        boolean stopped = consumeAlarmStoppedFromNotificationFlag(context);

        JSObject ret = new JSObject();
        ret.put("stopped", stopped);
        call.resolve(ret);
    }

    public static boolean scheduleAlarmInternal(
            Context context,
            long triggerAtMillis,
            String title,
            String message,
            String soundName
    ) {
        AlarmManager alarmManager =
                (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);

        if (alarmManager == null) {
            return false;
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

            saveLastAlarmMeta(context, title, message, soundName);
            return true;
        } catch (Exception ignored) {
            return false;
        }
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
