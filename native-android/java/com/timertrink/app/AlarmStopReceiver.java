package com.timertrink.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class AlarmStopReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        try {
            AlarmBridgePlugin.cancelEverything(context);
        } catch (Exception ignored) {
        }

        try {
            AlarmBridgePlugin.setAlarmStoppedFromNotification(context, true);
        } catch (Exception ignored) {
        }

        try {
            boolean enabled = AlarmBridgePlugin.isPomodoroEnabled(context);
            boolean autoAdvance = AlarmBridgePlugin.getPomodoroAutoAdvance(context);

            if (!enabled || !autoAdvance) {
                return;
            }

            String currentPhase = AlarmBridgePlugin.getPomodoroPhase(context);
            int work = AlarmBridgePlugin.getPomodoroWork(context);
            int brk = AlarmBridgePlugin.getPomodoroBreak(context);
            int cycle = AlarmBridgePlugin.getPomodoroCycle(context);

            String nextPhase;
            int nextCycle = cycle;
            int nextMinutes;

            if ("work".equals(currentPhase)) {
                nextPhase = "break";
                nextMinutes = brk;
            } else {
                nextPhase = "work";
                nextCycle = cycle + 1;
                nextMinutes = work;
            }

            long newEndAt = System.currentTimeMillis() + (nextMinutes * 60L * 1000L);

            AlarmBridgePlugin.savePomodoroState(
                    context,
                    true,
                    nextPhase,
                    work,
                    brk,
                    nextCycle,
                    true,
                    newEndAt
            );

            String title = AlarmBridgePlugin.getLastTitle(context);
            String message = AlarmBridgePlugin.getLastMessage(context);
            String soundName = AlarmBridgePlugin.getLastSound(context);

            AlarmBridgePlugin.scheduleAlarmInternal(
                    context,
                    newEndAt,
                    title,
                    message,
                    soundName
            );

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
