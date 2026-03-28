package com.timertrink.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;

public class AlarmStopReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {

        try {
            // 🔥 Alarmı durdur
            AlarmBridgePlugin.cancelEverything(context);

            SharedPreferences prefs =
                    AlarmBridgePlugin.getPomodoroPrefs(context);

            boolean enabled = prefs.getBoolean("enabled", false);

            if (!enabled) return;

            String phase = prefs.getString("phase", "work");
            int work = prefs.getInt("work", 25);
            int brk = prefs.getInt("break", 5);
            int cycle = prefs.getInt("cycle", 0);

            String nextPhase;
            int nextMinutes;

            if (phase.equals("work")) {
                nextPhase = "break";
                nextMinutes = brk;
            } else {
                nextPhase = "work";
                nextMinutes = work;
                cycle++;
            }

            long nextEnd = System.currentTimeMillis() + (nextMinutes * 60 * 1000);

            // 🔥 STATE SAVE
            AlarmBridgePlugin.savePomodoroState(
                    context,
                    true,
                    nextPhase,
                    work,
                    brk,
                    cycle,
                    nextEnd
            );

            // 🔥 YENİ ALARM KUR
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
