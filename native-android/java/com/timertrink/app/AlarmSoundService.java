package com.timertrink.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.os.Build;
import android.os.IBinder;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

public class AlarmSoundService extends Service {

    public static final String CHANNEL_ID = "alarm_service_channel";
    public static final int NOTIFICATION_ID = 7001;

    private MediaPlayer mediaPlayer;

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        String title = "Süre doldu!";
        String message = "Alarm çalıyor";

        if (intent != null) {
            String incomingTitle = intent.getStringExtra("title");
            String incomingMessage = intent.getStringExtra("message");

            if (incomingTitle != null && !incomingTitle.isEmpty()) {
                title = incomingTitle;
            }

            if (incomingMessage != null && !incomingMessage.isEmpty()) {
                message = incomingMessage;
            }
        }

        Intent stopIntent = new Intent(this, AlarmStopReceiver.class);
        PendingIntent stopPendingIntent = PendingIntent.getBroadcast(
                this,
                9001,
                stopIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle(title)
                .setContentText(message)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setOngoing(true)
                .setAutoCancel(false)
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .addAction(0, "Kapat", stopPendingIntent)
                .build();

        startForeground(NOTIFICATION_ID, notification);
        startAlarmLoop();

        return START_STICKY;
    }

    private void startAlarmLoop() {
        stopAlarmLoop();

        mediaPlayer = MediaPlayer.create(this, R.raw.alarm);
        if (mediaPlayer == null) {
            return;
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            mediaPlayer.setAudioAttributes(
                    new AudioAttributes.Builder()
                            .setUsage(AudioAttributes.USAGE_ALARM)
                            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                            .build()
            );
        }

        mediaPlayer.setLooping(true);
        mediaPlayer.setVolume(1.0f, 1.0f);

        try {
            mediaPlayer.start();
        } catch (Exception ignored) {
        }
    }

    private void stopAlarmLoop() {
        try {
            if (mediaPlayer != null) {
                if (mediaPlayer.isPlaying()) {
                    mediaPlayer.stop();
                }
                mediaPlayer.release();
                mediaPlayer = null;
            }
        } catch (Exception ignored) {
        }
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager == null) {
                return;
            }

            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Alarm Service",
                    NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("Timer alarm service");
            channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);

            manager.createNotificationChannel(channel);
        }
    }

    @Override
    public void onDestroy() {
        stopAlarmLoop();
        stopForeground(true);
        super.onDestroy();
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
