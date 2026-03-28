package com.timertrink.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;

public class AlarmStopReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        try {
            // Mevcut alarm/sesi durdur
            AlarmBridgePlugin.cancelEverything(context);

            SharedPreferences prefs = AlarmBridgePlugin.getPomodoroPrefs(context);

            boolean enabled = prefs.getBoolean("enabled", false);
            if (!enabled) {
                return;
            }

            String phase = prefs.getString("phase", "work");
            int work = prefs.getInt("work", 25);
            int brk = prefs.getInt("break", 5);
            int cycle = prefs.getInt("cycle", 0);

            String nextPhase;
            int nextMinutes;

            if ("work".equals(phase)) {
                nextPhase = "break";
                nextMinutes = brk;
            } else {
                nextPhase = "work";
                nextMinutes = work;
                cycle++;
            }

            long nextEnd = System.currentTimeMillis() + (nextMinutes * 60L * 1000L);

            // Yeni pomodoro state kaydet
            AlarmBridgePlugin.savePomodoroState(
                    context,
                    true,
                    nextPhase,
                    work,
                    brk,
                    cycle,
                    nextEnd
            );

            // JS tarafı isterse bilsin diye flag bırak
            try {
                SharedPreferences uiPrefs =
                        context.getSharedPreferences("timer_trink_prefs", Context.MODE_PRIVATE);
                uiPrefs.edit().putBoolean("alarm_stopped_from_notification", true).apply();
            } catch (Exception ignored) {
            }

            // Yeni alarmı native tarafta zincirleme kur
            AlarmBridgePlugin plugin = new AlarmBridgePlugin();
            plugin.load();

            plugin.scheduleAlarmInternal(
                    context,
                    nextEnd,
                    "Süre doldu!",
                    "Alarm çalıyor",
                    "beep"
            );

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
